import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cog, Link2, DollarSign, Languages, Check, AlertCircle, Database, Search, Upload, Download, ChevronLeft, ChevronRight, Loader2, Trash2, XCircle, RefreshCw, RefreshCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { validateAndNormalizeAZData, type ValidationError, VALID_BILLING_INCREMENTS } from "@shared/billing-increment-utils";

export function GlobalSettingsPlatform() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>Basic platform settings and configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="DIDTron Communications" data-testid="input-platform-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" placeholder="support@example.com" data-testid="input-support-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-timezone">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="cet">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="iso">
                    <SelectTrigger data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                      <SelectItem value="us">MM/DD/YYYY</SelectItem>
                      <SelectItem value="eu">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Disable access for non-admin users</p>
                </div>
                <Switch data-testid="switch-maintenance" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>Advanced platform settings for experienced administrators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable verbose logging</p>
                </div>
                <Switch data-testid="switch-debug" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>API Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Enable rate limiting on API endpoints</p>
                </div>
                <Switch defaultChecked data-testid="switch-rate-limit" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Data Retention
              </CardTitle>
              <CardDescription>Configure how long deleted items are kept before permanent removal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trash-retention">Trash Retention Period</Label>
                  <Select defaultValue="30">
                    <SelectTrigger data-testid="select-trash-retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="10">10 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Deleted items can be restored within this period
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audit-retention">Audit Log Retention</Label>
                  <Select defaultValue="90">
                    <SelectTrigger data-testid="select-audit-retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Audit logs older than this will be auto-purged
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
        <Button data-testid="button-save">Save Changes</Button>
      </div>
    </div>
  );
}

export function GlobalSettingsIntegrations() {
  const integrations = [
    { name: "Stripe", status: "connected", description: "Payment processing" },
    { name: "Brevo", status: "disconnected", description: "Email delivery" },
    { name: "Ayrshare", status: "disconnected", description: "Social media automation" },
    { name: "OpenAI", status: "connected", description: "AI-powered features" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Integrations</h1>
        <p className="text-muted-foreground">Manage third-party service integrations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                <CardTitle className="text-base">{integration.name}</CardTitle>
              </div>
              <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                {integration.status === "connected" ? (
                  <><Check className="h-3 w-3 mr-1" />Connected</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" />Disconnected</>
                )}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
              <Button 
                variant={integration.status === "connected" ? "outline" : "default"} 
                size="sm"
                data-testid={`button-${integration.name.toLowerCase()}`}
              >
                {integration.status === "connected" ? "Configure" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GlobalSettingsCurrencies() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Currencies</h1>
        <p className="text-muted-foreground">Configure supported currencies and exchange rates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Configuration
          </CardTitle>
          <CardDescription>Set base currency and exchange rate source</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Base Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger data-testid="select-base-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                  <SelectItem value="gbp">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exchange Rate Source</Label>
              <Select defaultValue="openexchange">
                <SelectTrigger data-testid="select-fx-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openexchange">Open Exchange Rates</SelectItem>
                  <SelectItem value="ecb">European Central Bank</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Auto-refresh Exchange Rates</Label>
              <p className="text-sm text-muted-foreground">Automatically update rates hourly</p>
            </div>
            <Switch defaultChecked data-testid="switch-auto-refresh" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
        <Button data-testid="button-save">Save Changes</Button>
      </div>
    </div>
  );
}

export function GlobalSettingsLocalization() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Localization</h1>
        <p className="text-muted-foreground">Configure language and regional settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language Settings
          </CardTitle>
          <CardDescription>Configure default and supported languages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger data-testid="select-default-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number Format</Label>
              <Select defaultValue="en-us">
                <SelectTrigger data-testid="select-number-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-us">1,234.56 (US)</SelectItem>
                  <SelectItem value="en-gb">1,234.56 (UK)</SelectItem>
                  <SelectItem value="de">1.234,56 (German)</SelectItem>
                  <SelectItem value="fr">1 234,56 (French)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>RTL Support</Label>
              <p className="text-sm text-muted-foreground">Enable right-to-left language support</p>
            </div>
            <Switch data-testid="switch-rtl" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
        <Button data-testid="button-save">Save Changes</Button>
      </div>
    </div>
  );
}

type AzDestination = {
  id: string;
  code: string;
  destination: string;
  region: string | null;
  billingIncrement: string | null;
  gracePeriod: number | null;
  isActive: boolean | null;
};

