"use client";
import Sidebar from "./Sidebar";
import { useAppContext } from "../context/AppContext";
import { usePathname } from "next/navigation";
import { BrainCircuit, Globe, Menu, Sun, Moon } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, lang, setLang, setIsSidebarOpen, settings, updateSettings, appTheme, setAppTheme } = useAppContext();
  const pathname = usePathname();

  const toggleTheme = () => {
    const newTheme = appTheme === "light" ? "dark" : "light";
    updateSettings({ ...settings, theme_style: newTheme });
    setAppTheme(newTheme);
  };

  if (!isLoggedIn && pathname !== "/auth") return null;
  if (pathname === "/auth") return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 flex flex-col relative h-full min-w-0">

        {/* Desktop: Top-right controls */}
        <div
          className="absolute top-4 right-6 z-50 hidden md:flex items-center gap-1 px-1.5 py-1"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg, 12px)"
          }}
        >
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
          >
            {appTheme === "light" ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          </button>

          <div className="w-px h-4 mx-1" style={{ background: "var(--border)" }}></div>

          <div className="flex items-center gap-1.5 px-2">
            <Globe className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "uz" | "ru" | "en")}
              className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer uppercase appearance-none"
              style={{ color: "var(--text-secondary)" }}
            >
              <option value="uz">UZ</option>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>

        {/* Mobile Header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="AxioMath Logo" className="w-7 h-7 object-contain" />
              <span className="font-semibold text-[15px]" style={{ color: "var(--text)" }}>AxioMath</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-tertiary)" }}
            >
              {appTheme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "uz" | "ru" | "en")}
              className="bg-transparent border-none outline-none text-xs font-medium uppercase px-1 appearance-none"
              style={{ color: "var(--text-secondary)" }}
            >
              <option value="uz">UZ</option>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative w-full flex flex-col px-4 md:px-8 lg:px-12 pt-4 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
