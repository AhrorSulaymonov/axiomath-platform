"use client";
import { useState } from "react";
import axios from "axios";
import { BrainCircuit, AlertCircle, Loader2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" 
  ? "http://localhost:8000/api" 
  : "https://api.axiomath.tech/api";

export default function AuthPage() {
  const { t, login } = useAppContext();
  const [authMode, setAuthMode] = useState<"login" | "register" | "verify">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername || !authPassword) { setAuthError("Iltimos barcha maydonlarni to'ldiring"); return; }
    if (authMode === "verify" && !authCode) { setAuthError("Tasdiqlash kodini kiriting"); return; }
    setIsAuthLoading(true); setAuthError("");
    try {
      if (authMode === "verify") {
        const res = await axios.post(`${API_BASE}/auth/verify-code`, { username: authUsername, password: authPassword, code: authCode });
        if (res.data.success) login(res.data.username);
      } else if (authMode === "register") {
        const res = await axios.post(`${API_BASE}/auth/send-code`, { username: authUsername, password: authPassword });
        if (res.data.success) { setAuthMode("verify"); alert(res.data.message || "Kodi yuborildi"); }
      } else {
        const res = await axios.post(`${API_BASE}/auth/login`, { username: authUsername, password: authPassword });
        if (res.data.success) login(res.data.username);
      }
    } catch (error: any) {
      setAuthError(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally { setIsAuthLoading(false); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] text-white p-4">
      {/* Animated Ambient Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse duration-1000 delay-500"></div>

      {/* Main Form Container - Glassmorphic */}
      <div className="relative z-10 w-full max-w-[420px] p-8 md:p-10 bg-white/[0.02] backdrop-blur-3xl rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-white/[0.12]">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1.5px] shadow-lg shadow-indigo-500/20 mb-5 transform transition hover:scale-105 duration-300 group">
            <div className="w-full h-full bg-[#0a0a0a] rounded-2xl flex items-center justify-center group-hover:bg-[#111] transition-colors duration-300">
              <BrainCircuit className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            {authMode === "verify" ? "Tasdiqlash" : (authMode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish")}
          </h2>
          <p className="text-white/50 text-sm mt-2 text-center font-medium">
            {authMode === "verify" ? "Emailingizga yuborilgan kodni kiriting" : (authMode === "login" ? "Tizimga kirish uchun ma'lumotlaringizni kiriting" : "Yangi hisob yaratish uchun ma'lumotlarni kiriting")}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="mb-6 p-4 rounded-xl text-sm flex items-start gap-3 bg-red-500/10 text-red-400 border border-red-500/20 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> 
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          {authMode !== "verify" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white/70 ml-1 tracking-wide">{t("email")}</label>
                <div className="relative group">
                  <input type="email" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full px-5 py-3.5 rounded-xl outline-none bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:bg-white/[0.05] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300" placeholder="ism@email.com" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-white/70 ml-1 tracking-wide">Parol</label>
                <div className="relative group">
                  <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full px-5 py-3.5 rounded-xl outline-none bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:bg-white/[0.05] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300" placeholder="••••••••" required />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/70 ml-1 text-center block tracking-wide">Tasdiqlash kodi</label>
              <input type="text" value={authCode} onChange={e => setAuthCode(e.target.value)} className="w-full px-5 py-4 text-center tracking-[0.75em] text-2xl font-bold rounded-xl outline-none bg-white/[0.03] border border-white/10 text-white focus:bg-white/[0.05] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 uppercase" placeholder="------" maxLength={6} required />
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={isAuthLoading} className="w-full py-4 mt-4 rounded-xl font-semibold flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none">
            {isAuthLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null} 
            <span className="tracking-wide text-[15px]">{authMode === "verify" ? "Tasdiqlash" : (authMode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish")}</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-white/60">
          {authMode === "verify" ? (
            <button type="button" onClick={() => { setAuthMode("register"); setAuthCode(""); setAuthError(""); }} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Ortga qaytish</button>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>{authMode === "login" ? "Hisobingiz yo'qmi?" : "Allaqachon ro'yxatdan o'tganmisiz?"}</span>
              <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-indigo-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
                {authMode === "login" ? "Ro'yxatdan o'tish" : "Kirish"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
