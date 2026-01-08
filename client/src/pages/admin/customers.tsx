import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Users, Pencil, Trash2, Building2 } from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { Customer, CustomerCategory, CustomerGroup } from "@shared/schema";

type CustomerFormData = {
  accountNumber: string;
  companyName: string;
  categoryId: string;
  groupId: string;
  status: string;
  billingType: string;
  creditLimit: string;
  billingEmail: string;
  technicalEmail: string;
  country: string;
};

export default function CustomersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    accountNumber: "",
    companyName: "",
    categoryId: "",
    groupId: "",
    status: "pending_approval",
    billingType: "prepaid",
    creditLimit: "0",
    billingEmail: "",
    technicalEmail: "",
    country: "",
  });

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: categories } = useQuery<CustomerCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: groups } = useQuery<CustomerGroup[]>({
    queryKey: ["/api/groups"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(customers);

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const res = await apiRequest("POST", "/api/customers", {
        ...data,
        categoryId: data.categoryId || null,
        groupId: data.groupId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create customer", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerFormData }) => {
      const res = await apiRequest("PATCH", `/api/customers/${id}`, {
        ...data,
        categoryId: data.categoryId || null,
        groupId: data.groupId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update customer", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete customer", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      accountNumber: "",
      companyName: "",
      categoryId: "",
      groupId: "",
      status: "pending_approval",
      billingType: "prepaid",
      creditLimit: "0",
      billingEmail: "",
      technicalEmail: "",
      country: "",
    });
    setEditingCustomer(null);
    setIsOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      accountNumber: customer.accountNumber,
      companyName: customer.companyName,
      categoryId: customer.categoryId || "",
      groupId: customer.groupId || "",
      status: customer.status || "pending_approval",
      billingType: customer.billingType || "prepaid",
      creditLimit: customer.creditLimit || "0",
      billingEmail: customer.billingEmail || "",
      technicalEmail: customer.technicalEmail || "",
      country: customer.country || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      pending_approval: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      suspended: "bg-red-500/10 text-red-500 border-red-500/20",
      cancelled: "bg-muted text-muted-foreground",
    };
    return variants[status || "pending_approval"] || variants.pending_approval;
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "-";
    return categories?.find(c => c.id === categoryId)?.name || "-";
  };

  return (
    <div className="space-y-4" data-testid="customers-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Customers</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-customer">
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="dialog-customer-form">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Update customer details" : "Create a new customer account"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="ACC-001"
                      required
                      data-testid="input-account-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="ACME Corp"
                      required
                      data-testid="input-company-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger id="categoryId" data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupId">Group</Label>
                    <Select
                      value={formData.groupId}
                      onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                    >
                      <SelectTrigger id="groupId" data-testid="select-group">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups?.map((grp) => (
                          <SelectItem key={grp.id} value={grp.id}>{grp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingType">Billing Type</Label>
                    <Select
                      value={formData.billingType}
                      onValueChange={(value) => setFormData({ ...formData, billingType: value })}
                    >
                      <SelectTrigger id="billingType" data-testid="select-billing-type">
                        <SelectValue placeholder="Select billing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prepaid">Prepaid</SelectItem>
                        <SelectItem value="postpaid">Postpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.billingType === "postpaid" && (
                  <div className="space-y-2">
                    <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      placeholder="0.00"
                      data-testid="input-credit-limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum amount this customer can spend before payment is required
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingEmail">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      placeholder="billing@example.com"
                      data-testid="input-billing-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technicalEmail">Technical Email</Label>
                    <Input
                      id="technicalEmail"
                      type="email"
                      value={formData.technicalEmail}
                      onChange={(e) => setFormData({ ...formData, technicalEmail: e.target.value })}
                      placeholder="tech@example.com"
                      data-testid="input-technical-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    data-testid="input-country"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingCustomer ? "Update" : "Create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card data-testid="card-customers-table">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : customers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((customer) => (
                    <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                      <TableCell className="font-mono text-sm">{customer.accountNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(customer.categoryId)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(customer.status)} variant="outline">
                          {(customer.status || "pending").replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary">
                            {customer.billingType || "prepaid"}
                          </Badge>
                          {customer.billingType === "postpaid" && (
                            <span className="text-xs text-muted-foreground">
                              Limit: ${parseFloat(customer.creditLimit || "0").toFixed(2)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${parseFloat(customer.balance || "0").toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(customer)}
                            data-testid={`button-edit-${customer.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this customer?")) {
                                deleteMutation.mutate(customer.id);
                              }
                            }}
                            data-testid={`button-delete-${customer.id}`}
                          >
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
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">No customers yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first customer to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
