"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [role, setRole] = useState<"CUSTOMER" | "TURF_OWNER">("CUSTOMER");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md p-10 bg-white rounded-[2rem] shadow-xl text-center space-y-6 animate-fade-in">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-turf-dark">Registration Successful!</h2>
          <p className="text-muted-foreground">Redirecting you to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-turf-green text-white shadow-lg shadow-turf-green/20">
              <Trophy size={28} />
            </div>
            <span className="text-2xl font-bold text-turf-dark">
              Turf<span className="text-turf-green">ivo</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black text-turf-dark tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the community and start playing
          </p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
              role === "CUSTOMER" ? "bg-white text-turf-green shadow-sm" : "text-muted-foreground hover:text-turf-dark"
            )}
          >
            Player
          </button>
          <button
            type="button"
            onClick={() => setRole("TURF_OWNER")}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold rounded-xl transition-all",
              role === "TURF_OWNER" ? "bg-white text-turf-green shadow-sm" : "text-muted-foreground hover:text-turf-dark"
            )}
          >
            Turf Owner
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-semibold text-turf-dark block mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold text-turf-dark block mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold text-turf-dark block mb-1.5 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold text-turf-dark block mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full justify-center rounded-2xl bg-turf-green py-4 text-sm font-bold text-white shadow-lg shadow-turf-green/20 hover:bg-turf-dark transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
          </button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-turf-green hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
