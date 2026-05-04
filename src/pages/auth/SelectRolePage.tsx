import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useRuleStore } from "@/stores/ruleStore";
import { useLanguageStore } from "@/stores/languageStore";
import { RiShieldCheckLine } from "react-icons/ri";
import AppIconSvg from "@/assets/react_go.svg";
import ControlButton from "@/components/ControlButton";
import Loading from "@/components/Loading";
import RoleStepper from "@/components/RoleStepper";

export default function SelectRolePage() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { user, isLoading, validateToken } = useAuthStore();
  const { role_selected, setRoleSelected } = useRuleStore();

  // Check auth
  useEffect(() => {
    const check = async () => {
      const valid = await validateToken();
      if (!valid) {
        navigate("/login", { replace: true });
      }
    };
    check();
  }, [validateToken, navigate]);

  // If su, skip this page
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "su") {
        navigate("/app/dashboard", { replace: true });
      }
    }
  }, [isLoading, user, navigate]);

  // If already has role_selected, redirect
  useEffect(() => {
    if (!isLoading && role_selected) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isLoading, role_selected, navigate]);

  const handleComplete = (divisionId: string, roleId: string) => {
    setRoleSelected({ division_id: divisionId, role_id: roleId });
    navigate("/app/dashboard", { replace: true });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-dark-900 overflow-hidden">
      {/* top right */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <ControlButton />
      </div>

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-accent-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-100 h-100 bg-neon-cyan/8 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full flex flex-col items-center px-4 animate-fade-in py-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src={AppIconSvg} alt="App" className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Base Project
            </h1>
            <p className="text-xs text-dark-300 font-mono">
              {language({ id: "Pilih Peran", en: "Select Role" })}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-md">
          <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-600/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <RiShieldCheckLine className="w-5 h-5 text-dark-300" />
              <span className="text-sm text-dark-300 font-mono">
                {language({
                  id: "pilih divisi dan jabatan",
                  en: "select division and role",
                })}
              </span>
            </div>

            {/* Welcome */}
            {user && (
              <div className="mb-8 p-4 bg-dark-900/40 rounded-xl border border-dark-600/30 text-center">
                <p className="text-sm text-dark-300">
                  {language({ id: "Selamat datang,", en: "Welcome," })}
                </p>
                <p className="text-lg font-semibold text-foreground">{user.name}</p>
              </div>
            )}

            <RoleStepper onComplete={handleComplete} />
          </div>
        </div>
      </div>
    </div>
  );
}
