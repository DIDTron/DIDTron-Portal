import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { 
  Plus, Trash2, Copy, Key, Webhook, Eye, EyeOff, 
  CheckCircle2, XCircle, Loader2, AlertTriangle, History, ChevronRight
} from "lucide-react";
import type { Webhook as WebhookType, CustomerApiKey, WebhookDelivery } from "@shared/schema";

const WEBHOOK_EVENTS = [
  { value: "call.started", label: "Call Started" },
  { value: "call.ended", label: "Call Ended" },
  { value: "payment.received", label: "Payment Received" },
  { value: "balance.low", label: "Low Balance" },
  { value: "did.assigned", label: "DID Assigned" },
  { value: "did.released", label: "DID Released" },
];

export default function ApiWebhooksPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("api-keys");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newKeyResult, setNewKeyResult] = useState<{ fullKey: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);

  const { data: deliveries = [], isLoading: deliveriesLoading, isFetching: deliveriesFetching } = useQuery<WebhookDelivery[]>({
    queryKey: selectedWebhookId ? ["/api/my/webhooks", selectedWebhookId, "deliveries"] : ["disabled"],
    enabled: !!selectedWebhookId && activeTab === "delivery-logs",
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<CustomerApiKey[]>({
    queryKey: ["/api/my/api-keys"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery<WebhookType[]>({
    queryKey: ["/api/my/webhooks"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const createApiKey = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/my/api-keys", { name: newKeyName });
      return res.json();
    },
    onSuccess: (data: { fullKey: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/api-keys"] });
      setNewKeyResult(data);
      setNewKeyName("");
      toast({ title: "API Key Created", description: "Copy your key now - it won't be shown again" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteApiKey = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/my/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/api-keys"] });
      toast({ title: "API Key Deleted" });
    },
  });

  const createWebhook = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/my/webhooks", { url: newWebhookUrl, events: selectedEvents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/webhooks"] });
      setShowNewWebhookDialog(false);
      setNewWebhookUrl("");
      setSelectedEvents([]);
      toast({ title: "Webhook Created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/my/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/webhooks"] });
      toast({ title: "Webhook Deleted" });
    },
  });

  const toggleWebhook = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/my/webhooks/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/webhooks"] });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const toggleEventSelection = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">API & Webhooks</h1>
        <p className="text-muted-foreground">Manage your API keys and webhook integrations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="api-keys" data-testid="tab-api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="delivery-logs" data-testid="tab-delivery-logs">
            <History className="h-4 w-4 mr-2" />
            Delivery Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Generate keys to access the DIDTron API</CardDescription>
              </div>
              <Dialog open={showNewKeyDialog} onOpenChange={(open) => {
                setShowNewKeyDialog(open);
                if (!open) setNewKeyResult(null);
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-api-key">
                    <Plus className="h-4 w-4 mr-2" />
                    New API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {newKeyResult ? (
                    <>
                      <DialogHeader>
                        <DialogTitle>API Key Created</DialogTitle>
                        <DialogDescription>
                          Copy your API key now. It won't be shown again.
                        </DialogDescription>
                      </DialogHeader>
                      <Alert className="bg-muted">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="mt-2 font-mono text-sm break-all bg-background p-2 rounded">
                            {newKeyResult.fullKey}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => copyToClipboard(newKeyResult.fullKey)}
                            data-testid="button-copy-api-key"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </AlertDescription>
                      </Alert>
                      <DialogFooter>
                        <Button onClick={() => { setShowNewKeyDialog(false); setNewKeyResult(null); }} data-testid="button-close-dialog">
                          Done
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                          Give your API key a descriptive name
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="Production App"
                            data-testid="input-api-key-name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewKeyDialog(false)} data-testid="button-cancel">
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => createApiKey.mutate()} 
                          disabled={createApiKey.isPending || !newKeyName}
                          data-testid="button-create-api-key"
                        >
                          {createApiKey.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create Key
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {keysLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys yet</p>
                  <p className="text-sm">Create a key to access the API</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{key.keyPrefix}</code>
                        </TableCell>
                        <TableCell>
                          {key.isActive ? (
                            <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
                          ) : (
                            <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => deleteApiKey.mutate(key.id)}
                            data-testid={`button-delete-api-key-${key.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Receive real-time notifications for events</CardDescription>
              </div>
              <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-webhook">
                    <Plus className="h-4 w-4 mr-2" />
                    New Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Webhook</DialogTitle>
                    <DialogDescription>
                      We'll send POST requests to your URL when events occur
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                        placeholder="https://your-app.com/webhook"
                        data-testid="input-webhook-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Events</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {WEBHOOK_EVENTS.map(event => (
                          <label 
                            key={event.value}
                            className="flex items-center gap-2 p-2 rounded border cursor-pointer hover-elevate"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(event.value)}
                              onChange={() => toggleEventSelection(event.value)}
                              className="rounded"
                            />
                            <span className="text-sm">{event.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewWebhookDialog(false)} data-testid="button-cancel-webhook">
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createWebhook.mutate()} 
                      disabled={createWebhook.isPending || !newWebhookUrl || selectedEvents.length === 0}
                      data-testid="button-create-webhook"
                    >
                      {createWebhook.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Webhook
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {webhooksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No webhooks configured</p>
                  <p className="text-sm">Add a webhook to receive event notifications</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Secret</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook.id} data-testid={`row-webhook-${webhook.id}`}>
                        <TableCell className="font-mono text-sm max-w-[200px] truncate">
                          {webhook.url}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events?.slice(0, 2).map(e => (
                              <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                            ))}
                            {(webhook.events?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">+{(webhook.events?.length || 0) - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {showSecrets[webhook.id] ? webhook.secret : "••••••••"}
                            </code>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => setShowSecrets(prev => ({ ...prev, [webhook.id]: !prev[webhook.id] }))}
                            >
                              {showSecrets[webhook.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={webhook.isActive || false}
                            onCheckedChange={(checked) => toggleWebhook.mutate({ id: webhook.id, isActive: checked })}
                            data-testid={`switch-webhook-${webhook.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => deleteWebhook.mutate(webhook.id)}
                            data-testid={`button-delete-webhook-${webhook.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="delivery-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Delivery Logs</CardTitle>
              <CardDescription>View delivery history and retry failed webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No webhooks configured</p>
                  <p className="text-sm">Create a webhook to start seeing delivery logs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Webhook</Label>
                    <div className="flex flex-wrap gap-2">
                      {webhooks.map(wh => (
                        <Button
                          key={wh.id}
                          variant={selectedWebhookId === wh.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedWebhookId(wh.id)}
                          data-testid={`button-select-webhook-${wh.id}`}
                        >
                          {wh.url.replace(/https?:\/\//, "").slice(0, 30)}
                          {wh.url.length > 30 ? "..." : ""}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedWebhookId && (
                    <div className="mt-4">
                      {deliveriesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : deliveries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No deliveries yet</p>
                          <p className="text-sm">Deliveries will appear here once events are triggered</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Retries</TableHead>
                              <TableHead>Delivered At</TableHead>
                              <TableHead>Response</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deliveries.map(delivery => (
                              <TableRow key={delivery.id} data-testid={`row-delivery-${delivery.id}`}>
                                <TableCell>
                                  <Badge variant="outline">{delivery.event}</Badge>
                                </TableCell>
                                <TableCell>
                                  {delivery.responseStatus && delivery.responseStatus >= 200 && delivery.responseStatus < 300 ? (
                                    <Badge variant="default">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      {delivery.responseStatus}
                                    </Badge>
                                  ) : delivery.responseStatus ? (
                                    <Badge variant="destructive">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      {delivery.responseStatus}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Pending</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {delivery.retryCount || 0}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {delivery.deliveredAt 
                                    ? new Date(delivery.deliveredAt).toLocaleString()
                                    : "-"
                                  }
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                  {delivery.responseBody || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
