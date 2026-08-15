"use client";
import { FadeIn } from "@/shared/components/fade-in";

import { Check, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";


const COMPARISON = [
  { feature: "Commission Rate", codehaat: "2.5%", codecanyon: "50%", gumroad: "10%" },
  { feature: "GitHub Repo Delivery", codehaat: true, codecanyon: false, gumroad: false },
  { feature: "Payout Cycle", codehaat: "7 days", codecanyon: "30-60 days", gumroad: "Instant" },
  { feature: "Built-in Audience (India)", codehaat: true, codecanyon: false, gumroad: false },
  { feature: "Free Listings", codehaat: true, codecanyon: false, gumroad: true },
  { feature: "Analytics Dashboard", codehaat: true, codecanyon: true, gumroad: true },
];

export function DevCommission() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase bg-slate-100 border border-slate-300 text-slate-900">
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Keep more of what you earn
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 font-medium text-slate-600">Feature</th>
                  <th className="text-center p-4 font-bold text-white bg-slate-950">
                    CodeHaat
                  </th>
                  <th className="text-center p-4 font-medium text-slate-600">CodeCanyon</th>
                  <th className="text-center p-4 font-medium text-slate-600">Gumroad</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARISON.length - 1 ? "border-b border-slate-100" : ""}>
                    <td className="p-4 text-slate-700 font-medium">{row.feature}</td>
                    <td className="p-4 text-center font-semibold text-slate-950">
                      {typeof row.codehaat === "boolean" ? (
                        row.codehaat ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : row.codehaat}
                    </td>
                    <td className="p-4 text-center text-slate-500">
                      {typeof row.codecanyon === "boolean" ? (
                        row.codecanyon ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
                      ) : row.codecanyon}
                    </td>
                    <td className="p-4 text-center text-slate-500">
                      {typeof row.gumroad === "boolean" ? (
                        row.gumroad ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
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
