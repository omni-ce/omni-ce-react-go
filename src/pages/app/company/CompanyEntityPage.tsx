import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import type { CompanyEntity } from "@/types/company";
import { Badge } from "@/components/ui/Badge";
import { FileType } from "@/components/DynamicForm";
import { Avatar } from "@/components/ui/Avatar";
import BlankCompany from "@/assets/blank-company.svg";
import { IconComponent } from "@/components/ui/IconSelector";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function CompanyEntityPage({ ruleKey }: Props) {
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
        type: "number",
        required: true,
        col: 9,
        minLength: 16,
        maxLength: 16,
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

  const columns = useMemo<PaginationColumn<CompanyEntity>[]>(
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
              shape="square"
              src={user.logo ? user.logo : BlankCompany}
              fromAsset={user.logo ? false : true}
              alt={user.name}
              fallback={user.name?.charAt(0)?.toUpperCase()}
            />
            <span className="font-medium">{user.name}</span>
          </div>
        ),
      },
      {
        key: "npwp_code",
        header: language({ id: "NPWP", en: "NPWP" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-wider text-foreground">
                {item.npwp_code || "-"}
              </span>
              {item.is_taxpayer && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 border-accent-500/50 text-accent-500 bg-accent-500/5"
                >
                  {language({ id: "Wajib Pajak", en: "Taxpayer" })}
                </Badge>
              )}
            </div>
            {item.npwp_alias && (
              <span className="text-[11px] text-dark-400 font-medium italic">
                {item.npwp_alias}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "address",
        header: language({ id: "Alamat", en: "Address" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex flex-col gap-1 py-1 max-w-75">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 rounded-md bg-dark-800 border border-dark-600/30 text-dark-400 shrink-0 shadow-sm">
                <IconComponent
                  iconName="Hi/HiOutlineLocationMarker"
                  className="w-3.5 h-3.5"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-foreground line-clamp-1 leading-snug">
                  {item.address || "-"}
                </span>
                {item.full_address && (
                  <span className="text-[11px] text-dark-400 leading-relaxed mt-0.5 line-clamp-2 italic font-medium">
                    {item.full_address}
                  </span>
                )}
              </div>
            </div>
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

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Entitas Perusahaan",
        en: "Company Entity",
      }}
      subtitle={{
        id: "Kelola semua entitas perusahaan pada sistem",
        en: "Manage all company entities in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Entitas Perusahaan",
          en: "Company Entity List",
        })}
        columns={columns}
        module="company/entity"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </GuardLayout>
  );
}
