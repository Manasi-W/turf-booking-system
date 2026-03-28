"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusToggleProps {
  turfId: string;
  initialStatus: boolean;
}

export default function StatusToggle({ turfId, initialStatus }: StatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);

  const toggleStatus = async () => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/admin/turfs/${turfId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isActive }),
      });

      if (res.ok) {
        setIsActive(!isActive);
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        isActive ? "text-turf-green" : "text-red-500"
      )}>
        {isActive ? "Active" : "Blocked"}
      </span>
      <button 
        onClick={toggleStatus}
        disabled={isPending}
        className={cn(
            "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
            isActive ? "bg-turf-green shadow-lg shadow-turf-green/20" : "bg-gray-200"
        )}
      >
        <div className={cn(
            "w-4 h-4 rounded-full transition-all flex items-center justify-center",
            isActive ? "ml-auto bg-white shadow-sm" : "bg-gray-400",
            isPending ? "opacity-50" : ""
        )}>
          {isPending && <Loader2 className="animate-spin text-current" size={10} />}
        </div>
      </button>
    </div>
  );
}
