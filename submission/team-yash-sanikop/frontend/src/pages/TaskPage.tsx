import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useStore } from "@/store/useStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, MoreHorizontal, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

export default function TaskPage() {
  const { tasks, updateTaskStatus, isLoading } = useStore();

  if (isLoading && tasks.length === 0) {
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
      <div className="space-y-8 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow Execution</h1>
            <p className="text-muted-foreground mt-1">Manage tasks extracted from your meetings.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Filter</Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-[600px]">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 bg-muted/30 rounded-2xl p-4 space-y-4 border border-border/50">
                {tasks.filter(t => t.status === column.id).map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <Card className="border-border/50 hover:border-primary/30 transition-all shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <Badge 
                            variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-[10px] uppercase px-1.5"
                          >
                            {task.priority}
                          </Badge>
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium leading-tight">{task.title}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                              {task.assignee ? task.assignee[0] : '?'}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{task.assignee || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {task.deadline || 'No date'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                
                {tasks.filter(t => t.status === column.id).length === 0 && (
                  <div className="h-32 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground italic">
                    No tasks yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
