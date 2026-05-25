"use client";

import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

// Today = May 25, 2026 (verified Monday). This is the anchor for weekOffset=0.
const TODAY = new Date(2026, 4, 25); // month is 0-indexed

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EMPLOYEES = [
  "Marcus Rivera",
  "Deja Williams",
  "Tom Kowalski",
  "Anita Patel",
  "Carlos Mendoza",
  "Jordan Lee",
];

const JOBS = [
  "Riverside Complex",
  "Harbor View",
  "Office",
  "Metro Clinic Reno",
  "General",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryType = "Shift" | "PTO" | "Vacation" | "Holiday";
type ViewMode = "week" | "month";

type ScheduleEntry = {
  id: string;
  employee: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM (24h) — empty for full-day types
  end: string;   // HH:MM (24h) — empty for full-day types
  job: string;
  type: EntryType;
};

// ─── Color Maps ───────────────────────────────────────────────────────────────

const JOB_COLORS: Record<string, string> = {
  "Riverside Complex": "bg-blue-100 text-blue-800 border-blue-200",
  "Harbor View":       "bg-green-100 text-green-800 border-green-200",
  "Office":            "bg-purple-100 text-purple-800 border-purple-200",
  "Metro Clinic Reno": "bg-orange-100 text-orange-800 border-orange-200",
  "General":           "bg-gray-100 text-gray-700 border-gray-200",
};

const TYPE_COLORS: Record<EntryType, string> = {
  Shift:   "",  // derived from job
  PTO:     "bg-teal-100 text-teal-800 border-teal-200",
  Vacation:"bg-indigo-100 text-indigo-800 border-indigo-200",
  Holiday: "bg-rose-100 text-rose-800 border-rose-200",
};

// Dot colors for the month view
const JOB_DOT: Record<string, string> = {
  "Riverside Complex": "bg-blue-400",
  "Harbor View":       "bg-green-400",
  "Office":            "bg-purple-400",
  "Metro Clinic Reno": "bg-orange-400",
  "General":           "bg-gray-400",
};
const TYPE_DOT: Record<EntryType, string> = {
  Shift:   "",
  PTO:     "bg-teal-400",
  Vacation:"bg-indigo-400",
  Holiday: "bg-rose-400",
};

function entryColor(e: ScheduleEntry): string {
  return e.type !== "Shift" ? TYPE_COLORS[e.type] : (JOB_COLORS[e.job] ?? JOB_COLORS["General"]);
}

function entryDotColor(e: ScheduleEntry): string {
  return e.type !== "Shift" ? TYPE_DOT[e.type] : (JOB_DOT[e.job] ?? JOB_DOT["General"]);
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns the Monday of the week that is `weekOffset` weeks from TODAY's week. */
function getWeekStart(weekOffset: number): Date {
  return addDays(TODAY, weekOffset * 7);
}

/** Returns the 7 Date objects for the week at weekOffset. */
function getWeekDates(weekOffset: number): Date[] {
  const start = getWeekStart(weekOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Returns the weekOffset corresponding to the week containing `d`. */
function weekOffsetForDate(d: Date): number {
  const diff = Math.round((d.getTime() - TODAY.getTime()) / 86400000);
  return Math.floor(diff / 7);
}

/**
 * Returns a 2D array of Date objects for the calendar month containing `d`.
 * Each inner array is one week (Mon–Sun).
 */
function getMonthCalendar(d: Date): Date[][] {
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const dow = firstOfMonth.getDay(); // 0=Sun
  const daysBack = dow === 0 ? 6 : dow - 1;
  let cur = addDays(firstOfMonth, -daysBack);

  const weeks: Date[][] = [];
  while (cur <= lastOfMonth) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Format HH:MM (24h) → h:MM AM/PM */
function fmt12(t: string): string {
  if (!t) return "";
  const [hh, mm] = t.split(":");
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mm} ${ampm}`;
}

/** Employee initials (max 2 chars) */
function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

// ─── Initial Sample Data ──────────────────────────────────────────────────────

const initialEntries: ScheduleEntry[] = [
  // Week of May 11–17 (weekOffset = -2): existing schedule
  // Marcus Rivera: Mon–Fri @ Riverside Complex
  { id: "1",  employee: "Marcus Rivera",  date: "2026-05-11", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "2",  employee: "Marcus Rivera",  date: "2026-05-12", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "3",  employee: "Marcus Rivera",  date: "2026-05-13", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "4",  employee: "Marcus Rivera",  date: "2026-05-14", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "5",  employee: "Marcus Rivera",  date: "2026-05-15", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  // Deja Williams: Mon–Thu @ Harbor View
  { id: "6",  employee: "Deja Williams",  date: "2026-05-11", start: "07:00", end: "15:30", job: "Harbor View", type: "Shift" },
  { id: "7",  employee: "Deja Williams",  date: "2026-05-12", start: "07:00", end: "15:30", job: "Harbor View", type: "Shift" },
  { id: "8",  employee: "Deja Williams",  date: "2026-05-13", start: "07:00", end: "15:30", job: "Harbor View", type: "Shift" },
  { id: "9",  employee: "Deja Williams",  date: "2026-05-14", start: "07:00", end: "15:30", job: "Harbor View", type: "Shift" },
  // Tom Kowalski: Mon–Fri @ Harbor View
  { id: "10", employee: "Tom Kowalski",   date: "2026-05-11", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "11", employee: "Tom Kowalski",   date: "2026-05-12", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "12", employee: "Tom Kowalski",   date: "2026-05-13", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "13", employee: "Tom Kowalski",   date: "2026-05-14", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "14", employee: "Tom Kowalski",   date: "2026-05-15", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  // Anita Patel: Mon–Fri @ Office
  { id: "15", employee: "Anita Patel",    date: "2026-05-11", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "16", employee: "Anita Patel",    date: "2026-05-12", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "17", employee: "Anita Patel",    date: "2026-05-13", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "18", employee: "Anita Patel",    date: "2026-05-14", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "19", employee: "Anita Patel",    date: "2026-05-15", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  // Jordan Lee: Mon, Wed, Fri @ Metro Clinic
  { id: "20", employee: "Jordan Lee",     date: "2026-05-11", start: "09:00", end: "17:00", job: "Metro Clinic Reno", type: "Shift" },
  { id: "21", employee: "Jordan Lee",     date: "2026-05-13", start: "09:00", end: "17:00", job: "Metro Clinic Reno", type: "Shift" },
  { id: "22", employee: "Jordan Lee",     date: "2026-05-15", start: "09:00", end: "17:00", job: "Metro Clinic Reno", type: "Shift" },

  // Week of May 18–24 (weekOffset = -1)
  { id: "23", employee: "Marcus Rivera",  date: "2026-05-18", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "24", employee: "Marcus Rivera",  date: "2026-05-19", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "25", employee: "Marcus Rivera",  date: "2026-05-20", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "26", employee: "Marcus Rivera",  date: "2026-05-21", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "27", employee: "Marcus Rivera",  date: "2026-05-22", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "28", employee: "Tom Kowalski",   date: "2026-05-18", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "29", employee: "Tom Kowalski",   date: "2026-05-19", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "30", employee: "Tom Kowalski",   date: "2026-05-20", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "31", employee: "Tom Kowalski",   date: "2026-05-21", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "32", employee: "Tom Kowalski",   date: "2026-05-22", start: "06:30", end: "15:00", job: "Harbor View", type: "Shift" },
  { id: "33", employee: "Anita Patel",    date: "2026-05-18", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "34", employee: "Anita Patel",    date: "2026-05-19", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "35", employee: "Anita Patel",    date: "2026-05-20", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "36", employee: "Anita Patel",    date: "2026-05-21", start: "08:00", end: "17:00", job: "Office", type: "Shift" },
  { id: "37", employee: "Anita Patel",    date: "2026-05-22", start: "08:00", end: "17:00", job: "Office", type: "Shift" },

  // Current week May 25–31 (weekOffset = 0) — includes PTO/Vacation
  { id: "38", employee: "Marcus Rivera",  date: "2026-05-25", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "39", employee: "Marcus Rivera",  date: "2026-05-26", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "40", employee: "Marcus Rivera",  date: "2026-05-27", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "41", employee: "Marcus Rivera",  date: "2026-05-28", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "42", employee: "Marcus Rivera",  date: "2026-05-29", start: "07:00", end: "15:30", job: "Riverside Complex", type: "Shift" },
  { id: "43", employee: "Deja Williams",  date: "2026-05-25", start: "",      end: "",      job: "—",                type: "PTO" },
  { id: "44", employee: "Deja Williams",  date: "2026-05-26", start: "",      end: "",      job: "—",                type: "PTO" },
  { id: "45", employee: "Tom Kowalski",   date: "2026-05-25", start: "06:30", end: "15:00", job: "Harbor View",     type: "Shift" },
  { id: "46", employee: "Tom Kowalski",   date: "2026-05-26", start: "06:30", end: "15:00", job: "Harbor View",     type: "Shift" },
  { id: "47", employee: "Tom Kowalski",   date: "2026-05-27", start: "06:30", end: "15:00", job: "Harbor View",     type: "Shift" },
  { id: "48", employee: "Anita Patel",    date: "2026-05-25", start: "08:00", end: "17:00", job: "Office",          type: "Shift" },
  { id: "49", employee: "Anita Patel",    date: "2026-05-26", start: "08:00", end: "17:00", job: "Office",          type: "Shift" },
  { id: "50", employee: "Anita Patel",    date: "2026-05-27", start: "08:00", end: "17:00", job: "Office",          type: "Shift" },
  { id: "51", employee: "Anita Patel",    date: "2026-05-28", start: "08:00", end: "17:00", job: "Office",          type: "Shift" },
  { id: "52", employee: "Anita Patel",    date: "2026-05-29", start: "08:00", end: "17:00", job: "Office",          type: "Shift" },
  { id: "53", employee: "Carlos Mendoza", date: "2026-05-26", start: "",      end: "",      job: "—",                type: "Vacation" },
  { id: "54", employee: "Carlos Mendoza", date: "2026-05-27", start: "",      end: "",      job: "—",                type: "Vacation" },
  { id: "55", employee: "Carlos Mendoza", date: "2026-05-28", start: "",      end: "",      job: "—",                type: "Vacation" },
  { id: "56", employee: "Jordan Lee",     date: "2026-05-25", start: "09:00", end: "17:00", job: "Metro Clinic Reno", type: "Shift" },
  { id: "57", employee: "Jordan Lee",     date: "2026-05-27", start: "09:00", end: "17:00", job: "Metro Clinic Reno", type: "Shift" },
  { id: "58", employee: "Jordan Lee",     date: "2026-05-29", start: "09:00", end: "17:00", job: "Metro Clinic Reno", type: "Shift" },

  // Memorial Day — week of May 25
  { id: "59", employee: "Marcus Rivera",  date: "2026-05-25", start: "", end: "", job: "—", type: "Holiday" },
];

// ─── Add Shift Form ───────────────────────────────────────────────────────────

type AddForm = {
  employee: string;
  date: string;
  type: EntryType;
  start: string;
  end: string;
  job: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [entries, setEntries] = useState<ScheduleEntry[]>(initialEntries);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week (May 25)
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [published, setPublished] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>({
    employee: EMPLOYEES[0],
    date: formatDate(TODAY),
    type: "Shift",
    start: "08:00",
    end: "17:00",
    job: JOBS[0],
  });

  // ── Derived values ──────────────────────────────────────────────────────────

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const monthCalendar = getMonthCalendar(weekStart);
  const currentMonth = weekStart.getMonth();
  const currentYear = weekStart.getFullYear();

  const todayStr = formatDate(TODAY);

  function weekRangeLabel(): string {
    const s = weekDates[0];
    const e = weekDates[6];
    const sLabel = `${MONTH_NAMES[s.getMonth()].slice(0, 3)} ${s.getDate()}`;
    const eLabel =
      s.getMonth() === e.getMonth()
        ? `${e.getDate()}`
        : `${MONTH_NAMES[e.getMonth()].slice(0, 3)} ${e.getDate()}`;
    return `${sLabel}–${eLabel}, ${s.getFullYear()}`;
  }

  // ── Entry lookup ────────────────────────────────────────────────────────────

  function getEntriesFor(employee: string, dateStr: string): ScheduleEntry[] {
    return entries.filter((e) => e.employee === employee && e.date === dateStr);
  }

  function getEntriesForDate(dateStr: string): ScheduleEntry[] {
    return entries.filter((e) => e.date === dateStr);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleDrop(employee: string, dateStr: string) {
    if (!dragId) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === dragId ? { ...e, employee, date: dateStr } : e))
    );
    setDragId(null);
  }

  function copyLastWeek() {
    const prevWeekDates = getWeekDates(weekOffset - 1);
    const prevDateStrs = new Set(prevWeekDates.map(formatDate));
    const curDateStrs = getWeekDates(weekOffset).map(formatDate);

    const toCopy = entries.filter((e) => prevDateStrs.has(e.date));
    if (toCopy.length === 0) return;

    const newEntries = toCopy.map((e) => {
      const prevDate = parseLocalDate(e.date);
      const nextDate = addDays(prevDate, 7);
      return {
        ...e,
        id: `copy-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        date: formatDate(nextDate),
      };
    });
    // Remove any existing entries in the current week first (optional; keep for simplicity)
    setEntries((prev) => [
      ...prev.filter((e) => !curDateStrs.includes(e.date)),
      ...newEntries,
    ]);
  }

  function openAddModal() {
    setAddForm({
      employee: EMPLOYEES[0],
      date: formatDate(weekDates[0]),
      type: "Shift",
      start: "08:00",
      end: "17:00",
      job: JOBS[0],
    });
    setShowAddModal(true);
  }

  function submitAdd() {
    const isTimeEntry = addForm.type === "Shift";
    const newEntry: ScheduleEntry = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      employee: addForm.employee,
      date: addForm.date,
      start: isTimeEntry ? addForm.start : "",
      end: isTimeEntry ? addForm.end : "",
      job: isTimeEntry ? addForm.job : "—",
      type: addForm.type,
    };
    setEntries((prev) => [...prev, newEntry]);
    setShowAddModal(false);
    // Navigate to the week containing the new entry
    setWeekOffset(weekOffsetForDate(parseLocalDate(addForm.date)));
  }

  // ── Month navigation ────────────────────────────────────────────────────────

  function prevMonth() {
    const first = new Date(currentYear, currentMonth - 1, 1);
    setWeekOffset(weekOffsetForDate(first));
  }

  function nextMonth() {
    const first = new Date(currentYear, currentMonth + 1, 1);
    setWeekOffset(weekOffsetForDate(first));
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">
            {viewMode === "week"
              ? `Week of ${weekRangeLabel()}`
              : `${MONTH_NAMES[currentMonth]} ${currentYear}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(["week", "month"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  viewMode === v
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          {viewMode === "week" ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ‹ Prev
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next ›
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ‹ Prev
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next ›
              </button>
            </div>
          )}

          <button
            onClick={copyLastWeek}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Copy Last Week
          </button>
          <button
            onClick={openAddModal}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            + Add Shift
          </button>
          <button
            onClick={() => setPublished(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              published
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {published ? "Published ✓" : "Publish to Employees"}
          </button>
        </div>
      </div>

      {published && (
        <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-5 py-3 text-sm text-green-700">
          Schedule published. All employees have been notified via push notification.
        </div>
      )}

      {/* ── WEEK VIEW ─────────────────────────────────────────────────────────── */}
      {viewMode === "week" && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            Drag shifts to reassign · Click × to remove · Use{" "}
            <span className="font-medium">+ Add Shift</span> to plan future weeks
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white border-b border-r border-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 w-40">
                    Employee
                  </th>
                  {weekDates.map((d, i) => {
                    const ds = formatDate(d);
                    const isToday = ds === todayStr;
                    return (
                      <th
                        key={i}
                        className={`border-b border-gray-100 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[130px] ${
                          isToday ? "text-orange-500" : "text-gray-400"
                        }`}
                      >
                        {DAY_LABELS[i]}{" "}
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                            isToday ? "bg-orange-500 text-white" : ""
                          }`}
                        >
                          {d.getDate()}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {EMPLOYEES.map((emp) => (
                  <tr key={emp} className="border-b border-gray-50">
                    <td className="sticky left-0 z-10 bg-white border-r border-gray-100 px-5 py-3 font-medium text-gray-800 text-xs">
                      {emp}
                    </td>
                    {weekDates.map((d, dayIdx) => {
                      const ds = formatDate(d);
                      const dayEntries = getEntriesFor(emp, ds);
                      return (
                        <td
                          key={dayIdx}
                          className="px-2 py-2 align-top border-r border-gray-50 last:border-0"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(emp, ds)}
                        >
                          {dayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              draggable
                              onDragStart={() => setDragId(entry.id)}
                              className={`mb-1 rounded-lg border px-2 py-1.5 text-xs cursor-grab active:cursor-grabbing ${entryColor(entry)}`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <div className="min-w-0">
                                  {entry.type === "Shift" ? (
                                    <>
                                      <div className="font-medium truncate">
                                        {fmt12(entry.start)} – {fmt12(entry.end)}
                                      </div>
                                      <div className="opacity-70 text-[10px] truncate">
                                        {entry.job}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="font-medium">{entry.type}</div>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeEntry(entry.id)}
                                  className="flex-shrink-0 opacity-40 hover:opacity-100 font-bold text-[10px] ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                          {dayEntries.length === 0 && (
                            <div className="h-8 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-200">
                              drop
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-blue-200" /> Riverside Complex
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-green-200" /> Harbor View
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-purple-200" /> Office
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-orange-200" /> Metro Clinic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-teal-200" /> PTO
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-indigo-200" /> Vacation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-200" /> Holiday
            </span>
          </div>
        </>
      )}

      {/* ── MONTH VIEW ────────────────────────────────────────────────────────── */}
      {viewMode === "month" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {monthCalendar.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-0">
              {week.map((d, di) => {
                const ds = formatDate(d);
                const inMonth = d.getMonth() === currentMonth;
                const isToday = ds === todayStr;
                const dayEntries = getEntriesForDate(ds);
                const shown = dayEntries.slice(0, 3);
                const extra = dayEntries.length - shown.length;

                return (
                  <div
                    key={di}
                    className={`min-h-[100px] p-2 border-r border-gray-100 last:border-0 ${
                      !inMonth ? "bg-gray-50/50" : ""
                    }`}
                  >
                    {/* Date number */}
                    <div className="mb-1.5 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-orange-500 text-white"
                            : inMonth
                            ? "text-gray-700"
                            : "text-gray-300"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                    </div>

                    {/* Entry chips */}
                    <div className="space-y-0.5">
                      {shown.map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] leading-snug truncate ${entryColor(entry)}`}
                        >
                          <span className="font-semibold shrink-0">
                            {initials(entry.employee)}
                          </span>
                          <span className="truncate opacity-80">
                            {entry.type === "Shift"
                              ? fmt12(entry.start)
                              : entry.type}
                          </span>
                        </div>
                      ))}
                      {extra > 0 && (
                        <div className="text-[10px] text-gray-400 pl-1.5">
                          +{extra} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── ADD SHIFT MODAL ───────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Add Schedule Entry</h2>

            <div className="space-y-4">
              {/* Employee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  value={addForm.employee}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, employee: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                >
                  {EMPLOYEES.map((emp) => (
                    <option key={emp}>{emp}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Shift", "PTO", "Vacation", "Holiday"] as EntryType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAddForm((f) => ({ ...f, type: t }))}
                      className={`rounded-lg py-2 text-xs font-semibold border transition-colors ${
                        addForm.type === t
                          ? t === "Shift"
                            ? "bg-gray-800 text-white border-gray-800"
                            : t === "PTO"
                            ? "bg-teal-500 text-white border-teal-500"
                            : t === "Vacation"
                            ? "bg-indigo-500 text-white border-indigo-500"
                            : "bg-rose-500 text-white border-rose-500"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Times & Job (only for Shift type) */}
              {addForm.type === "Shift" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={addForm.start}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, start: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={addForm.end}
                        onChange={(e) =>
                          setAddForm((f) => ({ ...f, end: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job / Location
                    </label>
                    <select
                      value={addForm.job}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, job: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    >
                      {JOBS.map((j) => (
                        <option key={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {addForm.type !== "Shift" && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3">
                  {addForm.type === "PTO" && "PTO will be recorded as a full-day absence."}
                  {addForm.type === "Vacation" && "Vacation will be recorded as a full-day absence."}
                  {addForm.type === "Holiday" && "Holiday will be displayed on all employees' schedules."}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAdd}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Add to Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
