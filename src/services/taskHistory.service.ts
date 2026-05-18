import { TaskStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

interface CreateTaskHistoryParams {
  taskItemId: number;
  changedByUserId: number;
  action: string;
  oldStatus?: TaskStatus;
  newStatus?: TaskStatus;
  notes?: string;
}

export const createTaskHistory = (
  params: CreateTaskHistoryParams
): Promise<void> => {
  return prisma.taskHistory
    .create({ data: params })
    .then(() => undefined);
};
