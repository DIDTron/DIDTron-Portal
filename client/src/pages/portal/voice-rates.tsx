import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe } from "lucide-react";

interface RateEntry {
  prefix: string;
  destination: string;
  rate: number;
  minDuration: number;
  increment: number;
}

export default function VoiceRatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("premium");

  const rates: RateEntry[] = [
    { prefix: "1", destination: "United States", rate: 0.012, minDuration: 6, increment: 6 },
    { prefix: "1416", destination: "Canada - Toronto", rate: 0.015, minDuration: 6, increment: 6 },
    { prefix: "44", destination: "United Kingdom", rate: 0.018, minDuration: 6, increment: 6 },
    { prefix: "4420", destination: "UK - London", rate: 0.016, minDuration: 6, increment: 6 },
    { prefix: "33", destination: "France", rate: 0.022, minDuration: 6, increment: 6 },
    { prefix: "49", destination: "Germany", rate: 0.019, minDuration: 6, increment: 6 },
    { prefix: "34", destination: "Spain", rate: 0.025, minDuration: 6, increment: 6 },
    { prefix: "39", destination: "Italy", rate: 0.024, minDuration: 6, increment: 6 },
    { prefix: "61", destination: "Australia", rate: 0.028, minDuration: 6, increment: 6 },
    { prefix: "81", destination: "Japan", rate: 0.035, minDuration: 6, increment: 6 },
  ];

  const filteredRates = rates.filter(rate =>
    !searchTerm || 
    rate.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.prefix.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voice Termination Rates</h1>
        <p className="text-muted-foreground">View your available rates by destination</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Rate Sheet</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by country or prefix..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-rates"
                />
              </div>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-40" data-testid="select-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefix</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Rate (per min)</TableHead>
                <TableHead>Min Duration</TableHead>
                <TableHead>Increment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((rate) => (
                <TableRow key={rate.prefix} data-testid={`row-rate-${rate.prefix}`}>
                  <TableCell>
                    <Badge variant="outline">{rate.prefix}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {rate.destination}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">${rate.rate.toFixed(4)}</TableCell>
                  <TableCell>{rate.minDuration}s</TableCell>
                  <TableCell>{rate.increment}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Your Voice Tier</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Premium</Badge>
                <span className="text-sm">Best quality routes</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Base Rate</p>
              <p className="font-bold text-lg mt-1">$0.012/min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing Increment</p>
              <p className="font-medium mt-1">6 second increments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
