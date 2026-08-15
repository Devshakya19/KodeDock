"use client";
import { GithubIcon } from "@/shared/components/github-icon";
import { FadeIn } from "@/shared/components/fade-in";

import Link from "next/link";
import { Check, FileCode2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";


const SELLER_PERKS = [
  "Keep 97.5% of every sale — lowest commission in the market",
  "Link your GitHub repo, set a price, and you're live",
  "Get paid every 7 days — no 30-60 day wait",
  "Full analytics dashboard with views, sales, and earnings",
  "Push updates to your repo and buyers get notified",
  "Free listing — no upfront costs, ever",
];

export function SellerSection() {
  return (
    <section id="sellers" className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeIn direction="right">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary border-primary/20"
            >
              For Sellers
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Turn your side projects into{" "}
              <span className="gradient-text">passive income</span>
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Every developer has projects gathering dust on GitHub. Monetize them with zero effort.
              Link your repo, set your price, and let CodeHaat handle everything else — from payments
              to delivery to support.
            </p>
            <div className="mt-8 space-y-3">
              {SELLER_PERKS.map((perk) => (
                <div key={perk} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-slate-700 leading-relaxed">{perk}</span>
                </div>
              ))}
            </div>
            <Link href="/developer">
              <Button
                size="lg"
                className="mt-8 shadow-lg shadow-primary/25 hover:shadow-primary/35"
              >
                <GithubIcon className="mr-2 w-5 h-5" />
                Start Selling Today
              </Button>
            </Link>
          </FadeIn>

          <FadeIn direction="left" delay={0.2}>
            <div className="relative">
              <Card className="border-border/60 shadow-2xl shadow-black/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-border/60 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Seller Dashboard</div>
                      <div className="text-xs text-muted-foreground">This month&apos;s earnings</div>
                    </div>
                    <Badge className="bg-brand-green/10 text-brand-green border-0 text-xs font-semibold">
                      +24% vs last month
                    </Badge>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                    <div className="text-xs text-muted-foreground font-medium">Total Revenue</div>
                    <div className="text-2xl font-bold mt-1">₹47,850</div>
                    <div className="text-xs text-brand-green mt-1 font-medium">↑ 24% growth</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                    <div className="text-xs text-muted-foreground font-medium">Total Sales</div>
                    <div className="text-2xl font-bold mt-1">128</div>
                    <div className="text-xs text-brand-green mt-1 font-medium">↑ 18% growth</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                    <div className="text-xs text-muted-foreground font-medium">Commission (2.5%)</div>
                    <div className="text-2xl font-bold mt-1">₹1,196</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">Platform fee</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
                    <div className="text-xs text-muted-foreground font-medium">You Keep</div>
                    <div className="text-2xl font-bold mt-1 text-brand-green">₹46,654</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">97.5% of sales</div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Recent Sales
                  </div>
                  {[
                    { product: "Next.js SaaS Starter", amount: "₹999", time: "2 min ago" },
                    { product: "Tailwind Admin Dashboard", amount: "₹499", time: "15 min ago" },
                    { product: "React Portfolio Template", amount: "₹249", time: "1 hour ago" },
                  ].map((sale) => (
                    <div
                      key={sale.product}
                      className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <FileCode2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{sale.product}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{sale.amount}</div>
                        <div className="text-[11px] text-muted-foreground">{sale.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl -z-10" />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
