import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { AlertTriangle, Search, Trash2, Loader2, RefreshCw, RotateCcw, Filter, Clock, Database, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import type { Trash } from "@shared/schema";

export default function TrashPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [purgeConfirmation, setPurgeConfirmation] = useState("");
  const { toast } = useToast();

  const { data: trashData, isLoading, refetch } = useQuery<{ items: Trash[]; total: number }>({
    queryKey: ["/api/trash"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });
  const trashItems = trashData?.items || [];

  const { data: settings } = useQuery<{ retentionDays: number }>({
    queryKey: ["/api/platform-settings", "retention_days"],
    queryFn: async () => {
      const res = await fetch("/api/platform-settings/retention_days");
      if (!res.ok) return { retentionDays: 30 };
      const data = await res.json();
      return { retentionDays: parseInt(data.value) || 30 };
    },
    staleTime: STALE_TIME.STATIC,
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/trash/${id}/restore`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trash"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      toast({
        title: "Item restored",
        description: "The item has been restored and logged in audit trail.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to restore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const purgeAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/trash/all");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trash"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      toast({
        title: "Trash purged",
        description: `${data.purgedCount || trashItems.length} items have been permanently deleted.`,
      });
      setPurgeDialogOpen(false);
      setPurgeConfirmation("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to purge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tables = Array.from(new Set(trashItems.map(t => t.tableName).filter(Boolean)));

  const filteredItems = trashItems.filter(item => {
    const matchesSearch = !searchTerm ||
      item.tableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recordId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTable = tableFilter === "all" || item.tableName === tableFilter;
    
    return matchesSearch && matchesTable;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredItems);

  const getDaysUntilExpiry = (restorableUntil: Date | string | null) => {
    if (!restorableUntil) return null;
    const expiry = new Date(restorableUntil);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handlePurgeAll = () => {
    if (purgeConfirmation === "DELETE") {
      purgeAllMutation.mutate();
    }
  };

  const expiringCount = trashItems.filter(i => {
    const days = getDaysUntilExpiry(i.restorableUntil);
    return days !== null && days <= 3;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          <p className="text-muted-foreground">
            Deleted items are retained for {settings?.retentionDays || 30} days before automatic permanent deletion
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-trash"
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
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={purgeDialogOpen} onOpenChange={setPurgeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={trashItems.length === 0} data-testid="button-purge-all">
                <Trash2 className="h-4 w-4 mr-2" />
                Purge All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Permanently Delete All Trash
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 space-y-2">
                  <p className="font-medium text-destructive">What does "Purge All" do?</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>Immediately and permanently deletes <strong>all {trashItems.length} items</strong> in trash</li>
                    <li>Bypasses the {settings?.retentionDays || 30}-day retention period</li>
                    <li>Deleted data <strong>cannot be recovered</strong> after purging</li>
                    <li>This action is logged in the audit trail</li>
                  </ul>
                </div>
                <div className="bg-muted rounded-md p-4 space-y-2">
                  <p className="font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Normal behavior (without purging)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items in trash are automatically deleted after {settings?.retentionDays || 30} days. 
                    You can restore items anytime before they expire.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    To confirm permanent deletion, type <span className="font-bold text-destructive">DELETE</span> below:
                  </p>
                  <Input
                    value={purgeConfirmation}
                    onChange={(e) => setPurgeConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    data-testid="input-purge-confirmation"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setPurgeDialogOpen(false);
                  setPurgeConfirmation("");
                }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handlePurgeAll}
                  disabled={purgeConfirmation !== "DELETE" || purgeAllMutation.isPending}
                  data-testid="button-confirm-purge"
                >
                  {purgeAllMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Permanently Delete All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{trashItems.length}</p>
            </div>
            <p className="text-sm text-muted-foreground">Items in Trash</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{tables.length}</p>
            </div>
            <p className="text-sm text-muted-foreground">Tables Affected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{settings?.retentionDays || 30}</p>
            </div>
            <p className="text-sm text-muted-foreground">Days Retention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <p className="text-2xl font-bold">{expiringCount}</p>
            </div>
            <p className="text-sm text-muted-foreground">Expiring Soon</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Trash is empty</p>
            <p className="text-sm">Deleted items will appear here and can be restored</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Deleted By</TableHead>
                  <TableHead>Expires In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => {
                  const daysLeft = getDaysUntilExpiry(item.restorableUntil);
                  return (
                    <TableRow key={item.id} data-testid={`row-trash-${item.id}`}>
                      <TableCell>
                        <Badge variant="outline">{item.tableName}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.recordId?.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {item.deletedAt ? new Date(item.deletedAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.deletedBy ? item.deletedBy.slice(0, 8) + "..." : "System"}
                      </TableCell>
                      <TableCell>
                        {daysLeft !== null ? (
                          <Badge variant={daysLeft <= 3 ? "destructive" : daysLeft <= 7 ? "secondary" : "outline"}>
                            {daysLeft} days
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreMutation.mutate(item.id)}
                          disabled={restoreMutation.isPending}
                          data-testid={`button-restore-${item.id}`}
                        >
                          {restoreMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-1" />
                          )}
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
