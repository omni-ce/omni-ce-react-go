import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { Badge } from "@/components/ui/Badge";
import { IconComponent } from "@/components/ui/IconSelector";
import GuardLayout from "@/components/GuardLayout";
import { LanguageKey } from "@/types/world";
import type { SupplierEntity } from "@/types/supplier";

interface Props {
  ruleKey: string;
}
export default function SupplierEntityPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
      },
      {
        key: "address",
        label: language({ id: "Alamat", en: "Address" }),
        type: "address",
        required: true,
      },
      {
        key: "phone",
        label: language({ id: "Telepon", en: "Phone" }),
        type: "phone",
        required: true,
        phoneDefaultCountry: LanguageKey.ID,
        phoneFirstAntiZero: true,
      },
      {
        key: "email",
        label: language({ id: "Email", en: "Email" }),
        type: "email",
        required: true,
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

  const columns = useMemo<PaginationColumn<SupplierEntity>[]>(
    () => [
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-medium">{item.name}</span>,
      },
      {
        key: "address",
        header: language({ id: "Alamat", en: "Address" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-medium">{item.address}</span>,
      },
      {
        key: "phone",
        header: language({ id: "Telepon", en: "Phone" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-medium">{item.phone}</span>,
      },
      {
        key: "email",
        header: language({ id: "Email", en: "Email" }),
        sort: true,
        search: true,
        render: (item) => <span className="font-medium">{item.email}</span>,
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
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-500 hover:text-accent-500 transition-colors"
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

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{ id: "Entitas Supplier", en: "Supplier Entity" }}
      subtitle={{
        id: "Kelola semua entitas supplier pada sistem",
        en: "Manage all supplier entity in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Entitas Supplier",
          en: "Supplier Entity List",
        })}
        columns={columns}
        module="supplier/entity"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
      />
    </GuardLayout>
  );
}
