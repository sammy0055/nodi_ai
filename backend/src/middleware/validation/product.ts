import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ProductStatusTypes } from '../../data/data-types';

// Product schema
const supportStatuses = Object.values(ProductStatusTypes);
export const productSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  status: z.enum(supportStatuses as any).optional(),
  name: z.string().min(1, 'Name is required'),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), { message: 'Price must be a number' })
    .refine((val) => val > 0, { message: 'Price must be greater than 0' })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'Price can have at most 2 decimal places',
    }),
  description: z.string(),
  currency: z.string().length(3, 'Currency must be 3 letters').optional(),
  metaProductId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  fileFullPath: z.string().optional(),
});

export function validatecreateProductSchemaBody() {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = productSchema.safeParse(req.body);
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
}
