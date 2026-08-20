"use client";

import { Button } from "@/shared/ui/button";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="container mx-auto pb-32">
      <div className="bg-secondary rounded-[2.5rem] p-12 md:p-20 text-center flex flex-col items-center border border-border/50">
        <h2 className="font-marketing text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to dock your code?</h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl">
          Join thousands of Indian developers buying and selling premium code assets on KodeDock.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" className="h-14 px-10 text-base rounded-full shadow-lg" asChild>
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
