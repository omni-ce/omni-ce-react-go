import { useState } from "react";
import { Link } from "react-router";

import { IconComponent } from "@/components/ui/IconSelector";

// Content
import Introduction from "@/pages/doc/Introduction";
import QuickStart from "@/pages/doc/QuickStart";
import ProjectStructure from "@/pages/doc/ProjectStructure";
import TechStack from "@/pages/doc/TechStack";
import Theming from "@/pages/doc/Theming";
import AddingPages from "@/pages/doc/AddingPages";

interface DocSection {
  id: string;
  label: string;
  icon: string;
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
    icon: "Ri/RiRocketLine",
    items: [
      {
        id: "introduction",
        title: "Introduction",
        content: <Introduction />,
      },
      {
        id: "quick-start",
        title: "Quick Start",
        content: <QuickStart />,
      },
    ],
  },
  {
    id: "structure",
    label: "Project Structure",
    icon: "Ri/RiStackLine",
    items: [
      {
        id: "folder-structure",
        title: "Folder Structure",
        content: <ProjectStructure />,
      },
      {
        id: "tech-stack",
        title: "Tech Stack",
        content: <TechStack />,
      },
    ],
  },
  {
    id: "customization",
    label: "Customization",
    icon: "Ri/RiSettings3Line",
    items: [
      {
        id: "theming",
        title: "Theming",
        content: <Theming />,
      },
      {
        id: "adding-pages",
        title: "Adding Pages",
        content: <AddingPages />,
      },
    ],
  },
];

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
          role="button"
          tabIndex={-1}
          onKeyDown={(e) => { if (e.key === 'Escape') setSidebarOpen(false); }}
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
            <IconComponent
              iconName="Ri/RiBookOpenLine"
              className="w-4 h-4 text-accent-400"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Docs</p>
            <p className="text-[10px] text-dark-400 font-mono">Base Project</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-dark-400 hover:text-foreground"
          >
            <IconComponent iconName="Ri/RiCloseLine" className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {sections.map((section) => {
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
                  <IconComponent
                    iconName={section.icon}
                    className="w-4 h-4 shrink-0"
                  />
                  <span className="flex-1 text-left">{section.label}</span>
                  <IconComponent
                    iconName="Ri/RiArrowRightSLine"
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
            <IconComponent iconName="Ri/RiMenuLine" className="w-5 h-5" />
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
