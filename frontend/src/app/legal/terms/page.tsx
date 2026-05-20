import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Daily",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-orange-500 hover:text-orange-600 font-medium mb-8 inline-block">
          ← Back to Daily
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 20, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of terms</h2>
            <p>
              By creating an account or using Daily (&quot;Service&quot;), you agree to these Terms of
              Service. If you are using the Service on behalf of an organisation, you represent that
              you have authority to bind that organisation to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of service</h2>
            <p>
              Daily is a workforce management platform that includes time and attendance tracking,
              employee scheduling, time-off management, document management, and related features.
              We reserve the right to modify, suspend, or discontinue any part of the Service at
              any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Your account</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your password.</li>
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You must promptly notify us of any unauthorised use of your account.</li>
              <li>You may not share your account with others or use automated means to access the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Acceptable use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe the intellectual property rights of others</li>
              <li>Transmit malware, spam, or other harmful content</li>
              <li>Attempt to gain unauthorised access to any system or data</li>
              <li>Reverse-engineer or attempt to extract source code from the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Your data</h2>
            <p>
              You retain ownership of all data you input into the Service. By using the Service,
              you grant Daily a limited licence to process your data solely to provide the Service
              to you. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Payment and billing</h2>
            <p>
              Paid plans are billed monthly or annually as selected at checkout. All fees are
              non-refundable except as required by law or as otherwise stated in writing. We reserve
              the right to change pricing with 30 days&apos; notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Disclaimer of warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind, express or implied.
              We do not warrant that the Service will be error-free, uninterrupted, or meet your
              specific requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Daily shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of
              profits or revenues, arising out of your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p>
              You may cancel your account at any time. We may terminate or suspend your account
              immediately if you breach these Terms. Upon termination, your right to use the Service
              ceases, and we will delete your data in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Governing law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which Daily is incorporated,
              without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>
              Questions about these Terms?{" "}
              <a href="mailto:legal@daily.app" className="text-orange-500 hover:text-orange-600">
                legal@daily.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
