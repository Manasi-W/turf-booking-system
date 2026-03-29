import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, subDays, subMonths, format, startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "TURF_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "weekly";
    const ownerId = (session.user as any).id;

    // Fetch turf IDs owned by user
    const turfs = await prisma.turf.findMany({
      where: { ownerId },
      select: { id: true }
    });
    const turfIds = turfs.map(t => t.id);

    let startDate = startOfDay(subDays(new Date(), 6));
    let groupBy: "day" | "month" = "day";
    let count = 7;

    if (period === "monthly") {
      startDate = startOfDay(subDays(new Date(), 29));
      count = 30;
    } else if (period === "yearly") {
      startDate = startOfMonth(subMonths(new Date(), 11));
      groupBy = "month";
      count = 12;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        turfId: { in: turfIds },
        createdAt: { gte: startDate },
        paymentStatus: "PAID"
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    });

    let stats = [];

    if (groupBy === "day") {
      stats = Array.from({ length: count }).map((_, i) => {
        const date = subDays(new Date(), i);
        const dayAmount = bookings
          .filter(b => format(new Date(b.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
          .reduce((sum: number, b: any) => sum + b.totalAmount, 0);

        return {
          date: format(date, "MMM dd"),
          amount: dayAmount,
          rawDate: date
        };
      }).reverse();
    } else {
      stats = Array.from({ length: count }).map((_, i) => {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        const monthAmount = bookings
          .filter(b => {
            const bDate = new Date(b.createdAt);
            return bDate >= monthStart && bDate <= monthEnd;
          })
          .reduce((sum: number, b: any) => sum + b.totalAmount, 0);

        return {
          date: format(date, "MMM yyyy"),
          amount: monthAmount,
          rawDate: date
        };
      }).reverse();
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Owner Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
