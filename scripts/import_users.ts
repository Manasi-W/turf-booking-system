import { PrismaClient, UserRole } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function importUsers() {
  try {
    const backupPath = path.join(process.cwd(), "tmp", "users_backup.json");
    if (!fs.existsSync(backupPath)) {
      console.error("\x1b[31mBackup file not found at:\x1b[0m", backupPath);
      return;
    }

    const usersData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
    console.log(`\x1b[34mFound ${usersData.length} users to import...\x1b[0m`);

    for (const userData of usersData) {
      // Map the role string back to the enum value
      const role = userData.role as UserRole;
      
      // Upsert to handle existing users
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: userData.password,
          name: userData.name,
          phone: userData.phone,
          role: role,
          active: userData.active,
        },
        create: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          phone: userData.phone,
          role: role,
          active: userData.active,
        },
      });
      console.log(`\x1b[32mSynced user: ${user.email} (${user.role})\x1b[0m`);
    }

    console.log("\x1b[32m\nUser migration to Neon complete!\x1b[0m");
  } catch (error) {
    console.error("\x1b[31mError importing users:\x1b[0m", error);
  } finally {
    await prisma.$disconnect();
  }
}

importUsers();
