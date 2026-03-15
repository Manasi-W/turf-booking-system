"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ApprovalActions({ turfId }: { turfId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(approve: boolean) {
    if (!approve && !confirm("Are you sure you want to reject and remove this listing?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/turfs/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turfId, approve }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to perform action");
      }
    } catch (err) {
      console.error("Approval Action Error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => handleAction(true)}
        disabled={loading}
        className="h-10 w-10 flex items-center justify-center bg-turf-green text-white rounded-xl hover:bg-turf-dark transition-all disabled:opacity-50 shadow-lg shadow-turf-green/20"
        title="Approve"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
      </button>
      <button 
        onClick={() => handleAction(false)}
        disabled={loading}
        className="h-10 w-10 flex items-center justify-center bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
        title="Reject"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <X size={18} />}
      </button>
    </div>
  );
}
