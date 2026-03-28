import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isFeatured } = await req.json();

    const updatedTurf = await prisma.turf.update({
      where: { id },
      data: { isFeatured },
    });

    return NextResponse.json(updatedTurf);
  } catch (error) {
    console.error("Featured update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
