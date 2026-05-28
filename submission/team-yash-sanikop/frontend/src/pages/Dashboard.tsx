import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useStore } from "@/store/useStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Clock, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  MoreHorizontal,
  Plus,
  Shield
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

const data = [
  { name: 'Mon', count: 4 },
  { name: 'Tue', count: 3 },
  { name: 'Wed', count: 7 },
  { name: 'Thu', count: 5 },
  { name: 'Fri', count: 8 },
  { name: 'Sat', count: 2 },
  { name: 'Sun', count: 1 },
];

export default function Dashboard() {
  const { tasks, meetings, isLoading } = useStore();

  if (isLoading && meetings.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time overview of your team's execution and meeting health.</p>
          </div>
          <Link to="/meetings/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Meeting
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Productivity Score</p>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold">84%</p>
              <p className="text-xs text-emerald-500 mt-1 font-medium">+12% from last week</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Action Completion</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <div className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-3xl font-bold">92%</p>
              <p className="text-xs text-emerald-500 mt-1 font-medium">+5% from last week</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unresolved Risks</p>
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <div className="w-4 h-4 text-red-500" />
                </div>
              </div>
              <p className="text-3xl font-bold">0{tasks.filter(t => t.status === 'blocked').length}</p>
              <p className="text-xs text-red-500 mt-1 font-medium">Blocking execution</p>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Time Saved (AI)</p>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <div className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <p className="text-3xl font-bold">{meetings.length * 2}h</p>
              <p className="text-xs text-purple-500 mt-1 font-medium">Auto-summarized meetings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Meeting Volume Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" className="opacity-20" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Meetings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Meetings</CardTitle>
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {meetings.slice(0, 4).map((meeting) => (
                  <Link key={meeting.id} to="/insights">
                    <div className="flex flex-col gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold group-hover:text-primary transition-colors truncate max-w-[150px]">{meeting.title}</h4>
                        <Badge variant="secondary" className="text-[10px]">{meeting.duration || 'N/A'}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(meeting.date || Date.now()).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {meeting.participants?.length || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {meetings.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground italic text-sm">No meetings recorded yet</div>
                )}
                <Button variant="outline" className="w-full mt-4">View All History</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.filter(t => t.priority === 'high').slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-border glass hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold">!</div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Assigned to {task.assignee || 'Unassigned'} • Due {task.deadline || 'N/A'}</p>
                      </div>
                    </div>
                    <Badge variant={task.status === 'blocked' ? 'destructive' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {tasks.filter(t => t.priority === 'high').length === 0 && (
                  <div className="text-center py-6 text-muted-foreground italic text-sm border-2 border-dashed border-border rounded-xl">No high priority tasks</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Execution Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-purple-500 before:to-transparent">
                 {[
                   { title: "Backend API Freeze", time: "In 2 days", icon: Clock },
                   { title: "Frontend Beta Release", time: "In 5 days", icon: Calendar },
                   { title: "Security Audit Completion", time: "Next Week", icon: Shield }
                 ].map((item, i) => (
                   <div key={i} className="relative flex items-center justify-between pl-12">
                     <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary shadow">
                       <item.icon className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <p className="font-semibold">{item.title}</p>
                       <p className="text-sm text-muted-foreground">{item.time}</p>
                     </div>
                     <Button variant="ghost" size="sm">Details</Button>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
