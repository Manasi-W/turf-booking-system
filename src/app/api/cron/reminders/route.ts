import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminderEmail } from "@/lib/mail";
import { sendBookingReminderSMS } from "@/lib/sms";
import { addHours, format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";

export async function GET(request: Request) {
  // 1. Verify Cron Secret (Security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const twoHoursFromNow = addHours(now, 2.5); // Range: 2 to 2.5 hours from now
    const twoHoursLimit = addHours(now, 1.5);

    // Get today's date at midnight for querying
    const today = startOfDay(now);

    // Find bookings starting in ~2 hours that hasn't been notified yet
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: today,
          lte: addHours(today, 48), // Look up to 2 days ahead just in case
        },
        reminderSent: false,
        paymentStatus: "CONFIRMED", // Only remind for confirmed matches
      },
      include: {
        customer: true,
        turf: true,
      },
    });

    let sentCount = 0;

    for (const booking of bookings) {
      // Parse the startTime string (e.g. "14:00") into a full Date object
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      const bookingStartDateTime = new Date(booking.date);
      bookingStartDateTime.setHours(hours, minutes, 0, 0);

      // Check if this booking starts in the [1.5h, 2.5h] window
      if (isAfter(bookingStartDateTime, twoHoursLimit) && isBefore(bookingStartDateTime, twoHoursFromNow)) {
        
        console.log(`Sending reminder for booking ${booking.id} to ${booking.customer.email}`);

        // Send Email
        await sendBookingReminderEmail(booking.customer.email, {
          turfName: booking.turf.name,
          time: booking.startTime,
        });

        // Send SMS (if phone exists)
        if (booking.customer.phone) {
          await sendBookingReminderSMS(booking.customer.phone, {
            turfName: booking.turf.name,
            time: booking.startTime,
          });
        }

        // Mark as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });

        sentCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: bookings.length, 
      remindersSent: sentCount,
      timestamp: now.toISOString() 
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: "Reminder logic failed" }, { status: 500 });
  }
}
