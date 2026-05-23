import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store';
import { ThemeVariant } from '../types';
import {
  Camera, Trophy, Droplets, MapPin, Upload, User, FileText,
  Shield, Medal, Star, ThumbsUp, ThumbsDown, RefreshCw,
  CheckCircle2, AlertTriangle, Clock, ArrowUp, ArrowDown, Heart
} from 'lucide-react';

const BACKEND = 'http://localhost:8000/reports';

// Persistent anonymous voter ID stored in sessionStorage
function getVoterId(): string {
  let id = sessionStorage.getItem('fv_voter_id');
  if (!id) {
    id = 'voter-' + Math.random().toString(36).slice(2, 11);
    sessionStorage.setItem('fv_voter_id', id);
  }
  return id;
}

interface FloodReport {
  id: number;
  reporter_name: string;
  location_name: string;
  lat: number;
  lng: number;
  photo_url: string | null;
  water_depth_estimate: number;
  description: string;
  status: string;
  validation_score: number;
  gemini_notes: string;
  upvotes: number;
  downvotes: number;
  net_votes: number;
  points_awarded: number;
  created_at: string;
}

interface LeaderboardEntry {
  id: number;
  reporter_name: string;
  total_points: number;
  badge_level: string;
  total_reports: number;
  accurate_reports: number;
  accuracy_pct: number;
}

interface Stats {
  total_flood_reports: number;
  validated_reports: number;
  pending_reports: number;
  total_drain_reports: number;
  total_reporters: number;
  guardians: number;
}

const BADGE_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  guardian: { icon: <Shield className="h-3.5 w-3.5" />, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40', label: 'Flood Guardian' },
  reporter: { icon: <Medal className="h-3.5 w-3.5" />,  color: 'text-blue-400 bg-blue-500/20 border-blue-500/40',    label: 'Reporter'       },
  rookie:   { icon: <Star className="h-3.5 w-3.5" />,   color: 'text-slate-400 bg-slate-500/20 border-slate-500/40', label: 'Rookie'         },
};

