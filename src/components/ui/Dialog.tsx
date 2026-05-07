import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import ControlButton from "@/components/ControlButton";
import { IconComponent } from "@/components/ui/IconSelector";

/* ─── Root ───────────────────────────────────────────────────────── */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  width?: string;
  children: React.ReactNode;
}

function Dialog({ open, onClose, width, children }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Control Button at top right of overlay */}
      <div className="fixed top-4 right-4 z-60 animate-fade-in flex items-center gap-2 bg-white/80 dark:bg-black/20 dark:text-gray-400 backdrop-blur-md rounded-lg p-2 shadow-sm">
        <ControlButton />
      </div>
      {/* Content wrapper */}
      <div
        className="relative z-10 w-full mx-4 animate-fade-in"
        style={{ maxWidth: width || "480px" }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ─── Content ────────────────────────────────────────────────────── */

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

function DialogContent({
  className,
  children,
  onClose,
  ...props
}: DialogContentProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dark-600/40 bg-dark-800/95 backdrop-blur-xl p-6 shadow-2xl shadow-black/30 space-y-5 max-h-[90vh] overflow-y-auto",
        className,
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-dark-400 hover:text-foreground hover:bg-dark-700/50 transition-all focus:outline-none"
        >
          <IconComponent iconName="Ri/RiCloseLine" className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  );
}

/* ─── Sub components ─────────────────────────────────────────────── */

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-bold text-foreground", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-dark-300", className)} {...props} />;
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
