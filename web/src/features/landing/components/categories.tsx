"use client";
import { FadeIn } from "@/shared/components/fade-in";

import {
  Layout,
  Smartphone,
  Code2,
  GraduationCap,
  Terminal,
  FileCode2,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";


const CATEGORIES = [
  { icon: Layout, label: "Web Templates", count: "2,400+", desc: "Next.js, React, Vue" },
  { icon: Smartphone, label: "Mobile Apps", count: "800+", desc: "React Native, Flutter" },
  { icon: Code2, label: "UI Kits", count: "1,200+", desc: "Tailwind, shadcn/ui" },
  { icon: GraduationCap, label: "B.Tech Projects", count: "3,500+", desc: "Verified, documented" },
  { icon: Terminal, label: "Boilerplates", count: "900+", desc: "SaaS, E-commerce" },
  { icon: FileCode2, label: "API Templates", count: "600+", desc: "REST, GraphQL" },
];

export function Categories() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-semibold tracking-wide uppercase text-slate-900 mb-4">
              Categories
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950">
              Find exactly what you need
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              Browse by category and locate production-ready code without the noise.
            </p>
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => (
            <FadeIn key={cat.label} delay={i * 0.06}>
              <Card className="group cursor-pointer border border-slate-200 hover:border-slate-950 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-950/10 flex items-center justify-center group-hover:bg-slate-950/15 transition-colors">
                    <cat.icon className="w-5.5 h-5.5 text-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-slate-950">{cat.label}</h3>
                      <Badge variant="secondary" className="text-[11px] px-2 py-0.5 font-medium bg-slate-100 text-slate-900 border border-slate-200">
                        {cat.count}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 transition-transform group-hover:text-slate-900" />
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
