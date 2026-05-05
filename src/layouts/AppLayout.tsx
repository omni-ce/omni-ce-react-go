import {
  Outlet,
  useNavigate,
  useLocation,
  type IndexRouteObject,
  Link,
} from "react-router";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useRuleStore } from "@/stores/ruleStore";
import {
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiSettings4Line,
  RiFileTextLine,
  RiNotificationLine,
} from "react-icons/ri";
import Loading from "@/components/Loading";
import version from "@/version";
import { no_auth_navigate } from "@/constant";
import type { LanguageCode } from "@/stores/languageStore";
import { useLanguageStore } from "@/stores/languageStore";
import AppIconSvg from "@/assets/react_go.svg";
import ControlButton from "@/components/ControlButton";
import NotificationPopup from "@/components/NotificationPopup";
import { useNotificationStore } from "@/stores/notificationStore";
import { roleService } from "@/services/role.service";
import RoleStepper from "@/components/RoleStepper";
import { getSseClient } from "@/lib/sse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

export interface ISidebarLink extends Partial<IndexRouteObject> {
  show_hr?: boolean;
  hr_title?: string;
  label: Record<LanguageCode, string>;
  strict?: boolean;
  icon: React.ComponentType<{ size?: number }>;
  isHide?: boolean;
  extraRuleKeys?: {
    label: Record<LanguageCode, string>;
    ruleKey: string;
  }[];
}

interface AppLayoutProps {
  sidebarLinks: ISidebarLink[];
}

