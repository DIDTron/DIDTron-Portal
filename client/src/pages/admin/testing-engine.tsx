import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Play, 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  FileText, 
  Zap, 
  TestTube2,
  Clock,
  ChevronRight,
  Settings,
  Plus,
  Radar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TestModule, TestPage, TestFeature, TestCase, TestRun } from "@shared/schema";
import { format } from "date-fns";

type TestLevel = "button" | "form" | "crud" | "navigation" | "api" | "integration" | "e2e";

const TEST_LEVELS: { value: TestLevel; label: string; description: string }[] = [
  { value: "button", label: "Buttons", description: "Test all clickable buttons" },
  { value: "form", label: "Forms", description: "Test form submissions" },
  { value: "crud", label: "CRUD", description: "Create, Read, Update, Delete" },
  { value: "navigation", label: "Navigation", description: "Test page navigation" },
  { value: "api", label: "API", description: "Test API endpoints" },
  { value: "integration", label: "Integration", description: "Integration tests" },
  { value: "e2e", label: "E2E", description: "End-to-end tests" },
];

interface TestHierarchy {
  modules: Array<TestModule & { 
    pages: Array<TestPage & { 
      features: Array<TestFeature & { 
        testCases: TestCase[] 
      }> 
    }> 
  }>;
}

interface TestStats {
  totalModules: number;
  totalPages: number;
  totalFeatures: number;
  totalTestCases: number;
  recentRuns: TestRun[];
}

