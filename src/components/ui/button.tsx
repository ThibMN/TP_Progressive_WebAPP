import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 dark:focus-visible:ring-white/20 focus-visible:ring-slate-400/50 dark:focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white/10 dark:bg-white/10 bg-slate-700/80 dark:bg-white/10 backdrop-blur-xl text-white dark:text-white text-white dark:text-white border border-white/20 dark:border-white/20 border-slate-600/50 dark:border-white/20 hover:bg-white/15 dark:hover:bg-white/15 hover:bg-slate-600/90 dark:hover:bg-white/15 hover:border-white/30 dark:hover:border-white/30 hover:border-slate-500/60 dark:hover:border-white/30 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] dark:hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        destructive:
          "bg-red-500/20 dark:bg-red-500/20 bg-red-100/80 dark:bg-red-500/20 backdrop-blur-xl text-red-100 dark:text-red-100 text-red-800 dark:text-red-100 border border-red-500/30 dark:border-red-500/30 border-red-400/50 dark:border-red-500/30 hover:bg-red-500/30 dark:hover:bg-red-500/30 hover:bg-red-200/90 dark:hover:bg-red-500/30 hover:border-red-500/40 dark:hover:border-red-500/40 hover:border-red-500/60 dark:hover:border-red-500/40 hover:shadow-[0_8px_32px_0_rgba(239,68,68,0.2)] dark:hover:shadow-[0_8px_32px_0_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_0_rgba(239,68,68,0.1)] dark:shadow-[0_4px_16px_0_rgba(239,68,68,0.1)]",
        outline:
          "bg-white/5 dark:bg-white/5 bg-slate-100/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/20 border-slate-300/50 dark:border-white/20 text-white dark:text-white text-slate-800 dark:text-white hover:bg-white/10 dark:hover:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-white/30 hover:border-slate-400/60 dark:hover:border-white/30 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] dark:hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] shadow-[0_4px_16px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.05)]",
        secondary:
          "bg-white/10 dark:bg-white/10 bg-slate-700/80 dark:bg-white/10 backdrop-blur-xl text-white dark:text-white text-white dark:text-white border border-white/20 dark:border-white/20 border-slate-600/50 dark:border-white/20 hover:bg-white/15 dark:hover:bg-white/15 hover:bg-slate-600/90 dark:hover:bg-white/15 hover:border-white/30 dark:hover:border-white/30 hover:border-slate-500/60 dark:hover:border-white/30 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] dark:hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.05)] shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_0_rgba(255,255,255,0.05)]",
        ghost: "bg-transparent text-white dark:text-white text-slate-700 dark:text-white hover:bg-white/10 dark:hover:bg-white/10 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:backdrop-blur-xl border border-transparent hover:border-white/20 dark:hover:border-white/20 hover:border-slate-300/50 dark:hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300",
        link: "bg-transparent text-white dark:text-white text-slate-700 dark:text-white underline-offset-4 hover:underline hover:text-white/80 dark:hover:text-white/80 hover:text-slate-600 dark:hover:text-white/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

