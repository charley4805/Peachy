import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: "📡",
    title: "Offline-First",
    description:
      "Mobile apps work for 14+ consecutive days without connectivity. Field crews punch in from construction sites, farms, and remote locations — syncs automatically on reconnect.",
  },
  {
    icon: "📍",
    title: "GPS & Geofencing",
    description:
      "Every punch is stamped with GPS coordinates. Validate punches against job-site geofences in warn, require, or off modes. Map view shows all punches by pay period.",
  },
  {
    icon: "🏗️",
    title: "Job Costing",
    description:
      "Hierarchical Customer → Job → Phase → Task structure. Real-time labor cost dashboard with budget tracking, variance flags, and QuickBooks / CSV export.",
  },
  {
    icon: "📅",
    title: "Drag-and-Drop Scheduling",
    description:
      "Weekly, daily, and monthly views. Shift templates, copy-week, conflict detection, and one-click publish to employees' mobile apps with push notifications.",
  },
  {
    icon: "🤝",
    title: "Partner / Reseller Program",
    description:
      "Wholesale pricing at 40–50% of retail for payroll providers, PEOs, and bookkeepers. White-label branding, self-service partner portal, and tiered co-op marketing.",
  },
  {
    icon: "📋",
    title: "Compliance Forms",
    description:
      "Pluggable JSON-schema form engine. Pre-built templates for OSHA construction, food safety, H-2A agriculture, healthcare, and cleaning — attach to any punch event.",
  },
  {
    icon: "⚙️",
    title: "Piecework Pay Engine",
    description:
      "Piece-rate, hourly+piece blends, and weight-based pay. Group piecework with per-employee proration. FLSA-compliant minimum-wage make-up calculations.",
  },
  {
    icon: "🏦",
    title: "Payroll Exports",
    description:
      "Pre-configured export formats for ADP RUN, Gusto, QuickBooks Payroll, Paychex, and more. Pay-period close workflow with lock and re-export protection.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    description: "Perfect for small teams just getting started.",
    features: [
      "Up to 10 employees",
      "All core features",
      "GPS punch tracking",
      "Offline mode",
      "Mobile apps (iOS + Android)",
      "Team chat",
      "Open REST API",
    ],
    cta: "Get Started Free",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    per: "/mo + $5/user",
    description: "For growing teams that need scheduling and PTO.",
    features: [
      "Everything in Free",
      "Drag-and-drop scheduling",
      "PTO accruals & requests",
      "Advanced GPS geofencing",
      "Payroll exports",
      "Standard reports",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    per: "/mo + $7/user",
    description: "Built for field service, construction, and agriculture.",
    features: [
      "Everything in Starter",
      "Full job costing",
      "Piecework pay engine",
      "Compliance form library",
      "Multi-location controls",
      "Custom report builder",
      "Clock-out questions",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/login",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "pricing",
    description: "For large organizations and channel partners.",
    features: [
      "Everything in Pro",
      "Hardware time clocks",
      "ATS & onboarding",
      "SSO / SCIM",
      "POS integrations",
      "White-label branding",
      "Dedicated CSM",
    ],
    cta: "Contact Sales",
    href: "/login",
    highlighted: false,
  },
];

const competitors = [
  { name: "ClockShark", gap: "No native payroll; PTO gated behind Pro tier" },
  { name: "Connecteam", gap: "Hub-stacked pricing; no offline mode" },
  { name: "SwipeClock", gap: "Partner-only pricing; aging UX" },
  { name: "FieldClock", gap: "Agriculture-only; limited integrations" },
  { name: "Homebase", gap: "Per-location pricing; no job costing; no piecework" },
];

export default function Home() {
  return (
    <div className="min-h-full bg-white font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/hourglass.png" alt="Peachy" width={32} height={32} />
            <span className="text-xl font-bold text-gray-900">Peachy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
            <a href="#partners" className="hover:text-gray-900">Partners</a>
            <Link href="/partner" className="hover:text-gray-900">Partner Portal</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/employee-portal"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Employee Portal
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 mb-8">
          <span className="h-2 w-2 rounded-full bg-orange-500"></span>
          Now in beta — free for up to 10 employees
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Time & attendance built for{" "}
          <span className="text-orange-500">the field</span> and the office
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-500 leading-relaxed">
          Offline-first, industry-specific, hardware-capable, and priced for
          both end users and the partners who serve them. The platform five
          incumbents can&apos;t match individually.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-full bg-orange-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            Start Free — No Credit Card
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-gray-200 px-8 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Demo Dashboard
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          Free forever up to 10 employees · No credit card required
        </p>
      </section>

      {/* Why Peachy */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400 mb-10">
            Each competitor forces a tradeoff. Peachy doesn&apos;t.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {competitors.map((c) => (
              <div
                key={c.name}
                className="rounded-xl bg-white border border-gray-100 p-5"
              >
                <div className="font-semibold text-gray-800">{c.name}</div>
                <div className="mt-1 text-sm text-gray-500">{c.gap}</div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-gray-500 text-sm max-w-2xl mx-auto">
            Peachy combines the job-costing depth of ClockShark, the free tier of
            Connecteam, the channel economics of SwipeClock, the offline engine of
            FieldClock, and the POS integrations of Homebase — in one product.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Every feature your team needs
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Built for construction, field service, agriculture, cleaning,
            healthcare, and hospitality.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 hover:border-orange-200 hover:shadow-sm transition-all"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Offline callout */}
      <section className="bg-orange-500 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center text-white">
          <div className="text-5xl mb-6">📡</div>
          <h2 className="text-3xl font-bold mb-4">
            14 days offline. Zero data loss.
          </h2>
          <p className="text-lg text-orange-100 leading-relaxed max-w-2xl mx-auto">
            A field crew on a construction site or remote farm with no cell
            service can punch in and out, switch jobs, log piecework, and submit
            compliance forms — all with full UI fidelity. Everything syncs the
            moment they reconnect.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 text-sm font-medium">
            Encrypted local database · Conflict resolution · Sync status indicator
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Pricing that scales with your business
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Active-user billing, pro-rated daily. 15% discount for annual
            commitment.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? "bg-orange-500 text-white shadow-xl shadow-orange-200"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div
                className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
                  plan.highlighted ? "text-orange-100" : "text-gray-400"
                }`}
              >
                {plan.name}
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span
                  className={`text-4xl font-bold ${
                    plan.highlighted ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm mb-1 ${
                    plan.highlighted ? "text-orange-100" : "text-gray-400"
                  }`}
                >
                  {plan.per}
                </span>
              </div>
              <p
                className={`text-sm mb-6 ${
                  plan.highlighted ? "text-orange-100" : "text-gray-500"
                }`}
              >
                {plan.description}
              </p>
              <ul className="flex-1 space-y-2 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 ${
                        plan.highlighted ? "text-orange-200" : "text-orange-500"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={
                        plan.highlighted ? "text-orange-50" : "text-gray-600"
                      }
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-orange-600 hover:bg-orange-50"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-400">
          Single-location plan available: $24/mo per location, unlimited
          employees — designed for restaurants and retail.
        </p>
      </section>

      {/* Partner section */}
      <section id="partners" className="bg-gray-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-400 mb-6">
                Channel Partner Program
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Grow your practice with Peachy
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Payroll providers, PEOs, bookkeepers, and CPA firms earn
                40–50% wholesale pricing. White-label under your own brand.
                Your clients, your margin.
              </p>
              <ul className="space-y-3">
                {[
                  "Wholesale pricing at 40–50% of retail",
                  "White-label and co-brand options",
                  "Self-service partner portal with provisioning",
                  "Bronze, Silver, Gold tiers with co-op marketing",
                  "Monthly invoice by client — transparent breakdown",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="text-orange-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/partner"
                  className="inline-block rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                >
                  Apply to Partner Program
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Wholesale Discount", value: "40–50%" },
                { label: "Setup Time", value: "< 1 day" },
                { label: "White-label", value: "Included" },
                { label: "Partner Tiers", value: "3 levels" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/5 border border-white/10 p-6"
                >
                  <div className="text-3xl font-bold text-orange-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Ready to replace your time-tracking spreadsheet?
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Free for up to 10 employees. No credit card. No setup fee.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-full bg-orange-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            Create Free Account
          </Link>
          <Link
            href="/employee-portal"
            className="rounded-full border border-gray-200 px-8 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Employee Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/hourglass.png" alt="Peachy" width={24} height={24} />
            <span className="font-semibold text-gray-700">Peachy</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-gray-600">Features</a>
            <a href="#pricing" className="hover:text-gray-600">Pricing</a>
            <a href="#partners" className="hover:text-gray-600">Partners</a>
            <Link href="/login" className="hover:text-gray-600">Sign In</Link>
          </div>
          <div className="text-sm text-gray-400">
            © 2026 Peachy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