interface TestRunSummary {
  runId: string;
  name: string;
  scope: string;
  scopeId: string;
  status: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  results: Array<{
    testCaseId: string;
    testCaseName: string;
    status: "passed" | "failed" | "skipped";
    duration: number;
    actualResult?: any;
    errorMessage?: string;
  }>;
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "passed":
    case "completed":
      return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />Passed</Badge>;
    case "failed":
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    case "skipped":
      return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Skipped</Badge>;
    case "running":
      return <Badge className="bg-blue-600 text-white"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
    case "pending":
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function TestingEnginePage() {
  const [activeTab, setActiveTab] = useState("run");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [selectedLevels, setSelectedLevels] = useState<TestLevel[]>(["api", "crud"]);
  const [testScope, setTestScope] = useState<"module" | "page" | "feature">("module");
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<TestRunSummary | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: hierarchy, isLoading: hierarchyLoading, refetch: refetchHierarchy, isFetching: hierarchyFetching } = useQuery<TestHierarchy>({
    queryKey: ["/api/testing-engine/hierarchy"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<TestStats>({
    queryKey: ["/api/testing-engine/stats"],
  });

  const { data: runs = [], refetch: refetchRuns, isFetching: runsFetching } = useQuery<TestRun[]>({
    queryKey: ["/api/testing-engine/runs"],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/testing-engine/seed");
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/testing-engine/hierarchy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testing-engine/stats"] });
      toast({
        title: result.seeded ? "Test data seeded" : "Already seeded",
        description: result.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to seed data",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const autoDiscoverMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/testing-engine/autodiscover");
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/testing-engine/hierarchy"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testing-engine/stats"] });
      toast({
        title: "Auto-Discovery Complete",
        description: `${result.modulesCreated} modules and ${result.pagesCreated} pages discovered`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to auto-discover",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (config: { scope: string; scopeId: string; testLevels: string[] }) => {
      const response = await apiRequest("POST", "/api/testing-engine/execute", config);
      return response.json();
    },
    onSuccess: (result: TestRunSummary) => {
      setLastResult(result);
      setResultDialogOpen(true);
      setIsRunning(false);
      queryClient.invalidateQueries({ queryKey: ["/api/testing-engine/runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dev-tests"] });
      toast({
        title: result.failedTests > 0 ? "Tests completed with failures" : "Tests passed",
        description: `${result.passedTests} passed, ${result.failedTests} failed, ${result.skippedTests} skipped`,
        variant: result.failedTests > 0 ? "destructive" : "default",
      });
    },
    onError: (error: Error) => {
      setIsRunning(false);
      toast({
        title: "Test execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const modules = hierarchy?.modules || [];
  const selectedModuleData = modules.find(m => m.id === selectedModule);
  const pages = selectedModuleData?.pages || [];
  const selectedPageData = pages.find(p => p.id === selectedPage);
  const features = selectedPageData?.features || [];

  const getScopeId = () => {
    switch (testScope) {
      case "module": return selectedModule;
      case "page": return selectedPage;
      case "feature": return selectedFeature;
      default: return selectedModule;
    }
  };

  // Count available test cases for the selected scope and levels
  const countAvailableTests = (): number => {
    if (!hierarchy) return 0;
    let count = 0;
    
    const countFeatureTests = (feature: TestFeature & { testCases: TestCase[] }) => {
      return feature.testCases.filter(tc => 
        tc.enabled && selectedLevels.includes(tc.testLevel as TestLevel)
      ).length;
    };
    
    const countPageTests = (page: TestPage & { features: Array<TestFeature & { testCases: TestCase[] }> }) => {
      return page.features.reduce((sum, f) => sum + countFeatureTests(f), 0);
    };
    
    const countModuleTests = (mod: TestModule & { pages: Array<TestPage & { features: Array<TestFeature & { testCases: TestCase[] }> }> }) => {
      return mod.pages.reduce((sum, p) => sum + countPageTests(p), 0);
    };
    
    switch (testScope) {
      case "module":
        const mod = hierarchy.modules.find(m => m.id === selectedModule);
        if (mod) count = countModuleTests(mod);
        break;
      case "page":
        for (const m of hierarchy.modules) {
          const page = m.pages.find(p => p.id === selectedPage);
          if (page) {
            count = countPageTests(page);
            break;
          }
        }
        break;
      case "feature":
        for (const m of hierarchy.modules) {
          for (const p of m.pages) {
            const feature = p.features.find(f => f.id === selectedFeature);
            if (feature) {
              count = countFeatureTests(feature);
              break;
            }
          }
        }
        break;
    }
    return count;
  };

  const availableTestCount = countAvailableTests();

  const canRunTests = () => {
    const scopeId = getScopeId();
    return scopeId && selectedLevels.length > 0;
  };

  const runTests = () => {
    const scopeId = getScopeId();
    if (!scopeId) {
      toast({ title: "Please select a scope", variant: "destructive" });
      return;
    }
    setIsRunning(true);
    executeMutation.mutate({
      scope: testScope,
      scopeId,
      testLevels: selectedLevels,
    });
  };

  const toggleLevel = (level: TestLevel) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedRuns,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(runs, 10);

  if (hierarchyLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Testing Engine</h1>
          <p className="text-muted-foreground">Automated testing for modules, pages, and features</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            onClick={() => autoDiscoverMutation.mutate()}
            disabled={autoDiscoverMutation.isPending}
            data-testid="button-autodiscover"
          >
            {autoDiscoverMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Radar className="w-4 h-4 mr-2" />
            )}
            Auto Discover
          </Button>
          <Button
            variant="outline"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            data-testid="button-seed-data"
          >
            {seedMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Seed Test Cases
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              refetchHierarchy();
              refetchRuns();
            }}
            disabled={hierarchyFetching || runsFetching}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(hierarchyFetching || runsFetching) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <Layers className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-modules-count">{stats?.totalModules || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pages-count">{stats?.totalPages || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-features-count">{stats?.totalFeatures || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
            <TestTube2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-testcases-count">{stats?.totalTestCases || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="run" data-testid="tab-run-tests">
            <Play className="w-4 h-4 mr-2" />
            Run Tests
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <Clock className="w-4 h-4 mr-2" />
            Test History
          </TabsTrigger>
          <TabsTrigger value="registry" data-testid="tab-registry">
            <Settings className="w-4 h-4 mr-2" />
            Test Registry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Select what to test and which test levels to run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Test Scope</Label>
                  <Select value={testScope} onValueChange={(v) => setTestScope(v as any)}>
                    <SelectTrigger data-testid="select-scope">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="module">Entire Module</SelectItem>
                      <SelectItem value="page">Specific Page</SelectItem>
                      <SelectItem value="feature">Specific Feature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Module</Label>
                  <Select value={selectedModule} onValueChange={(v) => {
                    setSelectedModule(v);
                    setSelectedPage("");
                    setSelectedFeature("");
                  }}>
                    <SelectTrigger data-testid="select-module">
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(testScope === "page" || testScope === "feature") && (
                  <div className="space-y-2">
                    <Label>Page</Label>
                    <Select value={selectedPage} onValueChange={(v) => {
                      setSelectedPage(v);
                      setSelectedFeature("");
                    }} disabled={!selectedModule}>
                      <SelectTrigger data-testid="select-page">
                        <SelectValue placeholder="Select page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {testScope === "feature" && (
                  <div className="space-y-2">
                    <Label>Feature</Label>
                    <Select value={selectedFeature} onValueChange={setSelectedFeature} disabled={!selectedPage}>
                      <SelectTrigger data-testid="select-feature">
                        <SelectValue placeholder="Select feature" />
                      </SelectTrigger>
                      <SelectContent>
                        {features.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Test Levels</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TEST_LEVELS.map(level => (
                    <div
                      key={level.value}
                      className={`flex items-start gap-2 p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedLevels.includes(level.value) 
                          ? "bg-primary/10 border-primary" 
                          : "hover-elevate"
                      }`}
                      onClick={() => toggleLevel(level.value)}
                    >
                      <Checkbox 
                        checked={selectedLevels.includes(level.value)}
                        onCheckedChange={() => toggleLevel(level.value)}
                        data-testid={`checkbox-level-${level.value}`}
                      />
                      <div>
                        <div className="font-medium text-sm">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {!canRunTests() 
                    ? "Select a module and test levels to run"
                    : availableTestCount === 0
                    ? <span className="text-amber-600 dark:text-amber-400">No test cases defined for the selected scope and test levels. Use "Seed Test Cases" to add tests for the DID module.</span>
                    : `Ready to run ${availableTestCount} test(s) on selected ${testScope}`
                  }
                </div>
                <Button 
                  onClick={runTests} 
                  disabled={!canRunTests() || isRunning}
                  data-testid="button-run-tests"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Tests
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Run History</CardTitle>
              <CardDescription>Previous test executions and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRuns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No test runs yet. Run your first test to see results here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRuns.map(run => (
                      <TableRow key={run.id} data-testid={`row-run-${run.id}`}>
                        <TableCell className="font-medium">{run.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{run.scope}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">{run.passedTests} passed</span>
                            <span className="text-destructive">{run.failedTests} failed</span>
                            <span className="text-muted-foreground">{run.skippedTests} skipped</span>
                          </div>
                        </TableCell>
                        <TableCell>{run.duration ? `${run.duration}ms` : "-"}</TableCell>
                        <TableCell>
                          {run.createdAt ? format(new Date(run.createdAt), "MMM d, yyyy HH:mm") : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <DataTableFooter
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registry" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Test Registry</CardTitle>
                <CardDescription>Modules, pages, features, and test cases</CardDescription>
              </div>
              <Button variant="outline" size="sm" data-testid="button-add-module">
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No test modules registered yet.</p>
                  <p className="text-sm">Add a module to start building your test suite.</p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {modules.map(module => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          <span className="font-medium">{module.name}</span>
                          <Badge variant="secondary" className="ml-2">{module.pages.length} pages</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 space-y-2">
                          {module.pages.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">No pages defined</p>
                          ) : (
                            module.pages.map(page => (
                              <Accordion key={page.id} type="multiple" className="w-full">
                                <AccordionItem value={page.id} className="border-0">
                                  <AccordionTrigger className="hover:no-underline py-2">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      <span>{page.name}</span>
                                      <Badge variant="outline" className="ml-2">{page.features.length} features</Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="pl-6 space-y-1">
                                      {page.features.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-2">No features defined</p>
                                      ) : (
                                        page.features.map(feature => (
                                          <div key={feature.id} className="flex items-center gap-2 py-1">
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">{feature.name}</span>
                                            <Badge variant="secondary" className="text-xs">{feature.testLevel}</Badge>
                                            <Badge variant="outline" className="text-xs">{feature.testCases.length} tests</Badge>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            ))
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
            <DialogDescription>
              {lastResult?.name}
            </DialogDescription>
          </DialogHeader>
          {lastResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold">{lastResult.totalTests}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <div className="text-2xl font-bold text-green-600">{lastResult.passedTests}</div>
                  <div className="text-xs text-green-600">Passed</div>
                </div>
                <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
                  <div className="text-2xl font-bold text-destructive">{lastResult.failedTests}</div>
                  <div className="text-xs text-destructive">Failed</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold text-muted-foreground">{lastResult.skippedTests}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
              </div>

              <Progress 
                value={(lastResult.passedTests / Math.max(lastResult.totalTests, 1)) * 100} 
                className="h-2"
              />

              {lastResult.totalTests === 0 ? (
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-md text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">No test cases found</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    This module doesn't have test cases defined for the selected test levels.<br />
                    Use "Seed Test Cases" button to add test cases for the DID module, or define custom test cases in the Registry.
                  </p>
                </div>
              ) : lastResult.results.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {lastResult.results.map((result, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        {result.status === "passed" && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {result.status === "failed" && <XCircle className="w-4 h-4 text-destructive" />}
                        {result.status === "skipped" && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
                        <span className="text-sm">{result.testCaseName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{result.duration}ms</span>
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultDialogOpen(false)} data-testid="button-close-results">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
