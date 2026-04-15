import {
  Outlet,
  useNavigate,
  useLocation,
  type IndexRouteObject,
  Link,
} from "react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useThemeStore } from "@/stores/themeStore";
import {
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiSunLine,
  RiMoonLine,
  RiTranslate2,
} from "react-icons/ri";
import Loading from "@/components/Loading";
import version from "@/version";
import { no_auth_navigate } from "@/constant";
import type { LanguageCode } from "@/stores/languageStore";
import type { UserRole } from "@/types/user";
import { useLanguageStore } from "@/stores/languageStore";
import AppIconSvg from "@/assets/react-go.svg";

export interface ISidebarLink extends Partial<IndexRouteObject> {
  show_hr?: boolean;
  hr_title?: string;
  label: Record<LanguageCode, string>;
  roles: UserRole[];
  icon: React.ComponentType<{ size?: number }>;
  isHide?: boolean;
}

interface AppLayoutProps {
  sidebarLinks: ISidebarLink[];
}

export default function AppLayout({ sidebarLinks }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, languageCode, toggleLanguage } = useLanguageStore();

  const { isLoading, validateToken, logout } = useAuthStore();
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    setCollapsed,
    setMobileOpen,
  } = useSidebarStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await validateToken("app");
      if (!valid) {
        navigate(no_auth_navigate, { replace: true });
      }
    };
    checkAuth();
  }, [validateToken, navigate]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // lg
    const apply = () => {
      const nextIsDesktop = mq.matches;
      setIsDesktop(nextIsDesktop);
      if (!nextIsDesktop) {
        setCollapsed(false);
      }
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setCollapsed]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", "light");
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate(no_auth_navigate, { replace: true });
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const effectiveCollapsed = isDesktop ? isCollapsed : false;
  const sidebarWidth = effectiveCollapsed ? "w-[72px]" : "w-65";

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen overflow-hidden bg-dark-900 flex">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 bg-dark-800 border-r border-dark-600/50 flex flex-col transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isMobileOpen ? "translate-x-0 w-65" : "-translate-x-full lg:translate-x-0"}
          ${!isMobileOpen ? sidebarWidth : ""}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-dark-600/50 shrink-0">
          <div className="flex items-center w-full min-w-0">
            {/* Logo - hidden when collapsed */}
            {(!effectiveCollapsed || isMobileOpen) && (
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img src={AppIconSvg} alt="App" className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-foreground tracking-tight truncate">
                    Base Project
                  </h1>
                  <p className="text-[10px] text-dark-400 font-mono truncate">
                    {version}
                  </p>
                </div>
              </div>
            )}

            {/* Desktop collapse hamburger (RIGHT side) */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex text-dark-300 hover:text-foreground transition-colors shrink-0 ml-auto"
              title={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <RiMenuLine className="w-5 h-5" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto lg:hidden text-dark-300 hover:text-foreground transition-colors"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === `/app/${link.path}`;
            const Icon = link.icon;
            return (
              <Link
                key={`/app/${link.path}`}
                to={`/app/${link.path}`}
                onClick={() => {
                  if (window.innerWidth < 768)
                    handleNavClick(link.path as string);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-accent-500/15 text-accent-400 border border-accent-500/20"
                      : "text-dark-300 hover:text-foreground hover:bg-dark-700/50 border border-transparent"
                  }
                  ${effectiveCollapsed && !isMobileOpen ? "justify-center" : ""}
                `}
                title={effectiveCollapsed ? language(link.label) : undefined}
              >
                <Icon size={20} />
                {(!effectiveCollapsed || isMobileOpen) && (
                  <span className="truncate">{language(link.label)}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-dark-600/50 p-3 space-y-2 shrink-0">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-300 hover:text-neon-red hover:bg-neon-red/5 transition-all ${effectiveCollapsed && !isMobileOpen ? "justify-center" : ""}`}
            title={language({ id: "Keluar", en: "Sign out" })}
          >
            <RiLogoutBoxLine className="w-4.5 h-4.5 shrink-0" />
            {(!effectiveCollapsed || isMobileOpen) && (
              <span>{language({ id: "Keluar", en: "Sign Out" })}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top bar */}
        <header className="h-16 bg-dark-800/60 backdrop-blur-md border-b border-dark-600/50 flex items-center px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-dark-300 hover:text-foreground transition-colors mr-4"
          >
            <RiMenuLine className="w-5 h-5" />
          </button>

          {/* Page title from route */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
            <span className="text-sm font-mono text-dark-300">
              {location.pathname.replace("/app/", "")}
            </span>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-dark-300 hover:text-foreground hover:bg-dark-700/50 transition-all text-xs font-mono"
              title={language({
                id: "Ganti bahasa",
                en: "Switch language",
              })}
            >
              <RiTranslate2 className="w-3.5 h-3.5" />
              <span className="uppercase">{languageCode}</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-dark-300 hover:text-foreground hover:bg-dark-700/50 transition-all"
              title={
                isDarkMode
                  ? language({ id: "Mode terang", en: "Switch to light mode" })
                  : language({ id: "Mode gelap", en: "Switch to dark mode" })
              }
            >
              {isDarkMode ? (
                <RiSunLine className="w-4 h-4" />
              ) : (
                <RiMoonLine className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                window.open("/doc", "_blank", "noopener,noreferrer")
              }
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-700/50 rounded-lg border border-dark-600/30 text-xs font-mono text-dark-300 hover:text-foreground hover:bg-dark-700/70 transition-all"
              title={language({ id: "Buka Dokumen", en: "Open Docs" })}
            >
              {language({ id: "Dokumen", en: "Docs" })}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
