import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getDashboard = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const now = new Date();

  const [statusCounts, totalTechnicians, totalCustomers, overdueTasks] =
    await Promise.all([
      prisma.taskItem.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.user.count({ where: { role: "Technician", isActive: true } }),
      prisma.customer.count(),
      prisma.taskItem.count({
        where: {
          dueDate: { lt: now },
          status: { notIn: ["Completed", "Cancelled"] },
        },
      }),
    ]);

  const groupedCounts = Object.fromEntries(
    statusCounts.map((row) => [row.status, row._count.id])
  ) as Record<string, number>;

  const tasksByStatus = {
    Pending: groupedCounts.Pending ?? 0,
    Assigned: groupedCounts.Assigned ?? 0,
    InProgress: groupedCounts.InProgress ?? 0,
    Completed: groupedCounts.Completed ?? 0,
    Cancelled: groupedCounts.Cancelled ?? 0,
  };

  const openTasks =
    tasksByStatus.Pending +
    tasksByStatus.Assigned +
    tasksByStatus.InProgress;

  const completedTasks = tasksByStatus.Completed;

  res.json({
    tasksByStatus,
    openTasks,
    completedTasks,
    overdueTasks,
    totalTechnicians,
    totalCustomers,
  });
};
