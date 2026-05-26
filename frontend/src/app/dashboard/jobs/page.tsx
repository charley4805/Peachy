"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type JobStatus = "Active" | "On Hold" | "Complete";
type GeofenceStatus = "on-site" | "outside" | "far";

type CrewMember = {
  name: string;
  initials: string;
  clockedInAt: string;
  status: GeofenceStatus;
  distanceM?: number;
};

type Task = {
  id: string;
  name: string;
  costCode: string;
  hoursLogged: number;
  budget: number;
};

type Job = {
  id: string;
  customer: string;
  name: string;
  phase: string;
  costCode: string;
  budget: number;
  actual: number;
  status: JobStatus;
  color: string;
  tasks: Task[];
  address?: string;
  geofenceRadius?: number;
  crew?: CrewMember[];
};

type CreateForm = {
  customer: string;
  name: string;
  phase: string;
  costCode: string;
  budget: string;
  startDate: string;
  endDate: string;
  address: string;
  color: string;
  tasks: { name: string; budget: string }[];
};

const INDUSTRY_TEMPLATES: Record<
  string,
  {
    jobLabel: string;
    customerLabel: string;
    phases: string[];
    costSeries: string[];
    taskSuggestions: string[];
  }
> = {
  Construction: {
    jobLabel: "Job Site",
    customerLabel: "Client / GC",
    phases: ["Site Prep", "Foundation", "Framing", "Rough MEP", "Drywall", "Exterior Finish", "Interior Finish", "Punch List"],
    costSeries: ["01 – General", "02 – Site Work", "03 – Concrete", "05 – Metals", "06 – Wood", "07 – Envelope", "09 – Finishes", "15 – Mechanical", "16 – Electrical"],
    taskSuggestions: ["Mobilization", "Framing", "Rough Plumbing", "Rough Electrical", "Drywall", "Painting", "Trim & Finish", "Inspections"],
  },
  Healthcare: {
    jobLabel: "Facility",
    customerLabel: "Healthcare System",
    phases: ["Planning", "Pre-Construction", "Construction", "Commissioning", "Go-Live", "Maintenance"],
    costSeries: ["01 – Admin", "02 – Clinical", "03 – Support Svcs", "04 – IT & Equipment"],
    taskSuggestions: ["Assessment", "Design", "Installation", "Testing", "Training", "Documentation"],
  },
  "Cleaning & Janitorial": {
    jobLabel: "Location",
    customerLabel: "Client",
    phases: ["Initial Deep Clean", "Recurring Service", "Special Project", "Post-Construction Clean"],
    costSeries: ["01 – Janitorial", "02 – Floor Care", "03 – Carpet Cleaning", "04 – Window Cleaning", "05 – Specialty"],
    taskSuggestions: ["General Cleaning", "Restrooms", "Floor Care", "Windows", "Trash Removal"],
  },
  Hospitality: {
    jobLabel: "Property",
    customerLabel: "Property Owner",
    phases: ["Pre-Opening", "Event Setup", "Ongoing Service", "Renovation", "Closeout"],
    costSeries: ["01 – Front of House", "02 – Housekeeping", "03 – Food & Beverage", "04 – Maintenance", "05 – Events"],
    taskSuggestions: ["Room Turnover", "Common Areas", "F&B Service", "Event Setup", "Maintenance"],
  },
  "Field Services": {
    jobLabel: "Service Call",
    customerLabel: "Client",
    phases: ["Dispatched", "En Route", "On Site", "Testing", "Completed", "Invoiced"],
    costSeries: ["01 – Installation", "02 – Repair", "03 – Maintenance", "04 – Inspection"],
    taskSuggestions: ["Travel", "Labor", "Parts & Materials", "Testing", "Documentation"],
  },
  Agriculture: {
    jobLabel: "Field / Site",
    customerLabel: "Farm / Owner",
    phases: ["Soil Prep", "Planting", "Growing", "Irrigation", "Harvest", "Post-Harvest"],
    costSeries: ["01 – Equipment", "02 – Labor", "03 – Inputs", "04 – Irrigation", "05 – Harvest"],
    taskSuggestions: ["Equipment Operation", "Manual Labor", "Irrigation", "Spraying", "Harvesting"],
  },
  Manufacturing: {
    jobLabel: "Production Run",
    customerLabel: "Client / Order",
    phases: ["Setup", "Production", "QC", "Packaging", "Shipping"],
    costSeries: ["01 – Direct Labor", "02 – Materials", "03 – Machine Time", "04 – QA", "05 – Overhead"],
    taskSuggestions: ["Setup", "Production", "Quality Control", "Packaging", "Shipping"],
  },
  Retail: {
    jobLabel: "Location / Project",
    customerLabel: "Brand / Owner",
    phases: ["Planning", "Buildout", "Merchandising", "Grand Opening", "Ongoing Ops"],
    costSeries: ["01 – Labor", "02 – Fixtures", "03 – Signage", "04 – Merchandise"],
    taskSuggestions: ["Setup", "Merchandising", "Visual Display", "Inventory", "Staffing"],
  },
  "Transportation & Logistics": {
    jobLabel: "Route / Contract",
    customerLabel: "Client",
    phases: ["Planning", "Active", "Completed"],
    costSeries: ["01 – Driver Labor", "02 – Fuel", "03 – Maintenance", "04 – Insurance"],
    taskSuggestions: ["Pickup", "Transport", "Delivery", "Documentation"],
  },
  Other: {
    jobLabel: "Project",
    customerLabel: "Client",
    phases: ["Planning", "In Progress", "Review", "Complete"],
    costSeries: ["01 – Labor", "02 – Materials", "03 – Overhead"],
    taskSuggestions: ["Planning", "Execution", "Review", "Delivery"],
  },
};

