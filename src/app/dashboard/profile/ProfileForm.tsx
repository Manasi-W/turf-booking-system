"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
    };

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-turf-green/10 border border-turf-green/20 text-turf-green rounded-2xl text-sm font-bold flex items-center gap-2">
          <CheckCircle2 size={18} /> Profile updated successfully!
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-turf-dark ml-1">Email Address</label>
        <input 
          type="email" 
          value={user.email} 
          disabled 
          className="w-full px-5 py-4 bg-gray-100 text-gray-500 border border-gray-200 rounded-2xl focus:outline-none cursor-not-allowed font-medium"
        />
        <p className="text-xs text-muted-foreground ml-1 font-medium">Your email address cannot be changed.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-turf-dark ml-1">Full Name</label>
        <input 
          name="name" 
          required 
          defaultValue={user.name || ""}
          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all font-medium text-turf-dark"
          placeholder="e.g. John Doe"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-turf-dark ml-1">Phone Number</label>
        <input 
          name="phone" 
          defaultValue={user.phone || ""}
          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all font-medium text-turf-dark"
          placeholder="e.g. +91 9876543210"
        />
      </div>

      <div className="pt-4 text-left">
        <button 
          type="submit" 
          disabled={loading}
          className="px-8 py-4 bg-turf-dark text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 transform hover:-translate-y-1"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
