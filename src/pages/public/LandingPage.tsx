import { Link, useNavigate } from "react-router";
import {
  HiOutlineCode,
  HiOutlineLightningBolt,
  HiOutlineTemplate,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineColorSwatch,
  HiOutlineGlobe,
  HiOutlineDatabase,
} from "react-icons/hi";
import { useLanguageStore } from "@/stores/languageStore";

const features = [
  {
    icon: HiOutlineLightningBolt,
    title: { id: "Sangat Cepat", en: "Blazing Fast" },
    desc: {
      id: "React 19 + Vite untuk HMR instan, Go backend untuk performa terbaik.",
      en: "React 19 + Vite for instant HMR, Go compiled backend for peak performance.",
    },
    color: "text-neon-green",
    bg: "bg-neon-green/10 border-neon-green/20",
  },
  {
    icon: HiOutlineTemplate,
    title: { id: "Layout Siap Pakai", en: "App Layout Ready" },
    desc: {
      id: "Sidebar, top bar, navigasi responsif, dan mode gelap/terang bawaan.",
      en: "Sidebar, top bar, responsive navigation, and dark/light mode built-in.",
    },
    color: "text-accent-400",
    bg: "bg-accent-500/10 border-accent-500/20",
  },
  {
    icon: HiOutlineShieldCheck,
    title: { id: "Auth & Peran", en: "Auth & Roles" },
    desc: {
      id: "Autentikasi JWT dengan kontrol akses berbasis peran langsung dari kotak.",
      en: "JWT authentication with role-based access control out of the box.",
    },
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10 border-neon-cyan/20",
  },
  {
    icon: HiOutlineColorSwatch,
    title: { id: "Sistem Tema", en: "Theme System" },
    desc: {
      id: "CSS custom properties dengan TailwindCSS v4. Mode gelap dan terang didukung.",
      en: "CSS custom properties with TailwindCSS v4. Dark and light modes supported.",
    },
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10 border-neon-yellow/20",
  },
  {
    icon: HiOutlineGlobe,
    title: { id: "Multi-Bahasa", en: "Multi-Language" },
    desc: {
      id: "Store i18n bawaan dengan toggle. Tambah bahasa baru dalam hitungan menit.",
      en: "Built-in i18n store with toggle. Add new languages in minutes.",
    },
    color: "text-accent-400",
    bg: "bg-accent-500/10 border-accent-500/20",
  },
  {
    icon: HiOutlineDatabase,
    title: { id: "Database Siap", en: "Database Ready" },
    desc: {
      id: "GORM + SQLite (atau PostgreSQL/MySQL). Auto-migrasi saat startup.",
      en: "GORM + SQLite (or PostgreSQL/MySQL). Auto-migration on startup.",
    },
    color: "text-neon-green",
    bg: "bg-neon-green/10 border-neon-green/20",
  },
];

