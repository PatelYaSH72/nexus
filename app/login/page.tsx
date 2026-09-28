"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { loginApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginApi({
        email: email.trim(),
        password,
      });

      // On successful login and token cookie set, redirect to "/"
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex flex-col justify-center items-center px-4 py-12">
      {/* Container */}
      <div className="w-full max-w-md">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="w-9 h-9 rounded-xl bg-[#B7D96B] flex items-center justify-center transition-transform group-hover:scale-105">
              <Zap size={18} style={{ color: "#0D110B" }} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">
              Nexus
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Log in to access your Nexus workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#12160F]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B7D96B] focus:ring-1 focus:ring-[#B7D96B] transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#B7D96B] focus:ring-1 focus:ring-[#B7D96B] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#B7D96B] hover:bg-[#9BC24F] disabled:opacity-60 text-[#0D110B] font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#B7D96B]/10 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#B7D96B] font-medium hover:underline transition-all"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
