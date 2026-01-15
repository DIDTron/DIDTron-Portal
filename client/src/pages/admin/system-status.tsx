import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { 
  Server, Database, Cpu, HardDrive, Clock, Activity, 
  AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  Gauge, Zap, Timer, MemoryStick, Radio, Globe,
  Settings, FileText, Bell, Shield, Layers,
  Play, Pause, Search, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { queryClient, apiRequest, STALE_TIME } from "@/lib/queryClient";

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
  status,
  onClick,
  testId
}: { 
  title: string; 
  value: number | string; 
  unit?: string; 
  icon: typeof Server;
  status?: "good" | "warning" | "critical";
  onClick?: () => void;
  testId?: string;
}) {
  return (
    <Card 
      className={cn(
        "transition-colors",
        status === "critical" && "border-red-500/50",
        status === "warning" && "border-yellow-500/50",
        onClick && "cursor-pointer overflow-visible hover-elevate"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { 
        if (e.key === "Enter" || e.key === " ") { 
          e.preventDefault(); 
          onClick(); 
        } 
      } : undefined}
      data-testid={testId}
    >
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
          {onClick && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StaleBanner({ lastUpdated, dataUpdatedAt }: { lastUpdated?: string | null; dataUpdatedAt?: number }) {
  // Use API's lastUpdated if available, otherwise fall back to query's dataUpdatedAt
  const timestamp = lastUpdated || (dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null);
  
  if (!timestamp) {
    return (
      <div className="px-4 py-2 rounded-md mb-4 flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" data-testid="stale-banner">
        <AlertTriangle className="h-4 w-4" />
        <span>No data collected yet</span>
      </div>
    );
  }

  const now = new Date();
  const updated = new Date(timestamp);
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
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit",
    hour12: false,
    timeZone: "UTC" 
  }) + " UTC";
}

function formatDateTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  }) + " UTC";
}

function formatAsOf(timestamp: string | null | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) return `as of ${diffSec}s ago`;
  if (diffSec < 3600) return `as of ${Math.floor(diffSec / 60)}m ago`;
  return `as of ${formatTimestamp(timestamp)}`;
}

