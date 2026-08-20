"use client";

import { motion, Variants } from "framer-motion";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function Hero() {
  return (
    <section className="relative container mx-auto pt-24 pb-32 lg:pt-36 lg:pb-40 flex flex-col items-center text-center overflow-hidden">
      <motion.div 
        className="absolute -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center space-y-8 z-10">
        <motion.div variants={fadeInUp}>
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border/50">
            India's Premium Code Marketplace
          </Badge>
        </motion.div>
        
        <motion.h1 variants={fadeInUp} className="font-marketing text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight max-w-5xl leading-[1.05]">
          Discover. Buy. <span className="text-primary inline-block">Build.</span>
        </motion.h1>
        
        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl font-sans font-medium">
          Stop extracting .zip files. Get production-ready boilerplates and templates delivered directly to your private GitHub repository in seconds.
        </motion.p>
        
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <Button size="lg" className="h-14 px-8 text-base shadow-lg shadow-primary/20 w-full sm:w-auto rounded-full" asChild>
            <Link href="/browse">Explore Assets</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-background/50 backdrop-blur-sm w-full sm:w-auto rounded-full" asChild>
            <Link href="/seller">Start Selling (2.5% Fee)</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
