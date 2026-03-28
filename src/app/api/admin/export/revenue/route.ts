import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        turf: { select: { name: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // CSV Headers
    const headers = [
      "Booking ID",
      "Date",
      "Time",
      "Turf Name",
      "Location",
      "Customer",
      "Email",
      "Amount",
      "Status",
      "Payment Method",
      "Created At"
    ];

    const rows = bookings.map(b => [
      b.id,
      new Date(b.date).toLocaleDateString(),
      `${b.startTime} - ${b.endTime}`,
      b.turf.name,
      b.turf.location.replace(/,/g, ';'), // Avoid CSV comma issues
      b.customer.name || "N/A",
      b.customer.email,
      b.totalAmount,
      b.paymentStatus,
      b.paymentMethod,
      new Date(b.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=platform_revenue_${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
