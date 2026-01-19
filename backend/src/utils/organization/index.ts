import { Op } from 'sequelize';
import { UsersModel } from '../../models/users.model';
import { sendNotificationAlert } from '../send-email';
import { UserTypes } from '../../data/data-types';
import { ServiceSchedule } from '../../types/organization';

export const sendEmailNotificationToOrganizationAdmins = async (
  orgId: string,
  data: { title: string; message: string; type: 'info' | 'warning' | 'alert' | 'success' }
) => {
  const users = await UsersModel.findAll({
    where: {
      organizationId: orgId,
      status: {
        [Op.in]: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
    },
  });

  if (users.length === 0) return;

  await Promise.all(
    users
      .filter((u) => u.email)
      .map((u) =>
        sendNotificationAlert(u.email!.trim(), {
          title: data.title,
          message: data.message,
          type: data.type,
        })
      )
  );
};

interface ServiceStatusResponse {
  isOpen: boolean;
  currentDay: string; // e.g., "monday"
  currentTime: string; // ISO string or "HH:mm"
  nextOpen?: {
    day: string;
    time: string; // e.g., "09:00"
  };
  message: string;
}

export function checkBusinessServiceSchedule(
  schedule: ServiceSchedule[]
): ServiceStatusResponse {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

  if (!Array.isArray(schedule)) {
    return {
      isOpen: false,
      currentDay,
      currentTime,
      message: "Invalid schedule format."
    };
  }

  const todaySchedule = schedule.find(
    (s) => s.dayOfWeek?.toLowerCase() === currentDay
  );

  // Helper: parse time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Check if currently open
  let isOpen = false;
  if (todaySchedule?.hours) {
    for (const slot of todaySchedule.hours) {
      const openMin = timeToMinutes(slot.open);
      const closeMin = timeToMinutes(slot.close);

      if (closeMin <= openMin) {
        // Overnight: e.g., 22:00–02:00 → spans midnight
        if (nowMinutes >= openMin || nowMinutes < closeMin) {
          isOpen = true;
          break;
        }
      } else {
        if (nowMinutes >= openMin && nowMinutes < closeMin) {
          isOpen = true;
          break;
        }
      }
    }
  }

  let nextOpen: { day: string; time: string } | undefined;

  if (!isOpen) {
    // 🔍 First: check if service opens LATER TODAY
    if (todaySchedule?.hours?.length) {
      // Find the next opening slot TODAY that starts after current time
      const futureSlotsToday = todaySchedule.hours
        .filter(slot => {
          const openMin = timeToMinutes(slot.open);
          // For overnight slots, "open" is yesterday — skip for same-day future
          const closeMin = timeToMinutes(slot.close);
          if (closeMin <= openMin) return false; // overnight → not a same-day future open
          return openMin > nowMinutes;
        })
        .sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));

      if (futureSlotsToday.length > 0) {
        nextOpen = { day: currentDay, time: futureSlotsToday[0].open };
      }
    }

    // 🔍 If not opening later today, check upcoming days (including tomorrow onward)
    if (!nextOpen) {
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const checkDay = dayNames[checkDate.getDay()];

        const daySchedule = schedule.find(s => s.dayOfWeek?.toLowerCase() === checkDay);
        if (daySchedule?.hours?.length) {
          // Use the first opening time of that day
          const firstSlot = daySchedule.hours[0];
          nextOpen = { day: checkDay, time: firstSlot.open };
          break;
        }
      }
    }
  }

  return {
    isOpen,
    currentDay,
    currentTime,
    nextOpen,
    message: isOpen
      ? `Service is currently open.`
      : nextOpen
        ? `Service is closed. Next open: ${nextOpen.day.charAt(0).toUpperCase() + nextOpen.day.slice(1)} at ${nextOpen.time}.`
        : `Service is temporarity closed.`
  };
}
