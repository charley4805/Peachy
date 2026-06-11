"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useMe } from "./me-context";

type Job = { id: string; name: string; customer: string; color: string };

type Shift = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  type: string;
  notes: string | null;
  job: { name: string; color: string } | { name: string; color: string }[] | null;
};

type Summary = {
  active_entry: {
    id: string;
    clock_in: string;
    job_id: string | null;
    job: { name: string; color: string } | { name: string; color: string }[] | null;
  } | null;
  today_hours: number;
  week_hours: number;
  upcoming_shifts: Shift[];
  jobs: Job[];
  pending_pto: number;
};

function jobOf(j: Shift["job"]): { name: string; color: string } | null {
  return Array.isArray(j) ? j[0] ?? null : j;
}

function fmtTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function elapsed(since: string): string {
  const ms = Date.now() - new Date(since).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export default function EmployeeHomePage() {
  const { employee } = useMe();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [jobId, setJobId] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [, setTick] = useState(0);

  const load = useCallback(() => {
    return fetch("/api/me/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSummary(data);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live timer while clocked in
  useEffect(() => {
    if (!summary?.active_entry) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [summary?.active_entry]);

  async function clockIn() {
    setBusy(true);
    setError("");
    setWarning("");
    const pos = await getPosition();
    const res = await fetch("/api/me/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId || undefined, ...pos }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not clock in");
    } else if (data.geofence_warning) {
      setWarning(`Heads up: you appear to be ${data.geofence_warning}. Your entry was recorded and flagged for review.`);
    }
    await load();
    setBusy(false);
  }

  async function clockOut() {
    setBusy(true);
    setError("");
    setWarning("");
    const pos = await getPosition();
    const res = await fetch("/api/me/clock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ break_minutes: Number(breakMinutes) || 0, ...pos }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not clock out");
    }
    setBreakMinutes("0");
    await load();
    setBusy(false);
  }

  const active = summary?.active_entry ?? null;
  const activeJob = active ? jobOf(active.job) : null;
  const firstName = employee.name.split(" ")[0];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hi, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {warning && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-100 px-4 py-3 text-sm text-yellow-800">
          {warning}
        </div>
      )}

      {/* Punch card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {!summary ? (
          <div className="text-center text-sm text-gray-400 py-8">Loading…</div>
        ) : active ? (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 mb-3">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Clocked in
            </span>
            <div className="text-4xl font-bold text-gray-900 font-mono tabular-nums">
              {elapsed(active.clock_in)}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Since{" "}
              {new Date(active.clock_in).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
              {activeJob ? ` · ${activeJob.name}` : ""}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <label className="text-xs text-gray-500">
                Break (min)
                <input
                  type="number"
                  min={0}
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(e.target.value)}
                  className="ml-2 w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center focus:border-orange-400 focus:outline-none"
                />
              </label>
            </div>

            <button
              onClick={clockOut}
              disabled={busy}
              className="mt-4 w-full rounded-xl bg-red-500 py-4 text-base font-bold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {busy ? "Working on it…" : "Clock Out"}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 mb-4">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              Not clocked in
            </span>

            {summary.jobs.length > 0 && (
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-orange-400 focus:outline-none mb-1"
              >
                <option value="">No job / general work</option>
                {summary.jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name} — {j.customer}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={clockIn}
              disabled={busy}
              className="mt-3 w-full rounded-xl bg-green-500 py-4 text-base font-bold text-white hover:bg-green-600 disabled:opacity-60 transition-colors"
            >
              {busy ? "Working on it…" : "Clock In"}
            </button>
            <p className="mt-2 text-xs text-gray-400">
              Your location is captured at punch for job-site verification.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">This Week</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {summary?.today_hours ?? "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Hours Today</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {summary?.week_hours ?? "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Hours This Week</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {summary?.pending_pto ?? "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Pending Requests</div>
          </div>
        </div>
      </div>

      {/* Upcoming shifts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Upcoming Shifts</h3>
          <Link
            href="/employee/schedule"
            className="text-xs text-orange-500 font-medium hover:text-orange-600"
          >
            Full schedule →
          </Link>
        </div>
        {!summary || summary.upcoming_shifts.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing scheduled in the next 7 days.</p>
        ) : (
          summary.upcoming_shifts.slice(0, 5).map((s) => {
            const job = jobOf(s.job);
            return (
              <div
                key={s.id}
                className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: job?.color ?? "#d1d5db" }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">
                      {fmtDate(s.date)}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {s.type !== "Shift" ? s.type : job?.name ?? "General"}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {s.start_time
                    ? `${fmtTime(s.start_time)} – ${fmtTime(s.end_time)}`
                    : "All day"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
