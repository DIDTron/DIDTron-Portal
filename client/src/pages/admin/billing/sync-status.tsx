import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Server, Users, CreditCard, FileText, ArrowUpRight, ArrowDownRight, Download, Upload, Database, Activity, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SyncJob {
  id: string;
  entityType: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  totalRecords: number;
  importedRecords: number;
  updatedRecords: number;
  failedRecords: number;
  errors: string | null;
  params: string | null;
  createdAt: string;
}

interface ConnexCSStatus {
  connected: boolean;
  mockMode: boolean;
  message: string;
  tokenDaysRemaining?: number;
  stats?: {
    carriers: number;
    customers: number;
    rateCards: number;
    routes: number;
  };
}

interface ReconciliationStats {
  imports: {
    customers: { total: number; mapped: number; linked: number; readyToMap: number; failed: number };
    carriers: { total: number; mapped: number; linked: number; readyToMap: number; failed: number };
    rateCards: { total: number; mapped: number; readyToMap: number; failed: number };
    cdrs: { totalRecords: number; totalMinutes: number; totalBuyAmount: number; totalSellAmount: number; grossMargin: number };
  };
  didtron: {
    customers: { total: number; linkedToConnexcs: number };
    carriers: { total: number; linkedToConnexcs: number };
  };
  monthlyCdrs: Array<{ year: number; month: number; records: number; minutes: number; buyAmount: number; sellAmount: number; margin: number }>;
}

