"use client";
import { FadeIn } from "@/shared/components/layout/fade-in";

import { Check, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";


const COMPARISON = [
  { feature: "Commission Rate", kodedock: "2.5%", codecanyon: "50%", gumroad: "10%" },
  { feature: "GitHub Repo Delivery", kodedock: true, codecanyon: false, gumroad: false },
  { feature: "Payout Cycle", kodedock: "7 days", codecanyon: "30-60 days", gumroad: "Instant" },
  { feature: "Built-in Audience (India)", kodedock: true, codecanyon: false, gumroad: false },
  { feature: "Free Listings", kodedock: true, codecanyon: false, gumroad: true },
  { feature: "Analytics Dashboard", kodedock: true, codecanyon: true, gumroad: true },
];

export function DevCommission() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 bg-secondary/50">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase bg-secondary border border-border text-foreground">
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Keep more of what you earn
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center p-4 font-bold text-primary-foreground bg-primary">
                    KodeDock
                  </th>
                  <th className="text-center p-4 font-medium text-muted-foreground">CodeCanyon</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Gumroad</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARISON.length - 1 ? "border-b border-border" : ""}>
                    <td className="p-4 text-foreground font-medium">{row.feature}</td>
                    <td className="p-4 text-center font-semibold text-foreground">
                      {typeof row.kodedock === "boolean" ? (
                        row.kodedock ? <Check className="w-5 h-5 text-success mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : row.kodedock}
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {typeof row.codecanyon === "boolean" ? (
                        row.codecanyon ? <Check className="w-5 h-5 text-success mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : row.codecanyon}
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {typeof row.gumroad === "boolean" ? (
                        row.gumroad ? <Check className="w-5 h-5 text-success mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : row.gumroad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
