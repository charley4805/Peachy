"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useMe } from "../me-context";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

function fmtPay(rate: number | null, unit: string): string {
  if (rate == null) return "—";
  const amount = Number(rate).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return `${amount}/${unit}`;
}

export default function EmployeeProfilePage() {
  const router = useRouter();
  const { employee, org_name } = useMe();

  const [phone, setPhone] = useState(employee.phone ?? "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [savedPhone, setSavedPhone] = useState(employee.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function savePhone() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not save");
      return;
    }
    setSavedPhone(phone);
    setEditingPhone(false);
  }

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    await Promise.all([
      supabase.auth.signOut(),
      fetch("/api/portal/logout", { method: "POST" }).catch(() => {}),
    ]);
    // Badge+PIN sessions go back to the portal; accounts to the sign-in page
    router.replace(data.session ? "/auth" : "/employee-portal");
  }

  const details: { label: string; value: string }[] = [
    { label: "Badge ID", value: employee.badge },
    { label: "Role", value: employee.role },
    { label: "Department", value: employee.department ?? "—" },
    { label: "Pay", value: `${fmtPay(employee.pay_rate, employee.pay_unit)} (${employee.pay_type})` },
    {
      label: "Hire date",
      value: employee.hire_date
        ? new Date(`${employee.hire_date}T12:00:00`).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "—",
    },
    { label: "Email", value: employee.email ?? "—" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Identity card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
          {initials(employee.name)}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{employee.name}</h2>
        <p className="text-sm text-gray-500">
          {employee.role}
          {org_name ? ` at ${org_name}` : ""}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {details.map((d) => (
          <div key={d.label} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-500">{d.label}</span>
            <span className="text-sm font-medium text-gray-800 text-right">{d.value}</span>
          </div>
        ))}

        {/* Phone — the one field employees manage themselves */}
        <div className="flex items-center justify-between px-5 py-3.5 gap-3">
          <span className="text-sm text-gray-500 flex-shrink-0">Phone</span>
          {editingPhone ? (
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-40 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-right focus:border-orange-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={savePhone}
                disabled={busy}
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => {
                  setPhone(savedPhone);
                  setEditingPhone(false);
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-800">
                {savedPhone || "—"}
              </span>
              <button
                onClick={() => setEditingPhone(true)}
                className="text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 px-1">
        Something look wrong? Your employer manages your role, pay, and email —
        message them from the Messages tab.
      </p>

      <button
        onClick={signOut}
        disabled={signingOut}
        className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-100 disabled:opacity-50 transition-colors"
      >
        {signingOut ? "Signing out…" : "Sign Out"}
      </button>
    </div>
  );
}
