import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Play, Pause, Settings2, Mic, MessageSquare, Zap, BookOpen, Users,
  Calendar, Clock, Target
} from "lucide-react";
import type { AiVoiceAgent, AiVoiceTrainingData, AiVoiceCampaign } from "@shared/schema";

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

const defaultAgentForm: AgentFormData = {
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

type TrainingFormData = {
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
};

const defaultTrainingForm: TrainingFormData = {
  category: "",
  question: "",
  answer: "",
  isActive: true,
};

type CampaignFormData = {
  agentId: string;
  name: string;
  description: string;
  contactList: string;
  scheduledAt: string;
  maxConcurrentCalls: number;
};

const defaultCampaignForm: CampaignFormData = {
  agentId: "",
  name: "",
  description: "",
  contactList: "",
  scheduledAt: "",
  maxConcurrentCalls: 5,
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
    case "running":
      return <Badge className="bg-green-600">Running</Badge>;
    case "completed":
      return <Badge variant="outline">Completed</Badge>;
    case "draft":
    default:
      return <Badge variant="outline">Draft</Badge>;
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
  const [mainTab, setMainTab] = useState("agents");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // Agent dialog state
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AiVoiceAgent | null>(null);
  const [agentForm, setAgentForm] = useState<AgentFormData>(defaultAgentForm);
  const [agentDialogTab, setAgentDialogTab] = useState("general");

  // Training dialog state
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<AiVoiceTrainingData | null>(null);
  const [trainingForm, setTrainingForm] = useState<TrainingFormData>(defaultTrainingForm);

  // Campaign dialog state
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AiVoiceCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<CampaignFormData>(defaultCampaignForm);

  // Queries
  const { data: agents = [], isLoading: agentsLoading } = useQuery<AiVoiceAgent[]>({
    queryKey: ["/api/my/ai-voice/agents"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: trainingData = [] } = useQuery<AiVoiceTrainingData[]>({
    queryKey: ["/api/my/ai-voice/agents", selectedAgentId, "training"],
    enabled: !!selectedAgentId && mainTab === "training",
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: campaigns = [] } = useQuery<AiVoiceCampaign[]>({
    queryKey: ["/api/my/ai-voice/campaigns"],
    enabled: mainTab === "campaigns",
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  // Agent mutations
  const createAgentMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const res = await apiRequest("POST", "/api/my/ai-voice/agents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents"] });
      toast({ title: "AI Voice Agent created successfully" });
      resetAgentForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create agent", description: error.message, variant: "destructive" });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AgentFormData> }) => {
      const res = await apiRequest("PATCH", `/api/my/ai-voice/agents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents"] });
      toast({ title: "AI Voice Agent updated successfully" });
      resetAgentForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update agent", description: error.message, variant: "destructive" });
    },
  });

  const deleteAgentMutation = useMutation({
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

  // Training mutations
  const createTrainingMutation = useMutation({
    mutationFn: async (data: TrainingFormData) => {
      const res = await apiRequest("POST", `/api/my/ai-voice/agents/${selectedAgentId}/training`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents", selectedAgentId, "training"] });
      toast({ title: "Training data added successfully" });
      resetTrainingForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add training data", description: error.message, variant: "destructive" });
    },
  });

  const updateTrainingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TrainingFormData> }) => {
      const res = await apiRequest("PATCH", `/api/my/ai-voice/training/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents", selectedAgentId, "training"] });
      toast({ title: "Training data updated successfully" });
      resetTrainingForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update training data", description: error.message, variant: "destructive" });
    },
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/ai-voice/training/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents", selectedAgentId, "training"] });
      toast({ title: "Training data deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete training data", description: error.message, variant: "destructive" });
    },
  });

  // Campaign mutations
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const contactList = data.contactList.split("\n").map(line => {
        const [phone, name] = line.split(",").map(s => s.trim());
        return { phone, name: name || phone };
      }).filter(c => c.phone);
      const res = await apiRequest("POST", "/api/my/ai-voice/campaigns", {
        ...data,
        contactList,
        scheduledAt: data.scheduledAt || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/campaigns"] });
      toast({ title: "Campaign created successfully" });
      resetCampaignForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CampaignFormData & { status?: string }> }) => {
      const res = await apiRequest("PATCH", `/api/my/ai-voice/campaigns/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/campaigns"] });
      toast({ title: "Campaign updated successfully" });
      resetCampaignForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update campaign", description: error.message, variant: "destructive" });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/ai-voice/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/campaigns"] });
      toast({ title: "Campaign deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete campaign", description: error.message, variant: "destructive" });
    },
  });

  // Form handlers
  const resetAgentForm = () => {
    setAgentForm(defaultAgentForm);
    setEditingAgent(null);
    setIsAgentOpen(false);
    setAgentDialogTab("general");
  };

  const resetTrainingForm = () => {
    setTrainingForm(defaultTrainingForm);
    setEditingTraining(null);
    setIsTrainingOpen(false);
  };

  const resetCampaignForm = () => {
    setCampaignForm(defaultCampaignForm);
    setEditingCampaign(null);
    setIsCampaignOpen(false);
  };

  const handleEditAgent = (agent: AiVoiceAgent) => {
    setEditingAgent(agent);
    setAgentForm({
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
    setIsAgentOpen(true);
  };

  const handleSubmitAgent = () => {
    if (!agentForm.name) {
      toast({ title: "Agent name is required", variant: "destructive" });
      return;
    }
    if (editingAgent) {
      updateAgentMutation.mutate({ id: editingAgent.id, data: agentForm });
    } else {
      createAgentMutation.mutate(agentForm);
    }
  };

  const handleEditTraining = (item: AiVoiceTrainingData) => {
    setEditingTraining(item);
    setTrainingForm({
      category: item.category || "",
      question: item.question,
      answer: item.answer,
      isActive: item.isActive ?? true,
    });
    setIsTrainingOpen(true);
  };

  const handleSubmitTraining = () => {
    if (!trainingForm.question || !trainingForm.answer) {
      toast({ title: "Question and answer are required", variant: "destructive" });
      return;
    }
    if (editingTraining) {
      updateTrainingMutation.mutate({ id: editingTraining.id, data: trainingForm });
    } else {
      createTrainingMutation.mutate(trainingForm);
    }
  };

  const handleEditCampaign = (campaign: AiVoiceCampaign) => {
    setEditingCampaign(campaign);
    const contacts = Array.isArray(campaign.contactList) 
      ? (campaign.contactList as Array<{phone: string; name?: string}>).map(c => `${c.phone}${c.name ? `, ${c.name}` : ''}`).join("\n")
      : "";
    setCampaignForm({
      agentId: campaign.agentId,
      name: campaign.name,
      description: campaign.description || "",
      contactList: contacts,
      scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : "",
      maxConcurrentCalls: campaign.maxConcurrentCalls || 5,
    });
    setIsCampaignOpen(true);
  };

  const handleSubmitCampaign = () => {
    if (!campaignForm.agentId || !campaignForm.name) {
      toast({ title: "Agent and name are required", variant: "destructive" });
      return;
    }
    if (editingCampaign) {
      const contactList = campaignForm.contactList.split("\n").map(line => {
        const [phone, name] = line.split(",").map(s => s.trim());
        return { phone, name: name || phone };
      }).filter(c => c.phone);
      updateCampaignMutation.mutate({ 
        id: editingCampaign.id, 
        data: { ...campaignForm, contactList } as unknown as Partial<CampaignFormData>
      });
    } else {
      createCampaignMutation.mutate(campaignForm);
    }
  };

  const selectedAgent = selectedAgentId ? agents.find(a => a.id === selectedAgentId) : null;
  const activeAgentsCount = agents.filter(a => a.status === "active").length;

  if (agentsLoading) {
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
          <p className="text-muted-foreground">Create AI agents, train them, and run outbound campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">{activeAgentsCount} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">outbound campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.10</div>
            <p className="text-xs text-muted-foreground">per minute</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="agents" data-testid="tab-agents">
            <Bot className="h-4 w-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="training" data-testid="tab-training">
            <BookOpen className="h-4 w-4 mr-2" />
            Training Data
          </TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">
            <Target className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAgentOpen} onOpenChange={(open) => { if (!open) resetAgentForm(); setIsAgentOpen(open); }}>
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

                <Tabs value={agentDialogTab} onValueChange={setAgentDialogTab}>
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
                        value={agentForm.name}
                        onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                        placeholder="Customer Support Agent"
                        data-testid="input-agent-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={agentForm.description}
                        onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                        placeholder="Describe the agent's purpose..."
                        data-testid="input-agent-description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Agent Type</Label>
                        <Select value={agentForm.type} onValueChange={(v) => setAgentForm({ ...agentForm, type: v })}>
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
                        <Select value={agentForm.voiceId} onValueChange={(v) => setAgentForm({ ...agentForm, voiceId: v })}>
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
                        value={agentForm.systemPrompt}
                        onChange={(e) => setAgentForm({ ...agentForm, systemPrompt: e.target.value })}
                        placeholder="You are a helpful customer service representative..."
                        className="min-h-[120px]"
                        data-testid="input-system-prompt"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="greetingMessage">Greeting Message</Label>
                      <Input
                        id="greetingMessage"
                        value={agentForm.greetingMessage}
                        onChange={(e) => setAgentForm({ ...agentForm, greetingMessage: e.target.value })}
                        placeholder="Hello! How can I help you today?"
                        data-testid="input-greeting"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fallbackMessage">Fallback Message</Label>
                      <Input
                        id="fallbackMessage"
                        value={agentForm.fallbackMessage}
                        onChange={(e) => setAgentForm({ ...agentForm, fallbackMessage: e.target.value })}
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
                        value={agentForm.maxCallDuration}
                        onChange={(e) => setAgentForm({ ...agentForm, maxCallDuration: parseInt(e.target.value) || 600 })}
                        data-testid="input-max-duration"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                      <Input
                        id="webhookUrl"
                        value={agentForm.webhookUrl}
                        onChange={(e) => setAgentForm({ ...agentForm, webhookUrl: e.target.value })}
                        placeholder="https://yourserver.com/webhook"
                        data-testid="input-webhook"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={agentForm.status} onValueChange={(v) => setAgentForm({ ...agentForm, status: v })}>
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
                  <Button variant="outline" onClick={resetAgentForm} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitAgent} 
                    disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
                    data-testid="button-save-agent"
                  >
                    {editingAgent ? "Update" : "Create"} Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {agents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No AI Voice Agents Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI-powered phone agent to handle calls automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Voice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map(agent => (
                  <TableRow key={agent.id} data-testid={`row-agent-${agent.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
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
                    <TableCell>{getTypeBadge(agent.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Mic className="h-3 w-3 mr-1" />
                        {VOICE_OPTIONS.find(v => v.value === agent.voiceId)?.label || agent.voiceId}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newStatus = agent.status === "active" ? "paused" : "active";
                            updateAgentMutation.mutate({ id: agent.id, data: { status: newStatus } });
                          }}
                          data-testid={`button-toggle-${agent.id}`}
                        >
                          {agent.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAgent(agent)}
                          data-testid={`button-edit-${agent.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this agent?")) {
                              deleteAgentMutation.mutate(agent.id);
                            }
                          }}
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
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Label>Select Agent:</Label>
              <Select value={selectedAgentId || ""} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="w-[250px]" data-testid="select-training-agent">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedAgentId && (
              <Dialog open={isTrainingOpen} onOpenChange={(open) => { if (!open) resetTrainingForm(); setIsTrainingOpen(open); }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-training">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Training Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTraining ? "Edit" : "Add"} Training Data</DialogTitle>
                    <DialogDescription>
                      Add question-answer pairs to train your AI agent.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (optional)</Label>
                      <Input
                        id="category"
                        value={trainingForm.category}
                        onChange={(e) => setTrainingForm({ ...trainingForm, category: e.target.value })}
                        placeholder="e.g., Billing, Support, Sales"
                        data-testid="input-training-category"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        value={trainingForm.question}
                        onChange={(e) => setTrainingForm({ ...trainingForm, question: e.target.value })}
                        placeholder="What question might a customer ask?"
                        data-testid="input-training-question"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        value={trainingForm.answer}
                        onChange={(e) => setTrainingForm({ ...trainingForm, answer: e.target.value })}
                        placeholder="How should the agent respond?"
                        className="min-h-[100px]"
                        data-testid="input-training-answer"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetTrainingForm}>Cancel</Button>
                    <Button 
                      onClick={handleSubmitTraining}
                      disabled={createTrainingMutation.isPending || updateTrainingMutation.isPending}
                      data-testid="button-save-training"
                    >
                      {editingTraining ? "Update" : "Add"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!selectedAgentId ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Agent</h3>
                <p className="text-muted-foreground">
                  Choose an agent above to view and manage its training data.
                </p>
              </CardContent>
            </Card>
          ) : trainingData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Training Data Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add question-answer pairs to help {selectedAgent?.name} respond better.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingData.map(item => (
                  <TableRow key={item.id} data-testid={`row-training-${item.id}`}>
                    <TableCell>
                      {item.category ? (
                        <Badge variant="secondary">{item.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.question}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{item.answer}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTraining(item)}
                          data-testid={`button-edit-training-${item.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this training data?")) {
                              deleteTrainingMutation.mutate(item.id);
                            }
                          }}
                          data-testid={`button-delete-training-${item.id}`}
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
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCampaignOpen} onOpenChange={(open) => { if (!open) resetCampaignForm(); setIsCampaignOpen(open); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-campaign">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{editingCampaign ? "Edit" : "Create"} Outbound Campaign</DialogTitle>
                  <DialogDescription>
                    Set up an automated outbound calling campaign.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Agent</Label>
                    <Select value={campaignForm.agentId} onValueChange={(v) => setCampaignForm({ ...campaignForm, agentId: v })}>
                      <SelectTrigger data-testid="select-campaign-agent">
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.filter(a => a.type === "outbound").map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                        {agents.filter(a => a.type === "outbound").length === 0 && (
                          <SelectItem value="" disabled>No outbound agents available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaignName">Campaign Name</Label>
                    <Input
                      id="campaignName"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      placeholder="Q1 Sales Outreach"
                      data-testid="input-campaign-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaignDescription">Description</Label>
                    <Textarea
                      id="campaignDescription"
                      value={campaignForm.description}
                      onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                      placeholder="Campaign description..."
                      data-testid="input-campaign-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactList">Contact List (one per line: phone, name)</Label>
                    <Textarea
                      id="contactList"
                      value={campaignForm.contactList}
                      onChange={(e) => setCampaignForm({ ...campaignForm, contactList: e.target.value })}
                      placeholder="+1234567890, John Doe&#10;+0987654321, Jane Smith"
                      className="min-h-[120px] font-mono text-sm"
                      data-testid="input-contact-list"
                    />
                    <p className="text-xs text-muted-foreground">
                      {campaignForm.contactList.split("\n").filter(l => l.trim()).length} contacts
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Schedule (optional)</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={campaignForm.scheduledAt}
                        onChange={(e) => setCampaignForm({ ...campaignForm, scheduledAt: e.target.value })}
                        data-testid="input-schedule"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxConcurrent">Max Concurrent Calls</Label>
                      <Input
                        id="maxConcurrent"
                        type="number"
                        min={1}
                        max={50}
                        value={campaignForm.maxConcurrentCalls}
                        onChange={(e) => setCampaignForm({ ...campaignForm, maxConcurrentCalls: parseInt(e.target.value) || 5 })}
                        data-testid="input-max-concurrent"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetCampaignForm}>Cancel</Button>
                  <Button 
                    onClick={handleSubmitCampaign}
                    disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                    data-testid="button-save-campaign"
                  >
                    {editingCampaign ? "Update" : "Create"} Campaign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create an outbound campaign to automate your calling.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(campaign => {
                  const agent = agents.find(a => a.id === campaign.agentId);
                  return (
                    <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {campaign.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent ? (
                          <Badge variant="outline">
                            <Bot className="h-3 w-3 mr-1" />
                            {agent.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {campaign.callsTotal || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ 
                                width: `${campaign.callsTotal ? (campaign.callsCompleted || 0) / campaign.callsTotal * 100 : 0}%` 
                              }} 
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {campaign.callsCompleted || 0}/{campaign.callsTotal || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {campaign.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateCampaignMutation.mutate({ id: campaign.id, data: { status: "running" } })}
                              data-testid={`button-start-${campaign.id}`}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {campaign.status === "running" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateCampaignMutation.mutate({ id: campaign.id, data: { status: "paused" } })}
                              data-testid={`button-pause-${campaign.id}`}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCampaign(campaign)}
                            data-testid={`button-edit-campaign-${campaign.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete this campaign?")) {
                                deleteCampaignMutation.mutate(campaign.id);
                              }
                            }}
                            data-testid={`button-delete-campaign-${campaign.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
