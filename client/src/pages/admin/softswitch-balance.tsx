import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Building2, DollarSign, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import type { Carrier, Currency } from "@shared/schema";

export function CarrierBalancesPage() {
  const { toast } = useToast();
  
  const { data: carriers, isLoading, isFetching, refetch } = useQuery<Carrier[]>({
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
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(carriers || []);

  const getCurrencySymbol = (currencyId?: string | null) => {
    const currency = currencies?.find(c => c.id === currencyId);
    return currency?.symbol || currency?.code || "$";
  };

  const formatBalance = (balance: string | null | undefined, isPositiveGood = true) => {
    const value = parseFloat(balance || "0");
    const isPositive = value >= 0;
    const colorClass = isPositiveGood 
      ? (isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")
      : (isPositive ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400");
    return (
      <span className={`font-mono font-medium ${colorClass}`}>
        {value.toFixed(2)}
      </span>
    );
  };

  const calculateNetExposure = (carrier: Carrier) => {
    const customerBal = parseFloat(carrier.customerBalance || "0");
    const supplierBal = parseFloat(carrier.supplierBalance || "0");
    return customerBal - supplierBal;
  };

  const totalCustomerBalance = carriers?.reduce((sum, c) => sum + parseFloat(c.customerBalance || "0"), 0) || 0;
  const totalSupplierBalance = carriers?.reduce((sum, c) => sum + parseFloat(c.supplierBalance || "0"), 0) || 0;
  const totalNetExposure = totalCustomerBalance - totalSupplierBalance;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Carrier Balances</h1>
          <p className="text-muted-foreground">View customer and supplier balances across all carriers</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh">
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Customer Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalCustomerBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalCustomerBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Amount owed by customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              Total Supplier Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalSupplierBalance <= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalSupplierBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Amount owed to suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Net Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalNetExposure >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalNetExposure.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Customer balance minus supplier balance</p>
          </CardContent>
        </Card>
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
                    <TableHead>Carrier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Customer Balance</TableHead>
                    <TableHead className="text-right">Customer Limit</TableHead>
                    <TableHead className="text-right">Supplier Balance</TableHead>
                    <TableHead className="text-right">Net Exposure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((carrier) => (
                    <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/softswitch/carriers/${carrier.code || carrier.id}`} className="text-primary hover:underline">
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
                      <TableCell className="text-right">
                        {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") 
                          ? formatBalance(carrier.customerBalance, true) 
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") 
                          ? (carrier.customerCreditLimitUnlimited 
                              ? "Unlimited" 
                              : parseFloat(carrier.customerCreditLimit || "0").toFixed(2))
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") 
                          ? formatBalance(carrier.supplierBalance, false)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {carrier.partnerType === "bilateral" ? (
                          <span className={`font-mono font-medium ${calculateNetExposure(carrier) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {calculateNetExposure(carrier).toFixed(2)}
                          </span>
                        ) : "-"}
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
              <h3 className="font-medium mb-1">No carriers found</h3>
              <p className="text-sm text-muted-foreground">Add carriers to view their balances</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TwentyFourHourSpendPage() {
  const { toast } = useToast();
  
  const { data: carriers, isLoading, isFetching, refetch } = useQuery<Carrier[]>({
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
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(carriers || []);

  const resetSpendMutation = useMutation({
    mutationFn: async ({ carrierId, direction }: { carrierId: string; direction: "customer" | "supplier" }) => {
      const res = await apiRequest("POST", `/api/carriers/${carrierId}/reset-spend`, { direction });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "24 hour spend reset successfully" });
    },
    onError: () => {
      toast({ title: "Failed to reset spend", variant: "destructive" });
    },
  });

  const formatSpend = (spend: string | null | undefined, limit: string | null | undefined) => {
    const spendValue = parseFloat(spend || "0");
    const limitValue = parseFloat(limit || "0");
    const isOverLimit = limitValue > 0 && spendValue >= limitValue;
    
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className={`font-mono font-medium ${isOverLimit ? "text-red-600" : ""}`}>
          {spendValue.toFixed(2)}
        </span>
        {isOverLimit && <Badge variant="destructive" className="text-xs">Over Limit</Badge>}
      </div>
    );
  };

  const total24hCustomerSpend = carriers?.reduce((sum, c) => sum + parseFloat(c.customer24HrSpend || "0"), 0) || 0;
  const total24hSupplierSpend = carriers?.reduce((sum, c) => sum + parseFloat(c.supplier24HrSpend || "0"), 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">24 Hour Spend</h1>
          <p className="text-muted-foreground">Monitor and manage 24-hour spending limits across carriers</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh">
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Customer 24h Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-600">
              ${total24hCustomerSpend.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Cumulative customer spending in last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              Total Supplier 24h Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600">
              ${total24hSupplierSpend.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Cumulative supplier spending in last 24 hours</p>
          </CardContent>
        </Card>
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
                    <TableHead>Carrier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Customer 24h Spend</TableHead>
                    <TableHead className="text-right">Customer Limit</TableHead>
                    <TableHead className="text-center">Customer Reset</TableHead>
                    <TableHead className="text-right">Supplier 24h Spend</TableHead>
                    <TableHead className="text-right">Supplier Limit</TableHead>
                    <TableHead className="text-center">Supplier Reset</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((carrier) => (
                    <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/softswitch/carriers/${carrier.code || carrier.id}`} className="text-primary hover:underline">
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
                      <TableCell className="text-right">
                        {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") 
                          ? formatSpend(carrier.customer24HrSpend, carrier.customer24HrSpendLimit) 
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") 
                          ? (parseFloat(carrier.customer24HrSpendLimit || "0") === 0 
                              ? "No Limit" 
                              : parseFloat(carrier.customer24HrSpendLimit || "0").toFixed(2))
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") ? (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => resetSpendMutation.mutate({ carrierId: carrier.id, direction: "customer" })}
                            disabled={resetSpendMutation.isPending}
                            data-testid={`button-reset-customer-${carrier.id}`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") 
                          ? formatSpend(carrier.supplier24HrSpend, carrier.supplier24HrSpendLimit)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") 
                          ? (parseFloat(carrier.supplier24HrSpendLimit || "0") === 0 
                              ? "No Limit" 
                              : parseFloat(carrier.supplier24HrSpendLimit || "0").toFixed(2))
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") ? (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => resetSpendMutation.mutate({ carrierId: carrier.id, direction: "supplier" })}
                            disabled={resetSpendMutation.isPending}
                            data-testid={`button-reset-supplier-${carrier.id}`}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        ) : "-"}
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
              <h3 className="font-medium mb-1">No carriers found</h3>
              <p className="text-sm text-muted-foreground">Add carriers to view their spending</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BalanceTotalsPage() {
  const { data: carriers, isLoading, isFetching, refetch } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
  });

  const groupByCurrency = () => {
    if (!carriers || !currencies) return [];
    
    const groups: Record<string, {
      currency: typeof currencies[0];
      customerBalance: number;
      supplierBalance: number;
      netExposure: number;
      customer24hSpend: number;
      supplier24hSpend: number;
      carrierCount: number;
    }> = {};

    carriers.forEach(carrier => {
      const currencyId = carrier.primaryCurrencyId || "unknown";
      if (!groups[currencyId]) {
        const currency = currencies.find(c => c.id === currencyId);
        groups[currencyId] = {
          currency: currency || { id: currencyId, code: "USD", symbol: "$", name: "Unknown" } as typeof currencies[0],
          customerBalance: 0,
          supplierBalance: 0,
          netExposure: 0,
          customer24hSpend: 0,
          supplier24hSpend: 0,
          carrierCount: 0,
        };
      }
      
      groups[currencyId].customerBalance += parseFloat(carrier.customerBalance || "0");
      groups[currencyId].supplierBalance += parseFloat(carrier.supplierBalance || "0");
      groups[currencyId].customer24hSpend += parseFloat(carrier.customer24HrSpend || "0");
      groups[currencyId].supplier24hSpend += parseFloat(carrier.supplier24HrSpend || "0");
      groups[currencyId].carrierCount += 1;
    });

    Object.values(groups).forEach(g => {
      g.netExposure = g.customerBalance - g.supplierBalance;
    });

    return Object.values(groups);
  };

  const currencyGroups = groupByCurrency();

  const totalCustomerBalance = currencyGroups.reduce((sum, g) => sum + g.customerBalance, 0);
  const totalSupplierBalance = currencyGroups.reduce((sum, g) => sum + g.supplierBalance, 0);
  const totalNetExposure = totalCustomerBalance - totalSupplierBalance;
  const totalCarriers = carriers?.length || 0;
  const activeCarriers = carriers?.filter(c => c.status === "active").length || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Balance & Totals</h1>
          <p className="text-muted-foreground">Aggregated balance summary across all carriers and currencies</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh">
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Carriers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCarriers}</div>
            <p className="text-xs text-muted-foreground">{activeCarriers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Customer Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalCustomerBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalCustomerBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Amount receivable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              Supplier Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalSupplierBalance <= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalSupplierBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Amount payable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Net Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totalNetExposure >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalNetExposure.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Overall exposure</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Balance by Currency</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : currencyGroups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Carriers</TableHead>
                  <TableHead className="text-right">Customer Balance</TableHead>
                  <TableHead className="text-right">Supplier Balance</TableHead>
                  <TableHead className="text-right">Net Exposure</TableHead>
                  <TableHead className="text-right">Customer 24h Spend</TableHead>
                  <TableHead className="text-right">Supplier 24h Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencyGroups.map((group) => (
                  <TableRow key={group.currency.id} data-testid={`row-currency-${group.currency.code}`}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{group.currency.code}</Badge>
                      <span className="ml-2 text-muted-foreground">{group.currency.name}</span>
                    </TableCell>
                    <TableCell className="text-right">{group.carrierCount}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-medium ${group.customerBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {group.currency.symbol}{group.customerBalance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-medium ${group.supplierBalance <= 0 ? "text-green-600" : "text-red-600"}`}>
                        {group.currency.symbol}{group.supplierBalance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-medium ${group.netExposure >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {group.currency.symbol}{group.netExposure.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {group.currency.symbol}{group.customer24hSpend.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {group.currency.symbol}{group.supplier24hSpend.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No data available</h3>
              <p className="text-sm text-muted-foreground">Add carriers to see balance totals</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
