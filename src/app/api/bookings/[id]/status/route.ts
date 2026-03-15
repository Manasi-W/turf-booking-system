import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const session = await auth();
    const { status } = await req.json();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { turf: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only owner or admin can update status
    if (booking.turf.ownerId !== session.user.id && (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Logical safeguards: Cannot mark CANCELLED as PAID
    if (booking.paymentStatus === "CANCELLED" && status === "PAID") {
      return NextResponse.json({ error: "Cannot mark a cancelled booking as paid." }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: status }
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
