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
    <div className="h-full flex flex-col w-full relative">
      {!activeChatId || activeChat?.messages.length === 0 ? (
        // Qanday masalani yechamiz (Markazda)
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800">Qanday masalani yechamiz?</h1>
          <p className="text-gray-500 text-center max-w-md">Matematika, fizika yoki ximiya masalalarini yozing yoki rasmga olib yuboring. Men yechimini ko'rsataman.</p>
        </div>
      ) : (
        // Chat xabarlari tarixi
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-24 lg:px-40 py-10 pb-40 flex flex-col items-center">
          <div className="w-full max-w-[850px] flex flex-col gap-10">
            {activeChat?.messages.map((msg: any, idx: number) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${msg.role === 'user' ? 'max-w-[75%]' : 'w-full'}`}>
                  
                  {msg.role === 'user' && (
                    <div className="bg-gray-100 text-gray-800 px-6 py-4 rounded-3xl rounded-tr-sm text-[15px] shadow-sm ml-auto w-fit">
                      {msg.image && <img src={msg.image} alt="User upload" className="max-w-[250px] rounded-xl mb-4 object-contain shadow-sm border border-gray-200" />}
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                    </div>
                  )}
                  
                  {msg.role === 'assistant' && (
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.04)] w-full overflow-hidden break-words">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                          <BrainCircuit className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Masala Tahlili</h3>
                      </div>
                      <div className="text-gray-700 text-[15px] leading-relaxed space-y-4 break-words w-full">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 bg-amber-50 px-1.5 py-0.5 rounded text-[15.5px]" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="text-gray-700 pl-1" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />,
                            h3: ({node, ...props}) => <div className="mt-8 mb-4"><h3 className="text-[16px] font-bold text-violet-800 bg-violet-50 border border-violet-200 rounded-xl px-5 py-3 shadow-sm" {...props} /></div>,
                            h4: ({node, ...props}) => <h4 className="text-base font-semibold text-gray-900 mt-3 mb-2" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-violet-500 pl-4 py-1 italic bg-violet-50 text-gray-700 rounded-r-lg my-4" {...props} />,
                            code: ({node, inline, className, children, ...props}: any) => {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <div className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto my-4 text-sm font-mono"><code className={className} {...props}>{children}</code></div>
                              ) : (
                                <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded font-mono text-[14px]" {...props}>{children}</code>
                              )
                            }
                          }}
                        >
                          {formatMessageContent(msg.content)}
                        </ReactMarkdown>
                      </div>
                      
                      {msg.yt_videos && msg.yt_videos.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <h4 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800"><Play className="w-5 h-5 text-red-500" /> Video Darslar</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {msg.yt_videos.map((vid: any, i: number) => (
                              <a key={i} href={`https://www.youtube.com${vid.url_suffix}`} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white border border-gray-200 group">
                                <div className="aspect-video relative">
                                  <img src={vid.thumbnails[0]} alt={vid.title} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-medium">{vid.duration}</div>
                                </div>
                                <div className="p-3"><h5 className="text-[13px] font-bold line-clamp-2 text-gray-800 group-hover:text-violet-600">{vid.title}</h5></div>
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
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 min-w-[200px]">
                  <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-5 h-5 text-violet-600 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} className="h-4" />
          </div>
        </div>
      )}
      
      {/* Input Qismi (Pastda qotirilgan) */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#f9fafb] via-[#f9fafb] to-transparent pt-10 pb-8 px-4 flex justify-center z-30 pointer-events-none">
        <div className="w-full max-w-3xl relative pointer-events-auto">
          <input ref={chatFileInputRef} type="file" className="hidden" accept="image/*" onChange={handleChatFileChange} />
          {chatPreviewUrl && (
            <div className="absolute bottom-full mb-4 left-6 p-2 rounded-2xl flex items-center gap-3 shadow-md bg-white border border-gray-100">
              <img src={chatPreviewUrl} alt="Upload preview" className="w-16 h-16 object-cover rounded-xl" />
              <button onClick={clearChatFile} className="p-1.5 bg-gray-50 hover:bg-red-50 rounded-full text-gray-500 hover:text-red-500 transition-colors mr-1"><X className="w-4 h-4"/></button>
            </div>
          )}
          
          <div className="relative flex items-center bg-white rounded-full border border-gray-200 shadow-[0_2px_15px_rgba(0,0,0,0.03)] px-6 py-3.5 focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400 transition-all">
            <button onClick={() => chatFileInputRef.current?.click()} className="text-gray-400 hover:text-violet-600 transition-colors mr-3">
              <Paperclip className="w-5 h-5" />
            </button>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Kiritish areain..." className="flex-1 bg-transparent outline-none text-[15px] text-gray-800" />
            
            <div className="flex items-center ml-2">
              {isChatGenerating ? (
                <button onClick={handleCancelChat} className="p-2 text-red-500 bg-red-50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              ) : (
                <button onClick={handleSendChat} disabled={!chatInput.trim() && !chatSelectedFile} className="p-2 text-white bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:text-gray-100 rounded-full transition-colors">
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
