import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Server, Database, Cpu, HardDrive, Clock, Activity, 
  AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  Gauge, Zap, Timer, MemoryStick, Radio, Globe,
  Settings, FileText, Bell, Shield, Layers,
  Play, Pause
} from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface OverviewData {
  globalStatus: "green" | "yellow" | "red";
  lastUpdated: string | null;
  kpis: {
    apiP95Latency: number;
    dbP95Latency: number;
    errorRate5xx: number;
    redisP95Latency: number;
    queuedJobs: number;
    stuckJobs: number;
    activeAlerts: number;
    violationsLast15m: number;
  };
  activeAlerts: Array<{
    id: string;
    severity: string;
    title: string;
    description: string;
    firstSeenAt: string | null;
  }>;
  topSlowEndpoints: Array<{ endpoint: string; p95: number }>;
  topSlowQueries: Array<{ query: string; durationMs: number }>;
}

interface PerformanceBudget {
  name: string;
  metricType: string;
  target: Record<string, number>;
  window: string;
  currentValue: number;
  status: "green" | "yellow" | "red";
  lastUpdated: string | null;
}

interface HealthCheck {
  component: string;
  status: "pass" | "degraded" | "fail";
  latency: number;
  checkedAt: string | null;
}

interface Alert {
  id: string;
  severity: string;
  source: string;
  title: string;
  description: string;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  status: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  snoozedUntil: string | null;
  resolvedAt: string | null;
}

function GlobalStatusIndicator({ status }: { status: "green" | "yellow" | "red" }) {
  const config = {
    green: { color: "bg-green-500", label: "Healthy", textColor: "text-green-600" },
    yellow: { color: "bg-yellow-500", label: "Warning", textColor: "text-yellow-600" },
    red: { color: "bg-red-500", label: "Critical", textColor: "text-red-600" },
  };
  const { color, label, textColor } = config[status];
  
  return (
    <div className="flex items-center gap-2" data-testid="global-status">
      <div className={cn("w-3 h-3 rounded-full animate-pulse", color)} />
      <span className={cn("font-semibold", textColor)}>{label}</span>
    </div>
  );
}

function KPICard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status 
}: { 
  title: string; 
  value: number | string; 
  unit?: string; 
  icon: typeof Server;
  status?: "good" | "warning" | "critical";
}) {
  return (
    <Card className={cn(
      "transition-colors",
      status === "critical" && "border-red-500/50",
      status === "warning" && "border-yellow-500/50"
    )}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-md",
              status === "critical" ? "bg-red-100 dark:bg-red-900/30" :
              status === "warning" ? "bg-yellow-100 dark:bg-yellow-900/30" :
              "bg-primary/10"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                status === "critical" ? "text-red-600" :
                status === "warning" ? "text-yellow-600" :
                "text-primary"
              )} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{title}</p>
              <p className="text-lg font-bold">
                {typeof value === "number" ? value.toFixed(value < 10 ? 2 : 0) : value}
                {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StaleBanner({ lastUpdated }: { lastUpdated: string | null | undefined }) {
  if (!lastUpdated) {
    return (
      <div className="px-4 py-2 rounded-md mb-4 flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" data-testid="stale-banner">
        <AlertTriangle className="h-4 w-4" />
        <span>No data collected yet</span>
      </div>
    );
  }

  const now = new Date();
  const updated = new Date(lastUpdated);
  const ageMs = now.getTime() - updated.getTime();
  const ageMinutes = ageMs / 60000;

  if (ageMinutes < 2) return null;

  return (
    <div className={cn(
      "px-4 py-2 rounded-md mb-4 flex items-center gap-2",
      ageMinutes >= 5 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
    )} data-testid="stale-banner">
      <AlertTriangle className="h-4 w-4" />
      <span>
        {ageMinutes >= 5 ? "Data collection stalled" : "Stale data"} - 
        Last updated {Math.floor(ageMinutes)} minutes ago
      </span>
    </div>
  );
}

function formatTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return "Never";
  return new Date(timestamp).toLocaleTimeString();
}

function formatDateTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return "Never";
  return new Date(timestamp).toLocaleString();
}

