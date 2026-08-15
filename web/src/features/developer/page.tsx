import { Navbar } from "@/features/landing/components/navbar";
import { Footer } from "@/features/landing/components/footer";
import { DevHero } from "@/features/developer/components/dev-hero";
import { DevBenefits } from "@/features/developer/components/dev-benefits";
import { DevCommission } from "@/features/developer/components/dev-commission";
import { DevCTA } from "@/features/developer/components/dev-cta";

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
