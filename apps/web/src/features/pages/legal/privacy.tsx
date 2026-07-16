import { StaticPageLayout } from "../shared/static-layout";

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      description="How we collect, use, and protect your information."
    >
      <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
        <p><em>Last updated: July 2026</em></p>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Account Information:</strong> Name, email address, password (hashed)</li>
            <li><strong>Profile Data:</strong> Bio, avatar, website, location</li>
            <li><strong>GitHub Data:</strong> Username, repository URLs (for product linking)</li>
            <li><strong>Payment Data:</strong> Payment method details (processed by Razorpay, not stored by us)</li>
            <li><strong>Content:</strong> Products you list, reviews you write</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and maintain our marketplace services</li>
            <li>To process transactions and deliver purchased code</li>
            <li>To send account-related communications</li>
            <li>To improve our platform and user experience</li>
            <li>To prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">3. Data Sharing</h2>
          <p>We do not sell your personal information. We share data only with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Service Providers:</strong> PostgreSQL (database), Razorpay (payments), GitHub (code delivery)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">4. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption, secure
            authentication, and regular security audits. All payment data is processed by
            Razorpay and never stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">5. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">6. Contact</h2>
          <p>
            For privacy-related inquiries, contact us at{" "}
            <a href="mailto:privacy@codehaat.com" className="text-blue-600 hover:underline">
              privacy@codehaat.com
            </a>
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
