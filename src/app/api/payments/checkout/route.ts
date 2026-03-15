import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, amount, turfName } = await req.json();

    if (!bookingId || !amount || !turfName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create Stripe Checkout Session
    if (!stripe) {
      throw new Error("Stripe is not configured");
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Booking for ${turfName}`,
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/customer/bookings?success=true&bookingId=${bookingId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/customer/bookings?canceled=true`,
      metadata: {
        bookingId,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
