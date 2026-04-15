import { useState } from "react";
import {
  RiBookOpenLine,
  RiRocketLine,
  RiStackLine,
  RiSettings3Line,
  RiArrowRightSLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { Link } from "react-router";

interface DocSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items: DocItem[];
}

interface DocItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

const sections: DocSection[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: RiRocketLine,
    items: [
      {
        id: "introduction",
        title: "Introduction",
        content: (
          <div className="space-y-4">
            <p>
              Welcome to the <strong>Base Project</strong> documentation. This
              project is a starter template for building full-stack web
              applications with <strong>React</strong> (frontend) and{" "}
              <strong>Go</strong> (backend).
            </p>
            <h3>Features</h3>
            <ul>
              <li>
                <strong>React + Vite</strong> — Fast dev server with HMR and
                optimized production builds.
              </li>
              <li>
                <strong>Go Backend</strong> — Compiled binary with embedded
                frontend via <code>embed.FS</code>.
              </li>
              <li>
                <strong>TailwindCSS v4</strong> — Utility-first CSS with dark
                mode support.
              </li>
              <li>
                <strong>Authentication</strong> — Built-in login flow with token
                validation.
              </li>
              <li>
                <strong>Dark / Light Mode</strong> — Theme toggle with
                persistent state.
              </li>
              <li>
                <strong>Responsive Layout</strong> — Collapsible sidebar with
                mobile support.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "quick-start",
        title: "Quick Start",
        content: (
          <div className="space-y-4">
            <p>Get the project up and running in a few steps:</p>
            <h3>Prerequisites</h3>
            <ul>
              <li>
                <strong>Node.js</strong> ≥ 18 (or Bun)
              </li>
              <li>
                <strong>Go</strong> ≥ 1.21
              </li>
            </ul>
            <h3>Installation</h3>
            <CodeBlock>{`# Clone the repository
git clone https://github.com/jefripunza/react-go.git
cd react-go

# Install frontend dependencies
bun install   # or: npm install

# Run in development mode
bun run dev   # or: npm run dev

# Build for production
bun run build # or: npm run build`}</CodeBlock>
            <h3>Running the Go Backend</h3>
            <CodeBlock>{`# Download Go dependencies
go mod download

# Run the server
go run main.go

# Build binary
go build -o react-go main.go
./react-go`}</CodeBlock>
          </div>
        ),
      },
    ],
  },
  {
    id: "structure",
    label: "Project Structure",
    icon: RiStackLine,
    items: [
      {
        id: "folder-structure",
        title: "Folder Structure",
        content: (
          <div className="space-y-4">
            <p>The project follows a standard React + Go layout:</p>
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
        ),
      },
      {
        id: "tech-stack",
        title: "Tech Stack",
        content: (
          <div className="space-y-4">
            <table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Technology</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frontend</td>
                  <td>React 19 + Vite</td>
                  <td>UI framework with fast builder</td>
                </tr>
                <tr>
                  <td>Styling</td>
                  <td>TailwindCSS v4</td>
                  <td>Utility-first CSS</td>
                </tr>
                <tr>
                  <td>State</td>
                  <td>Zustand</td>
                  <td>Lightweight state management</td>
                </tr>
                <tr>
                  <td>Icons</td>
                  <td>react-icons</td>
                  <td>Icon library</td>
                </tr>
                <tr>
                  <td>HTTP</td>
                  <td>Axios</td>
                  <td>API client</td>
                </tr>
                <tr>
                  <td>Backend</td>
                  <td>Go</td>
                  <td>API server with embedded frontend</td>
                </tr>
                <tr>
                  <td>Routing</td>
                  <td>React Router v7</td>
                  <td>Client-side routing</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
    ],
  },
  {
    id: "customization",
    label: "Customization",
    icon: RiSettings3Line,
    items: [
      {
        id: "theming",
        title: "Theming",
        content: (
          <div className="space-y-4">
            <p>
              Themes are defined in <code>src/index.css</code> using CSS custom
              properties. The project supports both dark and light modes.
            </p>
            <h3>Color Variables</h3>
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
              The theme toggle is managed by{" "}
              <code>src/stores/themeStore.ts</code> and persisted via Zustand's{" "}
              <code>persist</code> middleware.
            </p>
          </div>
        ),
      },
      {
        id: "adding-pages",
        title: "Adding Pages",
        content: (
          <div className="space-y-4">
            <p>To add a new authenticated page:</p>
            <h3>1. Create the Page Component</h3>
            <CodeBlock>{`// src/pages/app/MyPage.tsx
export default function MyPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          My Page
        </h2>
        <p className="text-sm text-dark-300 mt-1">
          Description here
        </p>
      </div>
      {/* Your content */}
    </div>
  );
}`}</CodeBlock>
            <h3>2. Add the Route</h3>
            <CodeBlock>{`// src/main.tsx — add inside the "app" children array
{
  path: "my-page",
  element: <MyPage />,
}`}</CodeBlock>
            <h3>3. Add to Sidebar Navigation</h3>
            <CodeBlock>{`// src/layouts/AppLayout.tsx — add to navItems
{
  label: "My Page",
  path: "/app/my-page",
  icon: RiPageLine,
}`}</CodeBlock>
          </div>
        ),
      },
    ],
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-dark-900/80 border border-dark-600/40 rounded-xl p-4 overflow-x-auto text-xs font-mono text-neon-green leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DocPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeItem, setActiveItem] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSection = sections.find((s) => s.id === activeSection);
  const currentItem = currentSection?.items.find((i) => i.id === activeItem);

  const handleNav = (sectionId: string, itemId: string) => {
    setActiveSection(sectionId);
    setActiveItem(itemId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-foreground flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 w-72 bg-dark-800 border-r border-dark-600/50 flex flex-col overflow-y-auto
          transition-transform duration-300
          lg:relative lg:translate-x-0 lg:flex
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-dark-600/50 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center shrink-0">
            <RiBookOpenLine className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Docs</p>
            <p className="text-[10px] text-dark-400 font-mono">Base Project</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-dark-400 hover:text-foreground"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = activeSection === section.id;
            return (
              <div key={section.id}>
                <button
                  onClick={() => handleNav(section.id, section.items[0].id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isExpanded
                      ? "text-accent-400 bg-accent-500/10"
                      : "text-dark-300 hover:text-foreground hover:bg-dark-700/50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{section.label}</span>
                  <RiArrowRightSLine
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                {isExpanded && section.items.length > 1 && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(section.id, item.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                          activeItem === item.id
                            ? "text-accent-400 bg-accent-500/10 font-semibold"
                            : "text-dark-400 hover:text-foreground"
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-600/50 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-dark-400 hover:text-foreground transition-colors font-mono"
          >
            ← Back to Home
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-dark-800/60 border-b border-dark-600/50 flex items-center px-5 gap-3 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-dark-400 hover:text-foreground"
          >
            <RiMenuLine className="w-5 h-5" />
          </button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm font-mono text-dark-400">
            <span className="text-accent-400">Docs</span>
            {currentSection && (
              <>
                <span>/</span>
                <span className="text-dark-300">{currentSection.label}</span>
              </>
            )}
            {currentItem && currentItem.title !== currentSection?.label && (
              <>
                <span>/</span>
                <span className="text-foreground">{currentItem.title}</span>
              </>
            )}
          </div>
        </header>

        {/* Article */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 prose-doc">
          {currentItem ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {currentItem.title}
              </h1>
              <div className="w-12 h-1 bg-accent-500 rounded-full mb-8" />
              <div className="doc-content">{currentItem.content}</div>
            </>
          ) : (
            <p className="text-dark-400">Select a topic from the sidebar.</p>
          )}
        </main>
      </div>

      {/* Inline styles for doc content */}
      <style>{`
        .doc-content h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-foreground, #f1f5f9);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .doc-content p {
          color: rgb(148 163 184);
          line-height: 1.75;
          margin-bottom: 0.75rem;
        }
        .doc-content ul {
          list-style: disc;
          padding-left: 1.5rem;
          color: rgb(148 163 184);
          space-y: 0.25rem;
          margin-bottom: 0.75rem;
        }
        .doc-content li {
          margin-bottom: 0.35rem;
          line-height: 1.65;
        }
        .doc-content strong {
          color: rgb(226 232 240);
        }
        .doc-content code {
          background: rgba(99,102,241,0.12);
          color: rgb(129,140,248);
          padding: 0.1rem 0.4rem;
          border-radius: 0.3rem;
          font-size: 0.8rem;
          font-family: monospace;
        }
        .doc-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
          font-size: 0.85rem;
        }
        .doc-content th {
          text-align: left;
          padding: 0.5rem 0.75rem;
          background: rgba(51,65,85,0.5);
          color: rgb(148 163 184);
          font-weight: 600;
          border: 1px solid rgba(71,85,105,0.4);
        }
        .doc-content td {
          padding: 0.45rem 0.75rem;
          border: 1px solid rgba(71,85,105,0.3);
          color: rgb(148 163 184);
          vertical-align: top;
        }
        .doc-content td code {
          background: rgba(99,102,241,0.1);
          color: rgb(129,140,248);
        }
        .doc-content em {
          color: rgb(167,139,250);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
