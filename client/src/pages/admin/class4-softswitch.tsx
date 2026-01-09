import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus, Pencil, Trash2, Users, Building2, CreditCard,
  Network, ArrowRight, DollarSign, Percent, Check, X
} from "lucide-react";
import type { Class4Customer, Class4Carrier, Customer } from "@shared/schema";

type CustomerFormData = {
  parentCustomerId: string;
  name: string;
  code: string;
  companyName: string;
  billingEmail: string;
  creditLimit: string;
  displayCurrency: string;
  billingType: string;
  status: string;
};

type CarrierFormData = {
  parentCustomerId: string;
  name: string;
  code: string;
  sipHost: string;
  techPrefix: string;
  maxChannels: number;
  maxCps: number;
  status: string;
};

const defaultCustomerForm: CustomerFormData = {
  parentCustomerId: "",
  name: "",
  code: "",
  companyName: "",
  billingEmail: "",
  creditLimit: "100.00",
  displayCurrency: "USD",
  billingType: "prepaid",
  status: "active",
};

const defaultCarrierForm: CarrierFormData = {
  parentCustomerId: "",
  name: "",
  code: "",
  sipHost: "",
  techPrefix: "",
  maxChannels: 100,
  maxCps: 10,
  status: "active",
};

export function Class4CustomersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Class4Customer | null>(null);
  const [form, setForm] = useState<CustomerFormData>(defaultCustomerForm);

  const { data: customers = [], isLoading } = useQuery<Class4Customer[]>({
    queryKey: ["/api/class4/customers"],
  });

  const { data: parentCustomers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const res = await apiRequest("POST", "/api/class4/customers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class4/customers"] });
      toast({ title: "Class 4 customer created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create customer", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerFormData> }) => {
      const res = await apiRequest("PATCH", `/api/class4/customers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class4/customers"] });
      toast({ title: "Class 4 customer updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update customer", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultCustomerForm);
    setEditingCustomer(null);
    setIsOpen(false);
  };

  const handleEdit = (customer: Class4Customer) => {
    setEditingCustomer(customer);
    setForm({
      parentCustomerId: customer.parentCustomerId,
      name: customer.name,
      code: customer.code,
      companyName: customer.companyName || "",
      billingEmail: customer.billingEmail || "",
      creditLimit: customer.creditLimit || "100.00",
      displayCurrency: customer.displayCurrency || "USD",
      billingType: customer.billingType || "prepaid",
      status: customer.status || "active",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.parentCustomerId || !form.name) {
      toast({ title: "Parent customer and name are required", variant: "destructive" });
      return;
    }
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const getParentName = (id: string) => {
    return parentCustomers.find(c => c.id === id)?.companyName || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading Class 4 Customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Class 4 Customers</h1>
          <p className="text-muted-foreground">Manage softswitch customers at $0.0005/min + $25 setup</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-class4-customer" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
              <DialogDescription>Configure a Class 4 softswitch customer</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Customer</Label>
                <Select value={form.parentCustomerId} onValueChange={(v) => setForm({ ...form, parentCustomerId: v })}>
                  <SelectTrigger data-testid="select-parent-customer">
                    <SelectValue placeholder="Select parent customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentCustomers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    data-testid="input-customer-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    data-testid="input-company-name"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Billing Email</Label>
                  <Input
                    id="billingEmail"
                    type="email"
                    data-testid="input-email"
                    value={form.billingEmail}
                    onChange={(e) => setForm({ ...form, billingEmail: e.target.value })}
                    placeholder="billing@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Customer Code</Label>
                  <Input
                    id="code"
                    data-testid="input-code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="CUST001"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    data-testid="input-credit-limit"
                    value={form.creditLimit}
                    onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayCurrency">Currency</Label>
                  <Select value={form.displayCurrency} onValueChange={(v) => setForm({ ...form, displayCurrency: v })}>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingType">Billing Type</Label>
                  <Select value={form.billingType} onValueChange={(v) => setForm({ ...form, billingType: v })}>
                    <SelectTrigger data-testid="select-billing-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepaid">Prepaid</SelectItem>
                      <SelectItem value="postpaid">Postpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                data-testid="button-save-customer"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-customers">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-customers">
              {customers.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Prepaid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-prepaid-customers">
              {customers.filter(c => c.billingType === "prepaid").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class 4 Customers</CardTitle>
          <CardDescription>Softswitch customers for wholesale voice termination</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Class 4 Customers</h3>
              <p className="text-muted-foreground mb-4">Add your first softswitch customer</p>
              <Button data-testid="button-create-first" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Tech Prefix</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(customer => (
                  <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.companyName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getParentName(customer.parentCustomerId)}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {customer.code || "-"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.billingType || "prepaid"}</Badge>
                    </TableCell>
                    <TableCell>
                      {customer.displayCurrency} {customer.creditLimit}
                    </TableCell>
                    <TableCell>
                      {customer.status === "active" ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">{customer.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-edit-${customer.id}`}
                          onClick={() => handleEdit(customer)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
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

export function Class4CarriersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Class4Carrier | null>(null);
  const [form, setForm] = useState<CarrierFormData>(defaultCarrierForm);

  const { data: carriers = [], isLoading } = useQuery<Class4Carrier[]>({
    queryKey: ["/api/class4/carriers"],
  });

  const { data: parentCustomers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CarrierFormData) => {
      const res = await apiRequest("POST", "/api/class4/carriers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class4/carriers"] });
      toast({ title: "Class 4 carrier created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create carrier", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CarrierFormData> }) => {
      const res = await apiRequest("PATCH", `/api/class4/carriers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/class4/carriers"] });
      toast({ title: "Class 4 carrier updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update carrier", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultCarrierForm);
    setEditingCarrier(null);
    setIsOpen(false);
  };

  const handleEdit = (carrier: Class4Carrier) => {
    setEditingCarrier(carrier);
    setForm({
      parentCustomerId: carrier.parentCustomerId,
      name: carrier.name,
      code: carrier.code,
      sipHost: carrier.sipHost || "",
      techPrefix: carrier.techPrefix || "",
      maxChannels: carrier.maxChannels ?? 100,
      maxCps: carrier.maxCps ?? 10,
      status: carrier.status || "active",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.parentCustomerId || !form.name) {
      toast({ title: "Parent customer and name are required", variant: "destructive" });
      return;
    }
    if (editingCarrier) {
      updateMutation.mutate({ id: editingCarrier.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const getParentName = (id: string) => {
    return parentCustomers.find(c => c.id === id)?.companyName || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading Class 4 Carriers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Class 4 Carriers</h1>
          <p className="text-muted-foreground">Manage upstream voice providers for LCR</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-class4-carrier" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Carrier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCarrier ? "Edit Carrier" : "Add Carrier"}</DialogTitle>
              <DialogDescription>Configure an upstream voice carrier</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Customer</Label>
                <Select value={form.parentCustomerId} onValueChange={(v) => setForm({ ...form, parentCustomerId: v })}>
                  <SelectTrigger data-testid="select-parent">
                    <SelectValue placeholder="Select parent customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentCustomers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Carrier Name</Label>
                  <Input
                    id="name"
                    data-testid="input-carrier-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Carrier name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Carrier Code</Label>
                  <Input
                    id="code"
                    data-testid="input-carrier-code"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="CARR001"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sipHost">SIP Host</Label>
                <Input
                  id="sipHost"
                  data-testid="input-sip-host"
                  value={form.sipHost}
                  onChange={(e) => setForm({ ...form, sipHost: e.target.value })}
                  placeholder="sip.carrier.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="techPrefix">Tech Prefix</Label>
                  <Input
                    id="techPrefix"
                    data-testid="input-carrier-prefix"
                    value={form.techPrefix}
                    onChange={(e) => setForm({ ...form, techPrefix: e.target.value })}
                    placeholder="002"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxChannels">Max Channels</Label>
                  <Input
                    id="maxChannels"
                    type="number"
                    data-testid="input-max-channels"
                    value={form.maxChannels}
                    onChange={(e) => setForm({ ...form, maxChannels: parseInt(e.target.value) || 100 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxCps">Max CPS (Calls Per Second)</Label>
                <Input
                  id="maxCps"
                  type="number"
                  data-testid="input-max-cps"
                  value={form.maxCps}
                  onChange={(e) => setForm({ ...form, maxCps: parseInt(e.target.value) || 10 })}
                />
                <p className="text-xs text-muted-foreground">Maximum calls per second allowed</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                data-testid="button-save-carrier"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-carriers">{carriers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-carriers">
              {carriers.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-channels">
              {carriers.reduce((sum, c) => sum + (c.maxChannels || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class 4 Carriers</CardTitle>
          <CardDescription>Upstream voice providers for least-cost routing</CardDescription>
        </CardHeader>
        <CardContent>
          {carriers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Class 4 Carriers</h3>
              <p className="text-muted-foreground mb-4">Add your first upstream carrier</p>
              <Button data-testid="button-create-first-carrier" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Carrier
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Priority / Weight</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map(carrier => (
                  <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{carrier.name}</div>
                          {carrier.techPrefix && (
                            <code className="text-xs text-muted-foreground">
                              {carrier.techPrefix}
                            </code>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getParentName(carrier.parentCustomerId)}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {carrier.sipHost || "-"}
                      </code>
                    </TableCell>
                    <TableCell>
                      {carrier.maxCps || 0} CPS
                    </TableCell>
                    <TableCell>{carrier.maxChannels}</TableCell>
                    <TableCell>
                      {carrier.status === "active" ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">{carrier.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-edit-carrier-${carrier.id}`}
                          onClick={() => handleEdit(carrier)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
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

export function Class4RateCardsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Rate Cards</h1>
          <p className="text-muted-foreground">Manage provider and customer rate cards for LCR</p>
        </div>
        <Button data-testid="button-add-rate-card">
          <Plus className="w-4 h-4 mr-2" />
          Add Rate Card
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Provider Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-provider-cards">0</div>
            <p className="text-xs text-muted-foreground">Cost rate cards from carriers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Customer Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-customer-cards">0</div>
            <p className="text-xs text-muted-foreground">Sell rate cards with markup</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-margin">-</div>
            <p className="text-xs text-muted-foreground">Average profit margin</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="provider" className="space-y-4">
        <TabsList>
          <TabsTrigger value="provider">Provider Rate Cards</TabsTrigger>
          <TabsTrigger value="customer">Customer Rate Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="provider">
          <Card>
            <CardHeader>
              <CardTitle>Provider Rate Cards</CardTitle>
              <CardDescription>Cost rate cards from upstream carriers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Provider Rate Cards</h3>
                <p className="text-muted-foreground mb-4">
                  Import rate cards from your upstream carriers
                </p>
                <Button data-testid="button-import-provider">
                  <Plus className="w-4 h-4 mr-2" />
                  Import Rate Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Rate Cards</CardTitle>
              <CardDescription>Sell rate cards with markup for your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Customer Rate Cards</h3>
                <p className="text-muted-foreground mb-4">
                  Create customer rate cards with automated markup
                </p>
                <Button data-testid="button-create-customer-card">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rate Card
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
