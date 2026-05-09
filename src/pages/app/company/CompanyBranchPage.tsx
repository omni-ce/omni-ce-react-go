import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import type { CompanyBranch } from "@/types/company";
import { Badge } from "@/components/ui/Badge";
import { IconComponent } from "@/components/ui/IconSelector";

interface Props {
  ruleKey?: string;
}
export default function CompanyBranchPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "entity_id",
        label: language({ id: "Entitas", en: "Entity" }),
        type: "select",
        required: true,
        selectOptions: "company-entities",
      },
      {
        key: "pic_id",
        label: language({ id: "PIC", en: "PIC" }),
        type: "select",
        required: true,
        selectOptions: "users",
      },

      {
        key: "code",
        label: language({ id: "Kode", en: "Code" }),
        type: "text",
        required: true,
      },
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
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
      {
        key: "phone",
        label: language({ id: "Nomor Telepon", en: "Phone Number" }),
        type: "phone",
        required: true,
        phoneFirstAntiZero: true,
      },
      {
        key: "map",
        label: language({ id: "Peta Lokasi", en: "Location Map" }),
        type: "map",
        required: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<CompanyBranch>[]>(
    () => [
      {
        key: "entity_name",
        header: language({ id: "Entitas", en: "Entity" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex items-center gap-3">
            <span className="font-medium">{item.entity_name}</span>
          </div>
        ),
      },
      {
        key: "code",
        header: language({ id: "Kode", en: "Code" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex items-center gap-3">
            <span className="font-medium">{item.code}</span>
          </div>
        ),
      },
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex items-center gap-3">
            <span className="font-medium">{item.name}</span>
          </div>
        ),
      },
      {
        key: "pic_name",
        header: language({ id: "PIC", en: "PIC" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-wider text-foreground">
                {item.pic_name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-600/30 text-[12px] text-foreground shadow-sm font-medium">
              <IconComponent
                iconName="Hi/HiOutlinePhone"
                className="w-3.5 h-3.5 text-accent-500"
              />
              <span className="font-mono">{item.phone.replace(" ", "")}</span>
            </div>
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
        key: "map",
        header: language({ id: "Peta", en: "Map" }),
        render: (item) => (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-dark-400">
              <IconComponent
                iconName="Hi/HiOutlineGlobeAlt"
                className="w-3.5 h-3.5"
              />
              <span className="font-mono text-[11px]">
                {item.map.latitude.toFixed(6)}, {item.map.longitude.toFixed(6)}
              </span>
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${item.map.latitude}&mlon=${item.map.longitude}#map=17/${item.map.latitude}/${item.map.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-500 hover:text-accent-400 transition-colors"
            >
              <IconComponent
                iconName="Ri/RiExternalLinkLine"
                className="w-3 h-3"
              />
              {language({ id: "Lihat di Peta", en: "View on Map" })}
            </a>
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
              id: "Cabang Perusahaan",
              en: "Company Branch",
            })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua cabang perusahaan pada sistem",
              en: "Manage all company branches in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Cabang Perusahaan",
          en: "Company Branch List",
        })}
        columns={columns}
        module="company/branch"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </div>
  );
}
