import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("--- Checking Users in Database ---");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      password: true,
      name: true
    }
  });

  console.log(`Total users found: ${users.length}`);
  
  for (const user of users) {
    const isBcrypt = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$") || user.password.startsWith("$2");
    console.log(`User: ${user.email} | Role: ${user.role} | Name: ${user.name} | Password starts with valid hash marker: ${isBcrypt}`);
    
    // Test a common password if you want, but better just check hash format
    if (user.password.length < 20) {
        console.warn(`WARNING: Password hash for ${user.email} looks too short: ${user.password}`);
    }
  }
}

checkUsers()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
