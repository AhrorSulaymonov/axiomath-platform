"use client";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default function HistoryPage() {
  const { chatSessions, setChatSessions, history, setActiveChatId, t } = useAppContext();
  const router = useRouter();
  const textHistories = history.filter((h: any) => h.task_type === 'text');

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto w-full">
      <h2 className="text-xl font-semibold text-[var(--text)] mb-6">{t("text_history")}</h2>
      
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)]">
        {chatSessions.length === 0 && textHistories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{t("no_chats")}</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {chatSessions.map((chat: any) => (
              <div 
                key={chat.id} 
                onClick={() => { setActiveChatId(chat.id); router.push("/chat"); }} 
                className="p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer flex flex-col gap-1 w-full text-left"
              >
                <span className="text-sm font-medium text-[var(--text)] truncate">{chat.title}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{chat.timestamp || 'Yaqinda'}</span>
              </div>
            ))}
            {textHistories.map((th: any) => (
              <div 
                key={th.id} 
                onClick={() => {
                  const newChatId = th.id;
                  if (!chatSessions.find((c: any) => c.id === newChatId)) {
                    setChatSessions([{ 
                      id: newChatId, 
                      title: th.prompt.slice(0, 30), 
                      timestamp: th.timestamp, 
                      messages: [{ role: 'user', content: th.prompt }, { role: 'assistant', content: th.text_content, yt_videos: th.yt_videos }] 
                    }, ...chatSessions]);
                  }
                  setActiveChatId(newChatId); router.push("/chat");
                }} 
                className="p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer flex flex-col gap-1 w-full text-left"
              >
                <span className="text-sm font-medium text-[var(--text)] truncate">{th.prompt.slice(0, 50)}...</span>
                <span className="text-xs text-[var(--text-tertiary)]">{th.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
