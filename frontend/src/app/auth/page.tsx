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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] p-4 text-[var(--text)]" style={{ backgroundColor: "var(--bg)" }}>
      {/* Animated Ambient Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[var(--primary)] blur-[100px] rounded-full mix-blend-screen pointer-events-none animate-pulse duration-1000 opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[var(--primary)] blur-[100px] rounded-full mix-blend-screen pointer-events-none animate-pulse duration-1000 delay-500 opacity-20"></div>

      {/* Main Form Container */}
      <div className="relative z-10 w-full max-w-[400px] p-8 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] shadow-xl transition-all duration-500">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="AxioMath Logo" className="w-16 h-16 mb-5 object-contain" />
          <h2 className="text-xl font-semibold text-[var(--text)]">
            {authMode === "verify" ? "Tasdiqlash" : (authMode === "login" ? "Xush kelibsiz" : "Ro'yxatdan o'tish")}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-2 text-center">
            {authMode === "verify" ? "Emailingizga yuborilgan kodni kiriting" : (authMode === "login" ? "Tizimga kirish uchun ma'lumotlaringizni kiriting" : "Yangi hisob yaratish uchun ma'lumotlarni kiriting")}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="mb-6 p-4 rounded-lg text-sm flex items-start gap-3 bg-[var(--error-muted)] text-[var(--error-text)] border border-[var(--error)]/20">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> 
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          {authMode !== "verify" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">{t("email")}</label>
                <div className="relative group">
                  <input type="email" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full px-4 py-2.5 rounded-lg outline-none bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-glow)] transition-all duration-300 text-sm" placeholder="ism@email.com" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Parol</label>
                <div className="relative group">
                  <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg outline-none bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-glow)] transition-all duration-300 text-sm" placeholder="••••••••" required />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 text-center block">Tasdiqlash kodi</label>
              <input type="text" value={authCode} onChange={e => setAuthCode(e.target.value)} className="w-full px-4 py-2.5 text-center tracking-[0.5em] text-lg font-bold rounded-lg outline-none bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-glow)] transition-all duration-300 uppercase" placeholder="------" maxLength={6} required />
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={isAuthLoading} className="w-full py-2.5 mt-4 rounded-lg font-medium text-sm flex justify-center items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none">
            {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} 
            <span>{authMode === "verify" ? "Tasdiqlash" : (authMode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish")}</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          {authMode === "verify" ? (
            <button type="button" onClick={() => { setAuthMode("register"); setAuthCode(""); setAuthError(""); }} className="text-[var(--primary-text)] hover:text-[var(--primary-hover)] font-medium transition-colors">Ortga qaytish</button>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>{authMode === "login" ? "Hisobingiz yo'qmi?" : "Allaqachon ro'yxatdan o'tganmisiz?"}</span>
              <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} className="text-[var(--primary-text)] hover:text-[var(--primary-hover)] font-medium transition-colors">
                {authMode === "login" ? "Ro'yxatdan o'tish" : "Kirish"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
