"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

export function ProductShowcase() {
  return (
    <section className="bg-background py-24 border-t border-border/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-marketing text-3xl md:text-4xl font-bold tracking-tight">Featured Assets</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 font-marketing font-bold text-2xl">
                  Preview Image
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="font-mono text-xs">Next.js</Badge>
                  <span className="font-bold">₹1,499</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Enterprise SaaS Boilerplate v{i}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">A complete starter kit with Auth, Payments, and Admin Dashboard built on Next.js 15 and Supabase.</p>
                
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/20" />
                  <span className="text-xs text-muted-foreground">by DevStudio</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
