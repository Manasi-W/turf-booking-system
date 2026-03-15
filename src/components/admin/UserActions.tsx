"use client";

import { useState } from "react";
import { Shield, ShieldAlert, UserCheck, UserX } from "lucide-react";

interface UserActionsProps {
  userId: string;
  initialRole: string;
  initialActive: boolean;
}

export default function UserActions({ userId, initialRole, initialActive }: UserActionsProps) {
  const [active, setActive] = useState(initialActive);
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId, active: !active }),
      });
      if (res.ok) setActive(!active);
    } catch (error) {
      console.error("Status Toggle Error:", error);
    }
    setLoading(false);
  };

  const changeRole = async (newRole: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) setRole(newRole);
    } catch (error) {
      console.error("Role Change Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
        <button
          onClick={() => changeRole("CUSTOMER")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            role === "CUSTOMER" ? "bg-white text-turf-green shadow-sm" : "text-muted-foreground hover:bg-white/50"
          }`}
          disabled={loading}
        >
          Player
        </button>
        <button
          onClick={() => changeRole("TURF_OWNER")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            role === "TURF_OWNER" ? "bg-white text-amber-600 shadow-sm" : "text-muted-foreground hover:bg-white/50"
          }`}
          disabled={loading}
        >
          Owner
        </button>
      </div>

      <button
        onClick={toggleStatus}
        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${
          active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"
        }`}
        disabled={loading}
        title={active ? "Ban User" : "Unban User"}
      >
        {active ? <UserCheck size={18} /> : <UserX size={18} />}
      </button>
    </div>
  );
}
