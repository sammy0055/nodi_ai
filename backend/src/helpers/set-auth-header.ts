import { Response } from 'express';

export const setAuthHeaderCookie = (
  res: Response,
  newTokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }, cookieName:"auth_tokens" | "admin_auth_tokens"
) => {
  return res.cookie(cookieName, newTokens, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
};
