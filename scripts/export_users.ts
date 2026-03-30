import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function exportUsers() {
  try {
    const users = await prisma.user.findMany();
    
    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    const backupPath = path.join(tmpDir, "users_backup.json");
    fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));

    console.log(`\x1b[32mSuccessfully exported ${users.length} users to ${backupPath}\x1b[0m`);
  } catch (error) {
    console.error("\x1b[31mError exporting users:\x1b[0m", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportUsers();
