"use client";

import { useState } from "react";

type InvoiceStatus = "Paid" | "Pending" | "Overdue";

type Invoice = {
  id: string;
  period: string;
  issued: string;
  due: string;
  clients: number;
  gross: number;
  wholesale: number;
  partnerEarning: number;
  status: InvoiceStatus;
};

const invoices: Invoice[] = [
  { id: "INV-2026-005", period: "May 2026",   issued: "May 1, 2026",  due: "May 15, 2026", clients: 6, gross: 1329, wholesale: 598, partnerEarning: 598, status: "Pending" },
  { id: "INV-2026-004", period: "Apr 2026",   issued: "Apr 1, 2026",  due: "Apr 15, 2026", clients: 6, gross: 1287, wholesale: 579, partnerEarning: 579, status: "Paid" },
  { id: "INV-2026-003", period: "Mar 2026",   issued: "Mar 1, 2026",  due: "Mar 15, 2026", clients: 5, gross: 1058, wholesale: 476, partnerEarning: 476, status: "Paid" },
  { id: "INV-2026-002", period: "Feb 2026",   issued: "Feb 1, 2026",  due: "Feb 15, 2026", clients: 5, gross: 1001, wholesale: 451, partnerEarning: 451, status: "Paid" },
  { id: "INV-2026-001", period: "Jan 2026",   issued: "Jan 1, 2026",  due: "Jan 15, 2026", clients: 4, gross: 826,  wholesale: 372, partnerEarning: 372, status: "Paid" },
  { id: "INV-2025-012", period: "Dec 2025",   issued: "Dec 1, 2025",  due: "Dec 15, 2025", clients: 4, gross: 814,  wholesale: 366, partnerEarning: 366, status: "Paid" },
];

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  Paid:    "bg-green-50 text-green-700",
  Pending: "bg-yellow-50 text-yellow-700",
  Overdue: "bg-red-50 text-red-700",
};

const PAYOUT_METHODS = ["ACH Direct Deposit", "Check", "Partner Credit"];

export default function PartnerBillingPage() {
  const [payoutMethod, setPayoutMethod] = useState("ACH Direct Deposit");
  const [showPayoutEdit, setShowPayoutEdit] = useState(false);

  const ytdEarnings = invoices
    .filter((i) => i.period.includes("2026"))
    .reduce((s, i) => s + i.partnerEarning, 0);
  const pendingPayout = invoices
    .filter((i) => i.status === "Pending")
    .reduce((s, i) => s + i.partnerEarning, 0);
  const currentMRR = invoices[0].wholesale;

  // Simple sparkline-style MRR data
  const mrrHistory = [372, 451, 476, 579, 598];
  const maxMRR = Math.max(...mrrHistory);

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Revenue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Partner earnings at 45% wholesale · Gold Tier
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ↓ Download Statement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current MRR</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${currentMRR}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-green-600 font-medium">↑ 3.3%</span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">YTD Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${ytdEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Jan–May 2026</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pending Payout</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">${pendingPayout}</p>
          <p className="text-xs text-gray-400 mt-1">Due May 15, 2026</p>
        </div>
      </div>

      {/* MRR chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue Trend</h2>
        <div className="flex items-end gap-3 h-32">
          {mrrHistory.map((mrr, i) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May"];
            const pct = (mrr / maxMRR) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">${mrr}</span>
                <div
                  className="w-full rounded-t-md bg-orange-400 transition-all"
                  style={{ height: `${pct * 0.9}%` }}
                />
                <span className="text-xs text-gray-400">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout method */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Payout Method</h2>
            <p className="text-sm text-gray-500 mt-0.5">{payoutMethod}</p>
          </div>
          {showPayoutEdit ? (
            <div className="flex items-center gap-3">
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              >
                {PAYOUT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <button
                onClick={() => setShowPayoutEdit(false)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPayoutEdit(true)}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Change
            </button>
          )}
        </div>
        <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
          Payouts are processed on the 20th of each month for the prior month's earnings.
          ACH transfers typically arrive within 2 business days.
        </div>
      </div>

      {/* Invoice table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Invoice History</h2>
          <span className="text-xs text-gray-400">{invoices.length} invoices</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Invoice", "Period", "Issued", "Due", "Clients", "Gross Revenue", "Your Earning (45%)", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{inv.id}</td>
                <td className="px-5 py-3.5 font-medium text-gray-800">{inv.period}</td>
                <td className="px-5 py-3.5 text-gray-500">{inv.issued}</td>
                <td className="px-5 py-3.5 text-gray-500">{inv.due}</td>
                <td className="px-5 py-3.5 text-gray-700">{inv.clients}</td>
                <td className="px-5 py-3.5 text-gray-700">${inv.gross.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-gray-900">${inv.partnerEarning.toLocaleString()}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[inv.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${inv.status === "Paid" ? "bg-green-500" : inv.status === "Pending" ? "bg-yellow-400" : "bg-red-400"}`} />
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
