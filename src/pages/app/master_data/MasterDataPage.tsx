import { useLanguageStore } from "@/stores/languageStore";
import { usePermission } from "@/hooks/usePermission";
import RulePermissionPage from "@/pages/error/RulePermissionPage";
import Tabs, { type Tab } from "@/components/Tab";
import TabProductCategoryPage from "./TabProductCategoryPage";
import TabBrandPage from "./TabBrandPage";
import { useMemo } from "react";

interface Props {
  ruleKey?: string;
}

export default function MasterDataPage({ ruleKey }: Props) {
  const perm = usePermission(ruleKey);
  const { languageCode, language } = useLanguageStore();

  const tabs = useMemo<Tab[]>(
    () => [
      {
        key: "product_category",
        label: language({ id: "Kategori Produk", en: "Product Category" }),
        render: () => <TabProductCategoryPage ruleKey="product_category" />,
      },
      {
        key: "brand",
        label: language({ id: "Merek", en: "Brand" }),
        render: () => <TabBrandPage ruleKey="brand" />,
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
            {language({ id: "Data Master", en: "Master Data" })}
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {language({
              id: "Kelola data master pada sistem",
              en: "Manage master data in the system",
            })}
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} useRule />
    </div>
  );
}
