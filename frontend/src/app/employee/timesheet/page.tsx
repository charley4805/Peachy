"use client";

import { useEffect, useState } from "react";

type DayEntry = {
  id: string;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  hours: number;
  job_name: string | null;
  flagged: boolean;
};

type DayRow = {
  date: string;
  hours: number;
  entries: DayEntry[];
};

type Timesheet = {
  period_start: string;
  period_end: string;
  days: DayRow[];
  total_hours: number;
};

type Period = "weekly" | "biweekly" | "monthly";

const PERIOD_LABEL: Record<Period, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
};

function mondayOf(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

/** Current period range for the given type and offset (0 = current). */
function rangeFor(period: Period, offset: number): { start: Date; end: Date } {
  const now = new Date();
  if (period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    return { start, end };
  }
  const span = period === "weekly" ? 7 : 14;
  const start = addDays(mondayOf(now), offset * span);
  return { start, end: addDays(start, span - 1) };
}

function fmtDay(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
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
  const [period, setPeriod] = useState<Period>("weekly");
  const [offset, setOffset] = useState(0);
  const [sheet, setSheet] = useState<Timesheet | null>(null);

  const { start, end } = rangeFor(period, offset);
  const startIso = iso(start);
  const endIso = iso(end);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/me/timesheets?start=${startIso}&end=${endIso}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setSheet(data);
      });
    return () => {
      cancelled = true;
    };
  }, [startIso, endIso]);

  const headerLabel =
    period === "monthly"
      ? start.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timesheet</h1>
        <p className="text-sm text-gray-500 mt-1">Days worked and total hours</p>
      </div>

      {/* Period type selector */}
      <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
        {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              setPeriod(p);
              setOffset(0);
            }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              period === p
                ? "bg-orange-500 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      {/* Period navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="h-8 w-8 rounded-lg hover:bg-gray-50 text-gray-500 font-bold"
          aria-label="Previous period"
        >
          ←
        </button>
        <div className="text-sm font-semibold text-gray-800">
          {headerLabel}
          {offset === 0 && (
            <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 uppercase">
              Current
            </span>
          )}
        </div>
        <button
          onClick={() => setOffset((o) => o + 1)}
          disabled={offset >= 0}
          className="h-8 w-8 rounded-lg hover:bg-gray-50 text-gray-500 font-bold disabled:opacity-30"
          aria-label="Next period"
        >
          →
        </button>
      </div>

      {/* Day rows */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {sheet === null ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
        ) : sheet.days.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No days worked in this period.
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 border-b border-gray-100 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <div className="col-span-3">Day</div>
              <div className="col-span-4">Times</div>
              <div className="col-span-3">Job</div>
              <div className="col-span-2 text-right">Hours</div>
            </div>

            {sheet.days.map((day) => (
              <div
                key={day.date}
                className="border-b border-gray-50 px-5 py-3.5 md:grid md:grid-cols-12 md:items-start"
              >
                <div className="col-span-3 flex items-center justify-between md:block">
                  <span className="text-sm font-semibold text-gray-800">
                    {fmtDay(day.date)}
                  </span>
                  {/* Mobile: hours on the same line */}
                  <span className="md:hidden text-sm font-bold text-gray-900 tabular-nums">
                    {day.hours}h
                  </span>
                </div>

                <div className="col-span-4 mt-1 md:mt-0 space-y-0.5">
                  {day.entries.map((e) => (
                    <div key={e.id} className="text-xs text-gray-500">
                      {fmtTime(e.clock_in)} –{" "}
                      {e.clock_out ? fmtTime(e.clock_out) : "in progress"}
                      {e.break_minutes > 0 && (
                        <span className="text-gray-400"> · {e.break_minutes}m break</span>
                      )}
                      {e.flagged && (
                        <span className="ml-1 text-yellow-600" title="Flagged for review">
                          ⚑
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="col-span-3 mt-0.5 md:mt-0 space-y-0.5">
                  {day.entries.map((e) => (
                    <div key={e.id} className="text-xs text-gray-500 truncate">
                      {e.job_name ?? "General"}
                    </div>
                  ))}
                </div>

                <div className="hidden md:block col-span-2 text-right text-sm font-semibold text-gray-800 tabular-nums">
                  {day.hours}h
                </div>
              </div>
            ))}

            {/* Total row */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
              <span className="text-sm font-semibold text-gray-600">
                Total · {sheet.days.length} {sheet.days.length === 1 ? "day" : "days"}{" "}
                worked
              </span>
              <span className="text-xl font-bold text-gray-900 tabular-nums">
                {sheet.total_hours}
                <span className="text-sm font-medium text-gray-400 ml-1">hours</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
