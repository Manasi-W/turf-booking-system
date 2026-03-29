"use client";

import Link from "next/link";
import { Trophy, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import UserMenu from "./UserMenu";
import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const { data: session, status } = useSession();
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-turf-green text-white shadow-lg shadow-turf-green/20">
                <Trophy size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-turf-dark">
                Turf<span className="text-turf-green">ivo</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/explore" className="text-sm font-medium text-muted-foreground hover:text-turf-green transition-colors">Explore</Link>
              <Link
                href={
                  !session ? "/login" :
                    (session.user as any).role === "SUPER_ADMIN" ? "/dashboard/admin/bookings" :
                      (session.user as any).role === "TURF_OWNER" ? "/dashboard/owner/bookings" :
                        "/dashboard/customer/bookings"
                }
                className="text-sm font-medium text-muted-foreground hover:text-turf-green transition-colors"
              >
                My Bookings
              </Link>
              <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-turf-green transition-colors">About</Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {status === "authenticated" ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <NotificationCenter />
                <UserMenu />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-turf-green hover:bg-turf-green/5 rounded-full transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-turf-green text-white text-sm font-medium rounded-full shadow-lg shadow-turf-green/20 hover:bg-turf-dark transition-all transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
            <button className="p-2 md:hidden text-muted-foreground">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
