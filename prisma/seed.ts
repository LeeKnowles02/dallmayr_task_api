import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@dallmayr.com" },
    update: {},
    create: {
      fullName: "System Admin",
      email: "admin@dallmayr.com",
      passwordHash: hashedPassword,
      role: "Admin",
      isActive: true,
    },
  });

  console.log("Seeded default admin user: admin@dallmayr.com / Admin@1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
