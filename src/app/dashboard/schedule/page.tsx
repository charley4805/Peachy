"use client";

import { useState } from "react";

const days = ["Mon 5/11", "Tue 5/12", "Wed 5/13", "Thu 5/14", "Fri 5/15", "Sat 5/16", "Sun 5/17"];

type Shift = {
  id: string;
  employee: string;
  day: number;
  start: string;
  end: string;
  job: string;
  color: string;
};

const initialShifts: Shift[] = [
  { id: "1", employee: "Marcus Rivera", day: 0, start: "7:00 AM", end: "3:30 PM", job: "Riverside Complex", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "2", employee: "Marcus Rivera", day: 1, start: "7:00 AM", end: "3:30 PM", job: "Riverside Complex", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "3", employee: "Marcus Rivera", day: 2, start: "7:00 AM", end: "3:30 PM", job: "Riverside Complex", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "4", employee: "Marcus Rivera", day: 3, start: "7:00 AM", end: "3:30 PM", job: "Riverside Complex", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "5", employee: "Marcus Rivera", day: 4, start: "7:00 AM", end: "3:30 PM", job: "Riverside Complex", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "6", employee: "Deja Williams", day: 0, start: "7:00 AM", end: "3:30 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "7", employee: "Deja Williams", day: 1, start: "7:00 AM", end: "3:30 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "8", employee: "Deja Williams", day: 2, start: "7:00 AM", end: "3:30 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "9", employee: "Deja Williams", day: 3, start: "7:00 AM", end: "3:30 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "10", employee: "Tom Kowalski", day: 0, start: "6:30 AM", end: "3:00 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "11", employee: "Tom Kowalski", day: 1, start: "6:30 AM", end: "3:00 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "12", employee: "Tom Kowalski", day: 2, start: "6:30 AM", end: "3:00 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "13", employee: "Tom Kowalski", day: 3, start: "6:30 AM", end: "3:00 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "14", employee: "Tom Kowalski", day: 4, start: "6:30 AM", end: "3:00 PM", job: "Harbor View", color: "bg-green-100 text-green-800 border-green-200" },
  { id: "15", employee: "Anita Patel", day: 0, start: "8:00 AM", end: "5:00 PM", job: "Office", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "16", employee: "Anita Patel", day: 1, start: "8:00 AM", end: "5:00 PM", job: "Office", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "17", employee: "Anita Patel", day: 2, start: "8:00 AM", end: "5:00 PM", job: "Office", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "18", employee: "Anita Patel", day: 3, start: "8:00 AM", end: "5:00 PM", job: "Office", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "19", employee: "Anita Patel", day: 4, start: "8:00 AM", end: "5:00 PM", job: "Office", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "20", employee: "Jordan Lee", day: 0, start: "9:00 AM", end: "5:00 PM", job: "Metro Clinic Reno", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "21", employee: "Jordan Lee", day: 2, start: "9:00 AM", end: "5:00 PM", job: "Metro Clinic Reno", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { id: "22", employee: "Jordan Lee", day: 4, start: "9:00 AM", end: "5:00 PM", job: "Metro Clinic Reno", color: "bg-orange-100 text-orange-800 border-orange-200" },
];

const employees = ["Marcus Rivera", "Deja Williams", "Tom Kowalski", "Anita Patel", "Carlos Mendoza", "Jordan Lee"];

export default function SchedulePage() {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [published, setPublished] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  function getShifts(employee: string, day: number) {
    return shifts.filter((s) => s.employee === employee && s.day === day);
  }

  function removeShift(id: string) {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  }

  function handleDrop(employee: string, day: number) {
    if (!dragId) return;
    setShifts((prev) =>
      prev.map((s) => (s.id === dragId ? { ...s, employee, day } : s))
    );
    setDragId(null);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Week of May 11–17, 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Copy Last Week
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
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

      {/* Drag hint */}
      <p className="text-xs text-gray-400 mb-4">
        Drag shifts to reassign. Click × to remove a shift.
      </p>

      {/* Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-r border-gray-100 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 w-40">
                Employee
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className="border-b border-gray-100 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400 min-w-[120px]"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp} className="border-b border-gray-50">
                <td className="sticky left-0 z-10 bg-white border-r border-gray-100 px-5 py-3 font-medium text-gray-800 text-xs">
                  {emp}
                </td>
                {days.map((_, dayIdx) => {
                  const dayShifts = getShifts(emp, dayIdx);
                  return (
                    <td
                      key={dayIdx}
                      className="px-2 py-2 align-top border-r border-gray-50 last:border-0"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(emp, dayIdx)}
                    >
                      {dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          draggable
                          onDragStart={() => setDragId(shift.id)}
                          className={`mb-1 rounded-lg border px-2 py-1.5 text-xs cursor-grab active:cursor-grabbing ${shift.color}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{shift.start} – {shift.end}</div>
                              <div className="opacity-70 text-[10px]">{shift.job}</div>
                            </div>
                            <button
                              onClick={() => removeShift(shift.id)}
                              className="ml-1 opacity-40 hover:opacity-100 font-bold text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      {dayShifts.length === 0 && (
                        <div className="h-8 rounded-lg border border-dashed border-gray-200 text-center text-xs text-gray-200 flex items-center justify-center">
                          drop here
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

      <div className="mt-4 flex gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-200" /> Riverside Complex</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-green-200" /> Harbor View</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-purple-200" /> Office</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-orange-200" /> Metro Clinic</span>
      </div>
    </div>
  );
}
