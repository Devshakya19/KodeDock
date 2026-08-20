import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Categories } from "@/components/landing/categories";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { GithubShowcase } from "@/components/landing/github-showcase";
import { PricingComparison } from "@/components/landing/pricing-comparison";
import { SellerSection } from "@/components/landing/seller-section";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCTA } from "@/components/landing/final-cta";
import { WhatIsKodeDock } from "@/components/landing/what-is-kodedock";
import { TrustEscrow } from "@/components/landing/trust-escrow";
import { Trust } from "@/components/landing/trust";


export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Stats />
      <Categories />
      <Features />
      <HowItWorks />
      <WhatIsKodeDock />
      <TrustEscrow />
      <Trust />
      <GithubShowcase />
      <PricingComparison />
      <SellerSection />
      <Testimonials />
      <FinalCTA />
    </div>
  );
}
