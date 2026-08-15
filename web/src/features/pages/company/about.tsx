import { StaticPageLayout } from "../shared/static-layout";

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="About CodeHaat"
      description="India's #1 Digital Code Marketplace — Where Code Meets Commerce"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">Our Story</h2>
          <p className="text-slate-600 leading-relaxed">
            CodeHaat was born from a simple observation: Indian developers create thousands of
            valuable projects every year but have no affordable platform to sell them. Global
            alternatives charge 20-55% commission and distribute static .zip files — that&apos;s not
            the experience our community deserves.
          </p>
          <p className="text-slate-600 leading-relaxed mt-4">
            We built CodeHaat to change that. A marketplace where developers can monetize their
            code with just 2.5% commission, where buyers get production-ready code delivered
            directly to their GitHub accounts, and where the Indian developer community can thrive.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            To democratize the digital economy by providing every developer, student, and designer
            an affordable, powerful platform to monetize their creations — with seamless GitHub
            integration that delivers production-grade code directly to buyers&apos; accounts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {[
              { title: "Fair Commerce", desc: "2.5% commission ensures creators keep what they earn" },
              { title: "Developer First", desc: "Built by developers, for developers — GitHub integration, not .zip files" },
              { title: "Quality First", desc: "Curated listings, verified sellers, quality assurance" },
              { title: "Community Driven", desc: "Built-in forums, reviews, seller profiles" },
              { title: "Affordable Access", desc: "Making production-grade code accessible to students" },
              { title: "Transparency", desc: "Clear pricing, instant payouts, no hidden fees" },
            ].map((value) => (
              <div key={value.title} className="p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-950 mb-1">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">The Opportunity</h2>
          <p className="text-slate-600 leading-relaxed">
            The Indian developer ecosystem has over <strong>8 million developers</strong> and
            <strong>500,000+ CS students</strong> graduating annually. These creators build
            thousands of projects, templates, and tools every year but have no affordable,
            localized platform to monetize them. CodeHaat fills this gap with a 2.5% commission
            rate (lowest in the market), automatic GitHub repo delivery, and a focus on
            affordability for both buyers and sellers.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
