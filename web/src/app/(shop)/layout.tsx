import { ReactNode } from "react";
import ShopNavbar from "@/components/shop/navbar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1D1D21] text-[#EDEDF0] flex flex-col antialiased selection:bg-[#8535FC] selection:text-white">
      <ShopNavbar />
      <main className="flex-grow pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
