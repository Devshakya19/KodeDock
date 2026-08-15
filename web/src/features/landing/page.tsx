import { Navbar } from "@/features/landing/components/navbar";
import { Hero } from "@/features/landing/components/hero";
import { Stats } from "@/features/landing/components/stats";
import { Categories } from "@/features/landing/components/categories";
import { Features } from "@/features/landing/components/features";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { GithubShowcase } from "@/features/landing/components/github-showcase";
import { PricingComparison } from "@/features/landing/components/pricing-comparison";
import { SellerSection } from "@/features/landing/components/seller-section";
import { Testimonials } from "@/features/landing/components/testimonials";
import { FinalCTA } from "@/features/landing/components/final-cta";
import { Footer } from "@/features/landing/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Categories />
        <Features />
        <HowItWorks />
        <GithubShowcase />
        <PricingComparison />
        <SellerSection />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
