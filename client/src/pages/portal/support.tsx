import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import type { Ticket } from "@shared/schema";
import { 
  MessageSquare, Plus, Search, Clock, Check, 
  AlertCircle, HelpCircle, Loader2
} from "lucide-react";
import { Link } from "wouter";

export default function SupportPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
  });

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/my/tickets"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticket: typeof newTicket) => {
      return apiRequest("POST", "/api/my/tickets", ticket);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/tickets"] });
      toast({ title: "Ticket created", description: "Your support ticket has been submitted." });
      setIsDialogOpen(false);
      setNewTicket({ subject: "", category: "general", priority: "medium", description: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create ticket.", variant: "destructive" });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": 
      case "closed": 
        return <Check className="h-4 w-4 text-primary" />;
      case "pending": 
      case "in_progress":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: 
        return <AlertCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "resolved":
      case "closed": 
        return "default";
      default: 
        return "secondary";
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" => {
    switch (priority) {
      case "high":
      case "urgent": 
        return "destructive";
      default: 
        return "secondary";
    }
  };

  const formatTimeAgo = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredTickets = tickets.filter(t => 
    !searchTerm || 
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCount = tickets.filter(t => t.status === "open").length;
  const pendingCount = tickets.filter(t => t.status === "pending" || t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  const handleSubmit = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({ title: "Error", description: "Subject and description are required.", variant: "destructive" });
      return;
    }
    createTicketMutation.mutate(newTicket);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Support</h1>
          <p className="text-muted-foreground">Get help with your account</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-ticket">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  data-testid="input-ticket-subject"
                  placeholder="Brief summary of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="input-ticket-description"
                  placeholder="Describe your issue in detail..."
                  className="min-h-[120px]"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  data-testid="button-submit-ticket"
                  onClick={handleSubmit}
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-open-count">{openCount}</p>
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
                <p className="text-2xl font-bold" data-testid="text-pending-count">{pendingCount}</p>
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
                <p className="text-2xl font-bold" data-testid="text-resolved-count">{resolvedCount}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No support tickets yet</p>
              <p className="text-sm">Click "New Ticket" to create your first request</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer hover-elevate" data-testid={`row-ticket-${ticket.id}`}>
                    <TableCell className="font-mono text-sm">{ticket.ticketNumber}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.category || "General"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(ticket.priority || "medium")}>
                        {ticket.priority || "medium"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status || "open")}
                        <Badge variant={getStatusVariant(ticket.status || "open")}>
                          {(ticket.status || "open").replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimeAgo(ticket.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Knowledge Base</span>
            </Button>
            <Link href="/docs">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <HelpCircle className="h-5 w-5" />
                <span>Documentation</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full h-20 flex-col gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Create Ticket</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
