import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User, Minimize2, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { askChatbot } from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatbotProps {
  assignmentsCount?: number;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ assignmentsCount = 0 }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **AutoPilot AI**, your virtual study supervisor. Ask me about your study schedule, pending assignments, or paste your notes so I can explain them simply!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const stats = {
        displayName: profile?.displayName || "Student",
        streak: profile?.streak || 1,
        totalStudyHours: profile?.totalStudyHours || 0,
        assignmentsCount: assignmentsCount
      };

      const res = await askChatbot(userMsg, messages, stats);
      setMessages(prev => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev, 
        { role: "assistant", content: "I encountered a quota limits exception or connection error. Please wait 10 seconds and retry!" }
      ]);
      toast.error("AutoPilot was rate-limited. Please retry shortly.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I am **AutoPilot AI**, your virtual study supervisor. Ask me about your study schedule, pending assignments, or paste your notes so I can explain them simply!"
      }
    ]);
    toast.success("Chat history cleared.");
  };

  const setPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating launcher trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, translateY: -2 }}
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-450/30 cursor-pointer"
            id="chatbot-trigger"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold border-2 border-slate-900">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main chat modal box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-80 sm:w-96 h-[500px] rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden"
            id="chatbot-window"
          >
            {/* Header banner */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-transparent border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded p-1 text-indigo-400">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-150 tracking-wider flex items-center space-x-1">
                    <span>AutoPilot AI</span>
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                  </h3>
                  <p className="text-[10px] text-indigo-400 font-mono font-bold">● Supervisor Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearChat}
                  title="Clear chat history"
                  className="rounded p-1 text-slate-400 hover:text-rose-450 hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat message panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-start space-x-2 max-w-[85%] ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                      <div className={`rounded p-1 shrink-0 ${isUser ? "bg-violet-500/10 text-violet-400 border border-violet-500/25" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25"}`}>
                        {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </div>
                      <div className={`rounded-xl px-3.5 py-2.5 leading-relaxed text-slate-200 border text-xs overflow-x-auto ${
                        isUser 
                          ? "bg-indigo-650/15 border-indigo-500/10" 
                          : "bg-slate-900/60 border-slate-850"
                      }`}>
                        <div className="markdown-body select-text">
                          <Markdown>{m.content}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    <div className="rounded p-1 shrink-0 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div className="rounded-xl px-3.5 py-2 bg-slate-900/40 border border-slate-800/60 text-slate-400 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick action prompts */}
            <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 border-t border-slate-900 bg-slate-950/40">
              <button 
                onClick={() => setPrompt("What should I study today?")}
                className="text-[9px] bg-slate-900 hover:bg-indigo-950 hover:text-white text-slate-350 border border-slate-850 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                "What should I study?"
              </button>
              <button 
                onClick={() => setPrompt("Summarize central database architectures in 3 points")}
                className="text-[9px] bg-slate-900 hover:bg-indigo-950 hover:text-white text-slate-350 border border-slate-850 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                "Summarize Database"
              </button>
              <button 
                onClick={() => setPrompt("Give me a study motivation tip!")}
                className="text-[9px] bg-slate-900 hover:bg-indigo-950 hover:text-white text-slate-350 border border-slate-850 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                "Motivation tip"
              </button>
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                id="chatbot-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:hover:bg-indigo-500 text-white rounded-lg p-2 transition-all cursor-pointer"
                id="chatbot-send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
