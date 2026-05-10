import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useLanguageStore } from "@/stores/languageStore";
import version from "@/version";
import AppIconSvg from "@/assets/react_go.svg";
import ControlButton from "@/components/ControlButton";
import { IconComponent } from "@/components/ui/IconSelector";
import { useAuthStore } from "@/stores/authStore";
import Image from "@/components/Image";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguageStore();
  const { isAuthenticated, user, validateToken, logout } = useAuthStore();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

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
              <IconComponent iconName="Hi/HiOutlineCode" size={14} />
              GitHub
            </a>

            <ControlButton />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-dark-600/50 ml-2">
                <button
                  onClick={() => navigate("/app/dashboard")}
                  className="flex items-center gap-3 group"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-foreground leading-tight group-hover:text-accent-400 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-dark-400 font-mono">
                      @{user.username}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center overflow-hidden group-hover:border-accent-500/40 transition-all">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IconComponent
                        iconName="Hi/HiOutlineUser"
                        className="w-5 h-5 text-accent-400"
                      />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => logout()}
                  className="p-2 text-dark-400 hover:text-neon-red hover:bg-neon-red/10 rounded-lg transition-all"
                  title={language({ id: "Keluar", en: "Logout" })}
                >
                  <IconComponent iconName="Hi/HiOutlineLogout" size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-semibold bg-accent-500 hover:bg-accent-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]"
              >
                {language({ id: "Masuk", en: "Login" })}
              </button>
            )}
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
            <Image src={AppIconSvg} alt="App" className="w-8 h-8" />
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
