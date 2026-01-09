import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { 
  Search,
  Check,
  X,
  AlertTriangle,
  Palette,
  Type,
  Box,
  Layout,
  History,
  ExternalLink,
  RefreshCw,
  FileText,
  Loader2,
  Play
} from "lucide-react";

interface Component {
  id: string;
  name: string;
  category: string;
  status: "adopted" | "migrate" | "deprecated";
  usedIn: number;
  darkModeReady: boolean;
  accessible: boolean;
  files?: string[];
}

interface DesignToken {
  name: string;
  lightValue: string;
  darkValue: string;
  category: string;
}

interface ScanResults {
  components: Component[];
  tokens: DesignToken[];
  healthScore: number;
  adoptedCount: number;
  totalCount: number;
  migrateCount: number;
  deprecatedCount: number;
  scannedAt: string | null;
  filesScanned: number;
  totalUsages: number;
  needsScan?: boolean;
}

interface PublishEntry {
  id: string;
  section: string;
  action: string;
  user: string;
  timestamp: string;
}

const mockPublishHistory: PublishEntry[] = [
  { id: "1", section: "Portal Themes", action: "Published Customer Portal theme", user: "admin@didtron.com", timestamp: "2 hours ago" },
  { id: "2", section: "Marketing Website", action: "Updated Homepage hero", user: "admin@didtron.com", timestamp: "1 day ago" },
  { id: "3", section: "White-Label", action: "Added Acme Corp branding", user: "admin@didtron.com", timestamp: "3 days ago" },
  { id: "4", section: "Design System", action: "Added DataTableFooter component", user: "admin@didtron.com", timestamp: "1 week ago" },
];

export default function EMDesignSystemPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: scanResults, isLoading } = useQuery<ScanResults>({
    queryKey: ["/api/em/scan-results"],
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/em/scan");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/em/scan-results"] });
      toast({
        title: "Scan Complete",
        description: "Codebase scan finished successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan codebase",
        variant: "destructive",
      });
    },
  });

  const components = scanResults?.components || [];
  const tokens = scanResults?.tokens || [];
  const healthScore = scanResults?.healthScore || 0;
  const adoptedCount = scanResults?.adoptedCount || 0;
  const totalCount = scanResults?.totalCount || 0;
  const migrateCount = scanResults?.migrateCount || 0;
  const deprecatedCount = scanResults?.deprecatedCount || 0;
  const filesScanned = scanResults?.filesScanned || 0;
  const totalUsages = scanResults?.totalUsages || 0;
  const scannedAt = scanResults?.scannedAt;
  const needsScan = scanResults?.needsScan;

  const filteredComponents = useMemo(() => {
    return components.filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || comp.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [components, searchQuery, filterStatus]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredComponents);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "adopted":
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Adopted</Badge>;
      case "migrate":
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Migrate</Badge>;
      case "deprecated":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Deprecated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatScannedAt = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Design System</h1>
          <p className="text-sm text-muted-foreground">Component inventory, design tokens, and UI health metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-view-docs" onClick={() => navigate("/admin/documentation")}>
            <FileText className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
          <Button 
            onClick={() => scanMutation.mutate()} 
            disabled={scanMutation.isPending}
            data-testid="button-scan"
          >
            {scanMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {scanMutation.isPending ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
      </div>

      {needsScan && !isLoading && (
        <div className="p-4 bg-muted/50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>No scan data available. Run a scan to see real component usage metrics.</span>
            </div>
            <Button onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending}>
              {scanMutation.isPending ? "Scanning..." : "Scan Now"}
            </Button>
          </div>
        </div>
      )}

      <div className="p-6 border-b bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">UI Health Score</span>
                <Badge variant={healthScore >= 90 ? "default" : healthScore >= 70 ? "secondary" : "destructive"}>
                  {healthScore >= 90 ? "Healthy" : healthScore >= 70 ? "Fair" : "Needs Work"}
                </Badge>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-chart-2">{healthScore}%</div>
              )}
              <Progress value={healthScore} className="mt-2" aria-label="UI health score progress" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Components Adopted</div>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{adoptedCount}/{totalCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {migrateCount} need migration, {deprecatedCount} deprecated
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Files Scanned</div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{filesScanned}</div>
                  <div className="text-xs text-muted-foreground mt-1">{totalUsages} total usages</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Design Tokens</div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{tokens.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last scan: {formatScannedAt(scannedAt || null)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-6 pt-4">
          <TabsList>
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <Box className="h-4 w-4 mr-2" />
              Component Inventory
            </TabsTrigger>
            <TabsTrigger value="tokens" data-testid="tab-tokens">
              <Palette className="h-4 w-4 mr-2" />
              Design Tokens
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="h-4 w-4 mr-2" />
              Publish History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="flex-1 p-6 overflow-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search components"
                data-testid="input-search-components"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={filterStatus === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("all")}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button 
                variant={filterStatus === "adopted" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("adopted")}
                data-testid="filter-adopted"
              >
                Adopted
              </Button>
              <Button 
                variant={filterStatus === "migrate" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("migrate")}
                data-testid="filter-migrate"
              >
                Migrate
              </Button>
              <Button 
                variant={filterStatus === "deprecated" ? "default" : "outline"} 
                size="sm"
                onClick={() => setFilterStatus("deprecated")}
                data-testid="filter-deprecated"
              >
                Deprecated
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Files Using</TableHead>
                    <TableHead className="text-center">Dark Mode</TableHead>
                    <TableHead className="text-center">Accessible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((component) => (
                    <TableRow key={component.id} data-testid={`row-component-${component.id}`}>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{component.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(component.status)}</TableCell>
                      <TableCell className="text-right">{component.usedIn}</TableCell>
                      <TableCell className="text-center">
                        {component.darkModeReady ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {component.accessible ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {needsScan ? "Run a scan to see component usage" : "No components found matching your search"}
                      </TableCell>
                    </TableRow>
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
            </>
          )}
        </TabsContent>

        <TabsContent value="tokens" className="flex-1 p-6 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Tokens from index.css
              </CardTitle>
              <CardDescription>CSS custom properties defining the design system</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Light Value</TableHead>
                      <TableHead>Dark Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.slice(0, 20).map((token, index) => (
                      <TableRow key={index} data-testid={`row-token-${index}`}>
                        <TableCell className="font-mono text-sm">{token.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{token.category}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{token.lightValue}</TableCell>
                        <TableCell className="font-mono text-sm">{token.darkValue}</TableCell>
                      </TableRow>
                    ))}
                    {tokens.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Run a scan to extract design tokens from index.css
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="flex-1 p-6 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Publish History
              </CardTitle>
              <CardDescription>Track changes across all Experience Manager sections</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPublishHistory.map((entry) => (
                    <TableRow key={entry.id} data-testid={`row-history-${entry.id}`}>
                      <TableCell>
                        <Badge variant="outline">{entry.section}</Badge>
                      </TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.user}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
