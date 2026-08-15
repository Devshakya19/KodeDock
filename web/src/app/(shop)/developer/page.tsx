import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { DevHero } from "@/app/(shop)/developer/components/dev-hero";
import { DevBenefits } from "@/app/(shop)/developer/components/dev-benefits";
import { DevCommission } from "@/app/(shop)/developer/components/dev-commission";
import { DevCTA } from "@/app/(shop)/developer/components/dev-cta";

export default function DeveloperPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <DevHero />
        <DevBenefits />
        <DevCommission />
        <DevCTA />
      </main>
      <Footer />
    </div>
  );
}
