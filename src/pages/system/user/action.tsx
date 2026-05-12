import { useState } from "react";
import DynamicForm, { type DynamicFormField } from "@/components/DynamicForm";
import { Button } from "@/components/ui/Button";
import { useLanguageStore } from "@/stores/languageStore";
import satellite from "@/lib/satellite";
import { toast } from "react-toastify";
import type { User } from "@/types/user";
import type { AxiosError } from "axios";
import { LanguageKey } from "@/types/world";
import type { Response } from "@/types/response";

interface ChangePasswordProps {
  row: User;
  onClose: () => void;
}
export const ChangePassword = ({ row, onClose }: ChangePasswordProps) => {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    password: "",
    retype_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!formData.password) {
      setErrorMsg(
        language({ id: "Password diperlukan", en: "Password is required" }),
      );
      return;
    }
    if (formData.password !== formData.retype_password) {
      setErrorMsg(
        language({ id: "Password tidak cocok", en: "Passwords do not match" }),
      );
      return;
    }

    setLoading(true);
    try {
      const res = await satellite.post<Response<unknown>>(
        `/api/user/change-password-from-user/${row.id}`,
        {
          password: formData.password,
        },
      );
      if (res.data?.status === 200 || res.status === 200) {
        toast.success(
          language({
            id: "Password berhasil diubah",
            en: "Password successfully changed",
          }),
        );
        onClose();
      } else {
        setErrorMsg(language(res.data?.message));
      }
    } catch (e) {
      const error = e as AxiosError<{
        message: string;
        status: number;
      }>;
      setErrorMsg(
        error?.response?.data?.message ?? "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2 px-1">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          {language({ id: "Ganti Password", en: "Change Password" })}
        </h2>
        <p className="text-sm text-dark-400 pt-1 pb-2">
          {language({
            id: "Ganti password untuk ",
            en: "Change password for ",
          })}
          <span className="font-medium text-foreground">{row.name}</span>
        </p>
      </div>

      {errorMsg && (
        <div className="text-sm text-neon-red bg-neon-red/10 p-3 rounded-lg border border-neon-red/20">
          {errorMsg}
        </div>
      )}

      <DynamicForm
        fields={[
          {
            key: "password",
            label: language({ id: "Password Baru", en: "New Password" }),
            type: "password",
            required: true,
            minLength: 8,
          },
          {
            key: "retype_password",
            label: language({
              id: "Ketik Ulang Password",
              en: "Retype Password",
            }),
            type: "password",
            required: true,
            minLength: 8,
          },
        ]}
        formData={formData}
        onChange={(key, value) =>
          setFormData((prev) => ({ ...prev, [key]: value }))
        }
      />

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-dark-600">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {language({ id: "Batal", en: "Cancel" })}
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading
            ? language({ id: "Menyimpan...", en: "Saving..." })
            : language({ id: "Simpan", en: "Save" })}
        </Button>
      </div>
    </div>
  );
};
