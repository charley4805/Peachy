"use client";

import { useState } from "react";

type Plan = "Free" | "Starter" | "Pro" | "Enterprise";
type ClientStatus = "Active" | "Trial" | "Suspended";

type Client = {
  id: string;
  name: string;
  plan: Plan;
  users: number;
  mrr: number;
  status: ClientStatus;
  since: string;
  industry: string;
  contact: string;
  email: string;
};

const initialClients: Client[] = [
  { id: "1", name: "Coastal Cleaning Co.",   plan: "Pro",     users: 14, mrr: 147, status: "Active",    since: "Jan 2025", industry: "Cleaning",      contact: "Sandra Ortiz",   email: "sortiz@coastalcleaning.com" },
  { id: "2", name: "Sunrise Roofing",         plan: "Starter", users: 7,  mrr: 64,  status: "Active",    since: "Mar 2025", industry: "Construction",  contact: "Dale Hennessy",  email: "dale@sunriseroofing.com" },
  { id: "3", name: "Harbor Healthcare",       plan: "Pro",     users: 22, mrr: 203, status: "Active",    since: "Nov 2024", industry: "Healthcare",    contact: "Priya Mehta",    email: "pmehta@harborhc.com" },
  { id: "4", name: "Metro Grill Group",       plan: "Free",    users: 9,  mrr: 0,   status: "Active",    since: "Feb 2026", industry: "Food Service",  contact: "Leon Baptiste",  email: "leon@metrogrill.com" },
  { id: "5", name: "Sunshine Farms",          plan: "Starter", users: 31, mrr: 184, status: "Active",    since: "Aug 2024", industry: "Agriculture",   contact: "Rosa Vargas",    email: "rosa@sunshinefarms.com" },
  { id: "6", name: "Bay Area Landscaping",    plan: "Pro",     users: 18, mrr: 0,   status: "Trial",     since: "May 2026", industry: "Landscaping",   contact: "Derek Wu",       email: "derek@balandscape.com" },
];

const PLAN_BADGE: Record<Plan, string> = {
  Free:       "bg-gray-100 text-gray-600",
  Starter:    "bg-blue-50 text-blue-700",
  Pro:        "bg-orange-50 text-orange-700",
  Enterprise: "bg-purple-50 text-purple-700",
};

const STATUS_BADGE: Record<ClientStatus, string> = {
  Active:    "bg-green-50 text-green-700",
  Trial:     "bg-yellow-50 text-yellow-700",
  Suspended: "bg-red-50 text-red-700",
};

const PLANS: Plan[] = ["Free", "Starter", "Pro", "Enterprise"];
const INDUSTRIES = ["Cleaning", "Construction", "Healthcare", "Food Service", "Agriculture", "Landscaping", "Retail", "Other"];

type ProvisionForm = {
  name: string;
  contact: string;
  email: string;
  plan: Plan;
  industry: string;
};

export default function PartnerClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Plan | ClientStatus>("All");
  const [showProvision, setShowProvision] = useState(false);
  const [form, setForm] = useState<ProvisionForm>({
    name: "", contact: "", email: "", plan: "Starter", industry: "Construction",
  });
  const [toast, setToast] = useState<string | null>(null);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchFilter =
      filter === "All" || c.plan === filter || c.status === filter;
    return matchSearch && matchFilter;
  });

  const totalMRR = clients.reduce((s, c) => s + c.mrr, 0);
  const totalUsers = clients.reduce((s, c) => s + c.users, 0);
  const trialCount = clients.filter((c) => c.status === "Trial").length;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function provision() {
    if (!form.name.trim()) return;
    const next: Client = {
      id: String(Date.now()),
      name: form.name.trim(),
      contact: form.contact.trim(),
      email: form.email.trim(),
      plan: form.plan,
      industry: form.industry,
      users: 0,
      mrr: 0,
      status: "Trial",
      since: "May 2026",
    };
    setClients((prev) => [next, ...prev]);
    setShowProvision(false);
    showToast(`${next.name} provisioned successfully.`);
  }

  function upgradePlan(id: string, plan: Plan) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, plan } : c)));
    showToast("Plan updated.");
  }

  function toggleSuspend(id: string) {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Suspended" ? "Active" : "Suspended" }
          : c
      )
    );
  }

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-gray-900 text-white px-5 py-3 text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clients.length} clients · {totalUsers} active users · ${totalMRR}/mo MRR
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ name: "", contact: "", email: "", plan: "Starter", industry: "Construction" });
            setShowProvision(true);
          }}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + Provision Client
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Clients",   value: String(clients.length),      sub: `${trialCount} on trial` },
          { label: "Active Users",    value: String(totalUsers),           sub: "across all accounts" },
          { label: "Monthly Revenue", value: `$${totalMRR}`,              sub: "at 45% wholesale" },
          { label: "Pro Accounts",    value: String(clients.filter(c => c.plan === "Pro").length), sub: "highest tier" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="flex-1 min-w-48 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
        {(["All", "Free", "Starter", "Pro", "Active", "Trial"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Client", "Plan", "Industry", "Contact", "Users", "MRR", "Status", "Since", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold flex-shrink-0">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{client.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PLAN_BADGE[client.plan]}`}>
                    {client.plan}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{client.industry}</td>
                <td className="px-5 py-3.5">
                  <div className="text-gray-700 text-xs font-medium">{client.contact}</div>
                  <div className="text-gray-400 text-xs">{client.email}</div>
                </td>
                <td className="px-5 py-3.5 text-gray-700 font-medium">{client.users}</td>
                <td className="px-5 py-3.5">
                  {client.mrr > 0 ? (
                    <span className="text-gray-800 font-medium">${client.mrr}</span>
                  ) : (
                    <span className="text-gray-400">$0</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[client.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${client.status === "Active" ? "bg-green-500" : client.status === "Trial" ? "bg-yellow-400" : "bg-red-400"}`} />
                    {client.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">{client.since}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2 whitespace-nowrap">
                    <button
                      onClick={() => showToast(`Viewing ${client.name} as admin…`)}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      View as Admin
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => toggleSuspend(client.id)}
                      className={`text-xs font-medium ${client.status === "Suspended" ? "text-green-500 hover:text-green-600" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      {client.status === "Suspended" ? "Reinstate" : "Suspend"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No clients match your search.</div>
        )}
      </div>

      {/* Provision Modal */}
      {showProvision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Provision New Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  placeholder="Acme Corp"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="jane@acme.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value as Plan }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {PLANS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-xs text-orange-700">
                A 14-day free trial will start immediately. The client will receive a setup email.
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProvision(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={provision}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Provision Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
