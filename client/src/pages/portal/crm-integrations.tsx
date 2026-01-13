import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import {
  Plus, Settings, Trash2, RefreshCw, Check, X, Loader2,
  Link2, LinkIcon, Unlink, Clock, ArrowRight, Search
} from "lucide-react";
import { SiSalesforce, SiHubspot } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";

type CrmConnection = {
  id: string;
  customerId: string;
  provider: "salesforce" | "hubspot";
  name: string;
  status: "pending" | "connected" | "error" | "disconnected";
  instanceUrl: string | null;
  hasCredentials: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CrmSyncSettings = {
  id: string;
  connectionId: string;
  syncCallLogs: boolean;
  syncContacts: boolean;
  syncCampaigns: boolean;
  syncInterval: number;
  autoCreateContacts: boolean;
  autoLogActivities: boolean;
  contactMatchField: "phone" | "email" | "both";
  defaultOwnerEmail: string | null;
};

type CrmSyncLog = {
  id: string;
  connectionId: string;
  syncType: string;
  direction: string;
  status: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorDetails: string | null;
  startedAt: string;
  completedAt: string | null;
};

function ProviderIcon({ provider, className }: { provider: string; className?: string }) {
  if (provider === "salesforce") {
    return <SiSalesforce className={className || "h-5 w-5"} />;
  }
  if (provider === "hubspot") {
    return <SiHubspot className={className || "h-5 w-5"} />;
  }
  return <LinkIcon className={className || "h-5 w-5"} />;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    connected: "default",
    pending: "secondary",
    error: "destructive",
    disconnected: "outline",
  };
  return (
    <Badge variant={variants[status] || "secondary"} data-testid={`badge-status-${status}`}>
      {status === "connected" && <Check className="h-3 w-3 mr-1" />}
      {status === "error" && <X className="h-3 w-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function ConnectionCard({ 
  connection, 
  onTest, 
  onConfigure, 
  onDelete 
}: { 
  connection: CrmConnection;
  onTest: () => void;
  onConfigure: () => void;
  onDelete: () => void;
}) {
  return (
    <Card data-testid={`card-connection-${connection.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-muted">
            <ProviderIcon provider={connection.provider} className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-base">{connection.name}</CardTitle>
            <CardDescription className="text-xs">
              {connection.provider === "salesforce" ? "Salesforce CRM" : "HubSpot CRM"}
              {connection.instanceUrl && ` - ${new URL(connection.instanceUrl).hostname}`}
            </CardDescription>
          </div>
        </div>
        <StatusBadge status={connection.status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {connection.lastSyncAt
                  ? `Synced ${formatDistanceToNow(new Date(connection.lastSyncAt))} ago`
                  : "Never synced"}
              </span>
            </div>
          </div>

          {connection.lastError && (
            <div className="p-2 rounded-md bg-destructive/10 text-destructive text-xs">
              {connection.lastError}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={onTest}
              data-testid={`button-test-connection-${connection.id}`}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Test
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onConfigure}
              data-testid={`button-configure-${connection.id}`}
            >
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              data-testid={`button-delete-${connection.id}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddConnectionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<"salesforce" | "hubspot" | "">("");
  const [name, setName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; provider: string; accessToken?: string; instanceUrl?: string }) => {
      const response = await apiRequest("POST", "/api/my/crm/connections", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/crm/connections"] });
      toast({ title: "Connection created", description: "CRM connection has been added successfully." });
      onOpenChange(false);
      setProvider("");
      setName("");
      setAccessToken("");
      setInstanceUrl("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create connection.", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!name || !provider) return;
    createMutation.mutate({
      name,
      provider,
      accessToken: accessToken || undefined,
      instanceUrl: provider === "salesforce" ? instanceUrl : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add CRM Connection</DialogTitle>
          <DialogDescription>
            Connect your CRM to sync contacts and log call activities automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>CRM Provider</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-4 rounded-md border text-center hover-elevate ${
                  provider === "salesforce" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setProvider("salesforce")}
                data-testid="button-select-salesforce"
              >
                <SiSalesforce className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Salesforce</div>
              </button>
              <button
                type="button"
                className={`p-4 rounded-md border text-center hover-elevate ${
                  provider === "hubspot" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setProvider("hubspot")}
                data-testid="button-select-hubspot"
              >
                <SiHubspot className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-sm font-medium">HubSpot</div>
              </button>
            </div>
          </div>

          {provider && (
            <>
              <div className="space-y-2">
                <Label htmlFor="connection-name">Connection Name</Label>
                <Input
                  id="connection-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`My ${provider === "salesforce" ? "Salesforce" : "HubSpot"} Connection`}
                  data-testid="input-connection-name"
                />
              </div>

              {provider === "salesforce" && (
                <div className="space-y-2">
                  <Label htmlFor="instance-url">Instance URL</Label>
                  <Input
                    id="instance-url"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                    placeholder="https://yourorg.my.salesforce.com"
                    data-testid="input-instance-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Salesforce organization URL
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token (Optional)</Label>
                <Input
                  id="access-token"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Paste your access token"
                  data-testid="input-access-token"
                />
                <p className="text-xs text-muted-foreground">
                  You can configure OAuth later in the connection settings.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !provider || createMutation.isPending}
            data-testid="button-add-connection"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfigureDialog({ 
  connection, 
  open, 
  onOpenChange 
}: { 
  connection: CrmConnection | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sync");

  const { data: settings } = useQuery<CrmSyncSettings>({
    queryKey: ["/api/my/crm/connections", connection?.id, "settings"],
    enabled: !!connection?.id && open,
    staleTime: STALE_TIME.DETAIL,
  });

  const { data: logs = [] } = useQuery<CrmSyncLog[]>({
    queryKey: ["/api/my/crm/connections", connection?.id, "logs"],
    enabled: !!connection?.id && open && activeTab === "logs",
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<CrmSyncSettings>) => {
      const response = await apiRequest("PUT", `/api/my/crm/connections/${connection?.id}/settings`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/crm/connections", connection?.id, "settings"] });
      toast({ title: "Settings saved", description: "Sync settings have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (syncType: string) => {
      const response = await apiRequest("POST", `/api/my/crm/connections/${connection?.id}/sync`, { syncType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/crm/connections", connection?.id, "logs"] });
      toast({ title: "Sync started", description: "Synchronization has been initiated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start sync.", variant: "destructive" });
    },
  });

  if (!connection) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-muted">
              <ProviderIcon provider={connection.provider} className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{connection.name}</DialogTitle>
              <DialogDescription>
                Configure sync settings and view activity logs
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sync" data-testid="tab-sync-settings">Sync Settings</TabsTrigger>
            <TabsTrigger value="logs" data-testid="tab-logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="actions" data-testid="tab-actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="space-y-4 mt-4">
            {settings && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Sync Call Logs</Label>
                    <p className="text-xs text-muted-foreground">
                      Log AI Voice call activities to CRM
                    </p>
                  </div>
                  <Switch
                    checked={settings.syncCallLogs}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({ syncCallLogs: checked })}
                    data-testid="switch-sync-call-logs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Sync Contacts</Label>
                    <p className="text-xs text-muted-foreground">
                      Pull contacts from CRM for campaigns
                    </p>
                  </div>
                  <Switch
                    checked={settings.syncContacts}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({ syncContacts: checked })}
                    data-testid="switch-sync-contacts"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-Create Contacts</Label>
                    <p className="text-xs text-muted-foreground">
                      Create new CRM contacts for unknown callers
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoCreateContacts}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({ autoCreateContacts: checked })}
                    data-testid="switch-auto-create"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-Log Activities</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically log call activities after each call
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoLogActivities}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({ autoLogActivities: checked })}
                    data-testid="switch-auto-log"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Matching</Label>
                  <Select
                    value={settings.contactMatchField}
                    onValueChange={(value) => updateSettingsMutation.mutate({ contactMatchField: value as "phone" | "email" | "both" })}
                  >
                    <SelectTrigger data-testid="select-match-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Match by Phone Number</SelectItem>
                      <SelectItem value="email">Match by Email</SelectItem>
                      <SelectItem value="both">Match by Phone or Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How to find existing contacts in CRM
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Sync Interval (minutes)</Label>
                  <Select
                    value={String(settings.syncInterval)}
                    onValueChange={(value) => updateSettingsMutation.mutate({ syncInterval: parseInt(value) })}
                  >
                    <SelectTrigger data-testid="select-sync-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <ScrollArea className="h-64">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync activity yet
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-md border text-sm"
                      data-testid={`log-entry-${log.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium capitalize">{log.syncType} Sync</span>
                        <Badge variant={log.status === "completed" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.recordsProcessed} processed, {log.recordsCreated} created, {log.recordsUpdated} updated
                        {log.recordsFailed > 0 && <span className="text-destructive">, {log.recordsFailed} failed</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.startedAt && formatDistanceToNow(new Date(log.startedAt))} ago
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => syncMutation.mutate("contacts")}
                disabled={syncMutation.isPending}
                data-testid="button-sync-contacts"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                Sync Contacts Now
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => syncMutation.mutate("call_logs")}
                disabled={syncMutation.isPending}
                data-testid="button-sync-call-logs"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                Sync Call Logs Now
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function CrmIntegrationsPage() {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [configureConnection, setConfigureConnection] = useState<CrmConnection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: connections = [], isLoading } = useQuery<CrmConnection[]>({
    queryKey: ["/api/my/crm/connections"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/my/crm/connections/${id}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/crm/connections"] });
      if (data.success) {
        toast({ title: "Connection successful", description: "CRM connection is working properly." });
      } else {
        toast({ title: "Connection failed", description: data.error || "Unable to connect to CRM.", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to test connection.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/crm/connections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/crm/connections"] });
      toast({ title: "Connection deleted", description: "CRM connection has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete connection.", variant: "destructive" });
    },
  });

  const filteredConnections = connections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">CRM Integrations</h1>
          <p className="text-muted-foreground">
            Connect your CRM to sync contacts and log call activities
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-connection">
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {connections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect Your CRM</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Integrate with Salesforce or HubSpot to automatically sync contacts 
              and log AI Voice call activities to your CRM.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-2">
                <SiSalesforce className="h-10 w-10 text-blue-500" />
                <span className="text-sm text-muted-foreground">Salesforce</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SiHubspot className="h-10 w-10 text-orange-500" />
                <span className="text-sm text-muted-foreground">HubSpot</span>
              </div>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} data-testid="button-get-started">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-connections"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredConnections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onTest={() => testMutation.mutate(connection.id)}
                onConfigure={() => setConfigureConnection(connection)}
                onDelete={() => deleteMutation.mutate(connection.id)}
              />
            ))}
          </div>
        </>
      )}

      <AddConnectionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <ConfigureDialog
        connection={configureConnection}
        open={!!configureConnection}
        onOpenChange={(open) => !open && setConfigureConnection(null)}
      />
    </div>
  );
}
