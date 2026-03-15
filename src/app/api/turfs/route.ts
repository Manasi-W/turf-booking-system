import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "TURF_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, location, pricePerHour, sportType, description, images } = body;

    const turf = await prisma.turf.create({
      data: {
        name,
        location,
        pricePerHour,
        sportType,
        description,
        images,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(turf, { status: 201 });
  } catch (error) {
    console.error("Turf creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
