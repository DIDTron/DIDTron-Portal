import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Network, FileSpreadsheet, TrendingDown, Calculator, Upload,
  Download, Plus, Search, RefreshCw, AlertCircle, CheckCircle,
  DollarSign, ArrowUpDown, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface RateCard {
  id: number;
  name: string;
  type: "provider" | "customer";
  prefixCount: number;
  lastUpdated: string;
  status: "active" | "inactive";
}

interface LcrRule {
  id: number;
  name: string;
  priority: number;
  prefixPattern: string;
  routes: string[];
  status: "active" | "inactive";
}

interface MarginData {
  prefix: string;
  destination: string;
  buyRate: number;
  sellRate: number;
  margin: number;
  marginPercent: number;
  volume: number;
}

export default function Class4Page() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeRateCards: number;
    activeLcrRules: number;
    totalPrefixes: number;
    avgMargin: string;
  }>({
    queryKey: ["/api/my/class4/stats"],
  });

  const { data: rateCards, isLoading: rateCardsLoading } = useQuery<RateCard[]>({
    queryKey: ["/api/my/class4/rate-cards"],
  });

  const { data: lcrRules, isLoading: lcrLoading } = useQuery<LcrRule[]>({
    queryKey: ["/api/my/class4/lcr-rules"],
  });

  const { data: margins, isLoading: marginsLoading } = useQuery<MarginData[]>({
    queryKey: ["/api/my/class4/margins"],
  });

  const statCards = [
    { label: "Rate Cards", value: stats?.activeRateCards || 0, icon: FileSpreadsheet, color: "text-primary" },
    { label: "LCR Rules", value: stats?.activeLcrRules || 0, icon: TrendingDown, color: "text-emerald-600" },
    { label: "Total Prefixes", value: stats?.totalPrefixes || 0, icon: Network, color: "text-amber-600" },
    { label: "Avg Margin", value: stats?.avgMargin || "0%", icon: Calculator, color: "text-purple-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Class 4 Softswitch</h1>
          <p className="text-muted-foreground">Manage rate cards, LCR routing, and margin analysis</p>
        </div>
        <Badge variant="outline" className="text-sm">
          $0.0005/min + $25 setup
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-md bg-primary/10">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold" data-testid={`text-${stat.label.toLowerCase().replace(" ", "-")}`}>
                      {stat.value}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Network className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rate-cards" data-testid="tab-rate-cards">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Rate Cards
          </TabsTrigger>
          <TabsTrigger value="lcr" data-testid="tab-lcr">
            <TrendingDown className="h-4 w-4 mr-2" />
            LCR Rules
          </TabsTrigger>
          <TabsTrigger value="margins" data-testid="tab-margins">
            <Calculator className="h-4 w-4 mr-2" />
            Margin Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-upload-rates">
                  <Upload className="h-4 w-4" />
                  Upload Rate Card (CSV)
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-create-lcr">
                  <Plus className="h-4 w-4" />
                  Create LCR Rule
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-export-margins">
                  <Download className="h-4 w-4" />
                  Export Margin Report
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-sync-connexcs">
                  <RefreshCw className="h-4 w-4" />
                  Sync with ConnexCS
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ConnexCS Connection</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Sync</span>
                  <span className="text-sm text-muted-foreground">2 minutes ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Sessions</span>
                  <span className="text-sm font-medium">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Calls/Minute</span>
                  <span className="text-sm font-medium">42</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Rate card updated", detail: "US_Tier1_Rates.csv", time: "5 min ago" },
                  { action: "LCR rule activated", detail: "Premium Routes", time: "1 hour ago" },
                  { action: "Margin threshold alert", detail: "UK Mobile below 5%", time: "3 hours ago" },
                  { action: "ConnexCS sync completed", detail: "245 prefixes updated", time: "6 hours ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-cards" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Rate Cards</CardTitle>
                  <CardDescription>Manage provider and customer rate cards</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" data-testid="button-import-ratecard">
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button size="sm" data-testid="button-new-ratecard">
                    <Plus className="h-4 w-4 mr-2" />
                    New Rate Card
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rateCardsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : rateCards && rateCards.length > 0 ? (
                <div className="space-y-3">
                  {rateCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{card.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {card.prefixCount} prefixes | Updated {card.lastUpdated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={card.type === "provider" ? "secondary" : "outline"}>
                          {card.type}
                        </Badge>
                        <Badge variant={card.status === "active" ? "default" : "secondary"}>
                          {card.status}
                        </Badge>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Rate Cards</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file or create a new rate card to get started
                  </p>
                  <Button data-testid="button-create-first-ratecard">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rate Card
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lcr" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>LCR Rules</CardTitle>
                  <CardDescription>Least Cost Routing configuration</CardDescription>
                </div>
                <Button size="sm" data-testid="button-new-lcr-rule">
                  <Plus className="h-4 w-4 mr-2" />
                  New LCR Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lcrLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : lcrRules && lcrRules.length > 0 ? (
                <div className="space-y-3">
                  {lcrRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {rule.priority}
                        </div>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Pattern: {rule.prefixPattern} | Routes: {rule.routes.length}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={rule.status === "active" ? "default" : "secondary"}>
                          {rule.status}
                        </Badge>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No LCR Rules</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create LCR rules to optimize your routing costs
                  </p>
                  <Button data-testid="button-create-first-lcr">
                    <Plus className="h-4 w-4 mr-2" />
                    Create LCR Rule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margins" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Margin Analysis</CardTitle>
                  <CardDescription>Compare buy vs sell rates and analyze profitability</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search destination..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-margins"
                    />
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-export-margin-report">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {marginsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : margins && margins.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Prefix</th>
                        <th className="text-left p-3 text-sm font-medium">Destination</th>
                        <th className="text-right p-3 text-sm font-medium">Buy Rate</th>
                        <th className="text-right p-3 text-sm font-medium">Sell Rate</th>
                        <th className="text-right p-3 text-sm font-medium">Margin</th>
                        <th className="text-right p-3 text-sm font-medium">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {margins.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3 text-sm font-mono">{row.prefix}</td>
                          <td className="p-3 text-sm">{row.destination}</td>
                          <td className="p-3 text-sm text-right">${row.buyRate.toFixed(4)}</td>
                          <td className="p-3 text-sm text-right">${row.sellRate.toFixed(4)}</td>
                          <td className="p-3 text-right">
                            <Badge variant={row.marginPercent >= 10 ? "default" : row.marginPercent >= 5 ? "secondary" : "destructive"}>
                              {row.marginPercent.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-right text-muted-foreground">{row.volume.toLocaleString()} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Margin Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload rate cards to see margin analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
