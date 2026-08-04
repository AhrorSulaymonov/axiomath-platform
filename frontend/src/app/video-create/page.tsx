"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  ImagePlus,
  Play,
  AlertCircle,
  Loader2,
  X,
  Languages,
  Check,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" 
  ? "http://localhost:8000/api" 
  : "https://api.axiomath.tech/api";

export default function VideoCreatePage() {
  const { username, fetchUserInfo, fetchHistory, settings, updateSettings, t } = useAppContext();
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskInfo, setActiveTaskInfo] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTaskId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/tasks/${activeTaskId}`);
          setActiveTaskInfo(res.data);
          if (res.data.status === "COMPLETED" || res.data.status === "FAILED") {
            setIsGenerating(false);
            fetchHistory(username);
            fetchUserInfo(username);
            clearInterval(interval);
          }
        } catch (error) {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTaskId, username]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt && !selectedFile) {
      alert("Iltimos, masala matnini kiriting yoki rasm yuklang.");
      return;
    }
    setIsGenerating(true);
    setActiveTaskId(null);
    setActiveTaskInfo(null);
    const formData = new FormData();
    formData.append("username", username);
    if (prompt) formData.append("prompt", prompt);
    if (selectedFile) formData.append("image", selectedFile);
    
    // Sozlamalarni API'ga bevosita yuboramiz (bazaga saqlamasdan)
    formData.append("voice_type", settings?.voice_type || "Erkak");
    formData.append("video_lang", settings?.video_lang || "auto");
    formData.append("resolution", settings?.resolution || "Vertical (Shorts/Reels 9:16)");
    formData.append("theme_style", settings?.theme_style || "light");
    formData.append("bynara_model", settings?.bynara_model || "agnes-2.0-flash");

    try {
      const res = await axios.post(`${API_BASE}/tasks/generate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) setActiveTaskId(res.data.task_id);
    } catch (error: any) {
      alert(error.response?.data?.detail || error.message);
      setIsGenerating(false);
    }
  };

  const renderPipelineStep = (
    stepNum: number,
    label: string,
    descActive: string,
    descDone: string,
    descPending: string = "Kutilmoqda",
  ) => {
    let state = "inactive";
    if (activeTaskInfo?.status === "COMPLETED") state = "completed";
    else if (activeTaskInfo?.status === "FAILED")
      state = stepNum === 1 ? "failed" : "inactive";
    else if (isGenerating || activeTaskInfo?.status === "PROCESSING") {
      if (stepNum <= 2) state = "completed";
      else if (stepNum === 3) state = "active";
    }

    return (
      <div
        className={`flex items-start gap-4 transition-all duration-300 ${state === "inactive" ? "opacity-60" : "opacity-100"}`}
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 transition-colors duration-300
          ${
            state === "completed"
              ? "border-[var(--success)] bg-[var(--success-muted)] text-[var(--success)]"
              : state === "active"
                ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-tertiary)]"
          }`}
        >
          {state === "completed" ? (
            <Check className="w-4 h-4" />
          ) : state === "active" ? (
            <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-[var(--primary)]"></div>
          ) : (
            <span className="text-[11px] font-bold">{stepNum}</span>
          )}
        </div>

        <div>
          <p
            className={`text-sm font-medium ${state === "active" ? "text-[var(--primary-text)]" : "text-[var(--text)]"}`}
          >
            {label}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {state === "completed"
              ? descDone
              : state === "active"
                ? descActive
                : descPending}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pb-10 w-full relative bg-[var(--bg)]">
      <header className="h-20 flex items-center justify-between px-8 shrink-0 bg-transparent">
        <h1 className="text-xl font-semibold text-[var(--text)] tracking-tight">
          {t("video_create")}
        </h1>
      </header>

      <div className="flex gap-8 px-8 w-full max-w-7xl mx-auto flex-col lg:flex-row">
        {/* CHAP TOMON: Kiritish maydonlari */}
        <div className="w-full lg:w-7/12 flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <h3 className="text-sm font-semibold mb-4 text-[var(--text)]">
              Masala sharti
            </h3>

            <div className="space-y-6">
              {/* Matn kiritish */}
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 rounded-lg p-4 text-sm outline-none resize-none bg-[var(--bg-inset)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-glow)] transition-all placeholder-[var(--text-tertiary)]"
                  placeholder="Masalan: To'g'ri burchakli uchburchakning katetlari 6 va 8 ga teng..."
                ></textarea>
              </div>

              {/* Rasm yuklash */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <div className="rounded-lg p-4 flex items-center relative bg-[var(--bg-inset)] border border-[var(--border)]">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[var(--text)]">
                        {selectedFile?.name}
                      </p>
                    </div>
                    <button
                      onClick={clearFile}
                      className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all cursor-pointer border-[var(--border)] bg-[var(--bg-inset)] hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4 transition-transform">
                      <ImagePlus className="w-6 h-6 text-[var(--text-secondary)] transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text)]">
                      Rasmni bu yerga tashlang yoki tanlang
                    </p>
                    <p className="text-xs mt-1 text-[var(--text-tertiary)]">
                      PNG, JPG (Maksimal 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Pastki qism: Til va sozlamalar va Tugma */}
              <div className="pt-6 mt-2 flex flex-col gap-4 border-t border-[var(--border)]">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-[var(--bg-inset)] border border-[var(--border)] px-3 py-2 rounded-lg">
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase">🔊 {t("voice")}</span>
                    <select value={settings?.voice_type ?? "Erkak"} onChange={e => updateSettings({...settings, voice_type: e.target.value})} className="bg-transparent border-none outline-none text-sm font-medium text-[var(--text)] cursor-pointer">
                      <option value="Erkak" className="bg-[var(--bg-card)]">{t("male")}</option>
                      <option value="Ayol" className="bg-[var(--bg-card)]">{t("female")}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-[var(--bg-inset)] border border-[var(--border)] px-3 py-2 rounded-lg">
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase">🌐 {t("language")}</span>
                    <select value={settings?.video_lang ?? "auto"} onChange={e => updateSettings({...settings, video_lang: e.target.value})} className="bg-transparent border-none outline-none text-sm font-medium text-[var(--text)] cursor-pointer">
                      <option value="auto" className="bg-[var(--bg-card)]">Auto</option>
                      <option value="uz" className="bg-[var(--bg-card)]">UZ</option>
                      <option value="en" className="bg-[var(--bg-card)]">EN</option>
                      <option value="ru" className="bg-[var(--bg-card)]">RU</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-[var(--bg-inset)] border border-[var(--border)] px-3 py-2 rounded-lg">
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase">📱 {t("format")}</span>
                    <select value={settings?.resolution ?? "Vertical (Shorts/Reels 9:16)"} onChange={e => updateSettings({...settings, resolution: e.target.value})} className="bg-transparent border-none outline-none text-sm font-medium text-[var(--text)] cursor-pointer w-24 truncate">
                      <option value="Vertical (Shorts/Reels 9:16)" className="bg-[var(--bg-card)]">Vertical (9:16)</option>
                      <option value="Landscape (YouTube 16:9)" className="bg-[var(--bg-card)]">Landscape (16:9)</option>
                    </select>
                  </div>
                </div>

                {/* Model Selection Row */}
                <div className="w-full bg-[var(--bg-inset)] border border-[var(--border)] px-4 py-3 rounded-lg flex flex-wrap items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase">🤖 Model</span>
                  </div>
                  <select 
                    value={settings?.bynara_model ?? "agnes-2.0-flash"} 
                    onChange={e => updateSettings({...settings, bynara_model: e.target.value})} 
                    className="bg-transparent border-none outline-none text-sm font-medium text-[var(--text)] cursor-pointer flex-1 text-right ml-4"
                  >
                    <option value="gemini-3.5-flash-lite" className="bg-[var(--bg-card)]">gemini-3.5-flash-lite (🖼️ Vision)</option>
                    <option value="agnes-2.0-flash" className="bg-[var(--bg-card)]">agnes-2.0-flash (🖼️ Vision)</option>
                    <option value="mistral-medium-3-5" className="bg-[var(--bg-card)]">mistral-medium-3-5 (🖼️ Vision)</option>
                    <option value="glm-5.2-free" className="bg-[var(--bg-card)]">glm-5.2-free (T Text)</option>
                    <option value="laguna-s-2.1" className="bg-[var(--bg-card)]">laguna-s-2.1 (T Text)</option>
                    <option value="mistral-large" className="bg-[var(--bg-card)]">mistral-large (T Text)</option>
                    <option value="nemotron-3-ultra" className="bg-[var(--bg-card)]">nemotron-3-ultra (T Text)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating || activeTaskInfo?.status === "PROCESSING"
                  }
                  className="w-full md:w-auto self-end font-medium px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white disabled:opacity-50 transition-all"
                >
                  {isGenerating || activeTaskInfo?.status === "PROCESSING" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  {isGenerating || activeTaskInfo?.status === "PROCESSING"
                    ? "Yaratilmoqda..."
                    : "Video dars yaratish"}
                </button>
              </div>
            </div>
          </div>

          {/* Xatolik chiqsa ko'rsatish */}
          {activeTaskInfo?.status === "FAILED" && (
            <div className="p-4 rounded-xl flex gap-4 bg-[var(--error-muted)] border border-[var(--error)]/20 items-center">
              <div className="w-10 h-10 rounded-full bg-[var(--error-muted)] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-[var(--error)]" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--error-text)] mb-0.5 text-sm">
                  Xatolik yuz berdi
                </h3>
                <p className="text-xs text-[var(--error)]">
                  {activeTaskInfo.error_message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* O'NG TOMON: Natija va Jarayon */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          {/* Natija Video Qutisi */}
          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <h3 className="text-sm font-semibold mb-4 text-[var(--text)]">Natija</h3>
            <div className="w-full aspect-[9/16] max-h-[450px] bg-[var(--bg-inset)] rounded-lg relative overflow-hidden flex items-center justify-center group">
              {activeTaskInfo?.status === "COMPLETED" &&
              activeTaskInfo.video_base64 ? (
                <video
                  src={`data:video/mp4;base64,${activeTaskInfo.video_base64}`}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                ></video>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/20"></div>
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                  ></div>
                  <button className="w-14 h-14 rounded-full flex items-center justify-center transition-all border z-10 relative bg-white/10 backdrop-blur-md border-white/20 group-hover:scale-110 group-hover:bg-white/20">
                    {isGenerating ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1 fill-current" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Jarayon Pipeline Qutisi */}
          <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <h3 className="text-sm font-semibold mb-6 text-[var(--text)]">
              Jarayon (Pipeline)
            </h3>
            <div className="space-y-6 relative">
              {/* O'rtadagi bog'lovchi chiziq (faketiv vizual uchun) */}
              <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-[var(--border)] rounded-full z-0"></div>

              <div className="relative z-10 space-y-6">
                {renderPipelineStep(
                  1,
                  "Problem Analysis (Vision)",
                  "Agnes-2.0 tahlil qilmoqda...",
                  "Agnes-2.0 tahlili yakunlandi (1.2s)",
                  "Kutilmoqda...",
                )}
                {renderPipelineStep(
                  2,
                  "Storyboard & SVG",
                  "Agnes-2.0 mantiqiy tuzilma yaratmoqda...",
                  "Agnes-2.0 mantiqiy tuzilmani yaratdi (3.4s)",
                  "Kutilmoqda...",
                )}
                {renderPipelineStep(
                  3,
                  "Audio Synthesis (TTS)",
                  "MMS-TTS audiolarni sintez qilmoqda...",
                  "Audiolar muvaffaqiyatli sintez qilindi",
                  "MMS-TTS sintezi kutmoqda...",
                )}
                {renderPipelineStep(
                  4,
                  "Slide Rendering",
                  "Slaydlar tayyorlanmoqda...",
                  "Slaydlar tayyor",
                  "Playwright & KaTeX kutmoqda",
                )}
                {renderPipelineStep(
                  5,
                  "Video Compilation",
                  "Video yig'ilmoqda...",
                  "Video muvaffaqiyatli yig'ildi",
                  "FFmpeg yig'ish kutmoqda",
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
