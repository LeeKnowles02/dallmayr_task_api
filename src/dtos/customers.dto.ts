import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerRequest = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerRequest = z.infer<typeof updateCustomerSchema>;
