import type { ReactNode } from "react";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07060b] text-slate-100 font-sans selection:bg-violet-500/30 selection:text-white">
      {children}
    </div>
  );
}
