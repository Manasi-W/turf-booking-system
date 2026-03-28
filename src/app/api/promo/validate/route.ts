import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, amount } = await req.json();

    if (!code || !amount) {
      return NextResponse.json({ error: "Missing code or amount" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
    }

    if (new Date(promo.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    }

    if (amount < promo.minBookingAmount) {
      return NextResponse.json({ 
        error: `Minimum booking amount for this code is ₹${promo.minBookingAmount}` 
      }, { status: 400 });
    }

    let discount = (amount * promo.discountPercent) / 100;
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }

    return NextResponse.json({
      code: promo.code,
      discountAmount: discount,
      finalAmount: amount - discount
    });
  } catch (error) {
    console.error("Promo Validation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