const COLOR_PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#6b7280",
];

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
    color: "#3b82f6",
    address: "1420 Riverside Dr, Sacramento, CA 95811",
    geofenceRadius: 150,
    crew: [
      { name: "Marcus Rivera", initials: "MR", clockedInAt: "7:02 AM", status: "on-site" },
      { name: "Tom Kowalski", initials: "TK", clockedInAt: "6:35 AM", status: "outside", distanceM: 340 },
      { name: "Jordan Lee", initials: "JL", clockedInAt: "9:10 AM", status: "on-site" },
    ],
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
    color: "#10b981",
    address: "888 Harbor Blvd, Oakland, CA 94607",
    geofenceRadius: 100,
    crew: [
      { name: "Deja Williams", initials: "DW", clockedInAt: "7:15 AM", status: "on-site" },
      { name: "Carlos Mendoza", initials: "CM", clockedInAt: "7:30 AM", status: "far", distanceM: 1200 },
    ],
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
    color: "#f59e0b",
    address: "200 S Virginia St, Reno, NV 89501",
    geofenceRadius: 50,
    crew: [
      { name: "Anita Patel", initials: "AP", clockedInAt: "8:05 AM", status: "on-site" },
    ],
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
    color: "#6b7280",
    tasks: [],
  },
];

const statusStyle: Record<JobStatus, string> = {
  Active: "bg-green-50 text-green-700",
  "On Hold": "bg-yellow-50 text-yellow-700",
  Complete: "bg-gray-100 text-gray-500",
};

const statusDot: Record<JobStatus, string> = {
  Active: "bg-green-500",
  "On Hold": "bg-yellow-500",
  Complete: "bg-gray-400",
};

