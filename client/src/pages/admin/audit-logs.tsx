import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Search, FileText, Loader2, RefreshCw, Download, Filter, Trash2, Calendar, User, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AuditLog } from "@shared/schema";

function getActionBadge(action: string | null) {
  if (!action) return <Badge variant="outline">Unknown</Badge>;
  
  if (action.toLowerCase().includes("create") || action.toLowerCase().includes("add") || action.toLowerCase().includes("login_success")) {
    return <Badge variant="default">{action}</Badge>;
  }
  if (action.toLowerCase().includes("delete") || action.toLowerCase().includes("remove") || action.toLowerCase().includes("failed")) {
    return <Badge variant="destructive">{action}</Badge>;
  }
  if (action.toLowerCase().includes("update") || action.toLowerCase().includes("edit")) {
    return <Badge variant="secondary">{action}</Badge>;
  }
  if (action.toLowerCase().includes("logout") || action.toLowerCase().includes("session")) {
    return <Badge variant="outline">{action}</Badge>;
  }
  return <Badge variant="outline">{action}</Badge>;
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();

  const { data: logs = [], isLoading, refetch } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
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

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTable = tableFilter === "all" || log.tableName === tableFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    return matchesSearch && matchesTable && matchesAction;
  });

  const handleDeleteAll = () => {
    if (deleteConfirmation === "DELETE") {
      deleteAllMutation.mutate();
    }
  };

  const loginEvents = logs.filter(l => 
    l.action?.toLowerCase().includes("login") || 
    l.action?.toLowerCase().includes("logout")
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all configuration changes across the platform</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-logs"
            />
          </div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-40" data-testid="select-table-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              {tables.map(t => (
                <SelectItem key={t} value={t!}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36" data-testid="select-action-filter">
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
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" data-testid="button-delete-all">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete All Audit Logs
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all {logs.length} audit log entries.
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
                  Delete All Logs
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {logs.filter(l => l.action?.toLowerCase().includes("create")).length}
            </p>
            <p className="text-sm text-muted-foreground">Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {logs.filter(l => l.action?.toLowerCase().includes("update")).length}
            </p>
            <p className="text-sm text-muted-foreground">Updated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {logs.filter(l => l.action?.toLowerCase().includes("delete")).length}
            </p>
            <p className="text-sm text-muted-foreground">Deleted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{loginEvents}</p>
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
            <p className="text-sm">Configuration changes will be logged here</p>
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
                {filteredLogs.slice(0, 100).map((log) => (
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
                    <TableCell className="text-sm">{log.userId || "System"}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ipAddress || "-"}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate" title={log.userAgent || ""}>
                      {log.userAgent ? log.userAgent.slice(0, 30) + "..." : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {filteredLogs.length > 100 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing 100 of {filteredLogs.length} logs. Use filters to narrow results.
        </p>
      )}
    </div>
  );
}
