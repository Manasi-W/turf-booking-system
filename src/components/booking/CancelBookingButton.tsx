"use client";

import { useState } from "react";
import { XCircle, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface CancelBookingButtonProps {
  bookingId: string;
  bookingStartTime: Date;
}

export default function CancelBookingButton({ bookingId, bookingStartTime }: CancelBookingButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    // Basic frontend check for the 4-hour window
    const now = new Date();
    const diffHours = (new Date(bookingStartTime).getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 4) {
      setError("Cannot cancel within 4 hours of the slot.");
      return;
    }

    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      router.refresh(); // Refresh to update status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col items-center md:items-end gap-2">
      <button
        onClick={handleCancel}
        disabled={isCancelling}
        className="flex items-center gap-2 px-6 py-2 border border-red-100 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
      >
        {isCancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
        Cancel Booking
      </button>
      {error && (
        <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg border border-red-100 animate-fade-in">
           <AlertCircle size={10} />
           {error}
        </div>
      )}
    </div>
  );
}
