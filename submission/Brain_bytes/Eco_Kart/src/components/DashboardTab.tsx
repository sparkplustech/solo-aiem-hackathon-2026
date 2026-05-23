import React, { useState } from "react";
import { 
  Leaf, 
  TrendingUp, 
  Coins, 
  Award, 
  Lock, 
  Search, 
  Filter, 
  Sparkles,
  CheckCircle,
  Truck,
  Eye,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  XCircle,
  Package,
  Clock,
  ArrowRight
} from "lucide-react";
import { UserStats, PurchaseHistory, Badge } from "../types";

interface DashboardTabProps {
  stats: UserStats;
  badges: Badge[];
  history: PurchaseHistory[];
  onRedeemClick: () => void;
  onNavigateToBadges: () => void;
  onCancelOrder: (id: string) => void;
}

export default function DashboardTab({
  stats,
  badges,
  history,
  onRedeemClick,
  onNavigateToBadges,
  onCancelOrder
}: DashboardTabProps) {
  const [timeframe, setTimeframe] = useState<"monthly" | "yearly">("monthly");
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Delivered" | "Shipped" | "Processing" | "Cancelled">("all");

  const [viewingOrder, setViewingOrder] = useState<PurchaseHistory | null>(null);
  const [confirmingCancelOrder, setConfirmingCancelOrder] = useState<PurchaseHistory | null>(null);

  // Filter purchase history
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Data ranges for charts
  const monthlyData = [
    { label: "Jan", co2: 1.2, active: false },
    { label: "Feb", co2: 1.8, active: false },
    { label: "Mar", co2: 1.5, active: false },
    { label: "Apr", co2: 2.1, active: false },
    { label: "May", co2: 2.4, active: true },
    { label: "Jun", co2: 0.8, active: false }
  ];

  const yearlyData = [
    { label: "2021", co2: 8.5, active: false },
    { label: "2022", co2: 12.4, active: false },
    { label: "2023", co2: 18.2, active: false },
    { label: "2024", co2: 24.1, active: true },
    { label: "2025", co2: 28.5, active: false },
    { label: "2026", co2: 32.4, active: false }
  ];

  const activeChartData = timeframe === "monthly" ? monthlyData : yearlyData;
  const maxCo2 = Math.max(...activeChartData.map(d => d.co2));

  return (
    <div className="space-y-gutter animate-fadeIn">
      {/* Hero Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Carbon Offset Card */}
        <div className="glass-card p-6 rounded-lg border-primary/15 flex flex-col justify-between transition-all hover:scale-[1.02] duration-300">
          <div>
            <span className="text-label-md text-slate-500 font-medium">Total Carbon Offset</span>
            <h2 className="font-display-lg text-primary mt-2">
              {stats.totalCarbonOffset.toFixed(1)} <span className="text-title-md font-sans text-slate-600 font-normal">tons</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full w-fit">
            <TrendingUp size={16} />
            <span className="text-label-md">+12% from last month</span>
          </div>
        </div>

        {/* Green Points Card */}
        <div className="glass-card p-6 rounded-lg border-primary/15 flex flex-col justify-between transition-all hover:scale-[1.02] duration-300">
          <div>
            <span className="text-label-md text-slate-500 font-medium">Green Points</span>
            <h2 className="font-display-lg text-primary mt-2 flex items-center gap-2">
              <Coins className="text-emerald-500" size={32} />
              {stats.greenPoints.toLocaleString()}
            </h2>
          </div>
          <button 
            onClick={onRedeemClick}
            className="w-full mt-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-primary border border-emerald-300/50 rounded-full font-semibold transition-all shadow-sm active:scale-95"
          >
            Redeem Rewards
          </button>
        </div>

        {/* Sustainability Level Card */}
        <div className="glass-card p-6 rounded-lg bg-emerald-900 dark:bg-emerald-950 text-white flex flex-col justify-between shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02] duration-300 relative overflow-hidden">
          {/* Subtle eco background watermark */}
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-3 opacity-10">
            <Leaf size={180} />
          </div>
          
          <div className="relative z-10">
            <span className="text-label-md opacity-80 font-medium">Sustainability Level</span>
            <h2 className="font-title-md mt-1 font-bold text-2xl tracking-normal text-teal-200 flex items-center gap-2">
              <Award size={24} className="text-emerald-400" />
              {stats.sustainabilityLevel}
            </h2>
          </div>
          
          <div className="relative z-10 flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <span className="material-symbols-outlined text-4xl text-teal-300 animate-pulse-soft">spa</span>
            <div className="text-right">
              <span className="text-label-sm block opacity-75 uppercase tracking-wider">Your Ranking</span>
              <span className="text-body-lg font-bold text-xl">{stats.ranking}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Charts & Analytics Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Carbon Reduction Over Time Chart */}
        <div className="lg:col-span-8 glass-card p-6 md:p-8 rounded-lg min-h-[400px] flex flex-col justify-between border-primary/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="font-title-md text-on-surface flex items-center gap-2 font-bold">
                <Leaf className="text-primary size-5" /> Carbon Reduction Over Time
              </h3>
              <p className="text-xs text-slate-500 mt-1">Your automated intelligence tracking carbon offsets over active periods.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-full p-1 border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setTimeframe("monthly")}
                className={`px-4 py-1.5 text-label-sm font-semibold rounded-full transition-all duration-300 ${timeframe === "monthly" ? "bg-primary text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setTimeframe("yearly")}
                className={`px-4 py-1.5 text-label-sm font-semibold rounded-full transition-all duration-300 ${timeframe === "yearly" ? "bg-primary text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Simulated Interactive Bar Chart using standard flexible heights */}
          <div className="flex-1 flex items-end gap-3 md:gap-4 px-2 pt-6 min-h-[220px]">
            {activeChartData.map((d, index) => {
              const heightPercent = maxCo2 > 0 ? (d.co2 / maxCo2) * 85 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3 group relative cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-slate-900 text-white text-[11px] font-mono px-2 py-1 rounded transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-20">
                    {d.co2.toFixed(1)} {timeframe === "monthly" ? "kg" : "tons"} CO₂ Saved
                  </div>

                  {/* The bar track */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200/50 dark:hover:bg-slate-850/60 rounded-t-lg h-60 flex items-end overflow-hidden border border-slate-200/20">
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ease-out ${d.active ? "bg-primary hover:bg-primary/90 animate-pulse-soft" : "bg-primary/20 group-hover:bg-primary/45"}`}
                    ></div>
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[13px] font-semibold tracking-tight ${d.active ? "text-primary font-bold" : "text-slate-500"}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by EcoLife AI Tracking</span>
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-emerald-500" /> Active carbon sensors active</span>
          </div>
        </div>

        {/* Eco Badges Box */}
        <div className="lg:col-span-4 glass-card p-6 rounded-lg flex flex-col border-primary/10">
          <div className="mb-4">
            <h3 className="font-title-md text-on-surface font-bold">Recent Badges</h3>
            <p className="text-xs text-slate-500 mt-1">Unlock badges by purchasing eco alternatives and saving CO2.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4 my-auto py-2">
            {badges.slice(0, 4).map((b) => (
              <div 
                key={b.id} 
                className={`aspect-square glass-card rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all ${
                  b.isUnlocked 
                    ? `${b.bgStyle} ${b.borderStyle}` 
                    : "bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800"
                }`}
              >
                {b.isUnlocked ? (
                  <>
                    <span className={`material-symbols-outlined font-semibold text-3xl ${b.textColor}`}>{b.icon}</span>
                    <span className={`text-xs font-bold leading-tight mt-2 line-clamp-2 ${b.textColor}`}>{b.name}</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} className="text-slate-300 dark:text-slate-600 mb-1" />
                    <span className="text-[11px] font-semibold text-slate-400">Locked</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <button 
            onClick={onNavigateToBadges}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-primary border border-slate-200 dark:border-slate-800 rounded-full text-label-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>View Badge Gallery</span>
          </button>
        </div>
      </section>

      {/* Sustainability Purchase History Section */}
      <section className="glass-card rounded-lg overflow-hidden border-slate-200/10">
        <div className="p-6 border-b border-slate-200/30 dark:border-slate-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-title-md text-on-surface font-bold">Sustainability Purchase History</h3>
            <p className="text-xs text-slate-500">Live feed tracking orders and carbon impact records.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-full text-label-md bg-transparent focus:ring-1 focus:ring-primary w-full md:w-48 text-on-surface"
              />
            </div>
            {/* Status Filter buttons */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1 text-xs border border-slate-200/50 dark:border-slate-800/50">
              {(["all", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all uppercase tracking-wider text-[10px] ${
                    statusFilter === status 
                      ? status === "Delivered"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : status === "Shipped"
                        ? "bg-blue-600 text-white shadow-sm"
                        : status === "Processing"
                        ? "bg-amber-500 text-white shadow-sm"
                        : status === "Cancelled"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-850 text-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            <p>No transactions match your search filter.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the keyword or browse the Eco Market to make a purchase!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 font-bold text-label-sm text-slate-500 uppercase tracking-wider">PRODUCT</th>
                  <th className="px-6 py-4 font-bold text-label-sm text-slate-500 uppercase tracking-wider">DATE</th>
                  <th className="px-6 py-4 font-bold text-label-sm text-slate-500 uppercase tracking-wider">CO2 SAVINGS</th>
                  <th className="px-6 py-4 font-bold text-label-sm text-slate-500 uppercase tracking-wider">POINTS EARNED</th>
                  <th className="px-6 py-4 font-bold text-label-sm text-slate-500 uppercase tracking-wider text-right">STATUS</th>
                  <th className="px-6 py-4 font-bold text-label-sm text-slate-500 uppercase tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.productName} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover shadow-sm bg-slate-100 border border-slate-200/20"
                        />
                        <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-200">{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-slate-500 font-mono">{item.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-primary font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full text-xs">
                        <span className="material-symbols-outlined text-[15px] text-primary">energy_savings_leaf</span>
                        {item.co2Saved.toFixed(1)} kg
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[14px] text-slate-700 dark:text-slate-300">+{item.pointsEarned.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                        item.status === "Delivered" 
                          ? "bg-emerald-100/85 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400" 
                          : item.status === "Shipped"
                          ? "bg-blue-100/85 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400"
                          : item.status === "Cancelled"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400"
                          : "bg-amber-100/85 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}>
                        {item.status === "Delivered" ? (
                          <CheckCircle size={10} />
                        ) : item.status === "Shipped" ? (
                          <Truck size={10} />
                        ) : item.status === "Cancelled" ? (
                          <XCircle size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* See details of order (Eye icon button) */}
                        <button
                          title="See order details"
                          onClick={() => setViewingOrder(item)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-950 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer font-bold text-xs"
                        >
                          <Eye size={13} />
                          <span>See Details</span>
                        </button>
                        
                        {/* Cancel order if eligible */}
                        {item.status !== "Delivered" && item.status !== "Cancelled" ? (
                          <button
                            title="Cancel Order"
                            onClick={() => setConfirmingCancelOrder(item)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/35 dark:hover:bg-rose-955/60 text-rose-600 hover:text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors flex items-center justify-center font-bold text-xs gap-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold px-2 py-1.5 bg-slate-100/60 dark:bg-slate-800/40 rounded-lg select-none uppercase tracking-wide">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 1. SEES THE ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 relative overflow-hidden shadow-2xl border border-slate-200/20 max-h-[92vh] overflow-y-auto flex flex-col gap-6 animate-fadeIn">
            
            {/* Close button */}
            <button 
              onClick={() => setViewingOrder(null)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 border border-slate-200/50 cursor-pointer"
            >
              <X size={15} />
            </button>

            {/* Header section with status */}
            <div className="flex items-start gap-4 pr-8 text-left">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-primary border border-emerald-200 rounded-2xl flex items-center justify-center shrink-0">
                <Package size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#006c49] bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900">
                    Eco Ledger Record
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                    viewingOrder.status === "Delivered" 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" 
                      : viewingOrder.status === "Shipped"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                      : viewingOrder.status === "Cancelled"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                  }`}>
                    {viewingOrder.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{viewingOrder.productName}</h2>
                <p className="text-[11px] font-mono text-slate-400">Order ID: #{viewingOrder.id.toUpperCase()}</p>
              </div>
            </div>

            {/* Grid metrics (CO2 Saved, Points Earned) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Carbon Offset Impact</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">energy_savings_leaf</span>
                  {viewingOrder.co2Saved.toFixed(1)} kg CO₂ Saved
                </span>
                <p className="text-[10px] text-slate-500">Prevented from grid atmospheric loading.</p>
              </div>

              <div className="space-y-1 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Eco Incentives Earned</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-teal-300 flex items-center gap-1.5">
                  <Coins size={14} className="text-emerald-500 shrink-0" />
                  +{viewingOrder.pointsEarned.toLocaleString()} Green Points
                </span>
                <p className="text-[10px] text-slate-500">Credited directly to gamified tiers.</p>
              </div>

              <div className="space-y-1 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Fulfillment Date</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  {viewingOrder.date}
                </span>
                <p className="text-[10px] text-slate-500">Timestamp logged in block registry.</p>
              </div>
            </div>

            {/* Delivery Progress Stage Track */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block text-left font-sans">Fulfillment Milestones</h3>
              
              {viewingOrder.status === "Cancelled" ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-start gap-3 text-left">
                  <XCircle size={20} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">Order Cancelled Exception</h4>
                    <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-400 font-sans">
                      This order was cancelled by request. Carbon offset contributions and active green points have been recalculated and adjusted back inside your sustainability profile. No physical product will ship.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 space-y-4">
                  {/* Graphical Step timeline */}
                  <div className="flex items-center w-full relative">
                    {/* The gray behind track */}
                    <div className="absolute left-[8%] right-[8%] top-[12px] h-1 bg-slate-100 dark:bg-slate-850 z-0"></div>
                    
                    {/* The active progress colored line */}
                    <div 
                      className="absolute left-[8%] top-[12px] h-1 bg-emerald-500 transition-all duration-700 z-0"
                      style={{
                        width: viewingOrder.status === "Delivered" 
                          ? "84%" 
                          : viewingOrder.status === "Shipped" 
                          ? "56%" 
                          : "28%"
                      }}
                    ></div>

                    {/* Step 1: Ordered */}
                    <div className="flex-1 flex flex-col items-center text-center relative z-10">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-emerald-100 dark:ring-emerald-950">
                        ✓
                      </div>
                      <span className="text-[10px] font-bold mt-2 text-slate-800 dark:text-slate-200 font-sans">Ordered</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">{viewingOrder.date}</span>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex-1 flex flex-col items-center text-center relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ring-4 ${
                        viewingOrder.status === "Processing" || viewingOrder.status === "Shipped" || viewingOrder.status === "Delivered"
                          ? "bg-emerald-500 text-white ring-emerald-100/80 dark:ring-emerald-950"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 ring-slate-50 dark:ring-slate-955"
                      }`}>
                        {viewingOrder.status === "Processing" ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        ) : "✓"}
                      </div>
                      <span className={`text-[10px] font-bold mt-2 font-sans ${
                        viewingOrder.status === "Processing" || viewingOrder.status === "Shipped" || viewingOrder.status === "Delivered"
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400"
                      }`}>Processing</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-0.5 truncate max-w-[80px]">Warehouse</span>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex-1 flex flex-col items-center text-center relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ring-4 ${
                        viewingOrder.status === "Shipped" || viewingOrder.status === "Delivered"
                          ? "bg-emerald-500 text-white ring-emerald-100/80 dark:ring-emerald-950"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 ring-slate-50 dark:ring-slate-955"
                      }`}>
                        {viewingOrder.status === "Shipped" ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        ) : viewingOrder.status === "Delivered" ? "✓" : "3"}
                      </div>
                      <span className={`text-[10px] font-bold mt-2 font-sans ${
                        viewingOrder.status === "Shipped" || viewingOrder.status === "Delivered"
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400"
                      }`}>Shipped</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-sans">EV Transit</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex-1 flex flex-col items-center text-center relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ring-4 ${
                        viewingOrder.status === "Delivered"
                          ? "bg-emerald-500 text-white ring-emerald-100/80 dark:ring-emerald-955"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500 ring-slate-50 dark:ring-slate-955"
                      }`}>
                        {viewingOrder.status === "Delivered" ? "✓" : "4"}
                      </div>
                      <span className={`text-[10px] font-bold mt-2 font-sans ${
                        viewingOrder.status === "Delivered" ? "text-slate-800 dark:text-slate-200" : "text-slate-400"
                      }`}>Delivered</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-sans">Arrived</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zero-waste delivery details notes and image showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3 bg-white dark:bg-slate-900 text-left">
                <img 
                  src={viewingOrder.image} 
                  alt={viewingOrder.productName} 
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover shadow bg-slate-100 border border-slate-200 shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">Carbon Accounting Item</h4>
                  <p className="text-[11px] text-slate-400 truncate">1 unit of physical inventory sourced ethically.</p>
                  <p className="text-[11.5px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">Audit Status: Verified</p>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-1 bg-emerald-500/5 dark:bg-emerald-400/5 text-left">
                <h4 className="text-[10px] font-extrabold text-[#006c49] dark:text-emerald-450 uppercase tracking-widest font-sans font-bold">Ethical Logistics Note</h4>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-sans">
                  Shipped in 100% compostable mycelium packaging. Our deliveries produce zero plastic waste and are routing-optimized to decrease footprint.
                </p>
              </div>
            </div>

            {/* Modal actions panel footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="text-[10px] font-mono text-slate-400">
                Logged securely using EcoKart block protocol
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {viewingOrder.status !== "Delivered" && viewingOrder.status !== "Cancelled" && (
                  <button
                    onClick={() => {
                      setConfirmingCancelOrder(viewingOrder);
                      setViewingOrder(null);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Cancel This Order</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingOrder(null)}
                  className="flex-1 sm:flex-initial px-6 py-2 bg-slate-900 hover:bg-slate-850 text-white dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. CONFIRM CANCEL ORDER WARNING MODAL */}
      {confirmingCancelOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 relative overflow-hidden shadow-2xl border border-rose-250 text-center space-y-5 animate-scaleUp">
            <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center text-rose-600 border border-rose-200">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Order Cancellation?</h3>
              <p className="text-xs text-slate-500 leading-normal font-sans">
                You are about to cancel your order of <strong className="text-slate-800 dark:text-slate-200 font-bold">"{confirmingCancelOrder.productName}"</strong>.
              </p>
            </div>

            {/* Dynamic penalty/impact panel */}
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 rounded-2xl text-left text-xs text-slate-650 space-y-2 font-medium">
              <span className="text-[10px] uppercase tracking-wide font-extrabold text-rose-800 dark:text-rose-300 block font-sans">SOCIETY & ACCOUNTING IMPACTS:</span>
              <div className="flex gap-1.5 font-sans">
                <span className="text-rose-600 shrink-0">●</span>
                <p>Your Green Points balance will be reduced by <strong className="text-rose-700 dark:text-rose-400 font-bold">-{confirmingCancelOrder.pointsEarned.toLocaleString()} pts</strong>.</p>
              </div>
              <div className="flex gap-1.5 font-sans font-sans">
                <span className="text-rose-600 shrink-0">●</span>
                <p>Your carbon ledger will reverse savings of <strong className="text-rose-700 dark:text-rose-400 font-bold">-{confirmingCancelOrder.co2Saved.toFixed(1)} kg</strong> of CO₂.</p>
              </div>
              <div className="flex gap-1.5 font-sans">
                <span className="text-rose-600 shrink-0">●</span>
                <p>The shipping inventory route will immediately receive warehouse termination protocol.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingCancelOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 hover:text-slate-800 dark:text-slate-350 font-bold text-xs tracking-wider uppercase rounded-xl transition-all border dark:border-slate-700 cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                onClick={() => {
                  onCancelOrder(confirmingCancelOrder.id);
                  setConfirmingCancelOrder(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer"
              >
                Yes, Cancel Order
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
