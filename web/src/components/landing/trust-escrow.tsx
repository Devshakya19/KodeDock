"use client";

import { ShieldCheck } from "lucide-react";

export function TrustEscrow() {
  return (
    <section className="container mx-auto py-24 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <div className="h-16 w-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="font-marketing text-3xl md:text-4xl font-bold tracking-tight">Safe for everyone.</h2>
        <p className="text-lg text-muted-foreground">
          Every transaction is held in our 7-day secure escrow. Buyers get 7 days to verify the code works as advertised. Sellers get guaranteed payouts once the period clears. Zero friction, total trust.
        </p>
      </div>
    </section>
  );
}
