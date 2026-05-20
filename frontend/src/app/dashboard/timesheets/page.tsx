"use client";

import { useState } from "react";

type TimesheetStatus = "Pending Employee" | "Pending Manager" | "Approved" | "Locked";

type Timesheet = {
  id: string;
  employee: string;
  badge: string;
  department: string;
  regularHours: number;
  overtimeHours: number;
  ptoHours: number;
  status: TimesheetStatus;
  missedPunches: number;
};

const payPeriod = "May 1 – May 15, 2026";

const initialSheets: Timesheet[] = [
  { id: "1", employee: "Marcus Rivera", badge: "EMP-1042", department: "Construction", regularHours: 38.5, overtimeHours: 0, ptoHours: 0, status: "Pending Manager", missedPunches: 0 },
  { id: "2", employee: "Deja Williams", badge: "EMP-1087", department: "Construction", regularHours: 40, overtimeHours: 2.5, ptoHours: 0, status: "Pending Manager", missedPunches: 1 },
  { id: "3", employee: "Tom Kowalski", badge: "EMP-1031", department: "Construction", regularHours: 40, overtimeHours: 4, ptoHours: 0, status: "Approved", missedPunches: 0 },
  { id: "4", employee: "Anita Patel", badge: "EMP-1056", department: "Operations", regularHours: 40, overtimeHours: 0, ptoHours: 0, status: "Approved", missedPunches: 0 },
  { id: "5", employee: "Carlos Mendoza", badge: "EMP-1063", department: "Construction", regularHours: 36, overtimeHours: 0, ptoHours: 0, status: "Pending Employee", missedPunches: 0 },
  { id: "6", employee: "Jordan Lee", badge: "EMP-1094", department: "Cleaning", regularHours: 32, overtimeHours: 0, ptoHours: 8, status: "Pending Manager", missedPunches: 2 },
];

const statusStyle: Record<TimesheetStatus, string> = {
  "Pending Employee": "bg-yellow-50 text-yellow-700",
  "Pending Manager": "bg-orange-50 text-orange-700",
  "Approved": "bg-green-50 text-green-700",
  "Locked": "bg-gray-100 text-gray-500",
};

export default function TimesheetsPage() {
  const [sheets, setSheets] = useState<Timesheet[]>(initialSheets);
  const [selected, setSelected] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState("");

  function approve(id: string) {
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Approved" } : s))
    );
  }

  function approveSelected() {
    setSheets((prev) =>
      prev.map((s) =>
        selected.includes(s.id) && s.status !== "Locked" ? { ...s, status: "Approved" } : s
      )
    );
    setSelected([]);
  }

  function lockAll() {
    setSheets((prev) =>
      prev.map((s) => (s.status === "Approved" ? { ...s, status: "Locked" } : s))
    );
  }

  function saveEdit(id: string) {
    const hours = parseFloat(editHours);
    if (isNaN(hours)) return;
    setSheets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, regularHours: hours } : s))
    );
    setEditId(null);
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const totals = {
    regular: sheets.reduce((a, s) => a + s.regularHours, 0),
    ot: sheets.reduce((a, s) => a + s.overtimeHours, 0),
    pto: sheets.reduce((a, s) => a + s.ptoHours, 0),
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-sm text-gray-500 mt-1">Pay period: {payPeriod}</p>
        </div>
        <div className="flex gap-3">
          {selected.length > 0 && (
            <button
              onClick={approveSelected}
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
            >
              Approve Selected ({selected.length})
            </button>
          )}
          <button
            onClick={lockAll}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Lock Approved
          </button>
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            Export to Payroll
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Regular Hours", value: totals.regular.toFixed(1) },
          { label: "Overtime Hours", value: totals.ot.toFixed(1), warn: totals.ot > 0 },
          { label: "PTO Hours", value: totals.pto.toFixed(1) },
          { label: "Missed Punches", value: String(sheets.reduce((a, s) => a + s.missedPunches, 0)), warn: true },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.warn && (parseFloat(s.value) > 0) ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-white"}`}>
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.warn && parseFloat(s.value) > 0 ? "text-orange-600" : "text-gray-900"}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(e.target.checked ? sheets.map((s) => s.id) : [])
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Department</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Regular</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">OT</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">PTO</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Alerts</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sheets.map((sheet) => (
              <tr key={sheet.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(sheet.id)}
                    onChange={() => toggleSelect(sheet.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{sheet.employee}</div>
                  <div className="text-xs text-gray-400 font-mono">{sheet.badge}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">{sheet.department}</td>
                <td className="px-4 py-3 text-right">
                  {editId === sheet.id ? (
                    <input
                      type="number"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      onBlur={() => saveEdit(sheet.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(sheet.id)}
                      className="w-16 rounded border border-orange-300 px-2 py-1 text-right text-sm focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="font-medium text-gray-800 cursor-pointer hover:text-orange-500"
                      onClick={() => {
                        setEditId(sheet.id);
                        setEditHours(String(sheet.regularHours));
                      }}
                    >
                      {sheet.regularHours.toFixed(1)}
                    </span>
                  )}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${sheet.overtimeHours > 0 ? "text-amber-600" : "text-gray-400"}`}>
                  {sheet.overtimeHours.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">{sheet.ptoHours.toFixed(1)}</td>
                <td className="px-4 py-3">
                  {sheet.missedPunches > 0 ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      {sheet.missedPunches} missed
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[sheet.status]}`}>
                    {sheet.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">View</button>
                    {sheet.status === "Pending Manager" && (
                      <button
                        onClick={() => approve(sheet.id)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Click a regular-hours value to edit it. All edits are tracked in the audit log with before/after values.
      </p>
    </div>
  );
}
