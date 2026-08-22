"use client";
import { GithubIcon } from "@/shared/components/icons/github";
import { FadeIn } from "@/shared/components/layout/fade-in";

import { Eye, Shield, Wallet, GitBranch, Lock } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";


const FEATURES = [
  {
    icon: GithubIcon,
    title: "GitHub Repo Delivery",
    description: "Buyers get a private repo in GitHub with full commit history and collaboration tools.",
  },
  {
    icon: Eye,
    title: "Live Preview System",
    description: "Preview products in real time before purchase with a polished sandbox experience.",
  },
  {
    icon: Shield,
    title: "Escrow Protection",
    description: "Payments are held in escrow until buyers confirm satisfaction.",
  },
  {
    icon: Wallet,
    title: "Instant Payouts",
    description: "Sellers receive payouts every 7 days directly to their account.",
  },
  {
    icon: GitBranch,
    title: "Update Notifications",
    description: "Buyers receive updates when sellers push changes to their repos.",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    description: "Strong validation, encryption, and secure payment handling keep every transaction safe.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary border border-border text-xs font-semibold tracking-wide uppercase text-foreground mb-4">
              Features
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Everything you need, nothing more
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Build, buy, and sell with a simple marketplace that focuses on code delivery, security,
              and clarity.
            </p>
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.08}>
              <Card className="group h-full border border-border bg-background hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-foreground/10 mb-4 text-foreground">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
