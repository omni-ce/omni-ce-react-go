import { useMemo, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { Role } from "@/services/role.service";

interface RolesPageProps {}
export default function RolesPage({}: RolesPageProps) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "name",
        label: language({ id: "Nama Peran", en: "Role Name" }),
        type: "text",
        required: true,
        minLength: 1,
        maxLength: 255,
      },
      {
        key: "description",
        label: language({ id: "Deskripsi", en: "Description" }),
        type: "text",
      },
    ],
    [language],
  );

  const columns = useMemo<PaginationColumn<Role>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (role) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{role.name}</span>
          </div>
        ),
      },
      {
        key: "description",
        header: language({ id: "Deskripsi", en: "Description" }),
        search: true,
        render: (role) => (
          <span className="text-dark-300">{role.description || "-"}</span>
        ),
      },
      {
        key: "is_active",
        header: language({ id: "STATUS", en: "STATUS" }),
        strict: true,
        render: (role) => (
          <Badge variant={role.is_active ? "default" : "destructive"}>
            {role.is_active
              ? language({ id: "Aktif", en: "Active" })
              : language({ id: "Nonaktif", en: "Inactive" })}
          </Badge>
        ),
      },
    ],
    [language],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Peran", en: "Roles" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola peran pengguna pada sistem",
              en: "Manage user roles in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Peran", en: "Role List" })}
        columns={columns}
        module="role"
        fields={fields}
        useIsActive
      />
    </div>
  );
}
