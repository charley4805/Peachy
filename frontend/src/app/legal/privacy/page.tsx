import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Daily",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-orange-500 hover:text-orange-600 font-medium mb-8 inline-block">
          ← Back to Daily
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 20, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Who we are</h2>
            <p>
              Daily (&quot;Daily&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Daily
              workforce management platform available at this domain. This Privacy Policy explains
              how we collect, use, store, and protect your personal data when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Data we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account data:</strong> name, email address, password (hashed), job title, phone, company name, and industry.</li>
              <li><strong>Usage data:</strong> pages visited, features used, timestamps, and IP addresses for security and audit purposes.</li>
              <li><strong>Workforce data:</strong> time punches, schedules, timesheets, and other records you or your employer enter into the platform.</li>
              <li><strong>Communications:</strong> messages you send through in-app messaging features.</li>
              <li><strong>Technical data:</strong> browser type, device identifiers, and session information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providing and improving the Daily platform</li>
              <li>Verifying your identity and maintaining account security</li>
              <li>Sending transactional emails (verification, password reset, account notices)</li>
              <li>Sending product updates and tips, only if you opted in</li>
              <li>Complying with legal obligations and resolving disputes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Legal basis for processing (GDPR)</h2>
            <p>
              For users in the European Economic Area, we process personal data under the following legal bases:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Contract performance</strong> (Art. 6(1)(b)): processing necessary to provide the services you signed up for.</li>
              <li><strong>Legitimate interests</strong> (Art. 6(1)(f)): security monitoring, fraud prevention, and platform analytics.</li>
              <li><strong>Consent</strong> (Art. 6(1)(a)): marketing emails, where you have explicitly opted in.</li>
              <li><strong>Legal obligation</strong> (Art. 6(1)(c)): where required by applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you delete your
              account, we permanently delete your personal data within 30 days, except where we are
              required by law to retain it (e.g., payroll records, which may be subject to statutory
              retention periods of up to 7 years depending on jurisdiction).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your rights</h2>
            <p>Depending on your location, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> inaccurate personal data</li>
              <li><strong>Delete</strong> your account and personal data</li>
              <li><strong>Export</strong> your data in a portable format</li>
              <li><strong>Withdraw consent</strong> for marketing communications at any time</li>
              <li><strong>Object</strong> to processing based on legitimate interests</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, go to <strong>Settings → Privacy</strong> in your Daily
              account, or contact us at privacy@daily.app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Sub-processors</h2>
            <p>
              We share data with the following categories of trusted third-party services to operate
              the platform: cloud infrastructure (database and file storage), transactional email
              delivery, and error monitoring. All sub-processors are contractually bound to process
              data only as instructed and in accordance with applicable data protection law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Security</h2>
            <p>
              We use AES-256 encryption at rest and TLS 1.2+ in transit. Access to personal data
              is restricted to authorised personnel on a need-to-know basis. We maintain audit logs
              of all access to your account data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies</h2>
            <p>
              We use strictly necessary cookies to maintain your authenticated session. We do not
              use third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>
              For privacy questions or to submit a data subject request, email{" "}
              <a href="mailto:privacy@daily.app" className="text-orange-500 hover:text-orange-600">
                privacy@daily.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
