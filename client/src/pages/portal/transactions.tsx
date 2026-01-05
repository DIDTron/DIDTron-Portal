import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowUpRight, ArrowDownRight, Search, Download, 
  Calendar, Filter
} from "lucide-react";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  category: string;
  description: string;
  amount: number;
  balance: number;
  timestamp: Date;
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const transactions: Transaction[] = [
    { id: "1", type: "credit", category: "Top-up", description: "Balance Top-up via Credit Card", amount: 100, balance: 1245.50, timestamp: new Date(Date.now() - 86400000) },
    { id: "2", type: "debit", category: "Voice", description: "Voice Usage - Jan 4, 2026", amount: 24.56, balance: 1145.50, timestamp: new Date(Date.now() - 172800000) },
    { id: "3", type: "debit", category: "DID", description: "DID Renewal - +1 555 123 4567", amount: 1.50, balance: 1170.06, timestamp: new Date(Date.now() - 259200000) },
    { id: "4", type: "debit", category: "Voice", description: "Voice Usage - Jan 3, 2026", amount: 18.32, balance: 1171.56, timestamp: new Date(Date.now() - 345600000) },
    { id: "5", type: "credit", category: "Top-up", description: "Balance Top-up via PayPal", amount: 250, balance: 1189.88, timestamp: new Date(Date.now() - 604800000) },
  ];

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesSearch = !searchTerm || 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View your complete transaction history</p>
        </div>
        <Button variant="outline" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32" data-testid="select-type">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id} data-testid={`row-tx-${tx.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {tx.timestamp.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.type === "credit" ? (
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.category}</Badge>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={`font-mono ${tx.type === "credit" ? "text-primary" : ""}`}>
                    {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono">${tx.balance.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
