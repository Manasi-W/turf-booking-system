"use client";

import Link from "next/link";
import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import UserMenu from "./UserMenu";
import NotificationCenter from "./NotificationCenter";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Explore", href: "/explore" },
    { 
      label: "My Bookings", 
      href: !session ? "/login" :
            (session.user as any).role === "SUPER_ADMIN" ? "/dashboard/admin/bookings" :
            (session.user as any).role === "TURF_OWNER" ? "/dashboard/owner/bookings" :
            "/dashboard/customer/bookings"
    },
    { label: "About", href: "/about" },
  ];

  return (
    <>
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

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-sm font-medium text-muted-foreground hover:text-turf-green transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {status === "authenticated" ? (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <NotificationCenter />
                  <UserMenu />
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
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
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 md:hidden text-muted-foreground hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[80%] max-w-[300px] bg-white shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center">
            <span className="text-xl font-bold text-turf-dark">Navigation</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-muted-foreground hover:bg-gray-50 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center p-4 rounded-2xl bg-gray-50 text-base font-bold text-turf-dark hover:bg-turf-green/5 hover:text-turf-green transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {!session && (
            <div className="p-6 border-t space-y-4">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-4 text-center text-sm font-bold text-turf-green border border-turf-green rounded-2xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-4 text-center text-sm font-bold text-white bg-turf-green rounded-2xl shadow-lg shadow-turf-green/20"
              >
                Get Started
              </Link>
            </div>
          )}
          
          {session && (
            <div className="p-6 border-t">
              <div className="p-4 rounded-2xl bg-turf-green/5 border border-turf-green/10">
                <p className="text-[10px] font-black uppercase text-turf-green mb-1 tracking-widest">Logged in as</p>
                <p className="font-bold text-turf-dark truncate">{(session.user as any).name || (session.user as any).email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
