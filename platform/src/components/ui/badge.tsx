import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "violet"
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-white shadow hover:bg-primary/80",
    secondary: "border-transparent bg-card text-foreground hover:bg-card/80",
    outline: "text-foreground border-border/80",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium",
    violet: "border-primary/40 bg-primary/10 text-purple-300 font-medium shadow-[0_0_12px_rgba(133,53,252,0.15)]",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
