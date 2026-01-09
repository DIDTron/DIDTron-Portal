import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Search, RefreshCw, Plus, FileText, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const mockCreditNotes = [
  {
    id: "1",
    creditNoteNumber: "CRN-2026-0001",
    customerId: "1",
    customerName: "Acme Corp",
    invoiceNumber: "INV-2026-0001",
    reason: "QoS threshold breach",
    amount: "600.00",
    tax: "180.00",
    total: "780.00",
    currency: "USD",
    status: "issued",
    issueDate: "2026-01-15",
  },
];

export default function CreditNotesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = mockCreditNotes.filter((note) =>
    note.creditNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { paginatedItems, ...paginationProps } = useDataTablePagination(filteredNotes);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Credit Notes</h1>
          <p className="text-muted-foreground">Issue and manage credit notes for invoice adjustments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button data-testid="button-create">
            <Plus className="h-4 w-4 mr-2" />
            Issue Credit Note
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search credit notes..."
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
                <TableHead>Credit Note #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Linked Invoice</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No credit notes found</p>
                    <p className="text-sm">Credit notes will appear here once issued</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((note: typeof mockCreditNotes[0]) => (
                  <TableRow key={note.id} data-testid={`row-credit-note-${note.id}`}>
                    <TableCell className="font-mono">{note.creditNoteNumber}</TableCell>
                    <TableCell>{note.customerName}</TableCell>
                    <TableCell className="font-mono">{note.invoiceNumber}</TableCell>
                    <TableCell>{note.reason}</TableCell>
                    <TableCell className="text-right font-mono">
                      {note.currency} {note.total}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{note.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" data-testid={`button-view-${note.id}`}>
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
