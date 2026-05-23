import React from "react";
import { Badge, UserStats } from "../types";
import { Award, Lock, Sparkles, Trophy, CheckCircle, Info } from "lucide-react";

interface BadgesTabProps {
  badges: Badge[];
  stats: UserStats;
}

export default function BadgesTab({ badges, stats }: BadgesTabProps) {
  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Gamification Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-[#022a1c] p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-400 via-emerald-800 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-300">
              <Trophy size={12} />
              <span>Gamified Achievements</span>
            </div>
            <h1 className="text-3xl font-display-lg font-bold tracking-tight text-white">
              Sponsor Achievements & Badges
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              Earn rewards, climb tiers, and unlock exclusive digital badges. Every badge unlocked is a testament to real-world carbon neutralization and environmental advocacy!
            </p>
          </div>
          <div className="glass-card bg-white/10 backdrop-blur-lg border-white/20 p-5 rounded-2xl text-center min-w-[160px] self-stretch md:self-auto flex flex-col justify-center">
            <span className="text-5xl font-extrabold text-teal-300 font-mono">{unlockedCount} / {badges.length}</span>
            <span className="text-xs font-bold text-white/80 uppercase mt-2 block tracking-wider">Badges Unlocked</span>
          </div>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-xl border-primary/10 flex items-center gap-4 bg-white">
          <div className="p-3 bg-emerald-50 text-primary rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Tier Bracket</span>
            <span className="font-bold text-lg text-slate-900">{stats.sustainabilityLevel}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border-primary/10 flex items-center gap-4 bg-white">
          <div className="p-3 bg-[#e5eeff] text-blue-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">National Percentile</span>
            <span className="font-bold text-lg text-slate-900">{stats.ranking}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border-primary/10 flex items-center gap-4 bg-white">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">energy_savings_leaf</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Next Tier Goal</span>
            <span className="font-bold text-lg text-slate-900">{stats.nextTierName}</span>
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((b) => (
          <div 
            key={b.id}
            className={`glass-card rounded-3xl p-6 border flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] ${
              b.isUnlocked 
                ? `${b.bgStyle} ${b.borderStyle}` 
                : "bg-slate-50/50 dark:bg-slate-900/10 border-dashed border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className={`p-4 rounded-2xl ${b.isUnlocked ? "bg-white/90 shadow-sm" : "bg-slate-100"}`}>
                <span className={`material-symbols-outlined text-4xl ${b.isUnlocked ? b.textColor : "text-slate-400"}`}>
                  {b.icon}
                </span>
              </div>
              <div>
                {b.isUnlocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                    <CheckCircle size={10} />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-slate-200">
                    <Lock size={10} />
                    <span>Locked</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className={`font-bold text-lg ${b.isUnlocked ? "text-slate-900" : "text-slate-400"}`}>{b.name}</h3>
              <p className={`text-xs ${b.isUnlocked ? "text-slate-600 dark:text-slate-400" : "text-slate-400"} font-sans leading-relaxed`}>{b.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-200/40 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Info size={12} />
              {b.isUnlocked && b.unlockedAt ? (
                <span>Unlocked on: <span className="font-mono">{b.unlockedAt}</span></span>
              ) : (
                <span>Requirement criteria not yet completed.</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