function OverviewTab({ onNavigateTab }: { onNavigateTab: (tab: string) => void }) {
  const { data, isLoading } = useQuery<OverviewData>({
    queryKey: ["/api/system/overview"],
    refetchInterval: 30000,
    staleTime: STALE_TIME.REALTIME,
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const kpis = data?.kpis ?? { 
    apiP95Latency: 0, 
    dbP95Latency: 0, 
    errorRate5xx: 0, 
    redisP95Latency: 0, 
    queuedJobs: 0, 
    stuckJobs: 0, 
    activeAlerts: 0, 
    violationsLast15m: 0 
  };
  const apiStatus = kpis.apiP95Latency > 250 ? "critical" : kpis.apiP95Latency > 120 ? "warning" : "good";
  const dbStatus = kpis.dbP95Latency > 150 ? "critical" : kpis.dbP95Latency > 60 ? "warning" : "good";

  return (
    <div className="space-y-6">
      <StaleBanner lastUpdated={data?.lastUpdated} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard 
          title="API p95 Latency" 
          value={kpis.apiP95Latency || 0} 
          unit="ms" 
          icon={Zap} 
          status={apiStatus} 
          onClick={() => onNavigateTab("api")}
          testId="kpi-api-latency"
        />
        <KPICard 
          title="DB p95 Latency" 
          value={kpis.dbP95Latency || 0} 
          unit="ms" 
          icon={Database} 
          status={dbStatus} 
          onClick={() => onNavigateTab("database")}
          testId="kpi-db-latency"
        />
        <KPICard 
          title="5xx Error Rate" 
          value={kpis.errorRate5xx || 0} 
          unit="%" 
          icon={AlertTriangle} 
          onClick={() => onNavigateTab("api")}
          testId="kpi-error-rate"
        />
        <KPICard 
          title="Active Alerts" 
          value={kpis.activeAlerts || 0} 
          icon={Bell} 
          status={kpis.activeAlerts > 0 ? "warning" : "good"} 
          onClick={() => onNavigateTab("alerts")}
          testId="kpi-active-alerts"
        />
        <KPICard 
          title="Queued Jobs" 
          value={kpis.queuedJobs || 0} 
          icon={Layers} 
          onClick={() => onNavigateTab("jobs")}
          testId="kpi-queued-jobs"
        />
        <KPICard 
          title="Stuck Jobs" 
          value={kpis.stuckJobs || 0} 
          icon={Cpu} 
          status={kpis.stuckJobs > 0 ? "critical" : "good"} 
          onClick={() => onNavigateTab("jobs")}
          testId="kpi-stuck-jobs"
        />
        <KPICard 
          title="Redis p95" 
          value={kpis.redisP95Latency || 0} 
          unit="ms" 
          icon={Radio} 
          onClick={() => onNavigateTab("cache")}
          testId="kpi-redis-latency"
        />
        <KPICard 
          title="Violations (15m)" 
          value={kpis.violationsLast15m || 0} 
          icon={Timer} 
          onClick={() => onNavigateTab("performance")}
          testId="kpi-violations"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-elevate cursor-pointer" onClick={() => onNavigateTab("alerts")}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Active Alerts</CardTitle>
            <span className="text-xs text-muted-foreground">{formatAsOf(data?.lastUpdated)}</span>
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
                {data.activeAlerts.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    +{data.activeAlerts.length - 5} more alerts
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                No active alerts
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate cursor-pointer" onClick={() => onNavigateTab("api")}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Top Slow Endpoints</CardTitle>
            <span className="text-xs text-muted-foreground">{formatAsOf(data?.lastUpdated)}</span>
          </CardHeader>
          <CardContent>
            {data?.topSlowEndpoints?.length ? (
              <div className="space-y-2">
                {data.topSlowEndpoints.slice(0, 5).map((ep, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-sm font-mono truncate max-w-[200px]">{ep.endpoint}</span>
                    <Badge variant="outline">{ep.p95}ms</Badge>
                  </div>
                ))}
                {data.topSlowEndpoints.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    +{data.topSlowEndpoints.length - 5} more slow endpoints
                  </div>
                )}
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

interface ApiErrorsData {
  requestCount15m: number;
  p95Latency: number;
  errorRate5xx: number;
  errorRate4xx: number;
  slowEndpoints: Array<{ endpoint: string; p95: number; count: number }>;
  errorEndpoints: Array<{ endpoint: string; errorCount: number; errorRate: number }>;
  topEndpoints: Array<{ endpoint: string; count: number; avgLatency: number }>;
}

function ApiErrorsTab() {
  const { data, isLoading, dataUpdatedAt } = useQuery<ApiErrorsData>({
    queryKey: ["/api/system/api-errors"],
    refetchInterval: 30000,
    staleTime: STALE_TIME.REALTIME,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Requests (15m)" value={data?.requestCount15m || 0} icon={Globe} />
        <KPICard title="API p95" value={data?.p95Latency || 0} unit="ms" icon={Zap} />
        <KPICard 
          title="5xx Error Rate" 
          value={(data?.errorRate5xx || 0).toFixed(2)} 
          unit="%" 
          icon={XCircle} 
          status={(data?.errorRate5xx || 0) > 1 ? "critical" : (data?.errorRate5xx || 0) > 0.3 ? "warning" : "good"} 
        />
        <KPICard 
          title="4xx Error Rate" 
          value={(data?.errorRate4xx || 0).toFixed(2)} 
          unit="%" 
          icon={AlertTriangle} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">All Slow Endpoints (p95 {">"} 100ms)</CardTitle>
            <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {data?.slowEndpoints?.length ? (
              <div className="space-y-2">
                {data.slowEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono truncate max-w-[200px]">{ep.endpoint}</span>
                      <span className="text-xs text-muted-foreground">{ep.count} requests</span>
                    </div>
                    <Badge variant="destructive">{ep.p95}ms</Badge>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Error Endpoints (5xx/4xx)</CardTitle>
            <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {data?.errorEndpoints?.length ? (
              <div className="space-y-2">
                {data.errorEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono truncate max-w-[200px]">{ep.endpoint}</span>
                      <span className="text-xs text-muted-foreground">{ep.errorRate.toFixed(1)}% error rate</span>
                    </div>
                    <Badge variant="destructive">{ep.errorCount} errors</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                No error endpoints
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Top Endpoints by Request Volume</CardTitle>
          <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Avg Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.topEndpoints?.length ? data.topEndpoints.slice(0, 15).map((ep, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm">{ep.endpoint}</TableCell>
                  <TableCell>{ep.count}</TableCell>
                  <TableCell>{ep.avgLatency}ms</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No endpoint data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface Violation {
  metricType: string;
  operation: string;
  duration: number;
  threshold: number;
  timestamp: string;
}

function PerformanceTab() {
  const { data, isLoading, dataUpdatedAt } = useQuery<{ budgets: PerformanceBudget[]; violations: Violation[] }>({
    queryKey: ["/api/system/performance"],
    refetchInterval: 30000,
    staleTime: STALE_TIME.REALTIME,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Performance Budgets (SLO)</CardTitle>
          <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Recent Violations (Last 15 Minutes)
          </CardTitle>
          <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
        </CardHeader>
        <CardContent>
          {data?.violations?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Over By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.violations.map((v, i) => (
                  <TableRow key={i} data-testid={`violation-row-${i}`}>
                    <TableCell className="text-muted-foreground" data-testid={`violation-time-${i}`}>
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell data-testid={`violation-type-${i}`}>
                      <Badge variant="outline">
                        {v.metricType === "api" ? "API" : 
                         v.metricType === "database" ? "Database" : 
                         v.metricType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[300px] truncate" title={v.operation} data-testid={`violation-operation-${i}`}>
                      {v.operation}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium" data-testid={`violation-duration-${i}`}>{Math.round(v.duration)}ms</TableCell>
                    <TableCell data-testid={`violation-threshold-${i}`}>{v.threshold}ms</TableCell>
                    <TableCell className="text-red-600" data-testid={`violation-over-${i}`}>
                      +{Math.round(v.duration - v.threshold)}ms
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              No violations in the last 15 minutes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HealthTab() {
  const { data, isLoading, dataUpdatedAt } = useQuery<{ checks: HealthCheck[] }>({
    queryKey: ["/api/system/health"],
    refetchInterval: 30000,
    staleTime: STALE_TIME.REALTIME,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Health Checks</CardTitle>
          <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
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
    </div>
  );
}

function AlertsTab() {
  const { data, isLoading, refetch, dataUpdatedAt } = useQuery<{ alerts: Alert[]; stats: { criticalCount: number; warningCount: number } }>({
    queryKey: ["/api/system/alerts"],
    refetchInterval: 30000,
    staleTime: STALE_TIME.REALTIME,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("POST", `/api/system/alerts/${alertId}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <CardTitle>System Alerts</CardTitle>
            <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
          </div>
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
    </div>
  );
}

function IntegrationsTab() {
  const { data, isLoading, dataUpdatedAt, refetch } = useQuery<{ integrations: Array<{
    name: string;
    status: string;
    latencyP95: number;
    errorRate: number;
    lastSuccessAt: string | null;
    lastFailureReason: string | null;
  }> }>({
    queryKey: ["/api/system/integrations"],
    refetchInterval: 30000,
    staleTime: STALE_TIME.REALTIME,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/system/integrations/refresh");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/integrations"] });
      refetch();
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <CardTitle>Integration Health</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              data-testid="button-refresh-integrations"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshMutation.isPending && "animate-spin")} />
              {refreshMutation.isPending ? "Testing APIs..." : "Refresh Live"}
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
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
    </div>
  );
}

function JobsTab() {
  const { data, isLoading, dataUpdatedAt } = useQuery<{
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
    staleTime: STALE_TIME.REALTIME,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Queued Jobs" value={data?.queuedJobs || 0} icon={Layers} />
        <KPICard title="Running Jobs" value={data?.runningJobs || 0} icon={Play} />
        <KPICard title="Failed (15m)" value={data?.failedJobs15m || 0} icon={XCircle} status={data?.failedJobs15m ? "warning" : "good"} />
        <KPICard title="Stuck Jobs" value={data?.stuckJobCount || 0} icon={Pause} status={data?.stuckJobCount ? "critical" : "good"} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Queue Summary</CardTitle>
          <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
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
  const { data, isLoading, dataUpdatedAt } = useQuery<{
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
    staleTime: STALE_TIME.REALTIME,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Query p95" value={data?.p95Latency || 0} unit="ms" icon={Database} />
        <KPICard title="Query p99" value={data?.p99Latency || 0} unit="ms" icon={Database} />
        <KPICard title="Pool Saturation" value={data?.poolSaturation || 0} unit="%" icon={Gauge} />
        <KPICard title="Slow Queries" value={data?.slowQueryCount || 0} icon={Timer} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">All Slow Queries ({">"} 200ms)</CardTitle>
          <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
        </CardHeader>
        <CardContent className="max-h-80 overflow-y-auto">
          {data?.slowQueries?.length ? (
            <div className="space-y-2">
              {data.slowQueries.map((q, i) => (
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

interface CacheData {
  redis: { 
    p95Latency: number; 
    cacheHitRate: number; 
    connected: boolean;
    rateLimitRejections?: number;
  };
  r2: { 
    p95Latency: number; 
    uploadErrors: number; 
    downloadErrors: number;
    lastExportFile?: string | null;
    lastExportTime?: string | null;
  };
  storage?: {
    usedMB: number;
    totalMB: number;
    usagePercent: number;
  };
}

function CacheTab() {
  const { data, isLoading, dataUpdatedAt } = useQuery<CacheData>({
    queryKey: ["/api/system/cache"],
    refetchInterval: 30000,
    staleTime: STALE_TIME.REALTIME,
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;
  const storagePercent = data?.storage?.usagePercent || 0;
  const storageStatus = storagePercent > 90 ? "critical" : storagePercent > 70 ? "warning" : "good";

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard 
          title="Redis p95" 
          value={data?.redis?.p95Latency || 0} 
          unit="ms" 
          icon={Radio}
          status={!data?.redis?.connected ? "critical" : undefined}
        />
        <KPICard 
          title="R2 p95" 
          value={data?.r2?.p95Latency || 0} 
          unit="ms" 
          icon={HardDrive}
        />
        <KPICard 
          title="Cache Hit Rate" 
          value={((data?.redis?.cacheHitRate || 0) * 100).toFixed(1)} 
          unit="%" 
          icon={Gauge}
        />
        <KPICard 
          title="Replit Storage" 
          value={data?.storage?.usedMB?.toFixed(1) || 0} 
          unit="MB" 
          icon={HardDrive}
          status={storageStatus}
        />
      </div>

      {data?.storage && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Replit Storage Usage</CardTitle>
              <p className="text-xs text-muted-foreground">Local disk storage for the Replit environment</p>
            </div>
            <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>{data.storage.usedMB.toFixed(1)} MB used of {data.storage.totalMB.toFixed(1)} MB</span>
                <span className="font-bold">{data.storage.usagePercent.toFixed(1)}%</span>
              </div>
              <Progress 
                value={data.storage.usagePercent} 
                className={cn(
                  storageStatus === "critical" && "[&>div]:bg-red-500",
                  storageStatus === "warning" && "[&>div]:bg-yellow-500"
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Redis</CardTitle>
            <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
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
                <span className="font-bold">{((data?.redis?.cacheHitRate || 0) * 100).toFixed(1)}%</span>
              </div>
              {data?.redis?.rateLimitRejections !== undefined && (
                <div className="flex items-center justify-between">
                  <span>Rate Limit Rejections</span>
                  <span className="font-bold">{data.redis.rateLimitRejections}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>R2 Object Storage</CardTitle>
            <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
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
              {data?.r2?.lastExportTime && (
                <div className="flex items-center justify-between">
                  <span>Last Export</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTimestamp(data.r2.lastExportTime)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuditTab() {
  const [periodFilter, setPeriodFilter] = useState("24h");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading, dataUpdatedAt } = useQuery<{ records: Array<{
    id: string;
    eventType: string;
    actorEmail: string;
    description: string;
    occurredAt: string | null;
  }> }>({
    queryKey: ["/api/system/audit", periodFilter],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/system/audit?period=${periodFilter}`);
      return response.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const lastUpdatedStr = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

  const filteredRecords = useMemo(() => {
    if (!data?.records) return [];
    
    return data.records.filter((r) => {
      if (categoryFilter !== "all" && r.eventType !== categoryFilter) return false;
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        if (!r.description.toLowerCase().includes(search) && 
            !(r.actorEmail?.toLowerCase().includes(search))) {
          return false;
        }
      }
      return true;
    });
  }, [data?.records, categoryFilter, searchQuery]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredRecords, 10);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const eventTypes = ["all", "deployment", "migration", "config_change", "admin_action"];

  return (
    <div className="space-y-6">
      <StaleBanner dataUpdatedAt={dataUpdatedAt} />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Audit Events</CardTitle>
              <span className="text-xs text-muted-foreground">{formatAsOf(lastUpdatedStr)}</span>
            </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period:</span>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-32" data-testid="audit-period-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40" data-testid="audit-category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Categories" : type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search audit events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  data-testid="audit-search"
                />
              </div>
            </div>
          </div>
        </div>
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
            {paginatedItems.length ? paginatedItems.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      r.eventType === "deployment" && "border-blue-500 text-blue-600",
                      r.eventType === "migration" && "border-purple-500 text-purple-600",
                      r.eventType === "config_change" && "border-yellow-500 text-yellow-600",
                      r.eventType === "admin_action" && "border-green-500 text-green-600"
                    )}
                  >
                    {r.eventType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </TableCell>
                <TableCell>{r.actorEmail || "System"}</TableCell>
                <TableCell className="max-w-[300px] truncate">{r.description}</TableCell>
                <TableCell>{formatDateTimestamp(r.occurredAt)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No audit events found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <DataTableFooter
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Card>
    </div>
  );
}

export default function SystemStatusPage() {
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: overview, refetch, isFetching } = useQuery<OverviewData>({
    queryKey: ["/api/system/overview"],
    refetchInterval: isLive ? 30000 : false,
    staleTime: STALE_TIME.REALTIME,
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
            onClick={async () => {
              // Force refresh bypasses server cache
              await queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
              await fetch("/api/system/overview?force=true").then(r => r.json()).then(data => {
                queryClient.setQueryData(["/api/system/overview"], data);
              });
            }}
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
          <OverviewTab onNavigateTab={setActiveTab} />
        </TabsContent>
        <TabsContent value="performance" className="mt-6">
          <PerformanceTab />
        </TabsContent>
        <TabsContent value="health" className="mt-6">
          <HealthTab />
        </TabsContent>
        <TabsContent value="api" className="mt-6">
          <ApiErrorsTab />
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
