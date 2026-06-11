"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors bg-white";

export default function AcceptInviteForm({
  token,
  employeeName,
  email,
  orgName,
}: {
  token: string;
  employeeName: string;
  email: string;
  orgName: string;
}) {
  const router = useRouter();

  const nameParts = employeeName.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Account created — sign in and head to the employee app
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Account exists; let them sign in manually
        router.push("/auth");
        return;
      }
      router.push("/employee");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 pt-8 pb-6 text-center border-b border-gray-100 bg-orange-50/50">
        <h1 className="text-xl font-bold text-gray-900">
          Welcome, {nameParts[0] ?? "there"}! 👋
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          You&apos;ve been invited to join{" "}
          <span className="font-semibold text-gray-700">{orgName}</span> on Daily.
          Create your account to clock in, see your schedule, and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4" noValidate>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
          />
          <p className="mt-1 text-xs text-gray-400">
            Set by your employer — you&apos;ll use this to sign in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className={inputClass}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} ${
              passwordMismatch
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : ""
            }`}
            autoComplete="new-password"
          />
          {passwordMismatch && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-gray-50 p-4 text-sm">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 flex-shrink-0 cursor-pointer"
          />
          <span className="text-gray-600 leading-relaxed">
            I agree to the{" "}
            <Link
              href="/legal/terms"
              target="_blank"
              className="text-orange-500 hover:text-orange-600 underline underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/privacy"
              target="_blank"
              className="text-orange-500 hover:text-orange-600 underline underline-offset-2"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 transition-colors"
        >
          {loading ? "Creating your account…" : "Create Account & Get Started"}
        </button>
      </form>
    </div>
  );
}
