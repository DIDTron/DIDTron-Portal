import { useState } from "react";
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
  Key,
  Terminal,
  Play,
  HardDrive,
  Code,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConnexCSStatus {
  connected: boolean;
  mockMode: boolean;
  message: string;
  tokenDaysRemaining?: number;
  lastSync?: string;
  error?: string;
  warning?: string;
  tokenExpiringSoon?: boolean;
  stats?: {
    carriers: number;
    customers: number;
    rateCards: number;
    routes: number;
    cdrs: number;
  };
}

interface SQLQueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
}

export default function ConnexCSStatusPage() {
  const { toast } = useToast();
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM cdr WHERE dt > DATE_SUB(NOW(), INTERVAL 1 DAY) LIMIT 10");
  const [queryResult, setQueryResult] = useState<SQLQueryResult | null>(null);

  const { data: status, isLoading, refetch, isRefetching } = useQuery<ConnexCSStatus>({
    queryKey: ["/api/connexcs/status/detailed"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
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

  const executeSQLMutation = useMutation({
    mutationFn: async (sql: string) => {
      const res = await apiRequest("POST", "/api/connexcs/sql", { sql });
      return res.json();
    },
    onSuccess: (data) => {
      setQueryResult(data);
      if (data.success) {
        toast({
          title: "Query Executed",
          description: `Returned ${data.rowCount || 0} rows`,
        });
      }
    },
    onError: (error) => {
      setQueryResult({ 
        success: false, 
        error: error instanceof Error ? error.message : "Query failed" 
      });
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const testJWTAuthMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/connexcs/tools/test-auth");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        if (data.tokenExpiringSoon) {
          toast({
            title: "JWT Auth Test Passed (Warning)",
            description: data.warning || `Token expires in ${data.tokenDaysRemaining} days - will auto-renew`,
          });
        } else {
          toast({
            title: "JWT Auth Test Passed",
            description: `Token valid for ${data.tokenDaysRemaining} days`,
          });
        }
      } else {
        toast({
          title: "JWT Auth Test Failed",
          description: data.error || data.message,
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/connexcs/status/detailed"] });
    },
    onError: (error) => {
      toast({
        title: "JWT Auth Test Failed",
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
            Powered by connexcs-tools - JWT auth, SQL queries, KV store
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
                <span className={`text-sm flex items-center gap-1 ${status.tokenExpiringSoon ? "text-yellow-600 dark:text-yellow-400 font-medium" : ""}`}>
                  {status.tokenExpiringSoon ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {status.tokenDaysRemaining} days
                </span>
              </div>
            )}
            {status?.warning && (
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {status.warning}
                </p>
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
              onClick={() => window.location.href = "/admin/settings/integrations"}
              data-testid="button-configure-credentials"
            >
              <Key className="h-4 w-4 mr-2" />
              Configure Credentials
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features" data-testid="tab-features">
            <Code className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="sql" data-testid="tab-sql">
            <Terminal className="h-4 w-4 mr-2" />
            SQL Console
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card data-testid="card-features">
            <CardHeader>
              <CardTitle>ConnexCS Tools Features</CardTitle>
              <CardDescription>
                Available capabilities from the connexcs-tools integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-md border space-y-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">SQL Queries</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Execute SQL queries directly against ConnexCS CDR database for advanced analytics
                  </p>
                </div>
                <div className="p-4 rounded-md border space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">JWT Auth</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Secure 30-day refresh tokens with automatic renewal when expiring
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => testJWTAuthMutation.mutate()}
                    disabled={testJWTAuthMutation.isPending || isMockMode}
                    data-testid="button-test-jwt-auth"
                  >
                    {testJWTAuthMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Test JWT Auth
                  </Button>
                </div>
                <div className="p-4 rounded-md border space-y-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">KV Store</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Key-value storage for caching rate cards and syncing configurations
                  </p>
                </div>
                <div className="p-4 rounded-md border space-y-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">ScriptForge</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Run server-side scripts for custom rating logic and call processing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sql">
          <Card data-testid="card-sql-console">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                SQL Query Console
              </CardTitle>
              <CardDescription>
                Execute SQL queries against ConnexCS CDR database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="SELECT * FROM cdr WHERE dt > DATE_SUB(NOW(), INTERVAL 1 DAY) LIMIT 10"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="font-mono text-sm min-h-[100px]"
                  data-testid="input-sql-query"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Available tables: cdr, customer, carrier, ratecard, route
                  </p>
                  <Button
                    onClick={() => executeSQLMutation.mutate(sqlQuery)}
                    disabled={executeSQLMutation.isPending || isMockMode || !sqlQuery.trim()}
                    data-testid="button-execute-sql"
                  >
                    {executeSQLMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Execute Query
                  </Button>
                </div>
              </div>

              {queryResult && (
                <div className="space-y-2">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Results</h4>
                    {queryResult.success && (
                      <Badge variant="secondary">{queryResult.rowCount || 0} rows</Badge>
                    )}
                  </div>
                  {queryResult.success ? (
                    <div className="rounded-md border overflow-auto max-h-[400px]">
                      <pre className="p-4 text-xs font-mono">
                        {JSON.stringify(queryResult.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-4 bg-destructive/10 rounded-md">
                      <p className="text-sm text-destructive">{queryResult.error}</p>
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
