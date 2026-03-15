import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, Filter } from "lucide-react";
import RevenueChart from "../../admin/RevenueChart";
import { cn } from "@/lib/utils";
import RevenueFilter from "@/components/dashboard/RevenueFilter";

export default async function OwnerRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period || "monthly";

  const turfs = await prisma.turf.findMany({
    where: { ownerId: session.user.id },
    include: {
      bookings: {
        where: { paymentStatus: "PAID" },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const allPaidBookings = turfs.flatMap(t => t.bookings);
  const totalLifetimeRevenue = allPaidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  
  // Dynamic stats based on period
  let periodDate = new Date();
  let periodLabel = "Last 30 Days";
  
  if (period === "weekly") {
    periodDate.setDate(periodDate.getDate() - 7);
    periodLabel = "Last 7 Days";
  } else if (period === "yearly") {
    periodDate.setFullYear(periodDate.getFullYear() - 1);
    periodLabel = "Last 365 Days";
  } else {
    periodDate.setMonth(periodDate.getMonth() - 1);
  }

  const periodRevenue = allPaidBookings
    .filter(b => new Date(b.createdAt) >= periodDate)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-2">Revenue Analytics</h1>
          <p className="text-muted-foreground font-medium">Detailed financial performance across all your venues.</p>
        </div>
        <RevenueFilter currentPeriod={period} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-turf-green p-8 rounded-[2.5rem] text-white shadow-xl shadow-turf-green/20">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 rounded-2xl">
                 <IndianRupee size={24} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                 +12.5% <TrendingUp size={12} />
              </span>
           </div>
           <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total Lifetime Earnings</p>
           <p className="text-4xl font-black">₹{totalLifetimeRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-lg">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-50 text-turf-green rounded-2xl">
                 <Calendar size={24} />
              </div>
           </div>
           <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{periodLabel}</p>
           <p className="text-4xl font-black text-turf-dark">₹{periodRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-turf-dark p-8 rounded-[2.5rem] text-white">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/10 rounded-2xl text-turf-lime">
                 <ArrowUpRight size={24} />
              </div>
           </div>
           <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Avg. Booking Value</p>
           <p className="text-4xl font-black text-white">
              ₹{allPaidBookings.length > 0 ? Math.round(totalLifetimeRevenue / allPaidBookings.length).toLocaleString() : 0}
           </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
               <h3 className="text-2xl font-black text-turf-dark">Earnings Overview</h3>
               <p className="text-sm text-muted-foreground font-medium">Revenue trends for the selected {period} period</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 border border-gray-100 rounded-xl text-sm font-bold text-turf-dark hover:bg-gray-50 transition-all">
               <Filter size={18} className="text-turf-green" /> Filter by Venue
            </button>
         </div>
         <div className="h-[400px]">
            <RevenueChart apiUrl={`/api/owner/stats?period=${period}`} />
         </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-gray-50">
            <h3 className="text-2xl font-black text-turf-dark">Revenue by Venue</h3>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Venue Name</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bookings</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Earnings</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {turfs.map((turf) => {
                  const turfEarnings = turf.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
                  return (
                     <tr key={turf.id} className="group hover:bg-gray-50/50 transition-all">
                        <td className="px-8 py-6">
                           <p className="font-bold text-turf-dark">{turf.name}</p>
                           <p className="text-xs text-muted-foreground">{turf.location.split(',')[0]}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className="font-bold text-turf-dark">{turf.bookings.length}</span>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-lg font-black text-turf-dark">₹{turfEarnings.toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                              Active
                           </span>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>
    </div>
  );
}
