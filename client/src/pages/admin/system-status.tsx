import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Server, Database, Cpu, HardDrive, Clock, Activity, 
  AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  Gauge, Zap, Timer, MemoryStick
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemStatus {
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  performance: {
    totalViolations: number;
    last15Minutes: number;
    lastHour: number;
    budget: {
      apiResponseTime: number;
      queryExecutionTime: number;
      memoryUsageMb: number;
    };
    lastAlertTime: string | null;
  };
  services: {
    database: "online" | "offline" | "degraded";
    api: "online" | "offline" | "degraded";
    ai: "online" | "offline" | "degraded";
  };
  timestamp: string;
}

interface PerformanceData {
  stats: {
    totalViolations: number;
    last15Minutes: number;
    lastHour: number;
    budget: {
      apiResponseTime: number;
      queryExecutionTime: number;
      memoryUsageMb: number;
    };
    lastAlertTime: string | null;
  };
  violations: Array<{
    metric: string;
    actual: number;
    threshold: number;
    unit: string;
    endpoint?: string;
    timestamp: string;
  }>;
}

interface JobQueueStatus {
  stats: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  recentJobs: Array<{
    id: number;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

function StatusBadge({ status }: { status: "online" | "offline" | "degraded" | "healthy" | "critical" }) {
  const config = {
    online: { color: "bg-green-500", label: "Online" },
    healthy: { color: "bg-green-500", label: "Healthy" },
    degraded: { color: "bg-yellow-500", label: "Degraded" },
    offline: { color: "bg-red-500", label: "Offline" },
    critical: { color: "bg-red-500", label: "Critical" },
  };
  
  const { color, label } = config[status] || config.offline;
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function BudgetIndicator({ label, actual, budget, unit }: { label: string; actual: number; budget: number; unit: string }) {
  const percentage = Math.min((actual / budget) * 100, 100);
  const status = percentage > 90 ? "critical" : percentage > 70 ? "warning" : "good";
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {actual.toFixed(0)}{unit} / {budget}{unit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          "h-2",
          status === "critical" && "[&>div]:bg-red-500",
          status === "warning" && "[&>div]:bg-yellow-500"
        )}
      />
      <div className="flex items-center gap-1">
        {status === "good" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
        {status === "warning" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
        {status === "critical" && <XCircle className="h-3 w-3 text-red-500" />}
        <span className={cn(
          "text-xs",
          status === "good" && "text-green-600",
          status === "warning" && "text-yellow-600",
          status === "critical" && "text-red-600"
        )}>
          {status === "good" ? "Within budget" : status === "warning" ? "Approaching limit" : "Over budget"}
        </span>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getRecentApiLatency(performance: PerformanceData | undefined): number {
  if (!performance?.violations?.length) return 0;
  const apiViolations = performance.violations.filter(v => v.metric === "API Response Time");
  if (apiViolations.length === 0) return 0;
  const mostRecent = apiViolations.reduce((latest, current) => 
    new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
  );
  return mostRecent.actual;
}

function getRecentQueryLatency(performance: PerformanceData | undefined): number {
  if (!performance?.violations?.length) return 0;
  const queryViolations = performance.violations.filter(v => v.metric === "Query Execution Time");
  if (queryViolations.length === 0) return 0;
  const mostRecent = queryViolations.reduce((latest, current) => 
    new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
  );
  return mostRecent.actual;
}

export default function SystemStatusPage() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus, isFetching: statusFetching } = useQuery<SystemStatus>({
    queryKey: ["/api/system/status"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: performance, isLoading: perfLoading, refetch: refetchPerf } = useQuery<PerformanceData>({
    queryKey: ["/api/system/performance"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const { data: jobQueue, isLoading: jobLoading } = useQuery<JobQueueStatus>({
    queryKey: ["/api/job-queue/status"],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const handleRefresh = () => {
    refetchStatus();
    refetchPerf();
  };

  const isLoading = statusLoading || perfLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">System Status</h1>
          <p className="text-muted-foreground">Real-time platform health and performance monitoring</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={statusFetching}
          data-testid="button-refresh-status"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", statusFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1,2,3,4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card data-testid="card-system-status">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">System Status</p>
                    <StatusBadge status={status?.status || "offline"} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-uptime">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="text-xl font-bold" data-testid="text-uptime">{formatUptime(status?.uptime || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-violations">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Violations (15m)</p>
                    <p className="text-xl font-bold" data-testid="text-violations">{status?.performance?.last15Minutes || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-memory">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <MemoryStick className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Memory (RSS)</p>
                    <p className="text-xl font-bold" data-testid="text-memory-rss">{status?.memory?.rssMb || 0} MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Health Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <span>PostgreSQL Database</span>
                  </div>
                  <StatusBadge status={status?.services?.database || "offline"} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <span>API Server</span>
                  </div>
                  <StatusBadge status={status?.services?.api || "offline"} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <span>AI Integrations</span>
                  </div>
                  <StatusBadge status={status?.services?.ai || "offline"} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-6">
                <BudgetIndicator 
                  label="API Response Time (p95)"
                  actual={getRecentApiLatency(performance)}
                  budget={performance?.stats?.budget?.apiResponseTime || 500}
                  unit="ms"
                />
                <BudgetIndicator 
                  label="Memory Usage (Heap)"
                  actual={status?.memory?.heapUsedMb || 0}
                  budget={performance?.stats?.budget?.memoryUsageMb || 512}
                  unit="MB"
                />
                <BudgetIndicator 
                  label="Query Execution Time"
                  actual={getRecentQueryLatency(performance)}
                  budget={performance?.stats?.budget?.queryExecutionTime || 200}
                  unit="ms"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Heap Used</span>
                    <span>{status?.memory?.heapUsedMb || 0} MB / {status?.memory?.heapTotalMb || 0} MB</span>
                  </div>
                  <Progress 
                    value={status?.memory ? (status.memory.heapUsedMb / status.memory.heapTotalMb) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>RSS Memory</span>
                    <span>{status?.memory?.rssMb || 0} MB</span>
                  </div>
                  <Progress 
                    value={Math.min((status?.memory?.rssMb || 0) / 1024 * 100, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              DataQueue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{jobQueue?.stats?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{jobQueue?.stats?.running || 0}</p>
                  <p className="text-sm text-muted-foreground">Running</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-green-600">{jobQueue?.stats?.completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-red-600">{jobQueue?.stats?.failed || 0}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Recent Performance Violations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : performance?.violations && performance.violations.length > 0 ? (
            <div className="space-y-2">
              {performance.violations.slice(0, 10).map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`violation-${i}`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <span className="font-medium">{v.metric}</span>
                      {v.endpoint && <span className="text-muted-foreground ml-2">{v.endpoint}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="destructive">{v.actual.toFixed(0)}{v.unit} / {v.threshold}{v.unit}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              No performance violations recorded
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
