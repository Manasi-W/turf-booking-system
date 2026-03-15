import { TrendingUp, Users, Calendar, IndianRupee, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RevenueChart from "../../dashboard/admin/RevenueChart"; // Reusing the same chart component

export default async function OwnerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const turfs = await prisma.turf.findMany({
    where: { ownerId: session.user.id },
    include: { bookings: true }
  });

  const totalTurfs = turfs.length;
  const totalBookings = turfs.reduce((acc, t) => acc + t.bookings.length, 0);
  const paidBookings = turfs.flatMap(t => t.bookings).filter(b => b.paymentStatus === "PAID");
  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "bg-turf-green", text: "text-white" },
    { label: "Paid Bookings", value: paidBookings.length, icon: Calendar, color: "bg-white", text: "text-turf-dark" },
    { label: "My Turfs", value: totalTurfs, icon: Users, color: "bg-white", text: "text-turf-dark" },
    { label: "Completion Rate", value: totalBookings > 0 ? `${Math.round((paidBookings.length / totalBookings) * 100)}%` : "0%", icon: TrendingUp, color: "bg-white", text: "text-turf-green" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground font-medium">Manage your turfs and track performance.</p>
        </div>
        <div className="flex gap-4">
          {/* Quick actions could go here */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-48 transition-all hover:shadow-lg",
            stat.color,
            stat.text === "text-white" ? "shadow-turf-green/20" : ""
          )}>
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl", stat.color === "bg-white" ? "bg-gray-50 text-turf-green" : "bg-white/20 text-white")}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={20} className={stat.color === "bg-white" ? "text-gray-300" : "text-white/40"} />
            </div>
            <div>
              <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", stat.color === "bg-white" ? "text-muted-foreground" : "text-white/70")}>
                {stat.label}
              </p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm min-h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-turf-dark">Revenue Analysis</h3>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-[300px]">
            <RevenueChart apiUrl="/api/owner/stats" />
          </div>
        </div>

        {/* Top Performing Card or Tip */}
        <div className="bg-turf-dark rounded-[3rem] p-10 text-white shadow-2xl shadow-turf-dark/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div>
            <h3 className="text-2xl font-black mb-8">Quick Tip</h3>
            <div className="space-y-6">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-turf-lime uppercase tracking-widest mb-2">Maximize Earnings</p>
                <p className="text-sm text-white/80 leading-relaxed">Early morning slots (6AM-8AM) are currently 40% more popular. Consider offering a 'Early Bird' discount! </p>
              </div>
            </div>
          </div>
          <button className="w-full py-5 bg-white text-turf-dark font-black rounded-2xl hover:bg-turf-lime transition-all transform hover:-translate-y-1 mt-8">
            Manage Time Slots
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm mb-12">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-turf-dark">Recent Activity</h3>
          <button className="text-sm font-bold text-turf-green hover:underline">View All Bookings</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {turfs.flatMap(t => t.bookings)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
            .map((booking, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-turf-green/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-turf-green font-bold shadow-sm border border-gray-100">
                    {booking.startTime.split(':')[0]}
                  </div>
                  <div>
                    <p className="font-bold text-turf-dark">₹{booking.totalAmount} Received</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      At {turfs.find(t => t.id === booking.turfId)?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn(
                    "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                    booking.paymentStatus === 'PAID' ? 'bg-turf-green/10 text-turf-green' : 'bg-orange-100 text-orange-600'
                  )}>
                    {booking.paymentStatus}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          {totalBookings === 0 && (
            <div className="col-span-full py-20 text-center">
              <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-muted-foreground font-medium">No recent bookings found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

