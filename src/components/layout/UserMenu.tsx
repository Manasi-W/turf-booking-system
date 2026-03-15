"use client";

import { useSession, signOut } from "next-auth/react";
import { User, LogOut, LayoutDashboard, Settings, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const role = (session.user as any).role;
  const dashboardHref = role === "SUPER_ADMIN" ? "/dashboard/admin" : 
                        role === "TURF_OWNER" ? "/dashboard/owner" : 
                        "/dashboard/customer";

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-1 pr-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-all border border-transparent hover:border-gray-200">
        <div className="h-8 w-8 rounded-full bg-turf-green text-white flex items-center justify-center font-bold text-sm">
          {session.user.name?.charAt(0)}
        </div>
        <span className="text-sm font-bold text-turf-dark">{session.user.name?.split(' ')[0]}</span>
      </button>

      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-[60]">
        <div className="px-4 py-3 border-b mb-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Signed in as</p>
          <p className="text-sm font-black text-turf-dark truncate">{session.user.email}</p>
        </div>
        
        <Link href={dashboardHref} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-turf-green hover:bg-turf-green/5 transition-all">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        
        <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-turf-green hover:bg-turf-green/5 transition-all">
          <User size={18} /> My Profile
        </Link>
        {role === "TURF_OWNER" && (
           <Link href="/dashboard/owner/turfs" className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-turf-green hover:bg-turf-green/5 transition-all">
            <MapPin size={18} /> Manage Turfs
           </Link>
        )}

        <button 
          onClick={() => signOut({ callbackUrl: "/" })} 
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
