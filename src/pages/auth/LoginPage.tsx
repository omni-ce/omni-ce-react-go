import { Fragment, useState, type FormEvent } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Link, useNavigate } from "react-router";
import { useLanguageStore } from "@/stores/languageStore";
import AppIconSvg from "@/assets/react_go.svg";
import { useRuleStore } from "@/stores/ruleStore";
import type { Rule } from "@/types/rule";
import { IconComponent } from "@/components/ui/IconSelector";

export default function LoginPage() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Record<"id" | "en", string> | null>(null);
  const { login } = useAuthStore();
  const { setRules } = useRuleStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(username, password);
      if (response.success) {
        setRules((response.rules as Rule[]) || []);
        navigate("/select-role", { replace: true });
      } else {
        setError({
          id: "Username atau password salah",
          en: "Invalid username or password",
        });
      }
    } catch (err: unknown) {
      setError({
        id: "Username atau password salah",
        en: "Invalid username or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 animate-fade-in">
      {/* Logo & Brand */}
      <Link to={"/"}>
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <img src={AppIconSvg} alt="App" className="w-12 h-12" />
            {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-pulse-glow" /> */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Base Project
            </h1>
            <p className="text-xs text-dark-300 font-mono">
              {language({ id: "Dasbor Admin", en: "Admin Dashboard" })}
            </p>
          </div>
        </div>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-600/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <IconComponent
              iconName="Ri/RiLockLine"
              className="w-4 h-4 text-dark-300"
            />
            <span className="text-sm text-dark-300 font-mono">
              {language({
                id: "autentikasi diperlukan",
                en: "authentication required",
              })}
            </span>
          </div>

          {error && (
            <div className="bg-neon-red/10 border border-neon-red/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-neon-red font-mono">
                {language(error)}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                {language({ id: "Nama pengguna", en: "Username" })}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={language({
                    id: "Masukkan nama pengguna",
                    en: "Enter username",
                  })}
                  className="w-full px-4 py-3 pl-11 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm"
                  required
                />
                <IconComponent
                  iconName="Ri/RiUserLine"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                {language({ id: "Kata sandi", en: "Password" })}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language({
                    id: "Masukkan kata sandi",
                    en: "Enter password",
                  })}
                  className="w-full px-4 py-3 pl-11 pr-12 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground placeholder-dark-400 focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all font-mono text-sm"
                  required
                />
                <IconComponent
                  iconName="Ri/RiLockLine"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? (
                    <IconComponent
                      iconName="Ri/RiEyeOffLine"
                      className="w-4 h-4"
                    />
                  ) : (
                    <IconComponent
                      iconName="Ri/RiEyeLine"
                      className="w-4 h-4"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Fragment>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {language({
                      id: "Menghubungkan...",
                      en: "Connecting...",
                    })}
                  </span>
                </Fragment>
              ) : (
                <Fragment>
                  <IconComponent
                    iconName="Ri/RiTerminalLine"
                    className="w-4 h-4"
                  />
                  <span>{language({ id: "Masuk", en: "Sign In" })}</span>
                </Fragment>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-dark-600/30">
            <p className="text-center text-xs text-dark-400 font-mono">
              {language({
                id: "Akses Dasbor Aman",
                en: "Secure Dashboard Access",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
