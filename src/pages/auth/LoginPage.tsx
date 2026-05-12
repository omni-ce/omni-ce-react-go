import { Fragment, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Link, useNavigate } from "react-router";
import { useLanguageStore } from "@/stores/languageStore";
import AppIconSvg from "@/assets/react_go.svg";
import { useRuleStore } from "@/stores/ruleStore";
import { IconComponent } from "@/components/ui/IconSelector";
import Image from "@/components/Image";
import DynamicForm, { type DynamicFormField } from "@/components/DynamicForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();

  const [formData, setFormData] = useState<Record<string, string>>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Record<"id" | "en", string> | null>(null);
  const { login } = useAuthStore();
  const { setRules } = useRuleStore();

  const fields: DynamicFormField[] = [
    {
      key: "username",
      label: language({ id: "Nama pengguna", en: "Username" }),
      type: "username",
      required: true,
    },
    {
      key: "password",
      label: language({ id: "Kata sandi", en: "Password" }),
      type: "password",
      required: true,
    },
  ];

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(formData.username, formData.password);
      if (response.success) {
        setRules(response.rules ?? []);
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
            <p className="text-xs text-dark-400">
              {language({ id: "Dasbor Admin", en: "Admin Dashboard" })}
            </p>
          </div>
        </div>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-dark-900 border border-dark-600/40 rounded-3xl p-8 shadow-[0_2px_48px_rgba(205,208,223,0.4)]">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <IconComponent
              iconName="Ri/RiLockLine"
              className="w-4 h-4 text-dark-300"
            />
            <span className="text-sm text-dark-400">
              {language({
                id: "autentikasi diperlukan",
                en: "authentication required",
              })}
            </span>
          </div>

          {error && (
            <div className="bg-neon-red/10 border border-neon-red/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-neon-red">{language(error)}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <DynamicForm
              fields={fields}
              formData={formData}
              onChange={(key, val) =>
                setFormData((prev) => ({ ...prev, [key]: val as string }))
              }
              disabled={isLoading}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
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
            <p className="text-center text-xs text-dark-400">
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
