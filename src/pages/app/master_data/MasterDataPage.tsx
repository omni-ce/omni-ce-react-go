import { useLanguageStore } from "@/stores/languageStore";
import Tabs, { type Tab } from "@/components/Tab";
import TabUnitPage from "@/pages/app/master_data/TabUnitPage";
import { useMemo } from "react";
import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}

export default function MasterDataPage({ ruleKey }: Props) {
  const { languageCode, language } = useLanguageStore();

  const tabs = useMemo<Tab[]>(
    () => [
      {
        key: "unit",
        label: language({ id: "Satuan", en: "Unit" }),
        render: () => <TabUnitPage ruleKey="unit" />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [languageCode, language],
  );

  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Data Master",
        en: "Master Data",
      }}
      subtitle={{
        id: "Kelola data master pada sistem",
        en: "Manage master data in the system",
      }}
    >
      <Tabs tabs={tabs} useRule />
    </GuardLayout>
  );
}
