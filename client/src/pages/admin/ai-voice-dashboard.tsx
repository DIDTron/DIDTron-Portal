import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Bot, Phone, PhoneIncoming, PhoneOutgoing, Brain, BookOpen,
  DollarSign, Activity, Users, Clock, CheckCircle2, AlertCircle,
  Loader2, Server, Mic, MessageSquare, TrendingUp, Settings2
} from "lucide-react";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";

type DashboardStats = {
  totalAgents: number;
  activeAgents: number;
  inboundAgents: number;
  outboundAgents: number;
  pricingTiersCount: number;
  templatesCount: number;
  settings: { settingKey: string; settingValue: string | null }[];
};

type PricingTier = {
  id: string;
  name: string;
  ratePerMinute: string;
  isDefault: boolean;
  isActive: boolean;
};

type Template = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  icon: string | null;
  isActive: boolean;
};

type CallLog = {
  id: string;
  agentId: string;
  direction: string | null;
  duration: number | null;
  outcome: string | null;
  createdAt: string;
};

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  trendUp,
  testId,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  testId?: string;
  onClick?: () => void;
}) {
  return (
    <Card 
      className={onClick ? "cursor-pointer hover-elevate" : ""} 
      onClick={onClick}
      data-testid={testId}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={`text-xs flex items-center gap-1 mt-1 ${trendUp ? 'text-green-600' : 'text-muted-foreground'}`}>
            {trendUp && <TrendingUp className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HealthIndicator({ status, label }: { status: 'healthy' | 'warning' | 'error'; label: string }) {
  const colors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${colors[status]}`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default function AiVoiceDashboard() {
  const { openTab, setActiveSection, setActiveSubItem } = useSuperAdminTabs();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/ai-voice/dashboard"],
  });

  const { data: pricingTiers = [] } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/ai-voice/pricing-tiers"],
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/admin/ai-voice/templates"],
  });

  const { data: callLogs = [] } = useQuery<CallLog[]>({
    queryKey: ["/api/admin/ai-voice/call-logs"],
  });

  const handleQuickAction = (subItem: string, label: string, route: string) => {
    setActiveSection("ai-voice");
    setActiveSubItem(subItem);
    const tab: WorkspaceTab = {
      id: subItem,
      label: label,
      route: route,
    };
    openTab(tab);
  };

  const defaultTier = pricingTiers.find(t => t.isDefault);
  const recentCalls = callLogs.slice(0, 5);
  const totalCallMinutes = callLogs.reduce((sum, c) => sum + (c.duration || 0), 0) / 60;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-ai-voice-dashboard-title">
            AI Voice Dashboard
          </h1>
          <p className="text-muted-foreground">
            System overview for AI-powered voice agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            System: Operational
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            data-testid="button-ai-voice-settings"
            onClick={() => handleQuickAction("ai-voice-settings", "Settings", "/admin/ai-voice/settings")}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Bot} 
          title="Total Agents" 
          value={stats?.totalAgents?.toString() || "0"} 
          description={`${stats?.activeAgents || 0} active`}
          trend={stats?.totalAgents ? `${Math.round((stats.activeAgents / stats.totalAgents) * 100)}% activation` : undefined}
          trendUp={(stats?.activeAgents || 0) > 0}
          testId="stat-total-agents"
          onClick={() => handleQuickAction("ai-voice-agents", "Agents", "/admin/ai-voice/agents")}
        />
        <StatCard 
          icon={PhoneIncoming} 
          title="Inbound Agents" 
          value={stats?.inboundAgents?.toString() || "0"} 
          description="Handling incoming calls"
          testId="stat-inbound-agents"
        />
        <StatCard 
          icon={PhoneOutgoing} 
          title="Outbound Agents" 
          value={stats?.outboundAgents?.toString() || "0"} 
          description="Handling outgoing campaigns"
          testId="stat-outbound-agents"
        />
        <StatCard 
          icon={DollarSign} 
          title="Default Rate" 
          value={defaultTier ? `$${defaultTier.ratePerMinute}/min` : "$0.10/min"} 
          description={defaultTier?.name || "Standard tier"}
          testId="stat-default-rate"
          onClick={() => handleQuickAction("ai-voice-billing", "Billing", "/admin/ai-voice/billing")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Brain} 
          title="Templates" 
          value={stats?.templatesCount?.toString() || templates.length.toString()} 
          description="Pre-built agent templates"
          testId="stat-templates"
        />
        <StatCard 
          icon={BookOpen} 
          title="Knowledge Bases" 
          value="0" 
          description="Trained knowledge sources"
          testId="stat-knowledge-bases"
          onClick={() => handleQuickAction("ai-voice-knowledge", "Knowledge", "/admin/ai-voice/knowledge")}
        />
        <StatCard 
          icon={Phone} 
          title="Total Calls" 
          value={callLogs.length.toString()} 
          description={`${totalCallMinutes.toFixed(1)} minutes total`}
          testId="stat-total-calls"
          onClick={() => handleQuickAction("ai-voice-call-logs", "Call Logs", "/admin/ai-voice/call-logs")}
        />
        <StatCard 
          icon={Users} 
          title="Active Campaigns" 
          value="0" 
          description="Outbound campaigns running"
          testId="stat-campaigns"
          onClick={() => handleQuickAction("ai-voice-campaigns", "Campaigns", "/admin/ai-voice/campaigns")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time status of AI Voice components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <HealthIndicator status="healthy" label="LLM Service" />
                <p className="text-xs text-muted-foreground ml-4">OpenAI GPT-4o</p>
              </div>
              <div className="space-y-2">
                <HealthIndicator status="healthy" label="TTS Service" />
                <p className="text-xs text-muted-foreground ml-4">OpenAI TTS</p>
              </div>
              <div className="space-y-2">
                <HealthIndicator status="healthy" label="STT Service" />
                <p className="text-xs text-muted-foreground ml-4">OpenAI Whisper</p>
              </div>
              <div className="space-y-2">
                <HealthIndicator status="healthy" label="Call Routing" />
                <p className="text-xs text-muted-foreground ml-4">ConnexCS VoiceHub</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Provider Quotas</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>OpenAI API</span>
                    <span className="text-muted-foreground">Unlimited</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>TTS Characters/Month</span>
                    <span className="text-muted-foreground">10M remaining</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Agent Templates
            </CardTitle>
            <CardDescription>Pre-built configurations</CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No templates configured
              </div>
            ) : (
              <div className="space-y-3">
                {templates.slice(0, 4).map((template) => (
                  <div 
                    key={template.id} 
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                    data-testid={`template-${template.id}`}
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{template.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {template.category || "General"}
                      </div>
                    </div>
                    {template.isActive && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Tiers
            </CardTitle>
            <CardDescription>AI Voice billing configurations</CardDescription>
          </CardHeader>
          <CardContent>
            {pricingTiers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No pricing tiers configured
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingTiers.map((tier) => (
                    <TableRow key={tier.id} data-testid={`row-tier-${tier.id}`}>
                      <TableCell className="font-medium">
                        {tier.name}
                        {tier.isDefault && (
                          <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell>${tier.ratePerMinute}/min</TableCell>
                      <TableCell>
                        {tier.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Recent Calls
            </CardTitle>
            <CardDescription>Latest AI Voice call activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCalls.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No call activity yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Direction</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCalls.map((call) => (
                    <TableRow key={call.id} data-testid={`row-call-${call.id}`}>
                      <TableCell>
                        {call.direction === "inbound" ? (
                          <Badge variant="secondary">
                            <PhoneIncoming className="h-3 w-3 mr-1" />
                            In
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <PhoneOutgoing className="h-3 w-3 mr-1" />
                            Out
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{call.duration ? `${call.duration}s` : '-'}</TableCell>
                      <TableCell>
                        {call.outcome === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : call.outcome === "failed" ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common AI Voice management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              data-testid="button-manage-agents"
              onClick={() => handleQuickAction("ai-voice-agents", "Agents", "/admin/ai-voice/agents")}
            >
              <Bot className="h-5 w-5" />
              <span>Manage Agents</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              data-testid="button-view-analytics"
              onClick={() => handleQuickAction("ai-voice-analytics", "Analytics", "/admin/ai-voice/analytics")}
            >
              <Activity className="h-5 w-5" />
              <span>View Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              data-testid="button-configure-billing"
              onClick={() => handleQuickAction("ai-voice-billing", "Billing", "/admin/ai-voice/billing")}
            >
              <DollarSign className="h-5 w-5" />
              <span>Configure Billing</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              data-testid="button-knowledge-bases"
              onClick={() => handleQuickAction("ai-voice-knowledge", "Knowledge", "/admin/ai-voice/knowledge")}
            >
              <BookOpen className="h-5 w-5" />
              <span>Knowledge Bases</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
