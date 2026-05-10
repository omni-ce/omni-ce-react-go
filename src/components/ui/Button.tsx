import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants: Record<string, string> = {
      default:
        "bg-accent-500 text-white hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]",
      outline:
        "border border-dark-100 text-dark-100 hover:bg-dark-800 bg-transparent",
      ghost:
        "text-dark-400 hover:text-foreground hover:bg-dark-800 bg-transparent",
      destructive:
        "bg-neon-red text-white hover:bg-neon-red/90 hover:shadow-lg hover:shadow-neon-red/25 active:scale-[0.98]",
    };

    const sizes: Record<string, string> = {
      default: "px-6 py-2.5 text-sm",
      sm: "px-4 py-1.5 text-xs",
      lg: "px-8 py-3 text-base",
      icon: "p-2 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
