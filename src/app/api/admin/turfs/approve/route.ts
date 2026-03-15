import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { turfId, approve } = body;

    if (!turfId) {
      return NextResponse.json({ error: "Turf ID is required" }, { status: 400 });
    }

    if (approve) {
      const updatedTurf = await prisma.turf.update({
        where: { id: turfId },
        data: { isApproved: true }
      });
      return NextResponse.json({ message: "Turf approved", turf: updatedTurf });
    } else {
      // Rejection for now deletes the turf, or could just keep it unapproved.
      // Let's delete it to keep things clean if rejected.
      await prisma.turf.delete({
        where: { id: turfId }
      });
      return NextResponse.json({ message: "Turf rejected and removed" });
    }

  } catch (error) {
    console.error("Admin Approval Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
