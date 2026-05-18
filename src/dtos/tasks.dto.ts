import { z } from "zod";

const taskTypeValues = [
  "Installation",
  "Refurbishment",
  "Maintenance",
  "Repair",
  "Collection",
] as const;

const taskStatusValues = [
  "Pending",
  "Assigned",
  "InProgress",
  "Completed",
  "Cancelled",
] as const;

const taskPriorityValues = ["Low", "Medium", "High", "Urgent"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  customerId: z.number().int().positive().optional(),
  machineId: z.number().int().positive().optional(),
  technicianId: z.number().int().positive().optional(),
  taskType: z.enum(taskTypeValues),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(taskPriorityValues),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.enum(taskStatusValues),
  completionNotes: z.string().optional(),
});

export const taskFilterSchema = z.object({
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(taskPriorityValues).optional(),
  technicianId: z.coerce.number().int().positive().optional(),
  customerId: z.coerce.number().int().positive().optional(),
});

export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusRequest = z.infer<typeof updateTaskStatusSchema>;
export type TaskFilterQuery = z.infer<typeof taskFilterSchema>;
