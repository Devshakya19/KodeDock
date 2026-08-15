import { StaticPageLayout } from "../shared/static-layout";

export default function LicensePage() {
  return (
    <StaticPageLayout
      title="License Agreement"
      description="Terms governing the use of purchased code on CodeHaat."
    >
      <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
        <p><em>Last updated: July 2026</em></p>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">1. License Grant</h2>
          <p>
            Upon purchase, you receive a non-exclusive, perpetual license to use the code
            as specified by the seller. This license is tied to your CodeHaat account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">2. What You Can Do</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the code in personal and commercial projects</li>
            <li>Modify the code to suit your needs</li>
            <li>Use the code in client projects (if permitted by seller)</li>
            <li>Keep the code indefinitely</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">3. What You Cannot Do</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Redistribute or resell the code as-is</li>
            <li>Share the GitHub repository with others</li>
            <li>Use the code to create competing products</li>
            <li>Remove copyright notices from the code</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">4. Seller Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must own or have rights to all code you list</li>
            <li>You must provide accurate descriptions</li>
            <li>You must maintain the code for a reasonable period</li>
            <li>You must respond to buyer issues within 48 hours</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-3">5. License Updates</h2>
          <p>
            When a seller pushes updates to a repository, buyers receive notifications.
            Updated code is delivered to the buyer&apos;s GitHub repository automatically.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
