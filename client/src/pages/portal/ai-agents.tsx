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
  Play, Pause, Settings2, Mic, MessageSquare, Zap
} from "lucide-react";
import type { AiVoiceAgent } from "@shared/schema";

type AgentFormData = {
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

export default function PortalAiAgentsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AiVoiceAgent | null>(null);
  const [form, setForm] = useState<AgentFormData>(defaultForm);
  const [activeTab, setActiveTab] = useState("general");

  const { data: agents = [], isLoading } = useQuery<AiVoiceAgent[]>({
    queryKey: ["/api/my/ai-voice/agents"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const res = await apiRequest("POST", "/api/my/ai-voice/agents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents"] });
      toast({ title: "AI Voice Agent created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create agent", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AgentFormData> }) => {
      const res = await apiRequest("PATCH", `/api/my/ai-voice/agents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents"] });
      toast({ title: "AI Voice Agent updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update agent", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/ai-voice/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents"] });
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
    if (!form.name) {
      toast({ title: "Agent name is required", variant: "destructive" });
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

  const activeAgentsCount = agents.filter(a => a.status === "active").length;
  const totalMinutes = 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading AI Voice Agents...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Voice Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI-powered phone agents</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-agent">
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAgent ? "Edit" : "Create"} AI Voice Agent</DialogTitle>
              <DialogDescription>
                Configure your AI agent's persona, voice, and behavior.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="persona">Persona</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Customer Support Agent"
                    data-testid="input-agent-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the agent's purpose..."
                    data-testid="input-agent-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agent Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger data-testid="select-agent-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound (Answer Calls)</SelectItem>
                        <SelectItem value="outbound">Outbound (Make Calls)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Voice</Label>
                    <Select value={form.voiceId} onValueChange={(v) => setForm({ ...form, voiceId: v })}>
                      <SelectTrigger data-testid="select-voice">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_OPTIONS.map(v => (
                          <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="persona" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={form.systemPrompt}
                    onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                    placeholder="You are a helpful customer service representative..."
                    className="min-h-[120px]"
                    data-testid="input-system-prompt"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greetingMessage">Greeting Message</Label>
                  <Input
                    id="greetingMessage"
                    value={form.greetingMessage}
                    onChange={(e) => setForm({ ...form, greetingMessage: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                    data-testid="input-greeting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fallbackMessage">Fallback Message</Label>
                  <Input
                    id="fallbackMessage"
                    value={form.fallbackMessage}
                    onChange={(e) => setForm({ ...form, fallbackMessage: e.target.value })}
                    placeholder="I'm sorry, I didn't quite catch that..."
                    data-testid="input-fallback"
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCallDuration">Max Call Duration (seconds)</Label>
                  <Input
                    id="maxCallDuration"
                    type="number"
                    value={form.maxCallDuration}
                    onChange={(e) => setForm({ ...form, maxCallDuration: parseInt(e.target.value) || 600 })}
                    data-testid="input-max-duration"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                  <Input
                    id="webhookUrl"
                    value={form.webhookUrl}
                    onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                    placeholder="https://yourserver.com/webhook"
                    data-testid="input-webhook"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
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
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-agent"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingAgent ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-agents">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-agents">{activeAgentsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutes Used</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-minutes-used">{totalMinutes}</div>
            <p className="text-xs text-muted-foreground">$0.10/min</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your AI Agents</CardTitle>
          <CardDescription>Manage your AI-powered phone agents</CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-4">Create your first AI voice agent to get started.</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Voice</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} data-testid={`row-agent-${agent.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.description || "No description"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(agent.type)}</TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{agent.voiceId || "Default"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggleStatus(agent)}
                          data-testid={`button-toggle-${agent.id}`}
                        >
                          {agent.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(agent)}
                          data-testid={`button-edit-${agent.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(agent.id)}
                          data-testid={`button-delete-${agent.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
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
