import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, AlertTriangle, CheckCircle, XCircle, FileText, RefreshCw, Search } from "lucide-react";

const mockSupplierInvoices = [
  {
    id: "1",
    supplierName: "Voice Blow Technologies",
    invoiceNumber: "VB-2026-0781",
    periodStart: "29/12/2025",
    periodEnd: "04/01/2026",
    supplierTotal: 639.83,
    ourTotal: 635.50,
    variance: 4.33,
    variancePct: 0.68,
    status: "pending",
    currency: "USD",
  },
];

const mockReconciliationRows = [
  { destination: "Bangladesh Mobile", supplierMinutes: 24348.9, supplierAmount: 214.27, ourMinutes: 24348.9, ourAmount: 214.27, variance: 0 },
  { destination: "Egypt Mobile Etisalat", supplierMinutes: 1825.1, supplierAmount: 178.40, ourMinutes: 1820.5, ourAmount: 177.95, variance: 0.45 },
  { destination: "Morocco Mobile Wana", supplierMinutes: 144.9, supplierAmount: 79.69, ourMinutes: 144.9, ourAmount: 79.69, variance: 0 },
  { destination: "Egypt Mobile Vodafone", supplierMinutes: 412.7, supplierAmount: 56.95, ourMinutes: 410.2, ourAmount: 56.60, variance: 0.35 },
];

export default function SupplierAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("invoices");

  const { paginatedItems, ...paginationProps } = useDataTablePagination(mockSupplierInvoices);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><AlertTriangle className="h-3 w-3" />Pending</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case "disputed":
        return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600"><AlertTriangle className="h-3 w-3" />Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Supplier Invoice Audit</h1>
          <p className="text-muted-foreground">Import, reconcile, and manage supplier invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button data-testid="button-import">
            <Upload className="h-4 w-4 mr-2" />
            Import Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disputed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$4.33</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accepted (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices" data-testid="tab-invoices">Supplier Invoices</TabsTrigger>
          <TabsTrigger value="reconciliation" data-testid="tab-reconciliation">Reconciliation View</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search supplier invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Their Total</TableHead>
                    <TableHead className="text-right">Our Total</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No supplier invoices found</p>
                        <p className="text-sm">Import a supplier invoice to begin reconciliation</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((invoice: typeof mockSupplierInvoices[0]) => (
                      <TableRow key={invoice.id} data-testid={`row-supplier-${invoice.id}`}>
                        <TableCell className="font-medium">{invoice.supplierName}</TableCell>
                        <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.periodStart} - {invoice.periodEnd}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${invoice.supplierTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${invoice.ourTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={invoice.variance > 0 ? "text-red-600" : "text-green-600"}>
                            ${invoice.variance.toFixed(2)} ({invoice.variancePct.toFixed(2)}%)
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="sm" data-testid={`button-accept-${invoice.id}`}>
                              Accept
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-dispute-${invoice.id}`}>
                              Dispute
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <DataTableFooter {...paginationProps} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Destination Comparison</CardTitle>
              <CardDescription>Voice Blow Technologies - VB-2026-0781</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Supplier Mins</TableHead>
                    <TableHead className="text-right">Supplier Amount</TableHead>
                    <TableHead className="text-right">Our Mins</TableHead>
                    <TableHead className="text-right">Our Amount</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReconciliationRows.map((row, idx) => {
                    const hasVariance = row.variance > 0;
                    return (
                      <TableRow 
                        key={idx} 
                        className={hasVariance ? "bg-destructive/10" : ""}
                        data-testid={`row-reconcile-${idx}`}
                      >
                        <TableCell className="font-medium">{row.destination}</TableCell>
                        <TableCell className="text-right font-mono">{row.supplierMinutes.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono">${row.supplierAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{row.ourMinutes.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono">${row.ourAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={hasVariance ? "text-red-600" : "text-green-600"}>
                            ${row.variance.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {hasVariance ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />Variance
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />Match
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
