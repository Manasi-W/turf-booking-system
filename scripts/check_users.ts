import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
      }
    });

    console.log("\x1b[32m%s\x1b[0m", "\n--- Users found in Database ---");
    if (users.length === 0) {
      console.log("\x1b[31m%s\x1b[0m", "No users found! Your database is completely empty.");
    } else {
      console.table(users);
    }
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "Error connecting to database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
