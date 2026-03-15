import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { customer: { email: { contains: search } } },
        { customer: { name: { contains: search } } },
        { id: { contains: search } },
        { turf: { name: { contains: search } } },
      ];
    }
    
    if (status !== "ALL") {
      whereClause.paymentStatus = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: true,
        turf: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance on this page
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Admin Bookings API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
