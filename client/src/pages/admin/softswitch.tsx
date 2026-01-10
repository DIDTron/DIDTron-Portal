import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Pencil, Trash2, Building2, Network, Link2, DollarSign, 
  MoreVertical, Search, Filter, RefreshCw, ChevronDown, 
  ArrowUpDown, Phone, PhoneIncoming, PhoneOutgoing, Users,
  AlertCircle, CheckCircle2, XCircle, Clock, Layers, Eye
} from "lucide-react";
import type { Carrier, CarrierInterconnect, CarrierService, RateCard } from "@shared/schema";

type CarrierType = "customer" | "supplier" | "bilateral";
type CarrierStatus = "active" | "inactive" | "suspended";

interface CarrierFormData {
  name: string;
  code: string;
  partnerType: CarrierType;
  description: string;
  status: CarrierStatus;
  billingEmail: string;
  technicalEmail: string;
  currencyCode: string;
  customerCreditType: "prepaid" | "postpaid";
  customerCreditLimit: string;
  supplierCreditType: "prepaid" | "postpaid";
  supplierCreditLimit: string;
}

const defaultCarrierForm: CarrierFormData = {
  name: "",
  code: "",
  partnerType: "bilateral",
  description: "",
  status: "active",
  billingEmail: "",
  technicalEmail: "",
  currencyCode: "USD",
  customerCreditType: "postpaid",
  customerCreditLimit: "0",
  supplierCreditType: "postpaid",
  supplierCreditLimit: "0",
};

function CarrierTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "customer":
      return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    case "supplier":
      return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    case "bilateral":
      return <Phone className="h-4 w-4 text-purple-500" />;
    default:
      return <Building2 className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>;
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function DirectionBadge({ direction }: { direction: string }) {
  switch (direction?.toLowerCase()) {
    case "ingress":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ingress</Badge>;
    case "egress":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Egress</Badge>;
    case "both":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Both</Badge>;
    default:
      return <Badge variant="outline">{direction || "N/A"}</Badge>;
  }
}

type ViewMode = "carriers" | "interconnects" | "services";

