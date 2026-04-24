import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { HiOutlineCode } from "react-icons/hi";
import { RiTranslate2 } from "react-icons/ri";
import { useLanguageStore } from "@/stores/languageStore";
import version from "@/version";
import AppIconSvg from "@/assets/react_go.svg";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { languageCode, toggleLanguage, language } = useLanguageStore();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-dark-900 text-foreground flex flex-col">
      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 20
            ? "bg-dark-800/90 backdrop-blur-xl border-b border-dark-600/30 shadow-lg shadow-black/10"
            : isLandingPage
              ? "bg-transparent"
              : "bg-dark-800/60 border-b border-dark-600/30"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={AppIconSvg} alt="App" className="w-10 h-10" />
            <span className="font-bold text-foreground tracking-tight">
              React-Go
            </span>
            <span className="text-[10px] font-mono text-dark-400 ml-1">
              v{version}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/jefripunza/react-go"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-dark-300 hover:text-foreground transition-colors"
            >
              <HiOutlineCode size={14} />
              GitHub
            </a>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-dark-300 hover:text-foreground hover:bg-dark-700/50 rounded-lg transition-all"
              title={language({
                id: "Ganti bahasa",
                en: "Switch language",
              })}
            >
              <RiTranslate2 className="w-3.5 h-3.5" />
              <span className="uppercase">{languageCode}</span>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold bg-accent-500 hover:bg-accent-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]"
            >
              {language({ id: "Masuk", en: "Login" })}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Content ────────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-dark-600/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={AppIconSvg} alt="App" className="w-8 h-8" />
            <span className="text-xs font-mono text-dark-400">
              React-Go v{version}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-dark-400">
            <a
              href="https://github.com/jefripunza"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-400 transition-colors"
            >
              @jefripunza
            </a>
            <span className="text-dark-600">·</span>
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
