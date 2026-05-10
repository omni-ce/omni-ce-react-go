import { useLanguageStore } from "@/stores/languageStore";

export default function TechStack() {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-dark-600/50">
        <table className="w-full text-sm text-left">
          <thead className="bg-dark-800 text-dark-200">
            <tr>
              <th className="px-4 py-3">
                {language({ id: "Lapisan", en: "Layer" })}
              </th>
              <th className="px-4 py-3">
                {language({ id: "Teknologi", en: "Technology" })}
              </th>
              <th className="px-4 py-3">
                {language({ id: "Tujuan", en: "Purpose" })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600/50">
            <tr>
              <td className="px-4 py-3 font-medium">Frontend</td>
              <td className="px-4 py-3">React 19 + Vite</td>
              <td className="px-4 py-3 text-dark-400">
                {language({
                  id: "UI framework dengan builder cepat",
                  en: "UI framework with fast builder",
                })}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Styling</td>
              <td className="px-4 py-3">TailwindCSS v4</td>
              <td className="px-4 py-3 text-dark-400">
                {language({ id: "CSS utility-first", en: "Utility-first CSS" })}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">State</td>
              <td className="px-4 py-3">Zustand</td>
              <td className="px-4 py-3 text-dark-400">
                {language({
                  id: "Manajemen state ringan",
                  en: "Lightweight state management",
                })}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Icons</td>
              <td className="px-4 py-3">react-icons</td>
              <td className="px-4 py-3 text-dark-400">
                {language({ id: "Pustaka ikon", en: "Icon library" })}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">HTTP</td>
              <td className="px-4 py-3">Axios</td>
              <td className="px-4 py-3 text-dark-400">
                {language({ id: "Klien API", en: "API client" })}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Backend</td>
              <td className="px-4 py-3">Go</td>
              <td className="px-4 py-3 text-dark-400">
                {language({
                  id: "Server API dengan frontend tertanam",
                  en: "API server with embedded frontend",
                })}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Routing</td>
              <td className="px-4 py-3">React Router v7</td>
              <td className="px-4 py-3 text-dark-400">
                {language({
                  id: "Routing sisi klien",
                  en: "Client-side routing",
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
