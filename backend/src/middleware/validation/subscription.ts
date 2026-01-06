import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const appAdminCreateSubscriptionInputSchema = z.object({
  planId: z.string(),
  creditPoint: z.number(),
});

export const validateAppAdminCreateSubscriptionSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = appAdminCreateSubscriptionInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'validation failed',
        errors: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.body = parsed.data;
    next();
  };
};
