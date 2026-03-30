import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPassword() {
  const email = "admin@turf.com";
  const newPassword = "Admin123!";
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`\x1b[32mSuccessfully reset password for ${email} to: ${newPassword}\x1b[0m`);
    console.log(`\x1b[34mNew Hash: ${hashedPassword}\x1b[0m`);
  } catch (error) {
    console.error("\x1b[31mError resetting password:\x1b[0m", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
