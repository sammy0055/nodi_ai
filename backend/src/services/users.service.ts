import { appConfig } from '../config';
import { UserTypes } from '../data/data-types';
import { UsersModel } from '../models/users.model';
import { ISignUp, User } from '../types/users';
import { generateTokens, verifyToken } from '../utils/jwt';

import crypto from 'crypto';

import { OAuth2Client } from 'google-auth-library';
import { sendPasswordResetEmail, sendUserInviteMail } from '../utils/send-email';
import { UserRoleModel } from '../models/role.model';
import { UserPermissionsModel } from '../models/permission.model';
import { OrganizationsModel } from '../models/organizations.model';
import { Op } from 'sequelize';

export class UserService {
  constructor() {}
  private static oauth2Client = new OAuth2Client(
    appConfig.googleAuth.GOOGLE_CLIENT_ID,
    appConfig.googleAuth.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );

  static async createUser(data: User, user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.id) throw new Error('user is not authenticated');
    if (data.roles?.length === 0) throw new Error('role is required');
    const roles = await UserRoleModel.findAll({ where: { id: data.roles?.map((r) => r.id) } });
    if (!roles) throw new Error('user role does not exist');
    const _user = await UsersModel.findByPk(user.id, {
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
          include: [
            {
              model: UserPermissionsModel,
              as: 'permissions',
            },
          ],
        },
      ],
    });

    const plainUser = _user?.get({ plain: true }) as any;
    if (!plainUser) throw new Error('user does not exist');

    const isSupperAdmin = plainUser?.roles.find((r: any) => r.name === UserTypes.SuperAdmin);
    if (!isSupperAdmin) throw new Error("you don't have permission to perform this action");

    const org = await OrganizationsModel.findByPk(user.organizationId!);
    if (!org) throw new Error('an organization does not exist for this user');

    // send invitation email
    await sendUserInviteMail(data.email, {
      orgName: org.name,
      userName: data.name,
      btnUrl: `${appConfig.frontendUrl}`,
    });

    const payload = {
      name: data.name,
      email: data.email,
      password: 'password',
    };

    const otherUser = await UsersModel.create({ ...payload, organizationId: user.organizationId });
    await otherUser.setRoles(roles);
    return await UsersModel.findByPk(otherUser.id, { include: { model: UserRoleModel, as: 'roles' } });
  }

  static async updateUser(user: User, _user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.id) throw new Error('user id is required to update a user');
    const oldUser = await UsersModel.findByPk(user.id);
    if (!oldUser) throw new Error('user does not exist');
    const admin = await UsersModel.findByPk(_user.id, { include: { model: UserRoleModel, as: 'roles' } });
    const planAdmin = admin?.get({ plain: true }) as any;
    const isSupperAdmin = planAdmin?.roles?.find((r: any) => r.name === UserTypes.SuperAdmin);
    if (!isSupperAdmin) throw new Error("you don't have permission to perform this action");
    const [_, updatedUser] = await UsersModel.update(user, {
      where: { id: user.id, organizationId: _user.organizationId },
      returning: true,
    });
    if (user.roles) {
      const userRoles = await UserRoleModel.findAll({ where: { id: user.roles?.map((u) => u.id) } });
      await oldUser.setRoles(userRoles);
    }
    return updatedUser[0].get({ plain: true }); // plain JS object
  }

  static async deleteUser(userToBeRemoveId: string, user: Pick<User, 'id' | 'organizationId'>) {
    if (!user.id) throw new Error('user is not authenticated');
    const _user = await UsersModel.findByPk(user.id, {
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
          include: [
            {
              model: UserPermissionsModel,
              as: 'permissions',
            },
          ],
        },
      ],
    });

    const plainUser = _user?.get({ plain: true }) as any;
    if (!plainUser) throw new Error('user does not exist');
    if (plainUser.id === userToBeRemoveId) throw new Error('super-admin can not be deleted');

    const isSupperAdmin = plainUser?.roles.find((r: any) => r.name === UserTypes.SuperAdmin);
    if (!isSupperAdmin) throw new Error("you don't have permission to perform this action");
    await UsersModel.destroy({ where: { id: userToBeRemoveId } });
  }

  static async getUsers(user: Pick<User, 'id' | 'organizationId'>) {
    const users = await UsersModel.findAll({
      where: { organizationId: user.organizationId },
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
          where: {
            name: {
              [Op.ne]: 'super-admin',
            },
          },
          required: false,
        },
      ],
    });
    return users;
  }

  static async signUp(data: Omit<ISignUp, 'id'>) {
    const user = await UsersModel.create(data);

    // JWT payload
    const payload = {
      id: user.id,
      organizationId: user.organizationId || '',
      email: user.email,
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(payload);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 minutes = 900 seconds
      },
    };
  }

  static async authenticateWithGoogle() {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly', // Gmail only
      'openid',
      'email',
      'profile',
    ];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // ensures refresh_token
      prompt: 'consent', // ensures refresh_token every time
      scope: scopes,
    });
    return { authUrl: url };
  }

  static async exchangeGoogleSignUpCode(code: string) {
    if (!code) throw new Error('auth code is required');
    // exchange code for tokens
    const { tokens } = await this.oauth2Client.getToken(code);

    // get user profile info
    this.oauth2Client.setCredentials(tokens);
    // verify ID token (this contains user profile info)
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: appConfig.googleAuth.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Google login failed');

    const userInfo = {
      email: payload.email!,
      name: payload.name!,
      password: 'goolge-user-password',
    };

    const existingUser = await UsersModel.findOne({ where: { email: userInfo.email } });
    if (existingUser) {
      // 4. Generate your own app tokens
      const userPayload = {
        id: existingUser.id,
        organizationId: existingUser.organizationId || '',
        email: existingUser.email,
      };

      const { accessToken, refreshToken, expires_in } = generateTokens(userPayload);

      // 5. Return app user + tokens
      return {
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expires_in,
        },
      };
    }

    const user = await UsersModel.create(userInfo);

    // JWT payload
    const userPayload = {
      id: user.id,
      organizationId: user.organizationId || '',
      email: user.email,
    };

    // Generate tokens
    const { accessToken, refreshToken, expires_in } = generateTokens(userPayload);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expires_in,
      },
    };
  }

  static async exchangeGoogleSignInCode(code: string) {
    if (!code) throw new Error('auth code is required');
    // 1. Exchange code for Google tokens
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // 2. Verify ID token
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: appConfig.googleAuth.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Google login failed');

    const email = payload.email!;

    // 3. Check if user already exists
    const user = await UsersModel.findOne({ where: { email } });

    if (!user) {
      // JWT payload
      const userInfo = {
        email: payload.email!,
        name: payload.name!,
        password: 'goolge-user-password',
      };

      const user: User = await UsersModel.create(userInfo);

      // JWT payload
      const userPayload = {
        id: user.id,
        organizationId: user.organizationId || '',
        email: user.email,
      };

      // Generate tokens
      const { accessToken, refreshToken, expires_in } = generateTokens(userPayload);
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expires_in,
        },
      };
    }

    // 4. Generate your own app tokens
    const userPayload = {
      id: user.id,
      organizationId: user.organizationId || '',
      email: user.email,
    };

    const { accessToken, refreshToken, expires_in } = generateTokens(userPayload);

    // 5. Return app user + tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expires_in,
      },
    };
  }

  static async login(data: Pick<ISignUp, 'email' | 'password'>) {
    const user = await UsersModel.findOne({ where: { email: data.email } });
    if (!user) throw new Error('user does not exist');
    const isPasswordMatched = await user.comparePassword(data.password);
    if (!isPasswordMatched) throw new Error('wrong password');

    // JWT payload
    const payload = {
      id: user.id,
      organizationId: user.organizationId || '',
      email: user.email,
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(payload);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 minutes = 900 seconds
      },
    };
  }

  static async refreshToken(refreshToken: string) {
    if (!refreshToken) throw new Error('No refresh token provided');

    const decoded = verifyToken(refreshToken, 'refresh') as any;
    const payload = {
      id: decoded.id,
      organizationId: decoded.organizationId || '',
      email: decoded.email,
      userType: decoded.userType,
    };

    const { accessToken, refreshToken: newRefresh, expires_in } = generateTokens(payload);

    return {
      access_token: accessToken,
      refresh_token: newRefresh,
      expires_in: expires_in,
    };
  }

  static async getCurrentUser(user: User) {
    const currentUser = await UsersModel.findByPk(user.id, {
      include: [
        {
          model: UserRoleModel,
          as: 'roles',
          where: { organizationId: user.organizationId },
          required: false, // keep users without roles
          include: [
            {
              model: UserPermissionsModel,
              as: 'permissions',
              through: { attributes: [] }, // hide join table
            },
          ],
        },
      ],
    });
    if (!currentUser) throw new Error('User not found');
    return currentUser;
  }

  static async createResetPasswordLink(email: string) {
    if (!email) throw new Error('email is required to set forgot password');
    const user = await UsersModel.findOne({ where: { email } });
    if (!user) throw new Error('user does not exist');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    user.resetToken = token;
    user.resetTokenExpires = expires;
    await user.save();

    const resetPasswordUrl = `${appConfig.frontendUrl}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetPasswordUrl);
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!token) throw new Error('invalid token');

    const user = await UsersModel.findOne({ where: { resetToken: token } });
    if (!user) throw new Error('invalid token');

    if (user?.resetTokenExpires && user.resetTokenExpires < new Date()) {
      throw new Error('reset link expired');
    }

    // update password
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    // JWT payload
    const payload = {
      id: user.id,
      organizationId: user.organizationId || '',
      email: user.email,
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(payload);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 minutes = 900 seconds
      },
    };
  }

  static async addRoleToUser(roleIds: string[], userId: string) {
    if (roleIds.length === 0 || !userId) throw new Error('wrong input data');
    const user = await UsersModel.findByPk(userId);
    if (!user) throw new Error('user does not exist');

    const roles = await UserRoleModel.findAll({ where: { id: roleIds } });
    if (!roles || roles.length === 0) throw new Error('roles does not exist');

    await user.setRoles(roles);
  }

  static async removeRoleFromUser(roleIds: string[], userId: string) {
    if (roleIds.length === 0 || !userId) throw new Error('wrong input data');
    const user = await UsersModel.findByPk(userId);
    if (!user) throw new Error('user does not exist');

    const roles = await UserRoleModel.findAll({ where: { id: roleIds } });
    if (!roles || roles.length === 0) throw new Error('roles does not exist');
    await user.removeRoles(roles);
  }
}
