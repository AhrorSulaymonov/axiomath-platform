"use client";
import { BrainCircuit, MessageSquare, Video, Sparkles, FolderClock, LogOut, Settings, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/chat", icon: MessageSquare, labelKey: "solve_problem", fallback: "Masala Yechish" },
  { href: "/video-create", icon: Sparkles, labelKey: "video_create", fallback: "Video Yaratish" },
  { href: "/video-history", icon: Video, labelKey: "video_history", fallback: "Video Darslar" },
  { href: "/history", icon: FolderClock, labelKey: "text_history", fallback: "Chatlar Tarixi" },
];

export default function Sidebar() {
  const { t, username, creditsLeft, planType, logout, setIsSettingsOpen, setActiveChatId, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  const handleNewChat = () => {
    setActiveChatId(null);
    router.push("/chat");
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 h-full flex flex-col shrink-0
          transition-all duration-300 ease-in-out
          ${isSidebarOpen
            ? "translate-x-0 w-[260px]"
            : "-translate-x-full md:translate-x-0 md:w-[80px]"
          }
        `}
        style={{
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute -right-3 top-9 w-6 h-6 items-center justify-center rounded-full z-50 transition-all duration-200"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-tertiary)",
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-tertiary)";
          }}
        >
          {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        <div className="flex flex-col h-full px-3 py-4 overflow-hidden">
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center'} mb-6 mt-1 shrink-0`}>
            <img src="/logo.png" alt="AxioMath Logo" className="w-8 h-8 object-contain shrink-0" />
            {isSidebarOpen && (
              <span className="text-sm font-semibold tracking-tight whitespace-nowrap" style={{ color: "var(--text)" }}>
                AxioMath
              </span>
            )}
          </div>

          <button
            onClick={handleNewChat}
            className={`
              w-full font-medium mb-6 flex items-center transition-all duration-200
              ${isSidebarOpen ? 'py-2.5 px-4 gap-2 justify-center' : 'py-2.5 justify-center'}
            `}
            style={{
              background: "var(--primary)",
              color: "#FAFAFA",
              borderRadius: "var(--radius-lg, 12px)",
              fontSize: "14px"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary)"; }}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap">{t("new_problem") || "Yangi Masala"}</span>}
          </button>

          {isSidebarOpen && (
            <div 
              className="px-3 mb-2" 
              style={{ 
                fontSize: "11px", 
                fontWeight: 500, 
                textTransform: "uppercase", 
                letterSpacing: "0.05em",
                color: "var(--text-tertiary)" 
              }}
            >
              {t("dashboard") || "Menu"}
            </div>
          )}
          
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={`
                    flex items-center transition-all duration-200
                    ${isSidebarOpen ? 'px-3 py-2 gap-3' : 'justify-center py-2.5'}
                  `}
                  style={{
                    background: isActive ? "var(--primary-muted)" : "transparent",
                    color: isActive ? "var(--primary-text)" : "var(--text-secondary)",
                    fontWeight: isActive ? 500 : 400,
                    borderRadius: "var(--radius-lg, 12px)",
                    fontSize: "14px"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--bg-hover)";
                      e.currentTarget.style.color = "var(--text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {isSidebarOpen && (
                    <span className="whitespace-nowrap">{t(item.labelKey) || item.fallback}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 shrink-0">
            <div
              className={`p-2 rounded-xl flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} mb-2`}
              style={{ 
                background: "transparent",
                border: "1px solid var(--border)"
              }}
            >
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                  color: "#FFFFFF",
                }}
              >
                {username ? username[0].toUpperCase() : 'A'}
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                    {username || "user@example.com"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                      style={{
                        background: planType === "PREMIUM" ? "var(--primary-muted)" : "var(--bg-hover)",
                        color: planType === "PREMIUM" ? "var(--primary-text)" : "var(--text-secondary)",
                      }}
                    >
                      {planType || "FREE"}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--warning)" }}>
                      {creditsLeft} cr
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isSidebarOpen ? (
              <div className="flex flex-col gap-1 mt-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg w-full"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Settings className="w-[18px] h-[18px]" /> {t("settings") || "Sozlamalar"}
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg w-full"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error-text)"; e.currentTarget.style.background = "var(--error-muted)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <LogOut className="w-[18px] h-[18px]" /> {t("logout") || "Chiqish"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center mt-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="transition-colors p-2 rounded-lg"
                  title={t("settings") || "Sozlamalar"}
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <Settings className="w-[18px] h-[18px]" />
                </button>
                <button
                  onClick={logout}
                  className="transition-colors p-2 rounded-lg"
                  title={t("logout") || "Chiqish"}
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error-text)"; e.currentTarget.style.background = "var(--error-muted)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
