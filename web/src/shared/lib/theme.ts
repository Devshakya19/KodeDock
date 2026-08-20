/**
 * theme.ts
 * Single source of truth for KodeDock's design system in JavaScript/TypeScript.
 * Use these constants instead of hardcoding Tailwind classes for standard elements,
 * ensuring any future design changes propagate instantly across the app.
 */

export const theme = {
  // Typography class groupings
  typography: {
    h1: "font-marketing text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight",
    h2: "font-marketing text-4xl lg:text-5xl font-bold tracking-tight",
    h3: "font-sans text-2xl font-bold",
    h4: "font-sans text-xl font-semibold",
    body: "font-sans text-base leading-relaxed text-foreground",
    bodyLarge: "font-sans text-lg md:text-xl leading-relaxed text-muted-foreground",
    bodySmall: "font-sans text-sm text-muted-foreground",
    code: "font-mono text-sm",
    label: "text-sm font-semibold text-foreground flex items-center gap-2",
  },
  
  // Layout class groupings
  layout: {
    section: "container mx-auto py-24 lg:py-32",
    glass: "bg-background/80 backdrop-blur-md border border-border/50",
    panel: "bg-secondary/30 border border-border/50 rounded-3xl p-8 md:p-12",
  },

  // Color variables for inline styles or Framer Motion variants
  // (Translates to the CSS variables in globals.css)
  colors: {
    primary: "hsl(var(--primary))",
    primaryForeground: "hsl(var(--primary-foreground))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    secondary: "hsl(var(--secondary))",
    secondaryForeground: "hsl(var(--secondary-foreground))",
    muted: "hsl(var(--muted))",
    mutedForeground: "hsl(var(--muted-foreground))",
    border: "hsl(var(--border))",
    success: "hsl(var(--success))",
    destructive: "hsl(var(--destructive))",
    warning: "hsl(var(--warning))",
  },
  
  components: {
    card: "bg-background rounded-[24px] p-6 sm:p-8 border border-border shadow-sm",
    cardInteractive: "bg-background rounded-[24px] p-6 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
    glassPanel: "bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-[24px]",
    divider: "h-px w-full bg-border my-8",
    buttonPrimary: "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    buttonLink: "text-primary hover:text-primary/80 font-medium transition-colors hover:underline",
  },
  
  inputs: {
    base: "h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all",
    textarea: "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all",
  },
  
  alerts: {
    success: "p-4 rounded-xl bg-success/10 border border-success/30 text-sm font-medium text-success flex items-center gap-3",
    error: "p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm font-medium text-destructive flex items-center gap-3",
    info: "p-4 rounded-xl bg-accent/10 border border-accent/30 text-sm font-medium text-accent flex items-center gap-3",
    warning: "p-4 rounded-xl bg-warning/10 border border-warning/30 text-sm font-medium text-warning flex items-center gap-3",
  },
  
  badges: {
    success: "inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full",
    error: "inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/30 px-2 py-0.5 rounded-full",
    info: "inline-flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-full",
    warning: "inline-flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded-full",
    neutral: "inline-flex items-center gap-1 text-xs font-bold text-foreground bg-secondary border border-border px-2 py-0.5 rounded-full",
  },
  
  animation: {
    fadeUp: "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    fadeIn: "animate-in fade-in duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    pulse: "animate-pulse",
  }
} as const;
