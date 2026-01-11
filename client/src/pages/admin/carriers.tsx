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
import { Plus, Building2, Pencil, Trash2, ChevronLeft, Lightbulb, X, Save } from "lucide-react";
import { Link } from "wouter";
import type { Carrier, Currency } from "@shared/schema";

type ViewMode = "list" | "add";

export default function CarriersPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  
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

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedCarriers,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(carriers || []);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/carriers", {
        name: data.name,
        code: data.name.toUpperCase().replace(/\s+/g, "_").slice(0, 10),
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
    onError: () => {
      toast({ title: "Failed to create carrier", variant: "destructive" });
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
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-carriers-title">Wholesale Partners</h1>
          <p className="text-muted-foreground">Manage carrier connections for voice routing</p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-carrier">
          <Plus className="h-4 w-4 mr-2" />
          Add Carrier
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : carriers && carriers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Customer Balance</TableHead>
                    <TableHead className="text-right">Supplier Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCarriers.map((carrier) => (
                    <TableRow 
                      key={carrier.id} 
                      data-testid={`row-carrier-${carrier.id}`}
                    >
                      <TableCell className="font-medium">
                        <Link href={`/admin/carriers/${carrier.code || carrier.id}`} className="text-primary hover:underline" data-testid={`link-carrier-${carrier.id}`}>
                          {carrier.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          carrier.partnerType === "bilateral" ? "default" :
                          carrier.partnerType === "supplier" ? "secondary" : "outline"
                        }>
                          {carrier.partnerType === "bilateral" ? "Bilateral" :
                           carrier.partnerType === "supplier" ? "Supplier" : "Customer"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {currencies?.find(c => c.id === carrier.primaryCurrencyId)?.code || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") ? (
                          <span className={parseFloat(carrier.customerBalance || "0") >= 0 ? "text-green-600" : "text-red-600"}>
                            {parseFloat(carrier.customerBalance || "0").toFixed(2)}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") ? (
                          <span className={parseFloat(carrier.supplierBalance || "0") <= 0 ? "text-green-600" : "text-red-600"}>
                            {parseFloat(carrier.supplierBalance || "0").toFixed(2)}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={carrier.status === "active" ? "default" : "secondary"}>
                          {carrier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(carrier)} data-testid={`button-edit-${carrier.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(carrier.id)} data-testid={`button-delete-${carrier.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
          ) : (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No carriers configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add carrier connections for voice routing</p>
              <Button onClick={handleAdd} data-testid="button-add-first-carrier">
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
