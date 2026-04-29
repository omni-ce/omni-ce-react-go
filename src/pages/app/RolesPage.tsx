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

  const isProtected = (role: Role) =>
    role.name === "su" || role.name === "user";

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
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: "name",
        render: (role) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{role.name}</span>
            {isProtected(role) && (
              <Badge variant="secondary">
                {language({ id: "Dilindungi", en: "Protected" })}
              </Badge>
            )}
          </div>
        ),
      },
      {
        header: language({ id: "Deskripsi", en: "Description" }),
        search: "description",
        render: (role) => (
          <span className="text-dark-300">
            {role.description || "-"}
          </span>
        ),
      },
      {
        header: language({ id: "Dibuat Pada", en: "Created At" }),
        sort: true,
        search: "created_at",
        render: (role) => formatDateTime(role.created_at),
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
      />
    </div>
  );
}
