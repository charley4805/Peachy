"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  type: string;
  notes: string | null;
  job:
    | { name: string; customer: string; color: string }
    | { name: string; customer: string; color: string }[]
    | null;
};

const TYPE_BADGE: Record<string, string> = {
  Shift: "bg-blue-50 text-blue-700",
  PTO: "bg-purple-50 text-purple-700",
  Vacation: "bg-teal-50 text-teal-700",
  Holiday: "bg-pink-50 text-pink-700",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

function fmtShortTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "p" : "a";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")}${suffix}` : `${hour12}${suffix}`;
}

/** Day-detail card shared by both views. */
function DayEntries({ entries }: { entries: Entry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((e) => {
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
                {e.notes && <div className="text-xs text-gray-400 truncate">{e.notes}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {e.start_time ? `${fmtTime(e.start_time)} – ${fmtTime(e.end_time)}` : "All day"}
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
  );
}

export default function EmployeeSchedulePage() {
  const [view, setView] = useState<"month" | "week">("month");
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(iso(new Date()));

  const todayStr = iso(new Date());

  // Visible range depends on the view (month grid includes leading/trailing days)
  const rangeStart =
    view === "week" ? weekStart : mondayOf(new Date(monthAnchor));
  const rangeEnd =
    view === "week"
      ? new Date(weekStart.getTime() + 6 * 86400000)
      : (() => {
          const lastOfMonth = new Date(
            monthAnchor.getFullYear(),
            monthAnchor.getMonth() + 1,
            0
          );
          const start = mondayOf(new Date(lastOfMonth));
          return new Date(start.getTime() + 6 * 86400000);
        })();

  const rangeStartIso = iso(rangeStart);
  const rangeEndIso = iso(rangeEnd);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/me/schedule?start=${rangeStartIso}&end=${rangeEndIso}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setEntries(data);
      });
    return () => {
      cancelled = true;
    };
  }, [rangeStartIso, rangeEndIso]);

  const byDay = new Map<string, Entry[]>();
  for (const e of entries ?? []) {
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  }

  function goToday() {
    const now = new Date();
    setWeekStart(mondayOf(now));
    setMonthAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(iso(now));
  }

  function navigate(delta: number) {
    if (view === "week") {
      setWeekStart((w) => new Date(w.getTime() + delta * 7 * 86400000));
    } else {
      setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    }
  }

  const headerLabel =
    view === "week"
      ? `${rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(
          weekStart.getTime() + 6 * 86400000
        ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : monthAnchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Month grid cells
  const monthCells: { date: Date; iso: string; inMonth: boolean }[] = [];
  if (view === "month") {
    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
      monthCells.push({
        date: new Date(cursor),
        iso: iso(cursor),
        inMonth: cursor.getMonth() === monthAnchor.getMonth(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 86400000);
    return { date: d, iso: iso(d) };
  });

  const selectedEntries = byDay.get(selectedDay) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  view === v ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={goToday}
            className="text-xs text-orange-500 font-medium hover:text-orange-600"
          >
            Today
          </button>
        </div>
      </div>

      {/* Period navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="h-8 w-8 rounded-lg hover:bg-gray-50 text-gray-500 font-bold"
          aria-label="Previous"
        >
          ←
        </button>
        <div className="text-sm font-semibold text-gray-800">{headerLabel}</div>
        <button
          onClick={() => navigate(1)}
          className="h-8 w-8 rounded-lg hover:bg-gray-50 text-gray-500 font-bold"
          aria-label="Next"
        >
          →
        </button>
      </div>

      {view === "month" ? (
        <>
          {/* Calendar grid */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthCells.map((cell) => {
                const cellEntries = byDay.get(cell.iso) ?? [];
                const isToday = cell.iso === todayStr;
                const isSelected = cell.iso === selectedDay;
                return (
                  <button
                    key={cell.iso}
                    onClick={() => setSelectedDay(cell.iso)}
                    className={`min-h-16 md:min-h-20 border-b border-r border-gray-50 p-1 text-left align-top transition-colors ${
                      isSelected ? "bg-orange-50" : "hover:bg-gray-50"
                    } ${cell.inMonth ? "" : "bg-gray-50/50"}`}
                  >
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                        isToday
                          ? "bg-orange-500 text-white"
                          : cell.inMonth
                          ? "text-gray-700"
                          : "text-gray-300"
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {cellEntries.slice(0, 2).map((e) => {
                        const job = jobOf(e.job);
                        return (
                          <div
                            key={e.id}
                            className="truncate rounded px-1 py-0.5 text-[9px] md:text-[10px] font-medium text-white"
                            style={{
                              backgroundColor:
                                e.type !== "Shift" ? "#a855f7" : job?.color ?? "#9ca3af",
                            }}
                          >
                            {e.start_time ? `${fmtShortTime(e.start_time)} ` : ""}
                            {e.type !== "Shift" ? e.type : job?.name ?? "Shift"}
                          </div>
                        );
                      })}
                      {cellEntries.length > 2 && (
                        <div className="text-[9px] text-gray-400 px-1">
                          +{cellEntries.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-800">
                {new Date(`${selectedDay}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {selectedDay === todayStr && (
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 uppercase">
                  Today
                </span>
              )}
            </div>
            {entries === null ? (
              <p className="text-xs text-gray-300">Loading…</p>
            ) : selectedEntries.length === 0 ? (
              <p className="text-xs text-gray-300">Nothing scheduled this day.</p>
            ) : (
              <DayEntries entries={selectedEntries} />
            )}
          </div>
        </>
      ) : (
        /* Week list view */
        <div className="space-y-2">
          {weekDays.map(({ date, iso: dayIso }) => {
            const dayEntries = byDay.get(dayIso) ?? [];
            const isToday = dayIso === todayStr;
            return (
              <div
                key={dayIso}
                className={`bg-white rounded-2xl border p-4 ${
                  isToday ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      isToday ? "text-orange-600" : "text-gray-800"
                    }`}
                  >
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
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
                  <div className="mt-2">
                    <DayEntries entries={dayEntries} />
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
