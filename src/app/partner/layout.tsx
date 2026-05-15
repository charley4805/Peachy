"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/partner", label: "Overview", icon: "⊞" },
  { href: "/partner/clients", label: "Clients", icon: "🏢" },
  { href: "/partner/billing", label: "Billing", icon: "💳" },
  { href: "/partner/branding", label: "Branding", icon: "🎨" },
];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-56 flex-shrink-0 bg-gray-900 flex flex-col">
        <div className="px-5 py-5 flex flex-col border-b border-gray-800">
          <div className="flex items-center gap-2.5 mb-1">
            <Image src="/hourglass.png" alt="GlassHour" width={24} height={24} />
            <span className="font-bold text-white">GlassHour</span>
          </div>
          <span className="text-xs text-orange-400 font-medium">Partner Portal</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            ← Admin Dashboard
          </Link>
        </div>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              CP
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">ClearPalm Inc.</div>
              <div className="text-xs text-orange-400">Gold Partner</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
