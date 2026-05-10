import { useMemo, useState } from "react";
import { isRouteErrorResponse, useRouteError, Link } from "react-router";
import { IconComponent } from "@/components/ui/IconSelector";
import ControlButton from "@/components/ControlButton";
import { useLanguageStore } from "@/stores/languageStore";

function getErrorParts(err: unknown) {
  if (isRouteErrorResponse(err)) {
    const data =
      typeof err.data === "string"
        ? err.data
        : err.data
          ? JSON.stringify(err.data, null, 2)
          : "";

    return {
      title: `${err.status} ${err.statusText}`,
      message: data || "A routing error occurred.",
      stack: "",
    };
  }

  if (err instanceof Error) {
    return {
      title: err.name || "Error",
      message: err.message || "Something went wrong.",
      stack: err.stack || "",
    };
  }

  return {
    title: "Unknown Error",
    message: typeof err === "string" ? err : "An unexpected error occurred.",
    stack: "",
  };
}

export default function ErrorBoundaryPage() {
  const { language } = useLanguageStore();
  const routeError = useRouteError();
  const { title, message, stack } = useMemo(
    () => getErrorParts(routeError),
    [routeError],
  );

  const [showStack, setShowStack] = useState(true);
  const [copied, setCopied] = useState(false);

  const stackText = stack || "(no stack trace available)";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stackText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10 relative">
      <div className="absolute top-5 right-5 z-50 flex items-center gap-3">
        <ControlButton />
      </div>
      <div className="w-full max-w-3xl">
        <div className="bg-dark-900 border border-dark-600/40 rounded-3xl overflow-hidden shadow-[0_2px_48px_rgba(205,208,223,0.4)]">
          <div className="px-6 py-5 border-b border-dark-600/40 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl flex items-center justify-center">
                <IconComponent
                  iconName="Ri/RiAlertLine"
                  className="w-5 h-5 text-accent-500"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
                <p className="text-sm text-dark-400 mt-1 wrap-break-word">
                  {message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-dark-400 hover:text-foreground border border-dark-600 hover:border-dark-500 rounded-full transition-all"
              >
                <IconComponent iconName="Ri/RiHomeLine" className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-dark-400 hover:text-foreground border border-dark-600 hover:border-dark-500 rounded-xl transition-all"
              >
                <IconComponent iconName="Ri/RiBugLine" className="w-4 h-4" />
                {language({ id: "Masuk", en: "Login" })}
              </Link>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-sm text-foreground">
              <button
                type="button"
                onClick={() => setShowStack((v) => !v)}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <IconComponent
                  iconName="Ri/RiBugLine"
                  className="w-4 h-4 text-accent-500"
                />
                {language({
                  id: "Jejak kesalahan",
                  en: "Stack trace",
                })}
                {showStack ? (
                  <IconComponent
                    iconName="Ri/RiArrowUpSLine"
                    className="w-4 h-4 ml-1"
                  />
                ) : (
                  <IconComponent
                    iconName="Ri/RiArrowDownSLine"
                    className="w-4 h-4 ml-1"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dark-600/40 hover:border-dark-500 hover:text-foreground transition-all"
                title="Copy stack trace"
              >
                {copied ? (
                  <IconComponent
                    iconName="Ri/RiCheckLine"
                    className="w-4 h-4 text-neon-green"
                  />
                ) : (
                  <IconComponent
                    iconName="Ri/RiFileCopyLine"
                    className="w-4 h-4"
                  />
                )}
                <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {showStack && (
              <pre className="bg-dark-800 border border-dark-600 rounded-xl p-4 overflow-auto max-h-90 text-xs text-foreground font-mono whitespace-pre-wrap">
                {stackText}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
