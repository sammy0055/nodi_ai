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
  schedule: ServiceSchedule[],
  timeZone: string // e.g. "Africa/Lagos"
): ServiceStatusResponse {

  if (!Array.isArray(schedule)) {
    return {
      isOpen: false,
      currentDay: '',
      currentTime: '',
      message: "Invalid schedule format."
    };
  }

  const now = new Date();

  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);

  const currentDay = parts.find(p => p.type === 'weekday')?.value.toLowerCase()!;
  const hour = parts.find(p => p.type === 'hour')?.value!;
  const minute = parts.find(p => p.type === 'minute')?.value!;
  const currentTime = `${hour}:${minute}`;

  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMinutes = timeToMinutes(currentTime);

  const todaySchedule = schedule.find(
    s => s.dayOfWeek?.toLowerCase() === currentDay
  );

  let isOpen = false;

  // ✅ Check if currently open
  if (todaySchedule?.hours?.length) {
    for (const slot of todaySchedule.hours) {
      const openMin = timeToMinutes(slot.open);
      const closeMin = timeToMinutes(slot.close);

      if (closeMin <= openMin) {
        // Overnight schedule (e.g. 22:00–02:00)
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
    // 🔍 Check later today
    if (todaySchedule?.hours?.length) {
      const futureSlotsToday = todaySchedule.hours
        .filter(slot => {
          const openMin = timeToMinutes(slot.open);
          const closeMin = timeToMinutes(slot.close);

          if (closeMin <= openMin) return false; // skip overnight
          return openMin > nowMinutes;
        })
        .sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));

      if (futureSlotsToday.length > 0) {
        nextOpen = { day: currentDay, time: futureSlotsToday[0].open };
      }
    }

    // 🔍 Check next days
    if (!nextOpen) {
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date(now);

        // Move date safely in user timezone logic
        futureDate.setUTCDate(now.getUTCDate() + i);

        const futureFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone,
          weekday: 'long'
        });

        const futureDay = futureFormatter.format(futureDate).toLowerCase();

        const daySchedule = schedule.find(
          s => s.dayOfWeek?.toLowerCase() === futureDay
        );

        if (daySchedule?.hours?.length) {
          nextOpen = {
            day: futureDay,
            time: daySchedule.hours[0].open
          };
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
        ? `Service is closed. Next open: ${capitalize(nextOpen.day)} at ${nextOpen.time}.`
        : `Service is temporarily closed.`
  };
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
