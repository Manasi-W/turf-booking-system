"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function RevenueFilter({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const periods = [
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ];

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("period", value);
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => handlePeriodChange(period.value)}
          disabled={isPending}
          className={cn(
            "px-6 py-2.5 text-xs font-bold rounded-xl transition-all",
            currentPeriod === period.value
              ? "bg-turf-green text-white shadow-md shadow-turf-green/20"
              : "text-muted-foreground hover:text-turf-dark"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
