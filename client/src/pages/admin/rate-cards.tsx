import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Upload,
  Download,
  FileSpreadsheet,
  X,
  Save,
  ChevronLeft,
  Search,
  Filter,
  Copy,
  Building2,
  Users,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Eye,
  TrendingUp,
  Calculator,
  Globe
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RateCard {
  id: number;
  name: string;
  code: string;
  type: "customer" | "carrier";
  currency: string;
  direction: "termination" | "origination";
  status: "active" | "inactive" | "stale";
  ratesCount: number;
  parentCardId?: number;
  carrierId?: number;
  carrierName?: string;
  profitMargin?: number;
  profitType?: "percentage" | "fixed";
  billingPrecision: number;
  techPrefix?: string;
  createdAt: string;
  updatedAt: string;
  revisionCount: number;
}

interface Rate {
  id: number;
  rateCardId: number;
  prefix: string;
  destination: string;
  rate: number;
  connectionFee: number;
  billingIncrement: number;
  minimumDuration: number;
  status: "active" | "blocked";
}

interface ProfitRule {
  id: number;
  rateCardId: number;
  matchPrefix: string;
  profitType: "percentage" | "fixed";
  profitValue: number;
  applyTo: "all" | "setup" | "perMinute";
  status: "active" | "inactive";
}

const mockCustomerRateCards: RateCard[] = [
  {
    id: 1,
    name: "Standard US Termination",
    code: "US-TERM-STD",
    type: "customer",
    currency: "USD",
    direction: "termination",
    status: "active",
    ratesCount: 1250,
    parentCardId: 101,
    profitMargin: 15,
    profitType: "percentage",
    billingPrecision: 4,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-05",
    revisionCount: 3,
  },
  {
    id: 2,
    name: "Premium EU Routes",
    code: "EU-PREM",
    type: "customer",
    currency: "EUR",
    direction: "termination",
    status: "active",
    ratesCount: 890,
    parentCardId: 102,
    profitMargin: 0.005,
    profitType: "fixed",
    billingPrecision: 4,
    createdAt: "2025-01-02",
    updatedAt: "2025-01-04",
    revisionCount: 2,
  },
  {
    id: 3,
    name: "A-Z Economy",
    code: "AZ-ECON",
    type: "customer",
    currency: "USD",
    direction: "termination",
    status: "stale",
    ratesCount: 4500,
    parentCardId: 103,
    profitMargin: 10,
    profitType: "percentage",
    billingPrecision: 4,
    createdAt: "2024-12-15",
    updatedAt: "2024-12-20",
    revisionCount: 5,
  },
];

const mockCarrierRateCards: RateCard[] = [
  {
    id: 101,
    name: "Carrier A - US Routes",
    code: "CARR-A-US",
    type: "carrier",
    currency: "USD",
    direction: "termination",
    status: "active",
    ratesCount: 1250,
    carrierId: 1,
    carrierName: "Carrier Alpha",
    billingPrecision: 4,
    techPrefix: "101#",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-05",
    revisionCount: 4,
  },
  {
    id: 102,
    name: "Carrier B - EU Routes",
    code: "CARR-B-EU",
    type: "carrier",
    currency: "EUR",
    direction: "termination",
    status: "active",
    ratesCount: 890,
    carrierId: 2,
    carrierName: "Euro Telecom",
    billingPrecision: 4,
    techPrefix: "102#",
    createdAt: "2025-01-02",
    updatedAt: "2025-01-04",
    revisionCount: 2,
  },
  {
    id: 103,
    name: "Global Routes Provider",
    code: "GRP-AZ",
    type: "carrier",
    currency: "USD",
    direction: "termination",
    status: "active",
    ratesCount: 4500,
    carrierId: 3,
    carrierName: "Global Routes Inc",
    billingPrecision: 4,
    techPrefix: "103#",
    createdAt: "2024-12-15",
    updatedAt: "2024-12-20",
    revisionCount: 8,
  },
];

