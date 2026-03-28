"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, X, Check, BellOff, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Also fetch on mount to show the badge count
  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={18} className="text-green-500" />;
      case 'WARNING': return <AlertTriangle size={18} className="text-orange-500" />;
      case 'ERROR': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-turf-dark hover:bg-gray-50 transition-all shadow-sm group"
      >
        <Bell size={20} className={cn("transition-transform group-hover:rotate-12", isOpen && "text-turf-green")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-scale-in origin-top-right">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h4 className="font-black text-turf-dark uppercase tracking-widest text-[11px]">Notifications</h4>
                <div className="flex items-center gap-4">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-turf-green hover:underline flex items-center gap-1"
                    >
                      <Check size={12} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-turf-dark"><X size={16} /></button>
                </div>
             </div>

             <div className="max-h-[70vh] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-6 transition-all hover:bg-gray-50/50 flex gap-4 relative",
                          !n.isRead && "bg-turf-green/[0.02]"
                        )}
                        onClick={() => !n.isRead && markAsRead(n.id)}
                      >
                         <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                           n.type === 'SUCCESS' ? "bg-green-50" : 
                           n.type === 'WARNING' ? "bg-orange-50" :
                           n.type === 'ERROR' ? "bg-red-50" : "bg-blue-50"
                         )}>
                            {getIcon(n.type)}
                         </div>
                         <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1">
                               <h5 className={cn("text-sm leading-tight pr-4", n.isRead ? "font-medium text-gray-600" : "font-black text-turf-dark")}>
                                 {n.title}
                               </h5>
                               <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                 <Clock size={10} />
                                 {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                               </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                              {n.message}
                            </p>
                            {n.link && (
                              <Link 
                                href={n.link}
                                className="text-[10px] font-black text-turf-green uppercase tracking-wider hover:underline"
                                onClick={() => setIsOpen(false)}
                              >
                                View Details &rarr;
                              </Link>
                            )}
                         </div>
                         {!n.isRead && (
                           <div className="absolute top-6 right-2 w-1.5 h-1.5 rounded-full bg-turf-green" />
                         )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-muted-foreground px-10">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300 mb-4">
                      <BellOff size={32} />
                    </div>
                    <p className="font-bold text-turf-dark mb-1">No notifications yet</p>
                    <p className="text-xs">We'll let you know when something important happens.</p>
                  </div>
                )}
             </div>
          </div>
        </>
      )}
    </div>
  );
}
