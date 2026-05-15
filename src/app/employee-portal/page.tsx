"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function EmployeePortalPage() {
  const [badgeId, setBadgeId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"login" | "dashboard">("login");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!badgeId || pin.length < 4) {
      setError("Enter your Badge ID and 4-digit PIN.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView("dashboard");
    }, 600);
  }

  if (view === "dashboard") {
    return <EmployeeDashboard badgeId={badgeId} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <Image src="/hourglass.png" alt="GlassHour" width={40} height={40} />
            <span className="text-2xl font-bold text-gray-900">GlassHour</span>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••"
                maxLength={6}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 tracking-widest text-center text-xl"
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
              No email required · English / Español
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-orange-500 hover:text-orange-600">
            Manager or admin? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard({ badgeId }: { badgeId: string }) {
  const [clockedIn, setClockedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);

  function handlePunch() {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (!clockedIn) {
      setPunchTime(now);
      setClockedIn(true);
    } else {
      setClockedIn(false);
      setPunchTime(null);
    }
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Image src="/hourglass.png" alt="GlassHour" width={28} height={28} />
            <span className="font-bold text-gray-900">GlassHour</span>
          </div>
          <span className="text-sm text-gray-500 font-mono">{badgeId}</span>
        </div>

        {/* Punch Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="text-center">
            <div
              className={`inline-flex h-5 w-5 rounded-full mb-3 ${
                clockedIn ? "bg-green-400" : "bg-gray-200"
              }`}
            />
            <p className="text-sm text-gray-500 mb-1">
              {clockedIn ? "Currently clocked in" : "Not clocked in"}
            </p>
            {punchTime && (
              <p className="text-xs text-gray-400">Since {punchTime}</p>
            )}
            <div className="mt-1 text-xs text-gray-400">
              Job: Riverside Complex — Phase 2
            </div>
            <button
              onClick={handlePunch}
              className={`mt-6 w-full rounded-xl py-4 text-base font-bold transition-colors ${
                clockedIn
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {clockedIn ? "Clock Out" : "Clock In"}
            </button>
            <button className="mt-3 w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Start Break
            </button>
          </div>
        </div>

        {/* This week */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">This Pay Period</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">38.5</div>
              <div className="text-xs text-gray-400 mt-1">Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-400 mt-1">OT Hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-gray-400 mt-1">PTO Days Left</div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Upcoming Shifts</h3>
          {[
            { day: "Thu, May 14", time: "7:00 AM – 3:30 PM", job: "Riverside Complex" },
            { day: "Fri, May 15", time: "7:00 AM – 3:30 PM", job: "Riverside Complex" },
            { day: "Mon, May 18", time: "7:00 AM – 3:30 PM", job: "Harbor View – Phase 1" },
          ].map((s) => (
            <div
              key={s.day}
              className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-gray-800">{s.day}</div>
                <div className="text-xs text-gray-400">{s.job}</div>
              </div>
              <div className="text-xs text-gray-500">{s.time}</div>
            </div>
          ))}
        </div>

        {/* PTO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Request Time Off</h3>
            <button className="text-xs text-orange-500 font-medium">+ New Request</button>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            No pending requests.
          </div>
        </div>
      </div>
    </div>
  );
}
