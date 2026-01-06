import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Server, 
  Users, 
  Phone, 
  FileText,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Settings,
  Key
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConnexCSStatus {
  connected: boolean;
  mockMode: boolean;
  message: string;
  tokenDaysRemaining?: number;
  lastSync?: string;
  error?: string;
  stats?: {
    carriers: number;
    customers: number;
    rateCards: number;
    routes: number;
    cdrs: number;
  };
}

export default function ConnexCSStatusPage() {
  const { toast } = useToast();

  const { data: status, isLoading, refetch, isRefetching } = useQuery<ConnexCSStatus>({
    queryKey: ["/api/connexcs/status/detailed"],
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/connexcs/test-connection");
    },
    onSuccess: () => {
      toast({
        title: "Connection Test",
        description: "Connection test completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connexcs/status/detailed"] });
    },
    onError: (error) => {
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const syncDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/connexcs/sync");
    },
    onSuccess: () => {
      toast({
        title: "Sync Complete",
        description: "Data synchronized with ConnexCS",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connexcs/status/detailed"] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isConnected = status?.connected ?? false;
  const isMockMode = status?.mockMode ?? true;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ConnexCS Integration</h1>
          <p className="text-muted-foreground">
            Manage your ConnexCS switching platform connection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            data-testid="button-refresh-status"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => syncDataMutation.mutate()}
            disabled={syncDataMutation.isPending || isMockMode}
            data-testid="button-sync-data"
          >
            {syncDataMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Sync Data
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card data-testid="card-connection-status">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <Cloud className="h-5 w-5 text-green-500" />
              ) : isMockMode ? (
                <CloudOff className="h-5 w-5 text-yellow-500" />
              ) : (
                <CloudOff className="h-5 w-5 text-destructive" />
              )}
              Connection Status
            </CardTitle>
            <CardDescription>Current connection state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge 
                variant={isConnected ? "default" : isMockMode ? "secondary" : "destructive"}
              >
                {isConnected ? "Connected" : isMockMode ? "Mock Mode" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Message</span>
              <span className="text-sm text-right max-w-[200px] truncate" title={status?.message}>
                {status?.message || "Unknown"}
              </span>
            </div>
            {status?.tokenDaysRemaining !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Token Expires</span>
                <span className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {status.tokenDaysRemaining} days
                </span>
              </div>
            )}
            {status?.lastSync && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm">
                  {new Date(status.lastSync).toLocaleString()}
                </span>
              </div>
            )}
            {status?.error && (
              <div className="p-2 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive">{status.error}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => testConnectionMutation.mutate()}
              disabled={testConnectionMutation.isPending || isMockMode}
              data-testid="button-test-connection"
            >
              {testConnectionMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-api-stats">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              API Statistics
            </CardTitle>
            <CardDescription>ConnexCS resource counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Carriers
              </span>
              <Badge variant="secondary">{status?.stats?.carriers ?? 0}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Customers
              </span>
              <Badge variant="secondary">{status?.stats?.customers ?? 0}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Rate Cards
              </span>
              <Badge variant="secondary">{status?.stats?.rateCards ?? 0}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                Routes
              </span>
              <Badge variant="secondary">{status?.stats?.routes ?? 0}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                Recent CDRs
              </span>
              <Badge variant="secondary">{status?.stats?.cdrs ?? 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-configuration">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Integration settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {isMockMode 
                  ? "ConnexCS credentials are not configured. The platform is running in demo mode with sample data."
                  : "ConnexCS is configured and connected. All data is synchronized with your switching platform."
                }
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Required Credentials</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  {isMockMode ? (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span>Username</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isMockMode ? (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span>Password</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = "/admin/integrations"}
              data-testid="button-configure-credentials"
            >
              <Key className="h-4 w-4 mr-2" />
              Configure Credentials
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-features">
        <CardHeader>
          <CardTitle>ConnexCS Features</CardTitle>
          <CardDescription>
            Available ConnexCS integration capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-md border">
              <h4 className="font-medium mb-1">Carriers</h4>
              <p className="text-sm text-muted-foreground">
                Sync carrier configurations, channels, and CPS limits
              </p>
            </div>
            <div className="p-4 rounded-md border">
              <h4 className="font-medium mb-1">Rate Cards</h4>
              <p className="text-sm text-muted-foreground">
                Manage termination and origination rate cards
              </p>
            </div>
            <div className="p-4 rounded-md border">
              <h4 className="font-medium mb-1">Routing</h4>
              <p className="text-sm text-muted-foreground">
                Configure LCR routes and failover strategies
              </p>
            </div>
            <div className="p-4 rounded-md border">
              <h4 className="font-medium mb-1">CDR Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Query call records with SQL for detailed analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
