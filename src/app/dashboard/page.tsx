"use client";

import { useState } from "react";

const clockedIn = [
  { name: "Marcus Rivera", badge: "EMP-1042", job: "Riverside Complex — Phase 2", since: "6:58 AM", location: "On-site" },
  { name: "Deja Williams", badge: "EMP-1087", job: "Harbor View — Foundation", since: "7:02 AM", location: "On-site" },
  { name: "Tom Kowalski", badge: "EMP-1031", job: "Harbor View — Foundation", since: "7:04 AM", location: "On-site" },
  { name: "Anita Patel", badge: "EMP-1056", job: "Office — Admin", since: "8:11 AM", location: "Remote" },
  { name: "Carlos Mendoza", badge: "EMP-1063", job: "Riverside Complex — Phase 2", since: "7:00 AM", location: "On-site" },
];

const alerts = [
  { type: "missed", message: "Jordan Lee missed punch-out yesterday at 5:00 PM", time: "2h ago" },
  { type: "overtime", message: "Marcus Rivera at 38.5 hrs — approaching 40-hr OT threshold", time: "4h ago" },
  { type: "approval", message: "4 timesheets pending manager approval for pay period ending May 15", time: "Today" },
  { type: "geofence", message: "Punch from Deja Williams was 0.3 mi outside Harbor View geofence", time: "7:03 AM" },
];

const weekStats = [
  { label: "Currently Clocked In", value: "5", sub: "of 18 employees", color: "text-green-600" },
  { label: "Hours This Week", value: "312.5", sub: "across all employees", color: "text-gray-900" },
  { label: "Overtime Hours", value: "6.0", sub: "3 employees over 40 hrs", color: "text-amber-600" },
  { label: "Pending Approvals", value: "4", sub: "timesheets awaiting review", color: "text-orange-500" },
];

const recentJobs = [
  { name: "Riverside Complex", phase: "Phase 2", budget: 48000, actual: 31450, pct: 65 },
  { name: "Harbor View", phase: "Foundation", budget: 22000, actual: 18700, pct: 85 },
  { name: "Metro Clinic Reno", phase: "Interior", budget: 15000, actual: 9200, pct: 61 },
];

export default function DashboardPage() {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Thursday, May 15, 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Timesheets
          </button>
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            Run Payroll Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {weekStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-gray-100 p-5"
          >
            <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Clocked In */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Currently Clocked In</h2>
            <span className="text-xs text-green-600 bg-green-50 rounded-full px-2.5 py-1 font-medium">
              {clockedIn.length} active
            </span>
          </div>
          <div className="space-y-3">
            {clockedIn.map((emp) => (
              <div
                key={emp.badge}
                className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.job}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Since {emp.since}</div>
                  <div className="text-xs text-gray-400">{emp.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Alerts</h2>
          <div className="space-y-3">
            {alerts
              .filter((_, i) => !dismissedAlerts.includes(i))
              .map((alert, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-xs ${
                    alert.type === "missed"
                      ? "bg-red-50 text-red-700"
                      : alert.type === "overtime"
                      ? "bg-amber-50 text-amber-700"
                      : alert.type === "geofence"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="leading-relaxed">{alert.message}</p>
                    <button
                      onClick={() => setDismissedAlerts((d) => [...d, i])}
                      className="flex-shrink-0 opacity-50 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-1 opacity-60">{alert.time}</div>
                </div>
              ))}
            {dismissedAlerts.length === alerts.length && (
              <p className="text-xs text-gray-400">No active alerts.</p>
            )}
          </div>
        </div>
      </div>

      {/* Job Cost */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Active Job Labor Cost</h2>
          <a href="/dashboard/jobs" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
            View all jobs →
          </a>
        </div>
        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.name}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-800">
                  {job.name}
                  <span className="ml-2 text-xs text-gray-400 font-normal">{job.phase}</span>
                </span>
                <span className="text-gray-600">
                  ${job.actual.toLocaleString()} /{" "}
                  <span className="text-gray-400">${job.budget.toLocaleString()}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full transition-all ${
                    job.pct >= 85 ? "bg-red-400" : job.pct >= 75 ? "bg-amber-400" : "bg-green-400"
                  }`}
                  style={{ width: `${job.pct}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{job.pct}% of budget used</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
