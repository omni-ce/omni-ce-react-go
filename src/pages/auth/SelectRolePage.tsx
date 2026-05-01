import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";
import { useRuleStore } from "@/stores/ruleStore";
import { useLanguageStore } from "@/stores/languageStore";
import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import { RiShieldCheckLine } from "react-icons/ri";
import { HiChevronDown } from "react-icons/hi";
import AppIconSvg from "@/assets/react_go.svg";
import ControlButton from "@/components/ControlButton";
import Loading from "@/components/Loading";

interface OptionItem {
  key: unknown;
  value: string;
}

export default function SelectRolePage() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { user, isLoading, validateToken } = useAuthStore();
  const { role_selected, setRoleSelected } = useRuleStore();

  const [divisions, setDivisions] = useState<{ value: string; label: string }[]>([]);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [divisionId, setDivisionId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Check auth
  useEffect(() => {
    const check = async () => {
      const valid = await validateToken("app");
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

  // Fetch divisions
  useEffect(() => {
    setLoadingDivisions(true);
    satellite
      .get<Response<OptionItem[]>>("/api/option/divisions")
      .then((res) => {
        const data = res.data.data || [];
        setDivisions(data.map((d) => ({ value: String(d.key), label: d.value })));
      })
      .catch(() => setDivisions([]))
      .finally(() => setLoadingDivisions(false));
  }, []);

  // Fetch roles when division changes
  useEffect(() => {
    if (!divisionId) {
      setRoles([]);
      setRoleId("");
      return;
    }
    setLoadingRoles(true);
    setRoleId("");
    satellite
      .get<Response<OptionItem[]>>(`/api/option/roles/${divisionId}`)
      .then((res) => {
        const data = res.data.data || [];
        setRoles(data.map((d) => ({ value: String(d.key), label: d.value })));
      })
      .catch(() => setRoles([]))
      .finally(() => setLoadingRoles(false));
  }, [divisionId]);

  // Filter roles by what user actually has
  const availableRoles = useMemo(() => {
    if (!user?.roles) return roles;
    const userRoleIds = user.roles
      .filter((r) => r.division_id === divisionId)
      .map((r) => r.role_id);
    return roles.filter((r) => userRoleIds.includes(r.value));
  }, [roles, user, divisionId]);

  // Filter divisions by what user actually has
  const availableDivisions = useMemo(() => {
    if (!user?.roles) return divisions;
    const userDivisionIds = [...new Set(user.roles.map((r) => r.division_id))];
    return divisions.filter((d) => userDivisionIds.includes(d.value));
  }, [divisions, user]);

  const handleConfirm = () => {
    if (!divisionId || !roleId) return;
    setRoleSelected({ division_id: divisionId, role_id: roleId });
    navigate("/app/dashboard", { replace: true });
  };

  const selectedDivisionLabel = availableDivisions.find((d) => d.value === divisionId)?.label;
  const selectedRoleLabel = availableRoles.find((r) => r.value === roleId)?.label;

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

      <div className="relative z-10 w-full flex flex-col items-center px-4 animate-fade-in">
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
          <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-600/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <RiShieldCheckLine className="w-4 h-4 text-dark-300" />
              <span className="text-sm text-dark-300 font-mono">
                {language({
                  id: "pilih divisi dan jabatan",
                  en: "select division and role",
                })}
              </span>
            </div>

            {/* Welcome */}
            {user && (
              <div className="mb-6 p-3 bg-dark-900/40 rounded-xl border border-dark-600/30">
                <p className="text-sm text-dark-300">
                  {language({ id: "Selamat datang,", en: "Welcome," })}
                </p>
                <p className="text-base font-semibold text-foreground">{user.name}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Division Select */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  {language({ id: "Divisi", en: "Division" })}
                </label>
                <div className="relative">
                  <select
                    value={divisionId}
                    onChange={(e) => setDivisionId(e.target.value)}
                    disabled={loadingDivisions}
                    className="w-full px-4 py-3 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled hidden>
                      {loadingDivisions
                        ? "Loading..."
                        : language({ id: "Pilih divisi...", en: "Choose division..." })}
                    </option>
                    {availableDivisions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  {language({ id: "Jabatan", en: "Role" })}
                </label>
                <div className="relative">
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    disabled={!divisionId || loadingRoles}
                    className="w-full px-4 py-3 bg-dark-900/60 border border-dark-500/50 rounded-xl text-foreground focus:outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-all text-sm appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled hidden>
                      {loadingRoles
                        ? "Loading..."
                        : !divisionId
                        ? language({ id: "Pilih divisi dulu", en: "Select division first" })
                        : language({ id: "Pilih jabatan...", en: "Choose role..." })}
                    </option>
                    {availableRoles.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                </div>
              </div>

              {/* Preview */}
              {divisionId && roleId && (
                <div className="p-3 bg-accent-500/5 border border-accent-500/20 rounded-xl animate-fade-in">
                  <p className="text-xs text-dark-400 mb-1">
                    {language({ id: "Peran terpilih:", en: "Selected role:" })}
                  </p>
                  <p className="text-sm font-semibold text-accent-400">
                    {selectedDivisionLabel} — {selectedRoleLabel}
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!divisionId || !roleId}
                className="w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RiShieldCheckLine className="w-4 h-4" />
                <span>{language({ id: "Konfirmasi", en: "Confirm" })}</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-dark-600/30">
              <p className="text-center text-xs text-dark-400 font-mono">
                {language({
                  id: "Pilih peran untuk melanjutkan",
                  en: "Choose your role to continue",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
