import { auth } from "@/lib/auth";
import { sendBookingConfirmationEmail, sendSplitInvitationEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bookingSchema = z.object({
  turfId: z.string(),
  date: z.string(), // ISO string
  startTime: z.string(), // "HH:mm"
  endTime: z.string(), // "HH:mm"
  numPlayers: z.number().min(1),
  totalAmount: z.number(),
  paymentMethod: z.enum(["ONLINE", "OFFLINE"]),
  isSplit: z.boolean().optional(),
  splitEmails: z.array(z.string().email()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = bookingSchema.parse(body);

    const { 
      turfId, date, startTime, endTime, numPlayers, totalAmount, 
      paymentMethod, isSplit, splitEmails 
    } = validatedData;
    
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 is Sunday, 1 is Monday...

    // 1. Strict Slot Validation (Check if the turf is "open" at this time)
    const availableSlots = await prisma.timeSlot.findMany({
      where: {
        turfId,
        dayOfWeek,
        active: true,
      },
    });

    const isSlotAvailable = availableSlots.some(slot => {
      // Basic string comparison works for "HH:mm" format
      return startTime >= slot.startTime && endTime <= slot.endTime;
    });

    if (!isSlotAvailable) {
      return NextResponse.json(
        { error: "This turf is not available for the selected time range" },
        { status: 400 }
      );
    }

    // 2. Basic double booking prevention (Check if someone else already booked it)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        turfId,
        date: bookingDate,
        startTime,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This slot is already booked" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          turfId,
          customerId: (session.user as any).id,
          date: bookingDate,
          startTime,
          endTime,
          numPlayers,
          totalAmount,
          paymentMethod,
          paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
        },
      });

      if (isSplit && splitEmails && splitEmails.length > 0) {
        const splitAmount = totalAmount / (splitEmails.length + 1); // +1 for the creator
        
        await (tx as any).paymentSplit.createMany({
          data: splitEmails.map(email => ({
            bookingId: booking.id,
            email,
            amount: splitAmount,
            status: "PENDING"
          }))
        });
      }

      return booking;
    });

    // Send Confirmation Email
    const turf = await prisma.turf.findUnique({ where: { id: turfId } });
    if (session.user?.email && turf) {
      await sendBookingConfirmationEmail(session.user.email, {
        turfName: turf.name,
        date: bookingDate.toLocaleDateString(),
        time: `${startTime} - ${endTime}`,
        amount: totalAmount,
      });
    }

    // Send Split Invitations
    if (isSplit && splitEmails && splitEmails.length > 0) {
      const splitAmount = totalAmount / (splitEmails.length + 1);
      for (const email of splitEmails) {
        await sendSplitInvitationEmail(email, {
          inviterName: session.user?.name || "A friend",
          turfName: turf?.name || "a turf",
          date: bookingDate.toLocaleDateString(),
          time: `${startTime} - ${endTime}`,
          amount: splitAmount,
        });
      }
    }

    // Send Notification to Customer - Fail-safe for stale Prisma Client
    const notificationData = {
      userId: session.user.id,
      title: "Booking Confirmed!",
      message: `Your booking at ${turf?.name} on ${bookingDate.toLocaleDateString()} for ${startTime}-${endTime} is confirmed.`,
      type: "SUCCESS",
      link: "/dashboard/customer/bookings"
    };

    if ((prisma as any).notification) {
      await (prisma as any).notification.create({ data: notificationData }).catch(e => console.error("Customer Notification Error:", e));
    } else {
      await prisma.$executeRaw`
        INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "isRead", "link", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${notificationData.userId}, ${notificationData.title}, ${notificationData.message}, ${notificationData.type}, false, ${notificationData.link}, now(), now())
      `.catch(e => console.error("Customer Raw Notification Error:", e));
    }

    // Send Notification to Owner
    if (turf?.ownerId) {
      const ownerNoteData = {
        userId: turf.ownerId,
        title: "New Booking Received",
        message: `${session.user.name} has booked your turf ${turf.name} for ${bookingDate.toLocaleDateString()} at ${startTime}.`,
        type: "INFO",
        link: "/dashboard/owner/calendar"
      };

      if ((prisma as any).notification) {
        await (prisma as any).notification.create({ data: ownerNoteData }).catch(e => console.error("Owner Notification Error:", e));
      } else {
        await prisma.$executeRaw`
          INSERT INTO "Notification" ("id", "userId", "title", "message", "type", "isRead", "link", "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, ${ownerNoteData.userId}, ${ownerNoteData.title}, ${ownerNoteData.message}, ${ownerNoteData.type}, false, ${ownerNoteData.link}, now(), now())
        `.catch(e => console.error("Owner Raw Notification Error:", e));
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Booking Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
