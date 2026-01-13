import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { 
  Play, Plus, Settings, Clock, Activity, CheckCircle2, XCircle, 
  AlertTriangle, Loader2, Phone, Signal, Zap, Timer, BarChart3,
  Trash2, Edit, RefreshCw, Calendar, Music, Upload, FileAudio, 
  Database, Globe, Search, Copy, Link, ChevronDown, ChevronRight,
  Download, Import
} from "lucide-react";
import type { 
  SipTestAudioFile, SipTestNumber, SipTestRun, SipTestRunResult,
  VoiceTier, SipTestProfile, SipTestSupplier
} from "@shared/schema";

const COUNTRIES = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "BE", name: "Belgium", dialCode: "+32" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "CH", name: "Switzerland", dialCode: "+41" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "MX", name: "Mexico", dialCode: "+52" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "AR", name: "Argentina", dialCode: "+54" },
  { code: "CL", name: "Chile", dialCode: "+56" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "KR", name: "South Korea", dialCode: "+82" },
];

const CODECS = ["G729", "G711a", "G711u", "OPUS", "AMR", "AMR-WB"];

const DEFAULT_TIERS = [
  { id: "tier-standard", name: "Standard", codec: "G729" },
  { id: "tier-premium", name: "Premium", codec: "G729" },
  { id: "tier-platinum", name: "Platinum", codec: "G711a" },
  { id: "tier-diamond", name: "Diamond", codec: "G711a" },
];

function getStatusBadge(status: string | null) {
  switch (status) {
    case "completed":
      return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case "running":
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
    case "failed":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    default:
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  }
}

