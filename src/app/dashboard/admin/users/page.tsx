import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Mail, Calendar, Shield, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import UserActions from "@/components/admin/UserActions";

export default async function AdminUsersPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        _count: {
            select: {
                bookings: true,
                turfs: true
            }
        }
    }
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-10">
        <Link 
            href="/dashboard/admin"
            className="h-12 w-12 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-turf-dark"
        >
            <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-1">User Management</h1>
          <p className="text-muted-foreground font-medium">View and manage all platform participants.</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-gray-100">User</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-gray-100">Role</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-gray-100">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-gray-100">Activity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-gray-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-turf-green/10 flex items-center justify-center text-turf-green border border-turf-green/10 group-hover:bg-turf-green group-hover:text-white transition-all">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-turf-dark">{user.name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user.role === "SUPER_ADMIN" 
                        ? "bg-red-50 text-red-600 border-red-100" 
                        : user.role === "TURF_OWNER"
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-turf-green/10 text-turf-green border-turf-green/20"
                    }`}>
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} /> {format(user.createdAt, "MMM dd, yyyy")}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-lg font-black text-turf-dark leading-none">{user._count.bookings}</p>
                            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Bookings</p>
                        </div>
                        {user.role === "TURF_OWNER" && (
                            <div className="text-center">
                                <p className="text-lg font-black text-turf-dark leading-none">{user._count.turfs}</p>
                                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Turfs</p>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <UserActions 
                      userId={user.id} 
                      initialRole={user.role} 
                      initialActive={user.active} 
                    />
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
