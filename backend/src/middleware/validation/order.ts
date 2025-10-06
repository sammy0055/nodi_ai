import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { OrderStatusTypes } from '../../types/order';

const supportedOrderStatus = Object.values(OrderStatusTypes);
const orderSchema = z.object({
  orderId: z.string(),
  status: z.enum(supportedOrderStatus as any),
});

export const validateOrderSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = orderSchema.safeParse(req.body);
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
