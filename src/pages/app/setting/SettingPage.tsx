import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { settingService } from "@/services/setting.service";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import AppIconSvg from "@/assets/react_go.svg";
import { IconComponent } from "@/components/ui/IconSelector";
import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import Image from "@/components/Image";

interface Props {}
export default function SettingPage({}: Props) {
  const { user } = useAuthStore();
  const isSu = user?.role === "su";

  const { language } = useLanguageStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saveMsg, setSaveMsg] = useState("");
  const [saveType, setSaveType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  // Profile states
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [address, setAddress] = useState(user?.address || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setPhoneNumber(user.phone_number || "");
      setAddress(user.address || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingProfile) return;

    setIsUpdatingProfile(true);
    try {
      await settingService.updateProfile({
        name,
        username,
        phone_number: phoneNumber,
        address,
        avatar,
      });
      setSaveType("success");
      setSaveMsg(
        language({
          id: "Profil berhasil diperbarui.",
          en: "Profile updated successfully.",
        }),
      );
      // Retrigger token validation to update authStore user
      useAuthStore.getState().validateToken(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        language({
          id: "Gagal memperbarui profil.",
          en: "Failed to update profile.",
        });
      setSaveType("error");
      setSaveMsg(msg);
    } finally {
      setIsUpdatingProfile(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setSaveType("error");
      setSaveMsg(
        language({
          id: "Ukuran file maksimal 2MB.",
          en: "Maximum file size is 2MB.",
        }),
      );
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingAvatar(true);
    try {
      const res = await satellite.post<Response<string>>(
        "/api/upload/profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      if (res.data.data) {
        setAvatar(res.data.data);
      }
    } catch {
      setSaveType("error");
      setSaveMsg(
        language({
          id: "Gagal mengunggah foto.",
          en: "Failed to upload photo.",
        }),
      );
      setTimeout(() => setSaveMsg(""), 3000);
    } finally {
      setUploadingAvatar(false);
    }
  };

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
      const res = await settingService.changePassword(
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
          className={`px-4 py-3 rounded-xl text-sm font-mono sticky top-4 z-50 shadow-lg ${
            saveType === "success"
              ? "bg-neon-green/10 border border-neon-green/20 text-neon-green"
              : "bg-neon-red/10 border border-neon-red/20 text-neon-red"
          }`}
        >
          {saveMsg}
        </div>
      )}

      {/* Profile Information */}
      <form
        onSubmit={handleUpdateProfile}
        className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-6"
      >
        <SectionTitle>
          {language({ id: "Informasi Profil", en: "Profile Information" })}
        </SectionTitle>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-dark-600 group-hover:border-accent-500/50 transition-all"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-dark-900 border-2 border-dashed border-dark-600 flex items-center justify-center text-dark-400 group-hover:border-accent-500/50 transition-all">
                  <IconComponent iconName="Ri/RiUserLine" size={32} />
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 p-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl cursor-pointer shadow-lg transition-all active:scale-90">
                <IconComponent iconName="Ri/RiCameraLine" size={16} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <p className="text-[10px] text-dark-400 font-mono uppercase tracking-wider">
              {language({ id: "Foto Profil", en: "Profile Photo" })}
            </p>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label required>
                  {language({ id: "Nama Lengkap", en: "Full Name" })}
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language({
                    id: "Masukkan nama lengkap",
                    en: "Enter full name",
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label required>
                  {language({ id: "Username", en: "Username" })}
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={language({
                    id: "Masukkan username",
                    en: "Enter username",
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {language({ id: "Nomor Telepon", en: "Phone Number" })}
                </Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={language({
                    id: "Contoh: 08123456789",
                    en: "Ex: 08123456789",
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language({ id: "Alamat", en: "Address" })}</Label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm resize-none"
                placeholder={language({
                  id: "Masukkan alamat lengkap",
                  en: "Enter full address",
                })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile || uploadingAvatar}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-accent-500/25"
              >
                {isUpdatingProfile ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <IconComponent iconName="Ri/RiSaveLine" className="w-4 h-4" />
                )}
                {language({ id: "Simpan Perubahan", en: "Save Changes" })}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Change password */}
      <form
        onSubmit={handleChangePassword}
        className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-4"
      >
        <SectionTitle>
          {language({ id: "Ubah Password", en: "Change Password" })}
        </SectionTitle>
        <div className="flex items-center gap-2 mb-2">
          <IconComponent
            iconName="Ri/RiKeyLine"
            className="w-4 h-4 text-dark-400"
          />
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
                <IconComponent iconName="Ri/RiEyeOffLine" className="w-4 h-4" />
              ) : (
                <IconComponent iconName="Ri/RiEyeLine" className="w-4 h-4" />
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
                  <IconComponent
                    iconName="Ri/RiEyeOffLine"
                    className="w-4 h-4"
                  />
                ) : (
                  <IconComponent iconName="Ri/RiEyeLine" className="w-4 h-4" />
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
            <IconComponent iconName="Ri/RiKeyLine" className="w-4 h-4" />
            {language({ id: "Ubah Password", en: "Change Password" })}
          </button>
        </div>
      </form>

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
                <IconComponent
                  iconName="Ri/RiSettings3Line"
                  className="w-5 h-5 text-neon-yellow"
                />
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

      {/* Developer Credit */}
      <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-3">
        <SectionTitle>{language({ id: "Tentang", en: "About" })}</SectionTitle>
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
