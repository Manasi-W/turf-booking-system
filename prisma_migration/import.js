const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, 'data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Data file not found at:', dataPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log('Cleaning existing PostgreSQL data...');
  
  // Delete in correct order to avoid FK constraint violations
  await prisma.paymentSplit.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.turf.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformConfig.deleteMany();

  console.log('Importing Users...');
  for (const user of data.users) {
    await prisma.user.create({ data: user });
  }

  console.log('Importing Turfs...');
  for (const turf of data.turfs) {
    // Separate fields that might cause issues
    const { owner, ...turfData } = turf;
    await prisma.turf.create({ data: turfData });
  }

  console.log('Importing TimeSlots...');
  // TimeSlots can be many, using createMany for performance
  if (data.timeSlots.length > 0) {
    await prisma.timeSlot.createMany({ data: data.timeSlots });
  }

  console.log('Importing Bookings...');
  for (const booking of data.bookings) {
    const { customer, turf, ...bookingData } = booking;
    await prisma.booking.create({ data: bookingData });
  }

  console.log('Importing PaymentSplits...');
  if (data.paymentSplits.length > 0) {
    await prisma.paymentSplit.createMany({ data: data.paymentSplits });
  }

  console.log('Importing Reviews...');
  if (data.reviews.length > 0) {
    await prisma.review.createMany({ data: data.reviews });
  }

  console.log('Importing PlatformConfigs...');
  if (data.platformConfigs.length > 0) {
    await prisma.platformConfig.createMany({ data: data.platformConfigs });
  }

  console.log('Full data migration from SQLite to PostgreSQL completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
