import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, Pencil, Trash2, Megaphone, Play, Pause, PhoneOutgoing,
  Users, CheckCircle2, Clock, AlertCircle, Loader2
} from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { Customer, AiVoiceAgent } from "@shared/schema";

type Campaign = {
  id: string;
  customerId: string;
  agentId: string | null;
  name: string;
  description: string | null;
  phonebookId: string | null;
  sipTrunkId: string | null;
  status: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  totalContacts: number | null;
  contactsDialed: number | null;
  contactsAnswered: number | null;
  contactsFailed: number | null;
  createdAt: string;
};

type CampaignFormData = {
  customerId: string;
  agentId: string;
  name: string;
  description: string;
  phonebookId: string;
  sipTrunkId: string;
};

const defaultForm: CampaignFormData = {
  customerId: "",
  agentId: "",
  name: "",
  description: "",
  phonebookId: "",
  sipTrunkId: "",
};

function getStatusBadge(status: string | null) {
  switch (status) {
    case "completed":
      return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case "running":
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600"><Play className="h-3 w-3 mr-1" />Running</Badge>;
    case "paused":
      return <Badge variant="outline"><Pause className="h-3 w-3 mr-1" />Paused</Badge>;
    case "scheduled":
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "failed":
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    default:
      return <Badge variant="outline">{status || "Draft"}</Badge>;
  }
}

export default function AiVoiceCampaignsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CampaignFormData>(defaultForm);

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/admin/ai-voice/campaigns"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(campaigns);

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: agents = [] } = useQuery<AiVoiceAgent[]>({
    queryKey: ["/api/admin/ai-voice/agents"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const res = await apiRequest("POST", "/api/admin/ai-voice/campaigns", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/campaigns"] });
      toast({ title: "Campaign created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/ai-voice/campaigns/${id}/start`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/campaigns"] });
      toast({ title: "Campaign started" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to start campaign", description: error.message, variant: "destructive" });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/ai-voice/campaigns/${id}/pause`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/campaigns"] });
      toast({ title: "Campaign paused" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to pause campaign", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ai-voice/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/campaigns"] });
      toast({ title: "Campaign deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (!form.customerId || !form.name) {
      toast({ title: "Customer and name are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || "Unknown";
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return "-";
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || "Unknown";
  };

  const getCampaignProgress = (campaign: Campaign) => {
    if (!campaign.totalContacts || campaign.totalContacts === 0) return 0;
    return Math.round(((campaign.contactsDialed || 0) / campaign.totalContacts) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Outbound Campaigns</h1>
          <p className="text-muted-foreground">Manage AI Voice outbound calling campaigns</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-campaign" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>Configure a new outbound calling campaign</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                  <SelectTrigger data-testid="select-campaign-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent">AI Voice Agent</Label>
                <Select value={form.agentId} onValueChange={(v) => setForm({ ...form, agentId: v })}>
                  <SelectTrigger data-testid="select-campaign-agent">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.filter(a => a.type === "outbound").map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  data-testid="input-campaign-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Q1 Sales Outreach"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="input-campaign-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Campaign goals and notes..."
                  rows={2}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                data-testid="button-save-campaign"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === "running").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Contacts Dialed</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.contactsDialed || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Answered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.contactsAnswered || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Outbound AI Voice calling campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Campaigns</h3>
              <p className="text-muted-foreground mb-4">
                Create your first outbound calling campaign
              </p>
              <Button data-testid="button-create-first-campaign" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map(campaign => (
                  <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Megaphone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {campaign.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCustomerName(campaign.customerId)}</TableCell>
                    <TableCell>{getAgentName(campaign.agentId)}</TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="text-xs text-muted-foreground mb-1">
                          {campaign.contactsDialed || 0}/{campaign.totalContacts || 0}
                        </div>
                        <Progress value={getCampaignProgress(campaign)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {campaign.status === "running" ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Pause"
                            title="Pause"
                            data-testid={`button-pause-${campaign.id}`}
                            onClick={() => pauseMutation.mutate(campaign.id)}
                            disabled={pauseMutation.isPending}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Start"
                            title="Start"
                            data-testid={`button-start-${campaign.id}`}
                            onClick={() => startMutation.mutate(campaign.id)}
                            disabled={startMutation.isPending}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete"
                          title="Delete"
                          data-testid={`button-delete-campaign-${campaign.id}`}
                          onClick={() => {
                            if (confirm("Delete this campaign?")) {
                              deleteMutation.mutate(campaign.id);
                            }
                          }}
                          disabled={campaign.status === "running"}
                        >
                          <Trash2 className="w-4 h-4" />
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
