import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Search, RefreshCw, CreditCard, Users, AlertTriangle, Edit, Calendar, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Customer, BillingTerm, Carrier } from "@shared/schema";

const retailCategories = [
  { id: "all", label: "All Customers" },
  { id: "prepaid", label: "Prepaid" },
  { id: "postpaid", label: "Postpaid" },
  { id: "bilateral", label: "Bilateral" },
  { id: "low-balance", label: "Low Balance" },
];

const wholesaleCategories = [
  { id: "all", label: "All Partners" },
  { id: "customer", label: "Customers" },
  { id: "supplier", label: "Suppliers" },
  { id: "bilateral", label: "Bilateral" },
];

export default function BillingCustomersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("wholesale");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    billingType: "prepaid" as "prepaid" | "postpaid" | "bilateral",
    creditLimit: "0",
    billingTermId: "",
  });

  const { data: customers, isLoading: customersLoading, isFetching: customersFetching, refetch: refetchCustomers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: carriers, isLoading: carriersLoading, isFetching: carriersFetching, refetch: refetchCarriers } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: billingTerms } = useQuery<BillingTerm[]>({
    queryKey: ["/api/billing-terms"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      return await apiRequest("PATCH", `/api/customers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setShowEditDialog(false);
      toast({ title: "Customer updated", description: "Billing settings have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" });
    },
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

  const filteredCarriers = carriers?.filter((carrier) => {
    const matchesSearch = 
      carrier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carrier.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" ||
      (selectedCategory === "customer" && carrier.partnerType === "customer") ||
      (selectedCategory === "supplier" && carrier.partnerType === "supplier") ||
      (selectedCategory === "bilateral" && carrier.partnerType === "bilateral");
    
    return matchesSearch && matchesCategory;
  }) || [];

  const { paginatedItems: paginatedCustomers, ...customerPaginationProps } = useDataTablePagination(filteredCustomers);
  const { paginatedItems: paginatedCarriers, ...carrierPaginationProps } = useDataTablePagination(filteredCarriers);

  const getRetailCategoryCount = (categoryId: string) => {
    if (!customers) return 0;
    if (categoryId === "all") return customers.length;
    if (categoryId === "prepaid") return customers.filter(c => c.billingType === "prepaid").length;
    if (categoryId === "postpaid") return customers.filter(c => c.billingType === "postpaid").length;
    if (categoryId === "bilateral") return customers.filter(c => c.billingType === "bilateral").length;
    if (categoryId === "low-balance") return customers.filter(c => parseFloat(c.balance || "0") < parseFloat(c.lowBalanceThreshold1 || "50")).length;
    return 0;
  };

  const getWholesaleCategoryCount = (categoryId: string) => {
    if (!carriers) return 0;
    if (categoryId === "all") return carriers.length;
    if (categoryId === "customer") return carriers.filter(c => c.partnerType === "customer").length;
    if (categoryId === "supplier") return carriers.filter(c => c.partnerType === "supplier").length;
    if (categoryId === "bilateral") return carriers.filter(c => c.partnerType === "bilateral").length;
    return 0;
  };

  const handleEditClick = (c: Customer) => {
    setEditingCustomer(c);
    setEditFormData({
      billingType: c.billingType || "prepaid",
      creditLimit: c.creditLimit || "0",
      billingTermId: c.billingTermId || "",
    });
    setShowEditDialog(true);
  };

  const handleSaveChanges = () => {
    if (!editingCustomer) return;
    updateCustomerMutation.mutate({
      id: editingCustomer.id,
      data: {
        billingType: editFormData.billingType,
        creditLimit: editFormData.creditLimit,
        billingTermId: editFormData.billingTermId || null,
      },
    });
  };

  const getCustomerBillingTerm = (customer: Customer) => {
    if (!customer.billingTermId || !billingTerms) return null;
    return billingTerms.find(t => t.id === customer.billingTermId);
  };

  const handleRefresh = () => {
    if (activeTab === "wholesale") {
      refetchCarriers();
    } else {
      refetchCustomers();
    }
  };

  const isLoading = activeTab === "wholesale" ? carriersLoading : customersLoading;
  const isFetching = activeTab === "wholesale" ? carriersFetching : customersFetching;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Customer Billing</h1>
          <p className="text-muted-foreground">Manage wholesale partners and retail customer billing</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isFetching} data-testid="button-refresh">
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedCategory("all"); setSearchQuery(""); }}>
        <TabsList>
          <TabsTrigger value="wholesale" data-testid="tab-wholesale">
            <Building2 className="h-4 w-4 mr-2" />
            Wholesale Partners ({carriers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="retail" data-testid="tab-retail">
            <Users className="h-4 w-4 mr-2" />
            Retail Customers ({customers?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wholesale" className="mt-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search wholesale partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-wholesale"
              />
            </div>
          </div>

          <ScrollArea className="w-full whitespace-nowrap" type="hover">
            <div className="flex gap-2 pb-2">
              {wholesaleCategories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer shrink-0"
                  onClick={() => setSelectedCategory(cat.id)}
                  data-testid={`filter-wholesale-${cat.id}`}
                >
                  {cat.label}
                  <span className="ml-1 text-xs">({getWholesaleCategoryCount(cat.id)})</span>
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <Card>
            <CardContent className="p-0">
              {carriersLoading ? (
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
                        <TableHead>Partner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Credit Type</TableHead>
                        <TableHead className="text-right">Customer Balance</TableHead>
                        <TableHead className="text-right">Supplier Balance</TableHead>
                        <TableHead className="text-right">Credit Limit</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCarriers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No wholesale partners found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedCarriers.map((carrier) => {
                          const customerBalance = parseFloat(carrier.customerBalance || "0");
                          const supplierBalance = parseFloat(carrier.supplierBalance || "0");
                          const creditLimit = parseFloat(carrier.customerCreditLimit || "0");
                          
                          return (
                            <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                              <TableCell>
                                <Link href={`/admin/carriers/${carrier.id}`} className="hover:underline">
                                  <div className="font-medium">{carrier.name}</div>
                                  <div className="text-sm text-muted-foreground">{carrier.code}</div>
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  carrier.partnerType === "customer" ? "default" : 
                                  carrier.partnerType === "supplier" ? "secondary" : 
                                  "outline"
                                }>
                                  {carrier.partnerType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {carrier.customerCreditType || "postpaid"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                <span className={customerBalance < 0 ? "text-red-500" : ""}>
                                  ${customerBalance.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                <span className={supplierBalance < 0 ? "text-red-500" : ""}>
                                  ${supplierBalance.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {carrier.customerCreditLimitUnlimited 
                                  ? <Badge variant="outline">Unlimited</Badge>
                                  : `$${creditLimit.toFixed(2)}`
                                }
                              </TableCell>
                              <TableCell>
                                <Badge variant={carrier.status === "active" ? "secondary" : "destructive"}>
                                  {carrier.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  <DataTableFooter {...carrierPaginationProps} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retail" className="mt-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-retail"
              />
            </div>
          </div>

          <ScrollArea className="w-full whitespace-nowrap" type="hover">
            <div className="flex gap-2 pb-2">
              {retailCategories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className="cursor-pointer shrink-0"
                  onClick={() => setSelectedCategory(cat.id)}
                  data-testid={`filter-retail-${cat.id}`}
                >
                  {cat.label}
                  <span className="ml-1 text-xs">({getRetailCategoryCount(cat.id)})</span>
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <Card>
            <CardContent className="p-0">
              {customersLoading ? (
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
                        <TableHead>Billing Terms</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Credit Limit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No retail customers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedCustomers.map((customer) => {
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
                              <TableCell>
                                {(() => {
                                  const term = getCustomerBillingTerm(customer);
                                  if (term) {
                                    return (
                                      <Badge variant="outline" className="font-mono">
                                        {term.code}
                                      </Badge>
                                    );
                                  }
                                  return <span className="text-muted-foreground">-</span>;
                                })()}
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
                        })
                      )}
                    </TableBody>
                  </Table>
                  <DataTableFooter {...customerPaginationProps} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <Select 
                value={editFormData.billingType} 
                onValueChange={(v) => setEditFormData({ ...editFormData, billingType: v as "prepaid" | "postpaid" | "bilateral" })}
              >
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
                value={editFormData.creditLimit}
                onChange={(e) => setEditFormData({ ...editFormData, creditLimit: e.target.value })}
                data-testid="input-credit-limit"
              />
            </div>
            <div className="space-y-2">
              <Label>Billing Terms (Invoice Frequency / Due Days)</Label>
              <Select 
                value={editFormData.billingTermId || "none"} 
                onValueChange={(v) => setEditFormData({ ...editFormData, billingTermId: v === "none" ? "" : v })}
              >
                <SelectTrigger data-testid="select-billing-terms">
                  <SelectValue placeholder="Select billing terms..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No billing term assigned</SelectItem>
                  {billingTerms?.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-mono">{term.code}</span>
                        <span className="text-muted-foreground">- {term.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Format: Invoice Cycle Days / Due Days. Example: 7/3 = Weekly invoice, due in 3 days.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={updateCustomerMutation.isPending}
              data-testid="button-save"
            >
              {updateCustomerMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
