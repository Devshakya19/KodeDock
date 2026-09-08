import { ReactNode } from "react";
import ShopNavbar from "@/components/shop/navbar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <ShopNavbar />
      <main className="flex-grow pt-20 px-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
