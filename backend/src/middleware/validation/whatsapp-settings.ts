import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const whatsappSettingsSchema = z.object({
    code:z.string().trim(),
    whatsappBusinessId:z.string().trim(),
    whatsappPhoneNumberId:z.string().trim()
})

export const validateWhatsappSettingsSchema = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = whatsappSettingsSchema.safeParse(req.body);
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