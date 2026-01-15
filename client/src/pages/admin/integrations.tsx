import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Phone,
  CreditCard,
  Wallet,
  Mail,
  Share2,
  DollarSign,
  HardDrive,
  Database,
  PhoneCall,
  PhoneForwarded,
  Check,
  X,
  AlertCircle,
  Settings,
  RefreshCw,
  Loader2,
  Coins,
  Copy,
  Key,
} from "lucide-react";
import type { Integration } from "@shared/schema";

const iconMap: Record<string, React.ReactNode> = {
  phone: <Phone className="w-5 h-5" />,
  "credit-card": <CreditCard className="w-5 h-5" />,
  wallet: <Wallet className="w-5 h-5" />,
  mail: <Mail className="w-5 h-5" />,
  "share-2": <Share2 className="w-5 h-5" />,
  "dollar-sign": <DollarSign className="w-5 h-5" />,
  "hard-drive": <HardDrive className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  "phone-call": <PhoneCall className="w-5 h-5" />,
  "phone-forwarded": <PhoneForwarded className="w-5 h-5" />,
  bitcoin: <Coins className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
  voip: "VoIP & Switching",
  payments: "Payments",
  email: "Email",
  social: "Social Media",
  finance: "Finance",
  storage: "Storage",
  cache: "Caching",
  sip_testing: "SIP Testing",
};

