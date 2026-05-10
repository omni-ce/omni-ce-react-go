import { useNavigate } from "react-router";
import { useLanguageStore } from "@/stores/languageStore";
import { IconComponent } from "@/components/ui/IconSelector";

export default function RulePermissionPage() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-dark-900 border border-dark-600/40 rounded-3xl overflow-hidden shadow-[0_2px_48px_rgba(205,208,223,0.4)]">
          {/* Header */}
          <div className="px-6 py-6 border-b border-dark-600/30 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-red/10 border border-neon-red/20 flex items-center justify-center shrink-0">
              <IconComponent
                iconName="Ri/RiShieldLine"
                className="w-6 h-6 text-neon-red"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {language({
                  id: "Akses Ditolak",
                  en: "Access Denied",
                })}
              </h1>
              <p className="text-sm text-dark-400 mt-1">
                {language({
                  id: "Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator untuk mendapatkan akses.",
                  en: "You do not have permission to access this page. Contact your administrator to request access.",
                })}
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="px-6 py-4 bg-dark-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neon-red/5 border border-neon-red/10">
              <div className="w-2 h-2 rounded-full bg-neon-red shrink-0 animate-pulse" />
              <p className="text-xs text-dark-400">
                {language({
                  id: "Izin 'baca' tidak diaktifkan untuk peran Anda pada menu ini.",
                  en: "The 'read' permission is not enabled for your role on this menu.",
                })}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-dark-600/30">
            <div className="text-xs text-dark-400">
              {language({
                id: "Kembali ke halaman yang diizinkan.",
                en: "Navigate back to an authorized page.",
              })}
            </div>
            <button
              type="button"
              onClick={() => navigate("/app/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-dark-400 hover:text-foreground border border-dark-600 hover:border-dark-500 rounded-full transition-all"
            >
              <IconComponent
                iconName="Ri/RiArrowLeftLine"
                className="w-4 h-4"
              />
              {language({
                id: "Kembali",
                en: "Go Back",
              })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
