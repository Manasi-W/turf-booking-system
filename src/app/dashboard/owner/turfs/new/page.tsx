"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, MapPin, IndianRupee, Tag, Info } from "lucide-react";
import Link from "next/link";

export default function NewTurfPage() {
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
      images: "https://images.unsplash.com/photo-1551958219-acbc608c6377", // Placeholder for now
    };

    try {
      const res = await fetch("/api/turfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create turf");

      router.push("/dashboard/owner/turfs");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard/owner/turfs" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-turf-green mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to My Turfs
      </Link>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-turf-dark mb-1">List New Turf</h1>
            <p className="text-muted-foreground text-sm font-medium">Provide details about your sports facility.</p>
          </div>
          <div className="h-14 w-14 bg-turf-green/10 text-turf-green rounded-2xl flex items-center justify-center">
            <Tag size={28} />
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-10 space-y-8">
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
                required 
                placeholder="Golden Jubilee Sports Arena" 
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
                  required 
                  placeholder="Street name, City" 
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
                  required 
                  placeholder="1200" 
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
              placeholder="Tell players about your turf, facilities, and rules..." 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
            ></textarea>
          </div>

          <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 flex flex-col items-center justify-center text-center group hover:border-turf-green/30 transition-all">
             <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-turf-green" size={24} />
             </div>
             <p className="font-bold text-turf-dark mb-1">Upload Images</p>
             <p className="text-xs text-muted-foreground max-w-[200px]">Drag and drop or click to browse photos of your turf.</p>
          </div>

          <div className="bg-turf-green/5 border border-turf-green/10 p-6 rounded-2xl flex gap-4">
             <Info className="text-turf-green shrink-0" size={20} />
             <p className="text-xs text-turf-dark/70 leading-relaxed font-medium">
                By listing your turf, you agree to our terms of service for hosts. Every booking will be subject to a 5% platform service fee.
             </p>
          </div>

          <div className="flex gap-4 pt-4">
             <Link href="/dashboard/owner/turfs" className="flex-1 py-4 text-center font-bold text-muted-foreground hover:text-turf-dark">Cancel</Link>
             <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-4 bg-turf-green text-white font-black rounded-2xl shadow-xl shadow-turf-green/20 hover:bg-turf-dark transition-all transform hover:-translate-y-1 disabled:opacity-70 flex items-center justify-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Publish Listing"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
