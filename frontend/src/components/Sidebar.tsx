"use client";
import { BrainCircuit, MessageSquare, Play, FolderClock, SettingsIcon, LogOut, HelpCircle, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const { t, username, creditsLeft, logout, setIsSettingsOpen, setActiveChatId, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  const handleNewChat = () => { setActiveChatId(null); router.push("/chat"); if (window.innerWidth < 768) setIsSidebarOpen(false); };

  return (
    <>
      {/* Mobil qurilmalarda Sidebar ochiq bo'lsa, qora fon */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed md:relative z-50 h-full flex flex-col shrink-0 p-4 font-sans bg-white border-r border-gray-100 shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-all duration-300 ${isSidebarOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0 md:w-[88px]"}`}>
        
        {/* 🌟 YANGI TUGMA: Sidebar chizig'i ustida turadigan chiroyli dumaloq tugma */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute -right-3.5 top-10 w-7 h-7 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-violet-600 hover:border-violet-300 shadow-sm transition-all z-50 focus:outline-none"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4 mr-0.5" /> : <ChevronRight className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Logo qismi */}
        <div className={`flex items-center ${isSidebarOpen ? 'justify-start gap-3 pl-2' : 'justify-center'} mb-8 mt-2 shrink-0 overflow-hidden`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-violet-600 bg-violet-50 shrink-0 border border-violet-100/50">
            <BrainCircuit className="w-5 h-5" />
          </div>
          {isSidebarOpen && <span className="text-[20px] font-bold text-gray-900 tracking-tight whitespace-nowrap">AiEducation</span>}
        </div>

        {/* Asosiy tugma */}
        <button onClick={handleNewChat} className={`w-full rounded-[14px] ${isSidebarOpen ? 'py-3.5 px-4 justify-center gap-2' : 'py-3.5 px-0 justify-center'} font-medium mb-6 flex items-center bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-colors`}>
          {isSidebarOpen ? (
            <>
              <Plus className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap">{t("new_problem") || "Yangi Masala Yechish"}</span>
            </>
          ) : (
            <span className="text-xl">+</span>
          )}
        </button>
        
        {/* Menyular */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <Link onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }} href="/chat" className={`flex items-center ${isSidebarOpen ? 'px-4 gap-3' : 'justify-center px-0'} py-3 rounded-xl font-medium transition-colors ${pathname === "/chat" ? "bg-violet-50 text-violet-700 border border-violet-100" : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"}`}>
            <MessageSquare className="w-5 h-5 shrink-0" /> 
            {isSidebarOpen && <span className="whitespace-nowrap">{t("solve_problem") || "Masala Yechish"}</span>}
          </Link>
          <Link onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }} href="/video-history" className={`flex items-center ${isSidebarOpen ? 'px-4 gap-3' : 'justify-center px-0'} py-3 rounded-xl font-medium transition-colors ${pathname === "/video-history" ? "bg-violet-50 text-violet-700 border border-violet-100" : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"}`}>
            <Play className="w-5 h-5 shrink-0" /> 
            {isSidebarOpen && <span className="whitespace-nowrap">{t("video_history") || "Video Darslar"}</span>}
          </Link>
          <Link onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }} href="/video-create" className={`flex items-center ${isSidebarOpen ? 'px-4 gap-3' : 'justify-center px-0'} py-3 rounded-xl font-medium transition-colors ${pathname === "/video-create" ? "bg-violet-50 text-violet-700 border border-violet-100" : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"}`}>
            <Play className="w-5 h-5 shrink-0" /> 
            {isSidebarOpen && <span className="whitespace-nowrap">{t("video_create") || "Video Yaratish"}</span>}
          </Link>
          <Link onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }} href="/history" className={`flex items-center ${isSidebarOpen ? 'px-4 gap-3' : 'justify-center px-0'} py-3 rounded-xl font-medium transition-colors ${pathname === "/history" ? "bg-violet-50 text-violet-700 border border-violet-100" : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"}`}>
            <FolderClock className="w-5 h-5 shrink-0" /> 
            {isSidebarOpen && <span className="whitespace-nowrap">{t("text_history") || "Chatlar Tarixi"}</span>}
          </Link>
        </nav>

        {/* Profil va Chiqish */}
        <div className="mt-auto pt-4 shrink-0 border-t border-gray-100">
          <div className={`p-3 rounded-2xl flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'} mb-2 bg-white border border-gray-200`}>
            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-lg bg-gray-100 text-gray-600 border border-gray-200">
              {username ? username[0].toUpperCase() : 'A'}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-[13px] font-semibold truncate text-gray-800">{username || "user@example.com"}</p>
                <div className="flex justify-between items-center mt-0.5 gap-2">
                  <span className="text-[11px] font-bold text-green-500 tracking-wide">PREMIUM</span>
                  <span className="text-[11px] font-bold text-amber-500">{creditsLeft} cr</span>
                </div>
              </div>
            )}
          </div>
          {isSidebarOpen ? (
            <div className="flex justify-between px-2 pt-2">
              <button onClick={logout} className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
              <button className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <HelpCircle className="w-4 h-4" /> Help
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-center pt-2">
              <button onClick={logout} className="text-gray-500 hover:text-gray-900 transition-colors" title="Log Out"><LogOut className="w-5 h-5" /></button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
