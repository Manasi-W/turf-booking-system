import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Globe, Users, MapPin, IndianRupee, ShieldAlert, BarChart3 } from "lucide-react";
import ApprovalActions from "./ApprovalActions";
import RevenueChart from "./RevenueChart";
import Link from "next/link";
import { cn } from "@/lib/utils";
import RevenueFilter from "@/components/dashboard/RevenueFilter";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/");

  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period || "weekly";

  const totalUsers = await prisma.user.count();
  const totalTurfs = await prisma.turf.count();
  const totalBookings = await prisma.booking.count();
  const totalRevenue = await prisma.booking.aggregate({
    where: { paymentStatus: "PAID" },
    _sum: { totalAmount: true }
  });

  // Period-based revenue
  let periodDate = new Date();
  let periodLabel = "Last 7 Days";
  if (period === "monthly") {
    periodDate.setDate(periodDate.getDate() - 30);
    periodLabel = "Last 30 Days";
  } else if (period === "yearly") {
    periodDate.setFullYear(periodDate.getFullYear() - 1);
    periodLabel = "Last 365 Days";
  } else {
    periodDate.setDate(periodDate.getDate() - 7);
  }

  const periodRevenue = await prisma.booking.aggregate({
    where: { 
      paymentStatus: "PAID",
      createdAt: { gte: periodDate }
    },
    _sum: { totalAmount: true }
  });

  const pendingTurfs = await prisma.turf.findMany({
    where: { isApproved: false },
    include: { owner: true }
  });

  const stats = [
    { label: "Platform Revenue", value: `₹${(totalRevenue._sum.totalAmount || 0).toLocaleString()}`, icon: IndianRupee, color: "bg-turf-green" },
    { label: periodLabel, value: `₹${(periodRevenue._sum.totalAmount || 0).toLocaleString()}`, icon: BarChart3, color: "bg-turf-dark" },
    { label: "Total Bookings", value: totalBookings, icon: Globe, color: "bg-turf-dark" },
    { label: "Active Turfs", value: totalTurfs, icon: MapPin, color: "bg-turf-dark" },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-1">System Overview</h1>
          <p className="text-muted-foreground font-medium">Global platform statistics and moderation.</p>
        </div>
        <RevenueFilter currentPeriod={period} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-lg transition-all">
            <div className={cn("p-3 rounded-2xl self-start text-white shadow-lg", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-turf-dark">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-turf-dark">Pending Approvals</h3>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              {pendingTurfs.length} New Requests
            </span>
          </div>
          <div className="space-y-4">
            {pendingTurfs.length > 0 ? (
              pendingTurfs.map((turf) => (
                <div key={turf.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:border-turf-green/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <img src={turf.images?.split(',')[0]} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-turf-dark">{turf.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-1">
                        By {turf.owner.name} • <MapPin size={10} /> {turf.location.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <ApprovalActions turfId={turf.id} />
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 italic">
                <ShieldAlert size={40} className="mb-4 text-gray-300" />
                <p className="text-sm font-medium">No pending listings to review.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-turf-dark flex items-center gap-3">
              <BarChart3 className="text-turf-green" size={28} />
              Revenue Analytics
            </h3>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{periodLabel}</p>
          </div>

          <div className="flex-1 min-h-[300px]">
            <RevenueChart apiUrl={`/api/admin/stats?period=${period}`} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-5 bg-turf-green/5 rounded-2xl border border-turf-green/10">
              <p className="text-[10px] font-black text-turf-green uppercase mb-1">Commission (5%)</p>
              <p className="text-xl font-black text-turf-dark">₹{((totalRevenue._sum.totalAmount || 0) * 0.05).toLocaleString()}</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Payouts Pending</p>
              <p className="text-xl font-black text-turf-dark">₹{((totalRevenue._sum.totalAmount || 0) * 0.95).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
