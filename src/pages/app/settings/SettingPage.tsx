import { useEffect, useState } from "react";
import {
  RiKeyLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSettings3Line,
} from "react-icons/ri";
import SectionTitle from "@/components/SectionTitle";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { settingService } from "@/services/setting.service";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import AppIconSvg from "@/assets/react_go.svg";

interface SettingPageProps {}
export default function SettingPage({}: SettingPageProps) {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const isSu = user?.roles?.some(r => r.role_name === "su");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saveMsg, setSaveMsg] = useState("");
  const [saveType, setSaveType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  // Maintenance state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);

  useEffect(() => {
    if (isSu) {
      settingService.getAll().then((settings) => {
        setMaintenanceMode(settings.maintenance_mode === "true");
      });
    }
  }, [isSu]);

  const handleToggleMaintenance = async () => {
    setIsTogglingMaintenance(true);
    try {
      const result = await settingService.toggleMaintenance();
      setMaintenanceMode(result.data.maintenance_mode);
    } catch {
      setSaveType("error");
      setSaveMsg(
        language({
          id: "Gagal mengubah mode maintenance",
          en: "Failed to toggle maintenance mode",
        }),
      );
      setTimeout(() => setSaveMsg(""), 3000);
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (newPassword !== confirmPassword) {
      setSaveType("error");
      setSaveMsg(
        language({
          id: "Password tidak sama.",
          en: "Passwords do not match.",
        }),
      );
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const res = await settingService.setNewPassword(
        currentPassword,
        newPassword,
      );
      setSaveType("success");
      setSaveMsg(
        res.message ||
          language({
            id: "Password berhasil diubah.",
            en: "Password changed successfully.",
          }),
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        language({
          id: "Gagal mengubah password.",
          en: "Failed to change password.",
        });
      setSaveType("error");
      setSaveMsg(msg);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {language({ id: "Pengaturan", en: "Setting" })}
        </h2>
        <p className="text-sm text-dark-300 mt-1">
          {language({
            id: "Kelola akun dan konfigurasi Anda",
            en: "Manage your account and configuration",
          })}
        </p>
      </div>

      {/* Toast */}
      {saveMsg && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-mono ${
            saveType === "success"
              ? "bg-neon-green/10 border border-neon-green/20 text-neon-green"
              : "bg-neon-red/10 border border-neon-red/20 text-neon-red"
          }`}
        >
          {saveMsg}
        </div>
      )}

      {/* Maintenance Mode — su only */}
      {isSu && (
        <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-4">
          <SectionTitle>
            {language({
              id: "Mode Pemeliharaan",
              en: "Maintenance Mode",
            })}
          </SectionTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-yellow/10 border border-neon-yellow/20 flex items-center justify-center">
                <RiSettings3Line className="w-5 h-5 text-neon-yellow" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {language({
                    id: "Aktifkan Mode Pemeliharaan",
                    en: "Enable Maintenance Mode",
                  })}
                </p>
                <p className="text-xs text-dark-400 font-mono mt-0.5">
                  {language({
                    id: "Saat aktif, hanya SU yang dapat mengakses sistem",
                    en: "When active, only SU users can access the system",
                  })}
                </p>
              </div>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={handleToggleMaintenance}
              disabled={isTogglingMaintenance}
            />
          </div>
          {maintenanceMode && (
            <div className="px-4 py-3 rounded-xl text-sm font-mono bg-neon-yellow/10 border border-neon-yellow/20 text-neon-yellow">
              {language({
                id: "⚠️ Sistem sedang dalam mode pemeliharaan. Pengguna biasa tidak dapat mengakses.",
                en: "⚠️ System is in maintenance mode. Regular users cannot access.",
              })}
            </div>
          )}
        </div>
      )}

      {/* Change password */}
      <form
        onSubmit={handleChangePassword}
        className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-4"
      >
        <SectionTitle>
          {language({ id: "Ubah Password", en: "Change Password" })}
        </SectionTitle>
        <div className="flex items-center gap-2 mb-2">
          <RiKeyLine className="w-4 h-4 text-dark-400" />
          <p className="text-xs text-dark-400 font-mono">
            {language({
              id: "Perbarui password akun Anda",
              en: "Update your account password",
            })}
          </p>
        </div>
        <div>
          <Label required>
            {language({ id: "Password saat ini", en: "Current password" })}
          </Label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={language({
                id: "Password saat ini",
                en: "Current password",
              })}
              required
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-foreground transition-colors"
            >
              {showCurrent ? (
                <RiEyeOffLine className="w-4 h-4" />
              ) : (
                <RiEyeLine className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label required>
              {language({ id: "Password baru", en: "New password" })}
            </Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={language({
                  id: "Password baru",
                  en: "New password",
                })}
                required
                disabled={isSaving}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-foreground transition-colors"
              >
                {showNew ? (
                  <RiEyeOffLine className="w-4 h-4" />
                ) : (
                  <RiEyeLine className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Label required>
              {language({
                id: "Konfirmasi password",
                en: "Confirm password",
              })}
            </Label>
            <Input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={language({
                id: "Konfirmasi password",
                en: "Confirm password",
              })}
              required
              disabled={isSaving}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-accent-500/25"
          >
            <RiKeyLine className="w-4 h-4" />
            {language({ id: "Ubah Password", en: "Change Password" })}
          </button>
        </div>
      </form>

      {/* Developer Credit */}
      <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-3">
        <SectionTitle>
          {language({ id: "Tentang", en: "About" })}
        </SectionTitle>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center overflow-hidden shrink-0">
            <img src={AppIconSvg} alt="App" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Base Project
            </h3>
            <p className="text-xs text-dark-300 font-mono mt-0.5">
              React + Go Starter Template
            </p>
          </div>
        </div>
        <div className="border-t border-dark-600/40 pt-3 space-y-1.5">
          <p className="text-xs text-dark-400 font-mono">
            Developed by{" "}
            <a
              href="https://github.com/jefripunza"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-400 hover:text-accent-300 transition-colors underline underline-offset-2"
            >
              jefripunza
            </a>
          </p>
          <p className="text-xs text-dark-400 font-mono">
            Open source &middot;{" "}
            <a
              href="https://github.com/jefripunza/react-go"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-400 hover:text-accent-300 transition-colors underline underline-offset-2"
            >
              Built with Go + React + TailwindCSS
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
