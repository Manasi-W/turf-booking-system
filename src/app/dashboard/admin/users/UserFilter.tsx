"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface UserFilterProps {
  currentRole: string;
}

export default function UserFilter({ currentRole }: UserFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (role) {
      params.set("role", role);
    } else {
      params.delete("role");
    }
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  return (
    <select 
      className="px-4 py-3 bg-white rounded-2xl border border-gray-100 focus:ring-2 focus:ring-turf-green/20 outline-none font-bold text-sm shadow-sm"
      defaultValue={currentRole}
      onChange={(e) => handleRoleChange(e.target.value)}
    >
      <option value="">All Roles</option>
      <option value="CUSTOMER">Customers</option>
      <option value="TURF_OWNER">Owners</option>
      <option value="SUPER_ADMIN">Admins</option>
    </select>
  );
}
