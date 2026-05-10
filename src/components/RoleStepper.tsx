import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import satellite from "@/lib/satellite";
import type { Response } from "@/types/response";
import type { Option } from "@/types/option";
import Loading from "@/components/Loading";
import { IconComponent } from "@/components/ui/IconSelector";

interface RoleStepperProps {
  onComplete: (divisionId: string, roleId: string) => void;
  initialDivisionId?: string;
  initialRoleId?: string;
}

export default function RoleStepper({
  onComplete,
  initialDivisionId = "",
  initialRoleId = "",
}: RoleStepperProps) {
  const { language } = useLanguageStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(initialDivisionId ? 2 : 1);
  const [divisions, setDivisions] = useState<
    { value: string; label: string }[]
  >([]);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [divisionId, setDivisionId] = useState(initialDivisionId);
  const [roleId, setRoleId] = useState(initialRoleId);
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Fetch divisions
  useEffect(() => {
    setLoadingDivisions(true);
    satellite
      .get<Response<Option[]>>("/api/option/divisions")
      .then((res) => {
        const data = res.data.data || [];
        setDivisions(
          data.map((d) => ({ value: String(d.value), label: d.label })),
        );
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
    // don't reset role if we are going backwards and already selected something for THIS division,
    // but usually stepper logic resets it when you pick a NEW division.
    satellite
      .get<Response<Option[]>>(`/api/option/roles/${divisionId}`)
      .then((res) => {
        const data = res.data.data || [];
        setRoles(data.map((d) => ({ value: String(d.value), label: d.label })));
      })
      .catch(() => setRoles([]))
      .finally(() => setLoadingRoles(false));
  }, [divisionId]);

  // Filter divisions by what user actually has
  const availableDivisions = useMemo(() => {
    if (user?.role === "su") return divisions;
    if (!user?.roles) return divisions;
    const userDivisionIds = [...new Set(user.roles.map((r) => r.division_id))];
    return divisions.filter((d) => userDivisionIds.includes(d.value));
  }, [divisions, user]);

  // Filter roles by what user actually has
  const availableRoles = useMemo(() => {
    if (user?.role === "su") return roles;
    if (!user?.roles) return roles;
    const userRoleIds = user.roles
      .filter((r) => r.division_id === divisionId)
      .map((r) => r.role_id);
    return roles.filter((r) => userRoleIds.includes(r.value));
  }, [roles, user, divisionId]);

  const handleSelectDivision = (id: string) => {
    setDivisionId(id);
    if (id !== divisionId) {
      setRoleId("");
    }
    setStep(2);
  };

  const handleSelectRole = (id: string) => {
    setRoleId(id);
    onComplete(divisionId, id);
  };

  if (loadingDivisions) return <Loading />;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Stepper Header */}
      <div className="w-full max-w-sm mb-6 flex items-center">
        <div className="flex flex-col items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
              step >= 1
                ? "bg-accent-500 border-accent-500 text-white shadow-lg shadow-accent-500/30"
                : "border-dark-600 text-dark-400 bg-dark-800"
            }`}
          >
            {step > 1 ? (
              <IconComponent iconName="Hi2/HiCheck" className="w-5 h-5" />
            ) : (
              "1"
            )}
          </div>
          <span className="text-xs font-medium text-dark-400 mt-2">
            {language({ id: "Divisi", en: "Division" })}
          </span>
        </div>
        <div
          className={`h-1 flex-1 mx-2 rounded transition-colors ${
            step >= 2 ? "bg-accent-500" : "bg-dark-600"
          }`}
        />
        <div className="flex flex-col items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
              step >= 2
                ? "bg-accent-500 border-accent-500 text-white shadow-lg shadow-accent-500/30"
                : "border-dark-600 text-dark-400 bg-dark-800"
            }`}
          >
            2
          </div>
          <span className="text-xs font-medium text-dark-400 mt-2">
            {language({ id: "Jabatan", en: "Role" })}
          </span>
        </div>
      </div>

      <div className="w-full relative min-h-[250px]">
        {/* Step 1: Divisions */}
        {step === 1 && (
          <div className="absolute inset-0 animate-fade-in flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              {language({
                id: "Pilih Divisi Anda",
                en: "Select Your Division",
              })}
            </h3>
            {availableDivisions.length === 0 ? (
              <p className="text-sm text-dark-400 text-center py-8">
                {language({
                  id: "Tidak ada divisi yang tersedia.",
                  en: "No divisions available.",
                })}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[300px] p-1">
                {availableDivisions.map((div) => (
                  <button
                    key={div.value}
                    onClick={() => handleSelectDivision(div.value)}
                    className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-200 text-center ${
                      divisionId === div.value
                        ? "bg-badge-light-blue border-accent-500 text-accent-500"
                        : "bg-dark-800 border-dark-600 hover:bg-dark-800 hover:border-dark-500 text-dark-200"
                    }`}
                  >
                    <IconComponent
                      iconName="Ri/RiBuilding4Line"
                      className={`w-8 h-8 mb-2 ${divisionId === div.value ? "text-accent-500" : "text-dark-400"}`}
                    />
                    <span className="text-sm font-medium">{div.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Roles */}
        {step === 2 && (
          <div className="absolute inset-0 animate-fade-in flex flex-col">
            <div className="flex items-center mb-4 relative">
              <button
                onClick={() => setStep(1)}
                className="absolute left-0 p-2 text-dark-400 hover:text-foreground hover:bg-dark-800 rounded-lg transition-colors"
                title={language({ id: "Kembali", en: "Back" })}
              >
                <IconComponent
                  iconName="Hi2/HiOutlineArrowLeft"
                  className="w-5 h-5"
                />
              </button>
              <h3 className="text-lg font-semibold text-foreground text-center w-full">
                {language({ id: "Pilih Jabatan Anda", en: "Select Your Role" })}
              </h3>
            </div>

            {loadingRoles ? (
              <div className="flex justify-center py-8">
                <Loading />
              </div>
            ) : availableRoles.length === 0 ? (
              <p className="text-sm text-dark-400 text-center py-8">
                {language({
                  id: "Tidak ada jabatan yang tersedia untuk divisi ini.",
                  en: "No roles available for this division.",
                })}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[300px] p-1">
                {availableRoles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleSelectRole(role.value)}
                    className={`flex items-center p-4 rounded-xl border transition-all duration-200 text-left ${
                      roleId === role.value
                        ? "bg-badge-light-blue border-accent-500 text-accent-500"
                        : "bg-dark-800 border-dark-600 hover:bg-dark-800 hover:border-dark-500 text-dark-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 ${roleId === role.value ? "bg-accent-500/20" : "bg-dark-700"}`}
                    >
                      <IconComponent
                        iconName="Ri/RiUserStarLine"
                        className={`w-5 h-5 ${roleId === role.value ? "text-accent-500" : "text-dark-400"}`}
                      />
                    </div>
                    <span className="text-sm font-medium flex-1">
                      {role.label}
                    </span>
                    {roleId === role.value && (
                      <IconComponent
                        iconName="Hi2/HiCheck"
                        className="w-5 h-5 ml-2 text-accent-500 shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
