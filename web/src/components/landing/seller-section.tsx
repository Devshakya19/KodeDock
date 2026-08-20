"use client";

import { Check } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function SellerSection() {
  return (
    <section className="bg-primary text-primary-foreground py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-marketing text-4xl lg:text-5xl font-bold mb-6 text-primary-foreground">Keep what you earn.</h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg leading-relaxed">
              Other platforms take up to 50% of your hard work. KodeDock charges a flat 2.5% platform fee. You build it, you keep the profit.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="text-primary-foreground" />
                <span className="text-primary-foreground font-medium">Flat 2.5% Commission</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-primary-foreground" />
                <span className="text-primary-foreground font-medium">Weekly Escrow Payouts</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-primary-foreground" />
                <span className="text-primary-foreground font-medium">Indian Payment Methods</span>
              </div>
            </div>
            
            <Button size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full h-14 px-8 font-semibold">
              Become a Seller
            </Button>
          </div>
          
          <div className="bg-background/20 p-8 rounded-3xl backdrop-blur-sm border border-primary-foreground/10">
            <h3 className="font-mono text-primary-foreground/50 mb-6 text-sm uppercase tracking-wider">Revenue Comparison (₹10,000 Sale)</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2 text-primary-foreground">
                  <span>Global Platforms (50% fee)</span>
                  <span className="font-mono">₹5,000</span>
                </div>
                <div className="h-4 bg-primary-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-foreground/30 w-[50%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2 text-primary-foreground">
                  <span>Others (10% fee)</span>
                  <span className="font-mono">₹9,000</span>
                </div>
                <div className="h-4 bg-primary-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-foreground/60 w-[90%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2 text-primary-foreground font-bold">
                  <span>KodeDock (2.5% fee)</span>
                  <span className="font-mono text-success">₹9,750</span>
                </div>
                <div className="h-4 bg-primary-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-foreground w-[97.5%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
