import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { 
  User, 
  Bell, 
  Shield, 
  Mail,
  Zap,
  Check,
  MessageSquare
} from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings & Integrations</h1>
          <p className="text-muted-foreground mt-1">Configure your SyncOS experience and connect your workflow.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Profile Settings
              </CardTitle>
              <CardDescription>Manage your public identity and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center border-4 border-muted">
                  <User className="w-10 h-10 text-white" />
                </div>
                <Button variant="outline">Change Avatar</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input defaultValue="Alex Rivera" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input defaultValue="alex@syncos.ai" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Workflow Integrations
              </CardTitle>
              <CardDescription>Connect SyncOS to your existing team tools.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Slack', icon: MessageSquare, description: 'Post summaries and action items to channels.', connected: true },
                { name: 'Jira', icon: Zap, description: 'Sync extracted tasks directly to project boards.', connected: false },
                { name: 'Github', icon: GitBranchIcon, description: 'Link meetings to pull requests and issues.', connected: true },
                { name: 'Notion', icon: Mail, description: 'Export detailed meeting notes to workspaces.', connected: false },
              ].map((integration, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border glass">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <integration.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{integration.name}</span>
                        {integration.connected && <Badge variant="success" className="h-4 px-1.5"><Check className="w-3 h-3" /></Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Button variant={integration.connected ? "outline" : "primary"} size="sm">
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between py-2">
                 <div>
                   <p className="font-medium">Two-Factor Authentication</p>
                   <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                 </div>
                 <Button variant="outline">Enable</Button>
               </div>
               <div className="flex items-center justify-between py-2 border-t border-border">
                 <div>
                   <p className="font-medium text-destructive">Delete Account</p>
                   <p className="text-xs text-muted-foreground">Permanently remove all your data from SyncOS.</p>
                 </div>
                 <Button variant="destructive">Delete</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function GitBranchIcon(props: any) {
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
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}
