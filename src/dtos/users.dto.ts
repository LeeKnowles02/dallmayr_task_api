import { z } from "zod";

export const createTechnicianSchema = z.object({
  fullName: z.string().min(1).max(150),
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
});

export const updateTechnicianSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const resetTechnicianPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

export type CreateTechnicianRequest = z.infer<typeof createTechnicianSchema>;
export type UpdateTechnicianRequest = z.infer<typeof updateTechnicianSchema>;
export type ResetTechnicianPasswordRequest = z.infer<typeof resetTechnicianPasswordSchema>;
