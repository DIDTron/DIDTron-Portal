import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, CheckCircle2, XCircle, Clock, ChevronDown, AlertTriangle, Accessibility, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface TestCheck {
  name: string;
  passed: boolean;
  details: string;
}

interface PageResult {
  moduleName: string;
  pageName: string;
  route: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  screenshotPath?: string;
  accessibilityScore: number;
  accessibilityIssues: any[];
  checks: TestCheck[];
  errorMessage?: string;
}

interface E2eRun {
  id: string;
  name: string;
  scope: string;
  status: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  accessibilityScore: number | null;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  createdAt: string;
}

interface ModulePage {
  name: string;
  route: string;
}

interface ModuleWithPages {
  name: string;
  pages: ModulePage[];
}

interface ModulesResponse {
  modules: string[];
  modulesWithPages: ModuleWithPages[];
  totalPages: number;
}

interface E2eRunWithProgress extends E2eRun {
  currentIndex?: number | null;
  currentPage?: string | null;
}

export default function TestingEngine() {
  const [scope, setScope] = useState("all");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runningRunId, setRunningRunId] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("history");

  const { data: modulesData } = useQuery<ModulesResponse>({
    queryKey: ["/api/e2e/modules"],
  });

  const { data: runs = [], isLoading: runsLoading, refetch: refetchRuns } = useQuery<E2eRun[]>({
    queryKey: ["/api/e2e/runs"],
  });

  const { data: runDetails, refetch: refetchRunDetails } = useQuery<{ run: E2eRunWithProgress; results: PageResult[] }>({
    queryKey: ["/api/e2e/runs", selectedRunId],
    queryFn: async () => {
      if (!selectedRunId) return null;
      const response = await fetch(`/api/e2e/runs/${selectedRunId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch run details");
      return response.json();
    },
    enabled: !!selectedRunId,
    refetchInterval: runningRunId === selectedRunId ? 2000 : false,
  });

  const runTestsMutation = useMutation({
    mutationFn: async (testScope: string) => {
      const response = await apiRequest("POST", "/api/e2e/run", { scope: testScope });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data?.runId) {
        setSelectedRunId(data.runId);
        setRunningRunId(data.runId);
        setActiveTab("results");
      }
      await refetchRuns();
    },
    onError: () => {
      setRunningRunId(null);
    },
  });

  useEffect(() => {
    if (runDetails?.run?.status === "completed" || runDetails?.run?.status === "failed") {
      setRunningRunId(null);
      refetchRuns();
    }
  }, [runDetails?.run?.status, refetchRuns]);

  useEffect(() => {
    if (selectedRunId) {
      refetchRunDetails();
    }
  }, [selectedRunId, refetchRunDetails]);

  useEffect(() => {
    setSelectedPage(null);
  }, [scope]);

  const selectedModule = modulesData?.modulesWithPages.find(
    m => m.name.toLowerCase() === scope.toLowerCase()
  );

  const getEffectiveScope = () => {
    if (selectedPage) return `page:${selectedPage}`;
    return scope;
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedResults(newExpanded);
  };

  const handleViewRun = (runId: string) => {
    setSelectedRunId(runId);
    setActiveTab("results");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "passed" || status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">E2E Testing Engine</h1>
          <p className="text-muted-foreground">
            Playwright-based browser testing with accessibility scanning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="w-48" data-testid="select-scope">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules ({modulesData?.totalPages || 0} pages)</SelectItem>
              {modulesData?.modulesWithPages.map((mod) => (
                <SelectItem key={mod.name} value={mod.name.toLowerCase()}>
                  {mod.name} ({mod.pages.length} pages)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedModule && scope !== "all" && (
            <Select value={selectedPage || "all-pages"} onValueChange={(val) => setSelectedPage(val === "all-pages" ? null : val)}>
              <SelectTrigger className="w-48" data-testid="select-page">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-pages">All {selectedModule.name} pages</SelectItem>
                {selectedModule.pages.map((page) => (
                  <SelectItem key={page.route} value={page.route}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => {
              runTestsMutation.mutate(getEffectiveScope());
            }}
            disabled={runTestsMutation.isPending}
            data-testid="button-run-tests"
          >
            {runTestsMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {(runTestsMutation.isPending || (runDetails?.run?.status === "running")) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="font-medium">
                    Running Tests... {runDetails?.run?.currentIndex || 0}/{runDetails?.run?.totalTests || 0} pages complete
                  </span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {runDetails?.run?.totalTests 
                    ? `${Math.round(((runDetails.run.currentIndex || 0) / runDetails.run.totalTests) * 100)}%`
                    : "Starting..."}
                </span>
              </div>
              <Progress 
                value={runDetails?.run?.totalTests ? ((runDetails.run.currentIndex || 0) / runDetails.run.totalTests) * 100 : 0} 
                className="h-2" 
              />
              {runDetails?.run?.currentPage && (
                <div className="text-sm text-muted-foreground">
                  Current: Testing <span className="font-mono">{runDetails.run.currentPage}</span>
                </div>
              )}
              {runDetails?.results && runDetails.results.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {runDetails.results.map((result, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {result.status === "passed" ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>{result.pageName}</span>
                      <span className="text-muted-foreground">({formatDuration(result.duration)})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="results" data-testid="tab-results">Latest Results</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {runDetails ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(runDetails.run.status)}
                        {runDetails.run.name}
                      </CardTitle>
                      <CardDescription>
                        {runDetails.run.completedAt ? format(new Date(runDetails.run.completedAt), "PPpp") : "In progress"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{runDetails.run.passedTests}</div>
                        <div className="text-xs text-muted-foreground">Passed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{runDetails.run.failedTests}</div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{runDetails.run.accessibilityScore || "-"}</div>
                        <div className="text-xs text-muted-foreground">A11y Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatDuration(runDetails.run.duration)}</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Module</TableHead>
                          <TableHead>Page</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>A11y</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {runDetails.results.map((result, idx) => (
                          <Collapsible key={idx} open={expandedResults.has(String(idx))} onOpenChange={() => toggleExpand(String(idx))}>
                            <TableRow className="cursor-pointer" data-testid={`row-result-${idx}`}>
                              <TableCell>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedResults.has(String(idx)) ? "rotate-180" : ""}`} />
                                  </Button>
                                </CollapsibleTrigger>
                              </TableCell>
                              <TableCell className="font-medium">{result.moduleName}</TableCell>
                              <TableCell>{result.pageName}</TableCell>
                              <TableCell className="font-mono text-xs">{result.route}</TableCell>
                              <TableCell>{getStatusBadge(result.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Accessibility className="h-3 w-3" />
                                  <span className={result.accessibilityScore >= 90 ? "text-green-600" : result.accessibilityScore >= 70 ? "text-yellow-600" : "text-red-600"}>
                                    {result.accessibilityScore}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDuration(result.duration)}</TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                              <TableRow>
                                <TableCell colSpan={7} className="bg-muted/50 p-4">
                                  <div className="space-y-3">
                                    <div className="font-medium text-sm">Checks:</div>
                                    <div className="grid gap-2">
                                      {result.checks.map((check, cIdx) => (
                                        <div key={cIdx} className="flex items-center gap-2 text-sm">
                                          {check.passed ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                          )}
                                          <span className="font-medium">{check.name}:</span>
                                          <span className="text-muted-foreground">{check.details}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {result.accessibilityIssues && result.accessibilityIssues.length > 0 && (
                                      <div className="mt-3">
                                        <div className="font-medium text-sm flex items-center gap-1">
                                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                          Accessibility Issues:
                                        </div>
                                        <div className="mt-2 space-y-1">
                                          {result.accessibilityIssues.map((issue: any, iIdx: number) => (
                                            <div key={iIdx} className="text-sm pl-5">
                                              <Badge variant="outline" className="mr-2">{issue.impact}</Badge>
                                              {issue.description} ({issue.nodes} elements)
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {result.errorMessage && (
                                      <div className="mt-3 p-2 bg-red-50 dark:bg-red-950 rounded text-sm text-red-700 dark:text-red-300">
                                        {result.errorMessage}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  {runs.length > 0 ? (
                    <p>Select a test run from history to view results</p>
                  ) : (
                    <p>No test runs yet. Click "Run Tests" to start.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {runsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : runs.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  No test runs yet. Click "Run Tests" to start.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scope</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Passed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>A11y Score</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => (
                      <TableRow key={run.id} data-testid={`row-run-${run.id}`}>
                        <TableCell className="font-medium">{run.scope}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(run.status)}
                            {getStatusBadge(run.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">{run.passedTests}</TableCell>
                        <TableCell className="text-red-600 font-medium">{run.failedTests}</TableCell>
                        <TableCell>{run.accessibilityScore || "-"}</TableCell>
                        <TableCell>{formatDuration(run.duration)}</TableCell>
                        <TableCell>{format(new Date(run.createdAt), "PPp")}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRun(run.id)}
                            data-testid={`button-view-${run.id}`}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
