import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Play, Plus, Settings, Clock, Activity, CheckCircle2, XCircle, 
  AlertTriangle, Loader2, Phone, Signal, Zap, Timer, BarChart3,
  Trash2, Edit, RefreshCw, Calendar, Cloud
} from "lucide-react";
import type { SipTestConfig, SipTestResult, SipTestSchedule } from "@shared/schema";

const TEST_TYPES = [
  { value: "quick", label: "Quick Test", description: "Fast basic connectivity check" },
  { value: "quality", label: "Quality Test", description: "MOS, jitter, packet loss analysis" },
  { value: "pdd", label: "PDD Test", description: "Post-dial delay measurement" },
  { value: "dtmf", label: "DTMF Test", description: "Tone detection verification" },
  { value: "cli", label: "CLI Test", description: "Caller ID passthrough validation" },
  { value: "codec", label: "Codec Test", description: "Audio codec negotiation test" },
];

function getStatusBadge(status: string | null) {
  switch (status) {
    case "completed":
      return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case "running":
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
    case "failed":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case "timeout":
      return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Timeout</Badge>;
    default:
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  }
}

function getResultBadge(result: string | null) {
  switch (result) {
    case "pass":
      return <Badge variant="default">Pass</Badge>;
    case "fail":
      return <Badge variant="destructive">Fail</Badge>;
    case "partial":
      return <Badge variant="secondary">Partial</Badge>;
    default:
      return <Badge variant="outline">N/A</Badge>;
  }
}

