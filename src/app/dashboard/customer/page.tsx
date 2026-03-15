import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, ArrowRight, Star, Clock, MapPin } from "lucide-react";

export default async function CustomerDashboard() {
   const session = await auth();

   if (!session?.user) {
      redirect("/login");
   }

   const userId = (session.user as any).id;

   // Fetch some summary data
   const upcomingBookings = await prisma.booking.findMany({
      where: {
         customerId: userId,
         date: { gte: new Date() },
      },
      include: {
         turf: true,
      },
      orderBy: { date: "asc" },
      take: 3,
   });

   const totalBookings = await prisma.booking.count({
      where: { customerId: userId },
   });

   return (
      <div className="max-w-6xl mx-auto space-y-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h1 className="text-4xl font-black text-turf-dark mb-2">Welcome Back, {session.user.name?.split(' ')[0]}!</h1>
               <p className="text-muted-foreground">Here&apos;s what's happening with your games today.</p>
            </div>
            <div className="flex gap-4">
               <div className="px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center min-w-[120px]">
                  <span className="text-3xl font-black text-turf-green">{totalBookings}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matches Played</span>
               </div>
               <div className="px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center min-w-[120px]">
                  <span className="text-3xl font-black text-turf-green">0</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cancelled</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Bookings Section */}
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-turf-dark flex items-center gap-2">
                     <Calendar className="text-turf-green" size={24} />
                     Upcoming Bookings
                  </h2>
                  <Link href="/dashboard/customer/bookings" className="text-sm font-bold text-turf-green hover:underline flex items-center gap-1">
                     View All <ArrowRight size={16} />
                  </Link>
               </div>

               <div className="space-y-4">
                  {upcomingBookings.length > 0 ? (
                     upcomingBookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center">
                           <div className="h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0">
                              <img
                                 src={booking.turf.images?.split(',')[0] || "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=200"}
                                 alt={booking.turf.name}
                                 className="h-full w-full object-cover"
                              />
                           </div>
                           <div className="flex-grow text-center md:text-left">
                              <h3 className="font-bold text-lg text-turf-dark">{booking.turf.name}</h3>
                              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-1 text-sm text-muted-foreground">
                                 <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-turf-green" />
                                    <span>{new Date(booking.date).toLocaleDateString()} at {booking.startTime}</span>
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <MapPin size={14} className="text-turf-green" />
                                    <span>{booking.turf.location.split(',')[0]}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-center md:items-end gap-2">
                              <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                 {booking.paymentStatus}
                              </span>
                              <p className="text-xl font-black text-turf-dark">₹{booking.totalAmount}</p>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="bg-white rounded-[2rem] p-12 border border-dashed border-gray-200 text-center">
                        <div className="mx-auto h-16 w-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                           <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-turf-dark mb-2">No Upcoming Games</h3>
                        <p className="text-muted-foreground mb-8">Ready to get back on the pitch?</p>
                        <Link href="/explore" className="px-8 py-4 bg-turf-green text-white font-bold rounded-2xl shadow-lg shadow-turf-green/20 hover:bg-turf-dark transition-all">
                           Explore Turfs
                        </Link>
                     </div>
                  )}
               </div>
            </div>

            {/* Sidebar Mini-Profile / Stats */}
            <div className="space-y-8">
               <div className="bg-turf-dark text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                     <div className="h-20 w-20 rounded-full border-4 border-turf-green/30 p-1 mb-4">
                        <div className="h-full w-full rounded-full bg-turf-green flex items-center justify-center text-2xl font-black">
                           {session.user.name?.charAt(0)}
                        </div>
                     </div>
                     <h3 className="text-xl font-bold mb-1">{session.user.name}</h3>
                     <p className="text-white/60 text-sm mb-6">{session.user.email}</p>

                     <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-center">
                        <div>
                           <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Rank</p>
                           <div className="flex items-center justify-center gap-1 text-turf-lime font-black">
                              <Star size={14} className="fill-current" />
                              <span>Silver III</span>
                           </div>
                        </div>
                        <div>
                           <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">XP</p>
                           <p className="font-black">2,450</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-turf-dark mb-4">Quick Tip</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                     Booking early on weekdays can save you up to 20% on certain turfs. Check the peak hours indicator on the booking page!
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}
