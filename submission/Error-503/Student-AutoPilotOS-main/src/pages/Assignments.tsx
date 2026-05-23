import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { extractAssignment } from "../services/api";
import { 
  CheckSquare, 
  Sparkles, 
  Trash2, 
  CalendarDays, 
  Clock, 
  Plus, 
  FileCheck, 
  AlertCircle, 
  Check, 
  BookOpen, 
  TrendingUp,
  Sliders,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { AcademicAssignment } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface AssignmentsProps {
  onNavigate: (view: string) => void;
  onUpdateCount?: (count: number) => void;
}

export const Assignments: React.FC<AssignmentsProps> = ({ onNavigate, onUpdateCount }) => {
  const { user } = useAuth();
  const [list, setList] = useState<AcademicAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);

  // Form parameters
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "assignments"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      const temp: AcademicAssignment[] = [];
      snap.forEach(doc => {
        temp.push({ id: doc.id, ...doc.data() } as AcademicAssignment);
      });
      setList(temp);
      if (onUpdateCount) {
        onUpdateCount(temp.filter(a => a.progress < 100).length);
      }
    } catch (err) {
      console.warn("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  // Handle manual addition
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !deadline) {
      toast.error("Please fill out Title, Subject, and Deadline parameters!");
      return;
    }

    if (!user) return;

    try {
      await addDoc(collection(db, "assignments"), {
        ownerId: user.uid,
        title: title.trim(),
        subject: subject.trim(),
        deadline: deadline,
        progress: progress,
        priority: priority,
        createdAt: serverTimestamp()
      });
      
      toast.success("Assignment logged successfully!");
      clearForm();
      fetchAssignments();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "assignments");
    }
  };

  // Drag of PDF extraction
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const docFile = e.target.files[0];
      setExtracting(true);
      toast.loading("Analyzing assignment instructions PDF...", { id: "exLoader" });

      try {
        const extracted = await extractAssignment(docFile);
        setTitle(extracted.title || "Calculus Homework Solutions");
        setSubject(extracted.subject || "Mathematics");
        setDeadline(extracted.deadline || new Date().toISOString().split("T")[0]);
        setPriority(extracted.priority || "High");
        
        toast.dismiss("exLoader");
        toast.success("AI Extracted assignment variables correctly!", { duration: 4000 });
      } catch (err: any) {
        toast.dismiss("exLoader");
        toast.error(err.message || "Failed to parse assignment instructions.");
      } finally {
        setExtracting(false);
      }
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "assignments", id));
      toast.success("Assignment removed.");
      fetchAssignments();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "assignments");
    }
  };

  // Adjust progress bar
  const handleUpdateProgress = async (id: string, newProgress: number) => {
    try {
      await updateDoc(doc(db, "assignments", id), {
        progress: newProgress
      });
      setList(prev => prev.map(item => item.id === id ? { ...item, progress: newProgress } : item));
      if (onUpdateCount) {
        onUpdateCount(list.filter(a => a.id !== id || newProgress < 100).filter(a => a.progress < 100).length);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "assignments");
    }
  };

  const clearForm = () => {
    setTitle("");
    setSubject("");
    setDeadline("");
    setProgress(0);
    setPriority("Medium");
  };

  // Helper to derive human days remaining
  const getDaysRemainingLabel = (deadline: string) => {
    const due = new Date(deadline);
    const now = new Date();
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    if (days === 0) return { text: "Due Today", classes: "text-red-400 bg-red-400/10 border-red-500/20" };
    if (days < 0) return { text: "Overdue", classes: "text-rose-500 bg-rose-500/10 border-rose-500/20 font-bold" };
    if (days === 1) return { text: "1 day left", classes: "text-amber-400 bg-amber-400/10 border-amber-400/25" };
    return { text: `${days} days left`, classes: "text-slate-400 bg-slate-900 border-slate-800" };
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 select-none bg-slate-950/10 min-h-screen">
      
      {/* Header board */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <CheckSquare className="h-4 w-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold font-semibold">Deliverable Tracker</span>
        </div>
        <h1 className="text-2xl font-black text-white">Academic Assignment Hub</h1>
        <p className="text-xs text-slate-450 mt-1">
          Enlist school homework briefs or upload instructions PDFs. Gemini automatically scrapes deadlines, targets, and course categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Add Form (Takes 4 grids) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">Add Assignment</h3>
            
            {/* Extremely High Value Bonus: PDF Deadline auto extractor helper */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-3 rounded-lg border border-indigo-500/15">
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wide block mb-1 flex items-center space-x-1">
                <Sparkles className="h-3 w-3 animate-spin" />
                <span>AI Core Extraction</span>
              </span>
              <p className="text-[10px] text-slate-400 leading-normal mb-2.5">Upload a homework instructions briefing, assignment PDF, or syllabus page to auto-complete this form!</p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePdfUpload}
                accept=".pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={extracting}
                className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 text-[10px] font-mono font-bold py-2 rounded transition-all cursor-pointer"
                id="pdf-extract-trigger"
              >
                {extracting ? "Extracting Parameters..." : "Upload Assignment PDF"}
              </button>
            </div>

            {/* Manual Form inputs */}
            <form onSubmit={handleAddManual} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Assignment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Lab report"
                  className="w-full bg-slate-900 border border-slate-800/85 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40"
                  id="assign-title-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Subject Course Category</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full bg-slate-900 border border-slate-800/85 rounded px-3 py-2 text-xs text-white focus:outline-none"
                  id="assign-subject-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Deadline Target Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800/85 rounded px-3 py-2 text-xs text-white uppercase font-mono"
                  id="assign-deadline-input"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Priority Rating</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  {(["High", "Medium", "Low"] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 rounded text-[9px] font-mono font-bold transition-all ${
                        priority === p ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 py-3 text-xs font-bold shadow-lg shadow-indigo-500/15 transition-all text-center cursor-pointer"
                id="assign-submit-btn"
              >
                Log Assignment
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Active Table Task list (Takes 8 grids) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 flex flex-col min-h-[400px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-4 border-b border-slate-900 pb-2">Active Syllabus Homework</h3>
            
            {loading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <LoadingSpinner label="Loading homework matrix..." />
              </div>
            ) : list.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-center text-xs text-slate-550 border border-dashed border-slate-900 rounded-xl bg-slate-950/20">
                <Check className="h-8 w-8 text-slate-750 mb-2" />
                <p>No active assignments. All milestones cleared!</p>
              </div>
            ) : (
              <div className="space-y-3.5 flex-1">
                {list.map(item => {
                  const daysLeft = getDaysRemainingLabel(item.deadline);
                  const is100 = item.progress >= 100;

                  return (
                    <div 
                      key={item.id}
                      className={`border rounded-xl p-4 transition-all hover:translate-x-0.5 ${
                        is100 ? "border-slate-900 bg-slate-950/30 opacity-60" : "border-slate-800/80 bg-slate-900"
                      }`}
                      id={`assign-item-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="overflow-hidden">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-xs font-bold text-slate-200 truncate max-w-[200px] ${is100 ? "line-through text-slate-450" : ""}`}>
                              {item.title}
                            </h4>
                            <span className="text-[9px] font-mono text-indigo-400 uppercase bg-slate-950 px-2 py-0.5 border border-slate-900 rounded">
                              {item.subject}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-[10px] text-slate-500 font-mono">
                            <div className="flex items-center space-x-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{item.deadline}</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${daysLeft.classes}`}>
                              {daysLeft.text}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleDeleteAssignment(item.id)}
                            className="rounded p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-950/60 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Progress adjustment track */}
                      <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-center text-[9px] font-mono text-slate-450 mb-1">
                            <span>Adjust Completion Progress</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Sliders className="h-3 w-3 text-indigo-400" />
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={10}
                              value={item.progress}
                              onChange={e => handleUpdateProgress(item.id, Number(e.target.value))}
                              className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Done status icon */}
                        {is100 ? (
                          <div className="bg-emerald-500/10 text-emerald-400 rounded-full p-2 border border-emerald-500/20 shrink-0">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateProgress(item.id, 100)}
                            className="text-[9px] font-mono font-bold bg-slate-950 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-850 hover:border-emerald-500/20 px-2.5 py-1.5 rounded transition-all cursor-pointer shrink-0"
                          >
                            Mark Terminated
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
