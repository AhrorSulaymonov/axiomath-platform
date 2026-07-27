"use client";
import { useState } from "react";
import axios from "axios";
import { BrainCircuit, AlertCircle, Loader2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
const API_BASE = "http://localhost:8000/api";

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
    <div className="flex h-screen items-center justify-center p-4 bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="bg-[var(--bg-sidebar)] p-8 rounded-3xl w-full max-w-[400px] border border-[var(--border)]">
        <div className="flex justify-center mb-6 text-[var(--accent)]"><BrainCircuit className="w-12 h-12" /></div>
        <h2 className="text-2xl font-bold text-center mb-6">{authMode === "verify" ? t("verify") : (authMode === "login" ? t("login") : t("register"))}</h2>
        {authError && <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20"><AlertCircle className="w-4 h-4 shrink-0" /> {authError}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          {authMode !== "verify" ? (
            <>
              <div><label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">{t("email")}</label><input type="email" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)]" placeholder="email@example.com" required /></div>
              <div><label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Parol</label><input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl outline-none bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)]" placeholder="••••••••" required /></div>
            </>
          ) : (
            <div><label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Tasdiqlash kodi</label><input type="text" value={authCode} onChange={e => setAuthCode(e.target.value)} className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg font-bold rounded-xl outline-none bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-primary)]" placeholder="------" maxLength={6} required /></div>
          )}
          <button type="submit" disabled={isAuthLoading} className="w-full py-3 rounded-xl font-medium flex justify-center items-center gap-2 bg-[var(--accent)] text-white disabled:opacity-70">{isAuthLoading && <Loader2 className="w-4 h-4 animate-spin" />} {authMode === "verify" ? t("verify") : (authMode === "login" ? t("login") : t("register"))}</button>
        </form>
        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          {authMode === "verify" ? <button type="button" onClick={() => { setAuthMode("register"); setAuthCode(""); setAuthError(""); }} className="text-[var(--accent)] font-semibold">Ortga qaytish</button> : <>{authMode === "login" ? t("no_account") + " " : t("have_account") + " "}<button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} className="text-[var(--accent)] font-semibold">{authMode === "login" ? t("register") : t("login")}</button></>}
        </div>
      </div>
    </div>
  );
}
