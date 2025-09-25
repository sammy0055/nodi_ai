import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { RelatedEntityType, RequestStatus } from '../../data/data-types';

const requestSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  requestType: z.enum([...Object.values(RelatedEntityType)] as any),
});

const requestSchemaUpdate = z.object({
  id: z.string().trim(),
  status: z.enum([...Object.values(RequestStatus)] as any).optional(),
  approvedByUserId: z.string(),
  approvalNotes: z.string().trim(),
  approvedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
});

export const validateRequestSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = requestSchema.safeParse(req.body);
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

export const validateUpdateRequestSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = requestSchemaUpdate.safeParse(req.body);
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
