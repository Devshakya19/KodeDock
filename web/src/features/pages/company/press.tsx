import { StaticPageLayout } from "../shared/static-layout";
import { Card, CardContent } from "@/shared/ui/card";

export default function PressPage() {
  return (
    <StaticPageLayout
      title="Press Kit"
      description="Resources for media, journalists, and content creators."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">About CodeHaat</h2>
          <p className="text-slate-600 leading-relaxed">
            CodeHaat is India&apos;s #1 digital code marketplace where developers buy and sell
            production-grade code assets. Unlike traditional platforms, CodeHaat delivers code
            directly to buyers&apos; GitHub accounts as private repositories.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">Key Facts</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Founded", value: "2026" },
              { label: "Headquarters", value: "India (Remote-first)" },
              { label: "Industry", value: "Digital Goods Marketplace" },
              { label: "Commission Rate", value: "2.5% (lowest in market)" },
              { label: "Target Market", value: "Indian developers, students, designers" },
              { label: "Key Feature", value: "GitHub repo delivery (no .zip files)" },
            ].map((fact) => (
              <div key={fact.label} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <span className="text-sm font-medium text-slate-700">{fact.label}</span>
                <span className="text-sm font-semibold text-slate-950">{fact.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">Brand Assets</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Download official CodeHaat brand assets for use in articles, presentations, and media coverage.
          </p>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { name: "CodeHaat Logo (SVG)", size: "2 KB" },
                  { name: "CodeHaat Logo (PNG)", size: "50 KB" },
                  { name: "Social Media Banner", size: "200 KB" },
                  { name: "Brand Guidelines PDF", size: "1.2 MB" },
                ].map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{asset.name}</span>
                    <span className="text-xs text-slate-500">{asset.size}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-slate-950 mb-4">Press Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            For press inquiries, interviews, or media requests, please contact us at{" "}
            <a href="mailto:press@codehaat.com" className="text-blue-600 hover:underline">
              press@codehaat.com
            </a>
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
