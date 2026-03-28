import prisma from "../lib/prisma";
import { sendBookingReminderEmail } from "../lib/mail";
import { sendBookingReminderSMS } from "../lib/sms";
import { addHours, format, startOfHour } from "date-fns";

async function main() {
  console.log("--- Starting Booking Reminders Task ---");
  
  // Find bookings starting in ~2 hours
  const now = new Date();
  const targetStartTime = addHours(startOfHour(now), 2);
  const startTimeStr = format(targetStartTime, "HH:00");
  
  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: now,
        lte: now, // Same day
      },
      startTime: startTimeStr,
      paymentStatus: "PAID",
    },
    include: {
      customer: true,
      turf: true,
    },
  });

  console.log(`Found ${bookings.length} bookings for ${startTimeStr} today.`);

  for (const booking of bookings) {
    try {
      // 1. Send Internal Notification
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: "Game Reminder",
          message: `Your match at ${booking.turf.name} starts in 2 hours!`,
          type: "INFO",
          link: `/dashboard/customer/bookings`,
        },
      });

      // 2. Send Real Email
      if (booking.customer.email) {
        await sendBookingReminderEmail(booking.customer.email, {
          turfName: booking.turf.name,
          time: booking.startTime,
        });
      }

      // 3. Send Real SMS
      if (booking.customer.phone) {
        await sendBookingReminderSMS(booking.customer.phone, {
          turfName: booking.turf.name,
          time: booking.startTime,
        });
      }

      console.log(`Sent reminders for booking ${booking.id} to ${booking.customer.name}`);
    } catch (err) {
      console.error(`Failed to send reminder for booking ${booking.id}:`, err);
    }
  }

  console.log("--- Reminders Task Completed ---");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
