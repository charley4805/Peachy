"use client";

import { useState } from "react";

type JobStatus = "Active" | "On Hold" | "Complete";

type Job = {
  id: string;
  customer: string;
  name: string;
  phase: string;
  costCode: string;
  budget: number;
  actual: number;
  status: JobStatus;
  tasks: Task[];
};

type Task = {
  id: string;
  name: string;
  costCode: string;
  hoursLogged: number;
  budget: number;
};

const initialJobs: Job[] = [
  {
    id: "1",
    customer: "Sunrise Development",
    name: "Riverside Complex",
    phase: "Phase 2 — Framing",
    costCode: "03-200",
    budget: 48000,
    actual: 31450,
    status: "Active",
    tasks: [
      { id: "1a", name: "Framing", costCode: "03-201", hoursLogged: 210, budget: 18000 },
      { id: "1b", name: "Rough Plumbing", costCode: "03-202", hoursLogged: 88, budget: 12000 },
      { id: "1c", name: "Rough Electrical", costCode: "03-203", hoursLogged: 64, budget: 10000 },
      { id: "1d", name: "Inspections", costCode: "03-204", hoursLogged: 12, budget: 8000 },
    ],
  },
  {
    id: "2",
    customer: "Harbor Bay LLC",
    name: "Harbor View",
    phase: "Foundation",
    costCode: "02-100",
    budget: 22000,
    actual: 18700,
    status: "Active",
    tasks: [
      { id: "2a", name: "Excavation", costCode: "02-101", hoursLogged: 120, budget: 9000 },
      { id: "2b", name: "Concrete Pour", costCode: "02-102", hoursLogged: 95, budget: 8000 },
      { id: "2c", name: "Waterproofing", costCode: "02-103", hoursLogged: 40, budget: 5000 },
    ],
  },
  {
    id: "3",
    customer: "Metro Health Partners",
    name: "Metro Clinic Reno",
    phase: "Interior Buildout",
    costCode: "05-300",
    budget: 15000,
    actual: 9200,
    status: "Active",
    tasks: [
      { id: "3a", name: "Drywall", costCode: "05-301", hoursLogged: 60, budget: 6000 },
      { id: "3b", name: "Painting", costCode: "05-302", hoursLogged: 48, budget: 4500 },
      { id: "3c", name: "Trim & Finish", costCode: "05-303", hoursLogged: 20, budget: 4500 },
    ],
  },
  {
    id: "4",
    customer: "Citywide Properties",
    name: "Oak Street Office Park",
    phase: "Complete",
    costCode: "04-100",
    budget: 35000,
    actual: 34200,
    status: "Complete",
    tasks: [],
  },
];

const statusStyle: Record<JobStatus, string> = {
  Active: "bg-green-50 text-green-700",
  "On Hold": "bg-yellow-50 text-yellow-700",
  Complete: "bg-gray-100 text-gray-500",
};

export default function JobsPage() {
  const [jobs] = useState<Job[]>(initialJobs);
  const [expandedId, setExpandedId] = useState<string | null>("1");

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs & Job Costing</h1>
          <p className="text-sm text-gray-500 mt-1">
            {jobs.filter((j) => j.status === "Active").length} active jobs
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export to QuickBooks
          </button>
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            + New Job
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total Budget",
            value: `$${jobs.reduce((a, j) => a + j.budget, 0).toLocaleString()}`,
          },
          {
            label: "Total Actual",
            value: `$${jobs.reduce((a, j) => a + j.actual, 0).toLocaleString()}`,
          },
          {
            label: "Remaining",
            value: `$${jobs.reduce((a, j) => a + (j.budget - j.actual), 0).toLocaleString()}`,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white border border-gray-100 p-5">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Jobs */}
      <div className="space-y-4">
        {jobs.map((job) => {
          const pct = Math.round((job.actual / job.budget) * 100);
          const expanded = expandedId === job.id;
          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <button
                className="w-full text-left px-6 py-5 hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(expanded ? null : job.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{expanded ? "▾" : "▸"}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{job.name}</span>
                        <span className="text-xs text-gray-400">{job.phase}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[job.status]}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {job.customer} · Cost code: {job.costCode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-[220px]">
                    <div className="flex items-center gap-3 justify-end mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        ${job.actual.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400">
                        / ${job.budget.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          pct >= 85 ? "text-red-500" : pct >= 75 ? "text-amber-500" : "text-green-600"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 w-48 ml-auto">
                      <div
                        className={`h-1.5 rounded-full ${
                          pct >= 85 ? "bg-red-400" : pct >= 75 ? "bg-amber-400" : "bg-green-400"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>

              {expanded && job.tasks.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Tasks</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left text-xs text-gray-400 pb-2">Task</th>
                        <th className="text-left text-xs text-gray-400 pb-2">Cost Code</th>
                        <th className="text-right text-xs text-gray-400 pb-2">Hours</th>
                        <th className="text-right text-xs text-gray-400 pb-2">Budget</th>
                        <th className="text-right text-xs text-gray-400 pb-2">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.tasks.map((task) => {
                        const estCost = task.hoursLogged * 25;
                        const tPct = Math.round((estCost / task.budget) * 100);
                        return (
                          <tr key={task.id} className="border-t border-gray-50">
                            <td className="py-2 font-medium text-gray-700">{task.name}</td>
                            <td className="py-2 text-gray-400 font-mono text-xs">{task.costCode}</td>
                            <td className="py-2 text-right text-gray-600">{task.hoursLogged} hrs</td>
                            <td className="py-2 text-right text-gray-400">${task.budget.toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <div className="inline-flex items-center gap-2">
                                <div className="h-1.5 w-20 rounded-full bg-gray-100">
                                  <div
                                    className={`h-1.5 rounded-full ${tPct >= 85 ? "bg-red-400" : "bg-green-400"}`}
                                    style={{ width: `${Math.min(tPct, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{tPct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
