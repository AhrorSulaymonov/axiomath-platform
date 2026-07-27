"use client";
import Sidebar from "./Sidebar";
import { useAppContext } from "../context/AppContext";
import { usePathname } from "next/navigation";
import { BrainCircuit, SettingsIcon, Globe, Menu, Sun, Moon } from "lucide-react";

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
    <div className="flex h-screen overflow-hidden font-sans bg-[#f9fafb]">
      {/* Chap paneldagi Sidebar */}
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        
        {/* Yuqoridagi o'ng tomondagi Til tanlagich (Globus) va Mavzu (Quyosh/Oy) */}
        <div className="absolute top-6 right-8 z-50 hidden md:flex items-center gap-4 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 dark-invert-ignore">
          
          <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-colors">
            {appTheme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="w-px h-5 bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as "uz" | "ru" | "en")}
            className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 cursor-pointer uppercase"
          >
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          </div>
        </div>

        {/* Mobil telefonlar uchun tepa qism */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg"><Menu className="w-6 h-6" /></button>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-violet-600" />
              <span className="font-bold text-lg text-gray-900">AiEducation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
              {appTheme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>
        
        {/* Asosiy Content Area */}
        <div className="flex-1 overflow-y-auto relative w-full flex flex-col pl-4 pr-4 md:pl-8 md:pr-8 lg:pl-12 lg:pr-12 pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
