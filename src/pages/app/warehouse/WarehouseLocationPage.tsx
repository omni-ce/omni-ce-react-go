import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { Badge } from "@/components/ui/Badge";
import type { WarehouseLocation } from "@/types/warehouse";
import { IconComponent } from "@/components/ui/IconSelector";
import Image from "@/components/Image";
import type { UserOption } from "@/types/user";
import type { CompanyBranchOption } from "@/types/company";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function WarehouseLocationPage({ ruleKey }: Props) {
  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const fields = useMemo(
    () => [
      {
        key: "branch_id",
        label: language({ id: "Cabang", en: "Branch" }),
        type: "select",
        required: true,
        selectOptions: "company-branches",
        selectFormat: (item: CompanyBranchOption) => ({
          value: item.value,
          render: (
            <div className="flex items-center gap-2">
              <Image
                src={item.meta?.entity_logo}
                alt="logo"
                className="w-6 h-6 rounded-full"
              />
              <span>{item.label}</span>
            </div>
          ),
        }),
      },
      {
        key: "pic_id",
        label: language({ id: "PIC", en: "PIC" }),
        type: "select",
        required: true,
        selectOptions: "users",
        selectFormat: (item: UserOption) => ({
          value: item.value,
          render: (
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-center gap-2">
                <Image
                  src={item.meta.avatar}
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.array && item.array.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-8">
                  {item.array.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[9px] py-0 h-4 border-dark-600 bg-dark-800 text-dark-300 px-1.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ),
        }),
      },
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
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

  const columns = useMemo<PaginationColumn<WarehouseLocation>[]>(
    () => [
      {
        key: "branch_name",
        header: language({ id: "Cabang", en: "Branch" }),
        sort: true,
        options: "company-branches",
        render: (item) => (
          <div className="flex items-center gap-2">
            <Image
              src={item.entity_logo}
              alt="logo"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium">
              {item.entity_name} - {item.branch_name}
            </span>
          </div>
        ),
      },
      {
        key: "pic_name",
        header: language({ id: "PIC", en: "PIC" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex items-center gap-2">
            <Image
              src={item.pic_avatar}
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-medium">{item.pic_name}</span>
          </div>
        ),
      },
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => {
          let name = item.name;
          try {
            if (name.startsWith("{")) {
              const obj = JSON.parse(name);
              name = language(obj);
            }
          } catch (e) {
            // fallback to raw name
          }
          return <span className="font-medium">{name}</span>;
        },
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
      title={{ id: "Lokasi Gudang", en: "Warehouse Location" }}
      subtitle={{
        id: "Kelola semua lokasi gudang pada sistem",
        en: "Manage all warehouse location in the system",
      }}
    >
      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Lokasi Gudang",
          en: "Warehouse Location List",
        })}
        columns={columns}
        module="warehouse/location"
        fields={fields as PaginationField[]}
        ruleKey={ruleKey}
        useIsActive
      />
    </GuardLayout>
  );
}