function OverviewTab() {
  const { data, isLoading } = useQuery<OverviewData>({
    queryKey: ["/api/system/overview"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const kpis = data?.kpis || {};
  const apiStatus = kpis.apiP95Latency > 250 ? "critical" : kpis.apiP95Latency > 120 ? "warning" : "good";
  const dbStatus = kpis.dbP95Latency > 150 ? "critical" : kpis.dbP95Latency > 60 ? "warning" : "good";

  return (
    <div className="space-y-6">
      <StaleBanner lastUpdated={data?.lastUpdated} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="API p95 Latency" value={kpis.apiP95Latency || 0} unit="ms" icon={Zap} status={apiStatus} />
        <KPICard title="DB p95 Latency" value={kpis.dbP95Latency || 0} unit="ms" icon={Database} status={dbStatus} />
        <KPICard title="5xx Error Rate" value={kpis.errorRate5xx || 0} unit="%" icon={AlertTriangle} />
        <KPICard title="Active Alerts" value={kpis.activeAlerts || 0} icon={Bell} status={kpis.activeAlerts > 0 ? "warning" : "good"} />
        <KPICard title="Queued Jobs" value={kpis.queuedJobs || 0} icon={Layers} />
        <KPICard title="Stuck Jobs" value={kpis.stuckJobs || 0} icon={Cpu} status={kpis.stuckJobs > 0 ? "critical" : "good"} />
        <KPICard title="Redis p95" value={kpis.redisP95Latency || 0} unit="ms" icon={Radio} />
        <KPICard title="Violations (15m)" value={kpis.violationsLast15m || 0} icon={Timer} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.activeAlerts?.length ? (
              <div className="space-y-2">
                {data.activeAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      {alert.severity === "critical" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm font-medium">{alert.title}</span>
                    </div>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                No active alerts
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Slow Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topSlowEndpoints?.length ? (
              <div className="space-y-2">
                {data.topSlowEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-sm font-mono truncate max-w-[200px]">{ep.endpoint}</span>
                    <Badge variant="outline">{ep.p95}ms</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                No slow endpoints
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PerformanceTab() {
  const { data, isLoading } = useQuery<{ budgets: PerformanceBudget[] }>({
    queryKey: ["/api/system/performance"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Budgets (SLO)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.budgets?.map((budget, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{budget.name}</TableCell>
                <TableCell>
                  {Object.entries(budget.target).map(([k, v]) => (
                    <span key={k} className="mr-2">{k}: {v}</span>
                  ))}
                </TableCell>
                <TableCell>{budget.currentValue.toFixed(1)}ms</TableCell>
                <TableCell>{budget.window}</TableCell>
                <TableCell>
                  <Badge variant={
                    budget.status === "red" ? "destructive" :
                    budget.status === "yellow" ? "secondary" : "default"
                  }>
                    {budget.status === "green" ? "OK" : budget.status === "yellow" ? "Warning" : "Breach"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function HealthTab() {
  const { data, isLoading } = useQuery<{ checks: HealthCheck[] }>({
    queryKey: ["/api/system/health"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Checks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Last Checked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.checks?.map((check, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{check.component}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {check.status === "pass" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : check.status === "degraded" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {check.status}
                  </div>
                </TableCell>
                <TableCell>{check.latency}ms</TableCell>
                <TableCell>{formatTimestamp(check.checkedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AlertsTab() {
  const { data, isLoading, refetch } = useQuery<{ alerts: Alert[]; stats: { criticalCount: number; warningCount: number } }>({
    queryKey: ["/api/system/alerts"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("POST", `/api/system/alerts/${alertId}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Alerts</CardTitle>
        <div className="flex gap-2">
          <Badge variant="destructive">{data?.stats?.criticalCount || 0} Critical</Badge>
          <Badge variant="secondary">{data?.stats?.warningCount || 0} Warning</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>First Seen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.alerts?.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>{alert.source}</TableCell>
                <TableCell className="max-w-[200px] truncate">{alert.title}</TableCell>
                <TableCell>{formatDateTimestamp(alert.firstSeenAt)}</TableCell>
                <TableCell>{alert.status}</TableCell>
                <TableCell>
                  {alert.status === "active" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeMutation.mutate(alert.id)}
                      disabled={acknowledgeMutation.isPending}
                    >
                      Acknowledge
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function IntegrationsTab() {
  const { data, isLoading } = useQuery<{ integrations: Array<{
    name: string;
    status: string;
    latencyP95: number;
    errorRate: number;
    lastSuccessAt: string | null;
    lastFailureReason: string | null;
  }> }>({
    queryKey: ["/api/system/integrations"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Health</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Integration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>p95 Latency</TableHead>
              <TableHead>Error Rate</TableHead>
              <TableHead>Last Success</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.integrations?.map((int) => (
              <TableRow key={int.name}>
                <TableCell className="font-medium capitalize">{int.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {int.status === "healthy" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : int.status === "degraded" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {int.status}
                  </div>
                </TableCell>
                <TableCell>{int.latencyP95}ms</TableCell>
                <TableCell>{(int.errorRate * 100).toFixed(2)}%</TableCell>
                <TableCell>
                  {formatDateTimestamp(int.lastSuccessAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function JobsTab() {
  const { data, isLoading } = useQuery<{
    queuedJobs: number;
    runningJobs: number;
    failedJobs15m: number;
    failedJobs24h: number;
    oldestJobAge: number;
    stuckJobCount: number;
    successRate: number;
  }>({
    queryKey: ["/api/system/jobs"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Queued Jobs" value={data?.queuedJobs || 0} icon={Layers} />
        <KPICard title="Running Jobs" value={data?.runningJobs || 0} icon={Play} />
        <KPICard title="Failed (15m)" value={data?.failedJobs15m || 0} icon={XCircle} status={data?.failedJobs15m ? "warning" : "good"} />
        <KPICard title="Stuck Jobs" value={data?.stuckJobCount || 0} icon={Pause} status={data?.stuckJobCount ? "critical" : "good"} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Queue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{data?.successRate?.toFixed(1) || 100}%</p>
            </div>
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Oldest Job Age</p>
              <p className="text-2xl font-bold">{data?.oldestJobAge || 0}s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DatabaseTab() {
  const { data, isLoading } = useQuery<{
    p95Latency: number;
    p99Latency: number;
    poolUsed: number;
    poolTotal: number;
    poolSaturation: number;
    slowQueryCount: number;
    slowQueries: Array<{ query: string; durationMs: number }>;
  }>({
    queryKey: ["/api/system/database"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Query p95" value={data?.p95Latency || 0} unit="ms" icon={Database} />
        <KPICard title="Query p99" value={data?.p99Latency || 0} unit="ms" icon={Database} />
        <KPICard title="Pool Saturation" value={data?.poolSaturation || 0} unit="%" icon={Gauge} />
        <KPICard title="Slow Queries" value={data?.slowQueryCount || 0} icon={Timer} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Slow Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.slowQueries?.length ? (
            <div className="space-y-2">
              {data.slowQueries.slice(0, 10).map((q, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                  <span className="text-sm font-mono truncate max-w-[400px]">{q.query}</span>
                  <Badge variant="destructive">{q.durationMs}ms</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              No slow queries
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CacheTab() {
  const { data, isLoading } = useQuery<{
    redis: { p95Latency: number; cacheHitRate: number; connected: boolean };
    r2: { p95Latency: number; uploadErrors: number; downloadErrors: number };
  }>({
    queryKey: ["/api/system/cache"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Redis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={data?.redis?.connected ? "default" : "destructive"}>
                {data?.redis?.connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>p95 Latency</span>
              <span className="font-bold">{data?.redis?.p95Latency || 0}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cache Hit Rate</span>
              <span className="font-bold">{(data?.redis?.cacheHitRate || 0) * 100}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>R2 Object Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>p95 Latency</span>
              <span className="font-bold">{data?.r2?.p95Latency || 0}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Upload Errors</span>
              <span className="font-bold">{data?.r2?.uploadErrors || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Download Errors</span>
              <span className="font-bold">{data?.r2?.downloadErrors || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditTab() {
  const { data, isLoading } = useQuery<{ records: Array<{
    id: string;
    eventType: string;
    actorEmail: string;
    description: string;
    occurredAt: string | null;
  }> }>({
    queryKey: ["/api/system/audit"],
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Audit Events</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.records?.length ? data.records.map((r) => (
              <TableRow key={r.id}>
                <TableCell><Badge variant="outline">{r.eventType}</Badge></TableCell>
                <TableCell>{r.actorEmail || "System"}</TableCell>
                <TableCell className="max-w-[300px] truncate">{r.description}</TableCell>
                <TableCell>{formatDateTimestamp(r.occurredAt)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No recent audit events
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function SystemStatusPage() {
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: overview, refetch, isFetching } = useQuery<OverviewData>({
    queryKey: ["/api/system/overview"],
    refetchInterval: isLive ? 30000 : false,
    staleTime: 10000,
  });

  const acknowledgeAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/system/alerts/acknowledge-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
    },
  });

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsLive(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">System Status</h1>
          <GlobalStatusIndicator status={overview?.globalStatus || "green"} />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Last updated: {formatTimestamp(overview?.lastUpdated)}
          </span>
          <div className="flex items-center gap-2">
            <Switch 
              checked={isLive} 
              onCheckedChange={setIsLive}
              data-testid="switch-live"
            />
            <span className="text-sm">{isLive ? "Live" : "Paused"}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => acknowledgeAllMutation.mutate()}
            disabled={acknowledgeAllMutation.isPending}
            data-testid="button-acknowledge-all"
          >
            Acknowledge All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="health" data-testid="tab-health">Health</TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">API & Errors</TabsTrigger>
          <TabsTrigger value="database" data-testid="tab-database">Database</TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs</TabsTrigger>
          <TabsTrigger value="cache" data-testid="tab-cache">Cache</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">Alerts</TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="performance" className="mt-6">
          <PerformanceTab />
        </TabsContent>
        <TabsContent value="health" className="mt-6">
          <HealthTab />
        </TabsContent>
        <TabsContent value="api" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="database" className="mt-6">
          <DatabaseTab />
        </TabsContent>
        <TabsContent value="jobs" className="mt-6">
          <JobsTab />
        </TabsContent>
        <TabsContent value="cache" className="mt-6">
          <CacheTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="alerts" className="mt-6">
          <AlertsTab />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
