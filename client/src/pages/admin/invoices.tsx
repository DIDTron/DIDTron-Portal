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
import { Plus, FileText, Pencil, Trash2 } from "lucide-react";
import type { Invoice, Customer } from "@shared/schema";

type InvoiceFormData = {
  customerId: string;
  amount: string;
  tax: string;
  total: string;
  currency: string;
  status: string;
};

export default function InvoicesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: "",
    amount: "",
    tax: "0",
    total: "",
    currency: "USD",
    status: "pending",
  });

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const res = await apiRequest("POST", "/api/invoices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create invoice", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InvoiceFormData }) => {
      const res = await apiRequest("PATCH", `/api/invoices/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update invoice", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete invoice", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      amount: "",
      tax: "0",
      total: "",
      currency: "USD",
      status: "pending",
    });
    setEditingInvoice(null);
    setIsOpen(false);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customerId: invoice.customerId,
      amount: invoice.amount,
      tax: invoice.tax || "0",
      total: invoice.total,
      currency: invoice.currency || "USD",
      status: invoice.status || "pending",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInvoice) {
      updateMutation.mutate({ id: editingInvoice.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers?.find(c => c.id === customerId)?.companyName || "-";
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      paid: "bg-green-500/10 text-green-500 border-green-500/20",
      overdue: "bg-red-500/10 text-red-500 border-red-500/20",
      cancelled: "bg-muted text-muted-foreground",
    };
    return variants[status || "pending"] || variants.pending;
  };

  return (
    <div className="space-y-4" data-testid="invoices-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Invoices</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-invoice">
              <Plus className="h-4 w-4 mr-1" />
              Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="dialog-invoice-form">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? "Edit Invoice" : "Add Invoice"}</DialogTitle>
              <DialogDescription>
                {editingInvoice ? "Update invoice details" : "Create a new invoice"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(v) => setFormData({ ...formData, customerId: v })}
                  >
                    <SelectTrigger data-testid="select-customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((cust) => (
                        <SelectItem key={cust.id} value={cust.id}>{cust.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      data-testid="input-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax</Label>
                    <Input
                      id="tax"
                      type="number"
                      step="0.01"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                      placeholder="0.00"
                      data-testid="input-tax"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total</Label>
                    <Input
                      id="total"
                      type="number"
                      step="0.01"
                      value={formData.total}
                      onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                      placeholder="0.00"
                      required
                      data-testid="input-total"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(v) => setFormData({ ...formData, currency: v })}
                    >
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
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-invoice"
                >
                  {editingInvoice ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>
          ) : !invoices?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No invoices found. Create your first invoice.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                    <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                    <TableCell>${invoice.amount}</TableCell>
                    <TableCell>${invoice.total}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(invoice)}
                          data-testid={`button-edit-invoice-${invoice.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(invoice.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-invoice-${invoice.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
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
