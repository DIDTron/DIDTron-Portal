import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, CheckCircle2, XCircle, Clock, ChevronDown, AlertTriangle, Accessibility, RefreshCw, Copy, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface IssueRow {
  id: string;
  module: string;
  page: string;
  route: string;
  score: number;
  severity: string;
  description: string;
  elements: number;
  detectedAt: string;
}

export default function TestingEngine() {
  const { toast } = useToast();
  const [scope, setScope] = useState("all");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runningRunId, setRunningRunId] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("history");
  const [issuesSeverityFilter, setIssuesSeverityFilter] = useState("all");
  const [issuesModuleFilter, setIssuesModuleFilter] = useState("all");

  const { data: modulesData } = useQuery<ModulesResponse>({
    queryKey: ["/api/e2e/modules"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const { data: runs = [], isLoading: runsLoading, refetch: refetchRuns } = useQuery<E2eRun[]>({
    queryKey: ["/api/e2e/runs"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
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
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
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

  useEffect(() => {
    if ((activeTab === "issues" || activeTab === "results") && !selectedRunId && runs.length > 0) {
      const completedRuns = runs
        .filter(r => r.status === "completed" || r.status === "passed")
        .sort((a, b) => {
          const dateA = a.completedAt || a.createdAt;
          const dateB = b.completedAt || b.createdAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      if (completedRuns.length > 0) {
        setSelectedRunId(completedRuns[0].id);
      }
    }
  }, [activeTab, selectedRunId, runs]);

  const getCompletedRuns = () => {
    return runs
      .filter(r => r.status === "completed" || r.status === "passed")
      .sort((a, b) => {
        const dateA = a.completedAt || a.createdAt;
        const dateB = b.completedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  };

  const copyIssueToClipboard = (issue: IssueRow) => {
    const text = `[${issue.severity.toUpperCase()}] ${issue.module} - ${issue.page}
Route: ${issue.route}
Issue: ${issue.description}
Affected Elements: ${issue.elements}
Score: ${issue.score}/100`;
    navigator.clipboard.writeText(text);
    toast({ title: "Issue copied to clipboard" });
  };

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

  const getIssuesData = (): IssueRow[] => {
    if (!runDetails?.results) return [];
    const issues: IssueRow[] = [];
    const detectedAt = runDetails.run?.completedAt || runDetails.run?.createdAt || new Date().toISOString();
    
    runDetails.results.forEach((r, rIdx) => {
      if (r.accessibilityIssues && r.accessibilityIssues.length > 0) {
        r.accessibilityIssues.forEach((issue: any, iIdx: number) => {
          issues.push({
            id: `${rIdx}-${iIdx}`,
            module: r.moduleName,
            page: r.pageName,
            route: r.route,
            score: r.accessibilityScore,
            severity: issue.impact || "unknown",
            description: issue.description,
            elements: issue.nodes || 0,
            detectedAt,
          });
        });
      }
    });
    return issues;
  };

  const getIssuesSummary = () => {
    const issues = getIssuesData();
    const uniqueRoutes: string[] = [];
    issues.forEach(i => {
      if (!uniqueRoutes.includes(i.route)) {
        uniqueRoutes.push(i.route);
      }
    });
    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === "critical").length,
      serious: issues.filter(i => i.severity === "serious").length,
      moderate: issues.filter(i => i.severity === "moderate" || i.severity === "minor").length,
      pagesAffected: uniqueRoutes.length,
    };
  };

  const getFilteredIssues = () => {
    let issues = getIssuesData();
    if (issuesSeverityFilter !== "all") {
      issues = issues.filter(i => i.severity === issuesSeverityFilter);
    }
    if (issuesModuleFilter !== "all") {
      issues = issues.filter(i => i.module === issuesModuleFilter);
    }
    return issues;
  };

  const getUniqueModulesWithIssues = () => {
    const issues = getIssuesData();
    const uniqueModules: string[] = [];
    issues.forEach(i => {
      if (!uniqueModules.includes(i.module)) {
        uniqueModules.push(i.module);
      }
    });
    return uniqueModules;
  };

  const copyIssuesToClipboard = () => {
    const issues = getFilteredIssues();
    if (issues.length === 0) {
      toast({ title: "No issues to copy", variant: "destructive" });
      return;
    }
    const text = issues.map(i => 
      `[${i.severity.toUpperCase()}] ${i.module} - ${i.page}\nRoute: ${i.route}\nIssue: ${i.description} (${i.elements} elements)\nScore: ${i.score}`
    ).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Issues copied to clipboard" });
  };

  const downloadIssuesAsCSV = () => {
    const issues = getFilteredIssues();
    if (issues.length === 0) {
      toast({ title: "No issues to download", variant: "destructive" });
      return;
    }
    const headers = ["Module", "Page", "Route", "Severity", "Description", "Elements", "Score", "Detected At"];
    const rows = issues.map(i => [
      i.module,
      i.page,
      i.route,
      i.severity,
      i.description,
      String(i.elements),
      String(i.score),
      format(new Date(i.detectedAt), "yyyy-MM-dd HH:mm:ss"),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accessibility-issues-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV downloaded" });
  };

  const downloadIssuesAsPDF = () => {
    const issues = getFilteredIssues();
    const summary = getIssuesSummary();
    if (issues.length === 0) {
      toast({ title: "No issues to download", variant: "destructive" });
      return;
    }
    const header = [
      "=" .repeat(70),
      "         ACCESSIBILITY ISSUES REPORT - WCAG 2.1 AA COMPLIANCE",
      "=" .repeat(70),
      "",
      `Generated: ${format(new Date(), "PPpp")}`,
      `Test Run: ${runDetails?.run?.name || "N/A"}`,
      `Completed: ${runDetails?.run?.completedAt ? format(new Date(runDetails.run.completedAt), "PPpp") : "N/A"}`,
      "",
      "-".repeat(70),
      "SUMMARY",
      "-".repeat(70),
      `Total Issues: ${summary.total}`,
      `  - Critical: ${summary.critical}`,
      `  - Serious: ${summary.serious}`,
      `  - Moderate/Minor: ${summary.moderate}`,
      `Pages Affected: ${summary.pagesAffected}`,
      "",
      "-".repeat(70),
      "DETAILED ISSUES",
      "-".repeat(70),
      "",
    ].join("\n");
    
    const content = issues.map((i, idx) => 
      [
        `Issue #${idx + 1}`,
        `  Severity: ${i.severity.toUpperCase()}`,
        `  Module: ${i.module}`,
        `  Page: ${i.page}`,
        `  Route: ${i.route}`,
        `  Score: ${i.score}/100`,
        `  Description: ${i.description}`,
        `  Affected Elements: ${i.elements}`,
        `  Detected: ${format(new Date(i.detectedAt), "PPpp")}`,
        "",
      ].join("\n")
    ).join("\n");
    
    const blob = new Blob([header + content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accessibility-report-${format(new Date(), "yyyy-MM-dd-HHmm")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report downloaded" });
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "serious": return "secondary";
      default: return "outline";
    }
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
          <TabsTrigger value="issues" data-testid="tab-issues">Issues</TabsTrigger>
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
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Module</TableHead>
                          <TableHead>Page</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>A11y</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {runDetails.results.flatMap((result, idx) => {
                          const rows = [
                            <TableRow 
                              key={`row-${idx}`} 
                              className="cursor-pointer" 
                              data-testid={`row-result-${idx}`}
                              onClick={() => toggleExpand(String(idx))}
                            >
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Expand">
                                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedResults.has(String(idx)) ? "rotate-180" : ""}`} />
                                </Button>
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
                          ];
                          if (expandedResults.has(String(idx))) {
                            rows.push(
                              <TableRow key={`detail-${idx}`}>
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
                            );
                          }
                          return rows;
                        })}
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

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardContent className="pt-4 pb-2">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Test Run:</span>
                  <Select 
                    value={selectedRunId || ""} 
                    onValueChange={(val) => setSelectedRunId(val)}
                  >
                    <SelectTrigger className="w-72" data-testid="select-issues-run">
                      <SelectValue placeholder="Select a test run" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCompletedRuns().map((run) => (
                        <SelectItem key={run.id} value={run.id}>
                          {run.scope} - {format(new Date(run.completedAt || run.createdAt), "MMM d, yyyy HH:mm")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {runDetails?.run && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Passed: <span className="text-green-600 font-medium">{runDetails.run.passedTests}</span></span>
                    <span>Failed: <span className="text-red-600 font-medium">{runDetails.run.failedTests}</span></span>
                    <span>Score: <span className="font-medium">{runDetails.run.accessibilityScore || "-"}</span></span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!runDetails?.results ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Test Data Available</p>
                  <p>{getCompletedRuns().length === 0 ? "Run tests first to see accessibility issues" : "Select a test run above to view issues"}</p>
                </div>
              </CardContent>
            </Card>
          ) : getIssuesData().length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">No Accessibility Issues Found</p>
                  <p className="text-muted-foreground">All pages pass WCAG 2.1 AA requirements</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-yellow-500/10">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{getIssuesSummary().total}</p>
                        <p className="text-sm text-muted-foreground">Total Issues</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-red-500/10">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{getIssuesSummary().critical}</p>
                        <p className="text-sm text-muted-foreground">Critical</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-orange-500/10">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{getIssuesSummary().serious}</p>
                        <p className="text-sm text-muted-foreground">Serious</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Accessibility className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{getIssuesSummary().pagesAffected}</p>
                        <p className="text-sm text-muted-foreground">Pages Affected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Accessibility Issues Log
                      </CardTitle>
                      <CardDescription>
                        {runDetails?.run?.completedAt 
                          ? `Last scanned: ${format(new Date(runDetails.run.completedAt), "PPpp")}`
                          : "WCAG 2.1 AA violations detected during test run"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyIssuesToClipboard}
                        data-testid="button-copy-issues"
                        aria-label="Copy issues to clipboard"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadIssuesAsCSV}
                        data-testid="button-download-csv"
                        aria-label="Download as CSV"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadIssuesAsPDF}
                        data-testid="button-download-pdf"
                        aria-label="Download full report"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Full Report
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-4 py-3 border-b flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Severity:</span>
                      <Select value={issuesSeverityFilter} onValueChange={setIssuesSeverityFilter}>
                        <SelectTrigger className="w-32" data-testid="select-issues-severity">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="serious">Serious</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="minor">Minor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Module:</span>
                      <Select value={issuesModuleFilter} onValueChange={setIssuesModuleFilter}>
                        <SelectTrigger className="w-40" data-testid="select-issues-module">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modules</SelectItem>
                          {getUniqueModulesWithIssues().map((mod) => (
                            <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1" />
                    <span className="text-sm text-muted-foreground">
                      Showing {getFilteredIssues().length} of {getIssuesData().length} issues
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Severity</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Issue Description</TableHead>
                        <TableHead className="w-[80px] text-center">Elements</TableHead>
                        <TableHead className="w-[70px] text-center">Score</TableHead>
                        <TableHead className="w-[150px]">Detected</TableHead>
                        <TableHead className="w-[60px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredIssues().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No issues match the current filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredIssues().map((issue) => (
                          <TableRow key={issue.id} data-testid={`row-issue-${issue.id}`}>
                            <TableCell>
                              <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                                {issue.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{issue.module}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{issue.page}</div>
                                <div className="text-xs text-muted-foreground font-mono">{issue.route}</div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <div className="text-sm truncate" title={issue.description}>
                                {issue.description}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{issue.elements}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={issue.score >= 90 ? "default" : issue.score >= 70 ? "secondary" : "destructive"}>
                                {issue.score}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(issue.detectedAt), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyIssueToClipboard(issue)}
                                data-testid={`button-copy-issue-${issue.id}`}
                                aria-label="Copy this issue"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
