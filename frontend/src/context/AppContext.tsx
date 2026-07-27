"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { translations } from "../app/i18n";
import { useRouter, usePathname } from "next/navigation";

const API_BASE = "http://localhost:8000/api";

type ChatMessage = { role: 'user' | 'assistant'; content: string; yt_videos?: any[]; image?: string; };
type ChatSession = { id: string; title: string; messages: ChatMessage[]; timestamp: string; };

interface AppContextType {
  lang: "uz" | "ru" | "en";
  setLang: (l: "uz" | "ru" | "en") => void;
  t: (key: string) => string;
  isLoggedIn: boolean;
  username: string;
  planType: string;
  creditsLeft: number;
  settings: any;
  setSettings: any;
  updateSettings: (newSettings: any) => Promise<void>;
  appTheme: "dark" | "light";
  setAppTheme: (t: "dark" | "light") => void;
  chatSessions: ChatSession[];
  setChatSessions: any;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  history: any[];
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  logout: () => void;
  fetchUserInfo: (user: string) => void;
  fetchHistory: (user: string) => void;
  login: (user: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<"uz" | "ru" | "en">("uz");
  const t = (key: string) => translations[lang][key] || key;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Foydalanuvchi");
  const [planType, setPlanType] = useState("FREE");
  const [creditsLeft, setCreditsLeft] = useState(3);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const [settings, setSettings] = useState({
    use_bynara: true, bynara_key: "", bynara_base_url: "https://router.bynara.id/v1",
    bynara_model: "agnes-2.0-flash", resolution: "Vertical (Shorts/Reels 9:16)",
    voice_type: "Erkak", watermark_enabled: true, bg_music: "none", theme_style: "light", video_lang: "auto"
  });
  const [appTheme, setAppTheme] = useState<"dark" | "light">("light");

  useEffect(() => { document.documentElement.setAttribute("data-theme", appTheme); }, [appTheme]);
  useEffect(() => { if (settings.theme_style === "light" || settings.theme_style === "dark") setAppTheme(settings.theme_style as "dark" | "light"); }, [settings.theme_style]);

  useEffect(() => {
    const savedUser = localStorage.getItem("edu_username");
    if (savedUser) {
      setUsername(savedUser);
      setIsLoggedIn(true);
      fetchUserInfo(savedUser);
      fetchHistory(savedUser);
    } else {
      if (pathname !== "/auth") router.push("/auth");
    }
    const savedChats = localStorage.getItem("edu_chats");
    if (savedChats) setChatSessions(JSON.parse(savedChats));
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  useEffect(() => { if (chatSessions.length > 0) localStorage.setItem("edu_chats", JSON.stringify(chatSessions)); }, [chatSessions]);

  const fetchUserInfo = async (user: string) => {
    try {
      const res = await axios.get(`${API_BASE}/users/${user}/info`);
      if (res.data) {
        setPlanType(res.data.plan_type); setCreditsLeft(res.data.credits_left);
        if (res.data.settings) setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (e) {}
  };

  const fetchHistory = async (user: string) => {
    try {
      const res = await axios.get(`${API_BASE}/users/${user}/history`);
      if (res.data) setHistory(res.data.reverse());
    } catch (e) {}
  };

  const updateSettings = async (newSettings: any) => {
    setSettings(newSettings);
    if (isLoggedIn && username) {
      try {
        await axios.put(`${API_BASE}/users/${username}/settings`, newSettings);
      } catch (e) {
        console.error("Failed to save settings to DB", e);
      }
    }
  };

  const login = (user: string) => {
    localStorage.setItem("edu_username", user);
    setUsername(user);
    setIsLoggedIn(true);
    fetchUserInfo(user);
    fetchHistory(user);
    router.push("/chat");
  };

  const logout = () => {
    localStorage.removeItem("edu_username");
    setIsLoggedIn(false);
    setUsername("");
    router.push("/auth");
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, isLoggedIn, username, planType, creditsLeft, settings, setSettings, updateSettings, appTheme, setAppTheme, chatSessions, setChatSessions, activeChatId, setActiveChatId, history, isSettingsOpen, setIsSettingsOpen, isSidebarOpen, setIsSidebarOpen, logout, fetchUserInfo, fetchHistory, login }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
