import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const appAdminCreateSubscriptionInputSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim(),
  price: z.number(),
  creditPoints: z.number(),
  billing_cycle_days: z.number().optional(),
  isActive: z.boolean().optional(),
  features: z.array(z.string()).optional(),
  paymentType: z.enum(['recurring_subscription', 'one_time_charge', 'offline_manual']),
  orgId: z.string(),
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
