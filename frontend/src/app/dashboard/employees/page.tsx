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
};

const initialEmployees: Employee[] = [
  { id: "1", name: "Marcus Rivera", badge: "EMP-1042", role: "Crew Leader", department: "Construction", payType: "Hourly", rate: "$28.00/hr", status: "Active", hireDate: "Mar 12, 2024" },
  { id: "2", name: "Deja Williams", badge: "EMP-1087", role: "Employee", department: "Construction", payType: "Hourly", rate: "$22.50/hr", status: "Active", hireDate: "Jul 8, 2024" },
  { id: "3", name: "Tom Kowalski", badge: "EMP-1031", role: "Employee", department: "Construction", payType: "Hourly", rate: "$21.00/hr", status: "Active", hireDate: "Jan 5, 2023" },
  { id: "4", name: "Anita Patel", badge: "EMP-1056", role: "Manager", department: "Operations", payType: "Salary", rate: "$72,000/yr", status: "Active", hireDate: "Nov 1, 2022" },
  { id: "5", name: "Carlos Mendoza", badge: "EMP-1063", role: "Employee", department: "Construction", payType: "Piecework", rate: "$3.50/unit", status: "Active", hireDate: "Apr 19, 2024" },
  { id: "6", name: "Jordan Lee", badge: "EMP-1094", role: "Employee", department: "Cleaning", payType: "Hourly", rate: "$18.00/hr", status: "Active", hireDate: "Oct 3, 2024" },
  { id: "7", name: "Patricia Gomez", badge: "EMP-1018", role: "Employee", department: "Healthcare", payType: "Hourly", rate: "$26.00/hr", status: "Inactive", hireDate: "Feb 14, 2022" },
];

const roleBadge: Record<string, string> = {
  Employee: "bg-gray-100 text-gray-600",
  "Crew Leader": "bg-blue-50 text-blue-700",
  Manager: "bg-purple-50 text-purple-700",
  Admin: "bg-orange-50 text-orange-700",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("Construction");
  const [newRole, setNewRole] = useState<Employee["role"]>("Employee");

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.badge.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || e.status === filter || e.department === filter;
    return matchSearch && matchFilter;
  });

  function addEmployee() {
    if (!newName) return;
    const next: Employee = {
      id: String(Date.now()),
      name: newName,
      badge: `EMP-${1100 + employees.length}`,
      role: newRole,
      department: newDept,
      payType: "Hourly",
      rate: "$20.00/hr",
      status: "Active",
      hireDate: "May 15, 2026",
    };
    setEmployees((prev) => [next, ...prev]);
    setNewName("");
    setShowAdd(false);
  }

  function toggleStatus(id: string) {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === "Active" ? "Inactive" : "Active" } : e
      )
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
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + Add Employee
        </button>
      </div>

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Add Employee</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                >
                  {["Construction", "Cleaning", "Healthcare", "Operations", "Agriculture"].map(
                    (d) => <option key={d}>{d}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Employee["role"])}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                >
                  {["Employee", "Crew Leader", "Manager", "Admin"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addEmployee}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or badge…"
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none"
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
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Badge</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Department</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Pay</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Hired</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold">
                      {emp.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="font-medium text-gray-800">{emp.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-500">{emp.badge}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleBadge[emp.role]}`}>
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
                  <div className="flex gap-2">
                    <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">Edit</button>
                    <button
                      onClick={() => toggleStatus(emp.id)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      {emp.status === "Active" ? "Deactivate" : "Activate"}
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
