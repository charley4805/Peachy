"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/dashboard/employees", label: "Employees", icon: "👥" },
  { href: "/dashboard/timesheets", label: "Timesheets", icon: "🗒️" },
  { href: "/dashboard/schedule", label: "Schedule", icon: "📅" },
  { href: "/dashboard/jobs", label: "Jobs", icon: "🏗️" },
  { href: "/dashboard/reports", label: "Reports", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-gray-800">
          <Image src="/hourglass.png" alt="Daily" width={28} height={28} />
          <span className="font-bold text-white text-lg">Daily</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-0.5">
          <Link
            href="/partner"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🤝</span> Partner Portal
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              GF
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">
                Gustavo Fernandez
              </div>
              <div className="text-xs text-gray-400">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
