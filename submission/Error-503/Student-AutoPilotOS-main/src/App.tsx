import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AIChatbot } from "./components/AIChatbot";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Upload } from "./pages/Upload";
import { Planner } from "./pages/Planner";
import { Quiz } from "./pages/Quiz";
import { Assignments } from "./pages/Assignments";
import { FocusMode } from "./pages/FocusMode";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { CalendarView } from "./pages/CalendarView";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

/**
 * Main state-driven App Core
 */
function MainRouter() {
  const { user, profile, loading } = useAuth();
  
  // Custom router state
  const [view, setView] = useState<string>("landing");

  // Shared Selection Text parameters to bridge auto-generation flows
  const [selectedText, setSelectedText] = useState<string>("");

  // Incomplete Assignments count widget state
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState(0);

  // Auto redirect path checks
  React.useEffect(() => {
    if (!loading) {
      if (user && (view === "landing" || view === "login")) {
        setView("dashboard");
      } else if (!user && view !== "landing" && view !== "login") {
        setView("landing");
      }
    }
  }, [user, loading]);

  const handleNavigate = (newView: string) => {
    setView(newView);
  };

  // Loader blocker
  if (loading) {
    return (
      <div className="bg-[#0f172a] text-white min-h-screen flex flex-col items-center justify-center font-sans">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-md" />
          <div className="w-12 h-12 rounded-full border-t border-r border-indigo-500 border-b border-l border-transparent animate-spin" />
        </div>
        <p className="text-[10px] font-mono tracking-widest text-slate-400 capitalize">
          Loading AutoPilot OS...
        </p>
      </div>
    );
  }

  // Identify if active sub-view is inside the secure workspace frame
  const isWorkspaceView = user && [
    "dashboard",
    "upload",
    "planner",
    "calendar",
    "quiz",
    "assignments",
    "focus",
    "analytics",
    "settings"
  ].includes(view);

  return (
    <div className="bg-[#0f172a] text-white min-h-screen flex flex-col relative select-none font-sans">
      
      {/* Central Notification System Toast frame */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "11px",
            fontFamily: "monospace",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(4px)"
          }
        }}
      />

      {/* Floating Interactive Companion AI Chatbot */}
      {user && <AIChatbot assignmentsCount={pendingAssignmentsCount} />}

      {/* Global Navigation Header is persistent across pages */}
      <Navbar onNavigate={handleNavigate} currentView={view} />

      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Render Sidebar context under secure active workspace layout */}
        {isWorkspaceView && (
          <Sidebar currentView={view} onNavigate={handleNavigate} />
        )}

        {/* Core Screen View Port */}
        <main className="flex-1 relative overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="h-full"
            >
              {/* Marketing landing views */}
              {view === "landing" && <Landing onNavigate={handleNavigate} />}
              {view === "login" && <Login onNavigate={handleNavigate} />}

              {/* Secure Student workspaces views */}
              {user && (
                <>
                  {view === "dashboard" && (
                    <Dashboard 
                      onNavigate={handleNavigate} 
                      onSetSelectText={(text) => setSelectedText(text)} 
                    />
                  )}
                  {view === "upload" && (
                    <Upload 
                      onNavigate={handleNavigate} 
                      selectedText={selectedText} 
                      onSetSelectText={(text) => setSelectedText(text)} 
                    />
                  )}
                  {view === "planner" && (
                    <Planner onNavigate={handleNavigate} />
                  )}
                  {view === "calendar" && (
                    <CalendarView />
                  )}
                  {view === "quiz" && (
                    <Quiz 
                      onNavigate={handleNavigate} 
                      selectedText={selectedText} 
                    />
                  )}
                  {view === "assignments" && (
                    <Assignments 
                      onNavigate={handleNavigate} 
                      onUpdateCount={(count) => setPendingAssignmentsCount(count)} 
                    />
                  )}
                  {view === "focus" && (
                    <FocusMode onNavigate={handleNavigate} />
                  )}
                  {view === "analytics" && (
                    <Analytics onNavigate={handleNavigate} />
                  )}
                  {view === "settings" && (
                    <Settings onNavigate={handleNavigate} />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
