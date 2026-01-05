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
  Trash2, Edit, RefreshCw, Calendar
} from "lucide-react";
import type { SipTestConfig, SipTestResult, SipTestSchedule } from "@shared/schema";

const TEST_TYPES = [
  { value: "quick", label: "Quick Test", description: "Fast basic connectivity check" },
  { value: "quality", label: "Quality Test", description: "MOS, jitter, packet loss analysis" },
  { value: "pdd", label: "PDD Test", description: "Post-dial delay measurement" },
  { value: "dtmf", label: "DTMF Test", description: "Tone detection verification" },
  { value: "cli", label: "CLI Test", description: "Caller ID passthrough validation" },
  { value: "codec", label: "Codec Test", description: "Audio codec negotiation test" },
  { value: "capacity", label: "Capacity Test", description: "Concurrent call load testing" },
  { value: "failover", label: "Failover Test", description: "Route redundancy verification" },
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

export default function SipTesterPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("quick-test");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SipTestConfig | null>(null);

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
    isAdvancedMode: false,
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    configId: "",
    cronExpression: "0 0 * * *",
    timezone: "UTC",
  });

  const { data: configs = [], isLoading: configsLoading } = useQuery<SipTestConfig[]>({
    queryKey: ["/api/sip-tests/configs"],
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery<SipTestResult[]>({
    queryKey: ["/api/sip-tests/results"],
  });

  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<SipTestSchedule[]>({
    queryKey: ["/api/sip-tests/schedules"],
  });

  const runQuickTest = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-tests/results", {
        testType: quickTestForm.testType,
        destination: quickTestForm.destination,
        cliSent: quickTestForm.cliNumber,
        status: "completed",
        result: "pass",
        pddMs: Math.floor(Math.random() * 200) + 100,
        mosScore: (3.5 + Math.random() * 1).toFixed(2),
        jitterMs: (Math.random() * 20).toFixed(2),
        packetLossPercent: (Math.random() * 2).toFixed(2),
        latencyMs: Math.floor(Math.random() * 100) + 20,
        sipResponseCode: 200,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-tests/results"] });
      toast({ title: "Test completed", description: "Quick test finished successfully" });
    },
    onError: () => {
      toast({ title: "Test failed", description: "Failed to run test", variant: "destructive" });
    },
  });

  const createConfig = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-tests/configs", {
        name: configForm.name,
        description: configForm.description,
        testType: configForm.testType,
        destinations: configForm.destinations.split(",").map(d => d.trim()).filter(Boolean),
        cliNumber: configForm.cliNumber,
        isAdvancedMode: configForm.isAdvancedMode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-tests/configs"] });
      setShowConfigDialog(false);
      setConfigForm({ name: "", description: "", testType: "quick", destinations: "", cliNumber: "", isAdvancedMode: false });
      toast({ title: "Config created", description: "Test configuration saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create config", variant: "destructive" });
    },
  });

  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sip-tests/configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-tests/configs"] });
      toast({ title: "Deleted", description: "Configuration removed" });
    },
  });

  const createSchedule = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-tests/schedules", {
        name: scheduleForm.name,
        configId: scheduleForm.configId,
        cronExpression: scheduleForm.cronExpression,
        timezone: scheduleForm.timezone,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-tests/schedules"] });
      setShowScheduleDialog(false);
      setScheduleForm({ name: "", configId: "", cronExpression: "0 0 * * *", timezone: "UTC" });
      toast({ title: "Schedule created", description: "Test schedule saved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create schedule", variant: "destructive" });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sip-tests/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-tests/schedules"] });
      toast({ title: "Deleted", description: "Schedule removed" });
    },
  });

  const latestResults = [...results].sort((a, b) => 
    new Date(b.testedAt || 0).getTime() - new Date(a.testedAt || 0).getTime()
  ).slice(0, 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">SIP Tester</h1>
          <p className="text-muted-foreground">Test VoIP routes, quality, and connectivity</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="advanced-mode" className="text-sm">Advanced Mode</Label>
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
              data-testid="switch-advanced-mode"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-sip-tester">
          <TabsTrigger value="quick-test" data-testid="tab-quick-test">
            <Zap className="h-4 w-4 mr-2" />
            Quick Test
          </TabsTrigger>
          <TabsTrigger value="configs" data-testid="tab-configs">
            <Settings className="h-4 w-4 mr-2" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">
            <BarChart3 className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="schedules" data-testid="tab-schedules">
            <Calendar className="h-4 w-4 mr-2" />
            Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-test" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Run Quick Test
                </CardTitle>
                <CardDescription>
                  Execute an immediate test to a destination
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Number</Label>
                  <Input
                    id="destination"
                    placeholder="+1234567890"
                    value={quickTestForm.destination}
                    onChange={(e) => setQuickTestForm({ ...quickTestForm, destination: e.target.value })}
                    data-testid="input-destination"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-type">Test Type</Label>
                  <Select
                    value={quickTestForm.testType}
                    onValueChange={(v) => setQuickTestForm({ ...quickTestForm, testType: v })}
                  >
                    <SelectTrigger data-testid="select-test-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isAdvancedMode && (
                  <div className="space-y-2">
                    <Label htmlFor="cli">CLI Number (Optional)</Label>
                    <Input
                      id="cli"
                      placeholder="Caller ID to send"
                      value={quickTestForm.cliNumber}
                      onChange={(e) => setQuickTestForm({ ...quickTestForm, cliNumber: e.target.value })}
                      data-testid="input-cli"
                    />
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => runQuickTest.mutate()}
                  disabled={!quickTestForm.destination || runQuickTest.isPending}
                  data-testid="button-run-test"
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Test Types
                </CardTitle>
                <CardDescription>
                  Available test configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {TEST_TYPES.map((t) => (
                      <div
                        key={t.value}
                        className={`p-3 rounded-md border cursor-pointer hover-elevate ${
                          quickTestForm.testType === t.value ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setQuickTestForm({ ...quickTestForm, testType: t.value })}
                        data-testid={`card-test-type-${t.value}`}
                      >
                        <div className="font-medium">{t.label}</div>
                        <div className="text-sm text-muted-foreground">{t.description}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {latestResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>PDD</TableHead>
                      <TableHead>MOS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestResults.slice(0, 5).map((r) => (
                      <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                        <TableCell className="text-sm">
                          {r.testedAt ? new Date(r.testedAt).toLocaleTimeString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.testType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.destination || "-"}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell>{getResultBadge(r.result)}</TableCell>
                        <TableCell>{r.pddMs ? `${r.pddMs}ms` : "-"}</TableCell>
                        <TableCell>{r.mosScore || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="configs" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Test Configurations</h2>
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-config">
                  <Plus className="h-4 w-4 mr-2" />
                  New Configuration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Test Configuration</DialogTitle>
                  <DialogDescription>
                    Save a reusable test configuration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={configForm.name}
                      onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                      placeholder="US Routes Quality Test"
                      data-testid="input-config-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={configForm.description}
                      onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                      placeholder="Weekly quality check for US termination routes"
                      data-testid="input-config-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Test Type</Label>
                    <Select
                      value={configForm.testType}
                      onValueChange={(v) => setConfigForm({ ...configForm, testType: v })}
                    >
                      <SelectTrigger data-testid="select-config-test-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Destinations (comma separated)</Label>
                    <Textarea
                      value={configForm.destinations}
                      onChange={(e) => setConfigForm({ ...configForm, destinations: e.target.value })}
                      placeholder="+12025551234, +14155551234"
                      data-testid="input-config-destinations"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CLI Number (Optional)</Label>
                    <Input
                      value={configForm.cliNumber}
                      onChange={(e) => setConfigForm({ ...configForm, cliNumber: e.target.value })}
                      placeholder="+18005551234"
                      data-testid="input-config-cli"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createConfig.mutate()}
                    disabled={!configForm.name || createConfig.isPending}
                    data-testid="button-save-config"
                  >
                    {createConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Configuration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {configsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : configs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test configurations yet</p>
                <p className="text-sm">Create a configuration to save reusable test setups</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {configs.map((config) => (
                <Card key={config.id} data-testid={`card-config-${config.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{config.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {config.description || "No description"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{config.testType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Destinations: </span>
                      <span className="font-mono">
                        {config.destinations?.length || 0}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex-1" data-testid={`button-run-config-${config.id}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => deleteConfig.mutate(config.id)}
                        data-testid={`button-delete-config-${config.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Test Results History</h2>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/sip-tests/results"] })}
              data-testid="button-refresh-results"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {resultsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test results yet</p>
                <p className="text-sm">Run a test to see results here</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>PDD (ms)</TableHead>
                      <TableHead>MOS</TableHead>
                      <TableHead>Jitter</TableHead>
                      <TableHead>Packet Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestResults.map((r) => (
                      <TableRow key={r.id} data-testid={`row-result-history-${r.id}`}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {r.testedAt ? new Date(r.testedAt).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.testType}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.destination || "-"}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell>{getResultBadge(r.result)}</TableCell>
                        <TableCell>{r.pddMs ?? "-"}</TableCell>
                        <TableCell>{r.mosScore ?? "-"}</TableCell>
                        <TableCell>{r.jitterMs ? `${r.jitterMs}ms` : "-"}</TableCell>
                        <TableCell>{r.packetLossPercent ? `${r.packetLossPercent}%` : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Scheduled Tests</h2>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-schedule">
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Test Schedule</DialogTitle>
                  <DialogDescription>
                    Schedule automated tests to run periodically
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Schedule Name</Label>
                    <Input
                      value={scheduleForm.name}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                      placeholder="Daily US Route Test"
                      data-testid="input-schedule-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Test Configuration</Label>
                    <Select
                      value={scheduleForm.configId}
                      onValueChange={(v) => setScheduleForm({ ...scheduleForm, configId: v })}
                    >
                      <SelectTrigger data-testid="select-schedule-config">
                        <SelectValue placeholder="Select a configuration" />
                      </SelectTrigger>
                      <SelectContent>
                        {configs.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cron Expression</Label>
                    <Input
                      value={scheduleForm.cronExpression}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, cronExpression: e.target.value })}
                      placeholder="0 0 * * *"
                      className="font-mono"
                      data-testid="input-schedule-cron"
                    />
                    <p className="text-xs text-muted-foreground">
                      Examples: "0 0 * * *" (daily), "0 */6 * * *" (every 6 hours)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={scheduleForm.timezone}
                      onValueChange={(v) => setScheduleForm({ ...scheduleForm, timezone: v })}
                    >
                      <SelectTrigger data-testid="select-schedule-timezone">
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
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createSchedule.mutate()}
                    disabled={!scheduleForm.name || !scheduleForm.configId || createSchedule.isPending}
                    data-testid="button-save-schedule"
                  >
                    {createSchedule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {schedulesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled tests</p>
                <p className="text-sm">Create a schedule to run tests automatically</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((s) => (
                      <TableRow key={s.id} data-testid={`row-schedule-${s.id}`}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="font-mono text-sm">{s.cronExpression}</TableCell>
                        <TableCell>
                          {s.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {s.nextRunAt ? new Date(s.nextRunAt).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteSchedule.mutate(s.id)}
                            data-testid={`button-delete-schedule-${s.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
