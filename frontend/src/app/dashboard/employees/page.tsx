"use client";

import { useState } from "react";

type Employee = {
  id: string;
  name: string;
  badge: string;
  role: "Employee" | "Crew Leader" | "Manager" | "Admin";
  department: string;
  payType: string;
  rate: string;
  status: "Active" | "Inactive";
  hireDate: string;
  email: string;
  phone: string;
};

const initialEmployees: Employee[] = [
  { id: "1", name: "Marcus Rivera", badge: "EMP-1042", role: "Crew Leader", department: "Construction", payType: "Hourly", rate: "$28.00/hr", status: "Active", hireDate: "Mar 12, 2024", email: "marcus.rivera@example.com", phone: "(555) 201-4421" },
  { id: "2", name: "Deja Williams", badge: "EMP-1087", role: "Employee", department: "Construction", payType: "Hourly", rate: "$22.50/hr", status: "Active", hireDate: "Jul 8, 2024", email: "deja.williams@example.com", phone: "(555) 309-8812" },
  { id: "3", name: "Tom Kowalski", badge: "EMP-1031", role: "Employee", department: "Construction", payType: "Hourly", rate: "$21.00/hr", status: "Active", hireDate: "Jan 5, 2023", email: "tom.kowalski@example.com", phone: "(555) 418-3304" },
  { id: "4", name: "Anita Patel", badge: "EMP-1056", role: "Manager", department: "Operations", payType: "Salary", rate: "$72,000/yr", status: "Active", hireDate: "Nov 1, 2022", email: "anita.patel@example.com", phone: "(555) 507-2215" },
  { id: "5", name: "Carlos Mendoza", badge: "EMP-1063", role: "Employee", department: "Construction", payType: "Piecework", rate: "$3.50/unit", status: "Active", hireDate: "Apr 19, 2024", email: "carlos.mendoza@example.com", phone: "(555) 614-9987" },
  { id: "6", name: "Jordan Lee", badge: "EMP-1094", role: "Employee", department: "Cleaning", payType: "Hourly", rate: "$18.00/hr", status: "Active", hireDate: "Oct 3, 2024", email: "jordan.lee@example.com", phone: "(555) 723-5530" },
  { id: "7", name: "Patricia Gomez", badge: "EMP-1018", role: "Employee", department: "Healthcare", payType: "Hourly", rate: "$26.00/hr", status: "Inactive", hireDate: "Feb 14, 2022", email: "patricia.gomez@example.com", phone: "(555) 832-6678" },
];

const roleBadge: Record<string, string> = {
  Employee: "bg-gray-100 text-gray-600",
  "Crew Leader": "bg-blue-50 text-blue-700",
  Manager: "bg-purple-50 text-purple-700",
  Admin: "bg-orange-50 text-orange-700",
};

const ROLES: Employee["role"][] = ["Employee", "Crew Leader", "Manager", "Admin"];
const DEPARTMENTS = ["Construction", "Cleaning", "Healthcare", "Operations", "Agriculture"];
const PAY_TYPES = ["Hourly", "Salary", "Piecework"];

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
  rate: "$20.00/hr",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.badge.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search);
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
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      role: emp.role,
      payType: emp.payType,
      rate: emp.rate,
    });
    setEditId(emp.id);
    setShowAdd(false);
  }

  function closeModal() {
    setShowAdd(false);
    setEditId(null);
  }

  function saveAdd() {
    if (!form.name.trim()) return;
    const next: Employee = {
      id: String(Date.now()),
      name: form.name.trim(),
      badge: `EMP-${1100 + employees.length}`,
      role: form.role,
      department: form.department,
      payType: form.payType,
      rate: form.rate,
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: "Active",
      hireDate: "May 25, 2026",
    };
    setEmployees((prev) => [next, ...prev]);
    setShowAdd(false);
  }

  function saveEdit() {
    if (!editId || !form.name.trim()) return;
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === editId
          ? {
              ...e,
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              department: form.department,
              role: form.role,
              payType: form.payType,
              rate: form.rate,
            }
          : e
      )
    );
    setEditId(null);
  }

  function doDelete() {
    if (!deleteId) return;
    setEmployees((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteId(null);
  }

  function toggleStatus(id: string) {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === "Active" ? "Inactive" : "Active" }
          : e
      )
    );
  }

  const isModalOpen = showAdd || editId !== null;
  const deleteTarget = employees.find((e) => e.id === deleteId);

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
                    Email Address
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
                    Rate
                  </label>
                  <input
                    type="text"
                    value={form.rate}
                    onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="$20.00/hr"
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
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                {showAdd ? "Add Employee" : "Save Changes"}
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
                Department
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Pay
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Hired
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
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
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-gray-800">{emp.name}</span>
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
                <td className="px-5 py-3.5 text-gray-600">{emp.department}</td>
                <td className="px-5 py-3.5">
                  <div className="text-gray-700">{emp.rate}</div>
                  <div className="text-xs text-gray-400">{emp.payType}</div>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{emp.hireDate}</td>
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
                      onClick={() => toggleStatus(emp.id)}
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
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No employees match your search.
          </div>
        )}
      </div>
    </div>
  );
}
