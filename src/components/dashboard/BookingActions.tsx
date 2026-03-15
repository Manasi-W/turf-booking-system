"use client";

import { useState } from "react";
import { MoreVertical, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BookingActions({ 
  bookingId, 
  currentStatus, 
  bookingDate, 
  startTime 
}: { 
  bookingId: string, 
  currentStatus: string,
  bookingDate: Date,
  startTime: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Construct full booking start time
  const bookingStart = new Date(bookingDate);
  const [hours, minutes] = (startTime || "00:00").split(':').map(Number);
  bookingStart.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const isPast = now > bookingStart;

  const handleUpdateStatus = async (status: string) => {
    if (isPast && status === "CANCELLED") return; // Extra safety
    
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => !isPast && setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-lg shadow-sm transition-all border",
          isPast 
            ? "text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed" 
            : "text-muted-foreground hover:bg-white border-transparent hover:border-gray-100"
        )}
        title={isPast ? "Actions locked for past bookings" : "Modify Booking"}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <MoreVertical size={18} />}
      </button>

      {isOpen && !isPast && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => handleUpdateStatus("PAID")}
              disabled={currentStatus === "PAID" || currentStatus === "CANCELLED"}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-sm font-bold transition-colors text-left",
                currentStatus === "CANCELLED" ? "text-gray-400 cursor-not-allowed" : "text-turf-green hover:bg-gray-50"
              )}
            >
              <CheckCircle2 size={16} /> 
              {currentStatus === "CANCELLED" ? "Booking Cancelled" : "Mark as Paid"}
            </button>
            <button
              onClick={() => handleUpdateStatus("CANCELLED")}
              disabled={currentStatus === "CANCELLED"}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 text-left"
            >
              <XCircle size={16} /> Cancel Booking
            </button>
            <div className="mx-2 mt-2 px-2 py-1.5 bg-gray-50 rounded-lg flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
               <Info size={12} />
               <span>Status updates are final.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