const credentialFields: Record<string, { label: string; type: string; key: string }[]> = {
  connexcs: [
    { label: "Username", type: "text", key: "username" },
    { label: "Password", type: "password", key: "password" },
  ],
  stripe: [
    { label: "Secret Key", type: "password", key: "secret_key" },
    { label: "Publishable Key", type: "text", key: "publishable_key" },
  ],
  paypal: [
    { label: "Client ID", type: "text", key: "client_id" },
    { label: "Client Secret", type: "password", key: "client_secret" },
  ],
  brevo: [
    { label: "API Key", type: "password", key: "api_key" },
  ],
  ayrshare: [
    { label: "API Key", type: "password", key: "api_key" },
  ],
  openexchangerates: [
    { label: "App ID", type: "password", key: "app_id" },
  ],
  cloudflare_r2: [
    { label: "Access Key ID", type: "text", key: "access_key_id" },
    { label: "Secret Access Key", type: "password", key: "secret_access_key" },
    { label: "Account ID", type: "text", key: "account_id" },
    { label: "Bucket Name", type: "text", key: "bucket_name" },
  ],
  upstash_redis: [
    { label: "Redis URL", type: "password", key: "redis_url" },
    { label: "Redis Token", type: "password", key: "redis_token" },
  ],
  twilio: [
    { label: "Account SID", type: "text", key: "account_sid" },
    { label: "Auth Token", type: "password", key: "auth_token" },
  ],
  signalwire: [
    { label: "Project ID", type: "text", key: "project_id" },
    { label: "API Token", type: "password", key: "api_token" },
    { label: "Space URL", type: "text", key: "space_url" },
  ],
  nowpayments: [
    { label: "API Key", type: "password", key: "apiKey" },
    { label: "IPN Secret (optional)", type: "password", key: "ipnSecret" },
  ],
};

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState<string | null>(null);

  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Integration> }) => {
      const res = await apiRequest("PATCH", `/api/integrations/${id}`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      
      // Check if ConnexCS API key was auto-generated
      if (data.apiKeyResult?.success && data.apiKeyResult?.apiKey) {
        setApiKey(data.apiKeyResult.apiKey);
        toast({ 
          title: "Credentials saved & API Key generated",
          description: `Token valid for ${data.apiKeyResult.daysRemaining || 30} days. Copy it now!`
        });
        // Don't close dialog - show the API key for copying
        setCredentialValues({});
      } else if (data.apiKeyResult?.error) {
        toast({ 
          title: "Credentials saved but API Key generation failed",
          description: data.apiKeyResult.error,
          variant: "destructive"
        });
        setEditingIntegration(null);
        setCredentialValues({});
      } else {
        toast({ 
          title: "Credentials saved successfully",
          description: "Click 'Test Connection' to verify the credentials work."
        });
        setEditingIntegration(null);
        setCredentialValues({});
      }
    },
    onError: () => {
      toast({ title: "Failed to save credentials", variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/integrations/${id}/test`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ 
        title: data.success ? "Connection successful" : "Connection failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    },
    onError: () => {
      toast({ title: "Test failed", variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enable }: { id: string; enable: boolean }) => {
      const res = await apiRequest("POST", `/api/integrations/${id}/${enable ? "enable" : "disable"}`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: data.isEnabled ? "Integration enabled" : "Integration disabled" });
    },
    onError: () => {
      toast({ title: "Failed to toggle integration", variant: "destructive" });
    },
  });

  const handleSaveCredentials = () => {
    if (!editingIntegration) return;
    
    const fields = credentialFields[editingIntegration.provider] || [];
    const credentials: Record<string, string> = {};
    fields.forEach(field => {
      if (credentialValues[field.key]) {
        credentials[field.key] = credentialValues[field.key];
      }
    });
    
    updateMutation.mutate({
      id: editingIntegration.id,
      data: { credentials }
    });
  };

  const handleCopyApiKey = async () => {
    if (!apiKey) return;
    
    try {
      await navigator.clipboard.writeText(apiKey);
      toast({
        title: "API Key copied to clipboard",
        description: "You can now paste it in your applications",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please select and copy manually",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "connected":
        return <Badge variant="default" className="bg-green-600"><Check className="w-3 h-3 mr-1" /> Connected</Badge>;
      case "error":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Error</Badge>;
      case "disconnected":
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Disconnected</Badge>;
      default:
        return <Badge variant="outline">Not Configured</Badge>;
    }
  };

  const groupedIntegrations = integrations?.reduce((acc, integration) => {
    const category = integration.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>) || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-muted-foreground">
            Manage external service connections and API credentials
          </p>
        </div>
      </div>

      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-medium text-muted-foreground">
            {categoryLabels[category] || category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryIntegrations.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        {iconMap[integration.icon || "settings"] || <Settings className="w-5 h-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.displayName}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(integration.status)}
                    <Switch
                      checked={integration.isEnabled || false}
                      onCheckedChange={(checked) => 
                        toggleMutation.mutate({ id: integration.id, enable: checked })
                      }
                      disabled={integration.status === "not_configured"}
                      data-testid={`switch-enable-${integration.provider}`}
                    />
                  </div>
                  
                  {integration.lastTestedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last tested: {new Date(integration.lastTestedAt).toLocaleString()}
                    </p>
                  )}
                  
                  {integration.testResult && integration.status === "error" && (
                    <p className="text-xs text-destructive">
                      {integration.testResult}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingIntegration(integration);
                        setCredentialValues({});
                        setApiKey(null);
                      }}
                      data-testid={`button-configure-${integration.provider}`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testMutation.mutate(integration.id)}
                      disabled={integration.status === "not_configured" || testMutation.isPending}
                      data-testid={`button-test-${integration.provider}`}
                    >
                      {testMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={!!editingIntegration} onOpenChange={(open) => { if (!open) { setEditingIntegration(null); setApiKey(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {editingIntegration?.displayName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {editingIntegration && credentialFields[editingIntegration.provider]?.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={editingIntegration.credentials ? "********" : `Enter ${field.label.toLowerCase()}`}
                  value={credentialValues[field.key] || ""}
                  onChange={(e) => setCredentialValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  data-testid={`input-${editingIntegration.provider}-${field.key}`}
                />
              </div>
            ))}
            
            {editingIntegration?.credentials ? (
              <p className="text-sm text-muted-foreground">
                Credentials are already configured. Enter new values to update them.
              </p>
            ) : null}

            {editingIntegration?.provider === "connexcs" && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <Label className="font-medium">API Key (30-day Refresh Token)</Label>
                </div>
                
                {apiKey ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={apiKey}
                        className="font-mono text-xs"
                        data-testid="input-connexcs-api-key"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyApiKey}
                        data-testid="button-copy-api-key"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Copy this API key now. It will not be shown again after closing this dialog.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    API Key will be auto-generated when you save your username and password.
                  </p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIntegration(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCredentials}
              disabled={updateMutation.isPending || Object.keys(credentialValues).length === 0}
              data-testid="button-save-credentials"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
