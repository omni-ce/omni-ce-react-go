import { useState, useMemo } from "react";
import { Link } from "react-router";

import { IconComponent } from "@/components/ui/IconSelector";
import ControlButton from "@/components/ControlButton";
import { useLanguageStore } from "@/stores/languageStore";

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
  content?: React.ReactNode;
  icon?: string;
  section?: DocSection[];
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DocPage() {
  const { language } = useLanguageStore();
  const [activeId, setActiveId] = useState("introduction");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections: DocSection[] = useMemo(
    () => [
      {
        id: "introduction",
        label: language({ id: "Pendahuluan", en: "Introduction" }),
        content: <Introduction />,
        icon: "Ri/RiInformationLine",
      },
      {
        id: "getting-started",
        label: language({ id: "Memulai", en: "Getting Started" }),
        icon: "Ri/RiRocketLine",
        section: [
          {
            id: "quick-start",
            label: language({ id: "Mulai Cepat", en: "Quick Start" }),
            content: <QuickStart />,
          },
        ],
      },
      {
        id: "structure",
        label: language({ id: "Struktur Proyek", en: "Project Structure" }),
        icon: "Ri/RiStackLine",
        section: [
          {
            id: "Struktur Folder",
            label: language({ id: "Struktur Folder", en: "Folder Structure" }),
            content: <ProjectStructure />,
          },
          {
            id: "tech-stack",
            label: language({ id: "Teknologi", en: "Tech Stack" }),
            content: <TechStack />,
          },
        ],
      },
      {
        id: "customization",
        label: language({ id: "Kustomisasi", en: "Customization" }),
        icon: "Ri/RiSettings3Line",
        section: [
          {
            id: "theming",
            label: language({ id: "Tema", en: "Theming" }),
            content: <Theming />,
          },
          {
            id: "adding-pages",
            label: language({ id: "Menambah Halaman", en: "Adding Pages" }),
            content: <AddingPages />,
          },
        ],
      },
    ],
    [language],
  );

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "getting-started",
    "structure",
    "customization",
  ]);

  // Flatten sections to find current, prev, and next items
  const flatItems = useMemo(() => {
    const flattened: DocSection[] = [];
    const traverse = (items: DocSection[]) => {
      items.forEach((item) => {
        if (item.content) {
          flattened.push(item);
        }
        if (item.section) {
          traverse(item.section);
        }
      });
    };
    traverse(sections);
    return flattened;
  }, [sections]);

  const currentIndex = flatItems.findIndex((item) => item.id === activeId);
  const currentItem = flatItems[currentIndex];
  const prevItem = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleNav = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const renderNavItems = (items: DocSection[], level = 0) => {
    return items.map((item) => {
      const isExpanded = expandedSections.includes(item.id);
      const isActive = activeId === item.id;
      const hasChildren = item.section && item.section.length > 0;

      return (
        <div key={item.id} className="space-y-0.5">
          <button
            onClick={() => {
              if (hasChildren) {
                toggleSection(item.id);
              }
              if (item.content) {
                handleNav(item.id);
              }
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
              isActive
                ? "text-accent-400 bg-accent-500/10 font-semibold"
                : "text-dark-300 hover:text-foreground hover:bg-dark-700/50"
            }`}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            {item.icon && (
              <IconComponent iconName={item.icon} className="w-4 h-4 shrink-0" />
            )}
            {!item.icon && level > 0 && (
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <div
                  className={`w-1 h-1 rounded-full ${isActive ? "bg-accent-400" : "bg-dark-500"}`}
                />
              </div>
            )}
            <span className="flex-1 text-left truncate">{item.label}</span>
            {hasChildren && (
              <IconComponent
                iconName="Ri/RiArrowRightSLine"
                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            )}
          </button>
          {hasChildren && isExpanded && (
            <div className="space-y-0.5">
              {renderNavItems(item.section!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-foreground flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 w-72 bg-dark-800 border-r border-dark-600/50 flex flex-col overflow-y-auto
          transition-transform duration-300
          lg:sticky lg:top-0 lg:translate-x-0 lg:flex
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
            <p className="text-sm font-bold text-foreground">
              {language({ id: "Dokumentasi", en: "Docs" })}
            </p>
            <p className="text-[10px] text-dark-400 font-mono">
              {language({ id: "Proyek Dasar", en: "Base Project" })}
            </p>
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
          {renderNavItems(sections)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-600/50 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-dark-400 hover:text-foreground transition-colors font-mono"
          >
            {language({ id: "← Kembali ke Beranda", en: "← Back to Home" })}
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
            <span className="text-accent-400">
              {language({ id: "Dokumentasi", en: "Docs" })}
            </span>
            {currentItem && (
              <>
                <span>/</span>
                <span className="text-foreground">{currentItem.label}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ControlButton />
          </div>
        </header>

        {/* Article */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 prose-doc">
          {currentItem ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {currentItem.label}
              </h1>
              <div className="w-12 h-1 bg-accent-500 rounded-full mb-8" />
              <div className="doc-content mb-12">{currentItem.content}</div>

              {/* Next / Back Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-dark-600/50 mt-12">
                {prevItem && (
                  <button
                    onClick={() => handleNav(prevItem.id)}
                    className="flex-1 group flex flex-col items-start gap-2 p-4 rounded-xl border border-dark-600/50 bg-dark-800/40 hover:bg-dark-700/50 hover:border-accent-500/30 transition-all text-left"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-dark-400 group-hover:text-accent-400 transition-colors">
                      {language({ id: "Sebelumnya", en: "Previous" })}
                    </span>
                    <span className="text-sm font-bold text-foreground group-hover:text-accent-400 transition-colors flex items-center gap-2">
                      <IconComponent
                        iconName="Ri/RiArrowLeftSLine"
                        className="w-4 h-4"
                      />
                      {prevItem.label}
                    </span>
                  </button>
                )}
                {!prevItem && <div className="flex-1" />}
                {nextItem && (
                  <button
                    onClick={() => handleNav(nextItem.id)}
                    className="flex-1 group flex flex-col items-end gap-2 p-4 rounded-xl border border-dark-600/50 bg-dark-800/40 hover:bg-dark-700/50 hover:border-accent-500/30 transition-all text-right"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-dark-400 group-hover:text-accent-400 transition-colors">
                      {language({ id: "Selanjutnya", en: "Next" })}
                    </span>
                    <span className="text-sm font-bold text-foreground group-hover:text-accent-400 transition-colors flex items-center gap-2">
                      {nextItem.label}
                      <IconComponent
                        iconName="Ri/RiArrowRightSLine"
                        className="w-4 h-4"
                      />
                    </span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-dark-400">
              {language({
                id: "Pilih topik dari sidebar.",
                en: "Select a topic from the sidebar.",
              })}
            </p>
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
