import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const slotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  price: z.number().optional().nullable(),
});

const bulkSlotSchema = z.array(slotSchema);

const turfUpdateSchema = z.object({
  active: z.boolean().optional(),
  isApproved: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const slots = await prisma.timeSlot.findMany({
      where: { turfId: id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: turfId } = await params;
    const body = await req.json();

    // Verify ownership
    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
      select: { ownerId: true }
    });

    if (!turf) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    if (turf.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if it's a bulk operation
    if (Array.isArray(body)) {
      const validatedData = bulkSlotSchema.parse(body);
      const slots = await prisma.timeSlot.createMany({
        data: validatedData.map(slot => ({
          ...slot,
          turfId,
          price: slot.price ? parseFloat(slot.price.toString()) : null,
        }))
      });
      return NextResponse.json(slots);
    }

    const { dayOfWeek, startTime, endTime, price } = slotSchema.parse(body);

    const slot = await prisma.timeSlot.create({
      data: {
        turfId,
        dayOfWeek,
        startTime,
        endTime,
        price: price ? parseFloat(price.toString()) : null,
      }
    });

    return NextResponse.json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating slot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: turfId } = await params;
    const body = await req.json();

    // Verify ownership through turf
    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
      select: { ownerId: true }
    });

    if (!turf) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    if (turf.ownerId !== (session.user as any).id && (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if the request is for updating turf status
    if (body.active !== undefined || body.isApproved !== undefined) {
      const { active, isApproved } = turfUpdateSchema.parse(body);
      
      // Only allow admin to update isApproved status
      if (isApproved !== undefined && (session.user as any).role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Forbidden: Only admins can approve turfs" }, { status: 403 });
      }

      const updatedTurf = await prisma.turf.update({
        where: { id: turfId },
        data: {
          ...(active !== undefined && { active }),
          ...(isApproved !== undefined && { isApproved }),
        },
      });
      return NextResponse.json(updatedTurf);
    }

    // Otherwise, assume it's a time slot update
    const { slotId, dayOfWeek, startTime, endTime, price } = body;

    if (!slotId) {
      return NextResponse.json({ error: "Slot ID is required" }, { status: 400 });
    }

    const updatedSlot = await prisma.timeSlot.update({
      where: { id: slotId },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        price: price !== undefined ? (price === "" || price === null ? null : parseFloat(price.toString())) : undefined,
      }
    });

    return NextResponse.json(updatedSlot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slotId = searchParams.get("slotId");

    if (!slotId) {
      return NextResponse.json({ error: "Slot ID is required" }, { status: 400 });
    }

    // Verify ownership through turf
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: { turf: { select: { ownerId: true } } }
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.turf.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.timeSlot.delete({
      where: { id: slotId }
    });

    return NextResponse.json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
