"use client";

import { useState } from "react";
import { Loader2, UserX, UserCheck, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  initialStatus: boolean;
}

export default function UserActions({ userId, initialStatus }: UserActionsProps) {
  const [isActive, setIsActive] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isActive }),
      });

      if (res.ok) {
        setIsActive(!isActive);
        router.refresh();
      }
    } catch (error) {
      console.error("User status update error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={toggleStatus}
        disabled={isPending}
        title={isActive ? "Disable User" : "Enable User"}
        className={cn(
          "p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest",
          isActive 
            ? "text-red-500 hover:bg-red-50" 
            : "text-turf-green hover:bg-turf-green/5"
        )}
      >
        {isPending ? (
          <Loader2 className="animate-spin" size={16} />
        ) : isActive ? (
          <>
            <UserX size={16} />
            Disable Account
          </>
        ) : (
          <>
            <UserCheck size={16} />
            Enable Account
          </>
        )}
      </button>
    </div>
  );
}
