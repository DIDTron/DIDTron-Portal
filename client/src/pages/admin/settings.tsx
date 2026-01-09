import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, Key, Webhook, Plus, Copy, Eye, EyeOff, Trash2, 
  Loader2, Globe, Mail, Phone, Building2
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string | null;
  createdAt: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "DIDTron Communications",
    supportEmail: "support@didtron.com",
    supportPhone: "+1 (888) 555-0123",
    timezone: "UTC",
    maintenanceMode: false,
    allowSignups: true,
  });

  const [apiKeyForm, setApiKeyForm] = useState({
    name: "",
    permissions: "read",
  });

  const [webhookForm, setWebhookForm] = useState({
    url: "",
    events: [] as string[],
  });

  const apiKeys: ApiKey[] = [
    {
      id: "1",
      name: "Production API",
      key: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
      permissions: ["read", "write"],
      lastUsed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  const webhooks: WebhookConfig[] = [
    {
      id: "1",
      url: "https://example.com/webhook",
      events: ["customer.created", "payment.completed"],
      isActive: true,
      secret: "whsec_xxxxxxxxxxxxxxxxxxxxxxxx",
      createdAt: new Date().toISOString(),
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Manage global platform configuration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={generalSettings.companyName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                      className="pl-10"
                      data-testid="input-company-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                      className="pl-10"
                      data-testid="input-support-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Support Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                      className="pl-10"
                      data-testid="input-support-phone"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={generalSettings.timezone}
                      onValueChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}
                    >
                      <SelectTrigger className="pl-10" data-testid="select-timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Controls</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow New Signups</p>
                  <p className="text-sm text-muted-foreground">Allow new customers to register</p>
                </div>
                <Switch
                  checked={generalSettings.allowSignups}
                  onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, allowSignups: v })}
                  data-testid="switch-allow-signups"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Temporarily disable customer access</p>
                </div>
                <Switch
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(v) => setGeneralSettings({ ...generalSettings, maintenanceMode: v })}
                  data-testid="switch-maintenance-mode"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button data-testid="button-save-settings">
              Save Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              API keys allow programmatic access to the platform
            </p>
            <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-api-key">
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for programmatic access
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Key Name</Label>
                    <Input
                      value={apiKeyForm.name}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                      placeholder="Production API"
                      data-testid="input-api-key-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <Select
                      value={apiKeyForm.permissions}
                      onValueChange={(v) => setApiKeyForm({ ...apiKeyForm, permissions: v })}
                    >
                      <SelectTrigger data-testid="select-api-permissions">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="read_write">Read & Write</SelectItem>
                        <SelectItem value="admin">Full Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                    Cancel
                  </Button>
                  <Button data-testid="button-generate-api-key">
                    Generate Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showApiKey === key.id ? key.key : key.key.slice(0, 12) + "..."}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                            aria-label={showApiKey === key.id ? "Hide" : "Show"}
                            title={showApiKey === key.id ? "Hide" : "Show"}
                          >
                            {showApiKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(key.key)}
                            aria-label="Copy"
                            title="Copy"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {key.permissions.map(p => (
                            <Badge key={p} variant="outline">{p}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" aria-label="Delete" title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Receive real-time notifications for platform events
            </p>
            <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-webhook">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a webhook endpoint for event notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <Input
                      value={webhookForm.url}
                      onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                      placeholder="https://your-app.com/webhook"
                      data-testid="input-webhook-url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events</Label>
                    <p className="text-sm text-muted-foreground">Select events to subscribe to</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["customer.created", "customer.updated", "payment.completed", "call.started", "call.ended", "did.provisioned"].map(event => (
                        <div key={event} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={event}
                            checked={webhookForm.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWebhookForm({ ...webhookForm, events: [...webhookForm.events, event] });
                              } else {
                                setWebhookForm({ ...webhookForm, events: webhookForm.events.filter(ev => ev !== event) });
                              }
                            }}
                          />
                          <label htmlFor={event} className="text-sm">{event}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
                    Cancel
                  </Button>
                  <Button data-testid="button-save-webhook">
                    Save Webhook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id} data-testid={`row-webhook-${webhook.id}`}>
                      <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map(e => (
                            <Badge key={e} variant="outline">{e}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" aria-label="Delete" title="Delete">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
