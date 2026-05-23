import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  CheckSquare, 
  Clock, 
  Filter, 
  Layers, 
  ListTodo, 
  CalendarDays, 
  X, 
  Trash2, 
  Search, 
  Info, 
  Activity, 
  Flame, 
  Bookmark, 
  Compass,
  Zap,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

interface CalendarEvent {
  id?: string;
  ownerId: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: "Study Focus" | "Lecture Stream" | "Exam Prep" | "Assignment Work";
  priority: "High" | "Medium" | "Low";
}

interface AcademicAssignment {
  id?: string;
  title: string;
  subject: string;
  deadline: string; // YYYY-MM-DD
  progress: number;
  priority: "High" | "Medium" | "Low";
}

// Ultra-efficient Quick Event Templates for single-click & drag schedule injections
const QUICK_PRESETS = [
  { title: "Smart AI Study Sync", subject: "Computer Science", type: "Study Focus" as const, priority: "High" as const, icon: "🎓", time: "14:00", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { title: "Interactive Quiz Prep", subject: "Mathematics", type: "Exam Prep" as const, priority: "Medium" as const, icon: "📐", time: "10:30", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  { title: "Lab Experiment Review", subject: "Quantum Physics", type: "Study Focus" as const, priority: "High" as const, icon: "⚡", time: "15:15", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { title: "Team Assignment Sprint", subject: "Software Eng", type: "Assignment Work" as const, priority: "Medium" as const, icon: "💻", time: "16:45", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { title: "Literature Seminar Sync", subject: "Humanities", type: "Lecture Stream" as const, priority: "Low" as const, icon: "☕", time: "11:00", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
];

export const CalendarView: React.FC = () => {
  const { user } = useAuth();
  
  // State switching parameter (Month, Week, Agenda)
  const [viewMode, setViewMode] = useState<"month" | "week" | "agenda">("month");
  
  // Fixed simulated center point for temporal coordinate (May 22, 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 22)); 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 4, 22));

  // Firebase datasets
  const [assignments, setAssignments] = useState<AcademicAssignment[]>([]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [plannerSchedule, setPlannerSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and view filters
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add Custom Event Modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventSubject, setEventSubject] = useState("");
  const [eventDateString, setEventDateString] = useState("2026-05-22");
  const [eventTime, setEventTime] = useState("12:00");
  const [eventType, setEventType] = useState<CalendarEvent["type"]>("Study Focus");
  const [eventPriority, setEventPriority] = useState<CalendarEvent["priority"]>("Medium");
  const [savingEvent, setSavingEvent] = useState(false);

  // Drag states for visual helpers
  const [isDraggingDraft, setIsDraggingDraft] = useState(false);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);

  // Quick Action States: Drag & Drop + Click-and-Hold
  const [pressedDate, setPressedDate] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<any>(null);

  const startLongPress = (dateStr: string, dateObj: Date) => {
    if (longPressTimer) clearTimeout(longPressTimer);
    setPressedDate(dateStr);

    const timer = setTimeout(() => {
      setPressedDate(null);
      setEventDateString(dateStr);
      setSelectedDate(dateObj);
      setShowAddForm(true);
      toast.success(`Quick-scheduling initialized for ${dateStr}!`, {
        icon: "📅"
      });
    }, 550); // Hold for 550ms triggers the modal
    setLongPressTimer(timer);
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setPressedDate(null);
  };

  const daysInMonthString = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsList = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Load backend datasets synchronously
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Assignments
      const assignmentsQuery = query(
        collection(db, "assignments"),
        where("ownerId", "==", user.uid)
      );
      const assignmentsSnap = await getDocs(assignmentsQuery);
      const tempAssignments: AcademicAssignment[] = [];
      assignmentsSnap.forEach((docSnap) => {
        tempAssignments.push({ id: docSnap.id, ...docSnap.data() } as AcademicAssignment);
      });
      setAssignments(tempAssignments);

      // 2. Fetch AI study plan blocks
      const plannersQuery = query(
        collection(db, "planner"),
        where("ownerId", "==", user.uid)
      );
      const plannersSnap = await getDocs(plannersQuery);
      const tempPlanners: any[] = [];
      plannersSnap.forEach((docSnap) => {
        tempPlanners.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPlannerSchedule(tempPlanners);

      // 3. Fetch custom calendar scheduled items
      const eventsQuery = query(
        collection(db, "calendar_events"),
        where("ownerId", "==", user.uid)
      );
      const eventsSnap = await getDocs(eventsQuery);
      const tempEvents: CalendarEvent[] = [];
      eventsSnap.forEach((docSnap) => {
        tempEvents.push({ id: docSnap.id, ...docSnap.data() } as CalendarEvent);
      });
      setCustomEvents(tempEvents);
    } catch (err) {
      console.error("Error loading calendar datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle Event submit
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!eventTitle.trim() || !eventSubject.trim() || !eventDateString) {
      toast.error("Please fill out Event Name, Subject and Target Date.");
      return;
    }
    setSavingEvent(true);
    try {
      const payload: CalendarEvent = {
        ownerId: user.uid,
        title: eventTitle.trim(),
        subject: eventSubject.trim(),
        date: eventDateString,
        time: eventTime || "12:00",
        type: eventType,
        priority: eventPriority
      };

      await addDoc(collection(db, "calendar_events"), {
        ...payload,
        createdAt: serverTimestamp()
      });

      toast.success(`"${eventTitle.trim()}" successfully scheduled!`, { icon: "📆" });
      setEventTitle("");
      setEventSubject("");
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      toast.error("Unable to record your schedule event.");
    } finally {
      setSavingEvent(false);
    }
  };

  // Quick Dispatch: Immediately write custom preset event to a selected/dragged target date
  const handleInstantCreateEvent = async (preset: typeof QUICK_PRESETS[0], dateStr: string) => {
    if (!user) return;
    try {
      const payload: CalendarEvent = {
        ownerId: user.uid,
        title: preset.title,
        subject: preset.subject,
        date: dateStr,
        time: preset.time,
        type: preset.type,
        priority: preset.priority
      };
      await addDoc(collection(db, "calendar_events"), {
        ...payload,
        createdAt: serverTimestamp()
      });
      toast.success(`Scheduled "${preset.title}" on ${dateStr}!`, {
        icon: "⚡"
      });
      fetchData();
    } catch (err) {
      toast.error("Template dispatch failed.");
    }
  };

  // Re-schedule existing items (via dragging & dropping on calendar matrix)
  const handleRescheduleEvent = async (eventId: string, newDateStr: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "calendar_events", eventId), {
        date: newDateStr
      });
      toast.success(`Rescheduled event to ${newDateStr}!`, { icon: "🎯" });
      fetchData();
    } catch (err) {
      toast.error("Failed to relocate calendar event.");
    }
  };

  const handleRescheduleAssignment = async (asgId: string, newDateStr: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "assignments", asgId), {
        deadline: newDateStr
      });
      toast.success(`Deadlines rescheduled to ${newDateStr}!`, { icon: "📝" });
      fetchData();
    } catch (err) {
      toast.error("Failed to relocate assignments deadline.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "calendar_events", eventId));
      toast.success("Event removed successfully.");
      fetchData();
    } catch (err) {
      toast.error("Could not remove event.");
    }
  };

  // Subject Unique Finder for Filter Bar
  const getSubjectsList = () => {
    const list = new Set<string>();
    assignments.forEach(a => { if (a.subject) list.add(a.subject); });
    customEvents.forEach(e => { if (e.subject) list.add(e.subject); });
    return ["All", ...Array.from(list)];
  };

  // Filters check including search terms
  const isMatchFilter = (itemTitle: string, itemSubject: string, itemPriority: string) => {
    const subMatch = selectedSubject === "All" || itemSubject.toLowerCase() === selectedSubject.toLowerCase();
    const prioMatch = selectedPriority === "All" || itemPriority.toLowerCase() === selectedPriority.toLowerCase();
    const searchMatch = !searchTerm.trim() || itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) || itemSubject.toLowerCase().includes(searchTerm.toLowerCase());
    return subMatch && prioMatch && searchMatch;
  };

  // Local helper calculations
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date(2026, 4, 22); // Target Hackathon Timeline
    setCurrentDate(today);
    setSelectedDate(today);
    toast.success("Timeline jumped back to Hackathon Today (May 2026)", { icon: "🕒" });
  };

  // Prepare Days matching logic
  const getItemsForDate = (dateStr: string) => {
    const matchedAssignments = assignments.filter(a => a.deadline === dateStr && isMatchFilter(a.title, a.subject, a.priority));
    const matchedEvents = customEvents.filter(e => e.date === dateStr && isMatchFilter(e.title, e.subject, e.priority));
    
    // Checked planner sync block
    const matchedPlanner: any[] = [];
    if (plannerSchedule.length > 0) {
      const dayIndex = new Date(dateStr).getDay();
      if (dayIndex !== 0 && dayIndex !== 6) { // Workweek cycle
        const activePlanner = plannerSchedule[0];
        if (activePlanner && activePlanner.dailySchedule) {
          const indexToPick = (new Date(dateStr).getDate()) % activePlanner.dailySchedule.length;
          const pickedAct = activePlanner.dailySchedule[indexToPick];
          const sub = activePlanner.subjects?.[0] || "General";
          if (pickedAct && isMatchFilter(pickedAct.activity, sub, "Medium")) {
            matchedPlanner.push({
              id: `plan-${dateStr}-${indexToPick}`,
              title: pickedAct.activity,
              subject: sub,
              time: pickedAct.time,
              type: "Study Focus",
              priority: "Medium"
            });
          }
        }
      }
    }

    return {
      assignments: matchedAssignments,
      events: matchedEvents,
      planner: matchedPlanner,
      totalCount: matchedAssignments.length + matchedEvents.length + matchedPlanner.length
    };
  };

  const formatDateString = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Month Calendar computations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  const calendarBlocks: { date: Date | null; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Padded blocks from previous month
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthIdx = month === 0 ? 11 : month - 1;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIdx);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const padDay = daysInPrevMonth - i;
    const padDate = new Date(prevMonthYear, prevMonthIdx, padDay);
    calendarBlocks.push({
      date: padDate,
      isCurrentMonth: false,
      dateStr: formatDateString(padDate)
    });
  }

  // Active Month days
  for (let d = 1; d <= daysInMonth; d++) {
    const activeDate = new Date(year, month, d);
    calendarBlocks.push({
      date: activeDate,
      isCurrentMonth: true,
      dateStr: formatDateString(activeDate)
    });
  }

  // Next month padded blocks
  const totalSlotsNeeded = 42;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthIdx = month === 11 ? 0 : month + 1;
  let nextMonthDayCounter = 1;
  while (calendarBlocks.length < totalSlotsNeeded) {
    const padDate = new Date(nextMonthYear, nextMonthIdx, nextMonthDayCounter);
    calendarBlocks.push({
      date: padDate,
      isCurrentMonth: false,
      dateStr: formatDateString(padDate)
    });
    nextMonthDayCounter++;
  }

  const selectedDateStr = formatDateString(selectedDate);
  const selectedDayData = getItemsForDate(selectedDateStr);

  // Dynamic Syllabus Priority auto analysis
  const getSubjectMetrics = () => {
    const counts: { [key: string]: number } = {};
    assignments.forEach(asg => {
      counts[asg.subject] = (counts[asg.subject] || 0) + 1.5; // weight assignments higher
    });
    customEvents.forEach(evt => {
      counts[evt.subject] = (counts[evt.subject] || 0) + 1.0;
    });

    let topSub = "None";
    let maxWeight = 0;
    Object.entries(counts).forEach(([sub, score]) => {
      if (score > maxWeight) {
        maxWeight = score;
        topSub = sub;
      }
    });

    return { topSubject: topSub, score: maxWeight };
  };

  const { topSubject, score: topSubjectScore } = getSubjectMetrics();

  // Drag and Drop presets routing
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnDate = async (e: React.DragEvent, dateStr: string, dateObj: Date) => {
    e.preventDefault();
    setIsDraggingDraft(false);
    setActiveDragIndex(null);
    const data = e.dataTransfer.getData("text/plain");

    if (data.startsWith("MOVE_EVENT:")) {
      const eventId = data.replace("MOVE_EVENT:", "");
      await handleRescheduleEvent(eventId, dateStr);
    } else if (data.startsWith("MOVE_ASSIGNMENT:")) {
      const assignmentId = data.replace("MOVE_ASSIGNMENT:", "");
      await handleRescheduleAssignment(assignmentId, dateStr);
    } else if (data.startsWith("PRESET_INDEX:")) {
      const idx = parseInt(data.replace("PRESET_INDEX:", ""), 10);
      const preset = QUICK_PRESETS[idx];
      if (preset) {
        await handleInstantCreateEvent(preset, dateStr);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none bg-slate-950/20 min-h-screen relative cyber-grid">
      
      {/* Dynamic Header Frame */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-mono uppercase tracking-widest font-bold">
            <CalendarDays className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
            <span>Interactive Planner Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Academic Timeline Matrix</h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manage assignment deliverables, scheduled lecture milestones, and custom reminders across viewports. 
            Drag individual events to quickly reorganize, or double-click days to book targets.
          </p>
        </div>

        {/* Global Stats Board */}
        <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl md:min-w-[340px] shadow-inner relative z-10">
          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Tasks</span>
            <span className="text-lg font-black font-mono text-red-400">{assignments.length}</span>
          </div>
          <div className="text-center border-x border-slate-900">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Schedules</span>
            <span className="text-lg font-black font-mono text-violet-400">{customEvents.length}</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Daily Blocks</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {plannerSchedule[0]?.dailySchedule?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* DRAG-AND-DROP EFFICIENT PRESETS PANEL */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-200 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Rapid Scheduling Deck</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Need to book a block instantly? <strong>Drag & Drop</strong> any blueprint below onto a calendar cell, or click to add to currently selected date.
            </p>
          </div>
          
          <button 
            onClick={jumpToToday}
            className="self-start sm:self-center font-mono text-[10px] font-bold text-slate-300 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Center Timeline Today</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {QUICK_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", `PRESET_INDEX:${idx}`);
                setIsDraggingDraft(true);
                setActiveDragIndex(idx);
              }}
              onDragEnd={() => {
                setIsDraggingDraft(false);
                setActiveDragIndex(null);
              }}
              onClick={() => {
                handleInstantCreateEvent(preset, selectedDateStr);
              }}
              className={`p-3.5 rounded-xl border ${preset.color} hover:bg-slate-950 hover:scale-[1.03] transition-all cursor-grab active:cursor-grabbing text-left space-y-1 group relative overflow-hidden shadow-sm`}
              title="Drag onto calendar cell, or click here to add to current selected date!"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{preset.icon}</span>
                <span className="text-[9px] font-mono opacity-80 uppercase tracking-widest">{preset.time}</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-100 group-hover:text-white truncate">{preset.title}</h4>
                <div className="flex justify-between items-center text-[9px] opacity-80 font-mono mt-1">
                  <span>{preset.subject}</span>
                  <span className="opacity-60 bg-white/5 px-1 py-0.2 rounded">Apply +</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Search & Multi-Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/30 border border-indigo-950 p-4 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          {/* Real-time search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scheduled coursework & milestones..."
              className="w-full bg-slate-950/80 pl-9 pr-3.5 py-2 rounded-xl text-xs text-slate-300 border border-slate-800/80 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80">
              <Filter className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] text-slate-500 font-mono">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-transparent text-xs text-indigo-400 font-black focus:outline-none border-none cursor-pointer p-0"
              >
                {getSubjectsList().map(sub => (
                  <option className="bg-[#0b0f19] text-white" key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Importance Filter */}
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80">
              <Flame className="h-3 w-3 text-red-400" />
              <span className="text-[10px] text-slate-500 font-mono">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-xs text-amber-400 font-black focus:outline-none border-none cursor-pointer p-0"
              >
                <option className="bg-[#0b0f19] text-white" value="All">All Priority</option>
                <option className="bg-[#0b0f19] text-white" value="High">🔴 Urgent / High</option>
                <option className="bg-[#0b0f19] text-white" value="Medium">🟡 Regular / Medium</option>
                <option className="bg-[#0b0f19] text-white" value="Low">🟢 Optional / Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Nav-Month Deck */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center space-x-2.5 bg-slate-950/80 p-1 rounded-xl border border-slate-850">
            <button 
              onClick={handlePrevMonth}
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-200 px-2 min-w-[130px] text-center">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month].toUpperCase()} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Workspace Body left: View Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950/40 rounded-3xl border border-slate-800 p-1.5 flex justify-between items-center max-w-sm">
            {(["month", "week", "agenda"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-1.5 rounded-2xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  viewMode === mode 
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/10" 
                    : "text-slate-400 hover:text-white hover:bg-[#111827]/40"
                }`}
              >
                {mode === "month" ? "Month View" : mode === "week" ? "Weekly Slices" : "Full Timeline"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            
            {/* MONTH-VIEW COMPONENT */}
            {viewMode === "month" && (
              <motion.div
                key="month-canvas"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/30 rounded-2xl border border-slate-800/80 p-4 overflow-x-auto shadow-2xl"
              >
                {/* Visual Header Columns */}
                <div className="grid grid-cols-7 gap-2.5 text-center mb-3 min-w-[650px]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, index) => (
                    <div 
                      key={dayName} 
                      className={`text-[10px] font-mono font-bold uppercase tracking-widest py-1.5 ${
                        index === 0 || index === 6 ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Day blocks rendering */}
                <div className="grid grid-cols-7 gap-2.5 min-w-[650px]">
                  {calendarBlocks.map((block, idx) => {
                    const blockDate = block.date;
                    const isSelected = blockDate && formatDateString(selectedDate) === block.dateStr;
                    const { assignments: dAssignments, events: dEvents, planner: dPlanner, totalCount } = getItemsForDate(block.dateStr);

                    // Today anchor point
                    const todayStr = formatDateString(new Date(2026, 4, 22)); 
                    const isToday = block.dateStr === todayStr;

                    const isPressed = pressedDate === block.dateStr;
                    const canDropHere = isDraggingDraft && block.isCurrentMonth;

                    return (
                      <div
                        key={idx}
                        onClick={() => blockDate && setSelectedDate(blockDate)}
                        onDoubleClick={() => {
                          if (blockDate && block.isCurrentMonth) {
                            setEventDateString(block.dateStr);
                            setSelectedDate(blockDate);
                            setShowAddForm(true);
                          }
                        }}
                        onMouseDown={() => blockDate && block.isCurrentMonth && startLongPress(block.dateStr, blockDate)}
                        onMouseUp={cancelLongPress}
                        onMouseLeave={cancelLongPress}
                        onTouchStart={() => blockDate && block.isCurrentMonth && startLongPress(block.dateStr, blockDate)}
                        onTouchEnd={cancelLongPress}
                        onTouchCancel={cancelLongPress}
                        onDragOver={handleDragOver}
                        onDrop={(e) => blockDate && block.isCurrentMonth && handleDropOnDate(e, block.dateStr, blockDate)}
                        className={`min-h-[105px] p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer select-none relative group ${
                          block.isCurrentMonth 
                            ? isSelected 
                              ? "bg-indigo-500/[0.08] border-indigo-400 shadow-xl shadow-indigo-500/5 scale-[1.01]" 
                              : isPressed
                              ? "bg-amber-500/20 border-amber-400 animate-pulse scale-[0.98]"
                              : "bg-slate-950/45 border-slate-900 hover:bg-slate-900/40 hover:border-slate-850"
                            : "bg-transparent border-transparent opacity-15 pointer-events-none"
                        } ${isToday && block.isCurrentMonth && !isSelected ? "border-emerald-500 bg-emerald-500/[0.03]" : ""} ${
                          canDropHere ? "border-dashed border-indigo-500/50 bg-indigo-500/10 animate-pulse" : ""
                        }`}
                        id={`calendar-day-box-${block.dateStr}`}
                        title="Dbl-click to Quick Add | Drag Template to schedule event."
                      >
                        {/* Day indicator & details counts */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-mono font-bold ${
                            isSelected 
                              ? "text-indigo-400" 
                              : isToday 
                                ? "text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20" 
                                : "text-slate-400"
                          }`}>
                            {blockDate ? blockDate.getDate() : ""}
                          </span>

                          <div className="flex items-center space-x-1">
                            {dAssignments.length > 0 && (
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="Assignment Deadline" />
                            )}
                            {dEvents.length > 0 && (
                              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" title="Milestone Event" />
                            )}
                            {dPlanner.length > 0 && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Study Focus Hour" />
                            )}
                          </div>
                        </div>

                        {/* Event list container */}
                        <div className="mt-2 space-y-1 block max-h-[62px] overflow-hidden">
                          {dAssignments.slice(0, 1).map((asg, aIdx) => (
                            <div 
                              key={aIdx} 
                              draggable
                              onDragStart={(e) => {
                                if (asg.id) {
                                  e.dataTransfer.setData("text/plain", `MOVE_ASSIGNMENT:${asg.id}`);
                                }
                              }}
                              className="text-[8px] font-mono px-1.5 py-0.5 rounded-lg bg-red-950/30 text-red-400 border border-red-900/20 truncate cursor-grab active:cursor-grabbing hover:bg-red-900/20 transition-colors"
                              title="Drag to reschedule deliverable."
                            >
                              📚 {asg.title}
                            </div>
                          ))}
                          {dEvents.slice(0, 1).map((evt, eIdx) => (
                            <div 
                              key={eIdx} 
                              draggable
                              onDragStart={(e) => {
                                if (evt.id) {
                                  e.dataTransfer.setData("text/plain", `MOVE_EVENT:${evt.id}`);
                                }
                              }}
                              className="text-[8px] font-mono px-1.5 py-0.5 rounded-lg bg-[#8B5CF6]/10 text-violet-300 border border-violet-900/25 truncate cursor-grab active:cursor-grabbing hover:bg-violet-900/20 transition-colors"
                              title="Drag to reschedule custom milestone."
                            >
                              ⚡ {evt.title}
                            </div>
                          ))}
                          {dPlanner.slice(0, 1).map((pl, pIdx) => (
                            <div key={pIdx} className="text-[8px] font-mono px-1.5 py-0.5 rounded-lg bg-emerald-950/30 text-emerald-400 border border-emerald-900/20 truncate">
                              🕒 {pl.title}
                            </div>
                          ))}

                          {totalCount > 1 && (
                            <span className="text-[7.5px] font-mono text-slate-500 block text-right">
                              +{totalCount - 1} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* WEEKLY SLICES VIEW */}
            {viewMode === "week" && (
              <motion.div
                key="weekly-canvas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4.5"
              >
                {Array.from({ length: 7 }).map((_, wIdx) => {
                  const dayOffset = wIdx - selectedDate.getDay();
                  const targetDay = new Date(selectedDate);
                  targetDay.setDate(selectedDate.getDate() + dayOffset);
                  
                  const targetDayStr = formatDateString(targetDay);
                  const { assignments: wAsg, events: wEvt, planner: wPl, totalCount } = getItemsForDate(targetDayStr);
                  const isSelectDay = formatDateString(selectedDate) === targetDayStr;

                  return (
                    <div
                      key={wIdx}
                      onClick={() => setSelectedDate(targetDay)}
                      className={`rounded-2xl border p-4.5 transition-all cursor-pointer relative ${
                        isSelectDay 
                          ? "bg-slate-900/80 border-indigo-500 shadow-xl shadow-indigo-500/5 scale-[1.01]" 
                          : "bg-slate-950/45 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3 mb-3.5">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-2xl font-black font-mono text-indigo-400">{targetDay.getDate()}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-100 block">{daysInMonthString[targetDay.getDay()]}</span>
                            <span className="text-[9px] text-slate-500 block">{monthsList[targetDay.getMonth()]} {targetDay.getFullYear()}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {totalCount > 0 && (
                            <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                              {totalCount} Objectives Scheduled
                            </span>
                          )}
                        </div>
                      </div>

                      {totalCount === 0 ? (
                        <p className="text-[10px] text-slate-500 italic py-1">No Academic objectives scheduled on this date.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {wAsg.map((a, asgIdx) => (
                            <div key={asgIdx} className="bg-red-500/[0.03] border border-red-500/10 p-3 rounded-xl flex flex-col justify-between">
                              <span className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider">📚 Assignment Target</span>
                              <h5 className="text-[11px] font-bold text-slate-200 mt-1 truncate">{a.title}</h5>
                              <p className="text-[9px] text-slate-500 mt-1 font-mono">{a.subject}</p>
                            </div>
                          ))}
                          {wEvt.map((e, evtIdx) => (
                            <div key={evtIdx} className="bg-violet-500/[0.03] border border-violet-500/10 p-3 rounded-xl flex flex-col justify-between">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono text-violet-400 font-bold uppercase tracking-wider">⚡ {e.type}</span>
                                <span className="text-[9px] font-mono text-slate-500">{e.time}</span>
                              </div>
                              <h5 className="text-[11px] font-bold text-slate-100 mt-1 truncate">{e.title}</h5>
                              <p className="text-[9px] text-slate-500 mt-1 font-mono">{e.subject}</p>
                            </div>
                          ))}
                          {wPl.map((p, plIdx) => (
                            <div key={plIdx} className="bg-emerald-500/[0.03] border border-emerald-500/10 p-3 rounded-xl flex flex-col justify-between">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider">🕒 System Study Block</span>
                                <span className="text-[9px] font-mono text-slate-500">{p.time}</span>
                              </div>
                              <h5 className="text-[11px] font-bold text-slate-100 mt-1 truncate">{p.title}</h5>
                              <p className="text-[9px] text-slate-500 mt-1 font-mono">{p.subject}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* FULL TIMELINE VIEW */}
            {viewMode === "agenda" && (
              <motion.div
                key="agenda-canvas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="rounded-3xl border border-slate-800 bg-[#0F172A]/50 p-6 space-y-5">
                  <div className="border-b border-slate-900 pb-3">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest font-mono">Curricular Action Timeline</h3>
                  </div>

                  {assignments.length === 0 && customEvents.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-500">
                      Roadmap is clear! Create customizable events above or populate Homework Trackers.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((asg) => (
                        <div key={asg.id} className="bg-slate-950/50 hover:bg-slate-900/30 border border-slate-900 hover:border-slate-855 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all">
                          <div className="flex items-center space-x-3.5">
                            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                              <CheckSquare className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#E2E8F0] tracking-wide">{asg.title}</h4>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                <span className="text-indigo-400">{asg.subject}</span>
                                <span>•</span>
                                <span>Due: {asg.deadline}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/15 px-2.5 py-0.5 rounded font-mono font-bold">
                              {asg.priority}
                            </span>
                          </div>
                        </div>
                      ))}

                      {customEvents.map((evt) => (
                        <div key={evt.id} className="bg-slate-950/50 hover:bg-slate-900/30 border border-slate-900 hover:border-slate-855 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all">
                          <div className="flex items-center space-x-3.5">
                            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 font-bold">
                              <Zap className="h-4.5 w-4.5 animate-bounce" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-black text-[#E2E8F0] tracking-wide">{evt.title}</h4>
                                <span className="text-[8px] font-mono tracking-widest text-violet-400 bg-violet-500/10 px-1.5 py-0.2 rounded font-bold uppercase">
                                  {evt.type}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-550 font-mono mt-0.5">
                                <span className="text-indigo-400">{evt.subject}</span>
                                <span>•</span>
                                <span>Start: {evt.time}</span>
                                <span>•</span>
                                <span>{evt.date}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-[9px] bg-violet-500/10 text-violet-300 border border-violet-500/15 px-2.5 py-0.5 rounded font-mono font-bold">
                              {evt.priority} Priority
                            </span>
                            <button
                              onClick={() => evt.id && handleDeleteEvent(evt.id)}
                              className="text-slate-550 hover:text-red-450 p-1.5 bg-[#0F172A] hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                              title="Delete event"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Color Indicators Legend panel */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono text-slate-500">COLOR LEGEND SCHEMA:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center text-[10px] text-slate-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5" />
                Homework Deadlines
              </span>
              <span className="inline-flex items-center text-[10px] text-slate-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-violet-500 mr-1.5" />
                Custom Scheduled Class
              </span>
              <span className="inline-flex items-center text-[10px] text-slate-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                AI Generated Focus Slots
              </span>
            </div>
          </div>
        </div>

        {/* Workspace right side: Inspection Board & Advisories */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Inspect Card */}
          <div className="bg-[#0b0f19]/80 rounded-3xl border border-slate-800/80 p-5 space-y-5 sticky top-24 shadow-2xl">
            
            <div className="border-b border-indigo-950/60 pb-3.5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-black">Inspection Board</span>
                <h4 className="text-base font-black text-white mt-1">
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </h4>
              </div>
              <div className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1.5 rounded-xl border border-indigo-505/20 font-bold uppercase">
                {daysInMonthString[selectedDate.getDay()]}
              </div>
            </div>

            {/* List agenda inside the selected date */}
            <div className="space-y-4 min-h-[140px]">
              {selectedDayData.totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-550 min-h-[160px]">
                  <FolderOpen className="h-8 w-8 text-slate-700 mb-2" />
                  <p className="text-[11px] leading-relaxed text-slate-400 max-w-[200px]">No deliverables scheduled for this day check.</p>
                  
                  <button
                    onClick={() => {
                      setEventDateString(selectedDateStr);
                      setShowAddForm(true);
                    }}
                    className="mt-3.5 flex items-center space-x-1 sm:space-x-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg text-[9.5px] font-mono font-black transition-all cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Quick-Book Slot</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Selected Assignments list */}
                  {selectedDayData.assignments.map((asg, idx) => (
                    <div key={`sel-asg-${idx}`} className="p-3 bg-red-500/[0.03] border border-red-500/20 rounded-xl space-y-1.5 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-red-400 font-bold uppercase flex items-center space-x-1">
                          <CheckSquare className="h-3 w-3" />
                          <span>Task deadline</span>
                        </span>
                        <span className="text-[9px] bg-white/5 px-1.5 rounded font-mono font-bold text-red-400">{asg.priority}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-200 leading-normal">{asg.title}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">Subject: {asg.subject}</p>
                    </div>
                  ))}

                  {/* Selected Scheduled events list */}
                  {selectedDayData.events.map((evt, idx) => (
                    <div key={`sel-evt-${idx}`} className="p-3 bg-violet-500/[0.03] border border-violet-500/20 rounded-xl space-y-1.5 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-violet-400 font-bold uppercase">{evt.type}</span>
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">{evt.time}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-200 leading-normal">{evt.title}</h5>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Subject: {evt.subject}</span>
                        <button
                          onClick={() => evt.id && handleDeleteEvent(evt.id)}
                          className="text-red-450 hover:text-red-400 text-[9px] font-mono font-bold cursor-pointer"
                        >
                          Delete -
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Selected Focus slots */}
                  {selectedDayData.planner.map((plan, idx) => (
                    <div key={`sel-plan-${idx}`} className="p-3 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">🌱 Study Block</span>
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">{plan.time}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-200 leading-normal">{plan.title}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">Subject: {plan.subject}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Syllabus Focus advisor logic */}
            {topSubject !== "None" && topSubjectScore > 2 && (
              <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-1.5">
                <h5 className="text-[10px] font-mono font-bold text-amber-400 flex items-center space-x-1">
                  <Flame className="h-3 w-3 text-amber-400" />
                  <span>Syllabus Overdrive Detected</span>
                </h5>
                <p className="text-[10px] text-slate-350 leading-relaxed">
                  Your calendar indicates heavy focus on <strong className="text-amber-300 font-bold">"{topSubject}"</strong> over the upcoming timeline. Consider utilizing quizzes or study focus rooms to streamline progress.
                </p>
              </div>
            )}

            <div className="bg-indigo-950/20 border border-indigo-900/40 p-3.5 rounded-2xl flex flex-col space-y-1">
              <span className="text-[9.5px] font-mono text-indigo-400 uppercase tracking-wider font-extrabold flex items-center space-x-1">
                <Compass className="h-3.5 w-3.5" />
                <span>Scheduler Tips</span>
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Hover over days and drag template blocks to build a scheduled routine. Days with active colored circles indicate loaded deadlines or lecture streams.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Pop-Up Modal Event Scheduler Form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F172A] border border-slate-805 rounded-3xl p-6 space-y-5 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-5 right-5 text-slate-450 hover:text-white transition-all cursor-pointer p-1.5 rounded-full hover:bg-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block font-black">Calendar Core</span>
                <h3 className="text-lg font-black text-white">Book Curricular Milestone</h3>
                <p className="text-xs text-slate-400">
                  Preloading target date: <span className="text-indigo-400 font-extrabold font-mono">{eventDateString}</span>
                </p>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono text-slate-550 uppercase font-black">Event / Task Title</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    placeholder="e.g., Quantum Computing Quiz Prep"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-slate-555 uppercase font-black">Topic / Subject</label>
                    <input
                      type="text"
                      required
                      value={eventSubject}
                      onChange={e => setEventSubject(e.target.value)}
                      placeholder="e.g., Mathematics"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-550/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-slate-555 uppercase font-black">Start Time</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-slate-555 uppercase font-black">Schedules Date</label>
                    <input
                      type="date"
                      required
                      value={eventDateString}
                      onChange={e => setEventDateString(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-slate-555 uppercase font-black">Category Mode</label>
                    <select
                      value={eventType}
                      onChange={e => setEventType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="Study Focus">🎓 Study Focus</option>
                      <option value="Lecture Stream">📺 Lecture Stream</option>
                      <option value="Exam Prep">📐 Exam Prep</option>
                      <option value="Assignment Work">💻 Assignment Work</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-900">
                  <label className="text-[9.5px] font-mono text-slate-555 uppercase font-black block mb-1">Set Priority Level</label>
                  <div className="grid grid-cols-3 gap-1.5 p-0.5 rounded-lg">
                    {(["High", "Medium", "Low"] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEventPriority(p)}
                        className={`py-1.5 rounded-xl text-[9px] font-mono font-bold transition-all ${
                          eventPriority === p 
                            ? "bg-indigo-505 text-white bg-indigo-500 shadow-md" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex space-x-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 rounded-xl py-3 text-slate-400 font-bold hover:text-white bg-slate-950 border border-slate-850 hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={savingEvent}
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 py-3 font-bold text-white shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
                  >
                    {savingEvent ? "Scheduling..." : "Confirm Schedule"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
