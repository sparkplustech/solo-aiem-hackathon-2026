import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { 
  Sparkles, 
  BookOpen, 
  Timer, 
  CalendarDays, 
  TrendingUp, 
  Flame, 
  HelpCircle,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Play
} from "lucide-react";
import { motion } from "motion/react";
import { AcademicAssignment, SummaryNote, StudyPlan } from "../types";

interface DashboardProps {
  onNavigate: (view: string) => void;
  onSetSelectText?: (text: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSetSelectText }) => {
  const { user, profile } = useAuth();
  const [latestNotes, setLatestNotes] = useState<SummaryNote[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState<AcademicAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real records from Firestore matching this logged-in student
  useEffect(() => {
    if (!user) return;

    const fetchWorkspaceData = async () => {
      try {
        // 1. Fetch latest notes summaries
        const notesQuery = query(
          collection(db, "summaries"),
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const notesSnap = await getDocs(notesQuery);
        const notesList: SummaryNote[] = [];
        notesSnap.forEach((doc) => {
          notesList.push({ id: doc.id, ...doc.data() } as SummaryNote);
        });
        setLatestNotes(notesList);

        // 2. Fetch latest study planner config
        const planQuery = query(
          collection(db, "planner"),
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const planSnap = await getDocs(planQuery);
        if (!planSnap.empty) {
          const planDoc = planSnap.docs[0];
          setActivePlan({ id: planDoc.id, ...planDoc.data() } as StudyPlan);
        }

        // 3. Fetch incomplete assignments sorted by near deadlines
        const assignQuery = query(
          collection(db, "assignments"),
          where("ownerId", "==", user.uid),
          where("progress", "<", 100),
          orderBy("deadline", "asc"),
          limit(3)
        );
        const assignSnap = await getDocs(assignQuery);
        const assignList: AcademicAssignment[] = [];
        assignSnap.forEach((doc) => {
          assignList.push({ id: doc.id, ...doc.data() } as AcademicAssignment);
        });
        setUpcomingAssignments(assignList);

      } catch (err) {
        console.warn("Firestore collection loading warning (indexes may still be deploying default):", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [user]);

  // Strategic AI recommendations coach
  const getAIRecommendation = () => {
    if (upcomingAssignments.length > 0) {
      const near = upcomingAssignments[0];
      return `Critical assignment pending: **${near.title}** under **${near.subject}** is due by **${near.deadline}**. Let's trigger a 45-minute Focus Session inside the Pomodoro timer to knock out some sections!`;
    }
    if (activePlan && activePlan.weakSubjects && activePlan.weakSubjects.length > 0) {
      return `Your weak area **${activePlan.weakSubjects[0]}** represents a big study priority. Leverage the AI Quiz generator to practice questions and harden your vocabulary now.`;
    }
    if (latestNotes.length > 0) {
      return `You recently summarized **${latestNotes[0].title}**. We recommend launching a practice quiz to reinforce key terms and active recall.`;
    }
    return "Your academic autopilot is running clean! Start the **Best Demo Flow** by uploading course notes, setting planner goals, or playing review quizzes.";
  };

  // Helper to derive human days remaining
  const getDaysRemaining = (deadline: string) => {
    const due = new Date(deadline);
    const now = new Date();
    // Normalize times
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    if (days === 0) return { label: "DUETODAY", color: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" };
    if (days < 0) return { label: "OVERDUE", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (days === 1) return { label: "1 Day Left", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: `${days} Days Left`, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none bg-[#0F172A] min-h-screen">
      
      {/* Welcome Board with AI insights */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 rounded-3xl border border-slate-800 bg-[#1E293B]/40 backdrop-blur-md p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(99,102,241,0.03)] hover:border-slate-700/60 transition-colors">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Active Academic Copilot</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Syllabus Core: <span className="text-indigo-400">Online</span>
            </h1>
            <p className="text-xs text-slate-450 mt-2 leading-relaxed">
              Welcome back, <strong className="text-slate-250">{profile?.displayName || "Student Pioneer"}</strong>. 
              AutoPilot OS has compiled your study vectors. Track details in real-time below.
            </p>
          </div>

          {/* AI Insights board */}
          <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-start space-x-3">
            <div className="bg-indigo-500/10 p-1.5 rounded text-indigo-400 border border-indigo-500/20 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono">Academic Coach Insight</h4>
              <p 
                className="text-xs text-slate-300 mt-1.5 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: getAIRecommendation().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </div>
          </div>
        </div>

        {/* Productivity score gauge card */}
        <div className="w-full lg:w-80 rounded-3xl border border-slate-800 bg-[#1E293B]/40 backdrop-blur-md p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.03)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Productivity Index</span>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-4xl font-black text-white font-mono">{profile?.focusScore || 100}</h2>
              <span className="text-xs text-indigo-400 font-semibold">/100 FPS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/60 text-center text-xs">
            <div className="bg-[#0F172A]/80 border border-slate-900 rounded-xl p-2.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Streak Days</span>
              <div className="flex items-center justify-center space-x-1.5 text-orange-405 font-extrabold text-orange-400">
                <Flame className="h-4 w-4 fill-orange-400" />
                <span>{profile?.streak || 1} Days</span>
              </div>
            </div>
            <div className="bg-[#0F172A]/80 border border-slate-900 rounded-xl p-2.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Total study</span>
              <div className="flex items-center justify-center space-x-1.5 text-indigo-400 font-extrabold">
                <Clock className="h-4 w-4" />
                <span>{profile?.totalStudyHours || 0} hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Flow Assist Notification */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-slate-900/10 to-transparent p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_35px_rgba(99,102,241,0.04)]">
        <div className="flex items-center space-x-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Live Hackathon Judges Demo Walkthrough Guide</h4>
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
              Click “AI Note Summary” &gt; Upload PDF notes &gt; Send. The system extracts summaries, keys, and activates interactive quizzes, tasks, and agendas instantly!
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("upload")}
          className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 px-4 py-2 rounded-xl font-mono font-bold shrink-0 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <span>Step 1: Summarize Lecture Notes</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Bento Grid Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Quick actions box (12 grids -> 4 width) */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-[#1E293B]/30 p-5 shadow-[0_0_30px_rgba(99,102,241,0.02)]">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-4 px-1">Quick Command Center</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate("upload")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A]/80 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/20 transition-all text-left cursor-pointer group"
                id="qa-summarize"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-500/10 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/15">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">AI PDF Summary</h4>
                    <p className="text-[10px] text-slate-500">Inject note books & chapters</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate("planner")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A]/80 hover:bg-slate-850 border border-slate-800/80 hover:border-violet-500/20 transition-all text-left cursor-pointer group"
                id="qa-planner"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-violet-500/10 text-violet-400 p-2.5 rounded-xl border border-violet-500/15">
                    <CalendarDays className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Smart Study Planner</h4>
                    <p className="text-[10px] text-slate-500">Generate learning timetables</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-violet-400 transition-all group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate("calendar")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A]/80 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/20 transition-all text-left cursor-pointer group"
                id="qa-calendar"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-sky-500/10 text-sky-400 p-2.5 rounded-xl border border-sky-500/15">
                    <CalendarDays className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Calendar Viewport</h4>
                    <p className="text-[10px] text-slate-500">Visualize deadlines & study hours</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-sky-400 transition-all group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate("focus")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A]/80 hover:bg-slate-850 border border-slate-800/80 hover:border-rose-500/20 transition-all text-left cursor-pointer group"
                id="qa-focus"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-rose-500/10 text-rose-400 p-2.5 rounded-xl border border-rose-500/15 home-focal-icon">
                    <Timer className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Focal Room & Pomodoro</h4>
                    <span className="text-[10px] text-slate-500">Engage isolated hours</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-rose-400 transition-all group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic deadlines countdown panel */}
        <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* List of pending tasks sorted by urgency */}
          <div className="rounded-3xl border border-slate-800 bg-[#1E293B]/30 p-6 flex flex-col justify-between min-h-[300px] shadow-[0_0_30px_rgba(99,102,241,0.02)]">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">Urgent Assignments</h3>
                <button 
                  onClick={() => onNavigate("assignments")}
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Manage Tasks
                </button>
              </div>

              {upcomingAssignments.length === 0 ? (
                <div className="text-center p-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-[#0F172A]/40">
                  <Clock className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                  <p>All academic tasks secured.</p>
                  <button 
                    onClick={() => onNavigate("assignments")}
                    className="text-[10px] text-indigo-400 font-bold mt-2 hover:underline"
                  >
                    + Parse assignment briefing
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingAssignments.map((assign) => {
                    const daysRemaining = getDaysRemaining(assign.deadline);
                    return (
                      <div 
                        key={assign.id}
                        className="bg-[#0F172A]/80 border border-slate-800/85 rounded-xl p-3 flex items-center justify-between hover:border-slate-700/80 transition-all"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 max-w-[150px] truncate">{assign.title}</h4>
                          <span className="text-[9px] font-mono text-indigo-400 mt-1 uppercase block">{assign.subject}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border ${daysRemaining.color}`}>
                          {daysRemaining.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {upcomingAssignments.length > 0 && (
              <div className="text-[9px] text-slate-500 font-mono tracking-wider border-t border-slate-800/60 pt-3 mt-4">
                Tip: Complete assignment tasks to boost your academic Focus score!
              </div>
            )}
          </div>

        {/* Recent note summaries */}
        <div className="rounded-3xl border border-slate-800 bg-[#1E293B]/30 p-6 flex flex-col justify-between min-h-[300px] shadow-[0_0_30px_rgba(99,102,241,0.02)]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">Recent Note Artifacts</h3>
              <button 
                onClick={() => onNavigate("upload")}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold"
              >
                Summarizer
              </button>
            </div>

            {latestNotes.length === 0 ? (
              <div className="text-center p-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-[#0F172A]/40">
                <FileText className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                <p>Course notes index empty.</p>
                <button 
                  onClick={() => onNavigate("upload")}
                  className="text-[10px] text-indigo-400 font-bold mt-2 hover:underline"
                >
                  + Analyze Lecture PDF Code
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {latestNotes.map((note) => (
                  <div 
                    key={note.id}
                    onClick={() => {
                      if (onSetSelectText) {
                        onSetSelectText(note.summary);
                      }
                      onNavigate("upload");
                    }}
                    className="bg-[#0F172A]/80 hover:bg-slate-850 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:translate-x-0.5 hover:border-slate-700"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/10 shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{note.title}</h4>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{note.summary}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 shrink-0">Review</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {latestNotes.length > 0 && (
            <div className="text-[9px] text-slate-500 font-mono tracking-wider border-t border-slate-800/60 pt-3 mt-4">
              Tip: Click any note artifact at any time to open full detailed summaries!
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
);
};
