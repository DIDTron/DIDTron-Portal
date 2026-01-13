import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Ticket, Pencil, Trash2 } from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { Ticket as TicketType, Customer } from "@shared/schema";

type TicketFormData = {
  customerId: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
};

export default function TicketsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [formData, setFormData] = useState<TicketFormData>({
    customerId: "",
    subject: "",
    description: "",
    category: "general",
    priority: "medium",
    status: "open",
  });

  const { data: tickets, isLoading } = useQuery<TicketType[]>({
    queryKey: ["/api/tickets"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(tickets ?? []);

  const createMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const res = await apiRequest("POST", "/api/tickets", {
        ...data,
        customerId: data.customerId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Ticket created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create ticket", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TicketFormData }) => {
      const res = await apiRequest("PATCH", `/api/tickets/${id}`, {
        ...data,
        customerId: data.customerId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Ticket updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update ticket", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({ title: "Ticket deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete ticket", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      subject: "",
      description: "",
      category: "general",
      priority: "medium",
      status: "open",
    });
    setEditingTicket(null);
    setIsOpen(false);
  };

  const handleEdit = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setFormData({
      customerId: ticket.customerId || "",
      subject: ticket.subject,
      description: ticket.description || "",
      category: ticket.category || "general",
      priority: ticket.priority || "medium",
      status: ticket.status || "open",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTicket) {
      updateMutation.mutate({ id: editingTicket.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return "-";
    return customers?.find(c => c.id === customerId)?.companyName || "-";
  };

  const getPriorityBadge = (priority: string | null) => {
    const variants: Record<string, string> = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      urgent: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return variants[priority || "medium"] || variants.medium;
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      waiting: "bg-muted text-muted-foreground",
      resolved: "bg-green-500/10 text-green-500 border-green-500/20",
      closed: "bg-muted text-muted-foreground",
    };
    return variants[status || "open"] || variants.open;
  };

  return (
    <div className="space-y-4" data-testid="tickets-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Support Tickets</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-ticket">
              <Plus className="h-4 w-4 mr-1" />
              Add Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="dialog-ticket-form">
            <DialogHeader>
              <DialogTitle>{editingTicket ? "Edit Ticket" : "Add Ticket"}</DialogTitle>
              <DialogDescription>
                {editingTicket ? "Update ticket details" : "Create a new support ticket"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer (optional)</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(v) => setFormData({ ...formData, customerId: v })}
                  >
                    <SelectTrigger data-testid="select-customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {(customers ?? []).map((cust) => (
                        <SelectItem key={cust.id} value={cust.id}>{cust.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Issue with my account"
                    required
                    data-testid="input-subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the issue..."
                    rows={4}
                    data-testid="input-description"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
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
                      value={formData.priority}
                      onValueChange={(v) => setFormData({ ...formData, priority: v })}
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
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-ticket"
                >
                  {editingTicket ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading tickets...</div>
          ) : !(tickets ?? []).length ? (
            <div className="p-8 text-center text-muted-foreground">
              No tickets found. Create your first support ticket.
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((ticket) => (
                  <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{ticket.ticketNumber}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                    <TableCell>{getCustomerName(ticket.customerId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityBadge(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(ticket)}
                          data-testid={`button-edit-ticket-${ticket.id}`}
                          aria-label="Edit ticket"
                          title="Edit ticket"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(ticket.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-ticket-${ticket.id}`}
                          aria-label="Delete ticket"
                          title="Delete ticket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTableFooter
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
