import CodeBlock from "@/components/ui/CodeBlock";
import { useLanguageStore } from "@/stores/languageStore";

export default function Theming() {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <p>
        {language({
          id: "Tema didefinisikan di ",
          en: "Themes are defined in ",
        })}
        <code>src/index.css</code>{" "}
        {language({
          id: "menggunakan CSS custom properties. Proyek ini mendukung mode gelap dan terang.",
          en: "using CSS custom properties. The project supports both dark and light modes.",
        })}
      </p>
      <h3>{language({ id: "Variabel Warna", en: "Color Variables" })}</h3>
      <CodeBlock>{`/* Dark mode (default) */
 :root {
   --t-dark-900: #0a0a0f;
   --t-dark-800: #12121a;
   --t-foreground: #ffffff;
 }
 
 /* Light mode */
 :root[data-theme="light"] {
   --t-dark-900: #ffffff;
   --t-dark-800: #f1f3f8;
   --t-foreground: #111827;
 }`}</CodeBlock>
      <p>
        {language({
          id: "Toggle tema dikelola oleh ",
          en: "The theme toggle is managed by ",
        })}
        <code>src/stores/themeStore.ts</code>{" "}
        {language({
          id: "dan dipersistenkan melalui middleware ",
          en: "and persisted via Zustand's ",
        })}
        <code>persist</code> middleware.
      </p>
    </div>
  );
}
