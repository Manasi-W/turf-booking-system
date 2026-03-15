"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Trophy, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-black text-turf-dark tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to book your next match
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 animate-shake">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-semibold text-turf-dark block mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-sm font-semibold text-turf-dark">Password</label>
                <Link href="#" className="text-xs font-medium text-turf-green hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full justify-center rounded-2xl bg-turf-green py-4 text-sm font-bold text-white shadow-lg shadow-turf-green/20 hover:bg-turf-dark transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-turf-green hover:underline">
              Sign up for free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
