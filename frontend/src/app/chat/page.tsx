"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BrainCircuit, Paperclip, Send, X, Play } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAppContext } from "../../context/AppContext";

const API_BASE = typeof window !== "undefined" && window.location.hostname === "localhost" 
  ? "http://localhost:8000/api" 
  : "https://api.axiomath.tech/api";

export default function ChatPage() {
  const { username, chatSessions, setChatSessions, activeChatId, setActiveChatId, fetchUserInfo, fetchHistory } = useAppContext();
  const [chatInput, setChatInput] = useState("");
  const [chatSelectedFile, setChatSelectedFile] = useState<File | null>(null);
  const [chatPreviewUrl, setChatPreviewUrl] = useState<string | null>(null);
  const [isChatGenerating, setIsChatGenerating] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeChat = chatSessions.find((s: any) => s.id === activeChatId);

  useEffect(() => { chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatSessions, activeChatId]);

  const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]; setChatSelectedFile(file);
      const reader = new FileReader(); reader.onload = (ev) => setChatPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearChatFile = () => { setChatSelectedFile(null); setChatPreviewUrl(null); if (chatFileInputRef.current) chatFileInputRef.current.value = ""; };

  const handleSendChat = async () => {
    if (!chatInput.trim() && !chatSelectedFile) return;
    let chatId = activeChatId; let newSession = false;
    if (!chatId) { chatId = Date.now().toString(); newSession = true; setActiveChatId(chatId); }

    const userMessage = { role: 'user' as const, content: chatInput, image: chatPreviewUrl || undefined };
    const updatedSessions = newSession 
      ? [{ id: chatId, title: chatInput.slice(0, 30) || "Yangi chat", messages: [userMessage], timestamp: new Date().toLocaleDateString() }, ...chatSessions]
      : chatSessions.map((s: any) => s.id === chatId ? { ...s, messages: [...s.messages, userMessage] } : s);
    setChatSessions(updatedSessions);
    
    const currentInput = chatInput; const currentFile = chatSelectedFile;
    setChatInput(""); clearChatFile(); setIsChatGenerating(true);

    const formData = new FormData(); formData.append("username", username);
    if (currentInput) formData.append("prompt", currentInput);
    if (currentFile) formData.append("image", currentFile);
    
    const ctrl = new AbortController(); abortControllerRef.current = ctrl;
    
    try {
      const res = await axios.post(`${API_BASE}/tasks/analyze-text`, formData, { headers: { "Content-Type": "multipart/form-data" }, signal: ctrl.signal });
      if (res.data.success) {
        const aiMessage = { role: 'assistant' as const, content: res.data.text, yt_videos: res.data.yt_videos || [] };
        setChatSessions((prev: any) => prev.map((s: any) => s.id === chatId ? { ...s, messages: [...s.messages, aiMessage] } : s));
        fetchUserInfo(username); fetchHistory(username);
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') alert(error.response?.data?.detail || error.message);
    } finally { setIsChatGenerating(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); }
  };

  const handleCancelChat = () => { if (abortControllerRef.current) abortControllerRef.current.abort(); setIsChatGenerating(false); };

  const formatMessageContent = (text: string) => {
    if (!text) return '';
    let formatted = text.replace(/([📐✅📝💡📖🚀📌🔍].*?:)/g, '\n### $1\n');
    return formatted;
  };

  return (
    <div className="h-full flex flex-col w-full relative bg-[var(--bg)]">
      {!activeChatId || activeChat?.messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
          <h1 className="text-2xl font-semibold text-center mb-4 text-[var(--text)]">Qanday masalani yechamiz?</h1>
          <p className="text-[var(--text-secondary)] text-sm text-center max-w-md">Matematika, fizika yoki ximiya masalalarini yozing yoki rasmga olib yuboring. Men yechimini ko'rsataman.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-24 lg:px-40 py-10 pb-40 flex flex-col items-center">
          <div className="w-full max-w-[850px] flex flex-col gap-10">
            {activeChat?.messages.map((msg: any, idx: number) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${msg.role === 'user' ? 'max-w-[75%]' : 'w-full'}`}>
                  
                  {msg.role === 'user' && (
                    <div className="bg-[var(--bg-elevated)] text-[var(--text)] px-5 py-3 rounded-2xl rounded-tr-sm text-sm shadow-sm ml-auto w-fit">
                      {msg.image && <img src={msg.image} alt="User upload" className="max-w-[250px] rounded-xl mb-4 object-contain shadow-sm border border-[var(--border)]" />}
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                    </div>
                  )}
                  
                  {msg.role === 'assistant' && (
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 w-full overflow-hidden break-words">
                      <div className="flex items-center gap-3 mb-6">
                        <img src="/logo.png" alt="AxioMath" className="w-8 h-8 object-contain shrink-0" />
                        <h3 className="text-sm font-semibold text-[var(--text)]">Masala Tahlili</h3>
                      </div>
                      <div className="text-[var(--text-secondary)] text-sm leading-relaxed space-y-4 break-words w-full">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({node, ...props}) => <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-[var(--text)] bg-[var(--primary-muted)] px-1 rounded" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4 text-[var(--text-secondary)]" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-[var(--text-secondary)]" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-[var(--text)] mt-6 mb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-[var(--text)] mt-5 mb-3" {...props} />,
                            h3: ({node, ...props}) => <div className="mt-8 mb-4"><h3 className="text-sm font-semibold text-[var(--primary-text)] bg-[var(--primary-muted)] border border-[var(--border)] rounded-lg px-4 py-2.5" {...props} /></div>,
                            h4: ({node, ...props}) => <h4 className="text-base font-semibold text-[var(--text)] mt-3 mb-2" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-[var(--primary)] pl-4 py-1 italic bg-[var(--primary-muted)] text-[var(--text-secondary)] rounded-r-lg my-4" {...props} />,
                            code: ({node, inline, className, children, ...props}: any) => {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <div className="bg-[var(--bg-inset)] text-[var(--text)] rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono"><code className={className} {...props}>{children}</code></div>
                              ) : (
                                <code className="bg-[var(--bg-elevated)] text-[var(--primary-text)] px-1.5 py-0.5 rounded font-mono text-sm" {...props}>{children}</code>
                              )
                            }
                          }}
                        >
                          {formatMessageContent(msg.content)}
                        </ReactMarkdown>
                      </div>
                      
                      {msg.yt_videos && msg.yt_videos.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-[var(--border)]">
                          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[var(--text)]"><Play className="w-4 h-4 text-[var(--primary)]" /> Video Darslar</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {msg.yt_videos.map((vid: any, i: number) => (
                              <a key={i} href={`https://www.youtube.com${vid.url_suffix}`} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden transition-all bg-[var(--bg-elevated)] border border-[var(--border)] group">
                                <div className="aspect-video relative">
                                  <img src={vid.thumbnails[0]} alt={vid.title} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                  <div className="absolute bottom-2 right-2 bg-black/80 text-[var(--text)] text-xs px-2 py-0.5 rounded font-medium">{vid.duration}</div>
                                </div>
                                <div className="p-3"><h5 className="text-[13px] font-medium line-clamp-2 text-[var(--text)] group-hover:text-[var(--primary)]">{vid.title}</h5></div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isChatGenerating && (
              <div className="flex w-full justify-start">
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex items-center gap-4 min-w-[200px]">
                  <img src="/logo.png" alt="AxioMath" className="w-8 h-8 object-contain shrink-0 animate-pulse" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-hover)] animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-text)] animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} className="h-4" />
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--bg)] to-transparent pb-6 pt-10 px-4 flex justify-center z-30 pointer-events-none">
        <div className="w-full max-w-3xl relative pointer-events-auto">
          <input ref={chatFileInputRef} type="file" className="hidden" accept="image/*" onChange={handleChatFileChange} />
          {chatPreviewUrl && (
            <div className="absolute bottom-full mb-4 left-6 p-2 rounded-xl flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)]">
              <img src={chatPreviewUrl} alt="Upload preview" className="w-16 h-16 object-cover rounded-xl" />
              <button onClick={clearChatFile} className="p-1.5 bg-[var(--bg-hover)] hover:bg-[var(--error-muted)] rounded-full text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors mr-1"><X className="w-4 h-4"/></button>
            </div>
          )}
          
          <div className="relative flex items-center bg-[var(--bg-card)] rounded-xl border border-[var(--border)] px-4 py-3 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary-glow)] transition-all">
            <button onClick={() => chatFileInputRef.current?.click()} className="text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors mr-3">
              <Paperclip className="w-5 h-5" />
            </button>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Masalani yozing..." className="flex-1 bg-transparent outline-none text-sm text-[var(--text)] placeholder-[var(--text-tertiary)]" />
            
            <div className="flex items-center ml-2">
              {isChatGenerating ? (
                <button onClick={handleCancelChat} className="p-2 text-[var(--error)] bg-[var(--error-muted)] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              ) : (
                <button onClick={handleSendChat} disabled={!chatInput.trim() && !chatSelectedFile} className="p-2 text-white bg-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
