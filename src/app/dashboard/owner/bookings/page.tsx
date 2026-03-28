import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar, User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import BookingFilter from "@/components/dashboard/BookingFilter";
import BookingSearch from "@/components/dashboard/BookingSearch";
import BookingActions from "@/components/dashboard/BookingActions";

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; query?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status || "all";
  const searchQuery = resolvedSearchParams.query || "";

  const turfs = await prisma.turf.findMany({
    where: { ownerId: session.user.id },
    include: { 
      bookings: {
        include: { customer: true },
        orderBy: { date: 'desc' }
      } 
    }
  });

  let allBookings = turfs.flatMap(t => t.bookings.map(b => ({ ...b, turfName: t.name })));

  // Apply filtering
  const now = new Date();
  if (statusFilter === "upcoming") {
    allBookings = allBookings.filter(b => b.paymentStatus !== "CANCELLED" && new Date(b.date) >= now);
  } else if (statusFilter === "completed") {
    allBookings = allBookings.filter(b => b.paymentStatus === "PAID" && new Date(b.date) < now);
  }

  if (searchQuery) {
    allBookings = allBookings.filter(b => 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.turfName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-turf-dark mb-1">Booking Requests</h1>
          <p className="text-muted-foreground text-sm font-medium">Keep track of all upcoming and past matches.</p>
        </div>
        <BookingFilter currentFilter={statusFilter} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left order-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Turf / Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Date & Slot</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap px-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allBookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-turf-dark">
                         <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-turf-dark leading-none mb-1">{booking.customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono text-[9px] bg-white border border-gray-100 px-1 rounded mr-1">#{booking.id.substring(0, 8).toUpperCase()}</span>
                          @{booking.turfName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2 text-sm text-turf-dark font-bold mb-1">
                        <Calendar size={14} className="text-turf-green" />
                        {new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </div>
                     <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Clock size={12} />
                        {booking.startTime} - {booking.endTime}
                     </div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-lg font-black text-turf-dark">₹{booking.totalAmount}</p>
                     <p className="text-[10px] font-bold text-turf-green uppercase tracking-tighter">{booking.paymentMethod}</p>
                  </td>
                  <td className="px-8 py-6">
                     <div className={cn(
                       "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                       booking.paymentStatus === 'PAID' ? "bg-green-100 text-green-700" : 
                       booking.paymentStatus === 'CANCELLED' ? "bg-red-100 text-red-700" :
                       "bg-orange-100 text-orange-700"
                     )}>
                        {booking.paymentStatus === 'PAID' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {booking.paymentStatus}
                     </div>
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
              ))}
            </tbody>
          </table>
        </div>
        
        {allBookings.length === 0 && (
          <div className="py-20 text-center">
             <div className="inline-flex h-20 w-20 bg-gray-50 text-gray-300 items-center justify-center rounded-full mb-4">
                <Calendar size={40} />
             </div>
             <h3 className="text-xl font-bold text-turf-dark">No bookings match the filter</h3>
             <p className="text-muted-foreground text-sm">When matching bookings are found, they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
