import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  MessageSquare, 
  Zap, 
  Shield, 
  Download, 
  Share2,
  CheckCircle2,
  Clock,
  User,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const transcript = [
  { speaker: "Alex", time: "00:05", text: "Alright everyone, thanks for joining. Today we need to lock down the SyncOS architecture and discuss the backend priorities." },
  { speaker: "Rahul", time: "00:42", text: "I've been looking at the Express setup. We should definitely use TypeScript for the entire backend to ensure type safety, especially for the AI service interfaces." },
  { speaker: "Sarah", time: "01:15", text: "Agreed. Also, we need to decide on the database. I'm leaning towards PostgreSQL with Supabase for the real-time capabilities." },
  { speaker: "Alex", time: "02:30", text: "PostgreSQL sounds good. Rahul, can you complete the backend API integration by Friday? We need to start testing the frontend hooks." },
  { speaker: "Rahul", time: "02:45", text: "I can do that, but I'm currently blocked by the authentication flow design. Sarah, when will that be ready?" },
  { speaker: "Sarah", time: "03:10", text: "I'll have the auth designs and the hydration bug fix done by tomorrow afternoon." },
  { speaker: "Alex", time: "04:00", text: "Great. Let's make sure we have a security audit scheduled for next week too." },
];

const actions = [
  { task: "Complete backend API integration", owner: "Rahul", deadline: "Friday", priority: "high" },
  { task: "Fix frontend hydration bug", owner: "Sarah", deadline: "Tomorrow", priority: "medium" },
  { task: "Schedule security audit", owner: "James", deadline: "Next Week", priority: "high" },
];

export default function MeetingInsightsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="success">Completed</Badge>
              <span className="text-sm text-muted-foreground">May 22, 2026 • 45m duration</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Q3 Architecture Planning</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Zap className="w-4 h-4" /> Sync to Jira
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Transcript Section */}
          <Card className="xl:col-span-2 flex flex-col h-[700px]">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Smart Transcript
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  className="w-full bg-muted/50 border-none rounded-md pl-9 py-1.5 text-sm focus:ring-1 focus:ring-primary" 
                  placeholder="Search transcript..." 
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border">
              {transcript.map((line, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-12 text-xs text-muted-foreground pt-1 font-mono">{line.time}</div>
                  <div className="flex-1">
                    <span className="font-bold text-sm block mb-1 text-primary">{line.speaker}</span>
                    <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                      {line.text}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            {/* AI Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  AI Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  The team finalized the tech stack (PostgreSQL + Supabase + Express TS). 
                  Key focus is on API integration and Auth flow. 
                  A security audit was identified as a critical next step.
                </p>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Extracted Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {actions.map((action, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-all group">
                    <p className="text-sm font-medium mb-2">{action.task}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px]">
                          {action.owner[0]}
                        </div>
                        <span className="text-xs text-muted-foreground">{action.owner}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{action.deadline}</Badge>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs gap-2 text-primary hover:text-primary hover:bg-primary/10">
                  Manage in Tasks <ArrowRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>

            {/* Risks & Blockers */}
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2 text-red-500">
                  <Shield className="w-4 h-4" />
                  Risks Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg border border-red-500/20 bg-background/50">
                  <p className="text-xs font-bold text-red-500 uppercase mb-1">High Severity</p>
                  <p className="text-sm">Rahul is blocked by Sarah's Auth flow designs. Potential 2-day delay on API integration.</p>
                </div>
                <div className="p-3 rounded-lg border border-amber-500/20 bg-background/50">
                  <p className="text-xs font-bold text-amber-500 uppercase mb-1">Medium Severity</p>
                  <p className="text-sm">Security audit timing is vague. Needs specific date by Friday.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
