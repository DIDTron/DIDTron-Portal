import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { AlertTriangle, Search, FileText, Loader2, RefreshCw, Download, Filter, Trash2, Calendar as CalendarIcon, User, Activity, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import type { AuditLog } from "@shared/schema";
import { format } from "date-fns";

function getActionBadge(action: string | null) {
  if (!action) return <Badge variant="outline">Unknown</Badge>;
  
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes("create") || lowerAction.includes("add") || lowerAction.includes("login_success")) {
    return <Badge variant="default">{action}</Badge>;
  }
  if (lowerAction.includes("delete") || lowerAction.includes("remove") || lowerAction.includes("failed") || lowerAction.includes("purge")) {
    return <Badge variant="destructive">{action}</Badge>;
  }
  if (lowerAction.includes("update") || lowerAction.includes("edit")) {
    return <Badge variant="secondary">{action}</Badge>;
  }
  if (lowerAction.includes("restore") || lowerAction.includes("recovered")) {
    return <Badge className="bg-green-600 text-white">{action}</Badge>;
  }
  if (lowerAction.includes("logout") || lowerAction.includes("session")) {
    return <Badge variant="outline">{action}</Badge>;
  }
  return <Badge variant="outline">{action}</Badge>;
}

type AdminUser = {
  id: string;
  email: string;
  name?: string;
};

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();

  const { data: logs = [], isLoading, refetch } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin-users"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/audit-logs");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      toast({
        title: "Audit logs purged",
        description: "All audit logs have been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete logs",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tables = Array.from(new Set(logs.map(l => l.tableName).filter(Boolean)));
  const actions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));
  const uniqueUserIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean)));
  
  const getUserEmail = (userId: string | null) => {
    if (!userId) return "System";
    const user = adminUsers.find(u => u.id === userId);
    return user?.email || userId.slice(0, 8) + "...";
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no audit logs matching your filters.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Timestamp", "User", "Action", "Table", "Record ID", "IP Address", "Details"];
    const rows = filteredLogs.map(log => [
      log.createdAt ? format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss") : "",
      getUserEmail(log.userId),
      log.action || "",
      log.tableName || "",
      log.recordId || "",
      log.ipAddress || "",
      log.newValues ? JSON.stringify(log.newValues).replace(/"/g, '""') : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${filteredLogs.length} audit log entries to CSV.`,
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTable = tableFilter === "all" || log.tableName === tableFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesUser = userFilter === "all" || log.userId === userFilter;
    
    let matchesDateRange = true;
    if (dateFrom && log.createdAt) {
      const logDate = new Date(log.createdAt);
      matchesDateRange = logDate >= dateFrom;
    }
    if (dateTo && log.createdAt && matchesDateRange) {
      const logDate = new Date(log.createdAt);
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      matchesDateRange = logDate <= endOfDay;
    }
    
    return matchesSearch && matchesTable && matchesAction && matchesUser && matchesDateRange;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedLogs,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredLogs);

  const handleDeleteAll = () => {
    if (deleteConfirmation === "DELETE") {
      deleteAllMutation.mutate();
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTableFilter("all");
    setActionFilter("all");
    setUserFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = searchTerm || tableFilter !== "all" || actionFilter !== "all" || 
                          userFilter !== "all" || dateFrom || dateTo;

  const loginEvents = logs.filter(l => 
    l.action?.toLowerCase().includes("login") || 
    l.action?.toLowerCase().includes("logout")
  ).length;

  const restoreEvents = logs.filter(l => 
    l.action?.toLowerCase().includes("restore")
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all configuration changes across the platform</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-logs"
              />
            </div>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-40" data-testid="select-table-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {tables.map(t => (
                  <SelectItem key={t} value={t!}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40" data-testid="select-action-filter">
                <Activity className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map(a => (
                  <SelectItem key={a} value={a!}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-56" data-testid="select-user-filter">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUserIds.map(userId => {
                  const email = getUserEmail(userId!);
                  return (
                    <SelectItem key={userId} value={userId!}>{email}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40" data-testid="button-date-from">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40" data-testid="button-date-to">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, "MMM dd, yyyy") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} data-testid="button-clear-filters">
                Clear Filters
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" data-testid="button-delete-all">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Purge All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Purge All Audit Logs
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                    <p>This action will <strong>permanently delete all {logs.length} audit log entries</strong> from the database.</p>
                    <p className="text-destructive font-medium">This cannot be undone. All historical records of user actions, logins, and changes will be lost forever.</p>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    To confirm, type <span className="font-bold text-destructive">DELETE</span> in the box below:
                  </p>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    data-testid="input-delete-confirmation"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteConfirmation("");
                  }}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAll}
                    disabled={deleteConfirmation !== "DELETE" || deleteAllMutation.isPending}
                    data-testid="button-confirm-delete"
                  >
                    {deleteAllMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Purge All Logs
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{filteredLogs.length}</p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? "Filtered" : "Total"} Events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {filteredLogs.filter(l => l.action?.toLowerCase().includes("create")).length}
            </p>
            <p className="text-sm text-muted-foreground">Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {filteredLogs.filter(l => l.action?.toLowerCase().includes("update")).length}
            </p>
            <p className="text-sm text-muted-foreground">Updated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {filteredLogs.filter(l => l.action?.toLowerCase().includes("delete")).length}
            </p>
            <p className="text-sm text-muted-foreground">Deleted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-green-500" />
              <p className="text-2xl font-bold">
                {filteredLogs.filter(l => l.action?.toLowerCase().includes("restore")).length}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Restored</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {filteredLogs.filter(l => 
                  l.action?.toLowerCase().includes("login") || 
                  l.action?.toLowerCase().includes("logout")
                ).length}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Login/Logout</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found</p>
            <p className="text-sm">
              {hasActiveFilters ? "Try adjusting your filters" : "Configuration changes will be logged here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.tableName || "-"}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.recordId ? log.recordId.slice(0, 8) + "..." : "-"}
                    </TableCell>
                    <TableCell className="text-sm">{getUserEmail(log.userId)}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ipAddress || "-"}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate" title={log.userAgent || ""}>
                      {log.userAgent ? log.userAgent.slice(0, 30) + "..." : "-"}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
