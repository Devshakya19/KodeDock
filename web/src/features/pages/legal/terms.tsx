import { StaticPageLayout } from "../shared/static-layout";

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="Terms of Service"
      description="The rules and guidelines for using CodeHaat."
    >
      <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
        <p><em>Last updated: July 2026</em></p>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CodeHaat, you agree to be bound by these Terms of Service.
            If you do not agree, do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">2. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must be at least 18 years old to create an account</li>
            <li>You are responsible for maintaining account security</li>
            <li>One account per person — no duplicate accounts</li>
            <li>Seller accounts require additional verification</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">3. Buying on CodeHaat</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All purchases are final after the 48-hour dispute window</li>
            <li>Purchased code is delivered as a private GitHub repository</li>
            <li>You receive a license to use the code as per the seller&apos;s terms</li>
            <li>Refunds are only available within 48 hours of purchase if the product is defective</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">4. Selling on CodeHaat</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must own the rights to all code you list</li>
            <li>CodeHaat charges a 2.5% commission on each sale</li>
            <li>Payouts are processed every 7 days</li>
            <li>You are responsible for product support and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">5. Intellectual Property</h2>
          <p>
            Sellers retain ownership of their code. CodeHaat receives a license to distribute
            the code to buyers as part of the marketplace transaction. Buyers receive a license
            to use the code as specified by the seller.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">6. Limitation of Liability</h2>
          <p>
            CodeHaat is not liable for any damages arising from the use of purchased code.
            We facilitate transactions but do not guarantee code quality or performance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">7. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the platform
            constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
