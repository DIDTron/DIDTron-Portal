import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Square, 
  RefreshCw, 
  Trash2, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Activity,
  Ban,
  Search
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface JobStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  successRate: number;
}

interface Job {
  id: number;
  jobType: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  lockedAt?: string;
  completedAt?: string;
  failedAt?: string;
  error?: string;
  tags?: string[];
}

interface JobsResponse {
  jobs: Job[];
  labels: Record<string, string>;
  categories: Record<string, string[]>;
}

const STATUS_ICONS = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: Ban,
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  processing: "default",
  completed: "outline",
  failed: "destructive",
  cancelled: "outline",
};

export default function JobQueuePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, isFetching: statsFetching, refetch: refetchStats } = useQuery<JobStats>({
    queryKey: ["/api/admin/jobs/stats"],
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: jobsData, isLoading: jobsLoading, isFetching: jobsFetching, refetch: refetchJobs } = useQuery<JobsResponse>({
    queryKey: ["/api/admin/jobs", statusFilter, typeFilter],
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: workerStatus, isFetching: workerFetching, refetch: refetchWorker } = useQuery<{ running: boolean }>({
    queryKey: ["/api/admin/jobs/worker/status"],
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const isAnyFetching = statsFetching || jobsFetching || workerFetching || isRefreshing;

  const startWorker = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/jobs/worker/start"),
    onSuccess: () => {
      refetchWorker();
      toast({ title: "Worker started" });
    },
    onError: () => toast({ title: "Failed to start worker", variant: "destructive" }),
  });

  const stopWorker = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/jobs/worker/stop"),
    onSuccess: () => {
      refetchWorker();
      toast({ title: "Worker stopped" });
    },
    onError: () => toast({ title: "Failed to stop worker", variant: "destructive" }),
  });

  const retryJob = useMutation({
    mutationFn: (jobId: number) => apiRequest("POST", `/api/admin/jobs/${jobId}/retry`),
    onSuccess: () => {
      refetchJobs();
      refetchStats();
      toast({ title: "Job queued for retry" });
    },
    onError: () => toast({ title: "Failed to retry job", variant: "destructive" }),
  });

  const cancelJob = useMutation({
    mutationFn: (jobId: number) => apiRequest("POST", `/api/admin/jobs/${jobId}/cancel`),
    onSuccess: () => {
      refetchJobs();
      refetchStats();
      toast({ title: "Job cancelled" });
    },
    onError: () => toast({ title: "Failed to cancel job", variant: "destructive" }),
  });

  const retryAllFailed = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/jobs/retry-all-failed");
      return res.json();
    },
    onSuccess: (data: any) => {
      refetchJobs();
      refetchStats();
      toast({ title: data.message || "All failed jobs queued for retry" });
    },
    onError: () => toast({ title: "Failed to retry jobs", variant: "destructive" }),
  });

  const cleanupJobs = useMutation({
    mutationFn: async (olderThanDays: number) => {
      const res = await apiRequest("POST", "/api/admin/jobs/cleanup", { olderThanDays });
      return res.json();
    },
    onSuccess: (data: any) => {
      refetchJobs();
      refetchStats();
      toast({ title: data.message || "Old jobs cleaned up" });
    },
    onError: () => toast({ title: "Failed to cleanup jobs", variant: "destructive" }),
  });

  const reclaimStuck = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/jobs/reclaim-stuck");
      return res.json();
    },
    onSuccess: (data: any) => {
      refetchJobs();
      refetchStats();
      toast({ title: data.message || "Stuck jobs reclaimed" });
    },
    onError: () => toast({ title: "Failed to reclaim stuck jobs", variant: "destructive" }),
  });

  const jobs = jobsData?.jobs || [];
  const labels = jobsData?.labels || {};
  const categories = jobsData?.categories || {};

  const filteredJobs = jobs.filter(job => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        job.jobType.toLowerCase().includes(searchLower) ||
        (labels[job.jobType]?.toLowerCase().includes(searchLower)) ||
        JSON.stringify(job.payload).toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getJobLabel = (jobType: string) => labels[jobType] || jobType;

  const JobRow = ({ job }: { job: Job }) => {
    const StatusIcon = STATUS_ICONS[job.status] || AlertCircle;
    const isProcessing = job.status === "processing";
    
    return (
      <div 
        className="flex items-center justify-between gap-4 p-3 border-b last:border-b-0 hover-elevate cursor-pointer"
        onClick={() => {
          setSelectedJob(job);
          setShowJobDetails(true);
        }}
        data-testid={`job-row-${job.id}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <StatusIcon 
            className={`h-4 w-4 flex-shrink-0 ${isProcessing ? "animate-spin" : ""} ${
              job.status === "completed" ? "text-green-500" :
              job.status === "failed" ? "text-red-500" :
              job.status === "processing" ? "text-blue-500" :
              "text-muted-foreground"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate" data-testid={`job-type-${job.id}`}>{getJobLabel(job.jobType)}</div>
            <div className="text-xs text-muted-foreground">
              ID: {job.id} | Attempts: {job.attempts}/{job.maxAttempts}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={STATUS_COLORS[job.status]} className="capitalize" data-testid={`job-status-${job.id}`}>
            {job.status}
          </Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
          <div className="flex gap-1">
            {job.status === "failed" && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  retryJob.mutate(job.id);
                }}
                disabled={retryJob.isPending}
                data-testid={`retry-job-${job.id}`}
                aria-label="Retry"
                title="Retry"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            {(job.status === "pending" || job.status === "processing") && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  cancelJob.mutate(job.id);
                }}
                disabled={cancelJob.isPending}
                data-testid={`cancel-job-${job.id}`}
                aria-label="Cancel"
                title="Cancel"
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="page-title">Job Queue</h1>
          <p className="text-muted-foreground">Monitor and manage background jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={workerStatus?.running ? "default" : "secondary"}
            className="gap-1"
            data-testid="worker-status"
          >
            <Activity className="h-3 w-3" />
            Worker: {workerStatus?.running ? "Running" : "Stopped"}
          </Badge>
          {workerStatus?.running ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => stopWorker.mutate()}
              disabled={stopWorker.isPending}
              data-testid="button-stop-worker"
            >
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => startWorker.mutate()}
              disabled={startWorker.isPending}
              data-testid="button-start-worker"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                disabled={isAnyFetching}
                onClick={async () => {
                  setIsRefreshing(true);
                  await Promise.all([
                    refetchStats(),
                    refetchJobs(),
                    refetchWorker(),
                  ]);
                  setIsRefreshing(false);
                }}
                data-testid="button-refresh"
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isAnyFetching ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2 ml-2 pl-2 border-l">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              data-testid="switch-auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground cursor-pointer">
              Auto-refresh (30s)
            </Label>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="job-queue-tabs">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">All Jobs</TabsTrigger>
          <TabsTrigger value="failed" data-testid="tab-failed">
            Failed
            {stats?.failed ? <Badge variant="destructive" className="ml-1">{stats.failed}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending
            {stats?.pending ? <Badge variant="secondary" className="ml-1">{stats.pending}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card data-testid="stat-pending">
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-2xl">{stats?.pending ?? "-"}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-processing">
              <CardHeader className="pb-2">
                <CardDescription>Processing</CardDescription>
                <CardTitle className="text-2xl">{stats?.processing ?? "-"}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-completed">
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-2xl">{stats?.completed ?? "-"}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-failed">
              <CardHeader className="pb-2">
                <CardDescription>Failed</CardDescription>
                <CardTitle className="text-2xl text-red-500">{stats?.failed ?? "-"}</CardTitle>
              </CardHeader>
            </Card>
            <Card data-testid="stat-success-rate">
              <CardHeader className="pb-2">
                <CardDescription>Success Rate</CardDescription>
                <CardTitle className="text-2xl">{stats?.successRate ?? "-"}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {jobsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">No jobs found</div>
                  ) : (
                    jobs.slice(0, 10).map(job => <JobRow key={job.id} job={job} />)
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categories).map(([category, types]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="font-medium">{category}</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {types.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {labels[type] || type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>All Jobs</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search jobs..." 
                      className="pl-8 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-jobs"
                    />
                  </div>
                  <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-[130px]" data-testid="select-status-filter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {Object.entries(labels).map(([type, label]) => (
                        <SelectItem key={type} value={type}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {jobsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">No jobs found</div>
                ) : (
                  filteredJobs.map(job => <JobRow key={job.id} job={job} />)
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Failed Jobs</CardTitle>
                <Button 
                  onClick={() => retryAllFailed.mutate()}
                  disabled={retryAllFailed.isPending || !stats?.failed}
                  data-testid="button-retry-all-failed"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Retry All ({stats?.failed ?? 0})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {jobsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : jobs.filter(j => j.status === "failed").length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">No failed jobs</div>
                ) : (
                  jobs.filter(j => j.status === "failed").map(job => <JobRow key={job.id} job={job} />)
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {jobsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : jobs.filter(j => j.status === "pending").length === 0 ? (
                  <div className="text-center text-muted-foreground p-8">No pending jobs</div>
                ) : (
                  jobs.filter(j => j.status === "pending").map(job => <JobRow key={job.id} job={job} />)
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Worker Control</CardTitle>
                <CardDescription>Manage the background job worker</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Worker Status</span>
                  <Badge variant={workerStatus?.running ? "default" : "secondary"}>
                    {workerStatus?.running ? "Running" : "Stopped"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => startWorker.mutate()}
                    disabled={startWorker.isPending || workerStatus?.running}
                    className="flex-1"
                    data-testid="button-start-worker-settings"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start Worker
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => stopWorker.mutate()}
                    disabled={stopWorker.isPending || !workerStatus?.running}
                    className="flex-1"
                    data-testid="button-stop-worker-settings"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Stop Worker
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Clean up and reclaim jobs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => reclaimStuck.mutate()}
                  disabled={reclaimStuck.isPending}
                  data-testid="button-reclaim-stuck"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reclaim Stuck Jobs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => cleanupJobs.mutate(30)}
                  disabled={cleanupJobs.isPending}
                  data-testid="button-cleanup-30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Jobs Older Than 30 Days
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => cleanupJobs.mutate(7)}
                  disabled={cleanupJobs.isPending}
                  data-testid="button-cleanup-7"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Jobs Older Than 7 Days
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              {selectedJob && getJobLabel(selectedJob.jobType)} - ID: {selectedJob?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div>
                    <Badge variant={STATUS_COLORS[selectedJob.status]} className="capitalize">
                      {selectedJob.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Attempts</span>
                  <div className="font-medium">{selectedJob.attempts} / {selectedJob.maxAttempts}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Created</span>
                  <div className="font-medium">
                    {format(new Date(selectedJob.createdAt), "PPpp")}
                  </div>
                </div>
                {selectedJob.completedAt && (
                  <div>
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <div className="font-medium">
                      {format(new Date(selectedJob.completedAt), "PPpp")}
                    </div>
                  </div>
                )}
                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">Tags</span>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {selectedJob.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedJob.error && (
                <div>
                  <span className="text-sm text-muted-foreground">Error</span>
                  <pre className="mt-1 p-3 bg-destructive/10 text-destructive rounded-md text-sm overflow-auto max-h-[100px]">
                    {selectedJob.error}
                  </pre>
                </div>
              )}
              
              <div>
                <span className="text-sm text-muted-foreground">Payload</span>
                <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-auto max-h-[200px]">
                  {JSON.stringify(selectedJob.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedJob?.status === "failed" && (
              <Button onClick={() => {
                retryJob.mutate(selectedJob.id);
                setShowJobDetails(false);
              }}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Retry Job
              </Button>
            )}
            {(selectedJob?.status === "pending" || selectedJob?.status === "processing") && (
              <Button variant="destructive" onClick={() => {
                cancelJob.mutate(selectedJob.id);
                setShowJobDetails(false);
              }}>
                <Ban className="h-4 w-4 mr-1" />
                Cancel Job
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowJobDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
