import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("--- Verifying Cancellation Logic ---");
  const booking = await prisma.booking.findFirst({
    where: { paymentStatus: "PENDING" },
    orderBy: { createdAt: "desc" }
  });

  if (booking) {
    console.log(`Found pending booking: ${booking.id}`);
    // Simulate cancellation
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "CANCELLED" }
    });
    console.log(`Booking cancelled: ${updated.paymentStatus}`);
  } else {
    console.log("No pending bookings found to test cancellation.");
  }

  console.log("\n--- Verifying Owner Slots ---");
  const owner = await prisma.user.findFirst({ where: { role: "TURF_OWNER" } });
  if (owner) {
    const turf = await prisma.turf.findFirst({ where: { ownerId: owner.id } });
    if (turf) {
      console.log(`Found turf for owner: ${turf.name}`);
      const slotsCount = await prisma.timeSlot.count({ where: { turfId: turf.id } });
      console.log(`Total slots for this turf: ${slotsCount}`);
      
      // Test slot creation via API would be better, but we can check existence here
      if (slotsCount > 0) {
          const slot = await prisma.timeSlot.findFirst({ where: { turfId: turf.id } });
          console.log(`Found slot: ${slot?.startTime} - ${slot?.endTime} on day ${slot?.dayOfWeek}`);
      }
    }
  }
}

verify()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
