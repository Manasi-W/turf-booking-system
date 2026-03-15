"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, IndianRupee, Loader2 } from "lucide-react";

export default function AddTurfForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      location: formData.get("location"),
      pricePerHour: parseFloat(formData.get("pricePerHour") as string),
      sportType: formData.get("sportType"),
      description: formData.get("description"),
      images: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200", // Default image for now
    };

    try {
      const res = await fetch("/api/turfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create turf");
      }

      router.push("/dashboard/owner/turfs");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Turf Name</label>
          <input 
            name="name" 
            placeholder="e.g. Wembley Arena"
            required 
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Sport Type</label>
          <select 
            name="sportType" 
            required 
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all appearance-none"
          >
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Badminton">Badminton</option>
            <option value="Tennis">Tennis</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              name="location" 
              placeholder="e.g. Andheri East, Mumbai"
              required 
              className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-turf-dark ml-1">Price Per Hour (₹)</label>
          <div className="relative">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              name="pricePerHour" 
              type="number" 
              placeholder="e.g. 1200"
              required 
              className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-turf-dark ml-1">Description</label>
        <textarea 
          name="description" 
          rows={4} 
          placeholder="Describe your ground, amenities, rules, etc."
          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
        ></textarea>
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-turf-green text-white font-black rounded-2xl shadow-xl shadow-turf-green/20 hover:bg-turf-dark transition-all transform hover:-translate-y-1 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Turf"}
        </button>
      </div>
    </form>
  );
}
