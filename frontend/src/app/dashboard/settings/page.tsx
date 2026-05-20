"use client";

import { useState } from "react";

type Tab = "account" | "locations" | "pay-rules" | "pto" | "compliance" | "integrations";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("account");
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "locations", label: "Locations & Geofences" },
    { id: "pay-rules", label: "Pay Rules" },
    { id: "pto", label: "PTO Policies" },
    { id: "compliance", label: "Compliance Forms" },
    { id: "integrations", label: "Integrations" },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        {saved && (
          <span className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg font-medium">
            Saved ✓
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.id
                ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50/50"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "account" && <AccountTab onSave={save} />}
      {tab === "locations" && <LocationsTab onSave={save} />}
      {tab === "pay-rules" && <PayRulesTab onSave={save} />}
      {tab === "pto" && <PTOTab onSave={save} />}
      {tab === "compliance" && <ComplianceTab onSave={save} />}
      {tab === "integrations" && <IntegrationsTab onSave={save} />}
    </div>
  );
}

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  const [val, setVal] = useState(value);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none"
      />
    </div>
  );
}

function AccountTab({ onSave }: { onSave: () => void }) {
  return (
    <div className="max-w-xl space-y-5">
      <Field label="Company Name" value="ClearPalm Contracting" />
      <Field label="Primary Contact Email" value="gustavo@clearpalm.com" type="email" />
      <Field label="Phone Number" value="(305) 555-0142" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
        <select className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none">
          {["Construction", "Cleaning", "Healthcare", "Agriculture", "Field Service", "Hospitality"].map((i) => (
            <option key={i} selected={i === "Construction"}>{i}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Period</label>
        <select className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none">
          <option>Semi-monthly (1st and 15th)</option>
          <option>Bi-weekly</option>
          <option>Weekly</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
        <select className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none">
          <option>Eastern Time (ET)</option>
          <option>Central Time (CT)</option>
          <option>Mountain Time (MT)</option>
          <option>Pacific Time (PT)</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onSave}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function LocationsTab({ onSave }: { onSave: () => void }) {
  const locations = [
    { name: "Riverside Complex", address: "1200 River Blvd, Miami, FL 33101", radius: "300 ft", mode: "Warn" },
    { name: "Harbor View", address: "900 Harbor Dr, Miami Beach, FL 33139", radius: "200 ft", mode: "Require" },
    { name: "Metro Clinic", address: "450 Brickell Ave, Miami, FL 33131", radius: "150 ft", mode: "Warn" },
    { name: "Office", address: "12 SW 8th St, Miami, FL 33130", radius: "500 ft", mode: "Off" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Define work sites and GPS geofence rules per location.</p>
        <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          + Add Location
        </button>
      </div>
      <div className="space-y-3">
        {locations.map((loc) => (
          <div key={loc.name} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-800">{loc.name}</div>
                <div className="text-sm text-gray-400 mt-0.5">{loc.address}</div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-xs text-gray-400">Geofence radius</span>
                  <div className="font-medium text-gray-700">{loc.radius}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Validation mode</span>
                  <div className={`font-medium ${loc.mode === "Require" ? "text-orange-600" : loc.mode === "Warn" ? "text-amber-600" : "text-gray-400"}`}>
                    {loc.mode}
                  </div>
                </div>
                <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PayRulesTab({ onSave }: { onSave: () => void }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-6">
        Configure overtime rules, rounding, and break enforcement. All calculations are FLSA-compliant.
      </p>
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Overtime Rules</h3>
          <div className="space-y-3">
            {[
              { label: "Weekly overtime threshold", value: "40 hours (FLSA Federal)" },
              { label: "Daily overtime threshold", value: "None (not CA/AK/NV)" },
              { label: "Overtime multiplier", value: "1.5× regular rate" },
              { label: "Double-time threshold", value: "Not configured" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-600">{r.label}</span>
                <span className="font-medium text-gray-800">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Rounding</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Rounding increment</span>
              <select className="rounded border border-gray-200 px-3 py-1 text-sm focus:border-orange-400 focus:outline-none">
                <option>Nearest 15 minutes</option>
                <option>Nearest 6 minutes</option>
                <option>Nearest minute</option>
              </select>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rounding direction</span>
              <select className="rounded border border-gray-200 px-3 py-1 text-sm focus:border-orange-400 focus:outline-none">
                <option>FLSA 7-minute (neutral)</option>
                <option>Always round down</option>
                <option>Always round up</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Break Enforcement</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-orange-500" />
              <span className="text-gray-600">Require 30-minute unpaid break after 6 hours worked</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-500" />
              <span className="text-gray-600">Require 10-minute paid rest break per 4 hours worked</span>
            </label>
          </div>
        </div>
        <button
          onClick={onSave}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Save Pay Rules
        </button>
      </div>
    </div>
  );
}

function PTOTab({ onSave }: { onSave: () => void }) {
  const policies = [
    { name: "Full-Time PTO", accrual: "3.08 hrs / pay period", maxBalance: "80 hrs", carryover: "40 hrs", waitPeriod: "90 days" },
    { name: "Sick Leave", accrual: "1 hr / 30 hrs worked", maxBalance: "40 hrs", carryover: "40 hrs", waitPeriod: "None" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">PTO accrual policies applied to employee groups.</p>
        <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          + Add Policy
        </button>
      </div>
      <div className="space-y-4">
        {policies.map((p) => (
          <div key={p.name} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-800">{p.name}</h3>
              <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">Edit</button>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              {[
                { label: "Accrual Rate", value: p.accrual },
                { label: "Max Balance", value: p.maxBalance },
                { label: "Year-End Carryover", value: p.carryover },
                { label: "Eligibility Wait", value: p.waitPeriod },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                  <div className="font-medium text-gray-700">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-3">Leave Types</h3>
        <div className="flex flex-wrap gap-2">
          {["PTO", "Sick", "Vacation", "Bereavement", "Jury Duty", "FMLA (Unpaid)", "+ Add Type"].map((t) => (
            <span
              key={t}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${t.startsWith("+") ? "border border-dashed border-gray-300 text-gray-400 cursor-pointer hover:border-orange-300 hover:text-orange-500" : "bg-orange-50 text-orange-700"}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComplianceTab({ onSave }: { onSave: () => void }) {
  const templates = [
    { name: "OSHA Toolbox Talk", industry: "Construction", trigger: "Clock-in", fields: 4, active: true },
    { name: "Equipment Inspection", industry: "Construction", trigger: "Job Start", fields: 8, active: true },
    { name: "Food Safety HACCP Log", industry: "Restaurant", trigger: "Clock-in", fields: 6, active: false },
    { name: "H-2A Daily Activity Record", industry: "Agriculture", trigger: "Clock-out", fields: 5, active: false },
    { name: "PPE Attestation", industry: "Healthcare", trigger: "Clock-in", fields: 3, active: false },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">
          Form templates defined by JSON schema. Attach to clock events per location.
        </p>
        <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          + New Template
        </button>
      </div>
      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t.name} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
            <div>
              <div className="font-medium text-gray-800">{t.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {t.industry} · Trigger: {t.trigger} · {t.fields} fields
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                  t.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                }`}
              >
                {t.active ? "Active" : "Inactive"}
              </span>
              <button className="text-xs text-orange-500 hover:text-orange-600 font-medium">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsTab({ onSave }: { onSave: () => void }) {
  const integrations = [
    { name: "ADP RUN", category: "Payroll", status: "Connected", logo: "🏦" },
    { name: "QuickBooks Online", category: "Accounting", status: "Connected", logo: "📘" },
    { name: "Gusto", category: "Payroll", status: "Not connected", logo: "🌿" },
    { name: "Toast POS", category: "Point of Sale", status: "Not connected", logo: "🍞" },
    { name: "Square", category: "Point of Sale", status: "Not connected", logo: "⬛" },
    { name: "Rippling", category: "Payroll", status: "Not connected", logo: "🔵" },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Connect Daily to your payroll provider, accounting system, and POS.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {integrations.map((i) => (
          <div key={i.name} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{i.logo}</span>
              <div>
                <div className="font-semibold text-gray-800">{i.name}</div>
                <div className="text-xs text-gray-400">{i.category}</div>
              </div>
            </div>
            <button
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                i.status === "Connected"
                  ? "bg-green-50 text-green-700"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {i.status === "Connected" ? "Connected ✓" : "Connect"}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-gray-50 rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-2">REST API & Webhooks</h3>
        <p className="text-sm text-gray-500 mb-4">
          Use the Daily API to build custom integrations. OAuth 2.0 + API key authentication.
        </p>
        <div className="flex gap-3">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            View API Docs
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Generate API Key
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Configure Webhooks
          </button>
        </div>
      </div>
    </div>
  );
}
