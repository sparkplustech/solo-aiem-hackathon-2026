import React from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, LogOut, Flame, LogIn } from "lucide-react";
import { motion } from "motion/react";

interface NavbarProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const { user, profile, logout, loginWithGoogle } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with futuristic pulsing ring */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => onNavigate && onNavigate("landing")}
            id="nav-logo"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded bg-indigo-500/20 blur group-hover:bg-indigo-500/30 transition-all duration-300" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded border border-indigo-500 bg-slate-900 font-mono text-sm font-black text-indigo-400">
                AP
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold tracking-wide text-white font-sans">
                AutoPilot<span className="text-indigo-400">OS</span>
              </span>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase leading-none">
                Academic Core
              </p>
            </div>
          </div>

          {/* Center Navigation for Landing Page users */}
          {!user && (
            <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#stats" className="hover:text-white transition-colors">Efficiency</a>
              <a href="#demo" className="hover:text-white transition-colors">Productivity Hub</a>
            </div>
          )}

          {/* Right side interactions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Active user streak widget */}
                {profile && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400"
                    title="Active Study Streak"
                  >
                    <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                    <span>{profile.streak || 1} Day Streak</span>
                  </motion.div>
                )}

                {/* Profile detail preview */}
                <div 
                  className="flex items-center space-x-2.5 bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1 cursor-pointer"
                  onClick={() => onNavigate && onNavigate("settings")}
                  id="nav-profile"
                >
                  <img
                    src={profile?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
                    alt={profile?.displayName}
                    className="h-6 w-6 rounded-full object-cover border border-indigo-500/30"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-slate-200">
                    {profile?.displayName?.split(" ")[0]}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    if (onNavigate) onNavigate("landing");
                  }}
                  className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
                  id="nav-logout-btn"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Exit OS</span>
                </button>
              </div>
            ) : currentView !== "landing" ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onNavigate && onNavigate("login")}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 hover:text-white px-4 py-2 transition-all"
                  id="nav-signin-text"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate && onNavigate("login")}
                  className="flex items-center space-x-1.5 block rounded bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                  id="nav-getstarted-btn"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Boot OS</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};
