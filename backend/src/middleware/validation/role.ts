import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { UserTypes } from '../../data/data-types';

const userTypes = Object.values(UserTypes);
const roleSchema = z.object({
  role: z.enum(userTypes as any),
});


export const validateRoleSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = roleSchema.safeParse(req.body);
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