export default function PortalSipTesterPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("quick-test");
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const [quickTestForm, setQuickTestForm] = useState({
    destination: "",
    testType: "quick",
    cliNumber: "",
  });

  const [configForm, setConfigForm] = useState({
    name: "",
    description: "",
    testType: "quick",
    destinations: "",
    cliNumber: "",
  });

  const { data: configs = [], isLoading: configsLoading } = useQuery<SipTestConfig[]>({
    queryKey: ["/api/my/sip-tests/configs"],
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery<SipTestResult[]>({
    queryKey: ["/api/my/sip-tests/results"],
  });

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<SipTestSchedule[]>({
    queryKey: ["/api/my/sip-tests/schedules"],
  });

  const runQuickTest = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/my/sip-tests/run", {
        testType: quickTestForm.testType,
        destination: quickTestForm.destination,
        cliSent: quickTestForm.cliNumber,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/sip-tests/results"] });
      toast({ title: "Test completed", description: "Quick test finished successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Test failed", description: error.message, variant: "destructive" });
    },
  });

  const createConfig = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/my/sip-tests/configs", {
        name: configForm.name,
        description: configForm.description,
        testType: configForm.testType,
        destinations: configForm.destinations.split(",").map(d => d.trim()).filter(Boolean),
        cliNumber: configForm.cliNumber,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/sip-tests/configs"] });
      toast({ title: "Config created", description: "Test configuration saved successfully" });
      setShowConfigDialog(false);
      setConfigForm({ name: "", description: "", testType: "quick", destinations: "", cliNumber: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/my/sip-tests/configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/sip-tests/configs"] });
      toast({ title: "Config deleted", description: "Test configuration removed" });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">SIP Tester</h1>
          <p className="text-muted-foreground">Test your VoIP routes for quality and connectivity</p>
        </div>
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-config">
              <Plus className="h-4 w-4 mr-2" />
              New Config
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Test Configuration</DialogTitle>
              <DialogDescription>
                Save a test configuration for repeated use
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={configForm.name}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Route Test"
                  data-testid="input-config-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={configForm.description}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of this test configuration..."
                  data-testid="input-config-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select
                  value={configForm.testType}
                  onValueChange={(v) => setConfigForm(prev => ({ ...prev, testType: v }))}
                >
                  <SelectTrigger data-testid="select-config-test-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEST_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destinations (comma separated)</Label>
                <Input
                  value={configForm.destinations}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, destinations: e.target.value }))}
                  placeholder="+18001234567, +442071234567"
                  data-testid="input-config-destinations"
                />
              </div>
              <div className="space-y-2">
                <Label>CLI Number</Label>
                <Input
                  value={configForm.cliNumber}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, cliNumber: e.target.value }))}
                  placeholder="+19876543210"
                  data-testid="input-config-cli"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigDialog(false)} data-testid="button-config-cancel">Cancel</Button>
              <Button onClick={() => createConfig.mutate()} disabled={createConfig.isPending || !configForm.name} data-testid="button-config-save">
                {createConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Config
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="quick-test" data-testid="tab-quick-test">
            <Zap className="h-4 w-4 mr-2" />
            Quick Test
          </TabsTrigger>
          <TabsTrigger value="configs" data-testid="tab-configs">
            <Settings className="h-4 w-4 mr-2" />
            Saved Configs
          </TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">
            <BarChart3 className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Test
              </CardTitle>
              <CardDescription>Run a one-time test to any destination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Destination Number</Label>
                  <Input
                    value={quickTestForm.destination}
                    onChange={(e) => setQuickTestForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="+18001234567"
                    data-testid="input-quick-destination"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select
                    value={quickTestForm.testType}
                    onValueChange={(v) => setQuickTestForm(prev => ({ ...prev, testType: v }))}
                  >
                    <SelectTrigger data-testid="select-quick-test-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CLI Number (optional)</Label>
                  <Input
                    value={quickTestForm.cliNumber}
                    onChange={(e) => setQuickTestForm(prev => ({ ...prev, cliNumber: e.target.value }))}
                    placeholder="+19876543210"
                    data-testid="input-quick-cli"
                  />
                </div>
              </div>
              <Button 
                onClick={() => runQuickTest.mutate()} 
                disabled={runQuickTest.isPending || !quickTestForm.destination}
                data-testid="button-run-quick-test"
              >
                {runQuickTest.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Test
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEST_TYPES.map(t => (
              <Card key={t.value} className="cursor-pointer hover-elevate" onClick={() => setQuickTestForm(prev => ({ ...prev, testType: t.value }))}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {t.value === "quick" && <Zap className="h-4 w-4 text-primary" />}
                    {t.value === "quality" && <Signal className="h-4 w-4 text-primary" />}
                    {t.value === "pdd" && <Timer className="h-4 w-4 text-primary" />}
                    {t.value === "dtmf" && <Phone className="h-4 w-4 text-primary" />}
                    {t.value === "cli" && <Activity className="h-4 w-4 text-primary" />}
                    {t.value === "codec" && <Settings className="h-4 w-4 text-primary" />}
                    <span className="font-medium text-sm">{t.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Configurations</CardTitle>
              <CardDescription>Reusable test configurations for your routes</CardDescription>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : configs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved configurations yet</p>
                  <p className="text-sm">Create a config to save your test settings</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destinations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config.id} data-testid={`row-config-${config.id}`}>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {config.isShared && (
                              <Cloud className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-medium">{config.name}</div>
                              {config.description && (
                                <div className="text-xs text-muted-foreground">{config.description}</div>
                              )}
                              {config.isShared && (
                                <Badge variant="secondary" className="text-xs mt-1">Smart Sync</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{config.testType}</Badge>
                        </TableCell>
                        <TableCell>
                          {config.destinations?.length || 0} destination(s)
                        </TableCell>
                        <TableCell>
                          {config.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" data-testid={`button-run-config-${config.id}`}>
                              <Play className="h-4 w-4" />
                            </Button>
                            {!config.isShared && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => deleteConfig.mutate(config.id)}
                                data-testid={`button-delete-config-${config.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>History of your SIP tests</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/my/sip-tests/results"] })} data-testid="button-refresh-results">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet</p>
                  <p className="text-sm">Run a quick test to see results here</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>PDD</TableHead>
                        <TableHead>MOS</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                          <TableCell>
                            <Badge variant="outline">{result.testType}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{result.destination || "-"}</TableCell>
                          <TableCell>{getStatusBadge(result.status)}</TableCell>
                          <TableCell>{getResultBadge(result.result)}</TableCell>
                          <TableCell>{result.pddMs ? `${result.pddMs}ms` : "-"}</TableCell>
                          <TableCell>{result.mosScore || "-"}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {result.createdAt ? new Date(result.createdAt).toLocaleString() : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
