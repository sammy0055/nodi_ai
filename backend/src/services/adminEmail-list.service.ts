import { randomInt } from 'crypto';
import { Op } from 'sequelize';
import { sendVerificationEmail } from '../utils/send-email'; // assume you have an email utility
import { AdminEmailListModel } from '../models/admin-notification-emails.model';

export class AdminEmailListService {
  static async addEmail(email: string) {
    // generate a 6-digit code
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    // save email + code + expiry
    const payload = {
      email,
      status: 'pending',
      verificationCode: code,
      codeExpiresAt: expiresAt,
    };

    const record = await AdminEmailListModel.create({ ...payload, status: 'pending' });
    // send verification code to email
    await sendVerificationEmail(email, code);
    return record;
  }

  static async verifyEmail(emailId: string, code: string) {
    if (!emailId || !code) throw new Error('Admin: incorrect emailId or code');
    const record = await AdminEmailListModel.findOne({
      where: {
        id: emailId,
        verificationCode: code,
        codeExpiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!record) {
      throw new Error('Invalid or expired verification code');
    }

    // update status to verified and clear code
    record.status = 'verified';
    record.verificationCode = null;
    record.codeExpiresAt = null;
    await record.save();

    return record;
  }

  static async getEmails() {
    return await AdminEmailListModel.findAll();
  }
  static async deleteEmail(emailId: string) {
    if (!emailId) throw new Error('Admin: emailId most be provided for this action');
    await AdminEmailListModel.destroy({ where: { id: emailId } });
  }
}
