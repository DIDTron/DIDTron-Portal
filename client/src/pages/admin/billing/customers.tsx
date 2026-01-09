import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Search, RefreshCw, CreditCard, Users, AlertTriangle, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@shared/schema";

const categories = [
  { id: "all", label: "All Customers" },
  { id: "prepaid", label: "Prepaid" },
  { id: "postpaid", label: "Postpaid" },
  { id: "bilateral", label: "Bilateral" },
  { id: "low-balance", label: "Low Balance" },
];

export default function BillingCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: customers, isLoading, isFetching, refetch } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const filteredCustomers = customers?.filter((customer) => {
    const matchesSearch = 
      customer.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" ||
      (selectedCategory === "prepaid" && customer.billingType === "prepaid") ||
      (selectedCategory === "postpaid" && customer.billingType === "postpaid") ||
      (selectedCategory === "bilateral" && customer.billingType === "bilateral") ||
      (selectedCategory === "low-balance" && parseFloat(customer.balance || "0") < parseFloat(customer.lowBalanceThreshold1 || "50"));
    
    return matchesSearch && matchesCategory;
  }) || [];

  const { paginatedItems, ...paginationProps } = useDataTablePagination(filteredCustomers);

  const getCategoryCount = (categoryId: string) => {
    if (!customers) return 0;
    if (categoryId === "all") return customers.length;
    if (categoryId === "prepaid") return customers.filter(c => c.billingType === "prepaid").length;
    if (categoryId === "postpaid") return customers.filter(c => c.billingType === "postpaid").length;
    if (categoryId === "bilateral") return customers.filter(c => c.billingType === "bilateral").length;
    if (categoryId === "low-balance") return customers.filter(c => parseFloat(c.balance || "0") < parseFloat(c.lowBalanceThreshold1 || "50")).length;
    return 0;
  };

  const handleEditClick = (c: Customer) => {
    setEditingCustomer(c);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Customer Billing</h1>
          <p className="text-muted-foreground">Manage prepaid/postpaid settings and credit limits</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh">
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap" type="hover">
        <div className="flex gap-2 pb-2">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className="cursor-pointer shrink-0"
              onClick={() => setSelectedCategory(cat.id)}
              data-testid={`filter-${cat.id}`}
            >
              {cat.label}
              <span className="ml-1 text-xs">({getCategoryCount(cat.id)})</span>
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Billing Type</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Credit Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((customer) => {
                    const balance = parseFloat(customer.balance || "0");
                    const threshold = parseFloat(customer.lowBalanceThreshold1 || "50");
                    const isLowBalance = balance < threshold;
                    
                    return (
                      <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.companyName || "Individual"}</div>
                            <div className="text-sm text-muted-foreground">{customer.accountNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.billingType === "prepaid" ? "secondary" : "outline"}>
                            {customer.billingType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <div className="flex items-center justify-end gap-1">
                            {isLowBalance && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            ${balance.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {customer.billingType === "postpaid" 
                            ? `$${parseFloat(customer.creditLimit || "0").toFixed(2)}`
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.status === "active" ? "secondary" : "destructive"}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(customer)}
                            data-testid={`button-edit-${customer.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <DataTableFooter {...paginationProps} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Billing Settings</DialogTitle>
            <DialogDescription>
              Update billing type and credit settings for {editingCustomer?.companyName || editingCustomer?.accountNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Billing Type</Label>
              <Select defaultValue={editingCustomer?.billingType || "prepaid"}>
                <SelectTrigger data-testid="select-billing-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepaid">Prepaid</SelectItem>
                  <SelectItem value="postpaid">Postpaid</SelectItem>
                  <SelectItem value="bilateral">Bilateral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Credit Limit (for Postpaid)</Label>
              <Input 
                type="number" 
                defaultValue={editingCustomer?.creditLimit || "0"}
                data-testid="input-credit-limit"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms (days)</Label>
              <Select defaultValue="30">
                <SelectTrigger data-testid="select-payment-terms">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Net 7</SelectItem>
                  <SelectItem value="15">Net 15</SelectItem>
                  <SelectItem value="30">Net 30</SelectItem>
                  <SelectItem value="45">Net 45</SelectItem>
                  <SelectItem value="60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button data-testid="button-save">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
