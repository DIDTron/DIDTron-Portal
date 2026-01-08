import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Search, Loader2, RefreshCw, Trash2, Eye, CheckCircle, XCircle, AlertTriangle, Clock, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DevTest } from "@shared/schema";
import { format } from "date-fns";

function getStatusBadge(status: string | null) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  
  switch (status) {
    case "passed":
      return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />Passed</Badge>;
    case "failed":
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    case "skipped":
      return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Skipped</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function DevTestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [selectedTest, setSelectedTest] = useState<DevTest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const { data: tests = [], isLoading, refetch } = useQuery<DevTest[]>({
    queryKey: ["/api/dev-tests"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/dev-tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-tests"] });
      toast({
        title: "Test deleted",
        description: "The test record has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete test",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const modules = Array.from(new Set(tests.map(t => t.module).filter(Boolean)));

  const filteredTests = tests.filter(test => {
    const matchesSearch = !searchTerm ||
      test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    const matchesModule = moduleFilter === "all" || test.module === moduleFilter;
    
    return matchesSearch && matchesStatus && matchesModule;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedTests,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredTests, 10);

  const passedCount = tests.filter(t => t.status === "passed").length;
  const failedCount = tests.filter(t => t.status === "failed").length;
  const skippedCount = tests.filter(t => t.status === "skipped").length;

  const viewDetails = (test: DevTest) => {
    setSelectedTest(test);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Dev Tests</h1>
          <p className="text-muted-foreground">Development test history and results</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FlaskConical className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-tests">{tests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-passed-tests">{passedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-failed-tests">{failedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skipped</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-skipped-tests">{skippedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-module">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module!}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedTests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tests found</p>
              <p className="text-sm">Tests will appear here as features are developed and tested.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Tested At</TableHead>
                    <TableHead>Cleaned Up</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTests.map((test) => (
                    <TableRow key={test.id} data-testid={`row-test-${test.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{test.name}</div>
                          {test.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {test.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.module}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>
                        {test.duration ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {test.duration}ms
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {test.testedAt ? format(new Date(test.testedAt), "MMM d, yyyy HH:mm") : "-"}
                      </TableCell>
                      <TableCell>
                        {test.cleanedUp ? (
                          <Badge variant="outline" className="text-green-600">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewDetails(test)}
                            data-testid={`button-view-${test.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(test.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${test.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Test Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this test run
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Test Name</label>
                  <p className="font-medium">{selectedTest.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Module</label>
                  <p><Badge variant="outline">{selectedTest.module}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>{getStatusBadge(selectedTest.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p>{selectedTest.duration ? `${selectedTest.duration}ms` : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tested At</label>
                  <p>{selectedTest.testedAt ? format(new Date(selectedTest.testedAt), "MMM d, yyyy HH:mm:ss") : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cleaned Up</label>
                  <p>{selectedTest.cleanedUp ? "Yes" : "No"}</p>
                </div>
              </div>

              {selectedTest.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{selectedTest.description}</p>
                </div>
              )}

              {selectedTest.expectedResult && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expected Result</label>
                  <p className="mt-1 p-2 bg-muted rounded-md text-sm">{selectedTest.expectedResult}</p>
                </div>
              )}

              {selectedTest.actualResult && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Actual Result</label>
                  <p className="mt-1 p-2 bg-muted rounded-md text-sm">{selectedTest.actualResult}</p>
                </div>
              )}

              {selectedTest.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Error Message</label>
                  <p className="mt-1 p-2 bg-destructive/10 text-destructive rounded-md text-sm">{selectedTest.errorMessage}</p>
                </div>
              )}

              {selectedTest.testSteps && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Test Steps</label>
                  <pre className="mt-1 p-2 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(selectedTest.testSteps as Record<string, unknown>, null, 2)}
                  </pre>
                </div>
              )}

              {selectedTest.createdTestData && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Test Data</label>
                  <pre className="mt-1 p-2 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(selectedTest.createdTestData as Record<string, unknown>, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