export default function SyncStatusPage() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { data: connexcsStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<ConnexCSStatus>({
    queryKey: ["/api/connexcs/status/detailed"],
  });

  const { data: syncJobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery<SyncJob[]>({
    queryKey: ["/api/admin/connexcs/sync/jobs"],
  });

  const { data: reconciliation, isLoading: reconciliationLoading, refetch: refetchReconciliation } = useQuery<ReconciliationStats>({
    queryKey: ["/api/admin/connexcs/reconciliation"],
  });

  const syncCustomersMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/customers"),
    onSuccess: () => {
      toast({ title: "Customer sync started" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const syncCarriersMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/carriers"),
    onSuccess: () => {
      toast({ title: "Carrier sync started" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const syncRateCardsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/ratecards"),
    onSuccess: () => {
      toast({ title: "Rate card sync started" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const syncCDRsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/cdrs", { year: selectedYear, month: selectedMonth }),
    onSuccess: () => {
      toast({ title: "CDR sync started", description: `Syncing ${selectedYear}-${String(selectedMonth).padStart(2, '0')}` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const syncAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/all"),
    onSuccess: () => {
      toast({ title: "Full sync started", description: "Syncing customers, carriers, and rate cards" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const mapCustomersMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/map/customers"),
    onSuccess: (data: any) => {
      toast({ title: "Customers mapped", description: `Created: ${data.created}, Linked: ${data.linked}, Failed: ${data.failed}` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/import/customers"] });
    },
    onError: (error: Error) => {
      toast({ title: "Mapping failed", description: error.message, variant: "destructive" });
    },
  });

  const mapCarriersMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/map/carriers"),
    onSuccess: (data: any) => {
      toast({ title: "Carriers mapped", description: `Created: ${data.created}, Linked: ${data.linked}, Failed: ${data.failed}` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/import/carriers"] });
    },
    onError: (error: Error) => {
      toast({ title: "Mapping failed", description: error.message, variant: "destructive" });
    },
  });

  // New sync mutations for balances, routes, scripts
  const syncBalancesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/balances"),
    onSuccess: () => {
      toast({ title: "Balance sync started" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const syncRoutesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/routes"),
    onSuccess: () => {
      toast({ title: "Route sync started" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const syncScriptsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/connexcs/sync/scripts"),
    onSuccess: () => {
      toast({ title: "ScriptForge sync started" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const syncHistoricalCDRsMutation = useMutation({
    mutationFn: (params: { year: number; months?: number[] }) => 
      apiRequest("POST", "/api/admin/connexcs/sync/historical-cdrs", params),
    onSuccess: () => {
      toast({ title: "Historical CDR sync started", description: "This may take several minutes" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/connexcs/sync/jobs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const isSyncing = syncAllMutation.isPending || syncCustomersMutation.isPending || syncCarriersMutation.isPending || syncRateCardsMutation.isPending || syncCDRsMutation.isPending || syncBalancesMutation.isPending || syncRoutesMutation.isPending || syncScriptsMutation.isPending || syncHistoricalCDRsMutation.isPending;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "secondary",
      syncing: "default",
      failed: "destructive",
      partial: "outline",
      pending: "outline",
    };
    return <Badge variant={variants[status] || "outline"} className="capitalize">{status}</Badge>;
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "customer":
        return <Users className="h-4 w-4" />;
      case "carrier":
        return <Server className="h-4 w-4" />;
      case "ratecard":
        return <CreditCard className="h-4 w-4" />;
      case "cdr":
        return <FileText className="h-4 w-4" />;
      case "balance":
        return <DollarSign className="h-4 w-4" />;
      case "route":
        return <ArrowUpRight className="h-4 w-4" />;
      case "script":
        return <Activity className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const years = [2024, 2025, 2026];
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">ConnexCS Data Sync</h1>
          <p className="text-muted-foreground">Import and synchronize data from your ConnexCS account</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => { refetchStatus(); refetchJobs(); }}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => syncAllMutation.mutate()} 
            disabled={isSyncing || !connexcsStatus?.connected}
            data-testid="button-sync-all"
          >
            <Download className={`h-4 w-4 mr-2 ${syncAllMutation.isPending ? "animate-spin" : ""}`} />
            Sync All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connection</p>
                <p className="text-lg font-semibold">
                  {statusLoading ? "..." : connexcsStatus?.connected ? "Connected" : "Disconnected"}
                </p>
              </div>
              {connexcsStatus?.connected ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
            {connexcsStatus?.tokenDaysRemaining && (
              <p className="text-xs text-muted-foreground mt-2">Token expires in {connexcsStatus.tokenDaysRemaining} days</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-lg font-semibold">{connexcsStatus?.stats?.customers ?? "—"}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carriers</p>
                <p className="text-lg font-semibold">{connexcsStatus?.stats?.carriers ?? "—"}</p>
              </div>
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rate Cards</p>
                <p className="text-lg font-semibold">{connexcsStatus?.stats?.rateCards ?? "—"}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              Pull from ConnexCS
            </CardTitle>
            <CardDescription>Import data from your ConnexCS account into DIDTron</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Customers</p>
                    <p className="text-sm text-muted-foreground">Import customer accounts</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => syncCustomersMutation.mutate()}
                  disabled={syncCustomersMutation.isPending || !connexcsStatus?.connected}
                  data-testid="button-sync-customers"
                >
                  {syncCustomersMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Sync"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Carriers/Suppliers</p>
                    <p className="text-sm text-muted-foreground">Import carrier connections</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => syncCarriersMutation.mutate()}
                  disabled={syncCarriersMutation.isPending || !connexcsStatus?.connected}
                  data-testid="button-sync-carriers"
                >
                  {syncCarriersMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Sync"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Rate Cards</p>
                    <p className="text-sm text-muted-foreground">Import rate cards with destinations</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => syncRateCardsMutation.mutate()}
                  disabled={syncRateCardsMutation.isPending || !connexcsStatus?.connected}
                  data-testid="button-sync-ratecards"
                >
                  {syncRateCardsMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Sync"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">CDRs (Call Records)</p>
                    <p className="text-sm text-muted-foreground">Import historical CDRs by month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(m => (
                        <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => syncCDRsMutation.mutate()}
                    disabled={syncCDRsMutation.isPending || !connexcsStatus?.connected}
                    data-testid="button-sync-cdrs"
                  >
                    {syncCDRsMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Sync"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" />
              Map to DIDTron
            </CardTitle>
            <CardDescription>Convert imported data to DIDTron entities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Map Customers</p>
                    <p className="text-sm text-muted-foreground">Create DIDTron customers from imports</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => mapCustomersMutation.mutate()}
                  disabled={mapCustomersMutation.isPending}
                  data-testid="button-map-customers"
                >
                  {mapCustomersMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Map"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Map Carriers</p>
                    <p className="text-sm text-muted-foreground">Create DIDTron carriers from imports</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => mapCarriersMutation.mutate()}
                  disabled={mapCarriersMutation.isPending}
                  data-testid="button-map-carriers"
                >
                  {mapCarriersMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Map"}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Mapping creates new records in DIDTron from imported ConnexCS data. 
                Existing records with matching ConnexCS IDs will be linked instead of duplicated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sync History
          </CardTitle>
          <CardDescription>Recent synchronization jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncJobs && syncJobs.length > 0 ? (
                  syncJobs.slice(0, 20).map((job) => {
                    const startedAt = job.startedAt ? new Date(job.startedAt) : null;
                    const completedAt = job.completedAt ? new Date(job.completedAt) : null;
                    const duration = startedAt && completedAt 
                      ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000) 
                      : null;

                    return (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEntityIcon(job.entityType)}
                            <span className="capitalize">{job.entityType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            {getStatusBadge(job.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-600">{job.importedRecords}</span>
                            {job.updatedRecords > 0 && (
                              <span className="text-blue-600"> / {job.updatedRecords} upd</span>
                            )}
                            {job.failedRecords > 0 && (
                              <span className="text-red-600"> / {job.failedRecords} fail</span>
                            )}
                            <span className="text-muted-foreground"> of {job.totalRecords}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {startedAt ? format(startedAt, "MMM d, HH:mm") : "—"}
                        </TableCell>
                        <TableCell>
                          {duration !== null ? `${duration}s` : job.status === "syncing" ? "Running..." : "—"}
                        </TableCell>
                        <TableCell>
                          {job.params && (
                            <Badge variant="outline" className="text-xs">
                              {JSON.parse(job.params).year}-{String(JSON.parse(job.params).month).padStart(2, '0')}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No sync jobs yet. Start a sync to see history here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Reconciliation Dashboard
              </CardTitle>
              <CardDescription>Compare ConnexCS imports with DIDTron data</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetchReconciliation()}
              disabled={reconciliationLoading}
              data-testid="button-refresh-reconciliation"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${reconciliationLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reconciliationLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reconciliation ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Customers</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold">{reconciliation.imports.customers.total}</span>
                          <span className="text-sm text-muted-foreground">imported</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <Badge variant="secondary" className="text-xs">{reconciliation.imports.customers.mapped} mapped</Badge>
                          <Badge variant="outline" className="text-xs">{reconciliation.imports.customers.linked} linked</Badge>
                          {reconciliation.imports.customers.readyToMap > 0 && (
                            <Badge variant="outline" className="text-xs text-yellow-600">{reconciliation.imports.customers.readyToMap} ready</Badge>
                          )}
                        </div>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        DIDTron: {reconciliation.didtron.customers.total} total ({reconciliation.didtron.customers.linkedToConnexcs} linked)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Carriers</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold">{reconciliation.imports.carriers.total}</span>
                          <span className="text-sm text-muted-foreground">imported</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <Badge variant="secondary" className="text-xs">{reconciliation.imports.carriers.mapped} mapped</Badge>
                          <Badge variant="outline" className="text-xs">{reconciliation.imports.carriers.linked} linked</Badge>
                          {reconciliation.imports.carriers.readyToMap > 0 && (
                            <Badge variant="outline" className="text-xs text-yellow-600">{reconciliation.imports.carriers.readyToMap} ready</Badge>
                          )}
                        </div>
                      </div>
                      <Server className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        DIDTron: {reconciliation.didtron.carriers.total} total ({reconciliation.didtron.carriers.linkedToConnexcs} linked)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rate Cards</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold">{reconciliation.imports.rateCards.total}</span>
                          <span className="text-sm text-muted-foreground">imported</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <Badge variant="secondary" className="text-xs">{reconciliation.imports.rateCards.mapped} mapped</Badge>
                          {reconciliation.imports.rateCards.readyToMap > 0 && (
                            <Badge variant="outline" className="text-xs text-yellow-600">{reconciliation.imports.rateCards.readyToMap} ready</Badge>
                          )}
                        </div>
                      </div>
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">CDR Records</p>
                        <p className="text-2xl font-bold">{reconciliation.imports.cdrs.totalRecords.toLocaleString()}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Minutes</p>
                        <p className="text-2xl font-bold">{Math.round(reconciliation.imports.cdrs.totalMinutes).toLocaleString()}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${reconciliation.imports.cdrs.totalSellAmount.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Gross Margin</p>
                        <p className={`text-2xl font-bold ${reconciliation.imports.cdrs.grossMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${reconciliation.imports.cdrs.grossMargin.toFixed(2)}
                        </p>
                      </div>
                      <TrendingUp className={`h-8 w-8 ${reconciliation.imports.cdrs.grossMargin >= 0 ? "text-green-500" : "text-red-500"}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {reconciliation.monthlyCdrs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Monthly CDR Breakdown</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Records</TableHead>
                        <TableHead className="text-right">Minutes</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciliation.monthlyCdrs.map((month) => (
                        <TableRow key={`${month.year}-${month.month}`}>
                          <TableCell>{format(new Date(month.year, month.month - 1), "MMMM yyyy")}</TableCell>
                          <TableCell className="text-right">{month.records.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{Math.round(month.minutes).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-red-600">${month.buyAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-green-600">${month.sellAmount.toFixed(2)}</TableCell>
                          <TableCell className={`text-right font-medium ${month.margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${month.margin.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No data available. Sync some data first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
