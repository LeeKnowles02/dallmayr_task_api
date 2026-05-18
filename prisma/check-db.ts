import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const [users, customers, machines, tasks, histories, photos] =
    await Promise.all([
      prisma.user.findMany({
        select: { id: true, fullName: true, email: true, role: true, isActive: true },
      }),
      prisma.customer.findMany({
        select: { id: true, name: true, location: true },
      }),
      prisma.machine.findMany({
        select: { id: true, machineName: true, serialNumber: true, machineType: true, isActive: true },
      }),
      prisma.taskItem.findMany({
        select: { id: true, title: true, taskType: true, status: true, priority: true },
      }),
      prisma.taskHistory.findMany({
        select: { id: true, action: true, oldStatus: true, newStatus: true, taskItemId: true },
      }),
      prisma.taskPhoto.findMany({
        select: { id: true, fileName: true, contentType: true, taskItemId: true },
      }),
    ]);

  console.log("\n=== USERS ===");
  console.table(users);

  console.log("\n=== CUSTOMERS ===");
  console.table(customers);

  console.log("\n=== MACHINES ===");
  console.table(machines);

  console.log("\n=== TASKS ===");
  console.table(tasks);

  console.log("\n=== TASK HISTORY ===");
  console.table(histories);

  console.log("\n=== TASK PHOTOS ===");
  console.table(photos);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
