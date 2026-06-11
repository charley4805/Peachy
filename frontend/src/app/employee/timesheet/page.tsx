"use client";

import { useEffect, useState } from "react";

type WeekEntry = {
  id: string;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  hours: number;
  job_name: string | null;
  flagged: boolean;
};

type Week = {
  period_start: string;
  period_end: string;
  total_hours: number;
  status: string;
  entries: WeekEntry[];
};

const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-50 text-blue-600",
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  locked: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  open: "In progress",
  pending: "Awaiting approval",
  approved: "Approved",
  locked: "Locked",
};

function fmtDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fmtTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TimesheetPage() {
  const [weeks, setWeeks] = useState<Week[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/timesheets?weeks=8")
      .then((r) => (r.ok ? r.json() : []))
      .then(setWeeks);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timesheet</h1>
        <p className="text-sm text-gray-500 mt-1">Hours worked, by week</p>
      </div>

      {weeks === null ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : (
        <div className="space-y-2">
          {weeks.map((w) => {
            const isOpen = expanded === w.period_start;
            return (
              <div
                key={w.period_start}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : w.period_start)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {fmtDate(w.period_start)} – {fmtDate(w.period_end)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {w.entries.length} {w.entries.length === 1 ? "entry" : "entries"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_BADGE[w.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABEL[w.status] ?? w.status}
                    </span>
                    <span className="text-lg font-bold text-gray-900 tabular-nums">
                      {w.total_hours}
                      <span className="text-xs font-medium text-gray-400 ml-0.5">h</span>
                    </span>
                    <span className="text-gray-300">{isOpen ? "▾" : "▸"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-50 px-5 py-3">
                    {w.entries.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">
                        No time entries this week.
                      </p>
                    ) : (
                      w.entries.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <div className="min-w-0">
                            <div className="text-sm text-gray-800">
                              {new Date(e.clock_in).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                              {e.flagged && (
                                <span
                                  className="ml-2 text-xs text-yellow-600"
                                  title="Flagged for review"
                                >
                                  ⚑
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {fmtTime(e.clock_in)} –{" "}
                              {e.clock_out ? fmtTime(e.clock_out) : "in progress"}
                              {e.break_minutes > 0 && ` · ${e.break_minutes}m break`}
                              {e.job_name && ` · ${e.job_name}`}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 tabular-nums flex-shrink-0">
                            {e.clock_out ? `${e.hours}h` : "—"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
