"use client";
import axios from "axios";
import { Loader2, Trash2, Video } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" 
  ? "http://localhost:8000/api" 
  : "https://api.axiomath.tech/api";

export default function VideoHistoryPage() {
  const { username, history, fetchHistory } = useAppContext();

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Rostdan ham bu darsni o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}?username=${username}`);
      fetchHistory(username);
    } catch (error: any) { alert("O'chirishda xatolik yuz berdi"); }
  };

  const videoHistory = history.filter((item: any) => item.task_type === "video");

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto w-full">
      <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Video Darslar</h2>
      
      {videoHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-[var(--text-secondary)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Videolar yo'q</p>
          <p className="text-xs text-[var(--text-tertiary)]">Yaratilgan video darslar shu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoHistory.map((item: any) => (
            <div 
              key={item.id} 
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-md)] hover:-translate-y-px transition-all duration-200 flex flex-col"
            >
              <div className="aspect-video relative bg-[var(--bg-inset)]">
                {item.status === "COMPLETED" && item.video_base64 ? (
                  <video src={`data:video/mp4;base64,${item.video_base64}`} controls className="w-full h-full object-contain"></video>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {item.status === "PROCESSING" ? (
                      <div className="flex items-center text-sm text-[var(--text-secondary)]">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Jarayonda...
                      </div>
                    ) : item.status === "FAILED" ? (
                      <span className="text-sm text-[var(--error-text)]">Xatolik yuz berdi</span>
                    ) : (
                      <span className="text-sm text-[var(--text-secondary)]">Kutilmoqda</span>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 flex items-start justify-between gap-3 mt-auto">
                <span className="text-sm font-medium text-[var(--text)] line-clamp-2 pt-0.5">{item.title || item.prompt}</span>
                <button 
                  onClick={() => handleDeleteTask(item.id)} 
                  className="text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-muted)] rounded-lg p-2 transition-colors shrink-0"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
