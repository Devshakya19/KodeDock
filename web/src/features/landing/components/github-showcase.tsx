"use client";
import { GithubIcon } from "@/shared/components/github-icon";
import { FadeIn } from "@/shared/components/fade-in";

import { Layers, Lock, GitBranch, Star, Check, X } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";


const GH_STEPS = [
  { icon: Layers, title: "Seller links repo", desc: "Connect GitHub, choose a repo, and set your price." },
  { icon: Lock, title: "Buyer pays", desc: "Payment is held in escrow until the buyer confirms satisfaction." },
  { icon: GitBranch, title: "Repo created", desc: "A private repository is delivered to the buyer's GitHub account." },
  { icon: Star, title: "Clone & build", desc: "Buyer clones the repo and begins building immediately." },
];

export function GithubShowcase() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-semibold tracking-wide uppercase text-slate-900 mb-4">
              GitHub Integration
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              Code delivered as a real repository
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              No static downloads, no zip files. Every purchase becomes a private GitHub repo.
            </p>
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GH_STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.1}>
              <div className="relative">
                {i < GH_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-slate-200" />
                )}
                <div className="relative z-10 text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950 text-white mb-4 mx-auto lg:mx-0">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase mb-2">
                    Step 0{i + 1}
                  </div>
                  <h3 className="text-base font-bold mb-2 text-slate-950">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-16">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-6">
                <div className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-4">
                  Other Platforms
                </div>
                <ul className="space-y-2.5 text-slate-600">
                  {[
                    "Static .zip file download",
                    "No version control",
                    "No updates after purchase",
                    "No collaboration tools",
                    "Dead, static code",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-slate-50">
              <CardContent className="p-6">
                <div className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-4">
                  CodeHaat
                </div>
                <ul className="space-y-2.5 text-slate-700">
                  {[
                    "Private GitHub repo delivery",
                    "Full Git history preserved",
                    "Seller updates flow automatically",
                    "Issues, forking, collaboration",
                    "Living, breathing code",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-slate-950 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
