import prisma from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log("Users and Roles:", JSON.stringify(users, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
