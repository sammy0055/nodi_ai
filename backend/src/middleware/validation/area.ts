import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const areaSchema = z.object({
  zoneId: z.string().trim(),
  branchId: z.string().trim(),
  name: z.string().trim(),
  deliveryTime: z.date(),
  deliveryCharge: z.number(),
});

export const validateAreaSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = areaSchema.safeParse(req.body);
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

// For updates → all fields optional
const updateAreaSchema = areaSchema.partial();
export const validateUpdateAreaSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = updateAreaSchema.safeParse(req.body);
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