function makeDefaultForm(template: (typeof INDUSTRY_TEMPLATES)[string]): CreateForm {
  return {
    customer: "",
    name: "",
    phase: template.phases[0],
    costCode: template.costSeries[0],
    budget: "",
    startDate: "",
    endDate: "",
    address: "",
    color: COLOR_PALETTE[0],
    tasks: [],
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [showCreate, setShowCreate] = useState(false);
  const [orgIndustry, setOrgIndustry] = useState("Construction");
  const [statusFilter, setStatusFilter] = useState<"All" | JobStatus>("All");
  const [form, setForm] = useState<CreateForm>(() =>
    makeDefaultForm(INDUSTRY_TEMPLATES["Construction"])
  );

  const template = INDUSTRY_TEMPLATES[orgIndustry] ?? INDUSTRY_TEMPLATES["Other"];

  useEffect(() => {
    async function loadIndustry() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("industry")
        .eq("id", user.id)
        .single();
      const industry = (data as { industry?: string } | null)?.industry ?? "Construction";
      setOrgIndustry(industry);
    }
    loadIndustry();
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phase: template.phases[0],
      costCode: template.costSeries[0],
    }));
  }, [orgIndustry]); // eslint-disable-line react-hooks/exhaustive-deps

  function addTask() {
    setForm((prev) => ({ ...prev, tasks: [...prev.tasks, { name: "", budget: "" }] }));
  }

  function removeTask(i: number) {
    setForm((prev) => ({ ...prev, tasks: prev.tasks.filter((_, idx) => idx !== i) }));
  }

  function updateTask(i: number, field: "name" | "budget", value: string) {
    setForm((prev) => {
      const tasks = [...prev.tasks];
      tasks[i] = { ...tasks[i], [field]: value };
      return { ...prev, tasks };
    });
  }

  function createJob() {
    if (!form.customer.trim() || !form.name.trim() || !form.budget) return;
    const newJob: Job = {
      id: String(Date.now()),
      customer: form.customer.trim(),
      name: form.name.trim(),
      phase: form.phase,
      costCode: form.costCode,
      budget: parseFloat(form.budget) || 0,
      actual: 0,
      status: "Active",
      color: form.color,
      address: form.address.trim() || undefined,
      geofenceRadius: form.address.trim() ? 150 : undefined,
      crew: [],
      tasks: form.tasks
        .filter((t) => t.name.trim())
        .map((t, i) => ({
          id: `new-${Date.now()}-${i}`,
          name: t.name.trim(),
          costCode: form.costCode,
          hoursLogged: 0,
          budget: parseFloat(t.budget) || 0,
        })),
    };
    setJobs((prev) => [newJob, ...prev]);
    setShowCreate(false);
    setForm(makeDefaultForm(template));
  }

  const filteredJobs =
    statusFilter === "All" ? jobs : jobs.filter((j) => j.status === statusFilter);
  const activeCount = jobs.filter((j) => j.status === "Active").length;

  const totalBudget = jobs.reduce((a, j) => a + j.budget, 0);
  const totalActual = jobs.reduce((a, j) => a + j.actual, 0);
  const totalRemaining = totalBudget - totalActual;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs & Job Costing</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orgIndustry} · {activeCount} active jobs
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export to QuickBooks
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            + New {template.jobLabel}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Budget", value: `$${totalBudget.toLocaleString()}` },
          { label: "Total Actual", value: `$${totalActual.toLocaleString()}` },
          { label: "Remaining", value: `$${totalRemaining.toLocaleString()}` },
          { label: "Active Jobs", value: String(activeCount) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white border border-gray-100 p-5">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(["All", "Active", "On Hold", "Complete"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Job list */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const pct = Math.round((job.actual / job.budget) * 100);
          const expanded = expandedId === job.id;
          const outsideCount = job.crew?.filter(
            (c) => c.status === "outside" || c.status === "far"
          ).length ?? 0;

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex"
            >
              {/* Color bar */}
              <div className="w-1 flex-shrink-0" style={{ backgroundColor: job.color }} />

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <button
                  className="w-full text-left px-6 py-5 hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : job.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${statusDot[job.status]}`}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900">{job.name}</span>
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                            {job.phase}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[job.status]}`}
                          >
                            {job.status}
                          </span>
                          {job.crew && job.crew.length > 0 && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                              👥 {job.crew.length}
                            </span>
                          )}
                          {outsideCount > 0 && (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                              ⚠ {outsideCount} outside
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {job.customer} · Cost code: {job.costCode}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[200px]">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          ${job.actual.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400">
                          / ${job.budget.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            pct >= 85
                              ? "text-red-500"
                              : pct >= 75
                              ? "text-amber-500"
                              : "text-green-600"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 w-44 ml-auto">
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

                {/* Expanded section */}
                {expanded && (
                  <div className="border-t border-gray-100">
                    {/* Tasks */}
                    {job.tasks.length > 0 && (
                      <div className="px-6 py-4 border-b border-gray-50">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                          Tasks
                        </h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left text-xs text-gray-400 pb-2">Task</th>
                              <th className="text-left text-xs text-gray-400 pb-2">Cost Code</th>
                              <th className="text-right text-xs text-gray-400 pb-2">Hours</th>
                              <th className="text-right text-xs text-gray-400 pb-2">Est. Cost</th>
                              <th className="text-right text-xs text-gray-400 pb-2">Budget</th>
                              <th className="text-right text-xs text-gray-400 pb-2">Progress</th>
                            </tr>
                          </thead>
                          <tbody>
                            {job.tasks.map((task) => {
                              const estCost = task.hoursLogged * 25;
                              const tPct = task.budget > 0 ? Math.round((estCost / task.budget) * 100) : 0;
                              return (
                                <tr key={task.id} className="border-t border-gray-50">
                                  <td className="py-2 font-medium text-gray-700">{task.name}</td>
                                  <td className="py-2 text-gray-400 font-mono text-xs">
                                    {task.costCode}
                                  </td>
                                  <td className="py-2 text-right text-gray-600">
                                    {task.hoursLogged} hrs
                                  </td>
                                  <td className="py-2 text-right text-gray-600">
                                    ${estCost.toLocaleString()}
                                  </td>
                                  <td className="py-2 text-right text-gray-400">
                                    ${task.budget.toLocaleString()}
                                  </td>
                                  <td className="py-2 text-right">
                                    <div className="inline-flex items-center gap-2">
                                      <div className="h-1.5 w-20 rounded-full bg-gray-100">
                                        <div
                                          className={`h-1.5 rounded-full ${
                                            tPct >= 85 ? "bg-red-400" : "bg-green-400"
                                          }`}
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

                    {/* Crew on Site */}
                    {job.crew && job.crew.length > 0 && (
                      <div className="px-6 py-4 border-b border-gray-50">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                          Crew on Site
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {job.crew.map((member) => (
                            <div
                              key={member.name}
                              className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                            >
                              <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {member.initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-800 truncate">
                                  {member.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Clocked in {member.clockedInAt}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {member.status === "on-site" && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                                    On site
                                  </span>
                                )}
                                {member.status === "outside" && (
                                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                    ⚠ {member.distanceM}m outside
                                  </span>
                                )}
                                {member.status === "far" && (
                                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                    🚨 {member.distanceM}m away
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {job.address && (
                      <div className="px-6 py-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                          Location
                        </h4>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-0.5">📍</span>
                          <div>
                            <div>{job.address}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              Geofence radius: {job.geofenceRadius}m · Employees clocking in
                              outside {job.geofenceRadius}m are flagged
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Job Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  New {template.jobLabel}
                </h2>
                <span className="inline-block mt-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                  Tailored for {orgIndustry}
                </span>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* 1. Basic Info */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Basic Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {template.customerLabel}
                    </label>
                    <input
                      type="text"
                      value={form.customer}
                      onChange={(e) => setForm((p) => ({ ...p, customer: e.target.value }))}
                      placeholder={`Enter ${template.customerLabel.toLowerCase()} name`}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {template.jobLabel} Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder={`Enter ${template.jobLabel.toLowerCase()} name`}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Phase & Cost */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Phase & Cost
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                    <select
                      value={form.phase}
                      onChange={(e) => setForm((p) => ({ ...p, phase: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    >
                      {template.phases.map((ph) => (
                        <option key={ph} value={ph}>
                          {ph}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Code Series
                    </label>
                    <select
                      value={form.costCode}
                      onChange={(e) => setForm((p) => ({ ...p, costCode: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    >
                      {template.costSeries.map((cs) => (
                        <option key={cs} value={cs}>
                          {cs}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Budget & Dates */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Budget & Dates
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget $</label>
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Color */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Color
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, color: c }))}
                      className={`h-7 w-7 rounded-full transition-all ${
                        form.color === c ? "ring-2 ring-offset-1 ring-gray-600" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* 5. Location */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Location
                </h3>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="123 Main St, City, State 00000"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  We&apos;ll use this to verify employee check-ins
                </p>
              </div>

              {/* 6. Initial Tasks */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Initial Tasks{" "}
                  <span className="text-gray-300 normal-case font-normal">(optional)</span>
                </h3>
                {form.tasks.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.tasks.map((task, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={task.name}
                          onChange={(e) => updateTask(i, "name", e.target.value)}
                          placeholder="Task name"
                          list="task-suggestions"
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        />
                        <input
                          type="number"
                          value={task.budget}
                          onChange={(e) => updateTask(i, "budget", e.target.value)}
                          placeholder="Budget $"
                          min="0"
                          className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeTask(i)}
                          className="text-gray-400 hover:text-red-500 text-lg leading-none"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <datalist id="task-suggestions">
                      {template.taskSuggestions.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                )}
                <button
                  type="button"
                  onClick={addTask}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  + Add Task
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createJob}
                disabled={!form.customer.trim() || !form.name.trim() || !form.budget}
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create {template.jobLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
