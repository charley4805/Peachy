"use client";

import Link from "next/link";

const clients = [
  { name: "Coastal Cleaning Co.", plan: "Pro", users: 14, status: "Active", mrr: "$147.00", since: "Feb 2026" },
  { name: "Sunrise Roofing", plan: "Starter", users: 7, status: "Active", mrr: "$64.00", since: "Mar 2026" },
  { name: "Harbor Healthcare", plan: "Pro", users: 22, status: "Active", mrr: "$203.00", since: "Jan 2026" },
  { name: "Metro Grill Group", plan: "Free", users: 9, status: "Active", mrr: "$0.00", since: "Apr 2026" },
  { name: "Sunshine Farms", plan: "Starter", users: 31, status: "Active", mrr: "$184.00", since: "Apr 2026" },
  { name: "Bay Area Landscaping", plan: "Pro", users: 18, status: "Trial", mrr: "$0.00", since: "May 2026" },
];

const stats = [
  { label: "Total Clients", value: "6", sub: "5 paid, 1 trial" },
  { label: "Active Users", value: "101", sub: "across all clients" },
  { label: "Monthly Revenue", value: "$598", sub: "at 45% wholesale" },
  { label: "Tier", value: "Gold", sub: "Silver at $800 MRR", highlight: true },
];

export default function PartnerOverviewPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Overview</h1>
          <p className="text-sm text-gray-500 mt-1">ClearPalm Inc. — Gold Partner</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Download Invoice
          </button>
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            + Provision Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-5 ${
              s.highlight
                ? "border-orange-200 bg-orange-50"
                : "border-gray-100 bg-white"
            }`}
          >
            <div className="text-sm text-gray-500 mb-2">{s.label}</div>
            <div className={`text-3xl font-bold ${s.highlight ? "text-orange-600" : "text-gray-900"}`}>
              {s.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Clients */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Client Accounts</h2>
          <Link href="/partner/clients" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
            Manage all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Client</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Plan</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Active Users</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">MRR</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Since</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-6 py-3.5 font-medium text-gray-800">{c.name}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      c.plan === "Pro"
                        ? "bg-orange-50 text-orange-700"
                        : c.plan === "Starter"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.plan}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right text-gray-700">{c.users}</td>
                <td className="px-6 py-3.5 text-right font-medium text-gray-900">{c.mrr}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      c.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-gray-400">{c.since}</td>
                <td className="px-6 py-3.5">
                  <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    View as Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tier Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Partner Tier Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { tier: "Bronze", min: "$0", max: "$299 MRR", active: false },
            { tier: "Silver", min: "$300", max: "$799 MRR", active: false },
            { tier: "Gold", min: "$800", max: "MRR+", active: true },
          ].map((t) => (
            <div
              key={t.tier}
              className={`rounded-xl p-4 border text-center ${
                t.active
                  ? "border-orange-300 bg-orange-50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className={`text-sm font-bold mb-1 ${t.active ? "text-orange-600" : "text-gray-400"}`}>
                {t.tier} {t.active && "✓"}
              </div>
              <div className={`text-xs ${t.active ? "text-orange-500" : "text-gray-400"}`}>
                {t.min} – {t.max}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          You&apos;re at <span className="font-semibold text-orange-600">$598 MRR</span>. Reach $800 MRR to unlock Gold tier benefits including co-op marketing funds and a dedicated account manager.
        </p>
        <div className="mt-3 h-2 rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-orange-400" style={{ width: "74.75%" }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$598 current</span>
          <span>$800 Gold threshold</span>
        </div>
      </div>
    </div>
  );
}
