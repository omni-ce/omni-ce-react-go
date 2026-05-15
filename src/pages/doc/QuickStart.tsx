import CodeBlock from "@/components/ui/CodeBlock";
import { useLanguageStore } from "@/stores/languageStore";

export default function QuickStart() {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <p>
        {language({
          id: "Jalankan proyek dalam beberapa langkah:",
          en: "Get the project up and running in a few steps:",
        })}
      </p>
      <h3>{language({ id: "Prasyarat", en: "Prerequisites" })}</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Node.js</strong> ≥ 18 (
          {language({
            id: "atau Bun",
            en: "or Bun",
          })}
          )
        </li>
        <li>
          <strong>Go</strong> ≥ 1.21
        </li>
      </ul>
      <h3>{language({ id: "Instalasi", en: "Installation" })}</h3>
      <CodeBlock>{`# ${language({
        id: "Clone repository",
        en: "Clone the repository",
      })}
git clone https://github.com/omni-ce/omni-ce-react-go.git .

# ${language({
        id: "Installasi Frontend Dependencies",
        en: "Install frontend dependencies",
      })}
bun install   # or: npm install

# ${language({
        id: "Jalankan dalam mode pengembangan",
        en: "Run in development mode",
      })}
bun run dev   # or: npm run dev

# ${language({
        id: "Build untuk produksi",
        en: "Build for production",
      })}
bun run build # or: npm run build`}</CodeBlock>
      <h3>
        {language({
          id: "Menjalankan Go Backend",
          en: "Running the Go Backend",
        })}
      </h3>
      <CodeBlock>{`# ${language({
        id: "Unduh dependensi Go",
        en: "Download Go dependencies",
      })}
go mod download

# ${language({
        id: "Jalankan server",
        en: "Run the server",
      })}
go run main.go

# ${language({
        id: "Kompilasi binari",
        en: "Build binary",
      })}
go build -o react-go main.go
./react-go`}</CodeBlock>
    </div>
  );
}
