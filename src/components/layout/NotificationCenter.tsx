"use client";

import { useState, useEffect } from "react";
import { Bell, CreditCard, Clock, Calendar, MapPin, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Invitation {
  id: string;
  amount: number;
  booking: {
    date: string;
    startTime: string;
    turf: {
        name: string;
        location: string;
    };
    customer: {
        name: string | null;
    };
  };
}

export default function NotificationCenter() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePay(splitId: string) {
    setProcessingId(splitId);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ splitId }),
      });
      if (res.ok) {
        setInvitations(invitations.filter(i => i.id !== splitId));
      }
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setProcessingId(null);
    }
  }

  if (loading && invitations.length === 0) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-turf-dark hover:bg-gray-50 transition-all shadow-sm group"
      >
        <Bell size={20} className={cn("transition-transform group-hover:rotate-12", isOpen && "text-turf-green")} />
        {invitations.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white animate-bounce-slow">
            {invitations.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-scale-in origin-top-right">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h4 className="font-black text-turf-dark uppercase tracking-widest text-[11px]">Notifications</h4>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-turf-dark"><X size={16} /></button>
             </div>

             <div className="max-h-[70vh] overflow-y-auto">
                {invitations.length > 0 ? (
                  <div className="p-4 space-y-4">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="p-5 bg-white border border-gray-100 rounded-3xl hover:border-turf-green/30 transition-all shadow-sm">
                         <div className="flex items-start gap-4 mb-4">
                            <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                               <CreditCard size={20} />
                            </div>
                            <div className="flex-grow">
                               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Split Payment Invitation</p>
                               <p className="text-sm font-bold text-turf-dark leading-tight">
                                 {inv.booking.customer.name || "A friend"} invited you to join a game at <span className="text-turf-green">{inv.booking.turf.name}</span>.
                               </p>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-4 rounded-2xl">
                            <div className="flex items-center gap-2">
                               <Calendar size={12} className="text-muted-foreground" />
                               <span className="text-[10px] font-bold text-turf-dark">{new Date(inv.booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <Clock size={12} className="text-muted-foreground" />
                               <span className="text-[10px] font-bold text-turf-dark">{inv.booking.startTime}</span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between">
                            <div>
                               <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">Your Share</p>
                               <p className="text-xl font-black text-turf-dark">₹{inv.amount}</p>
                            </div>
                            <button 
                                onClick={() => handlePay(inv.id)}
                                disabled={processingId === inv.id}
                                className="px-6 py-2.5 bg-turf-green text-white text-xs font-black rounded-xl hover:bg-turf-lime hover:text-turf-dark transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {processingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : "Pay Now"}
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-muted-foreground px-10">
                    <p className="font-bold mb-1">All clear!</p>
                    <p className="text-xs">No pending split invitations found.</p>
                  </div>
                )}
             </div>
          </div>
        </>
      )}
    </div>
  );
}
