import { StaticPageLayout } from "../shared/static-layout";

export default function RefundPage() {
  return (
    <StaticPageLayout
      title="Refund Policy"
      description="Our policies regarding refunds and returns."
    >
      <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
        <p><em>Last updated: July 2026</em></p>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">1. General Policy</h2>
          <p>
            All sales on CodeHaat are final. However, we understand that sometimes things
            don&apos;t work as expected. We offer a 48-hour dispute window for all purchases.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">2. Eligible for Refund</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Product does not match the description</li>
            <li>Code is broken or non-functional</li>
            <li>Product is not as advertised</li>
            <li>Dispute raised within 48 hours of purchase</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">3. Not Eligible for Refund</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Change of mind after 48 hours</li>
            <li>Product works as described but doesn&apos;t meet expectations</li>
            <li>Incompatibility with your specific setup</li>
            <li>Requests made after code has been significantly modified</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">4. How to Request a Refund</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Go to your Order History</li>
            <li>Select the order you want to dispute</li>
            <li>Click &quot;Raise Dispute&quot;</li>
            <li>Provide details about the issue</li>
            <li>Our team will review within 48 hours</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">5. Refund Processing</h2>
          <p>
            Approved refunds are processed within 5-7 business days. The refund amount
            is credited back to the original payment method.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
