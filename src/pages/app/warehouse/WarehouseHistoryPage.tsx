import GuardLayout from "@/components/GuardLayout";

interface Props {
  ruleKey: string;
}
export default function WarehouseHistoryPage({ ruleKey }: Props) {
  return (
    <GuardLayout
      ruleKey={ruleKey}
      title={{
        id: "History Barang Gudang",
        en: "Warehouse Product History",
      }}
      subtitle={{
        id: "Halaman ini digunakan untuk melihat history barang gudang",
        en: "This page is used to view warehouse product history",
      }}
    >
      <h1>This is Content of Example</h1>
    </GuardLayout>
  );
}
