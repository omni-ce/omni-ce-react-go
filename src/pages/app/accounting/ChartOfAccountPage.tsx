import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ChartOfAccountPage({ ruleKey }: Props) {
  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Bagan Akun",
        en: "Chart of Account",
      }}
      subtitle={{
        id: "ini adalah bagan akun",
        en: "this is chart of account",
      }}
    >
      <h1>This is Content of Chart of Account</h1>
    </GuardLayout>
  );
}