export function GlobalSettingsAZDatabase() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AzDestination>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<"update" | "replace">("update");
  const [pageInput, setPageInput] = useState("");
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreviewRows, setCsvPreviewRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    code: "",
    destination: "",
    region: "",
    billingIncrement: "",
  });
  const [allCsvRows, setAllCsvRows] = useState<string[][]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const limit = pageSize;

  const { data: pendingJobs } = useQuery<{ pending: number }>({
    queryKey: ["/api/admin/jobs/az-import-status"],
    refetchInterval: autoRefresh ? 3000 : false,
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const hasPendingImports = (pendingJobs?.pending ?? 0) > 0;

  useEffect(() => {
    if (hasPendingImports) {
      setAutoRefresh(true);
    }
  }, [hasPendingImports]);

  useEffect(() => {
    if (autoRefresh && !hasPendingImports) {
      queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/az-destinations") });
      setAutoRefresh(false);
    }
  }, [autoRefresh, hasPendingImports]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedRegion, pageSize]);

  const { data: regionsData } = useQuery<string[]>({
    queryKey: ["/api/az-destinations/regions"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (selectedRegion !== "all") queryParams.set("region", selectedRegion);
  queryParams.set("limit", String(limit));
  queryParams.set("offset", String(page * limit));
  const queryString = queryParams.toString();
  
  const { data, isLoading, isFetching, refetch } = useQuery<{ destinations: AzDestination[]; total: number }>({
    queryKey: [`/api/az-destinations?${queryString}`],
    refetchInterval: autoRefresh ? 3000 : false,
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AzDestination> }) => {
      return apiRequest("PATCH", `/api/az-destinations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/az-destinations") });
      setEditingId(null);
      toast({ title: "Destination updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/az-destinations");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/az-destinations") });
      toast({ title: "All destinations deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const syncToPeriodExceptionsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/period-exceptions/sync-from-az");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sync Complete",
        description: `Added: ${data.added}, Updated: ${data.updated}, Removed: ${data.removed || 0}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/period-exceptions"] });
    },
    onError: (error: Error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/az-destinations/export/csv");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `az-destinations-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Export complete", description: `Exported ${total.toLocaleString()} destinations` });
    } catch (error) {
      toast({ title: "Export failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const parseCSVRow = useCallback((row: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];
      
      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  }, []);

  const downloadTemplate = () => {
    const template = "code,destination,region,billingIncrement\n1,Example Country,Example Region,60/60\n1234,Example Country - Mobile,Example Region,60/1";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "az-destinations-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseFileHeaders = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) {
      throw new Error("File is empty");
    }
    const headers = parseCSVRow(lines[0]);
    const previewRows: string[][] = [];
    const allRows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      if (row.some(cell => cell.trim())) {
        allRows.push(row);
        if (previewRows.length < 5) {
          previewRows.push(row);
        }
      }
    }
    setCsvHeaders(headers);
    setCsvPreviewRows(previewRows);
    setAllCsvRows(allRows);
    
    const autoMapping: Record<string, string> = { code: "", destination: "", region: "", billingIncrement: "" };
    headers.forEach((h, idx) => {
      const lower = h.toLowerCase().trim();
      if (lower === "code" || lower === "prefix" || lower === "dial code" || lower === "dialcode") {
        autoMapping.code = String(idx);
      } else if (lower === "destination" || lower === "name" || lower === "description" || lower === "dest") {
        autoMapping.destination = String(idx);
      } else if (lower === "region" || lower === "area" || lower === "zone") {
        autoMapping.region = String(idx);
      } else if (lower === "billingincrement" || lower === "increment" || lower === "billing increment" || lower === "billing") {
        autoMapping.billingIncrement = String(idx);
      }
    });
    setColumnMapping(autoMapping);
  };

  const resetImportWizard = () => {
    setImportStep(1);
    setImportFile(null);
    setImportMode("update");
    setCsvHeaders([]);
    setCsvPreviewRows([]);
    setAllCsvRows([]);
    setColumnMapping({ code: "", destination: "", region: "", billingIncrement: "" });
  };

  const runMappedImport = async () => {
    if (!importFile || !columnMapping.code || !columnMapping.destination) return;
    
    setImportProgress("Validating data...");
    
    try {
      const codeIdx = parseInt(columnMapping.code);
      const destIdx = parseInt(columnMapping.destination);
      const regionIdx = columnMapping.region ? parseInt(columnMapping.region) : -1;
      const incrementIdx = columnMapping.billingIncrement ? parseInt(columnMapping.billingIncrement) : -1;
      
      const rawDestinations = allCsvRows
        .filter(row => row[codeIdx] || row[destIdx])
        .map(row => ({
          code: row[codeIdx]?.trim() || "",
          destination: row[destIdx]?.trim() || "",
          region: regionIdx >= 0 ? row[regionIdx]?.trim() || null : null,
          billingIncrement: incrementIdx >= 0 ? row[incrementIdx]?.trim() || "60/60" : "60/60",
        }));
      
      if (rawDestinations.length === 0) {
        throw new Error("No valid destinations found after mapping");
      }
      
      const validationResult = validateAndNormalizeAZData(rawDestinations);
      
      if (!validationResult.isValid) {
        setValidationErrors(validationResult.errors);
        setShowValidationErrors(true);
        return;
      }
      
      const allDestinations = validationResult.normalizedData as Array<{
        code: string;
        destination: string;
        region: string | null;
        billingIncrement: string;
      }>;
      
      setShowImportDialog(false);
      setIsImporting(true);
      setImportProgress("Processing import...");
      
      if (importMode === "replace") {
        setImportProgress("Clearing existing data...");
        await apiRequest("DELETE", "/api/az-destinations");
      }
      
      const chunkSize = 1000;
      let totalJobsQueued = 0;
      const totalChunks = Math.ceil(allDestinations.length / chunkSize);
      
      for (let i = 0; i < allDestinations.length; i += chunkSize) {
        const chunk = allDestinations.slice(i, i + chunkSize);
        const chunkNum = Math.floor(i / chunkSize) + 1;
        setImportProgress(`Queuing chunk ${chunkNum} of ${totalChunks}...`);
        
        await apiRequest("POST", "/api/az-destinations/import-job", { 
          destinations: chunk,
          mode: "update",
        });
        totalJobsQueued++;
      }
      
      toast({ 
        title: "Import jobs queued", 
        description: `${totalJobsQueued} background job(s) queued for ${allDestinations.length.toLocaleString()} destinations. Check Job Queue for progress.`,
      });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/az-destinations") });
      }, 3000);
    } catch (error) {
      toast({ title: "Import failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsImporting(false);
      setImportProgress("");
      resetImportWizard();
    }
  };
  
  const downloadErrorReport = () => {
    const header = "Row,Column,Value,Error\n";
    const rows = validationErrors.map(e => 
      `${e.row},"${e.column}","${e.value.replace(/"/g, '""')}","${e.message.replace(/"/g, '""')}"`
    ).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const destinations = data?.destinations || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleEdit = (dest: AzDestination) => {
    setEditingId(dest.id);
    setEditData({
      billingIncrement: dest.billingIncrement || "60/60",
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: editData });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">A-Z Destinations Database</h1>
          <p className="text-muted-foreground">Master database of dial codes for rate normalization</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasPendingImports && (
            <Badge variant="default" className="animate-pulse" data-testid="badge-importing">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Importing...
            </Badge>
          )}
          <Badge variant="secondary" data-testid="badge-total">
            {total.toLocaleString()} destinations
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              refetch();
            }}
            disabled={isFetching}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncToPeriodExceptionsMutation.mutate()}
            disabled={syncToPeriodExceptionsMutation.isPending}
            data-testid="button-sync-period-exceptions"
          >
            {syncToPeriodExceptionsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Sync to Period Exceptions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || total === 0}
            data-testid="button-export"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            data-testid="button-download-template"
          >
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <label>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setImportFile(file);
                    await parseFileHeaders(file);
                    setImportStep(1);
                    setShowImportDialog(true);
                  } catch (error) {
                    toast({ title: "File error", description: (error as Error).message, variant: "destructive" });
                  }
                }
                e.target.value = "";
              }}
              disabled={isImporting}
              data-testid="input-import-file"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isImporting}
              asChild
            >
              <span data-testid="button-import">
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {isImporting ? importProgress : "Import CSV"}
              </span>
            </Button>
          </label>

          <Dialog open={showImportDialog} onOpenChange={(open) => { 
            if (!open) resetImportWizard();
            setShowImportDialog(open); 
          }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import CSV - Step {importStep} of 3</DialogTitle>
                <DialogDescription>
                  {importStep === 1 && `Map columns from "${importFile?.name}" to database fields`}
                  {importStep === 2 && "Preview how your data will be imported"}
                  {importStep === 3 && "Choose import mode and confirm"}
                </DialogDescription>
              </DialogHeader>

              {importStep === 1 && (
                <div className="space-y-4 py-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Found {csvHeaders.length} columns and {allCsvRows.length.toLocaleString()} data rows
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <Label className="font-medium">Code <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground">Dial code / prefix (required)</p>
                      </div>
                      <Select value={columnMapping.code} onValueChange={(v) => setColumnMapping(m => ({ ...m, code: v }))}>
                        <SelectTrigger data-testid="select-map-code">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {csvHeaders.map((h, i) => (
                            <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <Label className="font-medium">Destination <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground">Destination name (required)</p>
                      </div>
                      <Select value={columnMapping.destination} onValueChange={(v) => setColumnMapping(m => ({ ...m, destination: v }))}>
                        <SelectTrigger data-testid="select-map-destination">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {csvHeaders.map((h, i) => (
                            <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <Label className="font-medium">Region</Label>
                        <p className="text-xs text-muted-foreground">Geographic region (optional)</p>
                      </div>
                      <Select value={columnMapping.region || "none"} onValueChange={(v) => setColumnMapping(m => ({ ...m, region: v === "none" ? "" : v }))}>
                        <SelectTrigger data-testid="select-map-region">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Skip --</SelectItem>
                          {csvHeaders.map((h, i) => (
                            <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div>
                        <Label className="font-medium">Billing Increment</Label>
                        <p className="text-xs text-muted-foreground">e.g., 60/60, 60/1, 1/1 (optional)</p>
                      </div>
                      <Select value={columnMapping.billingIncrement || "none"} onValueChange={(v) => setColumnMapping(m => ({ ...m, billingIncrement: v === "none" ? "" : v }))}>
                        <SelectTrigger data-testid="select-map-increment">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Skip (default: 60/60) --</SelectItem>
                          {csvHeaders.map((h, i) => (
                            <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {importStep === 2 && (
                <div className="space-y-4 py-4">
                  <div className="text-sm text-muted-foreground">
                    Preview of first {Math.min(5, csvPreviewRows.length)} rows with your mapping:
                  </div>
                  <div className="border rounded-md overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Increment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvPreviewRows.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono">{columnMapping.code ? row[parseInt(columnMapping.code)] : "-"}</TableCell>
                            <TableCell>{columnMapping.destination ? row[parseInt(columnMapping.destination)] : "-"}</TableCell>
                            <TableCell>{columnMapping.region ? row[parseInt(columnMapping.region)] || "-" : "-"}</TableCell>
                            <TableCell>{columnMapping.billingIncrement ? row[parseInt(columnMapping.billingIncrement)] || "60/60" : "60/60"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{allCsvRows.length.toLocaleString()}</span> total rows will be imported
                  </div>
                </div>
              )}

              {importStep === 3 && (
                <div className="space-y-4 py-4">
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover-elevate" onClick={() => setImportMode("update")}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "update"}
                        onChange={() => setImportMode("update")}
                        className="mt-1"
                        data-testid="radio-import-update"
                      />
                      <div>
                        <div className="font-medium">Update / Add</div>
                        <div className="text-sm text-muted-foreground">
                          Add new destinations and update existing ones. Existing destinations not in the CSV will remain unchanged.
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover-elevate" onClick={() => setImportMode("replace")}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="mt-1"
                        data-testid="radio-import-replace"
                      />
                      <div>
                        <div className="font-medium">Full Replacement</div>
                        <div className="text-sm text-muted-foreground">
                          Delete ALL existing destinations first, then import the CSV. Use this to completely replace your database.
                        </div>
                        {total > 0 && (
                          <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                            Warning: This will delete {total.toLocaleString()} existing destinations
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setShowImportDialog(false); resetImportWizard(); }} data-testid="button-cancel-import">
                  Cancel
                </Button>
                {importStep > 1 && (
                  <Button variant="outline" onClick={() => setImportStep((s) => (s - 1) as 1 | 2 | 3)} data-testid="button-back">
                    Back
                  </Button>
                )}
                {importStep < 3 ? (
                  <Button 
                    onClick={() => setImportStep((s) => (s + 1) as 1 | 2 | 3)} 
                    disabled={importStep === 1 && (!columnMapping.code || !columnMapping.destination)}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={runMappedImport} data-testid="button-confirm-import">
                    {importMode === "replace" ? "Replace All & Import" : "Import"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showValidationErrors} onOpenChange={setShowValidationErrors}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Validation Errors Found
                </DialogTitle>
                <DialogDescription>
                  {validationErrors.length} error(s) found in your CSV file. Please fix these issues and try again.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-[300px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Row</TableHead>
                        <TableHead className="w-32">Column</TableHead>
                        <TableHead className="w-32">Value</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationErrors.slice(0, 100).map((error, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{error.row}</TableCell>
                          <TableCell className="text-muted-foreground">{error.column}</TableCell>
                          <TableCell className="font-mono text-destructive truncate max-w-32" title={error.value}>
                            {error.value || "(empty)"}
                          </TableCell>
                          <TableCell className="text-sm">{error.message}</TableCell>
                        </TableRow>
                      ))}
                      {validationErrors.length > 100 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            ...and {validationErrors.length - 100} more errors
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                <p>Valid billing increments: {VALID_BILLING_INCREMENTS.join(", ")}</p>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={downloadErrorReport} data-testid="button-download-errors">
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
                <Button onClick={() => setShowValidationErrors(false)} data-testid="button-close-errors">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog onOpenChange={(open) => { if (!open) setDeleteConfirmText(""); }}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={total === 0 || deleteAllMutation.isPending} data-testid="button-delete-all">
                {deleteAllMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span className="block font-medium text-foreground">
                    You are about to delete ALL {total.toLocaleString()} destinations from the A-Z Database.
                  </span>
                  <span className="block">
                    This will permanently remove every dial code, destination name, region, and billing increment from your database. This action cannot be undone.
                  </span>
                  <span className="block text-amber-600 dark:text-amber-400 font-medium">
                    We strongly recommend exporting a backup first using the Export CSV button before proceeding.
                  </span>
                  <span className="block font-medium mt-2">
                    Type DELETE to confirm:
                  </span>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="mt-2"
                    data-testid="input-delete-confirm"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    deleteAllMutation.mutate();
                    setDeleteConfirmText("");
                  }}
                  disabled={deleteConfirmText !== "DELETE"}
                  className="bg-destructive text-destructive-foreground"
                  data-testid="button-confirm-delete"
                >
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Destination Codes</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search code or destination..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48" data-testid="select-region">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regionsData?.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Code</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead className="w-40">Region</TableHead>
                      <TableHead className="w-32">Increment</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No destinations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      destinations.map((dest) => (
                        <TableRow key={dest.id} data-testid={`row-destination-${dest.id}`}>
                          <TableCell className="font-mono font-medium">{dest.code}</TableCell>
                          <TableCell>{dest.destination}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {dest.region || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {editingId === dest.id ? (
                              <Select
                                value={editData.billingIncrement || "60/60"}
                                onValueChange={(v) => setEditData({ ...editData, billingIncrement: v })}
                              >
                                <SelectTrigger className="h-8" data-testid="select-edit-increment">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1/1">1/1</SelectItem>
                                  <SelectItem value="6/6">6/6</SelectItem>
                                  <SelectItem value="30/30">30/30</SelectItem>
                                  <SelectItem value="60/60">60/60</SelectItem>
                                  <SelectItem value="30/6">30/6</SelectItem>
                                  <SelectItem value="60/6">60/6</SelectItem>
                                  <SelectItem value="60/1">60/1</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm">{dest.billingIncrement || "60/60"}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === dest.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  onClick={handleSave}
                                  disabled={updateMutation.isPending}
                                  data-testid="button-save-edit"
                                >
                                  {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancel} data-testid="button-cancel-edit">
                                  X
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(dest)} data-testid="button-edit">
                                Edit
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows:</span>
                  <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger className="w-20" data-testid="select-page-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground ml-2">
                    Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <Input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageInput || String(page + 1)}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={() => {
                        const p = parseInt(pageInput);
                        if (p >= 1 && p <= totalPages) setPage(p - 1);
                        setPageInput("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const p = parseInt(pageInput);
                          if (p >= 1 && p <= totalPages) setPage(p - 1);
                          setPageInput("");
                        }
                      }}
                      className="w-16 text-center"
                      data-testid="input-page-number"
                    />
                    <span className="text-sm text-muted-foreground">of {totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
