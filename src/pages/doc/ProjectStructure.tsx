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
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── layouts/            # Layout wrappers (App, Auth, Main)
│   ├── pages/              # Page components
│   │   ├── app/            # Authenticated pages
│   │   ├── auth/           # Login page
│   │   └── error/          # Error pages
│   ├── stores/             # Zustand state stores
│   ├── services/           # API service layer
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   └── main.tsx            # App entry point & routing
├── main.go                 # Go backend entry point
├── dist/                   # Production build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile`}</CodeBlock>
    </div>
  );
}
