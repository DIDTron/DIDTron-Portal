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
import { Cog, Link2, DollarSign, Languages, Check, AlertCircle, Database, Search, Upload, Download, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  connectionFee: string | null;
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
  const limit = 25;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedRegion]);

  const { data: regionsData } = useQuery<string[]>({
    queryKey: ["/api/az-destinations/regions"],
  });

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (selectedRegion !== "all") queryParams.set("region", selectedRegion);
  queryParams.set("limit", String(limit));
  queryParams.set("offset", String(page * limit));
  const queryString = queryParams.toString();
  
  const { data, isLoading } = useQuery<{ destinations: AzDestination[]; total: number }>({
    queryKey: [`/api/az-destinations?${queryString}`],
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

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportProgress("Reading file...");
    
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const headerParts = parseCSVRow(lines[0]).map(h => h.toLowerCase());
      
      const codeIdx = headerParts.indexOf("code");
      const destIdx = headerParts.indexOf("destination");
      
      if (codeIdx < 0 || destIdx < 0) {
        throw new Error("CSV must have 'code' and 'destination' columns");
      }
      
      const regionIdx = headerParts.indexOf("region");
      const incrementIdx = headerParts.indexOf("billingincrement");
      const feeIdx = headerParts.indexOf("connectionfee");
      
      const allDestinations = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = parseCSVRow(lines[i]);
        const code = parts[codeIdx];
        const destination = parts[destIdx];
        
        if (code && destination) {
          allDestinations.push({
            code,
            destination,
            region: regionIdx >= 0 ? parts[regionIdx] || null : null,
            billingIncrement: incrementIdx >= 0 ? parts[incrementIdx] || "60/60" : "60/60",
            connectionFee: feeIdx >= 0 ? parts[feeIdx] || "0" : "0",
          });
        }
      }
      
      if (allDestinations.length === 0) {
        throw new Error("No valid destinations found in CSV");
      }
      
      const batchSize = 1000;
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      
      for (let i = 0; i < allDestinations.length; i += batchSize) {
        const batch = allDestinations.slice(i, i + batchSize);
        setImportProgress(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allDestinations.length / batchSize)}...`);
        try {
          const response = await apiRequest("POST", "/api/az-destinations/bulk", { destinations: batch });
          const result = await response.json();
          totalInserted += result.inserted || 0;
          totalUpdated += result.updated || 0;
          totalSkipped += result.skipped || 0;
        } catch (batchError) {
          throw new Error(`Failed at batch ${Math.floor(i / batchSize) + 1}: ${(batchError as Error).message}. Processed ${totalInserted} new, ${totalUpdated} updated before failure.`);
        }
      }
      
      queryClient.invalidateQueries({ predicate: (query) => String(query.queryKey[0]).startsWith("/api/az-destinations") });
      toast({ 
        title: "Import complete", 
        description: `New: ${totalInserted.toLocaleString()}, Updated: ${totalUpdated.toLocaleString()}, Duplicates skipped: ${totalSkipped.toLocaleString()}`,
      });
    } catch (error) {
      toast({ title: "Import failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  const destinations = data?.destinations || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleEdit = (dest: AzDestination) => {
    setEditingId(dest.id);
    setEditData({
      billingIncrement: dest.billingIncrement || "60/60",
      connectionFee: dest.connectionFee || "0",
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
          <Badge variant="secondary" data-testid="badge-total">
            {total.toLocaleString()} destinations
          </Badge>
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
          <label>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
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
          <AlertDialog onOpenChange={(open) => { if (!open) setDeleteConfirmText(""); }}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={total === 0 || deleteAllMutation.isPending} data-testid="button-delete-all">
                {deleteAllMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all destinations?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span className="block">
                    This will permanently delete all {total.toLocaleString()} destinations from the A-Z database. This action cannot be undone.
                  </span>
                  <span className="block text-amber-600 dark:text-amber-400">
                    Consider exporting a backup first using the Export CSV button.
                  </span>
                  <span className="block font-medium">
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
                  Delete All
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
                      <TableHead className="w-32">Conn. Fee</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm">{dest.billingIncrement || "60/60"}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === dest.id ? (
                              <Input
                                type="number"
                                step="0.0001"
                                value={editData.connectionFee || "0"}
                                onChange={(e) => setEditData({ ...editData, connectionFee: e.target.value })}
                                className="h-8 w-24"
                                data-testid="input-edit-connection-fee"
                              />
                            ) : (
                              <span className="text-sm">${dest.connectionFee || "0"}</span>
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

              <div className="flex items-center justify-between gap-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total.toLocaleString()}
                </p>
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
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
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
