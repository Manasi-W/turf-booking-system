import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking || booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
    }

    // Don't allow cancelling if already cancelled or past date
    if (booking.paymentStatus === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    const bookingDate = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}`);
    if (bookingDate < new Date()) {
      return NextResponse.json({ error: "Cannot cancel past bookings" }, { status: 400 });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: "CANCELLED" }
    });

    return NextResponse.json({ 
      message: "Booking cancelled successfully",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Cancellation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
