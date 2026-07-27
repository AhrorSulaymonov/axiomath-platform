"use client";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { chatSessions, setChatSessions, history, setActiveChatId } = useAppContext();
  const router = useRouter();
  const textHistories = history.filter((h: any) => h.task_type === 'text');

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold mb-10 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-purple))' }}>Chatlar Tarixi</h2>
      <div className="p-8 rounded-[24px] shadow-sm bg-[var(--bg-sidebar)] border border-[var(--border)]">
        <div className="space-y-3">
          {chatSessions.length === 0 && textHistories.length === 0 ? (
            <p className="text-center py-6 text-[15px] font-medium text-[var(--text-secondary)]">Hozircha chatlar yo'q</p>
          ) : (
            <>
              {chatSessions.map((chat: any) => (
                <button key={chat.id} onClick={() => { setActiveChatId(chat.id); router.push("/chat"); }} className="w-full text-left p-5 rounded-2xl flex flex-col gap-1.5 transition-colors hover:bg-[var(--bg-hover)] bg-[var(--bg-main)] border border-[var(--border)]">
                  <span className="font-semibold text-[16px] truncate text-[var(--text-primary)]">{chat.title}</span>
                  <span className="text-[13px] font-medium text-[var(--text-secondary)]">{chat.timestamp || 'Yaqinda'}</span>
                </button>
              ))}
              {textHistories.map((th: any) => (
                <button key={th.id} onClick={() => {
                  const newChatId = th.id;
                  if (!chatSessions.find((c: any) => c.id === newChatId)) {
                    setChatSessions([{ id: newChatId, title: th.prompt.slice(0, 30), timestamp: th.timestamp, messages: [{ role: 'user', content: th.prompt }, { role: 'assistant', content: th.text_content, yt_videos: th.yt_videos }] }, ...chatSessions]);
                  }
                  setActiveChatId(newChatId); router.push("/chat");
                }} className="w-full text-left p-5 rounded-2xl flex flex-col gap-1.5 transition-colors hover:bg-[var(--bg-hover)] bg-[var(--bg-main)] border border-[var(--border)]">
                  <span className="font-semibold text-[16px] truncate text-[var(--text-primary)]">{th.prompt.slice(0, 50)}...</span>
                  <span className="text-[13px] font-medium text-[var(--text-secondary)]">{th.timestamp}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
