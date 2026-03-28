import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Calendar, Clock, MapPin, AlertCircle, Info, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import CancelBookingButton from "@/components/booking/CancelBookingButton";
import BookingFilter from "@/components/dashboard/BookingFilter";

export default async function CustomerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams.status || "all";
  const userId = (session.user as any).id;

  const bookings = await prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      turf: true,
      splits: true
    },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  let filteredBookings = bookings;

  if (statusFilter === "upcoming") {
    filteredBookings = bookings.filter(b =>
      b.paymentStatus !== "CANCELLED" &&
      (new Date(b.date) >= now || (new Date(b.date).toDateString() === now.toDateString() && parseInt(b.startTime) > now.getHours()))
    );
  } else if (statusFilter === "completed") {
    filteredBookings = bookings.filter(b =>
      b.paymentStatus === "CANCELLED" ||
      (new Date(b.date) < now && new Date(b.date).toDateString() !== now.toDateString()) ||
      (new Date(b.date).toDateString() === now.toDateString() && parseInt(b.startTime) <= now.getHours())
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-2">My Bookings</h1>
          <p className="text-muted-foreground font-medium">Manage your personal turf reservations and history.</p>
        </div>
        <BookingFilter currentStatus={statusFilter} />
      </div>

      <div className="space-y-8">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const bookingStartTime = new Date(booking.date);
            const [hours, minutes] = booking.startTime.split(':').map(Number);
            bookingStartTime.setHours(hours, minutes, 0, 0);
            const isCancelled = booking.paymentStatus === "CANCELLED";

            return (
              <div key={booking.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center relative overflow-hidden group hover:shadow-xl transition-all">
                <div className={cn(
                  "absolute top-0 right-0 h-full w-1.5 transition-all group-hover:w-3",
                  isCancelled ? "bg-red-400" : "bg-turf-green"
                )}></div>

                <div className="h-32 w-32 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-lg relative">
                  <img
                    src={booking.turf.images?.split(',')[0] || "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=300"}
                    alt={booking.turf.name}
                    className={cn("h-full w-full object-cover transition-transform group-hover:scale-110", isCancelled && "grayscale opacity-50")}
                  />
                  {isCancelled && (
                    <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full">CANCELLED</span>
                    </div>
                  )}
                </div>

                <div className="flex-grow space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-turf-dark mb-1">{booking.turf.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={16} className="text-turf-green" />
                      <span>{booking.turf.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-turf-green">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Date</p>
                        <p className="font-bold text-sm">{new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-turf-green">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Time Slot</p>
                        <p className="font-bold text-sm">{booking.startTime} - {booking.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-turf-green">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Players</p>
                        <p className="font-bold text-sm">{booking.numPlayers} Players</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {booking.splits.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Split Participants</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="px-3 py-1 bg-turf-green/10 text-turf-green text-[10px] font-black rounded-lg border border-turf-green/20">
                            YOU (PAID)
                          </div>
                          {booking.splits.map((split: any) => (
                            <div key={split.id} className={cn(
                              "px-3 py-1 text-[10px] font-black rounded-lg border",
                              split.status === "PAID"
                                ? "bg-turf-green/10 text-turf-green border-turf-green/20"
                                : "bg-orange-50 text-orange-600 border-orange-100"
                            )}>
                              {split.email.split('@')[0].toUpperCase()} ({split.status})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!isCancelled && new Date(booking.date) >= now && (
                      <CancelBookingButton bookingId={booking.id} bookingStartTime={bookingStartTime} />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                  <div className="text-center md:text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Status</p>
                    <span className={cn(
                      "px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg",
                      isCancelled ? "bg-red-50 text-red-500 shadow-red-500/10" : "bg-turf-green text-white shadow-turf-green/20"
                    )}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Paid</p>
                    <p className="text-3xl font-black text-turf-dark">₹{booking.totalAmount}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-[3rem] p-24 border border-dashed border-gray-200 text-center">
            <div className="mx-auto h-20 w-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-turf-dark mb-2">No bookings found</h3>
            <p className="text-muted-foreground">Ready to start a new match?</p>
            <div className="mt-8">
              <Link href="/explore" className="px-8 py-4 bg-turf-green text-white font-black rounded-2xl shadow-lg shadow-turf-green/20 hover:bg-turf-dark transition-all">
                Find a Turf
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-turf-green/5 border border-turf-green/10 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-10">
        <div className="h-24 w-24 bg-turf-green text-white rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-xl shadow-turf-green/20 rotate-3">
          <Info size={48} />
        </div>
        <div className="space-y-4 text-center md:text-left flex-grow">
          <h4 className="text-2xl font-black text-turf-dark">Booking Help & Support</h4>
          <p className="text-muted-foreground leading-relaxed font-medium">
            Facing issues with your booking at the venue? Need to change your slot? Our support team is available 24/7 to help you out.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button className="px-8 py-4 bg-white text-turf-dark font-black rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-2">
            Contact Support <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


