/**
 * KodeDock Design System Theme File
 * 
 * Sourced directly from docs/04-DESIGN.md
 * 
 * Usage:
 * import { theme } from "@/lib/theme";
 * <div className={theme.layout.container}>...</div>
 */

export const theme = {
  // Page level layouts and wrappers
  layout: {
    // The main wrapper for any full page: background #F8FAFC (slate-50), primary text #0F172A (slate-900)
    page: "min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900",
    
    // Standard content container: Desktop padding (px-8), Tablet (px-6), Mobile (px-4)
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    containerSm: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8",
    
    // Section spacing: py-20 (5rem)
    section: "py-12 sm:py-16 lg:py-20",
    
    // Grid layouts
    gridBase: "grid gap-4",
    gridCards: "grid gap-6",
    gridLarge: "grid gap-8",
  },

  // Consistent typography across the app
  typography: {
    hero: "text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]",
    h1: "text-4xl font-extrabold text-slate-900 tracking-tight",
    h2: "text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight",
    h3: "text-xl sm:text-2xl font-bold text-slate-900",
    body: "text-base text-slate-600 leading-relaxed",
    lead: "text-lg text-slate-600 leading-relaxed",
    muted: "text-sm font-medium text-slate-500",
    small: "text-xs text-slate-500",
    label: "text-sm font-semibold text-slate-900 flex items-center gap-2",
  },

  // Reusable UI components structures
  components: {
    // Standard content card: background white, border slate-200
    card: "bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-sm",
    
    // Interactive card (for grids of products/items)
    cardInteractive: "bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
    
    // Glassmorphism panels
    glassPanel: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm rounded-[24px]",
    
    // Divider line
    divider: "h-px w-full bg-slate-200 my-8",

    // Primary Button (Black #000000)
    buttonPrimary: "inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
    
    // Link Button (Brand Blue #2563EB)
    buttonLink: "text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline",
  },

  // Input forms (for standardizing forms that don't use the ui/input.tsx component)
  inputs: {
    // Standard text input / textarea: border slate-200, focus ring blue-600
    base: "h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all",
    textarea: "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all",
  },

  // Badges & Alerts (Using Brand Colors)
  alerts: {
    success: "p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-800 flex items-center gap-3",
    error: "p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-800 flex items-center gap-3",
    info: "p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm font-medium text-blue-800 flex items-center gap-3",
    warning: "p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm font-medium text-amber-800 flex items-center gap-3",
  },

  badges: {
    success: "inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full",
    error: "inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full",
    info: "inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full",
    warning: "inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full",
    neutral: "inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full",
  },

  // Common animations
  animation: {
    fadeUp: "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    fadeIn: "animate-in fade-in duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    pulse: "animate-pulse",
  },
  
  // Z-Index values
  zIndex: {
    elevated: "z-10",
    dropdown: "z-20",
    overlay: "z-30",
    modal: "z-40",
    toast: "z-50",
  }
} as const;
