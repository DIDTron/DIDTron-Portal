import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableFooter } from "@/components/ui/data-table-footer";
import { ChevronDown, Download, Search, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { PeriodException, PeriodExceptionHistory } from "@shared/schema";

interface PeriodExceptionsResponse {
  data: PeriodException[];
  total: number;
  limit: number;
  offset: number;
}

interface PeriodExceptionHistoryResponse {
  data: PeriodExceptionHistory[];
  total: number;
  limit: number;
  offset: number;
}

export default function PeriodExceptionsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"exceptions" | "history">("exceptions");
  const [searchType, setSearchType] = useState<"prefix" | "zone" | "country">("prefix");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [activeSearchType, setActiveSearchType] = useState<"prefix" | "zone" | "country">("prefix");
  const [exceptionsPage, setExceptionsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [exceptionsPageSize, setExceptionsPageSize] = useState(25);
  const [historyPageSize, setHistoryPageSize] = useState(25);

  const { data: exceptionsData, isLoading: isLoadingExceptions, isFetching: isFetchingExceptions, refetch: refetchExceptions } = useQuery<PeriodExceptionsResponse>({
    queryKey: ["/api/period-exceptions", activeSearchType, activeSearchQuery, exceptionsPage, exceptionsPageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(exceptionsPageSize));
      params.set("offset", String((exceptionsPage - 1) * exceptionsPageSize));
      if (activeSearchQuery) {
        params.set("searchType", activeSearchType);
        params.set("query", activeSearchQuery);
      }
      const res = await fetch(`/api/period-exceptions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch period exceptions");
      return res.json();
    },
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: historyData, isLoading: isLoadingHistory, isFetching: isFetchingHistory } = useQuery<PeriodExceptionHistoryResponse>({
    queryKey: ["/api/period-exceptions/history", historyPage, historyPageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(historyPageSize));
      params.set("offset", String((historyPage - 1) * historyPageSize));
      const res = await fetch(`/api/period-exceptions/history?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch period exception history");
      return res.json();
    },
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
    enabled: activeTab === "history",
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/period-exceptions/sync-from-az");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sync Complete",
        description: `Added: ${data.added}, Updated: ${data.updated}, Removed: ${data.removed || 0}, Total processed: ${data.total}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/period-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/period-exceptions/history"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync from A-Z Database",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
    setActiveSearchType(searchType);
    setExceptionsPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (activeSearchQuery) {
      params.set("searchType", activeSearchType);
      params.set("query", activeSearchQuery);
    }
    window.location.href = `/api/period-exceptions/export/csv?${params.toString()}`;
  };

  const exceptions = exceptionsData?.data || [];
  const exceptionsTotal = exceptionsData?.total || 0;
  const exceptionsTotalPages = Math.ceil(exceptionsTotal / exceptionsPageSize);

  const history = historyData?.data || [];
  const historyTotal = historyData?.total || 0;
  const historyTotalPages = Math.ceil(historyTotal / historyPageSize);

  const handleExceptionsPageSizeChange = (size: number) => {
    setExceptionsPageSize(size);
    setExceptionsPage(1);
  };

  const handleHistoryPageSizeChange = (size: number) => {
    setHistoryPageSize(size);
    setHistoryPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="bg-[#3d4f5f] text-white rounded-t-lg py-3 px-4">
          <CardTitle className="text-lg font-semibold">Period Exceptions Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Plan Details</h3>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Plan Name</span>
              <span className="font-medium">Period-Exception-ALL</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "exceptions" | "history")}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="exceptions" data-testid="tab-period-exceptions">
                  Period Exception
                </TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">
                  History
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  data-testid="button-sync"
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync from A-Z Database
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="dropdown-actions">
                      Actions <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExport} data-testid="action-export">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="exceptions" className="mt-0">
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Period Exceptions</h4>
                <div className="flex items-center gap-2">
                  <Select value={searchType} onValueChange={(v) => setSearchType(v as "prefix" | "zone" | "country")}>
                    <SelectTrigger className="w-[120px]" data-testid="select-search-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prefix">Prefix</SelectItem>
                      <SelectItem value="zone">Zone</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Use % for wildcard (e.g., 1980%)"
                    className="w-[250px]"
                    data-testid="input-search"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSearch}
                    data-testid="button-search"
                  >
                    <Search className="h-5 w-5 text-primary" />
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#3d4f5f]">
                      <TableHead className="text-white font-semibold">Prefix</TableHead>
                      <TableHead className="text-white font-semibold">Zone</TableHead>
                      <TableHead className="text-white font-semibold">Country</TableHead>
                      <TableHead className="text-white font-semibold text-center">Initial Interval</TableHead>
                      <TableHead className="text-white font-semibold text-center">Recurring Interval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingExceptions ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-muted-foreground">Loading period exceptions...</p>
                        </TableCell>
                      </TableRow>
                    ) : exceptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No period exceptions found. Click "Sync from A-Z Database" to import destinations with non-1/1 intervals.
                        </TableCell>
                      </TableRow>
                    ) : (
                      exceptions.map((exception, idx) => (
                        <TableRow 
                          key={exception.id} 
                          className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}
                          data-testid={`row-exception-${exception.id}`}
                        >
                          <TableCell className="font-mono">{exception.prefix}</TableCell>
                          <TableCell>{exception.zoneName}</TableCell>
                          <TableCell>{exception.countryName || "-"}</TableCell>
                          <TableCell className="text-center">{exception.initialInterval}</TableCell>
                          <TableCell className="text-center">{exception.recurringInterval}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <DataTableFooter
                currentPage={exceptionsPage}
                totalPages={exceptionsTotalPages}
                pageSize={exceptionsPageSize}
                totalItems={exceptionsTotal}
                onPageChange={setExceptionsPage}
                onPageSizeChange={handleExceptionsPageSizeChange}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="mb-4">
                <h4 className="font-semibold">Change History</h4>
                <p className="text-sm text-muted-foreground">Audit log of interval changes from A-Z Database synchronization</p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#3d4f5f]">
                      <TableHead className="text-white font-semibold">Prefix</TableHead>
                      <TableHead className="text-white font-semibold">Zone</TableHead>
                      <TableHead className="text-white font-semibold">Change Type</TableHead>
                      <TableHead className="text-white font-semibold text-center">Previous Interval</TableHead>
                      <TableHead className="text-white font-semibold text-center">New Interval</TableHead>
                      <TableHead className="text-white font-semibold">Changed By</TableHead>
                      <TableHead className="text-white font-semibold">Source</TableHead>
                      <TableHead className="text-white font-semibold">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingHistory ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-muted-foreground">Loading history...</p>
                        </TableCell>
                      </TableRow>
                    ) : history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No change history found. Changes will appear here after syncing with A-Z Database.
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((record, idx) => (
                        <TableRow 
                          key={record.id} 
                          className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}
                          data-testid={`row-history-${record.id}`}
                        >
                          <TableCell className="font-mono">{record.prefix}</TableCell>
                          <TableCell>{record.zoneName}</TableCell>
                          <TableCell>
                            <span className={
                              record.changeType === "added" ? "text-green-600" :
                              record.changeType === "updated" ? "text-blue-600" :
                              "text-red-600"
                            }>
                              {record.changeType?.charAt(0).toUpperCase() + record.changeType?.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {record.previousInitialInterval !== null && record.previousRecurringInterval !== null 
                              ? `${record.previousInitialInterval}/${record.previousRecurringInterval}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {record.newInitialInterval !== null && record.newRecurringInterval !== null 
                              ? `${record.newInitialInterval}/${record.newRecurringInterval}`
                              : "-"}
                          </TableCell>
                          <TableCell>{record.changedByEmail || "System"}</TableCell>
                          <TableCell>
                            <span className={record.changeSource === "sync" ? "text-muted-foreground" : "text-primary"}>
                              {record.changeSource === "sync" ? "Auto Sync" : "Manual"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {record.createdAt ? format(new Date(record.createdAt), "MMM dd, yyyy HH:mm:ss") : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <DataTableFooter
                currentPage={historyPage}
                totalPages={historyTotalPages}
                pageSize={historyPageSize}
                totalItems={historyTotal}
                onPageChange={setHistoryPage}
                onPageSizeChange={handleHistoryPageSizeChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
