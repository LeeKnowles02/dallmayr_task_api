import { z } from "zod";

export const createMachineSchema = z.object({
  machineName: z.string().min(1).max(200),
  serialNumber: z.string().min(1).max(100),
  machineType: z.string().min(1).max(100),
  customerId: z.number().int().positive().optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateMachineSchema = createMachineSchema.partial();

export type CreateMachineRequest = z.infer<typeof createMachineSchema>;
export type UpdateMachineRequest = z.infer<typeof updateMachineSchema>;