const STATUS_META: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  validated: { color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Validated' },
  pending:   { color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',   icon: <Clock className="h-3.5 w-3.5" />,         label: 'Pending'   },
  rejected:  { color: 'text-red-400 bg-red-500/20 border-red-500/40',            icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Rejected'  },
};

export default function ReportView() {
  const { activeLayout, showToast } = useAppStore();
  const isGlass = activeLayout === ThemeVariant.GLASSMORPHISM;
  const panelBase = isGlass
    ? 'bg-[#0d1117]/60 backdrop-blur-xl border border-white/10'
    : 'bg-[#141313] border border-white/5';

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'feed' | 'submit' | 'leaderboard'>('feed');

  // ── Live Data ──────────────────────────────────────────────────────────────
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [rRes, lRes, sRes] = await Promise.all([
        fetch(`${BACKEND}/api/reports/?limit=30`),
        fetch(`${BACKEND}/api/leaderboard/?limit=20`),
        fetch(`${BACKEND}/api/stats/`),
      ]);
      if (!rRes.ok || !lRes.ok || !sRes.ok) throw new Error('API error');
      const [rData, lData, sData] = await Promise.all([rRes.json(), lRes.json(), sRes.json()]);
      setReports(rData.results);
      setLeaderboard(lData.results);
      setStats(sData);
      setBackendError(false);
    } catch {
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 5000); // poll every 5s for real-time
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchAll]);

  // ── Vote ───────────────────────────────────────────────────────────────────
  const vote = async (reportId: number, v: 'up' | 'down') => {
    try {
      const res = await fetch(`${BACKEND}/api/reports/${reportId}/vote/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: getVoterId(), vote: v }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, upvotes: data.upvotes, downvotes: data.downvotes, net_votes: data.net_votes } : r));
    } catch {
      showToast('Could not record vote — backend may be offline.');
    }
  };

  // ── Submit Form ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    reporter_name: '',
    location_name: '',
    lat: '',
    lng: '',
    water_depth_estimate: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reporter_name || !form.location_name) {
      showToast('Name and location are required.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('reporter_name', form.reporter_name);
      fd.append('location_name', form.location_name);
      fd.append('lat', form.lat || '15.5938');
      fd.append('lng', form.lng || '73.8035');
      fd.append('water_depth_estimate', form.water_depth_estimate || '0');
      fd.append('description', form.description);
      if (fileRef.current?.files?.[0]) {
        fd.append('photo', fileRef.current.files[0]);
      }

      const res = await fetch(`${BACKEND}/api/reports/`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data: FloodReport = await res.json();
      setSubmitSuccess(true);
      setForm({ reporter_name: '', location_name: '', lat: '', lng: '', water_depth_estimate: '', description: '' });
      if (fileRef.current) fileRef.current.value = '';
      showToast(`Report submitted! Status: ${data.status} · Points earned: ${data.points_awarded}`);
      fetchAll();
      setTimeout(() => { setSubmitSuccess(false); setActiveTab('feed'); }, 2500);
    } catch {
      showToast('Submission failed — is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative space-y-6 no-scrollbar text-white bg-[#05070a]">
      {/* Ambient */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-rose-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1300px] mx-auto space-y-6">

        {/* Header */}
        <header className="border-b border-white/10 pb-6 flex flex-col xl:flex-row justify-between gap-4 xl:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-pink-400" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
                Flood <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">Reports</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                Live Data · 5s Refresh
              </span>
              {backendError && <span className="text-red-400">⚠ Backend Offline</span>}
              {loading && <RefreshCw className="h-3 w-3 animate-spin text-slate-500" />}
            </div>
          </div>

          {/* Stats strip */}
          {stats && (
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { v: stats.total_flood_reports, label: 'Total Reports',   color: 'text-pink-400'    },
                { v: stats.validated_reports,   label: 'Validated',       color: 'text-emerald-400' },
                { v: stats.total_reporters,     label: 'Reporters',       color: 'text-yellow-400'  },
                { v: stats.guardians,           label: 'Guardians',       color: 'text-orange-400'  },
              ].map(s => (
                <div key={s.label} className={`${panelBase} rounded-xl px-4 py-2.5 text-center min-w-[90px]`}>
                  <p className={`text-2xl font-black font-mono ${s.color}`}>{s.v}</p>
                  <p className="text-[9px] font-mono text-slate-500 uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Tab Bar */}
        <div className={`${panelBase} rounded-2xl overflow-hidden`}>
          <div className="flex border-b border-white/10 bg-black/20 overflow-x-auto no-scrollbar">
            {[
              { id: 'feed' as const,        label: 'Live Feed',   icon: <RefreshCw className="h-4 w-4" />,  color: 'text-pink-400 border-pink-400'    },
              { id: 'submit' as const,      label: 'Submit Report',icon: <Upload className="h-4 w-4" />,    color: 'text-cyan-400 border-cyan-400'    },
              { id: 'leaderboard' as const, label: 'Leaderboard', icon: <Trophy className="h-4 w-4" />,    color: 'text-yellow-400 border-yellow-400'},
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? `${tab.color} bg-white/5`
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── LIVE FEED ── */}
            {activeTab === 'feed' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-pink-300 text-lg">Community Reports</h3>
                  <button onClick={fetchAll} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white font-mono transition-colors cursor-pointer">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </button>
                </div>

                {backendError && (
                  <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                    <p className="font-bold text-red-300">Backend Offline</p>
                    <p className="text-sm text-slate-400 mt-1 font-mono">Start the Django server at localhost:8000 to see real reports.</p>
                    <code className="block mt-3 bg-black/40 px-4 py-2 rounded-lg text-xs text-slate-300 font-mono">
                      python manage.py runserver 0.0.0.0:8000
                    </code>
                  </div>
                )}

                {!backendError && reports.length === 0 && !loading && (
                  <div className="p-8 text-center text-slate-500">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-mono text-sm">No reports yet — be the first!</p>
                  </div>
                )}

                <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
                  {reports.map(report => {
                    const sm = STATUS_META[report.status] || STATUS_META.pending;
                    return (
                      <div key={report.id} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <span className="font-bold text-sm text-white">{report.location_name}</span>
                              <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${sm.color}`}>
                                {sm.icon} {sm.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1"><User className="h-3 w-3" />{report.reporter_name}</span>
                              <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-cyan-400" />{report.water_depth_estimate}cm depth</span>
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-pink-400" />{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(report.created_at).toLocaleString()}</span>
                            </div>
                            {report.description && (
                              <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{report.description}</p>
                            )}
                            {report.gemini_notes && (
                              <p className="text-[10px] font-mono text-purple-300/70 mt-1 italic">{report.gemini_notes}</p>
                            )}
                          </div>
                          {/* Points badge */}
                          {report.points_awarded > 0 && (
                            <div className="flex-shrink-0 text-center">
                              <p className="text-lg font-black font-mono text-yellow-400">+{report.points_awarded}</p>
                              <p className="text-[9px] font-mono text-slate-500">pts</p>
                            </div>
                          )}
                        </div>

                        {/* Voting row */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                          <button
                            onClick={() => vote(report.id, 'up')}
                            className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer px-3 py-1 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> {report.upvotes}
                          </button>
                          <button
                            onClick={() => vote(report.id, 'down')}
                            className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer px-3 py-1 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" /> {report.downvotes}
                          </button>
                          <div className={`flex items-center gap-1 text-xs font-mono ml-auto ${report.net_votes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {report.net_votes >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(report.net_votes)} net
                          </div>
                          {report.validation_score > 0 && (
                            <span className="text-[10px] font-mono text-purple-400 ml-2">
                              AI: {(report.validation_score * 100).toFixed(0)}% confident
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SUBMIT ── */}
            {activeTab === 'submit' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-cyan-300 mb-1">Submit a Flood Report</h3>
                  <p className="text-sm text-slate-400 font-mono">Your report will be auto-validated and pinned on the live community map.</p>
                </div>

                {submitSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="font-bold text-emerald-300">Report submitted successfully!</p>
                      <p className="text-xs text-slate-400 font-mono">Redirecting to feed…</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Your Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={form.reporter_name}
                          onChange={e => setForm(f => ({ ...f, reporter_name: e.target.value }))}
                          placeholder="e.g. Priya Sharma"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Location Name *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={form.location_name}
                          onChange={e => setForm(f => ({ ...f, location_name: e.target.value }))}
                          placeholder="e.g. Mapusa Market"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.lat}
                        onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                        placeholder="15.5938"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={form.lng}
                        onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                        placeholder="73.8035"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Water Depth (cm)</label>
                      <div className="relative">
                        <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500" />
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={form.water_depth_estimate}
                          onChange={e => setForm(f => ({ ...f, water_depth_estimate: e.target.value }))}
                          placeholder="e.g. 30"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Description</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Describe the flood situation, road conditions, hazards..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Photo (Gemini Vision Validates)</label>
                    <div
                      className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Camera className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Click to upload flood photo</p>
                      <p className="text-xs text-slate-600 font-mono mt-1">JPG, PNG, WebP · Gemini Vision analyzes it</p>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-pink-600/40 to-rose-600/30 hover:from-pink-600/60 hover:to-rose-600/50 border border-pink-500/40 text-pink-200 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting…</>
                      : <><Upload className="h-4 w-4" /> Submit Flood Report</>
                    }
                  </button>
                </form>
              </div>
            )}

            {/* ── LEADERBOARD ── */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-yellow-300 text-lg">Community Leaderboard</h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Real Data · Live
                  </div>
                </div>

                {backendError ? (
                  <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                    <p className="font-bold text-red-300">Backend Offline</p>
                    <p className="text-sm text-slate-400 mt-1 font-mono">Start the Django server to see real leaderboard data.</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="font-mono text-sm">No reporters yet — submit a report to join!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((person, i) => {
                      const badge = BADGE_META[person.badge_level] || BADGE_META.rookie;
                      return (
                        <div key={person.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                          i < 3 ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/3 border-white/5 hover:bg-white/5'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black font-mono flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-400 text-black' :
                            i === 1 ? 'bg-slate-300 text-black' :
                            i === 2 ? 'bg-orange-400 text-black' :
                            'bg-white/10 text-white'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{person.reporter_name}</p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {person.total_reports} reports · {person.accuracy_pct}% accuracy
                            </p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold flex-shrink-0 ${badge.color}`}>
                            {badge.icon}
                            <span className="hidden sm:inline">{badge.label}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-black font-mono text-yellow-400">{person.total_points}</p>
                            <p className="text-[9px] font-mono text-slate-500">pts</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