export function SoftswitchCarriersPage() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewMode>("carriers");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [form, setForm] = useState<CarrierFormData>(defaultCarrierForm);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: carriers = [], isLoading, refetch, isFetching } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const { data: allInterconnects = [], isLoading: loadingInterconnects } = useQuery<CarrierInterconnect[]>({
    queryKey: ["/api/interconnects"],
  });

  const { data: allServices = [], isLoading: loadingServices } = useQuery<CarrierService[]>({
    queryKey: ["/api/services"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CarrierFormData) => {
      const res = await apiRequest("POST", "/api/carriers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create carrier", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CarrierFormData> }) => {
      const res = await apiRequest("PATCH", `/api/carriers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update carrier", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultCarrierForm);
    setEditingCarrier(null);
    setIsAddOpen(false);
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setForm({
      name: carrier.name,
      code: carrier.code,
      partnerType: (carrier.partnerType as CarrierType) || "bilateral",
      description: carrier.description || "",
      status: (carrier.status as CarrierStatus) || "active",
      billingEmail: carrier.billingEmail || "",
      technicalEmail: carrier.technicalEmail || "",
      currencyCode: carrier.currencyCode || "USD",
      customerCreditType: (carrier.customerCreditType as "prepaid" | "postpaid") || "postpaid",
      customerCreditLimit: carrier.customerCreditLimit || "0",
      supplierCreditType: (carrier.supplierCreditType as "prepaid" | "postpaid") || "postpaid",
      supplierCreditLimit: carrier.supplierCreditLimit || "0",
    });
    setIsAddOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.code) {
      toast({ title: "Name and code are required", variant: "destructive" });
      return;
    }
    if (editingCarrier) {
      updateMutation.mutate({ id: editingCarrier.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredCarriers = carriers.filter(carrier => {
    if (filterType !== "all" && carrier.partnerType !== filterType) return false;
    if (filterStatus !== "all" && carrier.status !== filterStatus) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return carrier.name.toLowerCase().includes(search) || 
             carrier.code.toLowerCase().includes(search) ||
             (carrier.billingEmail || "").toLowerCase().includes(search);
    }
    return true;
  });

  const stats = {
    total: carriers.length,
    customers: carriers.filter(c => c.partnerType === "customer").length,
    suppliers: carriers.filter(c => c.partnerType === "supplier").length,
    bilateral: carriers.filter(c => c.partnerType === "bilateral").length,
    active: carriers.filter(c => c.status === "active").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading carriers...</div>
      </div>
    );
  }

  const viewTitles: Record<ViewMode, { title: string; description: string }> = {
    carriers: { title: "Carriers", description: "Manage wholesale carrier partners (Customers, Suppliers, Bilateral)" },
    interconnects: { title: "Interconnects", description: "All SIP trunk connections across carriers" },
    services: { title: "Services", description: "All services with rating plan assignments" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Select value={currentView} onValueChange={(v) => setCurrentView(v as ViewMode)}>
            <SelectTrigger className="w-44" data-testid="select-view-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="carriers">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Carriers
                </div>
              </SelectItem>
              <SelectItem value="interconnects">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Interconnects
                </div>
              </SelectItem>
              <SelectItem value="services">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Services
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div>
            <h1 className="text-2xl font-semibold">{viewTitles[currentView].title}</h1>
            <p className="text-muted-foreground">{viewTitles[currentView].description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-carriers"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          {currentView === "carriers" && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-carrier" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Carrier
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCarrier ? "Edit Carrier" : "Add Carrier"}</DialogTitle>
                <DialogDescription>Configure a carrier partner for voice termination</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="general" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="credit">Credit Limits</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Carrier Name *</Label>
                      <Input
                        id="name"
                        data-testid="input-carrier-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="ACME Telecom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Carrier Code *</Label>
                      <Input
                        id="code"
                        data-testid="input-carrier-code"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        placeholder="ACME01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnerType">Partner Type</Label>
                      <Select value={form.partnerType} onValueChange={(v) => setForm({ ...form, partnerType: v as CarrierType })}>
                        <SelectTrigger data-testid="select-partner-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer (Ingress)</SelectItem>
                          <SelectItem value="supplier">Supplier (Egress)</SelectItem>
                          <SelectItem value="bilateral">Bilateral (Both)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {form.partnerType === "customer" && "Sends calls TO you (ingress traffic)"}
                        {form.partnerType === "supplier" && "Receives calls FROM you (egress traffic)"}
                        {form.partnerType === "bilateral" && "Both sends and receives calls"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CarrierStatus })}>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      data-testid="input-description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Premium tier voice carrier for US/CA destinations"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="billing" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingEmail">Billing Email</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        data-testid="input-billing-email"
                        value={form.billingEmail}
                        onChange={(e) => setForm({ ...form, billingEmail: e.target.value })}
                        placeholder="billing@carrier.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technicalEmail">Technical Email</Label>
                      <Input
                        id="technicalEmail"
                        type="email"
                        data-testid="input-technical-email"
                        value={form.technicalEmail}
                        onChange={(e) => setForm({ ...form, technicalEmail: e.target.value })}
                        placeholder="noc@carrier.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currencyCode">Currency</Label>
                    <Select value={form.currencyCode} onValueChange={(v) => setForm({ ...form, currencyCode: v })}>
                      <SelectTrigger data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="credit" className="space-y-4 mt-4">
                  {(form.partnerType === "customer" || form.partnerType === "bilateral") && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <PhoneIncoming className="h-4 w-4 text-green-500" />
                          Customer Credit (Ingress)
                        </CardTitle>
                        <CardDescription className="text-xs">Credit settings when this carrier sends calls to you</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Credit Type</Label>
                            <Select value={form.customerCreditType} onValueChange={(v) => setForm({ ...form, customerCreditType: v as "prepaid" | "postpaid" })}>
                              <SelectTrigger data-testid="select-customer-credit-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prepaid">Prepaid</SelectItem>
                                <SelectItem value="postpaid">Postpaid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Credit Limit</Label>
                            <Input
                              type="number"
                              data-testid="input-customer-credit-limit"
                              value={form.customerCreditLimit}
                              onChange={(e) => setForm({ ...form, customerCreditLimit: e.target.value })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {(form.partnerType === "supplier" || form.partnerType === "bilateral") && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                          Supplier Credit (Egress)
                        </CardTitle>
                        <CardDescription className="text-xs">Credit settings when you send calls to this carrier</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Credit Type</Label>
                            <Select value={form.supplierCreditType} onValueChange={(v) => setForm({ ...form, supplierCreditType: v as "prepaid" | "postpaid" })}>
                              <SelectTrigger data-testid="select-supplier-credit-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="prepaid">Prepaid</SelectItem>
                                <SelectItem value="postpaid">Postpaid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Credit Limit</Label>
                            <Input
                              type="number"
                              data-testid="input-supplier-credit-limit"
                              value={form.supplierCreditLimit}
                              onChange={(e) => setForm({ ...form, supplierCreditLimit: e.target.value })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button
                  data-testid="button-save-carrier"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Carrier"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {currentView === "carriers" && (
        <>
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-carriers">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-customers">{stats.customers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-suppliers">{stats.suppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Bilateral</CardTitle>
            <Phone className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-bilateral">{stats.bilateral}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Carrier Partners</CardTitle>
              <CardDescription>All carriers configured in the softswitch</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search carriers..." 
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-carriers"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36" data-testid="select-filter-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="bilateral">Bilateral</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32" data-testid="select-filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCarriers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Carriers Found</h3>
              <p className="text-muted-foreground mb-4">
                {carriers.length === 0 ? "Add your first carrier partner" : "No carriers match your filters"}
              </p>
              {carriers.length === 0 && (
                <Button data-testid="button-create-first" onClick={() => setIsAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Carrier
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Interconnects</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarriers.map(carrier => (
                  <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                    <TableCell>
                      <CarrierTypeIcon type={carrier.partnerType || "bilateral"} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{carrier.name}</div>
                        <div className="text-sm text-muted-foreground">{carrier.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {carrier.partnerType || "bilateral"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-muted-foreground" />
                        <span>0</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {carrier.partnerType === "customer" || carrier.partnerType === "bilateral" ? (
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">${carrier.customerBalance || "0.00"}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-600">${carrier.supplierBalance || "0.00"}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={carrier.status || "active"} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-actions-${carrier.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/admin/carriers/${carrier.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(carrier)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
          )}
        </CardContent>
      </Card>
        </>
      )}

      {currentView === "interconnects" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>All Interconnects</CardTitle>
                <CardDescription>SIP trunk connections across all carriers</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search interconnects..." 
                    className="pl-8 w-64"
                    data-testid="input-search-interconnects"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingInterconnects ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Loading interconnects...</div>
              </div>
            ) : allInterconnects.length === 0 ? (
              <div className="text-center py-12">
                <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Interconnects Found</h3>
                <p className="text-muted-foreground mb-4">
                  Add interconnects from the Carrier Detail page
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Interconnect Name</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Tech Prefix</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInterconnects.map(ic => {
                    const carrier = carriers.find(c => c.id === ic.carrierId);
                    return (
                      <TableRow key={ic.id} data-testid={`row-interconnect-${ic.id}`}>
                        <TableCell>
                          <div className="font-medium">{carrier?.name || "Unknown"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{ic.name}</div>
                        </TableCell>
                        <TableCell>
                          <DirectionBadge direction={ic.direction || "ingress"} />
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{ic.techPrefix || "-"}</code>
                        </TableCell>
                        <TableCell>{ic.capacity || "Unlimited"}</TableCell>
                        <TableCell>
                          <StatusBadge status={ic.status || "active"} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {currentView === "services" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>All Services</CardTitle>
                <CardDescription>Rating and routing plan assignments across all interconnects</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search services..." 
                    className="pl-8 w-64"
                    data-testid="input-search-services"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingServices ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Loading services...</div>
              </div>
            ) : allServices.length === 0 ? (
              <div className="text-center py-12">
                <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Services Found</h3>
                <p className="text-muted-foreground mb-4">
                  Add services from the Interconnect Detail page
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Interconnect</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Rating Plan</TableHead>
                    <TableHead>Routing Plan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allServices.map(svc => {
                    const interconnect = allInterconnects.find(ic => ic.id === svc.interconnectId);
                    const carrier = carriers.find(c => c.id === svc.carrierId);
                    return (
                      <TableRow key={svc.id} data-testid={`row-service-${svc.id}`}>
                        <TableCell>
                          <div className="font-medium">{svc.name}</div>
                        </TableCell>
                        <TableCell>{interconnect?.name || "Unknown"}</TableCell>
                        <TableCell>{carrier?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{svc.ratingPlanId ? `Plan #${svc.ratingPlanId}` : "None"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{svc.routingPlanId ? `Plan #${svc.routingPlanId}` : "None"}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={svc.status || "active"} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
