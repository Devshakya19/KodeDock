import { StaticPageLayout } from "@/shared/components/layout/static-layout";
import { Card, CardContent } from "@/shared/ui/card";

export default function PressPage() {
  return (
    <StaticPageLayout
      title="Press Kit"
      description="Resources for media, journalists, and content creators."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">About KodeDock</h2>
          <p className="text-muted-foreground leading-relaxed">
            KodeDock is India&apos;s #1 digital code marketplace where developers buy and sell
            production-grade code assets. Unlike traditional platforms, KodeDock delivers code
            directly to buyers&apos; GitHub accounts as private repositories.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Key Facts</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Founded", value: "2026" },
              { label: "Headquarters", value: "India (Remote-first)" },
              { label: "Industry", value: "Digital Goods Marketplace" },
              { label: "Commission Rate", value: "2.5% (lowest in market)" },
              { label: "Target Market", value: "Indian developers, students, designers" },
              { label: "Key Feature", value: "GitHub repo delivery (no .zip files)" },
            ].map((fact) => (
              <div key={fact.label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-sm font-medium text-foreground">{fact.label}</span>
                <span className="text-sm font-semibold text-foreground">{fact.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Brand Assets</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Download official KodeDock brand assets for use in articles, presentations, and media coverage.
          </p>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { name: "KodeDock Logo (SVG)", size: "2 KB" },
                  { name: "KodeDock Logo (PNG)", size: "50 KB" },
                  { name: "Social Media Banner", size: "200 KB" },
                  { name: "Brand Guidelines PDF", size: "1.2 MB" },
                ].map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm font-medium text-foreground">{asset.name}</span>
                    <span className="text-xs text-muted-foreground">{asset.size}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Press Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For press inquiries, interviews, or media requests, please contact us at{" "}
            <a href="mailto:press@kodedock.com" className="text-accent hover:underline">
              press@kodedock.com
            </a>
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
