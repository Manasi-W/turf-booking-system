import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turfId } = await params;
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: any = {
      turfId,
      // Only include bookings that are active or pending payment
      // For now, any booking that isn't explicitly cancelled should block the slot
      // (Since we don't have a CANCELLED status yet, we'll exclude nothing for now, 
      // or assume only PENDING and PAID are active)
      paymentStatus: { in: ["PAID", "PENDING"] },
    };

    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    // Format for FullCalendar if needed, but the client can handle it
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching turf bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
