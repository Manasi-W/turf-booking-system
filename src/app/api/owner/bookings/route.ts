import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "TURF_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const userId = (session.user as any).id;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    
    const isValidStart = startDate && !isNaN(startDate.getTime());
    const isValidEnd = endDate && !isNaN(endDate.getTime());

    console.log("OWNER_API: User ID:", userId, "Range Valid:", isValidStart, isValidEnd);

    try {
      const bookings = await prisma.booking.findMany({
        where: {
          turf: {
            ownerId: userId,
          },
          ...(isValidStart && isValidEnd && {
            date: {
              gte: startDate as Date,
              lte: endDate as Date,
            },
          }),
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          turf: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      console.log(`OWNER_API: Found ${bookings.length} bookings`);
      return NextResponse.json(bookings);
    } catch (dbError: any) {
      console.error("OWNER_API: Database Error:", dbError);
      return NextResponse.json(
        { error: "DB Error", details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("OWNER_API: Global Error:", error);
    return NextResponse.json(
      { error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}
