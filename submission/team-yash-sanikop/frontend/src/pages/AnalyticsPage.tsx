import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, Users, Clock, CheckCircle2 } from "lucide-react";

const participationData = [
  { name: 'Alex', value: 35 },
  { name: 'Rahul', value: 25 },
  { name: 'Sarah', value: 30 },
  { name: 'James', value: 10 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b'];

const productivityData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 85 },
  { month: 'May', score: 92 },
];

const decisionData = [
  { day: 'Mon', decisions: 4, actions: 12 },
  { day: 'Tue', decisions: 2, actions: 8 },
  { day: 'Wed', decisions: 8, actions: 24 },
  { day: 'Thu', decisions: 5, actions: 15 },
  { day: 'Fri', decisions: 9, actions: 30 },
];

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productivity Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights into team alignment and execution velocity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" /> Decision Velocity
              </div>
              <p className="text-3xl font-bold">4.2 <span className="text-sm font-normal text-muted-foreground">/ meeting</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" /> Participation Parity
              </div>
              <p className="text-3xl font-bold">88%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" /> Follow-up Latency
              </div>
              <p className="text-3xl font-bold">12m</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Task Conversion
              </div>
              <p className="text-3xl font-bold">94%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Speaking Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={participationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {participationData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Score Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" className="opacity-20" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Decision vs. Action Item Density</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={decisionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" className="opacity-20" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="decisions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
