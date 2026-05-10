import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full px-4 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-foreground focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm disabled:opacity-50 appearance-none cursor-pointer",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";

export { Select };
