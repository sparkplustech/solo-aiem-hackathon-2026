import { useStore } from "@/store/useStore";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import TaskPage from "@/pages/TaskPage";
import MeetingInsightsPage from "@/pages/MeetingInsightsPage";
import LiveMeetingPage from "@/pages/LiveMeetingPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Link } from "react-router-dom";

const NewMeeting = () => (
  <DashboardLayout>
    <h1 className="text-3xl font-bold mb-6">Record or Upload Meeting</h1>
    <div className="max-w-4xl mx-auto space-y-8 py-10 text-center">
      <div className="aspect-video border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
         <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
           <svg className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
         </div>
         <div>
           <p className="text-xl font-semibold">Drop your meeting recording here</p>
           <p className="text-muted-foreground">Supports MP3, WAV, MP4, WebM (Max 500MB)</p>
         </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="h-px w-20 bg-border" />
        <span className="text-muted-foreground uppercase text-xs font-bold tracking-widest">or</span>
        <div className="h-px w-20 bg-border" />
      </div>
      <Link to="/meetings/live">
        <button className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Start Live Recording
        </button>
      </Link>
    </div>
  </DashboardLayout>
);

function App() {
  const fetchData = useStore((state) => state.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meetings/new" element={<NewMeeting />} />
        <Route path="/meetings/live" element={<LiveMeetingPage />} />
        <Route path="/insights" element={<MeetingInsightsPage />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