const mockRates: Rate[] = [
  { id: 1, rateCardId: 1, prefix: "1", destination: "United States", rate: 0.012, connectionFee: 0, billingIncrement: 6, minimumDuration: 0, status: "active" },
  { id: 2, rateCardId: 1, prefix: "1201", destination: "US - New Jersey", rate: 0.011, connectionFee: 0, billingIncrement: 6, minimumDuration: 0, status: "active" },
  { id: 3, rateCardId: 1, prefix: "1212", destination: "US - New York City", rate: 0.010, connectionFee: 0, billingIncrement: 6, minimumDuration: 0, status: "active" },
  { id: 4, rateCardId: 1, prefix: "1310", destination: "US - Los Angeles", rate: 0.011, connectionFee: 0, billingIncrement: 6, minimumDuration: 0, status: "active" },
  { id: 5, rateCardId: 1, prefix: "44", destination: "United Kingdom", rate: 0.025, connectionFee: 0, billingIncrement: 1, minimumDuration: 0, status: "active" },
];

type ViewMode = "list" | "edit" | "rates" | "profits";

function CustomerRatesPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    currency: "USD",
    direction: "termination" as "termination" | "origination",
    parentCardId: "",
    profitMargin: "15",
    profitType: "percentage" as "percentage" | "fixed",
    billingPrecision: "4",
    profitAssurance: true,
  });

  const rateCards = mockCustomerRateCards;

  const filteredCards = rateCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    setEditingCard(null);
    setFormData({
      name: "",
      code: "",
      currency: "USD",
      direction: "termination",
      parentCardId: "",
      profitMargin: "15",
      profitType: "percentage",
      billingPrecision: "4",
      profitAssurance: true,
    });
    setViewMode("edit");
  };

  const handleEdit = (card: RateCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      code: card.code,
      currency: card.currency,
      direction: card.direction,
      parentCardId: card.parentCardId?.toString() || "",
      profitMargin: card.profitMargin?.toString() || "15",
      profitType: card.profitType || "percentage",
      billingPrecision: card.billingPrecision.toString(),
      profitAssurance: true,
    });
    setViewMode("edit");
  };

  const handleViewRates = (card: RateCard) => {
    setEditingCard(card);
    setViewMode("rates");
  };

  const handleViewProfits = (card: RateCard) => {
    setEditingCard(card);
    setViewMode("profits");
  };

  const handleSave = () => {
    toast({
      title: editingCard ? "Rate card updated" : "Rate card created",
      description: `${formData.name} has been saved successfully.`,
    });
    setViewMode("list");
  };

  const handleBuildAll = () => {
    toast({
      title: "Building rate cards",
      description: "Syncing stale rate cards with parent provider cards...",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "stale":
        return <Badge variant="secondary" className="bg-orange-500 text-white"><AlertTriangle className="h-3 w-3 mr-1" />Stale</Badge>;
      case "inactive":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (viewMode === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-back-list"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{editingCard ? "Edit Customer Rate Card" : "Create Customer Rate Card"}</h1>
            <p className="text-muted-foreground">Configure pricing for your customers</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Rate Card Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Standard US Termination"
                      data-testid="input-ratecard-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., US-TERM-STD"
                      data-testid="input-ratecard-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger data-testid="select-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select
                      value={formData.direction}
                      onValueChange={(value) => setFormData({ ...formData, direction: value as "termination" | "origination" })}
                    >
                      <SelectTrigger data-testid="select-direction">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="termination">Termination (Outbound)</SelectItem>
                        <SelectItem value="origination">Origination (Inbound DID)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentCard">Parent Carrier Rate Card</Label>
                  <Select
                    value={formData.parentCardId}
                    onValueChange={(value) => setFormData({ ...formData, parentCardId: value })}
                  >
                    <SelectTrigger data-testid="select-parent-card">
                      <SelectValue placeholder="Select carrier rate card to derive from" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCarrierRateCards.map((card) => (
                        <SelectItem key={card.id} value={card.id.toString()}>
                          {card.name} ({card.ratesCount} rates)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Customer rates will be derived from the selected carrier rate card</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="profitType">Profit Type</Label>
                    <Select
                      value={formData.profitType}
                      onValueChange={(value) => setFormData({ ...formData, profitType: value as "percentage" | "fixed" })}
                    >
                      <SelectTrigger data-testid="select-profit-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Profit Margin</Label>
                    <div className="relative">
                      <Input
                        id="profitMargin"
                        type="number"
                        step="0.01"
                        value={formData.profitMargin}
                        onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                        data-testid="input-profit-margin"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {formData.profitType === "percentage" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingPrecision">Billing Precision</Label>
                    <Select
                      value={formData.billingPrecision}
                      onValueChange={(value) => setFormData({ ...formData, billingPrecision: value })}
                    >
                      <SelectTrigger data-testid="select-precision">
                        <SelectValue placeholder="Select precision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 decimals</SelectItem>
                        <SelectItem value="3">3 decimals</SelectItem>
                        <SelectItem value="4">4 decimals</SelectItem>
                        <SelectItem value="5">5 decimals</SelectItem>
                        <SelectItem value="6">6 decimals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="profitAssurance" className="font-medium">Profit Assurance</Label>
                    <p className="text-sm text-muted-foreground">Automatically block calls that would result in a loss</p>
                  </div>
                  <Switch
                    id="profitAssurance"
                    checked={formData.profitAssurance}
                    onCheckedChange={(checked) => setFormData({ ...formData, profitAssurance: checked })}
                    data-testid="switch-profit-assurance"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced billing settings including MCD, pulse rounding, and LCR strategy</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setViewMode("list")} data-testid="button-cancel">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            Save Rate Card
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === "rates" && editingCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-back-list"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{editingCard.name}</h1>
            <p className="text-muted-foreground">Rate details - {editingCard.ratesCount} prefixes</p>
          </div>
          <Button variant="outline" data-testid="button-download-rates">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by prefix or destination..."
                  className="pl-10"
                  data-testid="input-search-rates"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Connection Fee</TableHead>
                  <TableHead className="text-right">Increment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRates.map((rate) => (
                  <TableRow key={rate.id} data-testid={`row-rate-${rate.id}`}>
                    <TableCell className="font-mono font-medium">{rate.prefix}</TableCell>
                    <TableCell>{rate.destination}</TableCell>
                    <TableCell className="text-right font-mono">${rate.rate.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-mono">${rate.connectionFee.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{rate.billingIncrement}s</TableCell>
                    <TableCell>
                      {rate.status === "active" ? (
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === "profits" && editingCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-back-list"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{editingCard.name}</h1>
            <p className="text-muted-foreground">Profit rules and margin configuration</p>
          </div>
          <Button data-testid="button-add-rule">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profit Rules</CardTitle>
            <CardDescription>Configure prefix-based profit margins. More specific prefixes take priority.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match Prefix</TableHead>
                  <TableHead>Profit Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Apply To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">^1</TableCell>
                  <TableCell>Percentage</TableCell>
                  <TableCell className="text-right">15%</TableCell>
                  <TableCell>All</TableCell>
                  <TableCell><Badge variant="default" className="bg-green-600">Active</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">^44</TableCell>
                  <TableCell>Fixed</TableCell>
                  <TableCell className="text-right">$0.005</TableCell>
                  <TableCell>Per Minute</TableCell>
                  <TableCell><Badge variant="default" className="bg-green-600">Active</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">^</TableCell>
                  <TableCell>Percentage</TableCell>
                  <TableCell className="text-right">10%</TableCell>
                  <TableCell>All</TableCell>
                  <TableCell><Badge variant="default" className="bg-green-600">Active</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Rate Cards</h1>
          <p className="text-muted-foreground">Manage pricing for your customers with profit margins</p>
        </div>
        <div className="flex items-center gap-3">
          {filteredCards.some(c => c.status === "stale") && (
            <Button variant="outline" onClick={handleBuildAll} data-testid="button-build-all">
              <RefreshCw className="h-4 w-4 mr-2" />
              Build Stale Cards
            </Button>
          )}
          <Button onClick={handleCreateNew} data-testid="button-create-customer-ratecard">
            <Plus className="h-4 w-4 mr-2" />
            New Rate Card
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rate cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-ratecards"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="stale">Stale</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="text-right">Rates</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Revisions</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.map((card) => (
                <TableRow key={card.id} data-testid={`row-customer-ratecard-${card.id}`}>
                  <TableCell className="font-medium">{card.name}</TableCell>
                  <TableCell className="font-mono text-sm">{card.code}</TableCell>
                  <TableCell>{card.currency}</TableCell>
                  <TableCell className="capitalize">{card.direction}</TableCell>
                  <TableCell className="text-right">{card.ratesCount.toLocaleString()}</TableCell>
                  <TableCell>
                    {card.profitType === "percentage" ? (
                      <span className="font-mono">{card.profitMargin}%</span>
                    ) : (
                      <span className="font-mono">${card.profitMargin}</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(card.status)}</TableCell>
                  <TableCell className="text-right">{card.revisionCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-actions-${card.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(card)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewRates(card)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Rates
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewProfits(card)}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Profit Rules
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CarrierRatesPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    currency: "USD",
    direction: "termination" as "termination" | "origination",
    carrierId: "",
    techPrefix: "",
    billingPrecision: "4",
  });

  const rateCards = mockCarrierRateCards;

  const filteredCards = rateCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.carrierName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    setEditingCard(null);
    setFormData({
      name: "",
      code: "",
      currency: "USD",
      direction: "termination",
      carrierId: "",
      techPrefix: "",
      billingPrecision: "4",
    });
    setViewMode("edit");
  };

  const handleEdit = (card: RateCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      code: card.code,
      currency: card.currency,
      direction: card.direction,
      carrierId: card.carrierId?.toString() || "",
      techPrefix: card.techPrefix || "",
      billingPrecision: card.billingPrecision.toString(),
    });
    setViewMode("edit");
  };

  const handleViewRates = (card: RateCard) => {
    setEditingCard(card);
    setViewMode("rates");
  };

  const handleSave = () => {
    toast({
      title: editingCard ? "Rate card updated" : "Rate card created",
      description: `${formData.name} has been saved successfully.`,
    });
    setViewMode("list");
  };

  const handleUpload = () => {
    setShowUploadDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "inactive":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (viewMode === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-back-list"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{editingCard ? "Edit Carrier Rate Card" : "Create Carrier Rate Card"}</h1>
            <p className="text-muted-foreground">Configure carrier cost rates</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="upload">Upload Rates</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Rate Card Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Carrier A - US Routes"
                      data-testid="input-carrier-ratecard-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., CARR-A-US"
                      data-testid="input-carrier-ratecard-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="carrier">Carrier</Label>
                    <Select
                      value={formData.carrierId}
                      onValueChange={(value) => setFormData({ ...formData, carrierId: value })}
                    >
                      <SelectTrigger data-testid="select-carrier">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Carrier Alpha</SelectItem>
                        <SelectItem value="2">Euro Telecom</SelectItem>
                        <SelectItem value="3">Global Routes Inc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="techPrefix">Tech Prefix</Label>
                    <Input
                      id="techPrefix"
                      value={formData.techPrefix}
                      onChange={(e) => setFormData({ ...formData, techPrefix: e.target.value })}
                      placeholder="e.g., 101#"
                      data-testid="input-tech-prefix"
                    />
                    <p className="text-xs text-muted-foreground">Unique routing identifier for this carrier</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger data-testid="select-carrier-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select
                      value={formData.direction}
                      onValueChange={(value) => setFormData({ ...formData, direction: value as "termination" | "origination" })}
                    >
                      <SelectTrigger data-testid="select-carrier-direction">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="termination">Termination (Outbound)</SelectItem>
                        <SelectItem value="origination">Origination (Inbound DID)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingPrecision">Billing Precision</Label>
                    <Select
                      value={formData.billingPrecision}
                      onValueChange={(value) => setFormData({ ...formData, billingPrecision: value })}
                    >
                      <SelectTrigger data-testid="select-carrier-precision">
                        <SelectValue placeholder="Select precision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 decimals</SelectItem>
                        <SelectItem value="3">3 decimals</SelectItem>
                        <SelectItem value="4">4 decimals</SelectItem>
                        <SelectItem value="5">5 decimals</SelectItem>
                        <SelectItem value="6">6 decimals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Upload Rate Sheet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a CSV file with carrier rates. Required columns: Prefix, Rate, Connection Fee, Billing Increment
                  </p>
                  <Button variant="outline" data-testid="button-upload-csv">
                    <Upload className="h-4 w-4 mr-2" />
                    Select CSV File
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">CSV Format Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Column headers: Prefix, Destination (optional), Rate, Connection Fee, Billing Increment</li>
                    <li>No empty rows or duplicate prefixes</li>
                    <li>Rates in decimal format (e.g., 0.0125 for $0.0125/min)</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced settings including LRN database, revision management, and activation scheduling</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setViewMode("list")} data-testid="button-cancel">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            Save Rate Card
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === "rates" && editingCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            data-testid="button-back-list"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{editingCard.name}</h1>
            <p className="text-muted-foreground">Carrier rates - {editingCard.ratesCount} prefixes from {editingCard.carrierName}</p>
          </div>
          <Button variant="outline" onClick={handleUpload} data-testid="button-upload-rates">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Revision
          </Button>
          <Button variant="outline" data-testid="button-download-carrier-rates">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by prefix or destination..."
                  className="pl-10"
                  data-testid="input-search-carrier-rates"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Cost Rate</TableHead>
                  <TableHead className="text-right">Connection Fee</TableHead>
                  <TableHead className="text-right">Increment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRates.map((rate) => (
                  <TableRow key={rate.id} data-testid={`row-carrier-rate-${rate.id}`}>
                    <TableCell className="font-mono font-medium">{rate.prefix}</TableCell>
                    <TableCell>{rate.destination}</TableCell>
                    <TableCell className="text-right font-mono">${(rate.rate * 0.85).toFixed(4)}</TableCell>
                    <TableCell className="text-right font-mono">${rate.connectionFee.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{rate.billingIncrement}s</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carrier Rate Cards</h1>
          <p className="text-muted-foreground">Manage cost rates from your carriers (providers)</p>
        </div>
        <Button onClick={handleCreateNew} data-testid="button-create-carrier-ratecard">
          <Plus className="h-4 w-4 mr-2" />
          New Rate Card
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rateCards.length}</p>
                <p className="text-sm text-muted-foreground">Total Rate Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Globe className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rateCards.reduce((sum, c) => sum + c.ratesCount, 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Prefixes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rateCards.filter(c => c.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rate cards or carriers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-carrier-ratecards"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-carrier-status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="text-right">Rates</TableHead>
                <TableHead>Tech Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Revisions</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.map((card) => (
                <TableRow key={card.id} data-testid={`row-carrier-ratecard-${card.id}`}>
                  <TableCell className="font-medium">{card.name}</TableCell>
                  <TableCell className="font-mono text-sm">{card.code}</TableCell>
                  <TableCell>{card.carrierName}</TableCell>
                  <TableCell>{card.currency}</TableCell>
                  <TableCell className="capitalize">{card.direction}</TableCell>
                  <TableCell className="text-right">{card.ratesCount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{card.techPrefix || "-"}</TableCell>
                  <TableCell>{getStatusBadge(card.status)}</TableCell>
                  <TableCell className="text-right">{card.revisionCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-carrier-actions-${card.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(card)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewRates(card)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Rates
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Revision
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export { CustomerRatesPage, CarrierRatesPage };
