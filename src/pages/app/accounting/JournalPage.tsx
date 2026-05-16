import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function JournalPage({ ruleKey }: Props) {
  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Jurnal Umum",
        en: "General Journal",
      }}
      subtitle={{
        id: "ini adalah jurnal umum",
        en: "this is general journal",
      }}
    >
      <h1>This is Content of General Journal</h1>
    </GuardLayout>
  );
}
