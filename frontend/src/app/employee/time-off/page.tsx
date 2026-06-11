"use client";

import { useCallback, useEffect, useState } from "react";

type PtoRequest = {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  hours: number | null;
  status: "pending" | "approved" | "denied";
  notes: string | null;
  manager_notes: string | null;
  created_at: string;
};

type Balance = {
  allowance_hours: number;
  used_hours: number;
  pending_hours: number;
};

const TYPES = ["PTO", "Vacation", "Sick", "Holiday"];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  denied: "bg-red-50 text-red-600",
};

function fmtDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function weekdaysBetween(start: string, end: string): number {
  let count = 0;
  const d = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  while (d <= last) {
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

export default function TimeOffPage() {
  const [requests, setRequests] = useState<PtoRequest[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState("PTO");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hours, setHours] = useState("");
  const [hoursTouched, setHoursTouched] = useState(false);
  const [notes, setNotes] = useState("");

  const load = useCallback(() => {
    return fetch("/api/me/pto")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setRequests(data.requests);
          setBalance(data.balance);
        }
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Suggest 8h per weekday unless the user typed their own number
  function suggestHours(start: string, end: string) {
    if (hoursTouched || !start) return;
    const last = end || start;
    if (last < start) return;
    setHours(String(weekdaysBetween(start, last) * 8));
  }

  function openForm() {
    setType("PTO");
    setStartDate("");
    setEndDate("");
    setHours("");
    setHoursTouched(false);
    setNotes("");
    setError("");
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!startDate) {
      setError("Pick a start date.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/me/pto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        start_date: startDate,
        end_date: endDate || startDate,
        hours: Number(hours),
        notes: notes.trim() || undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not submit request");
      return;
    }
    setShowForm(false);
    await load();
  }

  const remaining = balance
    ? Math.max(0, balance.allowance_hours - balance.used_hours)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Time Off</h1>
        <button
          onClick={openForm}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + Request Off
        </button>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">This Year</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {balance ? balance.used_hours : "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Hours Used</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {balance ? balance.pending_hours : "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">Hours Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {balance && balance.allowance_hours > 0 ? remaining : "—"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {balance && balance.allowance_hours > 0 ? "Hours Left" : "No Allowance Set"}
            </div>
          </div>
        </div>
      </div>

      {/* Request form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Request Time Off</h2>
            </div>
            <form onSubmit={submit} className="overflow-y-auto px-6 py-5 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                        type === t
                          ? "bg-orange-500 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First day
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      suggestHours(e.target.value, endDate);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last day
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      suggestHours(startDate, e.target.value);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hours requested
                </label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    setHoursTouched(true);
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Note for your manager{" "}
                  <span className="text-xs text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {busy ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">My Requests</h3>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-400">
            No requests yet. Tap &ldquo;Request Off&rdquo; to submit one.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between rounded-xl bg-gray-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800">
                    {r.type} · {fmtDate(r.start_date)}
                    {r.end_date !== r.start_date && <> – {fmtDate(r.end_date)}</>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {r.hours ? `${r.hours} hours` : ""}
                    {r.notes ? ` · “${r.notes}”` : ""}
                  </div>
                  {r.manager_notes && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      Manager: {r.manager_notes}
                    </div>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize flex-shrink-0 ${
                    STATUS_BADGE[r.status] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
