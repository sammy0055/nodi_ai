import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { OrderPermissions } from '../../data/data-types';

const permissionsType = Object.values(OrderPermissions);
const permissionSchema = z.array(
  z.object({
    key: z.enum(permissionsType as any),
  })
);

export const validatePermissionSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = permissionSchema.safeParse(req.body);
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
