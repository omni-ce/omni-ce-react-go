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
  height?: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
}

function Dialog({
  open,
  onClose,
  width,
  height,
  children,
  closeOnOverlayClick = true,
}: DialogProps) {
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
        role="button"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={() => closeOnOverlayClick && onClose()}
      />

      {/* Control Button at top right of overlay */}
      <div className="fixed top-4 right-4 z-60 animate-fade-in flex items-center gap-2 bg-dark-900/90 backdrop-blur-md rounded-lg p-2 shadow-sm border border-dark-600/40">
        <ControlButton />
      </div>

      {/* Content wrapper */}
      <div
        className="relative z-10 w-full mx-4 animate-fade-in"
        style={{ maxWidth: width ?? "480px", height: height ?? "auto" }}
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
        "rounded-3xl border border-dark-600/40 bg-dark-900 backdrop-blur-xl p-6 shadow-[0_2px_48px_rgba(205,208,223,0.4)] space-y-5 max-h-[90vh] overflow-y-auto",
        className,
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-dark-400 hover:text-foreground hover:bg-dark-800 transition-all focus:outline-none"
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
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-bold text-foreground", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-dark-400", className)} {...props} />;
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
