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

  const tasksByStatus = Object.fromEntries(
    statusCounts.map((row) => [row.status, row._count.id])
  ) as Record<string, number>;

  const openTasks =
    (tasksByStatus["Pending"] ?? 0) +
    (tasksByStatus["Assigned"] ?? 0) +
    (tasksByStatus["InProgress"] ?? 0);

  const completedTasks = tasksByStatus["Completed"] ?? 0;

  res.json({
    tasksByStatus,
    openTasks,
    completedTasks,
    overdueTasks,
    totalTechnicians,
    totalCustomers,
  });
};
