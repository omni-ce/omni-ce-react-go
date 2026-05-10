import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
