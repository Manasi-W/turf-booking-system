"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedToggleProps {
  turfId: string;
  initialFeatured: boolean;
}

export default function FeaturedToggle({ turfId, initialFeatured }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [isPending, setIsPending] = useState(false);

  const toggleFeatured = async () => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/admin/turfs/${turfId}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (res.ok) {
        setIsFeatured(!isFeatured);
      }
    } catch (error) {
      console.error("Featured update error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <button 
        onClick={toggleFeatured}
        disabled={isPending}
        className={cn(
            "p-3 rounded-2xl transition-all flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50",
            isFeatured 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                : "bg-gray-100 text-gray-300 hover:bg-gray-200"
        )}
        title={isFeatured ? "Unmark as Featured" : "Mark as Featured"}
      >
        {isPending ? <Loader2 className="animate-spin" size={18} /> : <Star size={18} className={isFeatured ? "fill-current" : ""} />}
      </button>
    </div>
  );
}
