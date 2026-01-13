import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Plus, Pencil, Phone, Globe, Building2, User, DollarSign,
  Search, Filter, Upload
} from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { Did, DidCountry, DidProvider, Customer } from "@shared/schema";

type DidFormData = {
  number: string;
  countryId: string;
  providerId: string;
  customerId: string;
  status: string;
  monthlyPrice: string;
  setupFee: string;
  destinationType: string;
  destination: string;
};

const defaultForm: DidFormData = {
  number: "",
  countryId: "",
  providerId: "",
  customerId: "",
  status: "available",
  monthlyPrice: "1.50",
  setupFee: "0",
  destinationType: "",
  destination: "",
};

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "active", label: "Active" },
  { value: "reserved", label: "Reserved" },
  { value: "porting_in", label: "Porting In" },
  { value: "porting_out", label: "Porting Out" },
  { value: "suspended", label: "Suspended" },
  { value: "released", label: "Released" },
];

export default function DIDInventoryPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingDid, setEditingDid] = useState<Did | null>(null);
  const [form, setForm] = useState<DidFormData>(defaultForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: dids = [], isLoading } = useQuery<Did[]>({
    queryKey: ["/api/dids"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: countries = [] } = useQuery<DidCountry[]>({
    queryKey: ["/api/did-countries"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: providers = [] } = useQuery<DidProvider[]>({
    queryKey: ["/api/did-providers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: async (data: DidFormData) => {
      const res = await apiRequest("POST", "/api/dids", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dids"] });
      toast({ title: "DID created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create DID", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DidFormData> }) => {
      const res = await apiRequest("PATCH", `/api/dids/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dids"] });
      toast({ title: "DID updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update DID", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingDid(null);
    setIsOpen(false);
  };

  const handleEdit = (did: Did) => {
    setEditingDid(did);
    setForm({
      number: did.number,
      countryId: did.countryId || "",
      providerId: did.providerId || "",
      customerId: did.customerId || "",
      status: did.status || "available",
      monthlyPrice: did.monthlyPrice || "1.50",
      setupFee: did.setupFee || "0",
      destinationType: did.destinationType || "",
      destination: did.destination || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.number) {
      toast({ title: "Phone number is required", variant: "destructive" });
      return;
    }
    if (editingDid) {
      updateMutation.mutate({ id: editingDid.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const getCountryName = (id: string | null) => {
    if (!id) return "-";
    return countries.find(c => c.id === id)?.name || "-";
  };

  const getProviderName = (id: string | null) => {
    if (!id) return "-";
    return providers.find(p => p.id === id)?.name || "-";
  };

  const getCustomerName = (id: string | null) => {
    if (!id) return "Unassigned";
    return customers.find(c => c.id === id)?.companyName || "-";
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "available":
        return <Badge variant="default">Available</Badge>;
      case "active":
        return <Badge variant="secondary">Active</Badge>;
      case "reserved":
        return <Badge variant="outline">Reserved</Badge>;
      case "porting_in":
        return <Badge className="bg-amber-500">Porting In</Badge>;
      case "porting_out":
        return <Badge className="bg-amber-500">Porting Out</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "released":
        return <Badge variant="outline">Released</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredDids = dids.filter(did => {
    const matchesSearch = did.number.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || did.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredDids);

  const stats = {
    total: dids.length,
    available: dids.filter(d => d.status === "available").length,
    active: dids.filter(d => d.status === "active").length,
    reserved: dids.filter(d => d.status === "reserved").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading DID Inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">DID Inventory</h1>
          <p className="text-muted-foreground">Manage phone numbers at $1.50/mo</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-import-dids">
            <Upload className="w-4 h-4 mr-2" />
            Import DIDs
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-did" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add DID
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingDid ? "Edit DID" : "Add DID"}</DialogTitle>
                <DialogDescription>Configure a phone number</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Phone Number</Label>
                  <Input
                    id="number"
                    data-testid="input-number"
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={form.countryId} onValueChange={(v) => setForm({ ...form, countryId: v })}>
                      <SelectTrigger data-testid="select-country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={form.providerId} onValueChange={(v) => setForm({ ...form, providerId: v })}>
                      <SelectTrigger data-testid="select-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Assign to Customer</Label>
                    <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                      <SelectTrigger data-testid="select-customer">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                    <Input
                      id="monthlyPrice"
                      type="number"
                      step="0.01"
                      data-testid="input-monthly-price"
                      value={form.monthlyPrice}
                      onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupFee">Setup Fee ($)</Label>
                    <Input
                      id="setupFee"
                      type="number"
                      step="0.01"
                      data-testid="input-setup-fee"
                      value={form.setupFee}
                      onChange={(e) => setForm({ ...form, setupFee: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationType">Destination Type</Label>
                    <Select value={form.destinationType} onValueChange={(v) => setForm({ ...form, destinationType: v })}>
                      <SelectTrigger data-testid="select-destination-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="sip">SIP URI</SelectItem>
                        <SelectItem value="extension">Extension</SelectItem>
                        <SelectItem value="ivr">IVR</SelectItem>
                        <SelectItem value="queue">Queue</SelectItem>
                        <SelectItem value="ringgroup">Ring Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      data-testid="input-destination"
                      value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      placeholder="sip:user@domain.com"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button
                  data-testid="button-save-did"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total DIDs</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-dids">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-available-dids">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-dids">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-monthly-revenue">
              ${(stats.active * 1.5).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Phone Numbers</CardTitle>
              <CardDescription>Manage your DID inventory</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDids.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No DIDs Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Add your first phone number to the inventory"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button data-testid="button-create-first" onClick={() => setIsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add DID
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Price/mo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map(did => (
                    <TableRow key={did.id} data-testid={`row-did-${did.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{did.number}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getCountryName(did.countryId)}</TableCell>
                      <TableCell>{getProviderName(did.providerId)}</TableCell>
                      <TableCell>
                        {did.customerId ? (
                          <Badge variant="outline">{getCustomerName(did.customerId)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">${did.monthlyPrice || "1.50"}</TableCell>
                      <TableCell>{getStatusBadge(did.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit"
                          title="Edit"
                          data-testid={`button-edit-${did.id}`}
                          onClick={() => handleEdit(did)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
