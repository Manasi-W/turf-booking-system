"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 min-h-screen relative overflow-x-hidden">
      {/* Desktop Sidebar - Permanent on large screens */}
      <div className="hidden lg:flex lg:w-80 lg:shrink-0 h-screen sticky top-0 border-r bg-white">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay - Slide-in from left on mobile */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Backdrop for mobile sidebar */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            isSidebarOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setIsSidebarOpen(false)} 
        />
        <DashboardSidebar 
          onClose={() => setIsSidebarOpen(false)} 
          className="w-[85%] max-w-[320px] h-full shadow-2xl" 
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Dashboard Header - Only visible on small screens */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-turf-green rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-bold text-turf-dark">Dashboard</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-muted-foreground hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-10 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
