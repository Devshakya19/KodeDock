"use client";
import { FadeIn } from "@/shared/components/fade-in";

import { Check, X } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";


const COMPARISON = [
  { feature: "Commission Rate", codehaat: "2.5%", codecanyon: "20-55%", gumroad: "10%" },
  { feature: "Delivery Method", codehaat: "GitHub Repo", codecanyon: ".zip File", gumroad: "File Download" },
  { feature: "Live Preview", codehaat: true, codecanyon: false, gumroad: false },
  { feature: "Escrow System", codehaat: true, codecanyon: false, gumroad: false },
  { feature: "Wallet System", codehaat: true, codecanyon: false, gumroad: false },
  { feature: "Indian Focus", codehaat: true, codecanyon: false, gumroad: false },
  { feature: "INR Payments", codehaat: "Native", codecanyon: "Converted", gumroad: "Converted" },
  { feature: "Payout Speed", codehaat: "7 days", codecanyon: "30-60 days", gumroad: "7 days" },
  { feature: "Student Assets", codehaat: true, codecanyon: false, gumroad: "Limited" },
  { feature: "Buyer Protection", codehaat: "48h Escrow", codecanyon: "Basic", gumroad: "Limited" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-slate-950 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-slate-400 mx-auto" />
    );
  }
  return <span className="text-sm text-slate-950">{value}</span>;
}

export function PricingComparison() {
  return (
    <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-semibold tracking-wide uppercase text-slate-900 mb-4">
              Pricing
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              Why pay more when you can pay less?
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Compare our simple pricing and delivery model against the rest.
            </p>
          </FadeIn>
        </div>

        <FadeIn>
          <div className="overflow-x-auto">
            <Card className="border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-left text-slate-950">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-1/3">Feature</th>
                    <th className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <Badge className="bg-slate-950 text-white border-0 px-3 py-1 text-xs font-bold shadow-sm shadow-slate-200/50">
                          RECOMMENDED
                        </Badge>
                        <span className="text-base font-bold">CodeHaat</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">CodeCanyon</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Gumroad</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-slate-200 last:border-0 ${i % 2 === 0 ? "bg-slate-50" : ""}`}>
                      <td className="px-6 py-3.5 text-sm font-medium text-slate-950">{row.feature}</td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-950">
                        <CellValue value={row.codehaat} />
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-600">
                        <CellValue value={row.codecanyon} />
                      </td>
                      <td className="px-6 py-3.5 text-center text-slate-600">
                        <CellValue value={row.gumroad} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
