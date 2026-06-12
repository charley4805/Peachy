"use client";

import { useCallback, useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  badge: string;
  role: "Employee" | "Crew Leader" | "Manager" | "Admin";
  department: string | null;
  pay_type: string;
  pay_rate: number | null;
  pay_unit: string;
  status: "Active" | "Inactive";
  hire_date: string | null;
  email: string | null;
  phone: string | null;
  user_id: string | null;
  invite_token: string | null;
  invite_sent_at: string | null;
};

const roleBadge: Record<string, string> = {
  Employee: "bg-gray-100 text-gray-600",
  "Crew Leader": "bg-blue-50 text-blue-700",
  Manager: "bg-purple-50 text-purple-700",
  Admin: "bg-orange-50 text-orange-700",
};

const ROLES: Employee["role"][] = ["Employee", "Crew Leader", "Manager", "Admin"];
const DEPARTMENTS = ["Construction", "Cleaning", "Healthcare", "Operations", "Agriculture"];
const PAY_TYPES = ["Hourly", "Salary", "Piecework"];
const PAY_UNIT: Record<string, string> = { Hourly: "hr", Salary: "yr", Piecework: "unit" };

type FormState = {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: Employee["role"];
  payType: string;
  rate: string;
};

const blankForm: FormState = {
  name: "",
  email: "",
  phone: "",
  department: "Construction",
  role: "Employee",
  payType: "Hourly",
  rate: "20.00",
};

function fmtRate(emp: Employee): string {
  if (emp.pay_rate == null) return "—";
  const amount = Number(emp.pay_rate).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return `${amount}/${emp.pay_unit}`;
}

function fmtHireDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseRate(raw: string): number | null {
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);

  // Invite modal state
  const [inviteFor, setInviteFor] = useState<Employee | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    return fetch("/api/employees")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setEmployees(data))
      .catch(() => setPageError("Could not load employees. Are you signed in?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      e.name.toLowerCase().includes(q) ||
      e.badge.toLowerCase().includes(q) ||
      (e.email ?? "").toLowerCase().includes(q) ||
      (e.phone ?? "").includes(search);
    const matchFilter =
      filter === "All" || e.status === filter || e.department === filter;
    return matchSearch && matchFilter;
  });

  function openAdd() {
    setForm(blankForm);
    setShowAdd(true);
    setEditId(null);
  }

  function openEdit(emp: Employee) {
    setForm({
      name: emp.name,
      email: emp.email ?? "",
      phone: emp.phone ?? "",
      department: emp.department ?? "Construction",
      role: emp.role,
      payType: emp.pay_type,
      rate: emp.pay_rate != null ? String(emp.pay_rate) : "",
    });
    setEditId(emp.id);
    setShowAdd(false);
  }

  function closeModal() {
    setShowAdd(false);
    setEditId(null);
  }

  async function saveAdd() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        role: form.role,
        payType: form.payType,
        payRate: parseRate(form.rate),
        payUnit: PAY_UNIT[form.payType] ?? "hr",
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setPageError(data.error ?? "Could not add employee");
      return;
    }
    setShowAdd(false);
    await load();
  }

  async function saveEdit() {
    if (!editId || !form.name.trim() || saving) return;
    const current = employees.find((e) => e.id === editId);
    setSaving(true);
    const res = await fetch(`/api/employees/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
        role: form.role,
        payType: form.payType,
        payRate: parseRate(form.rate),
        payUnit: PAY_UNIT[form.payType] ?? "hr",
        status: current?.status,
        hireDate: current?.hire_date,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setPageError(data.error ?? "Could not save changes");
      return;
    }
    setEditId(null);
    await load();
  }

  async function doDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/employees/${deleteId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setPageError(data.error ?? "Could not delete employee");
    }
    setDeleteId(null);
    await load();
  }

  async function toggleStatus(emp: Employee) {
    await fetch(`/api/employees/${emp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        department: emp.department,
        role: emp.role,
        payType: emp.pay_type,
        payRate: emp.pay_rate,
        payUnit: emp.pay_unit,
        hireDate: emp.hire_date,
        status: emp.status === "Active" ? "Inactive" : "Active",
      }),
    });
    await load();
  }

  async function sendInvite(emp: Employee) {
    setPageError("");
    if (!emp.email) {
      setPageError(`Add an email address for ${emp.name} first — it becomes their sign-in email.`);
      return;
    }
    setInviteBusy(true);
    const res = await fetch(`/api/employees/${emp.id}/invite`, { method: "POST" });
    const data = await res.json();
    setInviteBusy(false);
    if (!res.ok) {
      setPageError(data.error ?? "Could not create invite link");
      return;
    }
    setInviteFor(emp);
    setInviteUrl(data.invite_url);
    setCopied(false);
    await load();
  }

  function showExistingInvite(emp: Employee) {
    if (!emp.invite_token) return;
    setInviteFor(emp);
    setInviteUrl(`${window.location.origin}/invite/${emp.invite_token}`);
    setCopied(false);
  }

  async function revokeInvite(emp: Employee) {
    await fetch(`/api/employees/${emp.id}/invite`, { method: "DELETE" });
    setInviteFor(null);
    await load();
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the link is visible to copy manually
    }
  }

  const isModalOpen = showAdd || editId !== null;
  const deleteTarget = employees.find((e) => e.id === deleteId);

  function accountCell(emp: Employee) {
    if (emp.user_id) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          ✓ Active
        </span>
      );
    }
    if (emp.invite_token) {
      return (
        <button
          onClick={() => showExistingInvite(emp)}
          className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
          title="View invite link"
        >
          ✉ Invited
        </button>
      );
    }
    return (
      <button
        onClick={() => sendInvite(emp)}
        disabled={inviteBusy}
        className="rounded-full border border-orange-200 px-2.5 py-1 text-xs font-medium text-orange-500 hover:bg-orange-50 disabled:opacity-50"
      >
        Invite
      </button>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">
            {employees.filter((e) => e.status === "Active").length} active ·{" "}
            {employees.filter((e) => e.status === "Inactive").length} inactive
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + Add Employee
        </button>
      </div>

      {pageError && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
          {pageError}
          <button onClick={() => setPageError("")} className="text-red-400 hover:text-red-600 ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Invite Link Modal */}
      {inviteFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Invite link for {inviteFor.name}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Send this link to{" "}
              <span className="font-medium text-gray-700">{inviteFor.email}</span>. They&apos;ll
              use it to create their account and access their schedule, time clock,
              timesheet, PTO, and messages.
            </p>

            <div className="flex gap-2 mb-5">
              <input
                readOnly
                value={inviteUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-mono text-gray-600 focus:outline-none"
              />
              <button
                onClick={copyInvite}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 flex-shrink-0"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <a
                  href={`mailto:${inviteFor.email}?subject=${encodeURIComponent(
                    "Your Daily account invite"
                  )}&body=${encodeURIComponent(
                    `Hi ${inviteFor.name.split(" ")[0]},\n\nCreate your Daily account here:\n${inviteUrl}\n\nYou'll be able to clock in and out, see your schedule, request time off, and message the team.`
                  )}`}
                  className="text-sm font-medium text-orange-500 hover:text-orange-600"
                >
                  Open in email →
                </a>
                <button
                  onClick={() => revokeInvite(inviteFor)}
                  className="text-sm text-red-400 hover:text-red-600"
                >
                  Revoke link
                </button>
              </div>
              <button
                onClick={() => setInviteFor(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-8 pt-8 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {showAdd ? "Add Employee" : "Edit Employee"}
              </h2>
            </div>

            <div className="overflow-y-auto px-8 py-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="Jane Smith"
                    autoFocus
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (needed to invite them to the app)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="jane@company.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone{" "}
                    <span className="text-xs text-gray-400 font-normal">(geo-location)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="(555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value as Employee["role"] }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pay Type
                  </label>
                  <select
                    value={form.payType}
                    onChange={(e) => setForm((f) => ({ ...f, payType: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {PAY_TYPES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate (${PAY_UNIT[form.payType] ? `per ${PAY_UNIT[form.payType]}` : ""})
                  </label>
                  <input
                    type="text"
                    value={form.rate}
                    onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="20.00"
                  />
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={showAdd ? saveAdd : saveEdit}
                disabled={saving}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? "Saving…" : showAdd ? "Add Employee" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Employee?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently remove{" "}
              <span className="font-medium text-gray-800">{deleteTarget?.name}</span> from
              your roster. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, badge, email, or phone…"
          className="flex-1 min-w-48 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
        {["All", "Active", "Inactive", "Construction", "Cleaning", "Healthcare"].map((f) => (
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
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Badge
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Contact
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Role
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Pay
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                App Account
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold flex-shrink-0">
                      {emp.name
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{emp.name}</div>
                      <div className="text-xs text-gray-400">
                        {emp.department ?? "—"} · since {fmtHireDate(emp.hire_date)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-500">{emp.badge}</td>
                <td className="px-5 py-3.5">
                  <div className="text-gray-700 text-xs">{emp.email || "—"}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{emp.phone || "—"}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleBadge[emp.role]}`}
                  >
                    {emp.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-gray-700">{fmtRate(emp)}</div>
                  <div className="text-xs text-gray-400">{emp.pay_type}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      emp.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        emp.status === "Active" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {emp.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">{accountCell(emp)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2 items-center whitespace-nowrap">
                    <button
                      onClick={() => openEdit(emp)}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Edit
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => toggleStatus(emp)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      {emp.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => setDeleteId(emp.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading employees…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {employees.length === 0
              ? "No employees yet. Click “+ Add Employee” to build your roster."
              : "No employees match your search."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
