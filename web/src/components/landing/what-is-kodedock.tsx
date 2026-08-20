"use client";

import { motion, Variants } from "framer-motion";
import { GithubIcon } from "@/shared/components/icons/github";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function WhatIsKodeDock() {
  return (
    <section id="what-is-kodedock" className="container mx-auto py-24 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-col gap-6"
        >
          <motion.h2 variants={fadeInUp} className="font-marketing text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Where code meets commerce.
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed">
            KodeDock is designed for modern developers. We eliminate the friction of buying and selling code. No more 50% marketplace cuts. No more downloading outdated static zip files.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <GithubIcon size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Native GitHub Integration</h4>
              <p className="text-sm text-muted-foreground">Every purchase clones the repo instantly to your account.</p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-secondary rounded-3xl p-8 border border-border/50 relative overflow-hidden h-[400px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="bg-background rounded-xl border border-border shadow-xl absolute -right-12 -bottom-12 top-12 left-12 p-6 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="w-3 h-3 rounded-full bg-warning" />
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="font-mono text-xs text-muted-foreground ml-4">github.com/buyer/new-project</span>
            </div>
            <div className="pt-6 font-mono text-sm">
              <p className="text-primary">$ git clone https://github.com/buyer/new-project</p>
              <p className="text-muted-foreground mt-2">Cloning into 'new-project'...</p>
              <p className="text-muted-foreground">remote: Enumerating objects: 134...</p>
              <p className="text-success mt-4">✓ Repository ready.</p>
              <p className="text-primary mt-4">$ cd new-project && npm install</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
