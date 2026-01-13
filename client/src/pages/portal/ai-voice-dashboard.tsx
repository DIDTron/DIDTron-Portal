import { useQuery } from "@tanstack/react-query";
import { STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  Bot, Phone, PhoneIncoming, PhoneOutgoing, Clock, DollarSign, 
  TrendingUp, Activity, Zap, BookOpen, Users, BarChart3, Loader2,
  Plus, ArrowRight, CheckCircle2, AlertCircle
} from "lucide-react";

type DashboardStats = {
  totalAgents: number;
  activeAgents: number;
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  totalMinutes: number;
  totalCost: number;
  balance: number;
  successRate: number;
  avgDuration: number;
  activeCampaigns: number;
  knowledgeBases: number;
};

type RecentCall = {
  id: string;
  agentName: string;
  direction: string;
  duration: number;
  status: string;
  createdAt: string;
};

export default function CustomerAiVoiceDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/my/ai-voice/dashboard/stats"],
    staleTime: STALE_TIME.DETAIL,
    placeholderData: keepPreviousData,
  });

  const { data: recentCalls = [], isLoading: callsLoading } = useQuery<RecentCall[]>({
    queryKey: ["/api/my/ai-voice/call-logs", { limit: 5 }],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const defaultStats: DashboardStats = {
    totalAgents: 0,
    activeAgents: 0,
    totalCalls: 0,
    inboundCalls: 0,
    outboundCalls: 0,
    totalMinutes: 0,
    totalCost: 0,
    balance: 0,
    successRate: 0,
    avgDuration: 0,
    activeCampaigns: 0,
    knowledgeBases: 0,
  };

  const data = stats || defaultStats;
  const usagePercent = Math.min((data.totalMinutes / 1000) * 100, 100);

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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">AI Voice Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your AI voice agents and monitor performance
          </p>
        </div>
        <Link href="/portal/ai-agent/wizard">
          <Button data-testid="button-create-agent">
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </Link>
      </div>

      {data.totalAgents === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Started with AI Voice</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Create your first AI voice agent to handle calls automatically. 
              Choose from templates or build a custom agent.
            </p>
            <Link href="/portal/ai-agent/wizard">
              <Button data-testid="button-get-started">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-agents">
              {data.activeAgents} / {data.totalAgents}
            </div>
            <p className="text-xs text-muted-foreground">Ready to receive calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-calls">
              {data.totalCalls.toLocaleString()}
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <PhoneIncoming className="h-3 w-3" /> {data.inboundCalls}
              </span>
              <span className="flex items-center gap-1">
                <PhoneOutgoing className="h-3 w-3" /> {data.outboundCalls}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-success-rate">
              {(data.successRate * 100).toFixed(1)}%
            </div>
            <Progress value={data.successRate * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-cost">
              ${data.totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalMinutes.toFixed(0)} minutes used
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>Latest AI voice interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {callsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentCalls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No calls yet. Create an agent and start receiving calls!
              </div>
            ) : (
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                    data-testid={`call-row-${call.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {call.direction === "inbound" ? (
                        <PhoneIncoming className="h-4 w-4 text-green-500" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{call.agentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(call.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, "0")}
                      </span>
                      {call.status === "completed" ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {call.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentCalls.length > 0 && (
              <Link href="/portal/ai-agent/call-logs">
                <Button variant="ghost" className="w-full mt-4" data-testid="button-view-all-calls">
                  View All Calls
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage This Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Minutes Used</span>
                  <span>{data.totalMinutes.toFixed(0)} / 1,000</span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">${data.balance.toFixed(2)}</span>
              </div>
              <Link href="/portal/billing">
                <Button variant="outline" className="w-full" size="sm" data-testid="button-add-funds">
                  Add Funds
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/portal/ai-agent">
                <Button variant="ghost" className="w-full justify-start" data-testid="link-manage-agents">
                  <Bot className="h-4 w-4 mr-2" />
                  Manage Agents
                </Button>
              </Link>
              <Link href="/portal/ai-agent/knowledge">
                <Button variant="ghost" className="w-full justify-start" data-testid="link-knowledge-base">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Knowledge Base
                </Button>
              </Link>
              <Link href="/portal/ai-agent/campaigns">
                <Button variant="ghost" className="w-full justify-start" data-testid="link-campaigns">
                  <Users className="h-4 w-4 mr-2" />
                  Campaigns
                </Button>
              </Link>
              <Link href="/portal/ai-agent/analytics">
                <Button variant="ghost" className="w-full justify-start" data-testid="link-analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