export default function AppLayout({ sidebarLinks }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguageStore();

  const { isLoading, validateToken, logout, user } = useAuthStore();
  const { role_selected, clearRoleSelected, setRoleSelected, rules, setRules } =
    useRuleStore();

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const canSwitchRole = useMemo(() => {
    if (!user) return false;
    if (user.role === "su") return true;
    if (user.roles && user.roles.length > 1) return true;
    return false;
  }, [user]);
  const displayRole = useMemo(() => {
    if (!user) return "";
    if (user.role === "su") return "Super Admin";
    if (user.role === "user" || user.role === "client") {
      if (role_selected) {
        const found = user.roles?.find(
          (r) => r.role_id === role_selected.role_id,
        );
        if (found) return found.role_name;
        if (user.roles && user.roles.length > 0) return user.roles[0].role_name;
        return "No Role";
      }
      return "No Role Selected";
    }
    return user.role;
  }, [user, role_selected]);
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    setCollapsed,
    setMobileOpen,
  } = useSidebarStore();

  const [isDesktop, setIsDesktop] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications, markAllRead: handleMarkAllRead } =
    useNotificationStore();
  const notifBtnRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const checkAuth = async () => {
      const { isValid, rules } = await validateToken();
      if (!isValid) {
        navigate(no_auth_navigate, { replace: true });
        return;
      }
      if (rules) {
        setRules(rules);
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateToken, navigate]);

  // Redirect non-su users without role selected or force update if selected role is missing
  useEffect(() => {
    if (!isLoading && user && user.role !== "su") {
      const roles = user.roles || [];
      if (roles.length === 0) {
        if (role_selected) setRoleSelected(null);
      } else {
        const found = role_selected
          ? roles.find((r) => r.role_id === role_selected.role_id)
          : undefined;
        if (!found) {
          setRoleSelected({
            division_id: roles[0].division_id,
            role_id: roles[0].role_id,
          });
        }
      }
    }
  }, [isLoading, user, role_selected, setRoleSelected]);

  // Listen for real-time rule updates via WebSocket
  useEffect(() => {
    if (!user || user.role === "su" || !role_selected) return;
    const handleUpdateRule = () => {
      roleService
        .getRules()
        .then((res) => {
          setRules(res.data.rows);
        })
        .catch(() => setRules([]));
    };
    const stream = getSseClient("/api/event/stream");
    stream.on("update-rule", handleUpdateRule);
    return () => {
      stream.off("update-rule", handleUpdateRule);
    };
  }, [user, role_selected, setRules]);

  // Listen for real-time user updates via WebSocket
  useEffect(() => {
    if (!user) return;
    const handleUpdateUser = () => {
      validateToken(true);
    };
    const stream = getSseClient("/api/event/stream");
    stream.on("update-user", handleUpdateUser);
    return () => {
      stream.off("update-user", handleUpdateUser);
    };
  }, [user, validateToken]);

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

  const handleLogout = () => {
    clearRoleSelected();
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

      {/* Select Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogContent className="max-w-md bg-dark-800/90 backdrop-blur-xl border-dark-600/50">
          <DialogHeader>
            <DialogTitle>
              {language({
                id: "Ganti Divisi & Jabatan",
                en: "Switch Division & Role",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RoleStepper
              initialDivisionId={role_selected?.division_id}
              initialRoleId={role_selected?.role_id}
              onComplete={(divId, rId) => {
                setRoleSelected({ division_id: divId, role_id: rId });
                setRoleDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

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
              <Link to={"/"}>
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
              </Link>
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
          {sidebarLinks
            .filter((link) => {
              // Always show non-strict links (e.g. Dashboard)
              if (!link.strict) return true;
              // SU sees everything
              if (user?.role === "su") return true;
              // For non-su, check if the selected role has "read" permission
              if (!role_selected) return false;
              const roleId = Number(role_selected.role_id);
              const hasRead = rules.some(
                (r) =>
                  r.role_id === roleId &&
                  r.key === link.path &&
                  r.action === "read" &&
                  r.state === true,
              );
              return hasRead;
            })
            .map((link) => {
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
        <div className="border-t border-dark-600/50 p-3 space-y-1 shrink-0">
          {/* User Info */}
          {(!effectiveCollapsed || isMobileOpen) && user && (
            <button
              onClick={() => {
                if (canSwitchRole && user.role !== "su")
                  setRoleDialogOpen(true);
              }}
              className={`w-full text-left px-3 py-2 mb-2 bg-dark-800/40 rounded-xl border border-dark-600/30 transition-colors ${
                canSwitchRole && user.role !== "su"
                  ? "hover:bg-dark-700/50 cursor-pointer hover:border-accent-500/30"
                  : "cursor-default"
              }`}
            >
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-dark-400 truncate mt-0.5">
                {displayRole}
              </p>
            </button>
          )}

          {/* Settings */}
          <Link
            to="/app/settings"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
              ${
                location.pathname === "/app/settings"
                  ? "bg-accent-500/15 text-accent-400 border border-accent-500/20"
                  : "text-dark-300 hover:text-foreground hover:bg-dark-700/50 border border-transparent"
              }
              ${effectiveCollapsed && !isMobileOpen ? "justify-center" : ""}
            `}
            title={language({ id: "Pengaturan", en: "Settings" })}
          >
            <RiSettings4Line className="w-4.5 h-4.5 shrink-0" />
            {(!effectiveCollapsed || isMobileOpen) && (
              <span>{language({ id: "Pengaturan", en: "Settings" })}</span>
            )}
          </Link>

          {/* Docs */}
          <button
            onClick={() => window.open("/doc", "_blank", "noopener,noreferrer")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-300 hover:text-foreground hover:bg-dark-700/50 transition-all border border-transparent ${effectiveCollapsed && !isMobileOpen ? "justify-center" : ""}`}
            title={language({ id: "Dokumen", en: "Documentation" })}
          >
            <RiFileTextLine className="w-4.5 h-4.5 shrink-0" />
            {(!effectiveCollapsed || isMobileOpen) && (
              <span>{language({ id: "Dokumen", en: "Documentation" })}</span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-300 hover:text-neon-red hover:bg-neon-red/5 transition-all border border-transparent ${effectiveCollapsed && !isMobileOpen ? "justify-center" : ""}`}
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
            <ControlButton />

            {/* Notification */}
            <div className="relative">
              <button
                ref={notifBtnRef}
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-dark-300 hover:text-foreground hover:bg-dark-700/50 transition-all"
                title={language({ id: "Notifikasi", en: "Notifications" })}
              >
                <RiNotificationLine className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 bg-neon-red text-white text-[9px] font-bold rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationPopup
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onMarkAllRead={handleMarkAllRead}
              />
            </div>
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
