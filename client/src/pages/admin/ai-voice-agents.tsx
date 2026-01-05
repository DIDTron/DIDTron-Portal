import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus, Pencil, Trash2, Bot, Phone, PhoneOutgoing, PhoneIncoming,
  Play, Pause, Settings2, Mic, MessageSquare, Zap, ArrowRight
} from "lucide-react";
import type { AiVoiceAgent, Customer } from "@shared/schema";

type AgentFormData = {
  customerId: string;
  name: string;
  description: string;
  type: string;
  voiceId: string;
  voiceProvider: string;
  systemPrompt: string;
  greetingMessage: string;
  fallbackMessage: string;
  maxCallDuration: number;
  status: string;
  webhookUrl: string;
};

const defaultForm: AgentFormData = {
  customerId: "",
  name: "",
  description: "",
  type: "inbound",
  voiceId: "alloy",
  voiceProvider: "openai",
  systemPrompt: "",
  greetingMessage: "Hello! How can I help you today?",
  fallbackMessage: "I'm sorry, I didn't quite catch that. Could you please repeat?",
  maxCallDuration: 600,
  status: "draft",
  webhookUrl: "",
};

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy", provider: "openai" },
  { value: "echo", label: "Echo", provider: "openai" },
  { value: "fable", label: "Fable", provider: "openai" },
  { value: "onyx", label: "Onyx", provider: "openai" },
  { value: "nova", label: "Nova", provider: "openai" },
  { value: "shimmer", label: "Shimmer", provider: "openai" },
];

function getStatusBadge(status: string | null) {
  switch (status) {
    case "active":
      return <Badge variant="default">Active</Badge>;
    case "paused":
      return <Badge variant="secondary">Paused</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

function getTypeBadge(type: string | null) {
  switch (type) {
    case "inbound":
      return <Badge variant="secondary"><PhoneIncoming className="h-3 w-3 mr-1" />Inbound</Badge>;
    case "outbound":
      return <Badge variant="secondary"><PhoneOutgoing className="h-3 w-3 mr-1" />Outbound</Badge>;
    default:
      return <Badge variant="outline">{type || "Unknown"}</Badge>;
  }
}

export default function AiVoiceAgentsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AiVoiceAgent | null>(null);
  const [form, setForm] = useState<AgentFormData>(defaultForm);
  const [activeTab, setActiveTab] = useState("general");

  const { data: agents = [], isLoading: agentsLoading } = useQuery<AiVoiceAgent[]>({
    queryKey: ["/api/ai-voice/agents"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const res = await apiRequest("POST", "/api/ai-voice/agents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-voice/agents"] });
      toast({ title: "AI Voice Agent created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create agent", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AgentFormData> }) => {
      const res = await apiRequest("PATCH", `/api/ai-voice/agents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-voice/agents"] });
      toast({ title: "AI Voice Agent updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update agent", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ai-voice/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-voice/agents"] });
      toast({ title: "AI Voice Agent deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete agent", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingAgent(null);
    setIsOpen(false);
    setActiveTab("general");
  };

  const handleEdit = (agent: AiVoiceAgent) => {
    setEditingAgent(agent);
    setForm({
      customerId: agent.customerId,
      name: agent.name,
      description: agent.description || "",
      type: agent.type || "inbound",
      voiceId: agent.voiceId || "alloy",
      voiceProvider: agent.voiceProvider || "openai",
      systemPrompt: agent.systemPrompt || "",
      greetingMessage: agent.greetingMessage || "",
      fallbackMessage: agent.fallbackMessage || "",
      maxCallDuration: agent.maxCallDuration || 600,
      status: agent.status || "draft",
      webhookUrl: agent.webhookUrl || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.customerId || !form.name) {
      toast({ title: "Customer and name are required", variant: "destructive" });
      return;
    }
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this AI Voice Agent?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (agent: AiVoiceAgent) => {
    const newStatus = agent.status === "active" ? "paused" : "active";
    updateMutation.mutate({ id: agent.id, data: { status: newStatus } });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || "Unknown";
  };

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading AI Voice Agents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">AI Voice Agents</h1>
          <p className="text-muted-foreground">Manage AI-powered voice assistants at $0.10/min</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-agent" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAgent ? "Edit AI Voice Agent" : "Create AI Voice Agent"}</DialogTitle>
              <DialogDescription>Configure your AI-powered voice assistant</DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="voice">Voice & Prompts</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                    <SelectTrigger data-testid="select-customer">
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
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    data-testid="input-agent-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Customer Support Agent"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-agent-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what this agent does..."
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Agent Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="voice" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voiceProvider">Voice Provider</Label>
                    <Select value={form.voiceProvider} onValueChange={(v) => setForm({ ...form, voiceProvider: v })}>
                      <SelectTrigger data-testid="select-voice-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="voiceId">Voice</Label>
                    <Select value={form.voiceId} onValueChange={(v) => setForm({ ...form, voiceId: v })}>
                      <SelectTrigger data-testid="select-voice-id">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_OPTIONS.filter(v => v.provider === form.voiceProvider).map(v => (
                          <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    data-testid="input-system-prompt"
                    value={form.systemPrompt}
                    onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                    placeholder="You are a helpful customer support agent for..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define the AI's personality, knowledge, and behavior
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="greetingMessage">Greeting Message</Label>
                  <Textarea
                    id="greetingMessage"
                    data-testid="input-greeting-message"
                    value={form.greetingMessage}
                    onChange={(e) => setForm({ ...form, greetingMessage: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fallbackMessage">Fallback Message</Label>
                  <Textarea
                    id="fallbackMessage"
                    data-testid="input-fallback-message"
                    value={form.fallbackMessage}
                    onChange={(e) => setForm({ ...form, fallbackMessage: e.target.value })}
                    placeholder="I'm sorry, I didn't understand. Could you please repeat?"
                    rows={2}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCallDuration">Max Call Duration (seconds)</Label>
                  <Input
                    id="maxCallDuration"
                    type="number"
                    data-testid="input-max-duration"
                    value={form.maxCallDuration}
                    onChange={(e) => setForm({ ...form, maxCallDuration: parseInt(e.target.value) || 600 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum allowed call duration before auto-disconnect
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    data-testid="input-webhook-url"
                    value={form.webhookUrl}
                    onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                    placeholder="https://your-server.com/webhook"
                  />
                  <p className="text-xs text-muted-foreground">
                    Receive call events and transcripts via webhook
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                data-testid="button-save-agent"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Agent"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-agents">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-agents">
              {agents.filter(a => a.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Inbound</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-inbound-agents">
              {agents.filter(a => a.type === "inbound").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Outbound</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-outbound-agents">
              {agents.filter(a => a.type === "outbound").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Voice Agents</CardTitle>
          <CardDescription>Configure and manage AI-powered voice assistants</CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No AI Voice Agents</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI-powered voice assistant
              </p>
              <Button data-testid="button-create-first-agent" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Voice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map(agent => (
                  <TableRow key={agent.id} data-testid={`row-agent-${agent.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          {agent.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {agent.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCustomerName(agent.customerId)}</TableCell>
                    <TableCell>{getTypeBadge(agent.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mic className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm capitalize">{agent.voiceId}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-toggle-${agent.id}`}
                          onClick={() => handleToggleStatus(agent)}
                          title={agent.status === "active" ? "Pause" : "Activate"}
                        >
                          {agent.status === "active" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-edit-${agent.id}`}
                          onClick={() => handleEdit(agent)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-delete-${agent.id}`}
                          onClick={() => handleDelete(agent.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
