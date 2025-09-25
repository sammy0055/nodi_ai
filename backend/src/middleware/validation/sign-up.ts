import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { UserTypes } from '../../data/data-types';

const supportedUserTypes = Object.values(UserTypes);

export const signUpSchema = z.object({
  name: z.string().trim(),
  email: z.string().trim().email('invalid email address'),
  password: z.string().trim(),
  userType: z.enum(supportedUserTypes as any).optional(),
});

export const validateSignUpSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'validation failed',
        errors: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.body = parsed.data; // use the parsed/typed data
    next();
  };
};
