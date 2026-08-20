"use client";

import { motion } from "framer-motion";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container mx-auto py-24 lg:py-32">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-marketing text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works</h2>
        <p className="text-muted-foreground text-lg">A seamless workflow from discovery to deployment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-border -z-10" />
        
        {[
          { step: "01", title: "Browse & Purchase", desc: "Find the perfect code asset. Pay securely via Razorpay with UPI, Cards, or Netbanking." },
          { step: "02", title: "Instant Transfer", desc: "Our worker instantly bare-clones the seller's repo and pushes it to a new private repo in your GitHub." },
          { step: "03", title: "Clone & Build", desc: "No zips. You get full version history. Clone your new repo locally and start building immediately." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center bg-background p-6"
          >
            <div className="h-24 w-24 rounded-full bg-secondary border-4 border-background flex items-center justify-center text-2xl font-marketing font-bold text-muted-foreground mb-6 shadow-sm">
              {item.step}
            </div>
            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
