"use client";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, CheckCircle2, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" 
  ? "http://localhost:8000/api" 
  : "https://api.axiomath.tech/api";

export default function SettingsModal() {
  const { t, settings, setSettings, isSettingsOpen, setIsSettingsOpen, username } = useAppContext();
  const [settingsSaved, setSettingsSaved] = useState(false);

  const saveSettings = async () => {
    try {
      await axios.put(`${API_BASE}/users/${username}/settings`, settings);
      setSettingsSaved(true); 
      setTimeout(() => { setSettingsSaved(false); setIsSettingsOpen(false); }, 1500);
    } catch (error) {}
  };

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-[var(--text)]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => setIsSettingsOpen(false)}></motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md rounded-xl overflow-hidden relative z-10 shadow-xl flex flex-col bg-[var(--bg-card)] border border-[var(--border)]">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-[var(--text)]"><SettingsIcon className="w-4 h-4 text-[var(--primary)]" /> {t("settings")}</h2>
            <button onClick={() => setIsSettingsOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"><X className="w-4 h-4" /></button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">🔊 {t("voice_settings")}</label>
              <select value={settings.voice_type ?? "Erkak"} onChange={e => setSettings({...settings, voice_type: e.target.value})} className="w-full rounded-lg px-4 py-2.5 text-sm outline-none bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-glow)]">
                <option value="Erkak">Erkak ovozi</option>
                <option value="Ayol">Ayol ovozi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">🌐 {t("video_language")}</label>
              <select value={settings.video_lang ?? "auto"} onChange={e => setSettings({...settings, video_lang: e.target.value})} className="w-full rounded-lg px-4 py-2.5 text-sm outline-none bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-glow)]">
                <option value="auto">Auto (masala tiliga mos)</option>
                <option value="uz">O'zbek tili</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">📱 {t("video_format")}</label>
              <select value={settings.resolution ?? "Vertical (Shorts/Reels 9:16)"} onChange={e => setSettings({...settings, resolution: e.target.value})} className="w-full rounded-lg px-4 py-2.5 text-sm outline-none bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-glow)]">
                <option value="Vertical (Shorts/Reels 9:16)">Vertical (9:16) - Instagram, TikTok</option>
                <option value="Landscape (YouTube 16:9)">Landscape (16:9) - YouTube</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">🎨 Ilova mavzusi</label>
              <div className="flex gap-3">
                <button onClick={() => setSettings({...settings, theme_style: "dark"})} className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2 border transition-all ${settings.theme_style === 'dark' || !settings.theme_style ? 'bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--text)]' : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>🌙 Qora mavzu</button>
                <button onClick={() => setSettings({...settings, theme_style: "light"})} className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex justify-center items-center gap-2 border transition-all ${settings.theme_style === 'light' ? 'bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--text)]' : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>☀️ Oq mavzu</button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
            <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2.5 text-sm font-medium rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] border border-transparent hover:border-[var(--border)] transition-colors">Bekor qilish</button>
            <button onClick={saveSettings} className="px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all flex items-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
              {settingsSaved && <CheckCircle2 className="w-4 h-4 mr-2" />}
              {settingsSaved ? "Saqlandi" : "Saqlash"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
