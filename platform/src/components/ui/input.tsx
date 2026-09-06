import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border bg-muted/60 px-3.5 py-2 text-sm text-foreground shadow-inner transition-all duration-150",
          "placeholder:text-muted-foreground/60",
          "hover:border-border/90 hover:bg-muted/80",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/30"
            : "border-border/70",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
