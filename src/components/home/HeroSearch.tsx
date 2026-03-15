"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      router.push(`/explore?loc=${encodeURIComponent(location.trim())}`);
    } else {
      router.push("/explore");
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-12">
      <div className="flex-grow relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your location..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all shadow-sm text-turf-dark font-medium"
        />
      </div>
      <button
        type="submit"
        className="px-8 py-4 bg-turf-green text-white font-bold rounded-2xl shadow-xl shadow-turf-green/30 hover:bg-turf-dark transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
      >
        Search Turfs <ArrowRight size={20} />
      </button>
    </form>
  );
}
