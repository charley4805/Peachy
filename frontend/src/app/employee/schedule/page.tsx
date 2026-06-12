"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  type: string;
  notes: string | null;
  job: { name: string; customer: string; color: string } | { name: string; customer: string; color: string }[] | null;
};

const TYPE_BADGE: Record<string, string> = {
  Shift: "bg-blue-50 text-blue-700",
  PTO: "bg-purple-50 text-purple-700",
  Vacation: "bg-teal-50 text-teal-700",
  Holiday: "bg-pink-50 text-pink-700",
};

function jobOf(j: Entry["job"]) {
  return Array.isArray(j) ? j[0] ?? null : j;
}

function mondayOf(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function EmployeeSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [entries, setEntries] = useState<Entry[] | null>(null);

  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  const todayIso = iso(new Date());

  useEffect(() => {
    let cancelled = false;
    const end = new Date(weekStart.getTime() + 6 * 86400000);
    fetch(`/api/me/schedule?start=${iso(weekStart)}&end=${iso(end)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setEntries(data);
      });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 86400000);
    return { date: d, iso: iso(d) };
  });

  const byDay = new Map<string, Entry[]>();
  for (const e of entries ?? []) {
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  }

  function shiftWeek(delta: number) {
    setWeekStart((w) => new Date(w.getTime() + delta * 7 * 86400000));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <button
          onClick={() => setWeekStart(mondayOf(new Date()))}
          className="text-xs text-orange-500 font-medium hover:text-orange-600"
        >
          Today
        </button>
      </div>

      {/* Week navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => shiftWeek(-1)}
          className="h-8 w-8 rounded-lg hover:bg-gray-50 text-gray-500 font-bold"
          aria-label="Previous week"
        >
          ←
        </button>
        <div className="text-sm font-semibold text-gray-800">
          {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
          {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <button
          onClick={() => shiftWeek(1)}
          className="h-8 w-8 rounded-lg hover:bg-gray-50 text-gray-500 font-bold"
          aria-label="Next week"
        >
          →
        </button>
      </div>

      {/* Days */}
      <div className="space-y-2">
        {days.map(({ date, iso: dayIso }) => {
          const dayEntries = byDay.get(dayIso) ?? [];
          const isToday = dayIso === todayIso;
          return (
            <div
              key={dayIso}
              className={`bg-white rounded-2xl border p-4 ${
                isToday ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${isToday ? "text-orange-600" : "text-gray-800"}`}>
                  {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
                {isToday && (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 uppercase">
                    Today
                  </span>
                )}
              </div>

              {entries === null ? (
                <p className="text-xs text-gray-300">Loading…</p>
              ) : dayEntries.length === 0 ? (
                <p className="text-xs text-gray-300">No shifts</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {dayEntries.map((e) => {
                    const job = jobOf(e.job);
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: job?.color ?? "#d1d5db" }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {e.type !== "Shift" ? e.type : job?.name ?? "General"}
                            </div>
                            {e.notes && (
                              <div className="text-xs text-gray-400 truncate">{e.notes}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {e.start_time
                              ? `${fmtTime(e.start_time)} – ${fmtTime(e.end_time)}`
                              : "All day"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              TYPE_BADGE[e.type] ?? "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {e.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
