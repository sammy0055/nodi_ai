import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const branchSchema = z.object({
  name: z.string().trim(),
  code: z.string().trim().optional(),
  phone: z.string().trim(),
  email: z.string().trim(),
  isActive: z.boolean().optional(),
  location: z.string().trim(),
  deliveryTime: z.date().optional(),
  takeAwayTime: z.date().optional(),
  supportsDelivery: z.boolean(),
  supportsTakeAway: z.boolean(),
});

export const validateBranchSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = branchSchema.safeParse(req.body);
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
const updateBranchSchema = branchSchema.partial();
export const validateUpdateBranchSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = updateBranchSchema.safeParse(req.body);
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
