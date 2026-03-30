"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Clock,
  IndianRupee, 
  Settings, 
  LogOut,
  ChevronRight,
  User,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

import { useSession } from "next-auth/react";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
}

interface DashboardSidebarProps {
  onClose?: () => void;
  className?: string;
}

const ownerItems: SidebarItem[] = [
  { name: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
  { name: "My Turfs", href: "/dashboard/owner/turfs", icon: MapPin },
  { name: "Schedule", href: "/dashboard/owner/calendar", icon: Calendar },
  { name: "Bookings", href: "/dashboard/owner/bookings", icon: Clock },
  { name: "Personal Bookings", href: "/dashboard/customer/bookings", icon: User },
  { name: "Revenue", href: "/dashboard/owner/revenue", icon: IndianRupee },
  { name: "Settings", href: "/dashboard/profile", icon: Settings },
];

const customerItems: SidebarItem[] = [
  { name: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
  { name: "My Bookings", href: "/dashboard/customer/bookings", icon: Calendar },
  { name: "My Profile", href: "/dashboard/profile", icon: User },
];

const adminItems: SidebarItem[] = [
  { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/admin/users", icon: User },
  { name: "Turfs", href: "/dashboard/admin/turfs", icon: MapPin },
  { name: "Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
  { name: "Personal Bookings", href: "/dashboard/customer/bookings", icon: Clock },
  { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

export default function DashboardSidebar({ onClose, className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = (session?.user as any)?.role;
  const items = role === "SUPER_ADMIN" ? adminItems : 
                role === "TURF_OWNER" ? ownerItems : 
                customerItems;

  return (
    <aside className={cn("w-full lg:w-80 border-r bg-white h-full flex flex-col overflow-y-auto relative z-40", className)}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-turf-green text-white shadow-lg shadow-turf-green/20">
              <User size={24} />
            </div>
            <span className="text-xl font-bold text-turf-dark">
              Turf<span className="text-turf-green">ivo</span>
            </span>
          </Link>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-muted-foreground hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between group px-4 py-3.5 text-sm font-bold rounded-2xl transition-all",
                  isActive 
                    ? "bg-turf-green text-white shadow-lg shadow-turf-green/20" 
                    : "text-muted-foreground hover:bg-gray-50 hover:text-turf-dark"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={cn(isActive ? "text-white" : "text-muted-foreground group-hover:text-turf-green")} />
                  {item.name}
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

