"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface FilterTab {
  label: string;
  value: string;
}

export default function BookingFilter({ currentFilter }: { currentFilter: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const tabs: FilterTab[] = [
    { label: "All", value: "all" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Completed", value: "completed" },
  ];

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleFilterChange(tab.value)}
          disabled={isPending}
          className={cn(
            "px-6 py-2.5 text-xs font-bold rounded-xl transition-all",
            currentFilter === tab.value
              ? "bg-turf-green text-white shadow-md shadow-turf-green/20"
              : "text-muted-foreground hover:text-turf-dark"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
