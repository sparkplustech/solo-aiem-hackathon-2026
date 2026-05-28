import { cn } from "@/utils/utils";
import { 
  LayoutDashboard, 
  Mic, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Mic, label: "New Meeting", path: "/meetings/new" },
  { icon: FileText, label: "Insights", path: "/insights" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-card backdrop-blur-xl h-screen flex flex-col sticky top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight">SyncOS</span>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
              location.pathname === item.path
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-accent hover:text-foreground",
            location.pathname === "/settings" && "bg-primary/10 text-primary"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
