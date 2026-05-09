import { useMemo, useRef } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDateTime } from "@/utils/datetime";
import Pagination, {
  type PaginationColumn,
  type PaginationField,
  type PaginationHandle,
} from "@/components/Pagination";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import { CustomerType, type Customer } from "@/types/loyalty";
import { Badge } from "@/components/ui/Badge";
import type { CountryKey } from "@/types/language";
import { IconComponent } from "@/components/ui/IconSelector";
import { cn } from "@/lib/utils";
import type { Gender } from "@/types/option";

interface Props {
  ruleKey?: string;
}
export default function CustomerPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);

  const paginationRef = useRef<PaginationHandle>(null);
  const { languageCode, language } = useLanguageStore();

  const typeOptions = [
    {
      label: language({ id: "Reseller", en: "Reseller" }),
      value: "reseller",
    },
    {
      label: language({ id: "B2B", en: "B2B" }),
      value: "b2b",
    },
    {
      label: language({ id: "Retail", en: "Retail" }),
      value: "retail",
    },
  ];

  const fields = useMemo<PaginationField[]>(
    () => [
      {
        key: "branch_id",
        label: language({ id: "Cabang", en: "Branch" }),
        type: "select",
        required: true,
        selectOptions: "branches",
      },
      {
        key: "type",
        label: language({ id: "Tipe", en: "Type" }),
        type: "select",
        required: true,
        selectOptions: typeOptions,
      },
      {
        key: "phone",
        label: language({ id: "No. Telepon", en: "Phone" }),
        type: "phone",
        required: true,
        phoneDefaultCountry: "id" as CountryKey,
        phoneFirstAntiZero: true,
        minLength: 9,
        maxLength: 12,
      },
      {
        key: "name",
        label: language({ id: "Nama", en: "Name" }),
        type: "text",
        required: true,
        minLength: 3,
      },
      {
        key: "gender",
        label: language({ id: "Jenis Kelamin", en: "Gender" }),
        type: "select",
        selectOptions: [
          {
            label: language({ id: "Laki-laki", en: "Male" }),
            value: "L",
            icon: "Pi/PiGenderMaleBold",
          },
          {
            label: language({ id: "Perempuan", en: "Female" }),
            value: "P",
            icon: "Pi/PiGenderFemaleBold",
          },
        ],
      },
      {
        key: "dob",
        label: language({ id: "Tanggal Lahir", en: "Date of Birth" }),
        type: "date",
      },
      {
        key: "email",
        label: language({ id: "Email", en: "Email" }),
        type: "email",
        col: 9,
      },
      {
        key: "is_pkp",
        label: language({ id: "Wajib Pajak", en: "Taxable" }),
        type: "switch",
        col: 3,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  const columns = useMemo<PaginationColumn<Customer>[]>(
    () => [
      {
        key: "branch_name",
        header: language({ id: "Cabang", en: "Branch" }),
        sort: true,
        search: true,
        render: (item) => (
          <span className="font-medium">{item.branch_name}</span>
        ),
      },
      {
        key: "type",
        header: language({ id: "Tipe", en: "Type" }),
        sort: true,
        options: typeOptions,
        render: (item) => (
          <Badge
            variant={
              item.type === CustomerType.Retail ? "default" : "secondary"
            }
          >
            {item.type}
          </Badge>
        ),
      },
      {
        key: "name",
        header: language({ id: "Nama", en: "Name" }),
        sort: true,
        search: true,
        render: (item) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">
                {item.name}
              </span>
              {item.gender && (
                <IconComponent
                  iconName={
                    item.gender === "L"
                      ? "Pi/PiGenderMaleBold"
                      : "Pi/PiGenderFemaleBold"
                  }
                  className={cn(
                    "w-4 h-4",
                    item.gender === "L" ? "text-blue-400" : "text-pink-400",
                  )}
                />
              )}
            </div>
            {item.dob && (
              <div className="flex items-center gap-1 text-[11px] text-dark-400 font-medium">
                <IconComponent
                  iconName="Hi/HiOutlineCalendar"
                  className="w-3 h-3"
                />
                <span>{formatDateTime(item.dob)}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: "contact",
        header: language({ id: "Kontak", en: "Contact" }),
        render: (item) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-dark-300">
              <div className="w-5 flex justify-center">
                <IconComponent
                  iconName="Hi/HiOutlinePhone"
                  className="w-3.5 h-3.5 text-accent-500"
                />
              </div>
              <span className="font-mono tracking-tight">{item.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-300">
              <div className="w-5 flex justify-center">
                <IconComponent
                  iconName="Hi/HiOutlineMail"
                  className="w-3.5 h-3.5 text-accent-500"
                />
              </div>
              <span className="truncate max-w-[150px]">{item.email}</span>
            </div>
          </div>
        ),
      },
      {
        key: "is_pkp",
        header: language({ id: "Wajib Pajak", en: "Taxable" }),
        rule: "set",
        render: (item) => (
          <Badge variant={item.is_pkp ? "secondary" : "outline"}>
            {item.is_pkp
              ? language({ id: "Ya", en: "Yes" })
              : language({ id: "Tidak", en: "No" })}
          </Badge>
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

  const dummyData = useMemo<Customer[]>(
    () => [
      {
        id: 1,
        branch_id: 1,
        branch_name: "Cabang 1",
        type: CustomerType.Reseller,
        phone: "08123456789",
        name: "Customer 1",
        gender: "L" as Gender,
        dob: "2000-01-01",
        email: "[EMAIL_ADDRESS]",
        is_pkp: true,
        is_active: true,
        plafond: 0,
        total_piutang: 0,
        created_at: "",
        created_by: 0,
        updated_at: "",
        updated_by: 0,
      },
      {
        id: 2,
        branch_id: 1,
        branch_name: "Cabang 1",
        type: CustomerType.B2B,
        phone: "08123456789",
        name: "Customer 2",
        gender: "P" as Gender,
        dob: "2000-01-01",
        email: "[EMAIL_ADDRESS]",
        is_pkp: false,
        is_active: true,
        plafond: 0,
        total_piutang: 0,
        created_at: "",
        created_by: 0,
        updated_at: "",
        updated_by: 0,
      },
      {
        id: 3,
        branch_id: 1,
        branch_name: "Cabang 1",
        type: CustomerType.Retail,
        phone: "08123456789",
        name: "Customer 3",
        gender: "L" as Gender,
        dob: "2000-01-01",
        email: "[EMAIL_ADDRESS]",
        is_pkp: true,
        is_active: false,
        plafond: 0,
        total_piutang: 0,
        created_at: "",
        created_by: 0,
        updated_at: "",
        updated_by: 0,
      },
    ],
    [],
  );

  if (!perm.canRead) return <RulePermissionPage />;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {language({ id: "Pelanggan", en: "Customer" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola semua pelanggan pada sistem",
              en: "Manage all customers in the system",
            })}
          </p>
        </div>
      </div>

      <Pagination
        ref={paginationRef}
        title={language({
          id: "Daftar Pelanggan",
          en: "Customer List",
        })}
        columns={columns}
        module="loyalty/customer"
        fields={fields}
        ruleKey={ruleKey}
        useIsActive
        dummyData={dummyData}
      />
    </div>
  );
}
