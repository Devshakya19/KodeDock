import { Navbar } from "@/components/landing/navbar";
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
import { Footer } from "@/components/landing/footer";

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
