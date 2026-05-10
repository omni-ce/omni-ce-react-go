import CodeBlock from "@/components/ui/CodeBlock";
import { useLanguageStore } from "@/stores/languageStore";

export default function ProjectStructure() {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <p>
        {language({
          id: "Proyek ini mengikuti alur standar React + Go:",
          en: "The project follows a standard React + Go layout:",
        })}
      </p>
      <CodeBlock>{`react-go/
├── src/                    # ${language({ id: "Kode Source", en: "Source Code" })}
│   ├── components/         # ${language({ id: "Komponen UI yang dapat digunakan kembali", en: "Reusable UI components" })}
│   ├── layouts/            # ${language({ id: "Layout pembungkus (App, Auth, Main)", en: "Layout wrappers (App, Auth, Main)" })}
│   ├── pages/              # ${language({ id: "Komponen halaman", en: "Page components" })}
│   │   ├── app/            # ${language({ id: "Halaman terotentikasi", en: "Authenticated pages" })}
│   │   ├── auth/           # ${language({ id: "Halaman login", en: "Login page" })}
│   │   └── error/          # ${language({ id: "Halaman error", en: "Error pages" })}
│   ├── stores/             # ${language({ id: "Zustand state stores", en: "Zustand state stores" })}
│   ├── services/           # ${language({ id: "Layanan API", en: "API service layer" })}
│   ├── lib/                # ${language({ id: "Library utilitas", en: "Utility libraries" })}
│   ├── types/              # ${language({ id: "Definisi tipe TypeScript", en: "TypeScript type definitions" })}
│   └── main.tsx            # ${language({ id: "Titik masuk & routing aplikasi", en: "App entry point & routing" })}
├── main.go                 # ${language({ id: "Titik masuk backend Go", en: "Go backend entry point" })}
├── dist/                   # ${language({ id: "Output hasil build produksi", en: "Production build output" })}
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile`}</CodeBlock>
    </div>
  );
}
