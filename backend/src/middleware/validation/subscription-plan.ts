import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const subscriptionPlanSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim(),
  price: z.number(),
  creditPoints: z.number(),
  billing_cycle_days: z.number().optional(),
  isActive: z.boolean().optional(),
  featues: z.array(z.string()).optional(),
});

export const validateSubscriptionPlanSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = subscriptionPlanSchema.safeParse(req.body);
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
