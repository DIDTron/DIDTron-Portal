import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings, Key, Webhook, Shield, AlertCircle, CheckCircle2, 
  Plus, Trash2, Loader2, Save, RefreshCw
} from "lucide-react";

type AiVoiceSetting = {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string | null;
  isEncrypted: boolean;
};

type WebhookConfig = {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggered: string | null;
  failureCount: number | null;
};

const defaultProviderSettings = {
  openaiApiKey: "",
  openaiModel: "gpt-4o",
  ttsProvider: "openai",
  ttsVoice: "alloy",
  sttProvider: "openai",
  sttModel: "whisper-1",
  connexcsApiKey: "",
  connexcsUsername: "",
};

export default function AiVoiceSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("providers");
  const [settings, setSettings] = useState(defaultProviderSettings);

  const { data: systemSettings = [], isLoading } = useQuery<AiVoiceSetting[]>({
    queryKey: ["/api/admin/ai-voice/settings"],
  });

  const { data: webhooks = [] } = useQuery<WebhookConfig[]>({
    queryKey: ["/api/admin/ai-voice/webhooks"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; category: string }) => {
      const res = await apiRequest("POST", "/api/admin/ai-voice/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ai-voice/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/webhooks"] });
      toast({ title: "Webhook deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete webhook", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveProviders = () => {
    Object.entries(settings).forEach(([key, value]) => {
      if (value) {
        saveMutation.mutate({ key, value, category: "provider" });
      }
    });
    toast({ title: "Provider settings saved" });
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
          <h1 className="text-2xl font-semibold">AI Voice Settings</h1>
          <p className="text-muted-foreground">Configure providers, webhooks, and compliance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                AI Provider Configuration
              </CardTitle>
              <CardDescription>Configure OpenAI and other AI service providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    data-testid="input-openai-key"
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openaiModel">OpenAI Model</Label>
                  <Select value={settings.openaiModel} onValueChange={(v) => setSettings({ ...settings, openaiModel: v })}>
                    <SelectTrigger data-testid="select-openai-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Text-to-Speech Settings</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ttsProvider">TTS Provider</Label>
                    <Select value={settings.ttsProvider} onValueChange={(v) => setSettings({ ...settings, ttsProvider: v })}>
                      <SelectTrigger data-testid="select-tts-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ttsVoice">Default Voice</Label>
                    <Select value={settings.ttsVoice} onValueChange={(v) => setSettings({ ...settings, ttsVoice: v })}>
                      <SelectTrigger data-testid="select-tts-voice">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alloy">Alloy</SelectItem>
                        <SelectItem value="echo">Echo</SelectItem>
                        <SelectItem value="fable">Fable</SelectItem>
                        <SelectItem value="onyx">Onyx</SelectItem>
                        <SelectItem value="nova">Nova</SelectItem>
                        <SelectItem value="shimmer">Shimmer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">ConnexCS Integration</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="connexcsUsername">ConnexCS Username</Label>
                    <Input
                      id="connexcsUsername"
                      data-testid="input-connexcs-user"
                      value={settings.connexcsUsername}
                      onChange={(e) => setSettings({ ...settings, connexcsUsername: e.target.value })}
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connexcsApiKey">ConnexCS API Key</Label>
                    <Input
                      id="connexcsApiKey"
                      type="password"
                      data-testid="input-connexcs-key"
                      value={settings.connexcsApiKey}
                      onChange={(e) => setSettings({ ...settings, connexcsApiKey: e.target.value })}
                      placeholder="API Key"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProviders} disabled={saveMutation.isPending} data-testid="button-save-providers">
                  <Save className="w-4 h-4 mr-2" />
                  Save Provider Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhook Configuration
                  </CardTitle>
                  <CardDescription>Configure webhooks for call events</CardDescription>
                </div>
                <Button data-testid="button-add-webhook">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="text-center py-12">
                  <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Webhooks</h3>
                  <p className="text-muted-foreground">
                    Configure webhooks to receive call event notifications
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map(webhook => (
                      <TableRow key={webhook.id} data-testid={`row-webhook-${webhook.id}`}>
                        <TableCell className="font-medium">{webhook.name}</TableCell>
                        <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.slice(0, 2).map((event, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                            {webhook.events.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{webhook.events.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {webhook.isActive ? (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-delete-webhook-${webhook.id}`}
                            onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                            aria-label="Delete"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Settings
              </CardTitle>
              <CardDescription>Configure regulatory compliance options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Call Recording Disclosure</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically notify callers that calls are being recorded
                    </p>
                  </div>
                  <Switch data-testid="switch-recording-disclosure" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Disclosure</Label>
                    <p className="text-sm text-muted-foreground">
                      Inform callers they are speaking with an AI agent
                    </p>
                  </div>
                  <Switch data-testid="switch-ai-disclosure" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>TCPA Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce calling time restrictions and consent requirements
                    </p>
                  </div>
                  <Switch data-testid="switch-tcpa-compliance" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Do Not Call List Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Check numbers against DNC registries before dialing
                    </p>
                  </div>
                  <Switch data-testid="switch-dnc-integration" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>PCI Compliance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Mask and secure payment card information in transcripts
                    </p>
                  </div>
                  <Switch data-testid="switch-pci-compliance" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button data-testid="button-save-compliance">
                  <Save className="w-4 h-4 mr-2" />
                  Save Compliance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
