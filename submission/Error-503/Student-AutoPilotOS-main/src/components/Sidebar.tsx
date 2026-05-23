import React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  CalendarDays,
  GraduationCap, 
  CheckSquare, 
  Timer, 
  BarChart3, 
  Settings, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { profile } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard Hub", icon: LayoutDashboard },
    { id: "upload", label: "AI Note Summary", icon: FileText },
    { id: "planner", label: "Study Planner", icon: Calendar },
    { id: "calendar", label: "Calendar Grid View", icon: CalendarDays },
    { id: "quiz", label: "Practice Quizzes", icon: GraduationCap },
    { id: "assignments", label: "Assignments & Tasks", icon: CheckSquare },
    { id: "focus", label: "Focus Room", icon: Timer },
    { id: "analytics", label: "Academic Metrics", icon: BarChart3 },
    { id: "settings", label: "OS Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#111827] hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-[64px] z-30 transition-colors">
      
      {/* Student identity panel */}
      <div className="p-5 border-b border-slate-800/60 flex items-center space-x-3">
        <div className="relative">
          <img 
            src={profile?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"} 
            alt="Profile Avatar" 
            className="h-10 w-10 rounded-full border border-indigo-500/30 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#111827] bg-emerald-500 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-white tracking-wide truncate">
            {profile?.displayName || "Student User"}
          </h4>
          <span className="text-[10px] font-mono tracking-wider text-slate-400 capitalize">
            Level 1 Academic
          </span>
        </div>
      </div>

      {/* Navigation options list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium transition-colors group ${
                isActive 
                  ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold" 
                  : "text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <IconComponent className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-auto" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Pro premium account upgrade widget */}
      <div className="p-4 border-t border-slate-800/50 mt-auto">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden text-left">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80 mb-1">Pro Account</p>
          <p className="text-sm font-medium mb-3 leading-snug">Upgrade for unlimited AI summarization</p>
          <button className="w-full py-2 bg-white text shadow-sm text-indigo-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer">
            GO PREMIER
          </button>
        </div>
      </div>
    </aside>
  );
};
