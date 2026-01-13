import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
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
  Phone, TrendingUp, TrendingDown, Clock, DollarSign, ThumbsUp,
  ThumbsDown, Bot, BarChart3, Loader2, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

type AnalyticsData = {
  totalCalls: number;
  totalMinutes: number;
  totalCost: number;
  avgDuration: number;
  successRate: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topAgents: { id: string; name: string; calls: number; successRate: number }[];
  callsByDay: { date: string; calls: number; cost: number }[];
  callsByHour: number[];
  costByAgent: { name: string; cost: number }[];
};

const COLORS = ["#22c55e", "#64748b", "#ef4444"];

export default function CustomerAnalyticsPage() {
  const [period, setPeriod] = useState("7d");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/my/ai-voice/analytics", period],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const defaultData: AnalyticsData = {
    totalCalls: 0,
    totalMinutes: 0,
    totalCost: 0,
    avgDuration: 0,
    successRate: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    topAgents: [],
    callsByDay: [],
    callsByHour: Array(24).fill(0),
    costByAgent: [],
  };

  const data = analytics || defaultData;

  const sentimentData = [
    { name: "Positive", value: data.sentimentBreakdown.positive },
    { name: "Neutral", value: data.sentimentBreakdown.neutral },
    { name: "Negative", value: data.sentimentBreakdown.negative },
  ].filter(d => d.value > 0);

  if (isLoading) {
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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Track performance and optimize your AI voice agents
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32" data-testid="select-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-calls">
              {data.totalCalls.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-minutes">
              {data.totalMinutes.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.floor(data.avgDuration / 60)}:{(data.avgDuration % 60).toString().padStart(2, "0")} per call
            </p>
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
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cost">
              ${data.totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${data.totalCalls > 0 ? (data.totalCost / data.totalCalls).toFixed(2) : "0.00"}/call avg
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calls Over Time</CardTitle>
            <CardDescription>Daily call volume and costs</CardDescription>
          </CardHeader>
          <CardContent>
            {data.callsByDay.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.callsByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="calls" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Customer sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {sentimentData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No sentiment data available
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Positive</span>
                    <Badge variant="secondary">{(data.sentimentBreakdown.positive * 100).toFixed(0)}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gray-500" />
                    <span className="text-sm">Neutral</span>
                    <Badge variant="secondary">{(data.sentimentBreakdown.neutral * 100).toFixed(0)}%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Negative</span>
                    <Badge variant="secondary">{(data.sentimentBreakdown.negative * 100).toFixed(0)}%</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
            <CardDescription>Based on call volume and success rate</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topAgents.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No agent data available
              </div>
            ) : (
              <div className="space-y-4">
                {data.topAgents.map((agent, idx) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.calls} calls</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={agent.successRate * 100} className="w-20 h-2" />
                      <span className="text-sm font-medium w-12 text-right">
                        {(agent.successRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost by Agent</CardTitle>
            <CardDescription>Spending distribution across agents</CardDescription>
          </CardHeader>
          <CardContent>
            {data.costByAgent.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No cost data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.costByAgent} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="cost" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions to improve performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Optimize Greeting</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Consider shortening your agents greeting message to improve engagement rates.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Peak Hours</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Most successful calls occur between 2-4 PM. Consider scheduling campaigns during this window.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Training Opportunity</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Adding FAQ responses could reduce average call duration by 15%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
