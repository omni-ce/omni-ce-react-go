import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function GeneralLedgerPage({ ruleKey }: Props) {
  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Buku Besar",
        en: "General Ledger",
      }}
      subtitle={{
        id: "ini adalah buku besar",
        en: "this is general ledger",
      }}
    >
      <h1>This is Content of General Ledger</h1>
    </GuardLayout>
  );
}
