const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@turf.com' },
    update: {},
    create: {
      email: 'admin@turf.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@turf.com' },
    update: {},
    create: {
      email: 'owner@turf.com',
      password: hashedPassword,
      name: 'Turf Owner',
      role: 'TURF_OWNER',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@turf.com' },
    update: {},
    create: {
      email: 'customer@turf.com',
      password: hashedPassword,
      name: 'Test Customer',
      role: 'CUSTOMER',
    },
  });

  console.log('Test users securely injected to Neon Postgres:', {
    admin: superAdmin.email,
    owner: owner.email,
    customer: customer.email
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
