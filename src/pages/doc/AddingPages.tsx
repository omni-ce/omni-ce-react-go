import CodeBlock from "@/components/ui/CodeBlock";
import { useLanguageStore } from "@/stores/languageStore";

export default function AddingPages() {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <p>
        {language({
          id: "Untuk menambah halaman terautentikasi baru:",
          en: "To add a new authenticated page:",
        })}
      </p>
      <h3>
        1.{" "}
        {language({
          id: "Buat Komponen Halaman",
          en: "Create the Page Component",
        })}
      </h3>
      <CodeBlock>{`// src/pages/app/MyPage.tsx
export default function MyPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          My Page
        </h2>
        <p className="text-sm text-dark-400 mt-1">
          Description here
        </p>
      </div>
      {/* Your content */}
    </div>
  );
}`}</CodeBlock>
      <h3>
        2. {language({ id: "Tambahkan Rute", en: "Add the Route" })}
      </h3>
      <CodeBlock>{`// src/main.tsx — add inside the "app" children array
{
  path: "my-page",
  element: <MyPage />,
}`}</CodeBlock>
      <h3>
        3.{" "}
        {language({
          id: "Tambahkan ke Navigasi Sidebar",
          en: "Add to Sidebar Navigation",
        })}
      </h3>
      <CodeBlock>{`// src/layouts/AppLayout.tsx — add to navItems
{
  label: "My Page",
  path: "/app/my-page",
  icon: RiPageLine,
}`}</CodeBlock>
    </div>
  );
}
