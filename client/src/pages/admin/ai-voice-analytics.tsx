import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, TrendingDown, Phone, Clock, DollarSign, Bot,
  PhoneIncoming, PhoneOutgoing, BarChart3, Loader2, MessageSquare
} from "lucide-react";
import { useState } from "react";

type AnalyticsData = {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  totalDuration: number;
  avgDuration: number;
  totalCost: number;
  avgCost: number;
  successRate: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topAgents: {
    id: string;
    name: string;
    calls: number;
    successRate: number;
  }[];
  callsByHour: number[];
  callsByDay: { day: string; calls: number }[];
};

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: any;
  trend?: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend !== undefined && trend !== 0 && (
              trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )
            )}
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AiVoiceAnalyticsPage() {
  const [period, setPeriod] = useState("7d");

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/ai-voice/analytics", period],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const defaultAnalytics: AnalyticsData = {
    totalCalls: 0,
    inboundCalls: 0,
    outboundCalls: 0,
    totalDuration: 0,
    avgDuration: 0,
    totalCost: 0,
    avgCost: 0,
    successRate: 0,
    sentimentBreakdown: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    topAgents: [],
    callsByHour: Array(24).fill(0),
    callsByDay: [
      { day: "Mon", calls: 0 },
      { day: "Tue", calls: 0 },
      { day: "Wed", calls: 0 },
      { day: "Thu", calls: 0 },
      { day: "Fri", calls: 0 },
      { day: "Sat", calls: 0 },
      { day: "Sun", calls: 0 },
    ],
  };

  const data: AnalyticsData = analytics || defaultAnalytics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">AI Voice performance metrics and insights</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36" data-testid="select-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Calls"
          value={data.totalCalls.toLocaleString()}
          subtitle="+12% from last period"
          icon={Phone}
          trend={12}
        />
        <MetricCard
          title="Success Rate"
          value={`${Math.round(data.successRate * 100)}%`}
          subtitle="+3% from last period"
          icon={TrendingUp}
          trend={3}
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(data.avgDuration)}
          subtitle="Per call"
          icon={Clock}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${data.totalCost.toFixed(2)}`}
          subtitle="+8% from last period"
          icon={DollarSign}
          trend={8}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Call Direction
            </CardTitle>
            <CardDescription>Inbound vs outbound call distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneIncoming className="h-4 w-4 text-green-500" />
                    <span>Inbound</span>
                  </div>
                  <span className="font-medium">{data.inboundCalls}</span>
                </div>
                <Progress 
                  value={(data.inboundCalls / data.totalCalls) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                    <span>Outbound</span>
                  </div>
                  <span className="font-medium">{data.outboundCalls}</span>
                </div>
                <Progress 
                  value={(data.outboundCalls / data.totalCalls) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sentiment Analysis
            </CardTitle>
            <CardDescription>Call sentiment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500/10 text-green-600">Positive</Badge>
                  </span>
                  <span className="font-medium">{Math.round(data.sentimentBreakdown.positive * 100)}%</span>
                </div>
                <Progress value={data.sentimentBreakdown.positive * 100} className="h-2 bg-green-100 [&>div]:bg-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">Neutral</Badge>
                  </span>
                  <span className="font-medium">{Math.round(data.sentimentBreakdown.neutral * 100)}%</span>
                </div>
                <Progress value={data.sentimentBreakdown.neutral * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Badge variant="destructive" className="bg-red-500/10 text-red-600">Negative</Badge>
                  </span>
                  <span className="font-medium">{Math.round(data.sentimentBreakdown.negative * 100)}%</span>
                </div>
                <Progress value={data.sentimentBreakdown.negative * 100} className="h-2 bg-red-100 [&>div]:bg-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Top Performing Agents
            </CardTitle>
            <CardDescription>Agents by call volume and success rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">{agent.calls} calls</div>
                    </div>
                  </div>
                  <Badge variant={agent.successRate > 0.85 ? "default" : "secondary"}>
                    {Math.round(agent.successRate * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Calls by Day
            </CardTitle>
            <CardDescription>Weekly call volume distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {data.callsByDay.map((day) => {
                const maxCalls = Math.max(...data.callsByDay.map(d => d.calls));
                const height = (day.calls / maxCalls) * 100;
                return (
                  <div key={day.day} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-primary/20 rounded-t-sm relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div 
                        className="absolute inset-0 bg-primary rounded-t-sm"
                        style={{ height: "100%" }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs bg-popover border rounded px-1">
                        {day.calls}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
