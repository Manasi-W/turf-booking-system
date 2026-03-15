import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, location, pricePerHour, sportType, description, images, active } = body;

    // Verify ownership
    const turf = await prisma.turf.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!turf) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    if (turf.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTurf = await prisma.turf.update({
      where: { id },
      data: {
        name,
        location,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined,
        sportType,
        description,
        images,
        active,
      }
    });

    return NextResponse.json(updatedTurf);
  } catch (error) {
    console.error("Error updating turf:", error);
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

    const { id } = await params;

    // Verify ownership
    const turf = await prisma.turf.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!turf) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }

    if (turf.ownerId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Instead of actual delete, maybe just deactivate? 
    // But schema has a delete cascade for slots, and bookings might be affected.
    // For now, let's just delete as requested, but usually we'd want soft delete.
    await prisma.turf.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Turf deleted successfully" });
  } catch (error) {
    console.error("Error deleting turf:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
