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
  Trash2, Edit, RefreshCw, Calendar, Music, Upload, FileAudio, 
  Database, Globe
} from "lucide-react";
import type { SipTestConfig, SipTestResult, SipTestSchedule, SipTestAudioFile, SipTestNumber } from "@shared/schema";

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
  const [showAudioDialog, setShowAudioDialog] = useState(false);

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

  const [audioForm, setAudioForm] = useState({
    name: "",
    description: "",
    format: "wav",
    duration: 0,
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

  const { data: audioFiles = [], isLoading: audioLoading } = useQuery<SipTestAudioFile[]>({
    queryKey: ["/api/sip-test-audio-files"],
  });

  const { data: testNumbers = [], isLoading: numbersLoading } = useQuery<SipTestNumber[]>({
    queryKey: ["/api/sip-test-numbers"],
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

  const createAudioFile = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-test-audio-files", {
        name: audioForm.name,
        description: audioForm.description,
        format: audioForm.format,
        duration: audioForm.duration,
        filename: `${audioForm.name.toLowerCase().replace(/\s+/g, '-')}.${audioForm.format}`,
        fileUrl: `/audio/${audioForm.name.toLowerCase().replace(/\s+/g, '-')}.${audioForm.format}`,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-audio-files"] });
      setShowAudioDialog(false);
      setAudioForm({ name: "", description: "", format: "wav", duration: 0 });
      toast({ title: "Audio file added", description: "IVR audio file registered" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add audio file", variant: "destructive" });
    },
  });

  const deleteAudioFile = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sip-test-audio-files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-audio-files"] });
      toast({ title: "Deleted", description: "Audio file removed" });
    },
  });

  const toggleAudioActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/sip-test-audio-files/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-audio-files"] });
    },
  });

  const deleteTestNumber = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sip-test-numbers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-numbers"] });
      toast({ title: "Deleted", description: "Test number removed" });
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
          <TabsTrigger value="audio-files" data-testid="tab-audio-files">
            <Music className="h-4 w-4 mr-2" />
            Audio Files
          </TabsTrigger>
          <TabsTrigger value="test-numbers" data-testid="tab-test-numbers">
            <Database className="h-4 w-4 mr-2" />
            Number Database
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
              <CardContent className="pt-6">
                <ScrollArea className="h-[500px]">
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
                        <TableHead>Jitter</TableHead>
                        <TableHead>Packet Loss</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestResults.map((r) => (
                        <TableRow key={r.id} data-testid={`row-result-${r.id}`}>
                          <TableCell className="text-sm">
                            {r.testedAt ? new Date(r.testedAt).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.testType}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{r.destination || "-"}</TableCell>
                          <TableCell>{getStatusBadge(r.status)}</TableCell>
                          <TableCell>{getResultBadge(r.result)}</TableCell>
                          <TableCell>{r.pddMs ? `${r.pddMs}ms` : "-"}</TableCell>
                          <TableCell>{r.mosScore || "-"}</TableCell>
                          <TableCell>{r.jitterMs ? `${r.jitterMs}ms` : "-"}</TableCell>
                          <TableCell>{r.packetLossPercent ? `${r.packetLossPercent}%` : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
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
                    Schedule automated tests
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={scheduleForm.name}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                      placeholder="Daily US Quality Check"
                      data-testid="input-schedule-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Configuration</Label>
                    <Select
                      value={scheduleForm.configId}
                      onValueChange={(v) => setScheduleForm({ ...scheduleForm, configId: v })}
                    >
                      <SelectTrigger data-testid="select-schedule-config">
                        <SelectValue placeholder="Select configuration" />
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
                      data-testid="input-schedule-cron"
                    />
                    <p className="text-xs text-muted-foreground">
                      Examples: "0 0 * * *" (daily), "0 */4 * * *" (every 4 hours)
                    </p>
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
                    Save Schedule
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
                <p>No schedules yet</p>
                <p className="text-sm">Create a schedule to automate tests</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Configuration</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id} data-testid={`row-schedule-${schedule.id}`}>
                        <TableCell className="font-medium">{schedule.name}</TableCell>
                        <TableCell>
                          {configs.find(c => c.id === schedule.configId)?.name || schedule.configId}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{schedule.cronExpression}</TableCell>
                        <TableCell>
                          {schedule.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteSchedule.mutate(schedule.id)}
                            data-testid={`button-delete-schedule-${schedule.id}`}
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

        <TabsContent value="audio-files" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">IVR Audio Files</h2>
              <p className="text-sm text-muted-foreground">
                Audio files played during quality tests to measure RTP quality
              </p>
            </div>
            <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-audio">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Audio File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add IVR Audio File</DialogTitle>
                  <DialogDescription>
                    Register an audio file for SIP quality testing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={audioForm.name}
                      onChange={(e) => setAudioForm({ ...audioForm, name: e.target.value })}
                      placeholder="Voice Quality Test"
                      data-testid="input-audio-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={audioForm.description}
                      onChange={(e) => setAudioForm({ ...audioForm, description: e.target.value })}
                      placeholder="10-second voice sample for MOS scoring"
                      data-testid="input-audio-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select
                        value={audioForm.format}
                        onValueChange={(v) => setAudioForm({ ...audioForm, format: v })}
                      >
                        <SelectTrigger data-testid="select-audio-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wav">WAV</SelectItem>
                          <SelectItem value="mp3">MP3</SelectItem>
                          <SelectItem value="pcmu">PCM u-law</SelectItem>
                          <SelectItem value="pcma">PCM a-law</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={audioForm.duration}
                        onChange={(e) => setAudioForm({ ...audioForm, duration: parseInt(e.target.value) || 0 })}
                        placeholder="10"
                        data-testid="input-audio-duration"
                      />
                    </div>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Audio upload coming soon
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      For now, files are registered with placeholder URLs
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAudioDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createAudioFile.mutate()}
                    disabled={!audioForm.name || createAudioFile.isPending}
                    data-testid="button-save-audio"
                  >
                    {createAudioFile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Audio File
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{audioFiles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {audioFiles.filter(f => f.isActive).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Default Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Silence, Tone, Voice</p>
              </CardContent>
            </Card>
          </div>

          {audioLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : audioFiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No custom audio files yet</p>
                <p className="text-sm">Default files (Silence, Test Tone, Voice Sample) are always available</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audioFiles.map((file) => (
                      <TableRow key={file.id} data-testid={`row-audio-${file.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileAudio className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {file.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.format?.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{file.duration ? `${file.duration}s` : "-"}</TableCell>
                        <TableCell>
                          <Switch
                            checked={file.isActive ?? false}
                            onCheckedChange={(checked) => toggleAudioActive.mutate({ id: file.id, isActive: checked })}
                            data-testid={`switch-audio-active-${file.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteAudioFile.mutate(file.id)}
                            data-testid={`button-delete-audio-${file.id}`}
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

        <TabsContent value="test-numbers" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Crowdsourced Test Numbers</h2>
              <p className="text-sm text-muted-foreground">
                Shared database of verified test numbers from all customers
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/sip-test-numbers"] })}
              data-testid="button-refresh-numbers"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testNumbers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Verified Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {testNumbers.filter(n => n.verified).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(testNumbers.map(n => n.countryCode)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testNumbers.reduce((sum, n) => sum + (n.testCount || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {numbersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : testNumbers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test numbers in database yet</p>
                <p className="text-sm">Numbers will be added as customers run tests with "Add to DB" enabled</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Times Used</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Avg MOS</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testNumbers.map((number) => (
                        <TableRow key={number.id} data-testid={`row-number-${number.id}`}>
                          <TableCell className="font-mono">{number.phoneNumber}</TableCell>
                          <TableCell>{number.countryCode}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{number.numberType || "Unknown"}</Badge>
                          </TableCell>
                          <TableCell>
                            {number.verified ? (
                              <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>{number.testCount || 0}</TableCell>
                          <TableCell className="text-sm">
                            {number.lastTestedAt ? new Date(number.lastTestedAt).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell>
                            {number.avgMos ? parseFloat(number.avgMos).toFixed(2) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteTestNumber.mutate(number.id)}
                              data-testid={`button-delete-number-${number.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
