import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Mic, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
          <span className="text-xl font-bold tracking-tight">SyncOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/dashboard">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse" />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Meeting Operating System</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
            Transform conversations <br />
            <span className="gradient-text">into execution.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SyncOS is the intelligent platform that turns your meetings into actionable workflows, 
            detects risks, and tracks progress automatically.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="px-8 gap-2 group">
                Start for free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Mock Dashboard Preview */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video max-w-5xl mx-auto glass p-2">
            <div className="w-full h-full bg-background/50 rounded-xl border border-white/5 flex items-center justify-center text-muted-foreground">
               <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-muted rounded-full mx-auto animate-pulse flex items-center justify-center">
                   <LayoutDashboard className="w-8 h-8 opacity-20" />
                 </div>
                 <p className="text-sm font-medium opacity-50 italic">SyncOS Intelligent Interface Preview</p>
               </div>
            </div>
          </div>
          
          {/* Floating Action Cards */}
          <div className="absolute -left-10 top-1/4 hidden lg:block">
            <Card className="w-64 p-4 border-primary/20 bg-primary/5 animate-bounce shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Action Item Extracted</span>
              </div>
              <p className="text-sm text-foreground">"Complete backend API by Friday" → Assigned to Rahul</p>
            </Card>
          </div>
          
          <div className="absolute -right-10 bottom-1/4 hidden lg:block">
            <Card className="w-64 p-4 border-emerald-500/20 bg-emerald-500/5 animate-pulse shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold">Risk Detected</span>
              </div>
              <p className="text-sm text-foreground italic">"Frontend blocked by API completion. High Severity."</p>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-32 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold">Beyond transcription.</h2>
            <p className="text-muted-foreground">Everything you need to move from discussion to delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "Intelligent Ingestion",
                description: "Live microphone input or audio/video uploads. We support all major formats with ultra-low latency."
              },
              {
                icon: Zap,
                title: "Action Automation",
                description: "AI automatically extracts tasks, owners, and deadlines, then creates workflows in real-time."
              },
              {
                icon: Shield,
                title: "Risk & Blocker Detection",
                description: "Identify unresolved topics and project risks before they become problems."
              },
              {
                icon: BarChart3,
                title: "Meeting Health",
                description: "Get deep insights into team alignment, participation, and decision clarity scores."
              },
              {
                icon: Sparkles,
                title: "AI Co-pilot",
                description: "Ask your meeting history anything. 'What did we decide about the auth flow last week?'"
              },
              {
                icon: CheckCircle2,
                title: "Automated Follow-ups",
                description: "SyncOS generates and sends follow-up emails and Slack reminders instantly."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-border bg-background/50 glass hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-20 max-w-7xl mx-auto border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-[10px] font-bold text-white">S</div>
            <span className="font-bold">SyncOS</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 SyncOS AI. Built for the future of execution.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Missing icon from imports
function LayoutDashboard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
