import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ProfitAndLosePage({ ruleKey }: Props) {
  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Laba Rugi",
        en: "Profit and Lose",
      }}
      subtitle={{
        id: "ini adalah laba rugi",
        en: "this is profit and lose",
      }}
    >
      <h1>This is Content of Profit and Lose</h1>
    </GuardLayout>
  );
}
