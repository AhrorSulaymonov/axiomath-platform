"use client";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, CheckCircle2 } from "lucide-react";
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={() => setIsSettingsOpen(false)}></motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md rounded-2xl overflow-hidden relative z-10 shadow-2xl flex flex-col bg-white border border-gray-100">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800"><SettingsIcon className="w-5 h-5 text-violet-600" /> {t("settings")}</h2>
            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
          </div>
          
          {/* Body */}
          <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">🔊 {t("voice_settings")}</label>
              <select value={settings.voice_type ?? "Erkak"} onChange={e => setSettings({...settings, voice_type: e.target.value})} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 border border-gray-200 text-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"><option value="Erkak">Erkak ovozi</option><option value="Ayol">Ayol ovozi</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">🌐 {t("video_language")}</label>
              <select value={settings.video_lang ?? "auto"} onChange={e => setSettings({...settings, video_lang: e.target.value})} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 border border-gray-200 text-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"><option value="auto">Auto (masala tiliga mos)</option><option value="uz">O'zbek tili</option><option value="en">English</option><option value="ru">Русский</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">📱 {t("video_format")}</label>
              <select value={settings.resolution ?? "Vertical (Shorts/Reels 9:16)"} onChange={e => setSettings({...settings, resolution: e.target.value})} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 border border-gray-200 text-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"><option value="Vertical (Shorts/Reels 9:16)">Vertical (9:16) - Instagram, TikTok</option><option value="Landscape (YouTube 16:9)">Landscape (16:9) - YouTube</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">🎨 Ilova mavzusi</label>
              <div className="flex gap-3">
                <button onClick={() => setSettings({...settings, theme_style: "dark"})} className="flex-1 py-2.5 rounded-xl text-sm font-medium flex justify-center items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50">🌙 Qora mavzu</button>
                <button onClick={() => setSettings({...settings, theme_style: "light"})} className="flex-1 py-2.5 rounded-xl text-sm font-medium flex justify-center items-center gap-2 border-2 border-violet-500 bg-violet-50 text-violet-700">☀️ Oq mavzu</button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50 border-t border-gray-100">
            <button onClick={() => setIsSettingsOpen(false)} className="px-5 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">Bekor qilish</button>
            <button onClick={saveSettings} className="px-5 py-2.5 text-sm font-medium rounded-xl shadow-sm transition-all flex items-center bg-violet-600 hover:bg-violet-700 text-white">{settingsSaved && <CheckCircle2 className="w-4 h-4 mr-2" />}{settingsSaved ? "Saqlandi" : "Saqlash"}</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
