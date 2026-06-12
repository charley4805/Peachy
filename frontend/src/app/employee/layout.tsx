"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MeContext, type Me } from "./me-context";

const nav = [
  { href: "/employee", label: "Home", icon: "⏱️" },
  { href: "/employee/schedule", label: "Schedule", icon: "📅" },
  { href: "/employee/time-off", label: "Time Off", icon: "🌴" },
  { href: "/employee/timesheet", label: "Timesheet", icon: "🗒️" },
  { href: "/employee/messages", label: "Messages", icon: "💬" },
  { href: "/employee/profile", label: "Profile", icon: "👤" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/me");
      if (res.status === 401) {
        router.replace("/auth");
        return;
      }
      if (!res.ok) {
        setDenied(true);
        return;
      }
      setMe(await res.json());
    }
    load();
  }, [router]);

  async function signOut() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    await Promise.all([
      supabase.auth.signOut(),
      fetch("/api/portal/logout", { method: "POST" }).catch(() => {}),
    ]);
    // Badge+PIN sessions go back to the portal; accounts to the sign-in page
    router.replace(data.session ? "/auth" : "/employee-portal");
  }

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm text-center">
          <div className="text-4xl mb-3">🪪</div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            No employee profile found
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Your account isn&apos;t linked to an employee record. If you&apos;re a
            manager, head to the dashboard — otherwise ask your manager to send
            you an invite link.
          </p>
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="block rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Go to dashboard
            </Link>
            <button
              onClick={signOut}
              className="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Image src="/hourglass.png" alt="Daily" width={24} height={24} />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <MeContext.Provider value={me}>
      <div className="min-h-screen bg-orange-50 md:flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 flex-shrink-0 bg-gray-900 flex-col fixed inset-y-0">
          <div className="px-5 py-5 flex items-center gap-2.5 border-b border-gray-800">
            <Image src="/hourglass.png" alt="Daily" width={28} height={28} />
            <div className="min-w-0">
              <div className="font-bold text-white text-lg leading-tight">Daily</div>
              <div className="text-xs text-gray-400 truncate">{me.org_name}</div>
            </div>
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
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t border-gray-800 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials(me.employee.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">
                {me.employee.name}
              </div>
              <div className="text-xs text-gray-400 font-mono">{me.employee.badge}</div>
            </div>
          </div>
        </aside>

        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/hourglass.png" alt="Daily" width={24} height={24} />
            <span className="font-bold text-gray-900">{me.org_name ?? "Daily"}</span>
          </div>
          <Link
            href="/employee/profile"
            className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold"
          >
            {initials(me.employee.name)}
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 md:ml-56 pb-20 md:pb-0">
          <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                  active ? "text-orange-500" : "text-gray-400"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </MeContext.Provider>
  );
}
