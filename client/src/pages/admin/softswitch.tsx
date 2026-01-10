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

export function SoftswitchCarriersPage() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [form, setForm] = useState<CarrierFormData>(defaultCarrierForm);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: carriers = [], isLoading, refetch, isFetching } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Carriers</h1>
          <p className="text-muted-foreground">Manage wholesale carrier partners (Customers, Suppliers, Bilateral)</p>
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
        </div>
      </div>

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
    </div>
  );
}

export function SoftswitchInterconnectsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDirection, setFilterDirection] = useState<string>("all");

  const { data: carriers = [], isLoading: carriersLoading } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const { data: interconnects = [], isLoading, refetch, isFetching } = useQuery<CarrierInterconnect[]>({
    queryKey: ["/api/carrier-interconnects"],
  });

  const filteredInterconnects = interconnects.filter(ic => {
    if (filterDirection !== "all" && ic.direction !== filterDirection) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return ic.name.toLowerCase().includes(search) || 
             (ic.ipAddress || "").toLowerCase().includes(search) ||
             (ic.techPrefix || "").toLowerCase().includes(search);
    }
    return true;
  });

  const getCarrierName = (carrierId: string) => {
    return carriers.find(c => c.id === carrierId)?.name || "Unknown";
  };

  if (isLoading || carriersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading interconnects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Interconnects</h1>
          <p className="text-muted-foreground">View all SIP trunks across all carriers</p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-interconnects"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Interconnects</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-interconnects">{interconnects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Ingress</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interconnects.filter(i => i.direction === "ingress").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Egress</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interconnects.filter(i => i.direction === "egress").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interconnects.filter(i => i.isActive).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>All Interconnects</CardTitle>
              <CardDescription>SIP trunks configured across all carrier partners</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search interconnects..." 
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-interconnects"
                />
              </div>
              <Select value={filterDirection} onValueChange={setFilterDirection}>
                <SelectTrigger className="w-36" data-testid="select-filter-direction">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="ingress">Ingress</SelectItem>
                  <SelectItem value="egress">Egress</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInterconnects.length === 0 ? (
            <div className="text-center py-12">
              <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Interconnects Found</h3>
              <p className="text-muted-foreground">
                {interconnects.length === 0 ? "Create interconnects from the Carrier detail page" : "No interconnects match your filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Interconnect</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Tech Prefix</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterconnects.map(ic => (
                  <TableRow key={ic.id} data-testid={`row-interconnect-${ic.id}`}>
                    <TableCell>
                      <div className="font-medium">{ic.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{getCarrierName(ic.carrierId)}</span>
                    </TableCell>
                    <TableCell>
                      <DirectionBadge direction={ic.direction || "both"} />
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">{ic.ipAddress || "N/A"}</code>
                    </TableCell>
                    <TableCell>
                      {ic.techPrefix ? (
                        <code className="px-2 py-1 bg-muted rounded text-sm">#{ic.techPrefix}</code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ic.capacityMode === "unrestricted" ? (
                        <span className="text-muted-foreground">Unlimited</span>
                      ) : (
                        <span>{ic.capacityLimit} ch</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ic.isActive ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SoftswitchServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDirection, setFilterDirection] = useState<string>("all");

  const { data: services = [], isLoading, refetch, isFetching } = useQuery<CarrierService[]>({
    queryKey: ["/api/carrier-services"],
  });

  const { data: carriers = [] } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const { data: interconnects = [] } = useQuery<CarrierInterconnect[]>({
    queryKey: ["/api/carrier-interconnects"],
  });

  const { data: rateCards = [] } = useQuery<RateCard[]>({
    queryKey: ["/api/rate-cards"],
  });

  const filteredServices = services.filter(svc => {
    if (filterDirection !== "all" && svc.direction !== filterDirection) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return svc.name.toLowerCase().includes(search) || 
             (svc.techPrefix || "").toLowerCase().includes(search);
    }
    return true;
  });

  const getCarrierName = (carrierId: string) => {
    return carriers.find(c => c.id === carrierId)?.name || "Unknown";
  };

  const getInterconnectName = (interconnectId: string) => {
    return interconnects.find(ic => ic.id === interconnectId)?.name || "Unknown";
  };

  const getRateCardName = (rateCardId: string | null) => {
    if (!rateCardId) return "—";
    return rateCards.find(rc => rc.id === rateCardId)?.name || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-muted-foreground">Rate plan assignments linking interconnects to rating and routing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-services"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Service Assignments</CardTitle>
              <CardDescription>
                Services define the link between Interconnects and their Rating Plans + Routing Plans.
                This is THE KEY LINKAGE in the Digitalk hierarchy.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-9 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-services"
                />
              </div>
              <Select value={filterDirection} onValueChange={setFilterDirection}>
                <SelectTrigger className="w-[140px]" data-testid="select-filter-direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="ingress">Ingress</SelectItem>
                  <SelectItem value="egress">Egress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                Configure services from within each Carrier's detail page under the Services tab.
                Services link an Interconnect to its Customer Rating Plan and Routing Plan.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Interconnect</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Rating Plan</TableHead>
                  <TableHead>Routing Plan</TableHead>
                  <TableHead>Tech Prefix</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map(svc => (
                  <TableRow key={svc.id} data-testid={`row-service-${svc.id}`}>
                    <TableCell>
                      {svc.direction === "ingress" ? (
                        <PhoneIncoming className="h-4 w-4 text-green-500" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{svc.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{getCarrierName(svc.carrierId)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getInterconnectName(svc.interconnectId)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={svc.direction === "ingress" ? "default" : "secondary"} className="capitalize">
                        {svc.direction || "ingress"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getRateCardName(svc.ratingPlanId)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{svc.routingPlanId || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-1 py-0.5 rounded">{svc.techPrefix || "—"}</code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={svc.status || "active"} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-actions-${svc.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/admin/carriers/${svc.carrierId}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Carrier
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
    </div>
  );
}

export function SoftswitchBalancePage() {
  const { data: carriers = [], isLoading, refetch, isFetching } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const totalCustomerBalance = carriers.reduce((sum, c) => sum + parseFloat(c.customerBalance || "0"), 0);
  const totalSupplierBalance = carriers.reduce((sum, c) => sum + parseFloat(c.supplierBalance || "0"), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading balances...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Balance & Spend</h1>
          <p className="text-muted-foreground">Monitor carrier balances and spending limits</p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-balances"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Customer Balance</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-customer-balance">
              ${totalCustomerBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Owed to you by customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplier Balance</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-supplier-balance">
              ${totalSupplierBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Owed by you to suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totalCustomerBalance - totalSupplierBalance) >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${(totalCustomerBalance - totalSupplierBalance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Customer - Supplier balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrier Balances</CardTitle>
          <CardDescription>Current balance and credit status for all carriers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carrier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer Balance</TableHead>
                <TableHead>Customer Credit Limit</TableHead>
                <TableHead>Supplier Balance</TableHead>
                <TableHead>Supplier Credit Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carriers.map(carrier => (
                <TableRow key={carrier.id}>
                  <TableCell>
                    <div className="font-medium">{carrier.name}</div>
                    <div className="text-sm text-muted-foreground">{carrier.code}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{carrier.partnerType || "bilateral"}</Badge>
                  </TableCell>
                  <TableCell>
                    {carrier.partnerType !== "supplier" ? (
                      <span className="text-green-600">${carrier.customerBalance || "0.00"}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {carrier.partnerType !== "supplier" ? (
                      <span>${carrier.customerCreditLimit || "0.00"}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {carrier.partnerType !== "customer" ? (
                      <span className="text-blue-600">${carrier.supplierBalance || "0.00"}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {carrier.partnerType !== "customer" ? (
                      <span>${carrier.supplierCreditLimit || "0.00"}</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
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

export function SoftswitchTrunkGroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Trunk Groups</h1>
          <p className="text-muted-foreground">Logical grouping of interconnects for load balancing and failover</p>
        </div>
        <Button data-testid="button-add-trunk-group">
          <Plus className="w-4 h-4 mr-2" />
          Add Trunk Group
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trunk Groups</CardTitle>
          <CardDescription>
            Group multiple interconnects together for redundancy and load distribution.
            Traffic can be distributed using round-robin, weighted, or priority-based routing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Trunk Groups</h3>
            <p className="text-muted-foreground mb-4">
              Create trunk groups to combine multiple interconnects for load balancing and failover
            </p>
            <Button data-testid="button-create-first-trunk-group">
              <Plus className="w-4 h-4 mr-2" />
              Create Trunk Group
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
