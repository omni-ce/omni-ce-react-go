import { useNavigate } from "react-router";
import { IconComponent } from "@/components/ui/IconSelector";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="bg-dark-900 border border-dark-600/40 rounded-3xl overflow-hidden shadow-[0_2px_48px_rgba(205,208,223,0.4)]">
          <div className="px-6 py-6 border-b border-dark-600/40 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center shrink-0">
              <IconComponent
                iconName="Ri/RiSearchLine"
                className="w-5 h-5 text-accent-500"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                404 - Page not found
              </h1>
              <p className="text-sm text-dark-400 mt-1 wrap-break-word">
                The page you requested doesn&apos;t exist or has been moved.
              </p>
            </div>
          </div>

          <div className="px-6 py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-xs text-dark-400">
              Try checking the URL, or go back to a safe page.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-dark-400 hover:text-foreground border border-dark-600 hover:border-dark-500 rounded-full transition-all"
              >
                <IconComponent
                  iconName="Ri/RiArrowLeftLine"
                  className="w-4 h-4"
                />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
