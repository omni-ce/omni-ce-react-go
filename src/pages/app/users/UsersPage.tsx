import { useMemo, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useLanguageStore } from "@/stores/languageStore";
import type { User } from "@/types/user";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import BlankUser from "@/assets/blank-user.svg";

interface UsersPageProps {}
export default function UsersPage({}: UsersPageProps) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
        minLength: 3,
        maxLength: 255,
      },
      {
        key: "username",
        label: language({ id: "Username", en: "Username" }),
        type: "text",
        required: true,
        debounce: "username",
        minLength: 3,
        maxLength: 255,
      },
      {
        key: "password",
        label: language({ id: "Password", en: "Password" }),
        type: "password",
        only: "create",
        required: true,
        minLength: 8,
      },

      {
        key: "roles",
        label: language({ id: "Roles", en: "Roles" }),
        type: "array",
        required: true,
        minLength: 1,
        strict: true,
        children: [
          {
            key: "division_id",
            label: language({ id: "Role Divisi", en: "Role Division" }),
            type: "select",
            required: true,
            col: 6,
            options: "divisions",
          },
          {
            key: "role_id",
            label: language({ id: "Jabatan", en: "Role" }),
            type: "select",
            required: true,
            col: 6,
            ref: "division_id",
            options: "roles/{division_id}",
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<User>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (user) => (
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              src={user.avatar ? `/avatar/${user.avatar}` : BlankUser}
              alt={user.name}
              fallback={user.name?.charAt(0)?.toUpperCase()}
            />
            <span className="font-medium">{user.name}</span>
          </div>
        ),
      },
      {
        key: "username",
        header: language({ id: "Username", en: "Username" }),
        sort: true,
        search: true,
        render: (user) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-dark-300">
              {user.username}
            </span>
          </div>
        ),
      },
      {
        key: "role",
        header: language({ id: "Role", en: "Role" }),
        sort: true,
        search: true,
        render: (user) => (
          <div className="flex flex-wrap items-center gap-2">
            {user.roles &&
              user.roles.map((role) => (
                <Badge key={role.role_id} variant={"secondary"}>
                  {role.role_name}
                </Badge>
              ))}
          </div>
        ),
      },
      {
        key: "is_active",
        header: language({ id: "STATUS", en: "STATUS" }),
        strict: true,
        render: (user) => (
          <Badge variant={user.is_active ? "default" : "destructive"}>
            {user.is_active
              ? language({ id: "Aktif", en: "Active" })
              : language({ id: "Nonaktif", en: "Inactive" })}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Pengguna", en: "Users" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua pengguna pada sistem",
              en: "Manage all users in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({ id: "Daftar Pengguna", en: "User List" })}
        module="user"
        columns={columns}
        fields={fields}
        useIsActive
      />
    </div>
  );
}
