"use client";
import axios from "axios";
import { Loader2, Trash2 } from "lucide-react";
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

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-10 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-purple))' }}>Video Darslar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {history.filter((item: any) => item.task_type === "video").length === 0 ? (
          <div className="col-span-full"><p className="text-center py-10 text-sm font-medium text-[var(--text-secondary)]">Hozircha yaratilgan videolar yo'q</p></div>
        ) : (
          history.filter((item: any) => item.task_type === "video").map((item: any) => (
            <div key={item.id} className="rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow bg-[var(--bg-main)] border border-[var(--border)]">
              <div className="aspect-video relative bg-black">
                {item.status === "COMPLETED" && item.video_base64 ? (
                  <video src={`data:video/mp4;base64,${item.video_base64}`} controls className="w-full h-full object-contain"></video>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm font-medium text-[var(--text-secondary)]">
                    {item.status === "PROCESSING" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Jarayonda...</> : item.status === "FAILED" ? "Xatolik yuz berdi" : "Kutilmoqda"}
                  </div>
                )}
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <span className="text-[15px] font-semibold line-clamp-2 leading-snug pt-1 text-[var(--text-primary)]">{item.title || item.prompt}</span>
                <button onClick={() => handleDeleteTask(item.id)} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
