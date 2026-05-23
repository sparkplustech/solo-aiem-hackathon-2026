import React, { useState, useEffect, useRef } from "react";
import { Sparkles, MessageSquare, Send, X, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";

interface Message {
  role: "user" | "advisor";
  content: string;
}

// Simple Markdown parser for common formatting
const renderMarkdown = (text: string) => {
  // Split by double newlines first for better paragraph handling
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((para, pIdx) => {
    // Handle headers (###, ##, #)
    const headerMatch = para.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const sizes = { 1: "text-lg", 2: "text-base", 3: "text-sm" };
      return (
        <div key={pIdx} className={`${sizes[level as keyof typeof sizes]} font-bold text-emerald-800 dark:text-emerald-300 mt-2`}>
          {renderInlineMarkdown(headerText)}
        </div>
      );
    }

    // Handle bullet lists
    if (para.startsWith("*") || para.startsWith("-")) {
      const lines = para.split("\n");
      return (
        <ul key={pIdx} className="list-disc list-inside ml-2 space-y-1 text-slate-700 dark:text-slate-200">
          {lines.filter(l => l.trim()).map((line, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {renderInlineMarkdown(line.replace(/^[\*\-]\s+/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p key={pIdx} className="leading-relaxed text-slate-700 dark:text-slate-200">
        {renderInlineMarkdown(para)}
      </p>
    );
  });
};

// Render inline markdown (bold, etc.)
const renderInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-emerald-700 dark:text-emerald-300">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function AiAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "advisor",
      content: "Hello! I am your **EcoKart AI Advisor**. Ask me anything about tracking your carbon footprint, eco-friendly kits, or general sustainability!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [trivia, setTrivia] = useState("Offsetting 1 ton of CO2 is equivalent to planting approximately 40 trees and letting them grow for 10 years.");
  const [triviaLoading, setTriviaLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Load random eco trivia on mount
  useEffect(() => {
    fetchTrivia();
  }, []);

  const fetchTrivia = async () => {
    setTriviaLoading(true);
    try {
      const res = await fetch("/api/eco-trivia");
      const data = await res.json();
      if (data.trivia) {
        setTrivia(data.trivia);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriviaLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });
      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "advisor", content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "advisor", content: data.error || "Sorry, I had trouble processing that request." }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "advisor", content: `Failed to connect with advisor: ${err.message || 'Server offline'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    "Bamboo vs Plastic impact?",
    "How to earn Forest Guardian?",
    "Tips to offset 50kg CO2",
    "Compost Bin efficiency"
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 z-40 bg-emerald-700 hover:bg-emerald-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition-transform active:scale-95 duration-200 group border border-emerald-500/30"
      >
        <Sparkles className="animate-pulse-soft size-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs uppercase tracking-wider">
          AI Eco Advisor
        </span>
      </button>

      {/* Chat Drawer Side Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-200/20 animate-fadeIn">
            {/* Header */}
            <div className="p-4 md:p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 bg-teal-300 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <Sparkles size={20} className="text-teal-300" />
                </div>
                <div>
                  <h3 className="font-bold text-md tracking-tight">EcoKart AI Advisor</h3>
                  <p className="text-[10px] text-teal-300 uppercase tracking-widest font-extrabold">Active Carbon Analyst</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Live Fact Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 px-5 py-3 border-b border-emerald-200/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700 dark:text-emerald-400 mt-0.5">wb_incandescent</span>
              <div className="flex-1">
                <span className="font-bold">Eco Intel: </span>
                {triviaLoading ? "Thinking..." : trivia}
              </div>
              <button 
                onClick={fetchTrivia} 
                disabled={triviaLoading}
                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-md text-emerald-700 dark:text-emerald-400 transition-colors disabled:opacity-50"
                title="Next Fact"
              >
                <RefreshCw size={12} className={triviaLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Conversations Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs md:text-[13px]">
              {messages.map((m, idx) => (
                <div 
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                    m.role === "user" 
                      ? "bg-emerald-600 text-white ml-6 rounded-tr-sm" 
                      : "bg-white dark:bg-slate-800 border border-emerald-200/50 dark:border-emerald-900/50 mr-6 rounded-tl-sm text-slate-700 dark:text-slate-200 shadow-sm"
                  }`}>
                    <div className="space-y-2">
                      {m.role === "advisor" ? renderMarkdown(m.content) : <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-emerald-200/50 dark:border-emerald-900/50 rounded-2xl rounded-tl-sm p-4 mr-6 flex items-center gap-2 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-200"></span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold ml-1">Analyzing footprint options...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips & Footer Control */}
            <div className="p-4 border-t border-slate-200/40 space-y-3">
              {/* Suggestions */}
              {messages.length < 4 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">Suggested Questions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestionChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full transition-all text-left"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask advisor a green question..."
                  className="flex-1 py-3 px-4 text-xs font-medium border border-emerald-300 rounded-full bg-white dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm active:scale-95"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
