import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import type { Entity } from "@/types/company";
import { Badge } from "@/components/ui/Badge";
import { FileType } from "@/components/DynamicForm";
import { HOST_API } from "@/environment";
import { Avatar } from "@/components/ui/Avatar";
import BlankCompany from "@/assets/blank-company.svg";

interface Props {
  ruleKey?: string;
}
export default function EntityPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "logo",
        label: language({ id: "Logo", en: "Logo" }),
        type: "file",
        required: true,
        fileMaxSize: 1024 * 1024 * 2, // MB
        fileTarget: "entity-logo",
        fileTemplate: "company",
        fileType: [FileType.Jpeg, FileType.Png],
      },
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
      },
      {
        key: "npwp_code",
        label: language({ id: "Nomor NPWP", en: "NPWP Number" }),
        type: "text",
        required: true,
        col: 9,
      },
      {
        key: "is_taxpayer",
        label: language({ id: "Wajib Pajak", en: "Taxpayer" }),
        type: "switch",
        required: true,
        col: 3,
        booleanDefault: true,
      },
      {
        key: "npwp_alias",
        label: language({ id: "Alias NPWP", en: "NPWP Alias" }),
        type: "text",
        required: true,
      },
      {
        key: "address",
        label: language({ id: "Alamat", en: "Address" }),
        type: "textarea",
        required: true,
        col: 6,
        textareaRows: 10,
      },
      {
        key: "address_code",
        label: language({ id: "Kode Alamat", en: "Address Code" }),
        type: "address",
        required: true,
        col: 6,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<Entity>[]>(
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
              src={user.logo ? HOST_API + user.logo : BlankCompany}
              alt={user.name}
              fallback={user.name?.charAt(0)?.toUpperCase()}
            />
            <span className="font-medium">{user.name}</span>
          </div>
        ),
      },
      {
        key: "is_active",
        header: language({ id: "Status", en: "Status" }),
        rule: "set",
        render: (item) => (
          <Badge variant={item.is_active ? "default" : "destructive"}>
            {item.is_active
              ? language({ id: "Aktif", en: "Active" })
              : language({ id: "Nonaktif", en: "Inactive" })}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({
              id: "Entitas Perusahaan",
              en: "Company Entity",
            })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua entitas perusahaan pada sistem",
              en: "Manage all company entities in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Entitas Perusahaan",
          en: "Company Entity List",
        })}
        columns={columns}
        module="company/entities"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </div>
  );
}
