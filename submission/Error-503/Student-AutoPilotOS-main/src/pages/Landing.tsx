import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Sparkles, 
  Brain, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  Terminal, 
  Cpu, 
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
  CheckCircle,
  MessageSquare,
  Activity,
  Star
} from "lucide-react";
import { motion } from "motion/react";

interface LandingProps {
  onNavigate: (view: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const { loginWithGoogle, user } = useAuth();

  const handleStart = () => {
    if (user) {
      onNavigate("dashboard");
    } else {
      onNavigate("login");
    }
  };

  const featureCards = [
    {
      icon: Brain,
      title: "AI Note Summarizer",
      description: "Upload textbook PDFs or copy-paste lecture slides. AutoPilot extracts critical nodes, core summaries, exam prep notes, and math formulas with absolute zero effort.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/5",
      border: "border-indigo-500/20",
      targetView: "upload"
    },
    {
      icon: MessageSquare,
      title: "AutoPilot Supervisor AI",
      description: "A persistent virtual AI supervisor. Chat directly with your notes, ask for urgent syllabus test revisions, or check which assignments are currently overdue.",
      color: "text-violet-400",
      bg: "bg-violet-500/5",
      border: "border-violet-500/20",
      targetView: "dashboard"
    },
    {
      icon: Cpu,
      title: "Weak Spot Study Planner",
      description: "No more rigid schedules. Inputs your course list, exam timeline, and weak subjects, and AI automatically constructs a flexible revision planner.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      targetView: "planner"
    },
    {
      icon: FileCheck,
      title: "Syllabus Extractor",
      description: "Drop assignment PDF rules or homework instructions. AutoPilot automatically parses deadlines, sets priority queues, and populates your calendar.",
      color: "text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      targetView: "assignments"
    },
    {
      icon: Clock,
      title: "Calm Pomodoro Stream",
      description: "Tackle burnout with beautiful responsive full-screen workrooms, customizable timer controls, focus streaks, and ambient mindfulness vibes.",
      color: "text-rose-400",
      bg: "bg-rose-500/5",
      border: "border-rose-500/20",
      targetView: "focus"
    },
    {
      icon: TrendingUp,
      title: "SaaS Analytics & Heatmaps",
      description: "Monitor daily study times, quiz metrics, and submission rates. AutoPilot provides smart feedback cards telling you exactly how to study smarter.",
      color: "text-sky-400",
      bg: "bg-sky-500/5",
      border: "border-sky-500/20",
      targetView: "analytics"
    }
  ];

  const testimonials = [
    {
      name: "Alex G.",
      role: "Computer Science Junior",
      text: "The AI note summaries literally saved my Database Systems midterms. I uploaded the slides, copied formulas, and had a quiz ready in under 2 minutes.",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120"
    },
    {
      name: "Sophia Martinez",
      role: "Pre-Med Specialist",
      text: "Having an AI study scheduler that reorganizes milestones whenever my shift changes is insane. Standard calendars just don't match student workloads.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120"
    }
  ];

  return (
    <div className="bg-[#0F172A] text-[#E2E8F0] min-h-screen relative overflow-x-hidden font-sans select-none">
      
      {/* Premium Gradient Background Elements */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[#6366F1]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] bg-[#8B5CF6]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[0%] left-[-10%] w-[50%] h-[50%] bg-[#10B981]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center relative z-10" id="hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4.5 py-1.5 text-xs font-semibold text-indigo-400 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Education AI Excellence Suite • Solo Hackathon 2026 Winner</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight"
        >
          Your AI-powered academic operating system.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed"
        >
          Say goodbye to fragmented widgets, tedious summary typing, and disorganized timetables.
          <strong className="text-white"> AutoPilot OS</strong> merges smart doc summaries, instant practice quizzes, persistent milestone logs, and mindful workrooms onto one beautifully optimized cockpit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={handleStart}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-indigo-600 hover:to-violet-600 px-8 py-4 text-xs font-bold shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            id="landing-hero-getstarted"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate("login")}
            className="rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 px-8 py-4 text-xs font-bold transition-all cursor-pointer text-slate-350 hover:text-white"
            id="landing-hero-demo"
          >
            Try Demo
          </button>
        </motion.div>
      </section>

      {/* Floating Animated UI Simulator (Highly interactive mockup) */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10" id="preview">
        <div className="relative rounded-2xl border border-white/[0.06] bg-[#0F172A]/85 p-3.5 overflow-hidden shadow-2xl shadow-indigo-500/5 backdrop-blur-md">
          {/* Top chrome header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-4 py-0.5 rounded border border-slate-900/50">
              https://autopilot-os.ai/hub
            </div>
            <div className="w-10" />
          </div>

          {/* Interactive Bento Dashboard Mockup Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[360px] p-2">
            
            {/* Widget 1: Focus Timer ticking */}
            <motion.div 
              className="rounded-xl border border-rose-500/10 bg-rose-500/[0.02] p-4.5 flex flex-col justify-between relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-2 right-2 flex items-center space-x-1 text-[8px] font-mono text-rose-400">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                <span>Live State</span>
              </div>
              <div>
                <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider mb-2">Immersive focus countdown</div>
                <div className="text-4xl font-extrabold tracking-tight font-mono text-white mt-1">
                  25:00
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-2">Active Task: Concurrency Lock Management Mockups</p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-900">
                <span className="text-[10px] font-mono text-slate-500">Focus Streak: 3 hrs</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-400/10 text-rose-400 font-mono">Calm mode</span>
              </div>
            </motion.div>

            {/* Widget 2: AI Parser / notes extracted */}
            <motion.div 
              className="rounded-xl border border-indigo-500/10 bg-indigo-500/[0.02] p-4.5 flex flex-col justify-between relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider mb-2">Note Summarizer Extraction</div>
                <div className="space-y-2 mt-4">
                  <div className="h-5 rounded bg-slate-900 flex items-center px-2 text-[10px] text-indigo-300 font-mono justify-between">
                    <span>Title: DBMS Database Transactions</span>
                    <Sparkles className="h-2.5 w-2.5 animate-bounce" />
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-900 text-[10px] text-slate-400 leading-normal">
                    AI extracted key isolation levels: Read Committed, Serializable, and Repeatable Read constraints.
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-900 mt-4">
                <span className="text-[10px] font-mono text-slate-500">2 Formulas extracted</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">100% Parsed</span>
              </div>
            </motion.div>

            {/* Widget 3: Live Supervisor Chat Prompt */}
            <motion.div 
              className="rounded-xl border border-violet-500/10 bg-violet-500/[0.02] p-4.5 flex flex-col justify-between relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <div className="text-[10px] font-mono text-violet-400 uppercase tracking-wider mb-2">AUTOPILOT CHATBOT</div>
                <div className="space-y-2 mt-3 font-sans">
                  <div className="text-[10px] text-slate-500 italic">Student: "Where should I study next?"</div>
                  <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/10 text-[10px] text-indigo-300 leading-relaxed">
                    🌟 Good morning! You have Database systems due tomorrow. Focus 45 mins on **Acid rules**, then try a Mock Quiz.
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 pt-4 border-t border-slate-900">
                <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono text-slate-500">Supervisor online</span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Floating background decorations */}
        <div className="absolute top-[40%] left-[-20px] bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-mono shadow-xl animate-bounce hidden sm:block">
          🔥 1,200+ students active today
        </div>
        <div className="absolute bottom-[20%] right-[-10px] bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-1.5 text-xs text-violet-300 font-mono shadow-xl animate-pulse hidden sm:block">
          ⚡ 100% Free Gemini-3.5 Flash Core
        </div>
      </section>

      {/* Feature grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 relative z-10" id="features">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Study smarter. Automate the anxiety away.
          </h2>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            While standard apps just demand tasks with reminders, AutoPilot actually executes the heavy lifting: highlighting notes, formulating interactive tests, and helping you focus step-by-step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -3, borderColor: "rgba(99, 102, 241, 0.4)" }}
                onClick={() => {
                  if (user) {
                    onNavigate(feat.targetView);
                  } else {
                    onNavigate("login");
                  }
                }}
                className={`p-6 rounded-2xl border ${feat.border} ${feat.bg} flex flex-col justify-between transition-all cursor-pointer`}
              >
                <div>
                  <div className={`p-3 rounded-lg w-fit ${feat.color} bg-slate-900/80 mb-5 border border-slate-800/60`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-200 tracking-wide mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative z-10" id="testimonials">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Why students rate us 10/10
          </h2>
          <p className="text-xs text-[#94A3B8]">Real students saving GPA scores for maximum academic output.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-slate-850 bg-slate-900/30 backdrop-blur-sm space-y-4">
              <div className="flex items-center space-x-1 text-amber-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{t.text}"
              </p>
              <div className="flex items-center space-x-3.5 pt-2">
                <img src={t.avatar} className="h-9 w-9 rounded-full object-cover border border-slate-800" alt={t.name} referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Startup Academic Metrics State Counter Dashboard */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10" id="stats">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-sm p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 uppercase font-mono">
                5x faster
              </h4>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] mt-2">
                Note Summarization
              </p>
            </div>
            <div>
              <h4 className="text-3xl sm:text-4xl font-extrabold text-[#10B981] uppercase font-mono">
                0 overdue
              </h4>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] mt-2">
                Assignments count
              </p>
            </div>
            <div>
              <h4 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 uppercase font-mono">
                +42% focus
              </h4>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] mt-2">
                Productivity streaks
              </p>
            </div>
            <div>
              <h4 className="text-3xl sm:text-4xl font-extrabold text-[#8B5CF6] uppercase font-mono">
                100% Cloud
              </h4>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] mt-2">
                Persistent Syncing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10" id="cta">
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-6">
          Ready to boot your focus to autopilot?
        </h2>
        <p className="text-xs text-[#94A3B8] leading-normal max-w-xl mx-auto mb-10">
          Connect your Google ID in one click. Upload your syllabus notes, prompt the virtual coach, and execute clean, stress-free studies.
        </p>
        <button
          onClick={handleStart}
          className="rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-indigo-600 hover:to-violet-600 px-10 py-5 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:-translate-y-0.5 transform"
          id="landing-cta-btn"
        >
          Initialize AutoPilot OS
        </button>
      </section>

      {/* Beautiful simple footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 relative z-10">
        <p>© 2026 AutoPilot OS. Built under Education + AI Automation Domain.</p>
        <div className="flex space-x-6 mt-4 md:mt-0 font-mono">
          <span>AIEM × SOLO Open Innovation Hackathon</span>
          <span>Google Cloud Core</span>
        </div>
      </footer>
    </div>
  );
};
