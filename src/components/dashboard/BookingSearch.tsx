"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function BookingSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("query", value);
    } else {
      params.delete("query");
    }
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <div className="relative flex-grow max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
      <input 
        type="text" 
        placeholder="Search by ID or customer..."
        defaultValue={searchParams.get("query") || ""}
        onChange={handleSearch}
        disabled={isPending}
        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-turf-green/20 outline-none text-sm transition-all shadow-sm"
      />
    </div>
  );
}
