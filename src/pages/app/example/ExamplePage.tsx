import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function ExamplePage({ ruleKey }: Props) {
  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "Example",
        en: "Example",
      }}
      subtitle={{
        id: "ini adalah example",
        en: "this is example",
      }}
    >
      <h1>This is Content of Example</h1>
    </GuardLayout>
  );
}
