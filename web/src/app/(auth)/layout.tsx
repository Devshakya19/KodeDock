import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#050508] text-white flex flex-col justify-between overflow-hidden selection:bg-[#702ffc]/30 selection:text-white">
      {/* Background Graphic: Fixed viewport cover with absolute zero distortion & zero scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <Image
          src="/images/auth-banner.jpg"
          alt="KodeDock Cosmic Space Background"
          fill
          priority
          quality={100}
          style={{ objectFit: "cover", objectPosition: "center" }}
          className="opacity-90 transition-opacity duration-500"
        />
        {/* Responsive lighting gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-[#050508]/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#050508]/20 lg:to-[#050508]/85 pointer-events-none" />
      </div>

      {/* Main Container: Split-View layout locked within 100vh */}
      <div className="relative z-10 w-full h-full flex-1 flex flex-col lg:flex-row items-center justify-between max-w-[1536px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-3 sm:py-4 lg:py-6 overflow-y-auto lg:overflow-hidden">
        
        {/* Left Side: Watermark aligned to match bottom-left mockup logo */}
        <div className="hidden lg:flex flex-col justify-between self-stretch py-2 select-none pointer-events-none max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#842cf9] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-widest text-white/50 uppercase">
              KodeDock Gateway
            </span>
          </div>
          <div className="flex items-center gap-3 pl-1">
            <span className="text-2xl font-black tracking-tight text-white/90">
              Kode<span className="text-[#842cf9]">Dock</span>
            </span>
          </div>
        </div>

        {/* Right Side: Auth Form Container centered vertically in 100vh */}
        <main className="w-full lg:w-auto flex justify-center lg:justify-end my-auto">
          {children}
        </main>
      </div>

      {/* Mobile brand watermark */}
      <div className="relative z-10 lg:hidden py-1.5 text-center text-[10px] text-white/35 select-none">
        KodeDock • Code • Build • Ship
      </div>
    </div>
  );
}
