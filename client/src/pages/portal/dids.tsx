import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Search, Plus, Settings, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface CustomerDID {
  id: string;
  number: string;
  country: string;
  type: "local" | "tollfree" | "mobile";
  monthlyRate: number;
  destination: string;
  status: "active" | "pending";
  renewalDate: Date;
}

export default function DIDsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const dids: CustomerDID[] = [
    { id: "1", number: "+1 (555) 123-4567", country: "United States", type: "local", monthlyRate: 1.50, destination: "SIP/trunk1", status: "active", renewalDate: new Date(Date.now() + 2592000000) },
    { id: "2", number: "+1 (800) 555-0199", country: "United States", type: "tollfree", monthlyRate: 4.00, destination: "SIP/ivr", status: "active", renewalDate: new Date(Date.now() + 1728000000) },
    { id: "3", number: "+44 20 7946 0958", country: "United Kingdom", type: "local", monthlyRate: 2.50, destination: "SIP/uk-office", status: "active", renewalDate: new Date(Date.now() + 2160000000) },
    { id: "4", number: "+49 30 12345678", country: "Germany", type: "local", monthlyRate: 2.00, destination: "-", status: "pending", renewalDate: new Date(Date.now() + 2592000000) },
  ];

  const filteredDIDs = dids.filter(did =>
    !searchTerm || 
    did.number.includes(searchTerm) ||
    did.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My DIDs</h1>
          <p className="text-muted-foreground">Manage your phone numbers</p>
        </div>
        <Link href="/portal/dids/search">
          <Button data-testid="button-buy-did">
            <Plus className="h-4 w-4 mr-2" />
            Buy New DID
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dids.length}</p>
                <p className="text-sm text-muted-foreground">Total DIDs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dids.filter(d => d.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-muted">
                <Globe className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dids.filter(d => d.status === "pending").length}</p>
                <p className="text-sm text-muted-foreground">Pending KYC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-accent">
                <Globe className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">${dids.reduce((acc, d) => acc + d.monthlyRate, 0).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>DID Inventory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search DIDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-dids"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDIDs.map((did) => (
                <TableRow key={did.id} data-testid={`row-did-${did.id}`}>
                  <TableCell className="font-mono">{did.number}</TableCell>
                  <TableCell>{did.country}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{did.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{did.destination}</TableCell>
                  <TableCell>${did.monthlyRate.toFixed(2)}</TableCell>
                  <TableCell className="text-sm">{formatDate(did.renewalDate)}</TableCell>
                  <TableCell>
                    <Badge variant={did.status === "active" ? "default" : "secondary"}>
                      {did.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
