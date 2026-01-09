import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Search, RefreshCw, FileText, Download, Send, CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { Customer } from "@shared/schema";

export default function SOAPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [periodPreset, setPeriodPreset] = useState("this_month");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const handlePresetChange = (value: string) => {
    setPeriodPreset(value);
    const now = new Date();
    
    switch (value) {
      case "this_month":
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case "last_month":
        const lastMonth = subMonths(now, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case "last_3_months":
        setStartDate(startOfMonth(subMonths(now, 2)));
        setEndDate(endOfMonth(now));
        break;
    }
  };

  const mockSOAEntries = [
    { date: "01/01/2026", type: "opening", description: "Opening Balance", reference: "-", debit: null, credit: null, balance: 17500.00 },
    { date: "01/01/2026", type: "invoice", description: "Invoice C10000190 - 01/12/2025 to 31/12/2025", reference: "C10000190", debit: 12000.00, credit: null, balance: 29500.00 },
    { date: "04/01/2026", type: "payment", description: "Invoice Settlement - C10000189", reference: "PAY-001", debit: null, credit: 9000.00, balance: 20500.00 },
    { date: "15/01/2026", type: "payment", description: "Invoice Settlement - C10000190", reference: "PAY-002", debit: null, credit: 10000.00, balance: 10500.00 },
    { date: "17/01/2026", type: "credit_note", description: "Dispute Settlement - C10000191", reference: "CRN-001", debit: null, credit: 1000.00, balance: 9500.00 },
  ];

  const { paginatedItems, ...paginationProps } = useDataTablePagination(mockSOAEntries);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Statement of Account</h1>
          <p className="text-muted-foreground">Generate and view customer account statements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-download">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button data-testid="button-send">
            <Send className="h-4 w-4 mr-2" />
            Send to Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Statement</CardTitle>
          <CardDescription>Select customer and date range for the statement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger data-testid="select-customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.companyName} ({customer.accountNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={periodPreset} onValueChange={handlePresetChange}>
                <SelectTrigger data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodPreset === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-start-date">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(startDate, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-end-date">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(endDate, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>

          <Button data-testid="button-generate">
            <FileText className="h-4 w-4 mr-2" />
            Generate Statement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Statement Preview</CardTitle>
              <CardDescription>
                Period: {format(startDate, "dd/MM/yyyy")} to {format(endDate, "dd/MM/yyyy")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Opening Balance</div>
                <div className="font-bold">$17,500.00</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Closing Balance</div>
                <div className="font-bold">$9,500.00</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((entry: typeof mockSOAEntries[0], idx: number) => (
                <TableRow key={idx} data-testid={`row-soa-${idx}`}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{entry.type.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="font-mono">{entry.reference}</TableCell>
                  <TableCell className="text-right text-red-600 font-mono">
                    {entry.debit ? `$${entry.debit.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-mono">
                    {entry.credit ? `$${entry.credit.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-bold font-mono">
                    ${entry.balance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataTableFooter {...paginationProps} />
        </CardContent>
      </Card>
    </div>
  );
}
