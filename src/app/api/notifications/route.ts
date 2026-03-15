import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    // Find splits where this user is invited but hasn't paid
    const invitations = await prisma.paymentSplit.findMany({
      where: {
        email,
        status: "PENDING",
        booking: {
            paymentStatus: { not: "CANCELLED" }
        }
      },
      include: {
        booking: {
          include: {
            turf: true,
            customer: {
                select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Notifications Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { splitId } = await req.json();

        // Simulate payment - in real app this would be a payment gateway callback
        const split = await prisma.paymentSplit.update({
            where: { 
                id: splitId,
                email: session.user.email 
            },
            data: { status: "PAID" }
        });

        return NextResponse.json(split);
    } catch (error) {
        console.error("Split Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
