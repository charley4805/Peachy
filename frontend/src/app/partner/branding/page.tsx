"use client";

import { useState } from "react";

const PRESET_PALETTES = [
  { name: "Orange (Default)", primary: "#f97316", accent: "#ea580c", text: "#1f2937" },
  { name: "Teal",             primary: "#0d9488", accent: "#0f766e", text: "#1f2937" },
  { name: "Indigo",           primary: "#6366f1", accent: "#4f46e5", text: "#1f2937" },
  { name: "Rose",             primary: "#f43f5e", accent: "#e11d48", text: "#1f2937" },
  { name: "Slate",            primary: "#475569", accent: "#334155", text: "#1f2937" },
];

type BrandSettings = {
  appName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  customDomain: string;
  supportEmail: string;
  logoUrl: string;
  faviconUrl: string;
  hideParentBranding: boolean;
  customLoginMessage: string;
};

const DEFAULT_SETTINGS: BrandSettings = {
  appName: "Daily",
  tagline: "Workforce made simple.",
  primaryColor: "#f97316",
  accentColor: "#ea580c",
  textColor: "#1f2937",
  customDomain: "",
  supportEmail: "",
  logoUrl: "",
  faviconUrl: "",
  hideParentBranding: false,
  customLoginMessage: "",
};

export default function PartnerBrandingPage() {
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"identity" | "colors" | "domain" | "email">("identity");

  function set<K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function applyPalette(p: (typeof PRESET_PALETTES)[0]) {
    setSettings((s) => ({
      ...s,
      primaryColor: p.primary,
      accentColor: p.accent,
      textColor: p.text,
    }));
    setSaved(false);
  }

  function saveSettings() {
    setSaved(true);
  }

  const tabs = [
    { id: "identity", label: "Identity" },
    { id: "colors",   label: "Colors" },
    { id: "domain",   label: "Domain & Login" },
    { id: "email",    label: "Email Templates" },
  ] as const;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branding & White-Label</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize Daily for your clients · Gold Tier feature
          </p>
        </div>
        <button
          onClick={saveSettings}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            saved
              ? "bg-green-500 text-white"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: settings panel */}
        <div className="col-span-2 space-y-6">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Identity tab */}
          {activeTab === "identity" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-700">App Identity</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App / Product Name</label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => set("appName", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  placeholder="YourBrand"
                />
                <p className="text-xs text-gray-400 mt-1">Replaces "Daily" in the app UI and emails.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  placeholder="Workforce made simple."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 text-gray-300 text-xs">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="logo" className="max-h-12 max-w-28 object-contain" />
                    ) : (
                      "No logo"
                    )}
                  </div>
                  <div className="space-y-2">
                    <button className="block rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Upload Logo
                    </button>
                    <p className="text-xs text-gray-400">PNG or SVG, 200×60px recommended</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 text-gray-300 text-[10px]">
                    {settings.faviconUrl ? (
                      <img src={settings.faviconUrl} alt="favicon" className="w-8 h-8 object-contain" />
                    ) : (
                      "ico"
                    )}
                  </div>
                  <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Upload Favicon
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Hide "Powered by Daily" footer</p>
                  <p className="text-xs text-gray-400 mt-0.5">Remove the parent branding from your clients' UI.</p>
                </div>
                <button
                  onClick={() => set("hideParentBranding", !settings.hideParentBranding)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.hideParentBranding ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      settings.hideParentBranding ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Colors tab */}
          {activeTab === "colors" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-700">Brand Colors</h2>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Preset Palettes</p>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_PALETTES.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyPalette(p)}
                      title={p.name}
                      className={`group flex flex-col items-center gap-1.5 rounded-xl p-2 border-2 transition-all ${
                        settings.primaryColor === p.primary
                          ? "border-gray-900"
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-full shadow-sm"
                        style={{ backgroundColor: p.primary }}
                      />
                      <span className="text-[10px] text-gray-500 text-center leading-tight">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => set("primaryColor", e.target.value)}
                      className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => set("primaryColor", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => set("accentColor", e.target.value)}
                      className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => set("accentColor", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => set("textColor", e.target.value)}
                      className="h-10 w-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={settings.textColor}
                      onChange={(e) => set("textColor", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Domain tab */}
          {activeTab === "domain" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-700">Custom Domain & Login</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.customDomain}
                    onChange={(e) => set("customDomain", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                    placeholder="app.yourbrand.com"
                  />
                  <button className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Verify DNS
                  </button>
                </div>
                <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500 font-mono">
                  Add a CNAME record: <strong>app.yourbrand.com</strong> → <strong>white-label.dailyapp.io</strong>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email (shown to clients)</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => set("supportEmail", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none"
                  placeholder="support@yourbrand.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login Page Message</label>
                <textarea
                  value={settings.customLoginMessage}
                  onChange={(e) => set("customLoginMessage", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none resize-none"
                  placeholder="Welcome to YourBrand! Sign in to manage your team."
                />
              </div>
            </div>
          )}

          {/* Email tab */}
          {activeTab === "email" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-700">Email Templates</h2>
              <p className="text-sm text-gray-500">
                Customize the transactional emails your clients receive. Your brand colors and logo
                are applied automatically.
              </p>
              <div className="space-y-3">
                {[
                  { name: "Welcome / Account Created", desc: "Sent when a new account is provisioned." },
                  { name: "Schedule Published",         desc: "Notifies employees when a new schedule goes live." },
                  { name: "Timesheet Approved",         desc: "Sent to employees when their timesheet is approved." },
                  { name: "PTO Request Received",       desc: "Confirmation sent to employees after submitting PTO." },
                  { name: "PTO Approved / Denied",      desc: "Sent after a manager reviews a PTO request." },
                  { name: "Password Reset",             desc: "Standard password reset flow." },
                ].map((tpl) => (
                  <div
                    key={tpl.name}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-5 py-4 hover:border-orange-200 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{tpl.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tpl.desc}</p>
                    </div>
                    <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Live Preview</h2>

          {/* Mini app preview */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Fake sidebar */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ backgroundColor: settings.textColor }}
            >
              <div
                className="h-6 w-6 rounded"
                style={{ backgroundColor: settings.primaryColor }}
              />
              <span className="text-white text-sm font-bold">{settings.appName || "YourBrand"}</span>
            </div>
            {/* Fake content */}
            <div className="bg-gray-50 p-4 space-y-2">
              <div className="h-3 w-24 rounded-full" style={{ backgroundColor: settings.primaryColor, opacity: 0.3 }} />
              <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-1.5">
                <div className="h-2 w-32 bg-gray-200 rounded-full" />
                <div className="h-2 w-24 bg-gray-200 rounded-full" />
              </div>
              <button
                className="w-full rounded-lg py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Clock In
              </button>
            </div>
          </div>

          {/* Color swatches */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Palette</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg h-10" style={{ backgroundColor: settings.primaryColor }} title="Primary" />
              <div className="flex-1 rounded-lg h-10" style={{ backgroundColor: settings.accentColor }} title="Accent" />
              <div className="flex-1 rounded-lg h-10" style={{ backgroundColor: settings.textColor }} title="Text" />
            </div>
            <div className="flex gap-2 text-[10px] text-gray-400">
              <span className="flex-1 text-center">Primary</span>
              <span className="flex-1 text-center">Accent</span>
              <span className="flex-1 text-center">Text</span>
            </div>
          </div>

          {/* Domain status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Domain</p>
            {settings.customDomain ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-sm text-gray-700 font-mono">{settings.customDomain}</span>
                <span className="text-xs text-yellow-600">Pending</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No custom domain set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
