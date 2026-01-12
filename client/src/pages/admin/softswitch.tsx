import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
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
  FixedColumnTable,
  FixedColumnTableHeader,
  FixedColumnTableBody,
  FixedColumnTableRow,
  FixedColumnTableHead,
  FixedColumnTableCell,
} from "@/components/ui/fixed-column-table";
import { Plus, Building2, Pencil, Trash2, ChevronLeft, Lightbulb, X, Save, Network, Layers, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import type { Carrier, Currency, CarrierInterconnect, CarrierService } from "@shared/schema";

type ViewMode = "list" | "add";
type EntityView = "carriers" | "interconnects" | "services";

export function SoftswitchCarriersPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [entityView, setEntityView] = useState<EntityView>("carriers");
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const [formData, setFormData] = useState({
    name: "",
    partnerType: "customer" as "customer" | "supplier" | "bilateral",
    primaryCurrencyId: "",
    capacityLimit: "0",
    capacityUnrestricted: true,
    customerCreditType: "postpaid" as "prepaid" | "postpaid",
    customerCreditLimit: "0.00",
    customerCreditUnlimited: false,
    customerBalance: "0.00",
    supplierCreditType: "postpaid" as "prepaid" | "postpaid",
    supplierCreditLimit: "0.00",
    supplierCreditUnlimited: false,
    supplierBalance: "0.00",
  });

  const { data: carriers, isLoading } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
  });

  const { data: allInterconnects, isLoading: isLoadingInterconnects } = useQuery<(CarrierInterconnect & { carrierName?: string })[]>({
    queryKey: ["/api/carrier-interconnects"],
  });

  const { data: allServices, isLoading: isLoadingServices } = useQuery<(CarrierService & { carrierName?: string; interconnectName?: string })[]>({
    queryKey: ["/api/carrier-services"],
  });

  const sortedCarriers = [...(carriers || [])].sort((a, b) => {
    const compare = a.name.localeCompare(b.name);
    return sortOrder === "asc" ? compare : -compare;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedCarriers,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(sortedCarriers);

  const interconnectsPagination = useDataTablePagination(allInterconnects || []);
  const servicesPagination = useDataTablePagination(allServices || []);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/carriers", {
        name: data.name,
        code: data.name.toUpperCase().replace(/\s+/g, "_").slice(0, 20),
        partnerType: data.partnerType,
        primaryCurrencyId: data.primaryCurrencyId || null,
        capacityMode: data.capacityUnrestricted ? "unrestricted" : "capped",
        capacityLimit: data.capacityUnrestricted ? null : parseInt(data.capacityLimit),
        customerCreditType: data.customerCreditType,
        customerCreditLimit: data.customerCreditUnlimited ? "999999999" : data.customerCreditLimit,
        customerCreditLimitUnlimited: data.customerCreditUnlimited,
        customerBalance: data.customerBalance,
        supplierCreditType: data.supplierCreditType,
        supplierCreditLimit: data.supplierCreditUnlimited ? "999999999" : data.supplierCreditLimit,
        supplierCreditLimitUnlimited: data.supplierCreditUnlimited,
        supplierBalance: data.supplierBalance,
        status: "active",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier created successfully" });
      resetForm();
      setViewMode("list");
    },
    onError: (error: Error) => {
      const message = error.message.includes("duplicate key") 
        ? "A carrier with this name/code already exists" 
        : error.message;
      toast({ title: "Failed to create carrier", description: message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PUT", `/api/carriers/${id}`, {
        name: data.name,
        partnerType: data.partnerType,
        primaryCurrencyId: data.primaryCurrencyId || null,
        capacityMode: data.capacityUnrestricted ? "unrestricted" : "capped",
        capacityLimit: data.capacityUnrestricted ? null : parseInt(data.capacityLimit),
        customerCreditType: data.customerCreditType,
        customerCreditLimit: data.customerCreditUnlimited ? "999999999" : data.customerCreditLimit,
        customerCreditLimitUnlimited: data.customerCreditUnlimited,
        customerBalance: data.customerBalance,
        supplierCreditType: data.supplierCreditType,
        supplierCreditLimit: data.supplierCreditUnlimited ? "999999999" : data.supplierCreditLimit,
        supplierCreditLimitUnlimited: data.supplierCreditUnlimited,
        supplierBalance: data.supplierBalance,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier updated successfully" });
      resetForm();
      setViewMode("list");
    },
    onError: () => {
      toast({ title: "Failed to update carrier", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/carriers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete carrier", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      partnerType: "customer",
      primaryCurrencyId: "",
      capacityLimit: "0",
      capacityUnrestricted: true,
      customerCreditType: "postpaid",
      customerCreditLimit: "0.00",
      customerCreditUnlimited: false,
      customerBalance: "0.00",
      supplierCreditType: "postpaid",
      supplierCreditLimit: "0.00",
      supplierCreditUnlimited: false,
      supplierBalance: "0.00",
    });
    setEditingCarrier(null);
  };

  const handleAdd = () => {
    resetForm();
    setViewMode("add");
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      name: carrier.name,
      partnerType: (carrier.partnerType || "customer") as "customer" | "supplier" | "bilateral",
      primaryCurrencyId: carrier.primaryCurrencyId || "",
      capacityLimit: carrier.capacityLimit ? String(carrier.capacityLimit) : "0",
      capacityUnrestricted: carrier.capacityMode === "unrestricted",
      customerCreditType: (carrier.customerCreditType || "postpaid") as "prepaid" | "postpaid",
      customerCreditLimit: carrier.customerCreditLimit || "0.00",
      customerCreditUnlimited: carrier.customerCreditLimitUnlimited || false,
      customerBalance: carrier.customerBalance || "0.00",
      supplierCreditType: (carrier.supplierCreditType || "postpaid") as "prepaid" | "postpaid",
      supplierCreditLimit: carrier.supplierCreditLimit || "0.00",
      supplierCreditUnlimited: carrier.supplierCreditLimitUnlimited || false,
      supplierBalance: carrier.supplierBalance || "0.00",
    });
    setViewMode("add");
  };

  const handleCancel = () => {
    resetForm();
    setViewMode("list");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCarrier) {
      updateMutation.mutate({ id: editingCarrier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Add/Edit Form View
  if (viewMode === "add") {
    const selectedCurrency = currencies?.find(c => c.id === formData.primaryCurrencyId);
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
          <Button variant="ghost" size="icon" onClick={handleCancel} data-testid="button-back">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold" data-testid="text-form-title">
              {editingCarrier ? "Edit Carrier" : "Add New Carrier"}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Form Fields */}
            <div className="col-span-2 space-y-6">
              {/* Carrier Details Section */}
              <div className="space-y-4">
                <h2 className="text-base font-semibold">Carrier Details</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter carrier name"
                      required
                      data-testid="input-carrier-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={formData.partnerType} 
                      onValueChange={(v: "customer" | "supplier" | "bilateral") => setFormData({ ...formData, partnerType: v })}
                    >
                      <SelectTrigger data-testid="select-partner-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="bilateral">Bilateral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Primary Currency</Label>
                    <Select 
                      value={formData.primaryCurrencyId} 
                      onValueChange={(v) => setFormData({ ...formData, primaryCurrencyId: v })}
                    >
                      <SelectTrigger data-testid="select-currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies?.map((currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={formData.capacityLimit}
                        onChange={(e) => setFormData({ ...formData, capacityLimit: e.target.value })}
                        disabled={formData.capacityUnrestricted}
                        className="w-32"
                        data-testid="input-capacity"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="capacityUnrestricted"
                          checked={formData.capacityUnrestricted}
                          onCheckedChange={(checked) => setFormData({ ...formData, capacityUnrestricted: !!checked })}
                          data-testid="checkbox-capacity-unrestricted"
                        />
                        <Label htmlFor="capacityUnrestricted" className="text-sm font-normal">Unrestricted</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Financial Details - shown for customer and bilateral */}
              {(formData.partnerType === "customer" || formData.partnerType === "bilateral") && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold">Customer Financial Details</h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Credit Type</Label>
                      <Select 
                        value={formData.customerCreditType} 
                        onValueChange={(v: "prepaid" | "postpaid") => setFormData({ ...formData, customerCreditType: v })}
                      >
                        <SelectTrigger data-testid="select-customer-credit-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prepaid">Prepaid</SelectItem>
                          <SelectItem value="postpaid">Postpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{formData.customerCreditType === "postpaid" ? "Postpaid" : "Prepaid"} Credit Limit</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.customerCreditLimit}
                          onChange={(e) => setFormData({ ...formData, customerCreditLimit: e.target.value })}
                          disabled={formData.customerCreditUnlimited}
                          className="w-32"
                          data-testid="input-customer-credit-limit"
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="customerCreditUnlimited"
                            checked={formData.customerCreditUnlimited}
                            onCheckedChange={(checked) => setFormData({ ...formData, customerCreditUnlimited: !!checked })}
                            data-testid="checkbox-customer-unlimited"
                          />
                          <Label htmlFor="customerCreditUnlimited" className="text-sm font-normal">Unlimited</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Balance</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.customerBalance}
                        onChange={(e) => setFormData({ ...formData, customerBalance: e.target.value })}
                        className="w-32"
                        data-testid="input-customer-balance"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier Financial Details - shown for supplier and bilateral */}
              {(formData.partnerType === "supplier" || formData.partnerType === "bilateral") && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold">Supplier Financial Details</h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Credit Type</Label>
                      <Select 
                        value={formData.supplierCreditType} 
                        onValueChange={(v: "prepaid" | "postpaid") => setFormData({ ...formData, supplierCreditType: v })}
                      >
                        <SelectTrigger data-testid="select-supplier-credit-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prepaid">Prepaid</SelectItem>
                          <SelectItem value="postpaid">Postpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{formData.supplierCreditType === "postpaid" ? "Postpaid" : "Prepaid"} Credit Limit</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.supplierCreditLimit}
                          onChange={(e) => setFormData({ ...formData, supplierCreditLimit: e.target.value })}
                          disabled={formData.supplierCreditUnlimited}
                          className="w-32"
                          data-testid="input-supplier-credit-limit"
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="supplierCreditUnlimited"
                            checked={formData.supplierCreditUnlimited}
                            onCheckedChange={(checked) => setFormData({ ...formData, supplierCreditUnlimited: !!checked })}
                            data-testid="checkbox-supplier-unlimited"
                          />
                          <Label htmlFor="supplierCreditUnlimited" className="text-sm font-normal">Unlimited</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Balance</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.supplierBalance}
                        onChange={(e) => setFormData({ ...formData, supplierBalance: e.target.value })}
                        className="w-32"
                        data-testid="input-supplier-balance"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Info Box */}
            <div>
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Assigned Currency
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <p>Assigning currency on creation of a new Carrier is mandatory.</p>
                  <div className="text-destructive font-medium">Important:</div>
                  <p className="text-destructive text-xs">
                    It is not possible to change currency once the Carrier has been created. 
                    You would need to delete the Carrier and then add a new entry with the correct currency assigned.
                  </p>
                  {selectedCurrency && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground">Selected: </span>
                      <Badge variant="outline">{selectedCurrency.code}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.name} data-testid="button-save">
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // List View
  const getEntityTitle = () => {
    switch (entityView) {
      case "carriers": return "Carrier Management";
      case "interconnects": return "Interconnects";
      case "services": return "Services";
    }
  };

  const getEntityDescription = () => {
    switch (entityView) {
      case "carriers": return "Manage carrier connections for the Class 4 Softswitch";
      case "interconnects": return "View all interconnects across all carriers";
      case "services": return "View all services across all carriers and interconnects";
    }
  };

  const renderCarriersTable = () => {
    if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    }
    if (!carriers || carriers.length === 0) {
      return (
        <div className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">No carriers configured</h3>
          <p className="text-sm text-muted-foreground mb-4">Add carrier connections for the Class 4 Softswitch</p>
          <Button onClick={handleAdd} data-testid="button-add-first-carrier">
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </div>
      );
    }
    return (
      <>
        <FixedColumnTable>
          <FixedColumnTableHeader>
            <FixedColumnTableRow>
              <FixedColumnTableHead 
                fixed={true} 
                rowSpan={2}
                className="cursor-pointer select-none"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <div className="flex items-center gap-1">
                  Carrier
                  {sortOrder === "asc" ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </FixedColumnTableHead>
              <FixedColumnTableHead rowSpan={2}>Type</FixedColumnTableHead>
              <FixedColumnTableHead className="text-center text-white bg-[#00a0df] border-b-0" colSpan={2}>Customer</FixedColumnTableHead>
              <FixedColumnTableHead className="text-center text-white bg-[#e91e63] border-b-0" colSpan={2}>Supplier</FixedColumnTableHead>
              <FixedColumnTableHead className="text-center text-white bg-[#009688] border-b-0">Bilateral</FixedColumnTableHead>
              <FixedColumnTableHead rowSpan={2}>Account Manager</FixedColumnTableHead>
              <FixedColumnTableHead rowSpan={2}></FixedColumnTableHead>
            </FixedColumnTableRow>
            <FixedColumnTableRow>
              <FixedColumnTableHead>Credit Type</FixedColumnTableHead>
              <FixedColumnTableHead>Balance</FixedColumnTableHead>
              <FixedColumnTableHead>Credit Type</FixedColumnTableHead>
              <FixedColumnTableHead>Balance</FixedColumnTableHead>
              <FixedColumnTableHead>Balance</FixedColumnTableHead>
            </FixedColumnTableRow>
          </FixedColumnTableHeader>
          <FixedColumnTableBody>
            {paginatedCarriers.map((carrier) => {
              const currency = currencies?.find(c => c.id === carrier.primaryCurrencyId);
              const currencyCode = currency?.code || "USD";
              const customerBalance = parseFloat(carrier.customerBalance || "0");
              const supplierBalance = parseFloat(carrier.supplierBalance || "0");
              const bilateralBalance = customerBalance - supplierBalance;
              
              return (
                <FixedColumnTableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                  <FixedColumnTableCell fixed={true} className="font-medium">
                    <Link href={`/admin/carriers/${carrier.code || carrier.id}`} className="text-primary hover:underline" data-testid={`link-carrier-${carrier.id}`}>
                      {carrier.name}
                    </Link>
                  </FixedColumnTableCell>
                  <FixedColumnTableCell>
                    <Badge 
                      className={
                        carrier.partnerType === "bilateral" ? "bg-cyan-500 text-white hover:bg-cyan-600" :
                        carrier.partnerType === "supplier" ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-purple-500 text-white hover:bg-purple-600"
                      }
                    >
                      {carrier.partnerType === "bilateral" ? "B" :
                       carrier.partnerType === "supplier" ? "S" : "C"}
                    </Badge>
                  </FixedColumnTableCell>
                  <FixedColumnTableCell>
                    {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") 
                      ? (carrier.customerCreditType === "prepaid" ? "Prepaid" : "Postpaid")
                      : "-"}
                  </FixedColumnTableCell>
                  <FixedColumnTableCell className="font-mono">
                    {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") ? (
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded text-white min-w-[80px] text-right ${customerBalance >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}>
                          {customerBalance.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground text-xs">{currencyCode}</span>
                      </div>
                    ) : "-"}
                  </FixedColumnTableCell>
                  <FixedColumnTableCell>
                    {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") 
                      ? (carrier.supplierCreditType === "prepaid" ? "Prepaid" : "Postpaid")
                      : "-"}
                  </FixedColumnTableCell>
                  <FixedColumnTableCell className="font-mono">
                    {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") ? (
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded text-white min-w-[80px] text-right ${supplierBalance >= 0 ? "bg-rose-500" : "bg-emerald-500"}`}>
                          {supplierBalance.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground text-xs">{currencyCode}</span>
                      </div>
                    ) : "-"}
                  </FixedColumnTableCell>
                  <FixedColumnTableCell className="font-mono">
                    {carrier.partnerType === "bilateral" ? (
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded text-white min-w-[80px] text-right ${bilateralBalance >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}>
                          {bilateralBalance.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground text-xs">{currencyCode}</span>
                      </div>
                    ) : "-"}
                  </FixedColumnTableCell>
                  <FixedColumnTableCell></FixedColumnTableCell>
                  <FixedColumnTableCell>
                    {carrier.accountManager || "-"}
                  </FixedColumnTableCell>
                  <FixedColumnTableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(carrier.id)} 
                      data-testid={`button-delete-${carrier.id}`}
                    >
                      Delete
                    </Button>
                  </FixedColumnTableCell>
                </FixedColumnTableRow>
              );
            })}
          </FixedColumnTableBody>
        </FixedColumnTable>
        <DataTableFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </>
    );
  };

  const renderInterconnectsTable = () => {
    if (isLoadingInterconnects) {
      return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    }
    if (!allInterconnects || allInterconnects.length === 0) {
      return (
        <div className="p-8 text-center">
          <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">No interconnects configured</h3>
          <p className="text-sm text-muted-foreground mb-4">Add interconnects through carrier detail pages</p>
        </div>
      );
    }
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interconnectsPagination.paginatedItems.map((interconnect) => {
              const carrier = carriers?.find(c => c.id === interconnect.carrierId);
              return (
                <TableRow key={interconnect.id} data-testid={`row-interconnect-${interconnect.id}`}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/interconnects/${interconnect.shortCode || interconnect.id}`} className="text-primary hover:underline" data-testid={`link-interconnect-${interconnect.id}`}>
                      {interconnect.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/carriers/${carrier?.code || interconnect.carrierId}`} className="text-primary hover:underline">
                      {carrier?.name || interconnect.carrierName || "-"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      interconnect.direction === "ingress" ? "outline" :
                      interconnect.direction === "egress" ? "secondary" : "default"
                    }>
                      {interconnect.direction === "ingress" ? "Ingress" :
                       interconnect.direction === "egress" ? "Egress" : "Both"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {interconnect.currencyCode || "-"}
                  </TableCell>
                  <TableCell>{interconnect.protocol || "SIP"}</TableCell>
                  <TableCell>
                    {interconnect.capacityMode === "unrestricted" ? "Unrestricted" : interconnect.capacityLimit || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={interconnect.isActive ? "default" : "secondary"}>
                      {interconnect.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <DataTableFooter
          currentPage={interconnectsPagination.currentPage}
          totalPages={interconnectsPagination.totalPages}
          pageSize={interconnectsPagination.pageSize}
          totalItems={interconnectsPagination.totalItems}
          onPageChange={interconnectsPagination.onPageChange}
          onPageSizeChange={interconnectsPagination.onPageSizeChange}
        />
      </>
    );
  };

  const renderServicesTable = () => {
    if (isLoadingServices) {
      return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    }
    if (!allServices || allServices.length === 0) {
      return (
        <div className="p-8 text-center">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">No services configured</h3>
          <p className="text-sm text-muted-foreground mb-4">Add services through interconnect detail pages</p>
        </div>
      );
    }
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Interconnect</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Tech Prefix</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servicesPagination.paginatedItems.map((service) => {
              const carrier = carriers?.find(c => c.id === service.carrierId);
              const interconnect = allInterconnects?.find(i => i.id === service.interconnectId);
              return (
                <TableRow key={service.id} data-testid={`row-service-${service.id}`}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Link href={`/admin/carriers/${carrier?.code || service.carrierId}`} className="text-primary hover:underline">
                      {carrier?.name || service.carrierName || "-"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/interconnects/${interconnect?.shortCode || service.interconnectId}`} className="text-primary hover:underline">
                      {interconnect?.name || service.interconnectName || "-"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      service.direction === "ingress" ? "outline" :
                      service.direction === "egress" ? "secondary" : "default"
                    }>
                      {service.direction === "ingress" ? "Ingress" :
                       service.direction === "egress" ? "Egress" : "Both"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{service.techPrefix || "-"}</TableCell>
                  <TableCell>{service.priority ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={service.status === "active" ? "default" : "secondary"}>
                      {service.status === "active" ? "Active" : service.status || "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <DataTableFooter
          currentPage={servicesPagination.currentPage}
          totalPages={servicesPagination.totalPages}
          pageSize={servicesPagination.pageSize}
          totalItems={servicesPagination.totalItems}
          onPageChange={servicesPagination.onPageChange}
          onPageSizeChange={servicesPagination.onPageSizeChange}
        />
      </>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={entityView} onValueChange={(v: EntityView) => setEntityView(v)}>
            <SelectTrigger className="w-48" data-testid="select-entity-view">
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
                  <Layers className="h-4 w-4" />
                  Services
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">{getEntityTitle()}</h1>
            <p className="text-muted-foreground">{getEntityDescription()}</p>
          </div>
        </div>
        {entityView === "carriers" && (
          <Button onClick={handleAdd} data-testid="button-add-carrier">
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {entityView === "carriers" && renderCarriersTable()}
          {entityView === "interconnects" && renderInterconnectsTable()}
          {entityView === "services" && renderServicesTable()}
        </CardContent>
      </Card>
    </div>
  );
}
