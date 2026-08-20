"use client";

export function Trust() {
  return (
    <section className="border-y border-border/50 bg-secondary/30">
      <div className="container mx-auto py-12 flex flex-col items-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Trusted by developers at</p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale">
          <span className="font-marketing font-bold text-2xl">Zomato</span>
          <span className="font-marketing font-bold text-2xl">Razorpay</span>
          <span className="font-marketing font-bold text-2xl">Cred</span>
          <span className="font-marketing font-bold text-2xl">Postman</span>
        </div>
      </div>
    </section>
  );
}
