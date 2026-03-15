import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: turfId } = await params;
    const reviews = await prisma.review.findMany({
      where: { turfId },
      include: {
        turf: {
            select: {
                id: true,
                _count: {
                    select: { reviews: true }
                }
            }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // We also want user info, but prisma User doesn't have an image in this schema.
    // Let's just fetch the name and role.
    const reviewsWithUsers = await Promise.all(reviews.map(async (review) => {
        const user = await prisma.user.findUnique({
            where: { id: review.customerId },
            select: { name: true, role: true }
        });
        return { ...review, user };
    }));

    return NextResponse.json(reviewsWithUsers);
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
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
    const validatedData = reviewSchema.parse(body);

    // Check if user has booked this turf before
    const booking = await prisma.booking.findFirst({
        where: {
            turfId,
            customerId: (session.user as any).id,
            paymentStatus: "PAID"
        }
    });

    if (!booking) {
        return NextResponse.json({ error: "You must complete a booking to leave a review." }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        turfId,
        customerId: (session.user as any).id,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Create Review Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
