import { useLanguageStore } from "@/stores/languageStore";

export default function Introduction() {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <p>
        {language({
          id: "Selamat datang di dokumentasi ",
          en: "Welcome to the ",
        })}
        <strong>Base Project</strong>.{" "}
        {language({
          id: "Proyek ini adalah template dasar untuk membangun aplikasi web full-stack dengan ",
          en: "This project is a starter template for building full-stack web applications with ",
        })}
        <strong>React</strong> (frontend) dan <strong>Go</strong> (backend).
      </p>
      <h3>{language({ id: "Fitur", en: "Features" })}</h3>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>React + Vite</strong> —{" "}
          {language({
            id: "Server dev cepat dengan HMR dan build produksi yang dioptimalkan.",
            en: "Fast dev server with HMR and optimized production builds.",
          })}
        </li>
        <li>
          <strong>Go Backend</strong> —{" "}
          {language({
            id: "Binary terkompilasi dengan frontend yang tertanam melalui embed.FS.",
            en: "Compiled binary with embedded frontend via embed.FS.",
          })}
        </li>
        <li>
          <strong>TailwindCSS v4</strong> —{" "}
          {language({
            id: "CSS utility-first dengan dukungan mode gelap.",
            en: "Utility-first CSS with dark mode support.",
          })}
        </li>
        <li>
          <strong>Authentication</strong> —{" "}
          {language({
            id: "Alur login bawaan dengan validasi token.",
            en: "Built-in login flow with token validation.",
          })}
        </li>
        <li>
          <strong>Dark / Light Mode</strong> —{" "}
          {language({
            id: "Toggle tema dengan status yang persisten.",
            en: "Theme toggle with persistent state.",
          })}
        </li>
        <li>
          <strong>Responsive Layout</strong> —{" "}
          {language({
            id: "Sidebar yang dapat dilipat dengan dukungan seluler.",
            en: "Collapsible sidebar with mobile support.",
          })}
        </li>
      </ul>
    </div>
  );
}
