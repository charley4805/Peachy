"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Mode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const filled = score <= 1 ? 1 : score <= 2 ? 2 : score <= 3 ? 3 : 4;
  const color = score <= 1 ? "bg-red-400" : score <= 2 ? "bg-yellow-400" : score <= 3 ? "bg-blue-400" : "bg-green-400";
  const label = score <= 1 ? "Weak" : score <= 2 ? "Fair" : score <= 3 ? "Good" : "Strong";
  const labelColor = score <= 1 ? "text-red-500" : score <= 2 ? "text-yellow-600" : score <= 3 ? "text-blue-600" : "text-green-600";

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= filled ? color : "bg-gray-100"}`} />
        ))}
      </div>
      <span className={`text-xs font-medium ${labelColor}`}>{label} password</span>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-colors bg-white";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      );
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !signupEmail || !signupPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("consent_records").insert([
        { user_id: data.user.id, consent_type: "terms", consented: true },
        { user_id: data.user.id, consent_type: "privacy", consented: true },
        { user_id: data.user.id, consent_type: "marketing", consented: marketingConsent },
      ]);
    }
    router.push("/auth/verify");
  }

  const passwordMismatch = confirmPassword.length > 0 && confirmPassword !== signupPassword;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold tracking-tight text-gray-900">Daily</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Workforce management, simplified</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  mode === m
                    ? "text-orange-500 border-b-2 border-orange-500 bg-orange-50/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-60 transition-all"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">or continue with email</span>
              </div>
            </div>

            {mode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button
                      type="button"
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 transition-colors mt-1"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
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
                      placeholder="Smith"
                      className={inputClass}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={inputClass}
                    autoComplete="new-password"
                  />
                  <PasswordStrength password={signupPassword} />
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

                <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
                  <label className="flex items-start gap-3 cursor-pointer">
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
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-gray-500 leading-relaxed">
                      Send me product updates and tips{" "}
                      <span className="text-gray-400">(optional)</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Employee?{" "}
          <Link
            href="/employee-portal"
            className="text-orange-500 font-medium hover:text-orange-600"
          >
            Use the employee portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