function getResultCircle(result: string | null, label: string) {
  let bgColor = "bg-muted";
  if (result === "pass") bgColor = "bg-green-500";
  else if (result === "fail") bgColor = "bg-red-500";
  else if (result === "partial") bgColor = "bg-yellow-500";
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-6 h-6 rounded-full ${bgColor}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function NewTestPage() {
  const { toast } = useToast();
  const [testType, setTestType] = useState("standard");
  const [testName, setTestName] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState("");
  const [addToDb, setAddToDb] = useState(false);
  const [useFromDb, setUseFromDb] = useState(false);
  const [codec, setCodec] = useState("G729");
  const [audioFile, setAudioFile] = useState("none");
  const [capacity, setCapacity] = useState("1");
  const [aniMode, setAniMode] = useState("any");
  const [showAniPopup, setShowAniPopup] = useState(false);
  const [aniCountries, setAniCountries] = useState<string[]>([]);
  const [aniSearch, setAniSearch] = useState("");

  const { data: profiles = [] } = useQuery<SipTestProfile[]>({
    queryKey: ["/api/sip-test-profiles"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const { data: suppliers = [] } = useQuery<SipTestSupplier[]>({
    queryKey: ["/api/sip-test-suppliers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: voiceTiers = [] } = useQuery<VoiceTier[]>({
    queryKey: ["/api/voice-tiers"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const { data: audioFiles = [] } = useQuery<SipTestAudioFile[]>({
    queryKey: ["/api/sip-test-audio-files"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const runTest = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-test-runs", {
        testName,
        testMode: testType,
        routeSource: "tier",
        supplierIds: selectedSuppliers,
        destinations: selectedCountries,
        manualNumbers: manualNumbers.split("\n").filter(Boolean),
        addToDb,
        useDbNumbers: useFromDb,
        codec,
        audioFileId: audioFile === "none" ? null : audioFile,
        aniMode,
        aniCountries,
        capacity: parseInt(capacity),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-runs"] });
      toast({ title: "Test started", description: "SIP test is now running" });
    },
    onError: () => {
      toast({ title: "Test failed", description: "Failed to start test", variant: "destructive" });
    },
  });

  const allSuppliers = [
    ...DEFAULT_TIERS.map(t => ({ ...t, isOurTier: true })),
    ...suppliers.filter(s => s.isActive),
  ];

  const filteredSuppliers = allSuppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredAniCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(aniSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(aniSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">New Test</h1>
          <p className="text-muted-foreground">Configure and run a SIP quality test</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger data-testid="select-test-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="cli">CLI Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Test Name</Label>
                  <Input 
                    value={testName} 
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Enter test name"
                    data-testid="input-test-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile (SBC Server)</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger data-testid="select-profile">
                    <SelectValue placeholder="Select a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.ip}:{p.port})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-base font-medium">Suppliers</Label>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      placeholder="Search suppliers..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      data-testid="input-supplier-search"
                    />
                  </div>
                </div>
                
                <ScrollArea className="h-48 border rounded-md p-2">
                  <div className="space-y-2">
                    {filteredSuppliers.map((supplier) => (
                      <div key={supplier.id} className="flex items-center gap-3 p-2 hover-elevate rounded-md">
                        <Checkbox
                          checked={selectedSuppliers.includes(supplier.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSuppliers([...selectedSuppliers, supplier.id]);
                            } else {
                              setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplier.id));
                            }
                          }}
                          data-testid={`checkbox-supplier-${supplier.id}`}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.codec} {supplier.isOurTier && <Badge variant="secondary" className="ml-2">Our Tier</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Destinations</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Countries</Label>
                    <ScrollArea className="h-40 border rounded-md p-2">
                      <div className="space-y-1">
                        {COUNTRIES.map((country) => (
                          <div key={country.code} className="flex items-center gap-2 p-1">
                            <Checkbox
                              checked={selectedCountries.includes(country.code)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCountries([...selectedCountries, country.code]);
                                } else {
                                  setSelectedCountries(selectedCountries.filter(c => c !== country.code));
                                }
                              }}
                              data-testid={`checkbox-country-${country.code}`}
                            />
                            <span className="text-sm">{country.name} ({country.dialCode})</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Manual Numbers (one per line)</Label>
                    <Textarea 
                      value={manualNumbers}
                      onChange={(e) => setManualNumbers(e.target.value)}
                      placeholder="+14155551234&#10;+442071234567"
                      className="h-40 resize-none"
                      data-testid="textarea-manual-numbers"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={addToDb} 
                      onCheckedChange={(c) => setAddToDb(c === true)}
                      data-testid="checkbox-add-to-db"
                    />
                    <Label>Add results to database</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={useFromDb} 
                      onCheckedChange={(c) => setUseFromDb(c === true)}
                      data-testid="checkbox-use-from-db"
                    />
                    <Label>Use numbers from database</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Codec</Label>
                <Select value={codec} onValueChange={setCodec}>
                  <SelectTrigger data-testid="select-codec">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CODECS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Audio File</Label>
                <Select value={audioFile} onValueChange={setAudioFile}>
                  <SelectTrigger data-testid="select-audio">
                    <SelectValue placeholder="Select audio file" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {audioFiles.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Capacity (concurrent calls)</Label>
                <Select value={capacity} onValueChange={setCapacity}>
                  <SelectTrigger data-testid="select-capacity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 call</SelectItem>
                    <SelectItem value="5">5 calls</SelectItem>
                    <SelectItem value="10">10 calls</SelectItem>
                    <SelectItem value="25">25 calls</SelectItem>
                    <SelectItem value="50">50 calls</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ANI (Caller ID)</Label>
                <Select value={aniMode} onValueChange={(v) => {
                  setAniMode(v);
                  if (v === "any") {
                    setShowAniPopup(true);
                  }
                }}>
                  <SelectTrigger data-testid="select-ani">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => runTest.mutate()}
                disabled={runTest.isPending || selectedSuppliers.length === 0}
                data-testid="button-run-test"
              >
                {runTest.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Test
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Testing fee:</span>
                  <span>$0.0003/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination rate:</span>
                  <span>Per tier pricing</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Selected suppliers:</span>
                  <span>{selectedSuppliers.length}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Selected countries:</span>
                  <span>{selectedCountries.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAniPopup} onOpenChange={setShowAniPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select ANI Countries</DialogTitle>
            <DialogDescription>
              Choose which countries to use for caller ID numbers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9"
                placeholder="Search countries..."
                value={aniSearch}
                onChange={(e) => setAniSearch(e.target.value)}
                data-testid="input-ani-search"
              />
            </div>
            <ScrollArea className="h-64 border rounded-md p-2">
              <div className="space-y-1">
                {filteredAniCountries.map((country) => (
                  <div key={country.code} className="flex items-center gap-2 p-1">
                    <Checkbox
                      checked={aniCountries.includes(country.code)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAniCountries([...aniCountries, country.code]);
                        } else {
                          setAniCountries(aniCountries.filter(c => c !== country.code));
                        }
                      }}
                      data-testid={`checkbox-ani-${country.code}`}
                    />
                    <span className="text-sm">{country.name} ({country.dialCode})</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAniPopup(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAniPopup(false)} data-testid="button-confirm-ani">
              Confirm ({aniCountries.length} selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HistoryPage() {
  const { toast } = useToast();
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  const { data: testRuns = [], isLoading } = useQuery<SipTestRun[]>({
    queryKey: ["/api/sip-test-runs"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTests(newExpanded);
  };

  const copyShareLink = (id: string) => {
    const url = `${window.location.origin}/admin/sip-tester/history?test=${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Share link copied to clipboard" });
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Test History</h1>
          <p className="text-muted-foreground">View and analyze past test results</p>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/sip-test-runs"] })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Time Initiated</TableHead>
                <TableHead>Supplier / Profile</TableHead>
                <TableHead>Test Name / Codec</TableHead>
                <TableHead>Type / Status</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Extra Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testRuns.map((test) => (
                <>
                  <TableRow key={test.id} className="hover-elevate">
                    <TableCell>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => toggleExpanded(test.id)}
                        data-testid={`button-expand-${test.id}`}
                        aria-label={expandedTests.has(test.id) ? "Collapse" : "Expand"}
                        title={expandedTests.has(test.id) ? "Collapse" : "Expand"}
                      >
                        {expandedTests.has(test.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {test.createdAt ? new Date(test.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {test.supplierIds?.length || 0} supplier(s)
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{test.testName || 'Unnamed Test'}</div>
                      <div className="text-sm text-muted-foreground">{test.codec}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">{test.testMode}</Badge>
                        {getStatusBadge(test.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResultCircle(test.successfulCalls && test.totalCalls && test.successfulCalls > 0 ? "pass" : null, `T:${test.totalCalls || 0}`)}
                        {getResultCircle(test.successfulCalls && test.successfulCalls > 0 ? "pass" : null, `S:${test.successfulCalls || 0}`)}
                        {getResultCircle(test.failedCalls && test.failedCalls > 0 ? "fail" : null, `F:${test.failedCalls || 0}`)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>MOS: {test.avgMos || 'N/A'}</div>
                        <div>PDD: {test.avgPdd || 'N/A'}ms</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => copyShareLink(test.id)}
                          data-testid={`button-share-${test.id}`}
                          aria-label="Copy link"
                          title="Copy link"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          data-testid={`button-repeat-${test.id}`}
                          aria-label="Repeat test"
                          title="Repeat test"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedTests.has(test.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/50">
                        <TestCallDetails testRunId={test.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {testRuns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No test runs found. Run a new test to see results here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function TestCallDetails({ testRunId }: { testRunId: string }) {
  const { data: results = [], isLoading } = useQuery<SipTestRunResult[]>({
    queryKey: ["/api/sip-test-runs", testRunId, "results"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h4 className="font-medium mb-3">Individual Call Results</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>ANI</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SIP Code</TableHead>
            <TableHead>MOS</TableHead>
            <TableHead>PDD</TableHead>
            <TableHead>Jitter</TableHead>
            <TableHead>Loss</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.callIndex}</TableCell>
              <TableCell className="font-mono text-sm">{r.destination}</TableCell>
              <TableCell className="font-mono text-sm">{r.aniUsed || 'N/A'}</TableCell>
              <TableCell>{r.supplierName || r.tierName || 'N/A'}</TableCell>
              <TableCell>{getStatusBadge(r.status)}</TableCell>
              <TableCell>
                <Badge variant={r.sipResponseCode === 200 ? "default" : "destructive"}>
                  {r.sipResponseCode || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>{r.mosScore || 'N/A'}</TableCell>
              <TableCell>{r.pddMs ? `${r.pddMs}ms` : 'N/A'}</TableCell>
              <TableCell>{r.jitterMs ? `${r.jitterMs}ms` : 'N/A'}</TableCell>
              <TableCell>{r.packetLossPercent ? `${r.packetLossPercent}%` : 'N/A'}</TableCell>
              <TableCell>{r.durationSec ? `${r.durationSec}s` : 'N/A'}</TableCell>
              <TableCell>{r.callCost ? `$${r.callCost}` : 'N/A'}</TableCell>
            </TableRow>
          ))}
          {results.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4 text-muted-foreground">
                No call results found for this test.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profiles");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure SIP tester profiles, suppliers, and general settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profiles" data-testid="tab-profiles">Profiles</TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="audios" data-testid="tab-audios">Audios</TabsTrigger>
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-6">
          <ProfilesTab />
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <SuppliersTab />
        </TabsContent>

        <TabsContent value="audios" className="mt-6">
          <AudiosTab />
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <GeneralSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfilesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    port: "5060",
    protocol: "SIP",
    username: "",
    password: "",
  });

  const { data: profiles = [], isLoading } = useQuery<SipTestProfile[]>({
    queryKey: ["/api/sip-test-profiles"],
  });

  const createProfile = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-test-profiles", {
        ...formData,
        port: parseInt(formData.port),
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-profiles"] });
      setShowDialog(false);
      setFormData({ name: "", ip: "", port: "5060", protocol: "SIP", username: "", password: "" });
      toast({ title: "Profile created", description: "New profile added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create profile", variant: "destructive" });
    },
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sip-test-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-profiles"] });
      toast({ title: "Deleted", description: "Profile removed" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>SBC Profiles</CardTitle>
          <CardDescription>Manage server IP addresses for testing</CardDescription>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-profile">
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Profile</DialogTitle>
              <DialogDescription>Add a new SBC server profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Profile name"
                  data-testid="input-profile-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IP Address</Label>
                  <Input 
                    value={formData.ip}
                    onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                    placeholder="192.168.1.1"
                    data-testid="input-profile-ip"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input 
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="5060"
                    data-testid="input-profile-port"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Select value={formData.protocol} onValueChange={(v) => setFormData({ ...formData, protocol: v })}>
                  <SelectTrigger data-testid="select-profile-protocol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIP">SIP (UDP)</SelectItem>
                    <SelectItem value="SIP-TCP">SIP (TCP)</SelectItem>
                    <SelectItem value="SIP-TLS">SIP (TLS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username (optional)</Label>
                  <Input 
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Username"
                    data-testid="input-profile-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password (optional)</Label>
                  <Input 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password"
                    data-testid="input-profile-password"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={() => createProfile.mutate()} disabled={createProfile.isPending} data-testid="button-save-profile">
                {createProfile.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell className="font-mono">{profile.ip}</TableCell>
                  <TableCell>{profile.port}</TableCell>
                  <TableCell>{profile.protocol}</TableCell>
                  <TableCell>
                    <Badge variant={profile.isActive ? "default" : "secondary"}>
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" data-testid={`button-edit-profile-${profile.id}`} aria-label="Edit" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => deleteProfile.mutate(profile.id)}
                        data-testid={`button-delete-profile-${profile.id}`}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {profiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No profiles configured. Add a profile to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function SuppliersTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    codec: "G729",
    prefix: "",
    protocol: "SIP",
    email: "",
  });

  const { data: suppliers = [], isLoading } = useQuery<SipTestSupplier[]>({
    queryKey: ["/api/sip-test-suppliers"],
  });

  const { data: voiceTiers = [] } = useQuery<VoiceTier[]>({
    queryKey: ["/api/voice-tiers"],
  });

  const createSupplier = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-test-suppliers", {
        ...formData,
        isOurTier: false,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-suppliers"] });
      setShowDialog(false);
      setFormData({ name: "", codec: "G729", prefix: "", protocol: "SIP", email: "" });
      toast({ title: "Supplier created", description: "New supplier added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create supplier", variant: "destructive" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sip-test-suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-suppliers"] });
      toast({ title: "Deleted", description: "Supplier removed" });
    },
  });

  const allSuppliers = [
    ...DEFAULT_TIERS.map(t => ({ ...t, isOurTier: true, protocol: "SIP", email: "", prefix: "", isActive: true })),
    ...suppliers,
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Test Suppliers</CardTitle>
          <CardDescription>Manage carriers and routes for testing. Our 4 tiers are included by default.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-import-suppliers">
            <Download className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" data-testid="button-export-suppliers">
            <Upload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-supplier">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Supplier</DialogTitle>
                <DialogDescription>Add a new carrier or route for testing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Supplier Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Supplier name"
                    data-testid="input-supplier-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Codec</Label>
                    <Select value={formData.codec} onValueChange={(v) => setFormData({ ...formData, codec: v })}>
                      <SelectTrigger data-testid="select-supplier-codec">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CODECS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prefix (optional)</Label>
                    <Input 
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                      placeholder="Prefix"
                      data-testid="input-supplier-prefix"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Protocol</Label>
                  <Select value={formData.protocol} onValueChange={(v) => setFormData({ ...formData, protocol: v })}>
                    <SelectTrigger data-testid="select-supplier-protocol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIP">SIP</SelectItem>
                      <SelectItem value="IAX">IAX</SelectItem>
                      <SelectItem value="H323">H323</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Email (optional)</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supplier@example.com"
                    data-testid="input-supplier-email"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={() => createSupplier.mutate()} disabled={createSupplier.isPending} data-testid="button-save-supplier">
                  {createSupplier.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Supplier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Codec</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.codec}</TableCell>
                  <TableCell>{supplier.prefix || '-'}</TableCell>
                  <TableCell>{supplier.protocol}</TableCell>
                  <TableCell>
                    {supplier.isOurTier ? (
                      <Badge variant="default">Our Tier</Badge>
                    ) : (
                      <Badge variant="outline">External</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.isActive ? "default" : "secondary"}>
                      {supplier.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!supplier.isOurTier && (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" data-testid={`button-edit-supplier-${supplier.id}`} aria-label="Edit" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => deleteSupplier.mutate(supplier.id)}
                          data-testid={`button-delete-supplier-${supplier.id}`}
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AudiosTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    format: "wav",
    duration: "30",
  });

  const { data: audioFiles = [], isLoading } = useQuery<SipTestAudioFile[]>({
    queryKey: ["/api/sip-test-audio-files"],
  });

  const createAudio = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/sip-test-audio-files", {
        name: formData.name,
        description: formData.description,
        format: formData.format,
        duration: parseInt(formData.duration),
        filename: `${formData.name.toLowerCase().replace(/\s+/g, '-')}.${formData.format}`,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-audio-files"] });
      setShowDialog(false);
      setFormData({ name: "", description: "", format: "wav", duration: "30" });
      toast({ title: "Audio file created", description: "New audio file added" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create audio file", variant: "destructive" });
    },
  });

  const deleteAudio = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sip-test-audio-files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sip-test-audio-files"] });
      toast({ title: "Deleted", description: "Audio file removed" });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Audio Files</CardTitle>
          <CardDescription>Manage IVR audio files for quality testing</CardDescription>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-audio">
              <Plus className="h-4 w-4 mr-2" />
              Add Audio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Audio File</DialogTitle>
              <DialogDescription>Upload a new audio file for testing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Audio file name"
                  data-testid="input-audio-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  data-testid="textarea-audio-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                    <SelectTrigger data-testid="select-audio-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="ogg">OGG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input 
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
                    data-testid="input-audio-duration"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={() => createAudio.mutate()} disabled={createAudio.isPending} data-testid="button-save-audio">
                {createAudio.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Audio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
              {audioFiles.map((audio) => (
                <TableRow key={audio.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileAudio className="h-4 w-4 text-muted-foreground" />
                      {audio.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{audio.description || '-'}</TableCell>
                  <TableCell>{audio.format?.toUpperCase()}</TableCell>
                  <TableCell>{audio.duration ? `${audio.duration}s` : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={audio.isActive ? "default" : "secondary"}>
                      {audio.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" data-testid={`button-edit-audio-${audio.id}`} aria-label="Edit" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => deleteAudio.mutate(audio.id)}
                        data-testid={`button-delete-audio-${audio.id}`}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {audioFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audio files uploaded. Add an audio file to use in tests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function GeneralSettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    concurrentCalls: "10",
    cliAcceptablePrefixes: "+00",
    maxWaitAnswer: "80",
    defaultCallsCount: "5",
    defaultCodec: "G729",
    defaultDuration: "30",
    timezone: "UTC",
  });

  const saveSettings = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/sip-test-settings", {
        concurrentCalls: parseInt(settings.concurrentCalls),
        cliAcceptablePrefixes: settings.cliAcceptablePrefixes,
        maxWaitAnswer: parseInt(settings.maxWaitAnswer),
        defaultCallsCount: parseInt(settings.defaultCallsCount),
        defaultCodec: settings.defaultCodec,
        defaultDuration: parseInt(settings.defaultDuration),
        timezone: settings.timezone,
      });
    },
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Your settings have been updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Configure default testing parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Concurrent Calls (Max)</Label>
            <Input 
              type="number"
              value={settings.concurrentCalls}
              onChange={(e) => setSettings({ ...settings, concurrentCalls: e.target.value })}
              data-testid="input-concurrent-calls"
            />
            <p className="text-sm text-muted-foreground">Maximum simultaneous test calls</p>
          </div>
          
          <div className="space-y-2">
            <Label>CLI Acceptable Prefixes</Label>
            <Input 
              value={settings.cliAcceptablePrefixes}
              onChange={(e) => setSettings({ ...settings, cliAcceptablePrefixes: e.target.value })}
              data-testid="input-cli-prefixes"
            />
            <p className="text-sm text-muted-foreground">Comma-separated valid CLI prefixes</p>
          </div>

          <div className="space-y-2">
            <Label>Max Wait for Answer (seconds)</Label>
            <Input 
              type="number"
              value={settings.maxWaitAnswer}
              onChange={(e) => setSettings({ ...settings, maxWaitAnswer: e.target.value })}
              data-testid="input-max-wait"
            />
            <p className="text-sm text-muted-foreground">Timeout before marking call as failed</p>
          </div>

          <div className="space-y-2">
            <Label>Default Calls per Test</Label>
            <Input 
              type="number"
              value={settings.defaultCallsCount}
              onChange={(e) => setSettings({ ...settings, defaultCallsCount: e.target.value })}
              data-testid="input-default-calls"
            />
            <p className="text-sm text-muted-foreground">Number of calls for each test run</p>
          </div>

          <div className="space-y-2">
            <Label>Default Codec</Label>
            <Select value={settings.defaultCodec} onValueChange={(v) => setSettings({ ...settings, defaultCodec: v })}>
              <SelectTrigger data-testid="select-default-codec">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CODECS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Default audio codec for tests</p>
          </div>

          <div className="space-y-2">
            <Label>Default Call Duration (seconds)</Label>
            <Input 
              type="number"
              value={settings.defaultDuration}
              onChange={(e) => setSettings({ ...settings, defaultDuration: e.target.value })}
              data-testid="input-default-duration"
            />
            <p className="text-sm text-muted-foreground">Duration of each test call</p>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
              <SelectTrigger data-testid="select-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern (US)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific (US)</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Timezone for test scheduling</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending} data-testid="button-save-settings">
          {saveSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SipTesterPage() {
  const [location] = useLocation();

  if (location.includes("/settings")) {
    return <SettingsPage />;
  }
  
  if (location.includes("/history")) {
    return <HistoryPage />;
  }

  return <NewTestPage />;
}
