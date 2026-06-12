"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeePortalPage() {
  const router = useRouter();
  const [badgeId, setBadgeId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!badgeId || pin.length < 4) {
      setError("Enter your Badge ID and 4-digit PIN.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge: badgeId, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid badge or PIN");
        setLoading(false);
        return;
      }
      // Session cookie is set — straight into the employee app
      router.push("/employee");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <Image src="/hourglass.png" alt="Daily" width={40} height={40} />
            <span className="text-2xl font-bold text-gray-900">Daily</span>
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Employee Self-Service Portal</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Sign in with your Badge ID
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Badge ID
              </label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                placeholder="e.g. EMP-1042"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 font-mono tracking-widest"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="••••"
                maxLength={8}
                inputMode="numeric"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 tracking-widest text-center text-xl"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              No email required · Ask your manager for a badge &amp; PIN
            </p>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Have an account?{" "}
            <Link href="/auth" className="text-orange-500 hover:text-orange-600 font-medium">
              Sign in with email
            </Link>
          </p>
          <Link href="/auth" className="block text-sm text-gray-400 hover:text-gray-500">
            Manager or admin? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
