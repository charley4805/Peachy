"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const SERVICES = [
  {
    slug: "time-attendance",
    label: "Time & Attendance",
    description: "Clock-in/out, GPS punch tracking, timesheets",
    icon: "⏱",
  },
  {
    slug: "scheduling",
    label: "Scheduling",
    description: "Drag-and-drop shift scheduling and templates",
    icon: "📅",
  },
  {
    slug: "time-off",
    label: "Time Off Management",
    description: "PTO accruals, requests, and approvals",
    icon: "🏖",
  },
  {
    slug: "onboarding-training",
    label: "Onboarding & Training",
    description: "New hire flows and training checklists",
    icon: "🎓",
  },
  {
    slug: "documents",
    label: "Document Management",
    description: "Store, share, and e-sign company documents",
    icon: "📄",
  },
  {
    slug: "communications",
    label: "Internal Communications",
    description: "Announcements, team chat, and alerts",
    icon: "💬",
  },
  {
    slug: "engagement",
    label: "Employee Engagement",
    description: "Surveys, recognition, and feedback tools",
    icon: "⭐",
  },
  {
    slug: "forms-checklists",
    label: "Digital Forms & Checklists",
    description: "Custom forms, safety checks, and compliance logs",
    icon: "✅",
  },
] as const;

type ServiceSlug = (typeof SERVICES)[number]["slug"];

export default function ServicesOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<Set<ServiceSlug>>(new Set(["time-attendance"]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.replace("/auth");
      setUser(user);
    });
  }, []);

  function toggle(slug: ServiceSlug) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (selected.size === 0) {
      setError("Please select at least one service.");
      return;
    }
    setError("");
    setLoading(true);

    // Insert selected services
    const rows = Array.from(selected).map((slug) => ({
      user_id: user.id,
      service_slug: slug,
    }));

    const { error: insertError } = await supabase
      .from("user_services")
      .upsert(rows, { onConflict: "user_id,service_slug" });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Mark onboarding complete
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ onboarding_complete: true })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold tracking-tight text-gray-900">Daily</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-200 text-orange-600 text-xs font-bold flex items-center justify-center">
              ✓
            </div>
            <span className="text-sm text-gray-400 hidden sm:block">Your profile</span>
          </div>
          <div className="h-px w-10 bg-orange-200" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Services</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            What will you use Daily for?
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Select everything that applies. You can change this anytime in Settings.
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {SERVICES.map((service) => {
                const isSelected = selected.has(service.slug);
                return (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => toggle(service.slug)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5 flex-shrink-0">
                        {service.icon}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-semibold ${
                            isSelected ? "text-orange-700" : "text-gray-800"
                          }`}
                        >
                          {service.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                          {service.description}
                        </div>
                      </div>
                      <div
                        className={`ml-auto flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-orange-500 border-orange-500"
                            : "border-gray-200"
                        }`}
                      >
                        {isSelected && (
                          <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {selected.size} of {SERVICES.length} selected
              </span>
              <button
                type="submit"
                disabled={loading || selected.size === 0}
                className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 transition-colors"
              >
                {loading ? "Setting up…" : "Get Started →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
