import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Creating sample data...");

  // 1. Create a Promo Code
  await prisma.promoCode.upsert({
    where: { code: "TURF10" },
    update: {},
    create: {
      code: "TURF10",
      discountPercent: 10,
      maxDiscount: 200,
      minBookingAmount: 500,
      expiryDate: new Date("2026-12-31"),
      isActive: true,
    },
  });

  // 2. Mark a turf as Featured
  const firstTurf = await prisma.turf.findFirst();
  if (firstTurf) {
    await prisma.turf.update({
      where: { id: firstTurf.id },
      data: { isFeatured: true }
    });
    console.log(`Marked ${firstTurf.name} as Featured.`);
  }

  console.log("Promo code TURF10 created (10% off).");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
