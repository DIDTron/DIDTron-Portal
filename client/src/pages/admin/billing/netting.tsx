import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Plus, FileText, Eye, CheckCircle, Clock, Link2 } from "lucide-react";

const mockNettingRequests = [
  {
    id: "1",
    requestNumber: "NR-2026-0001",
    counterparty: "IP Networks Ltd",
    customerInvoices: [
      { number: "CI100001233", date: "01/01/2026", amount: 41000.00, netted: 41000.00 },
      { number: "CI100001234", date: "01/02/2026", amount: 500.00, netted: 500.00 },
    ],
    supplierInvoices: [
      { number: "S100001236", date: "01/01/2026", amount: 30000.00, netted: 30000.00 },
      { number: "S100001241", date: "01/02/2026", amount: 19950.00, netted: 11500.00 },
    ],
    proposedNetting: 41500.00,
    amountOwedByThem: 0,
    amountOwedToThem: 8450.00,
    status: "pending",
    createdAt: "2026-01-15",
  },
];

export default function NettingPage() {
  const { paginatedItems, ...paginationProps } = useDataTablePagination(mockNettingRequests);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Netting</h1>
          <p className="text-muted-foreground">Manage bilateral netting requests with carriers</p>
        </div>
        <Button data-testid="button-create">
          <Plus className="h-4 w-4 mr-2" />
          New Netting Request
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Awaiting counterparty response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Netted (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Completed netting this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Counterparties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Carriers with bilateral agreements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Netting Requests</CardTitle>
          <CardDescription>Customer and supplier invoice offsetting</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request #</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead className="text-right">Customer Invoices</TableHead>
                <TableHead className="text-right">Supplier Invoices</TableHead>
                <TableHead className="text-right">Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No netting requests found</p>
                    <p className="text-sm">Create a netting request to offset bilateral invoices</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((request: typeof mockNettingRequests[0]) => (
                  <TableRow key={request.id} data-testid={`row-netting-${request.id}`}>
                    <TableCell className="font-mono">{request.requestNumber}</TableCell>
                    <TableCell>{request.counterparty}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono">${request.customerInvoices.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{request.customerInvoices.length} invoices</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono">${request.supplierInvoices.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{request.supplierInvoices.length} invoices</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono font-bold">${request.proposedNetting.toFixed(2)}</div>
                      {request.amountOwedToThem > 0 && (
                        <div className="text-xs text-red-500">We owe: ${request.amountOwedToThem.toFixed(2)}</div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" data-testid={`button-view-${request.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <DataTableFooter {...paginationProps} />
        </CardContent>
      </Card>
    </div>
  );
}
