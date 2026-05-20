"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const INDUSTRIES = [
  "Construction",
  "Healthcare",
  "Retail",
  "Hospitality",
  "Field Services",
  "Agriculture",
  "Manufacturing",
  "Cleaning & Janitorial",
  "Transportation & Logistics",
  "Other",
];

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors bg-white";

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.replace("/auth");
      setUser(user);
      // Pre-populate from Google metadata if available
      const meta = user.user_metadata;
      if (meta?.avatar_url) setAvatarPreview(meta.avatar_url);
    });
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar must be under 5 MB.");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Avatar upload failed. You can add one later in Settings.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");

    if (!companyName.trim() || !industry) {
      setError("Company name and industry are required.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        job_title: jobTitle.trim() || null,
        phone: phone.trim() || null,
        company_name: companyName.trim(),
        industry,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding/services");
  }

  const initials =
    user?.user_metadata?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold tracking-tight text-gray-900">Daily</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Your profile</span>
          </div>
          <div className="h-px w-10 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">
              2
            </div>
            <span className="text-sm text-gray-400 hidden sm:block">Services</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Complete your profile</h1>
          <p className="text-sm text-gray-500 mb-8">
            This helps your team recognize you and personalises your experience.
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <div
                className="relative h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-orange-500">{initials}</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <span className="text-white text-xs font-medium">
                    {uploading ? "Uploading…" : "Change"}
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Upload photo"}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Operations Manager"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
                inputMode="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Construction LLC"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Industry <span className="text-red-400">*</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={`${inputClass} ${!industry ? "text-gray-400" : "text-gray-900"}`}
                required
              >
                <option value="" disabled>Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? "Saving…" : "Continue →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
