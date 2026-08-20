"use client";

import Link from "next/link";
import { ArrowRight, MonitorSmartphone, Server, Layers, Code2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";

export function Categories() {
  return (
    <section id="categories" className="bg-secondary/30 py-24 border-y border-border/50">
      <div className="container mx-auto flex flex-col gap-12">
        <div className="flex items-center justify-between">
          <h2 className="font-marketing text-3xl md:text-4xl font-bold tracking-tight">Explore Categories</h2>
          <Link href="/browse" className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <MonitorSmartphone size={24} />, title: "Frontend Templates", count: "120+" },
            { icon: <Server size={24} />, title: "Backend APIs", count: "85+" },
            { icon: <Layers size={24} />, title: "Fullstack Boilerplates", count: "200+" },
            { icon: <Code2 size={24} />, title: "UI Components", count: "450+" },
          ].map((category, i) => (
            <Card key={i} className="group hover:border-primary/50 transition-colors cursor-pointer bg-background">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.count} items</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
