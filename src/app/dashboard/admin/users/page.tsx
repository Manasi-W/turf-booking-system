import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Search, Shield, User as UserIcon, Activity, MoreVertical } from "lucide-react";
import UserActions from "./UserActions";
import UserFilter from "./UserFilter";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, role?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/");

  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || "";
  const role = resolvedSearchParams.role || "";

  const whereClause: any = {};
  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (role) {
    whereClause.role = role;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true, turfs: true }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-1 flex items-center gap-3">
            <Users className="text-turf-green" size={36} />
            User Management
          </h1>
          <p className="text-muted-foreground font-medium">Monitor and manage all platform participants.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <form className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              name="q"
              defaultValue={q}
              placeholder="Name, email or phone..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all shadow-sm"
            />
          </form>
          <Suspense fallback={<div className="h-12 w-32 bg-gray-100 rounded-2xl animate-pulse"></div>}>
            <UserFilter currentRole={role} />
          </Suspense>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stats</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-turf-green text-white flex items-center justify-center font-black shadow-sm">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-turf-dark">{user.name || "Anonymous User"}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'TURF_OWNER' ? 'bg-turf-green/10 text-turf-green' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {user.role === 'SUPER_ADMIN' ? <Shield size={12} /> : 
                       user.role === 'TURF_OWNER' ? <Activity size={12} /> : 
                       <UserIcon size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[10px] font-bold text-muted-foreground space-y-1">
                      {user.role === 'TURF_OWNER' ? (
                        <p>{user._count.turfs} Turfs Managed</p>
                      ) : (
                        <p>{user._count.bookings} Total Bookings</p>
                      )}
                      <p>Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "w-2 h-2 rounded-full inline-block mr-2",
                      user.active ? "bg-green-500" : "bg-red-500"
                    )}></span>
                    <span className="text-xs font-bold text-turf-dark">{user.active ? "Active" : "Disabled"}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <UserActions userId={user.id} initialStatus={user.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
