import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  FileText
} from "lucide-react";

interface Component {
  id: string;
  name: string;
  category: string;
  status: "adopted" | "migrate" | "deprecated";
  usedIn: number;
  darkModeReady: boolean;
  accessible: boolean;
}

interface DesignToken {
  name: string;
  lightValue: string;
  darkValue: string;
  category: string;
}

interface PublishEntry {
  id: string;
  section: string;
  action: string;
  user: string;
  timestamp: string;
}

const mockComponents: Component[] = [
  { id: "1", name: "Button", category: "Primitives", status: "adopted", usedIn: 60, darkModeReady: true, accessible: true },
  { id: "2", name: "Card", category: "Primitives", status: "adopted", usedIn: 45, darkModeReady: true, accessible: true },
  { id: "3", name: "Badge", category: "Primitives", status: "adopted", usedIn: 40, darkModeReady: true, accessible: true },
  { id: "4", name: "DataTableFooter", category: "Patterns", status: "adopted", usedIn: 32, darkModeReady: true, accessible: true },
  { id: "5", name: "Table", category: "Primitives", status: "adopted", usedIn: 30, darkModeReady: true, accessible: true },
  { id: "6", name: "Dialog", category: "Primitives", status: "adopted", usedIn: 25, darkModeReady: true, accessible: true },
  { id: "7", name: "Input", category: "Forms", status: "adopted", usedIn: 50, darkModeReady: true, accessible: true },
  { id: "8", name: "Select", category: "Forms", status: "adopted", usedIn: 35, darkModeReady: true, accessible: true },
  { id: "9", name: "CustomTable", category: "Legacy", status: "migrate", usedIn: 3, darkModeReady: false, accessible: false },
  { id: "10", name: "OldModal", category: "Legacy", status: "deprecated", usedIn: 1, darkModeReady: false, accessible: true },
];

const mockTokens: DesignToken[] = [
  { name: "--primary", lightValue: "217 91% 60%", darkValue: "217 91% 60%", category: "Color" },
  { name: "--background", lightValue: "210 20% 98%", darkValue: "222 47% 5%", category: "Color" },
  { name: "--foreground", lightValue: "222 47% 11%", darkValue: "210 20% 98%", category: "Color" },
  { name: "--muted", lightValue: "210 20% 96%", darkValue: "217 33% 12%", category: "Color" },
  { name: "--card", lightValue: "0 0% 100%", darkValue: "222 47% 8%", category: "Color" },
  { name: "--radius", lightValue: "0.5rem", darkValue: "0.5rem", category: "Spacing" },
  { name: "--font-sans", lightValue: "Inter, system-ui", darkValue: "Inter, system-ui", category: "Typography" },
];

const mockPublishHistory: PublishEntry[] = [
  { id: "1", section: "Portal Themes", action: "Published Customer Portal theme", user: "admin@didtron.com", timestamp: "2 hours ago" },
  { id: "2", section: "Marketing Website", action: "Updated Homepage hero", user: "admin@didtron.com", timestamp: "1 day ago" },
  { id: "3", section: "White-Label", action: "Added Acme Corp branding", user: "admin@didtron.com", timestamp: "3 days ago" },
  { id: "4", section: "Design System", action: "Added DataTableFooter component", user: "admin@didtron.com", timestamp: "1 week ago" },
];

export default function EMDesignSystemPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredComponents = useMemo(() => {
    return mockComponents.filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || comp.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, filterStatus]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredComponents);

  const adoptedCount = mockComponents.filter(c => c.status === "adopted").length;
  const totalCount = mockComponents.length;
  const healthScore = Math.round((adoptedCount / totalCount) * 100);

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Design System</h1>
          <p className="text-sm text-muted-foreground">Component inventory, design tokens, and UI health metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-view-docs">
            <FileText className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Metrics
          </Button>
        </div>
      </div>

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
              <div className="text-3xl font-bold text-chart-2">{healthScore}%</div>
              <Progress value={healthScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Components Adopted</div>
              <div className="text-3xl font-bold">{adoptedCount}/{totalCount}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {mockComponents.filter(c => c.status === "migrate").length} need migration
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Dark Mode Coverage</div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-xs text-muted-foreground mt-1">All themes support dark mode</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Accessibility Score</div>
              <div className="text-3xl font-bold">92%</div>
              <div className="text-xs text-muted-foreground mt-1">WCAG 2.1 AA compliant</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-6">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger value="inventory" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-inventory">
              <Box className="h-4 w-4 mr-2" />
              Component Inventory
            </TabsTrigger>
            <TabsTrigger value="tokens" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-tokens">
              <Palette className="h-4 w-4 mr-2" />
              Design Tokens
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-history">
              <History className="h-4 w-4 mr-2" />
              Publish History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-components"
                />
              </div>
              <div className="flex gap-2">
                {["all", "adopted", "migrate", "deprecated"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    data-testid={`filter-${status}`}
                  >
                    {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used In</TableHead>
                    <TableHead>Dark Mode</TableHead>
                    <TableHead>Accessible</TableHead>
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
                      <TableCell>{component.usedIn} modules</TableCell>
                      <TableCell>
                        {component.darkModeReady ? (
                          <Check className="h-4 w-4 text-chart-2" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell>
                        {component.accessible ? (
                          <Check className="h-4 w-4 text-chart-2" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
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
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Design Tokens</CardTitle>
                <CardDescription>CSS custom properties used across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Light Mode</TableHead>
                      <TableHead>Dark Mode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTokens.map((token, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{token.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{token.category}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{token.lightValue}</TableCell>
                        <TableCell className="font-mono text-xs">{token.darkValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish History</CardTitle>
                <CardDescription>Recent changes published to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPublishHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-md bg-muted">
                          <History className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <p className="text-sm text-muted-foreground">{entry.section} by {entry.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{entry.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
