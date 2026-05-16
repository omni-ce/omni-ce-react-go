import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function BalanceSheetPage({ ruleKey }: Props) {
  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Neraca",
        en: "Balance Sheet",
      }}
      subtitle={{
        id: "ini adalah neraca",
        en: "this is balance sheet",
      }}
    >
      <h1>This is Content of Balance Sheet</h1>
    </GuardLayout>
  );
}
