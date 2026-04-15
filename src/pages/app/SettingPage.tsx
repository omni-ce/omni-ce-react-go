import { useState } from "react";
import { RiKeyLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import SectionTitle from "@/components/SectionTitle";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { settingService } from "@/services/setting.service";
import AppIconSvg from "@/assets/react-go.svg";

export default function SettingPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saveMsg, setSaveMsg] = useState("");
  const [saveType, setSaveType] = useState<"success" | "error">("success");
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (newPassword !== confirmPassword) {
      setSaveType("error");
      setSaveMsg("Passwords do not match.");
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
      setSaveMsg(res.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to change password.";
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
        <h2 className="text-xl font-bold text-foreground">Setting</h2>
        <p className="text-sm text-dark-300 mt-1">
          Manage your account and configuration
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

      {/* Change password */}
      <form
        onSubmit={handleChangePassword}
        className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-4"
      >
        <SectionTitle>Change Password</SectionTitle>
        <div className="flex items-center gap-2 mb-2">
          <RiKeyLine className="w-4 h-4 text-dark-400" />
          <p className="text-xs text-dark-400 font-mono">
            Update your account password
          </p>
        </div>
        <div>
          <Label required>Current password</Label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
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
            <Label required>New password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
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
            <Label required>Confirm password</Label>
            <Input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
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
            Change Password
          </button>
        </div>
      </form>

      {/* Developer Credit */}
      <div className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 space-y-3">
        <SectionTitle>About</SectionTitle>
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
