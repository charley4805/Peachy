import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6">📬</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          We sent a verification link to your email address. Click the link to
          verify your account and continue setting up Daily.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left space-y-3 mb-8">
          {[
            "Check your spam or junk folder if you don't see it",
            "The link expires after 24 hours",
            "Make sure you used the right email address",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="text-orange-400 font-bold mt-0.5 flex-shrink-0">·</span>
              {tip}
            </div>
          ))}
        </div>

        <Link
          href="/auth"
          className="text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
