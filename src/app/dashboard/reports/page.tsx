"use client";

import { useState } from "react";

const prebuilt = [
  {
    name: "Hours by Employee",
    desc: "Regular, overtime, and PTO hours per employee for any date range.",
    icon: "👤",
    category: "Time & Attendance",
  },
  {
    name: "Hours by Job",
    desc: "Total labor hours and cost attributed to each job and task.",
    icon: "🏗️",
    category: "Job Costing",
  },
  {
    name: "Overtime Summary",
    desc: "All employees and hours exceeding 40-hour weekly or daily thresholds.",
    icon: "⚠️",
    category: "Compliance",
  },
  {
    name: "Missed Punches",
    desc: "List of all missed clock-ins and clock-outs with responsible manager.",
    icon: "🔔",
    category: "Time & Attendance",
  },
  {
    name: "Late Arrivals",
    desc: "Punches that occurred more than 5 minutes after scheduled start.",
    icon: "🕐",
    category: "Time & Attendance",
  },
  {
    name: "Time Off Summary",
    desc: "PTO, sick, and unpaid leave balances and usage by employee.",
    icon: "🌴",
    category: "PTO",
  },
  {
    name: "Payroll Preview",
    desc: "Estimated gross pay by employee before payroll export.",
    icon: "💵",
    category: "Payroll",
  },
  {
    name: "Labor Cost vs Budget",
    desc: "Actual labor cost compared to budget for every active job.",
    icon: "📊",
    category: "Job Costing",
  },
];

const categories = ["All", "Time & Attendance", "Job Costing", "Compliance", "PTO", "Payroll"];

const sampleData = [
  { employee: "Marcus Rivera", regular: 38.5, ot: 0, pto: 0, total: 38.5, cost: "$1,078.00" },
  { employee: "Deja Williams", regular: 40.0, ot: 2.5, pto: 0, total: 42.5, cost: "$1,068.75" },
  { employee: "Tom Kowalski", regular: 40.0, ot: 4.0, pto: 0, total: 44.0, cost: "$1,008.00" },
  { employee: "Anita Patel", regular: 40.0, ot: 0, pto: 0, total: 40.0, cost: "$1,384.62" },
  { employee: "Carlos Mendoza", regular: 36.0, ot: 0, pto: 0, total: 36.0, cost: "$756.00" },
  { employee: "Jordan Lee", regular: 32.0, ot: 0, pto: 8.0, total: 40.0, cost: "$720.00" },
];

export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("May 1 – May 15, 2026");

  const filtered = prebuilt.filter(
    (r) => activeCategory === "All" || r.category === activeCategory
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pre-built reports and scheduled exports
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          />
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            + Schedule Report
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === c
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Report cards */}
      {!activeReport && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {filtered.map((report) => (
            <button
              key={report.name}
              onClick={() => setActiveReport(report.name)}
              className="text-left rounded-2xl bg-white border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-3">{report.icon}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">
                {report.category}
              </div>
              <div className="font-semibold text-gray-900 mb-1.5">{report.name}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{report.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Report output */}
      {activeReport && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">{activeReport}</h2>
              <p className="text-sm text-gray-400">{dateRange}</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Export CSV
              </button>
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Export PDF
              </button>
              <button
                onClick={() => setActiveReport(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Employee</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Regular</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Overtime</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">PTO</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Total Hrs</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row) => (
                <tr key={row.employee} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-800">{row.employee}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{row.regular.toFixed(1)}</td>
                  <td className={`px-6 py-3 text-right font-medium ${row.ot > 0 ? "text-amber-600" : "text-gray-300"}`}>
                    {row.ot.toFixed(1)}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-500">{row.pto.toFixed(1)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">{row.total.toFixed(1)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">{row.cost}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="px-6 py-3 font-bold text-gray-900">Totals</td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">
                  {sampleData.reduce((a, r) => a + r.regular, 0).toFixed(1)}
                </td>
                <td className="px-6 py-3 text-right font-bold text-amber-600">
                  {sampleData.reduce((a, r) => a + r.ot, 0).toFixed(1)}
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">
                  {sampleData.reduce((a, r) => a + r.pto, 0).toFixed(1)}
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">
                  {sampleData.reduce((a, r) => a + r.total, 0).toFixed(1)}
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">$6,015.37</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!activeReport && (
        <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 mb-2">Scheduled Reports</h3>
          <div className="text-sm text-gray-500">
            No scheduled reports configured. Click{" "}
            <button className="text-orange-500 hover:text-orange-600 font-medium">+ Schedule Report</button>{" "}
            to set up automatic email delivery.
          </div>
        </div>
      )}
    </div>
  );
}
