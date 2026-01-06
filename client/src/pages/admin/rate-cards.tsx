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

import type { RateCard as SchemaRateCard, RateCardRate } from "@shared/schema";

type RateCard = SchemaRateCard;

interface Rate {
  id: string;
  rateCardId: string;
  prefix: string;
  destination: string | null;
  rate: string;
  connectionFee: string;
  interval: number;
  minDuration: number;
}

interface ProfitRule {
  id: string;
  rateCardId: string;
  matchPrefix: string;
  profitType: "percentage" | "fixed";
  profitValue: number;
  applyTo: "all" | "setup" | "perMinute";
  status: "active" | "inactive";
}

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

  const { data: rateCards = [], isLoading, refetch } = useQuery<RateCard[]>({
    queryKey: ['/api/rate-cards', 'customer'],
    queryFn: async () => {
      const res = await fetch('/api/rate-cards?type=customer');
      if (!res.ok) throw new Error('Failed to fetch rate cards');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<RateCard>) => {
      return apiRequest('POST', '/api/rate-cards', { ...data, type: 'customer' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rate-cards'] });
      toast({ title: 'Rate card created', description: 'Rate card has been saved.' });
      setViewMode('list');
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create rate card', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RateCard> }) => {
      return apiRequest('PATCH', `/api/rate-cards/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rate-cards'] });
      toast({ title: 'Rate card updated', description: 'Rate card has been saved.' });
      setViewMode('list');
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update rate card', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/rate-cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rate-cards'] });
      toast({ title: 'Rate card deleted' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete rate card', variant: 'destructive' }),
  });

  const filteredCards = rateCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.code || '').toLowerCase().includes(searchTerm.toLowerCase());
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
      code: card.code || '',
      currency: card.currency || 'USD',
      direction: (card.direction || 'termination') as "termination" | "origination",
      parentCardId: "",
      profitMargin: card.profitMargin || "15",
      profitType: (card.profitType || "percentage") as "percentage" | "fixed",
      billingPrecision: (card.billingPrecision || 4).toString(),
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
    const cardData = {
      name: formData.name,
      code: formData.code || undefined,
      currency: formData.currency,
      direction: formData.direction,
      profitMargin: formData.profitMargin,
      profitType: formData.profitType,
      billingPrecision: parseInt(formData.billingPrecision) || 4,
    };
    
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data: cardData });
    } else {
      createMutation.mutate(cardData);
    }
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
                  <p className="text-xs text-muted-foreground">Customer rates can be derived from provider rate cards (configured in Carrier Rates tab)</p>
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
                  <TableHead className="text-right">Interval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No rates configured. Upload a CSV file to add rates.
                  </TableCell>
                </TableRow>
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
                  <TableCell className="font-mono text-sm">{card.code || '-'}</TableCell>
                  <TableCell>{card.currency}</TableCell>
                  <TableCell className="capitalize">{card.direction}</TableCell>
                  <TableCell className="text-right">{(card.ratesCount || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {card.profitType === "percentage" ? (
                      <span className="font-mono">{card.profitMargin || 0}%</span>
                    ) : (
                      <span className="font-mono">${card.profitMargin || 0}</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(card.status || 'active')}</TableCell>
                  <TableCell className="text-right">{card.revisionCount || 1}</TableCell>
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

  const { data: rateCards = [], isLoading, refetch } = useQuery<RateCard[]>({
    queryKey: ['/api/rate-cards', 'provider'],
    queryFn: async () => {
      const res = await fetch('/api/rate-cards?type=provider');
      if (!res.ok) throw new Error('Failed to fetch rate cards');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<RateCard>) => {
      return apiRequest('POST', '/api/rate-cards', { ...data, type: 'provider' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rate-cards'] });
      toast({ title: 'Rate card created', description: 'Rate card has been saved.' });
      setViewMode('list');
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create rate card', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RateCard> }) => {
      return apiRequest('PATCH', `/api/rate-cards/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rate-cards'] });
      toast({ title: 'Rate card updated', description: 'Rate card has been saved.' });
      setViewMode('list');
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update rate card', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/rate-cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rate-cards'] });
      toast({ title: 'Rate card deleted' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete rate card', variant: 'destructive' }),
  });

  const filteredCards = rateCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.code || '').toLowerCase().includes(searchTerm.toLowerCase());
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
      code: card.code || '',
      currency: card.currency || 'USD',
      direction: (card.direction || 'termination') as "termination" | "origination",
      carrierId: card.carrierId || "",
      techPrefix: card.techPrefix || "",
      billingPrecision: (card.billingPrecision || 4).toString(),
    });
    setViewMode("edit");
  };

  const handleViewRates = (card: RateCard) => {
    setEditingCard(card);
    setViewMode("rates");
  };

  const handleSave = () => {
    const cardData = {
      name: formData.name,
      code: formData.code || undefined,
      currency: formData.currency,
      direction: formData.direction,
      carrierId: formData.carrierId || undefined,
      techPrefix: formData.techPrefix || undefined,
      billingPrecision: parseInt(formData.billingPrecision) || 4,
    };
    
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data: cardData });
    } else {
      createMutation.mutate(cardData);
    }
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
            <p className="text-muted-foreground">Carrier rates - {editingCard.ratesCount || 0} prefixes</p>
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
                  <TableHead className="text-right">Interval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No rates configured. Upload a CSV file to add rates.
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
                <p className="text-2xl font-bold">{rateCards.reduce((sum, c) => sum + (c.ratesCount || 0), 0).toLocaleString()}</p>
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
                  <TableCell className="font-mono text-sm">{card.code || '-'}</TableCell>
                  <TableCell>{card.carrierId || '-'}</TableCell>
                  <TableCell>{card.currency}</TableCell>
                  <TableCell className="capitalize">{card.direction}</TableCell>
                  <TableCell className="text-right">{(card.ratesCount || 0).toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{card.techPrefix || "-"}</TableCell>
                  <TableCell>{getStatusBadge(card.status || 'active')}</TableCell>
                  <TableCell className="text-right">{card.revisionCount || 1}</TableCell>
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
