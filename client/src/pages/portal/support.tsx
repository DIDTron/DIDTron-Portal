import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  MessageSquare, Plus, Search, Clock, Check, 
  AlertCircle, HelpCircle
} from "lucide-react";
import { Link } from "wouter";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  lastUpdated: Date;
}

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const tickets: SupportTicket[] = [
    { id: "TKT-001", subject: "Route quality issues to Germany", category: "Technical", status: "pending", priority: "high", createdAt: new Date(Date.now() - 86400000), lastUpdated: new Date(Date.now() - 3600000) },
    { id: "TKT-002", subject: "Invoice discrepancy for December", category: "Billing", status: "resolved", priority: "medium", createdAt: new Date(Date.now() - 604800000), lastUpdated: new Date(Date.now() - 172800000) },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <Check className="h-4 w-4 text-primary" />;
      case "pending": return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "resolved": return "default";
      case "pending": return "secondary";
      default: return "secondary";
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "secondary";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground">Get help with your account</p>
        </div>
        <Link href="/portal/support/new">
          <Button data-testid="button-new-ticket">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === "open").length}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === "pending").length}</p>
                <p className="text-sm text-muted-foreground">Awaiting Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === "resolved").length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>My Tickets</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="cursor-pointer hover-elevate" data-testid={`row-ticket-${ticket.id}`}>
                  <TableCell className="font-mono">{ticket.id}</TableCell>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <Badge variant={getStatusVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTimeAgo(ticket.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/portal/support/kb">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Knowledge Base</span>
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <HelpCircle className="h-5 w-5" />
                <span>Documentation</span>
              </Button>
            </Link>
            <Link href="/portal/support/new">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Plus className="h-5 w-5" />
                <span>Create Ticket</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
