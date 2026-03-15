import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Search, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import BookingFilter from "@/components/dashboard/BookingFilter";
import BookingActions from "@/components/dashboard/BookingActions";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/");

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status || "all";

  let whereClause: any = {};
  const now = new Date();

  if (statusFilter === "upcoming") {
    whereClause = {
      paymentStatus: { not: "CANCELLED" },
      date: { gte: now },
    };
  } else if (statusFilter === "completed") {
    whereClause = {
      OR: [
        { paymentStatus: "CANCELLED" },
        { date: { lt: now } },
      ],
    };
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      customer: true,
      turf: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-2">Platform Bookings</h1>
          <p className="text-muted-foreground font-medium">Monitor and manage every reservation across Turfivo.</p>
        </div>
        <BookingFilter currentStatus={statusFilter} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Booking ID</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Customer</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Turf & Schedule</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Amount</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <span className="font-mono text-[10px] text-muted-foreground bg-gray-100 px-2 py-1 rounded-lg">
                        #{booking.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-turf-green/10 flex items-center justify-center text-turf-green">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-turf-dark">{booking.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="font-bold text-turf-dark flex items-center gap-1">
                          <MapPin size={14} className="text-turf-green" />
                          {booking.turf.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          {format(new Date(booking.date), "MMM dd, yyyy")} • {booking.startTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-turf-dark">₹{booking.totalAmount}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider",
                        booking.paymentStatus === "PAID" ? "bg-green-100 text-green-700" :
                        booking.paymentStatus === "CANCELLED" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <BookingActions 
                        bookingId={booking.id} 
                        currentStatus={booking.paymentStatus} 
                        bookingDate={booking.date}
                        startTime={booking.startTime}
                       />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Calendar size={48} className="mb-4" />
                      <p className="text-lg font-bold">No bookings found for this filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