const techStack = [
  { label: "React 19", color: "text-neon-cyan" },
  { label: "Vite", color: "text-neon-yellow" },
  { label: "TailwindCSS v4", color: "text-accent-400" },
  { label: "Go / Fiber", color: "text-neon-green" },
  { label: "Zustand", color: "text-neon-cyan" },
  { label: "GORM", color: "text-neon-yellow" },
  { label: "Socket.IO", color: "text-accent-400" },
  { label: "Docker", color: "text-neon-green" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();

  return (
    <>
      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded-full mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-glow" />
            <span className="text-xs font-mono text-accent-400">
              {language({
                id: "Template Starter Open Source",
                en: "Open Source Starter Template",
              })}
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {language({
              id: "Bangun Aplikasi Full-Stack",
              en: "Build Full-Stack Apps",
            })}
            <br />
            <span className="bg-linear-to-r from-accent-400 via-neon-cyan to-accent-500 bg-clip-text text-transparent">
              React + Go
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 text-lg text-dark-300 max-w-2xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {language({
              id: "Clone proyek ini dan mulai coding. Sudah dikonfigurasi dengan autentikasi, dasbor admin, tema gelap/terang, multi-bahasa, dan pengaturan Docker siap produksi.",
              en: "Clone this project and start coding. Pre-configured with authentication, admin dashboard, dark/light theme, multi-language, and production-ready Docker setup.",
            })}
          </p>

          {/* CTA buttons */}
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              to="/app/dashboard"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-accent-500 hover:bg-accent-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]"
            >
              {language({ id: "Ke Dashboard", en: "Go to Dashboard" })}
              <HiOutlineArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/jefripunza/react-go"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold border border-dark-600/50 text-dark-300 hover:text-foreground hover:border-dark-500/60 rounded-xl transition-all duration-200"
            >
              <HiOutlineCode size={16} />
              {language({ id: "Lihat di GitHub", en: "View on GitHub" })}
            </a>
          </div>

          {/* Terminal preview */}
          <div
            className="mt-14 max-w-xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="bg-dark-800/80 border border-dark-600/40 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-600/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-neon-red/60" />
                  <div className="w-3 h-3 rounded-full bg-neon-yellow/60" />
                  <div className="w-3 h-3 rounded-full bg-neon-green/60" />
                </div>
                <span className="text-[10px] font-mono text-dark-400 ml-2">
                  terminal
                </span>
              </div>
              <pre className="px-5 py-4 text-xs font-mono text-dark-200 leading-relaxed overflow-x-auto">
                <span className="text-neon-green">$</span>{" "}
                <span className="text-dark-100">
                  git clone https://github.com/jefripunza/react-go.git
                </span>
                {"\n"}
                <span className="text-neon-green">$</span>{" "}
                <span className="text-dark-100">cd react-go</span>
                {"\n"}
                <span className="text-neon-green">$</span>{" "}
                <span className="text-dark-100">bun install</span>
                {"\n"}
                <span className="text-neon-green">$</span>{" "}
                <span className="text-dark-100">bun run dev</span>
                {"\n\n"}
                <span className="text-dark-400">
                  {"  "}VITE v6.x ready in 200ms
                </span>
                {"\n"}
                <span className="text-dark-400">{"  "}➜ Local: </span>
                <span className="text-accent-400">http://localhost:5173/</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─────────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-dark-600/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {techStack.map((tech) => (
              <span
                key={tech.label}
                className={`text-xs font-mono ${tech.color} opacity-70 hover:opacity-100 transition-opacity`}
              >
                {tech.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {language({
                id: "Semua yang Anda Butuhkan",
                en: "Everything You Need",
              })}
            </h2>
            <p className="mt-3 text-dark-300 max-w-lg mx-auto">
              {language({
                id: "Sudah dikonfigurasi dan siap produksi. Tinggal clone, kustomisasi, dan deploy.",
                en: "Pre-configured and production-ready. Just clone, customize, and deploy.",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={language(feat.title)}
                  className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 hover:border-dark-500/60 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${feat.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {language(feat.title)}
                  </h3>
                  <p className="text-xs text-dark-300 leading-relaxed">
                    {language(feat.desc)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Quick Start ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-dark-800/30 border-y border-dark-600/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {language({
                id: "Mulai dalam Hitungan Detik",
                en: "Get Started in Seconds",
              })}
            </h2>
            <p className="mt-3 text-dark-300">
              {language({
                id: "Tiga langkah menuju proyek baru Anda.",
                en: "Three steps to your new project.",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Clone",
                code: "git clone https://github.com/jefripunza/react-go.git",
              },
              {
                step: "02",
                title: "Install",
                code: "bun install && go mod download",
              },
              {
                step: "03",
                title: language({ id: "Jalankan", en: "Run" }),
                code: "bun run dev && go run main.go",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-dark-800/60 border border-dark-600/40 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl font-bold text-accent-500/30 font-mono mb-3">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <code className="block text-[11px] font-mono text-neon-green bg-dark-900/60 px-3 py-2 rounded-lg break-all">
                  {item.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-4">
            {language({ id: "Siap Membangun?", en: "Ready to Build?" })}
          </h2>
          <p className="text-dark-300 mb-8">
            {language({
              id: "Template ini open source dan gratis digunakan. Beri bintang di GitHub dan mulai kirim proyek berikutnya.",
              en: "This template is open source and free to use. Star it on GitHub and start shipping your next project.",
            })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app/dashboard"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-accent-500 hover:bg-accent-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25"
            >
              {language({ id: "Buka Dashboard", en: "Open Dashboard" })}
              <HiOutlineArrowRight size={16} />
            </Link>
            <button
              onClick={() =>
                window.open("/doc", "_blank", "noopener,noreferrer")
              }
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold border border-dark-600/50 text-dark-300 hover:text-foreground hover:border-dark-500/60 rounded-xl transition-all"
            >
              {language({ id: "Baca Dokumentasi", en: "Read Docs" })}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
