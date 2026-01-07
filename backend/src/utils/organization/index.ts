import { Op } from 'sequelize';
import { UsersModel } from '../../models/users.model';
import { sendNotificationAlert } from '../send-email';
import { UserTypes } from '../../data/data-types';

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
