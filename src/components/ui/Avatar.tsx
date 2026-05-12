import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "@/components/Image";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg";
  fallback?: string;
  shape?: "circle" | "square";
  fromAsset?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  (
    {
      className,
      size = "md",
      shape = "circle",
      fromAsset = false,
      src,
      alt,
      fallback,
      ...props
    },
    ref,
  ) => {
    const [error, setError] = React.useState(false);

    if (error || !src) {
      return (
        <div
          className={cn(
            shape === "square" ? "rounded-none" : "rounded-full",
            "bg-card-lavender border border-accent-500/20 flex items-center justify-center text-accent-500 font-bold shrink-0",
            sizeClasses[size],
            className,
          )}
        >
          <span
            className={
              size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm"
            }
          >
            {fallback ?? alt?.charAt(0).toUpperCase() ?? "?"}
          </span>
        </div>
      );
    }

    if (fromAsset) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className={cn(
            shape === "square" ? "rounded-none" : "rounded-full",
            "object-cover border border-dark-600/40 shrink-0",
            sizeClasses[size],
            className,
          )}
          {...props}
        />
      );
    }

    return (
      <Image
        ref={ref}
        src={src}
        alt={alt ?? "Avatar"}
        onError={() => setError(true)}
        className={cn(
          shape === "square" ? "rounded-none" : "rounded-full",
          "object-cover border border-dark-600/40 shrink-0",
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
