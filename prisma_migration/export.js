const { PrismaClient } = require('./generated-client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching data from SQLite...');
  
  const users = await prisma.user.findMany();
  const turfs = await prisma.turf.findMany();
  const timeSlots = await prisma.timeSlot.findMany();
  const bookings = await prisma.booking.findMany();
  const paymentSplits = await prisma.paymentSplit.findMany();
  const reviews = await prisma.review.findMany();
  const platformConfigs = await prisma.platformConfig.findMany();

  const data = {
    users,
    turfs,
    timeSlots,
    bookings,
    paymentSplits,
    reviews,
    platformConfigs
  };

  const outputPath = path.join(__dirname, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`Successfully exported data to ${outputPath}`);
  console.log('Record counts:', {
    users: users.length,
    turfs: turfs.length,
    timeSlots: timeSlots.length,
    bookings: bookings.length,
    paymentSplits: paymentSplits.length,
    reviews: reviews.length,
    platformConfigs: platformConfigs.length
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
