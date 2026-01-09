import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, FileText, CreditCard, Users, TrendingUp, 
  AlertTriangle, Clock, RefreshCw, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer, Invoice, Payment } from "@shared/schema";

export default function BillingOverviewPage() {
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const isLoading = customersLoading || invoicesLoading || paymentsLoading;

  const prepaidCustomers = customers?.filter(c => c.billingType === "prepaid") || [];
  const postpaidCustomers = customers?.filter(c => c.billingType === "postpaid") || [];
  
  const totalBalance = customers?.reduce((sum, c) => sum + parseFloat(c.balance || "0"), 0) || 0;
  const pendingInvoices = invoices?.filter(i => i.status === "pending") || [];
  const totalPending = pendingInvoices.reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Billing Overview</h1>
          <p className="text-muted-foreground">Manage customer billing, invoices, and financial operations</p>
        </div>
        <Button variant="outline" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-balance">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Customer Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Across {customers?.length || 0} customers
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-pending-invoices">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingInvoices.length} invoices awaiting payment
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-prepaid-customers">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Prepaid Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{prepaidCustomers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active prepaid accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-postpaid-customers">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Postpaid Customers</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{postpaidCustomers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active postpaid accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common billing operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" data-testid="button-generate-invoices">
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoices
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-send-statements">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Send Statements
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-import-cdrs">
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Import CDRs
            </Button>
            <Button variant="outline" className="justify-start" data-testid="button-supplier-audit">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Supplier Audit
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-actions">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Overdue invoices</span>
              </div>
              <Badge variant="outline">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Low balance alerts</span>
              </div>
              <Badge variant="outline">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Pending postpaid approvals</span>
              </div>
              <Badge variant="outline">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Draft invoices</span>
              </div>
              <Badge variant="outline">0</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
