import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { 
  Play, CheckCircle2, XCircle, AlertTriangle, Loader2, Phone, Signal,
  Timer, BarChart3, RefreshCw, Search, X, Plus
} from "lucide-react";
import type { VoiceTier, Class4Carrier, SipTestRun, SipTestAudioFile, SipTestNumber } from "@shared/schema";

const COUNTRIES = [
  { code: "AB", name: "Abkhazia" },
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antarctica" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "RU", name: "Russia" },
  { code: "US", name: "United States" },
];

const CODECS = [
  { value: "G711", label: "G.711" },
  { value: "G729", label: "G.729" },
  { value: "OPUS", label: "Opus" },
  { value: "GSM", label: "GSM" },
  { value: "SPEEX", label: "Speex" },
];

const DEFAULT_AUDIO_FILES = [
  { id: "silence", name: "[DEF] Silence" },
  { id: "tone", name: "[DEF] Test Tone" },
  { id: "voice", name: "[DEF] Voice Sample" },
];

const CAPACITY_OPTIONS = [1, 5, 10, 25, 50, 100];
const CALLS_COUNT_OPTIONS = [1, 5, 10, 25, 50, 100];
const DURATION_OPTIONS = [10, 30, 60, 120, 180, 300];

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
      return <Badge variant="outline"><Timer className="h-3 w-3 mr-1" />Pending</Badge>;
  }
}

export default function PortalSipTesterPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("run-test");
  const [showDestinationDialog, setShowDestinationDialog] = useState(false);
  const [showAniDialog, setShowAniDialog] = useState(false);

  const [testForm, setTestForm] = useState({
    testType: "standard" as "standard" | "cli",
    testName: "",
    profile: "",
    selectedSuppliers: [] as string[],
    selectedCountries: [] as string[],
    manualNumbers: "",
    useDbNumbers: true,
    addToDb: false,
    codec: "G729",
    audioFile: "silence",
    capacity: 10,
    aniMode: "any",
    aniNumber: "",
    aniCountries: [] as string[],
    callsCount: 5,
    maxDuration: 30,
  });

  const [supplierSearch, setSupplierSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [aniCountrySearch, setAniCountrySearch] = useState("");

  const { data: voiceTiers = [] } = useQuery<VoiceTier[]>({
    queryKey: ["/api/voice-tiers"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const { data: class4Carriers = [] } = useQuery<Class4Carrier[]>({
    queryKey: ["/api/my/class4/carriers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: audioFiles = [] } = useQuery<SipTestAudioFile[]>({
    queryKey: ["/api/sip-test-audio-files"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const { data: testRuns = [], isLoading: runsLoading } = useQuery<SipTestRun[]>({
    queryKey: ["/api/my/sip-test-runs"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: testNumbers = [] } = useQuery<SipTestNumber[]>({
    queryKey: ["/api/sip-test-numbers"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const dbNumbersByCountry = useMemo(() => {
    const grouped: Record<string, SipTestNumber[]> = {};
    testNumbers.filter(n => n.isPublic && n.isActive).forEach(n => {
      if (!grouped[n.countryCode]) grouped[n.countryCode] = [];
      grouped[n.countryCode].push(n);
    });
    return grouped;
  }, [testNumbers]);

  const dbCountriesWithNumbers = useMemo(() => {
    return Object.keys(dbNumbersByCountry).sort();
  }, [dbNumbersByCountry]);

  const allAudioFiles = useMemo(() => {
    const custom = audioFiles.filter(f => f.isActive);
    return [...DEFAULT_AUDIO_FILES, ...custom.map(f => ({ id: f.id, name: f.name }))];
  }, [audioFiles]);

  const filteredSuppliers = useMemo(() => {
    const allSuppliers = [
      ...voiceTiers.map(t => ({ id: `tier_${t.id}`, name: t.name, type: "tier" })),
      ...class4Carriers.map(c => ({ id: `carrier_${c.id}`, name: c.name, type: "carrier" })),
    ];
    if (!supplierSearch) return allSuppliers;
    return allSuppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()));
  }, [voiceTiers, class4Carriers, supplierSearch]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  const runTest = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/my/sip-test-runs", {
        testName: testForm.testName || `Test ${new Date().toLocaleString()}`,
        testMode: testForm.testType,
        routeSource: testForm.profile.startsWith("tier_") ? "didtron_tier" : "class4_supplier",
        tierId: testForm.profile.startsWith("tier_") ? testForm.profile.replace("tier_", "") : null,
        supplierIds: testForm.selectedSuppliers,
        countryFilters: testForm.selectedCountries,
        manualNumbers: testForm.manualNumbers.split("\n").filter(Boolean),
        useDbNumbers: testForm.useDbNumbers,
        addToDb: testForm.addToDb,
        codec: testForm.codec,
        audioFileId: testForm.audioFile,
        aniMode: testForm.aniMode,
        aniNumber: testForm.aniNumber,
        aniCountries: testForm.aniCountries,
        callsCount: testForm.callsCount,
        maxDuration: testForm.maxDuration,
        capacity: testForm.capacity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/sip-test-runs"] });
      toast({ title: "Test started", description: "Your SIP test is now running" });
      setActiveTab("results");
    },
    onError: (error: Error) => {
      toast({ title: "Test failed", description: error.message, variant: "destructive" });
    },
  });

  const toggleSupplier = (id: string) => {
    setTestForm(prev => ({
      ...prev,
      selectedSuppliers: prev.selectedSuppliers.includes(id)
        ? prev.selectedSuppliers.filter(s => s !== id)
        : [...prev.selectedSuppliers, id]
    }));
  };

  const toggleCountry = (code: string) => {
    setTestForm(prev => ({
      ...prev,
      selectedCountries: prev.selectedCountries.includes(code)
        ? prev.selectedCountries.filter(c => c !== code)
        : [...prev.selectedCountries, code]
    }));
  };

  const toggleAniCountry = (code: string) => {
    setTestForm(prev => ({
      ...prev,
      aniCountries: prev.aniCountries.includes(code)
        ? prev.aniCountries.filter(c => c !== code)
        : [...prev.aniCountries, code]
    }));
  };

  const selectedDestinationCount = testForm.selectedCountries.length + 
    (testForm.manualNumbers ? testForm.manualNumbers.split("\n").filter(Boolean).length : 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">SIP Tester</h1>
          <p className="text-muted-foreground">Test your VoIP routes for quality and connectivity</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="run-test" data-testid="tab-run-test">
            <Play className="h-4 w-4 mr-2" />
            Run Test
          </TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">
            <BarChart3 className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="run-test" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Test type:</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={testForm.testType} 
                  onValueChange={(v) => setTestForm(prev => ({ ...prev, testType: v as "standard" | "cli" }))}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" data-testid="radio-standard" />
                    <Label htmlFor="standard">Standard</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cli" id="cli" data-testid="radio-cli" />
                    <Label htmlFor="cli">CLI</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Test name:</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={testForm.testName}
                  onChange={(e) => setTestForm(prev => ({ ...prev, testName: e.target.value }))}
                  placeholder="Enter test name here..."
                  data-testid="input-test-name"
                />
                <div className="mt-4">
                  <Label className="text-sm font-medium">Profile:</Label>
                  <Select
                    value={testForm.profile}
                    onValueChange={(v) => setTestForm(prev => ({ ...prev, profile: v }))}
                  >
                    <SelectTrigger className="mt-2" data-testid="select-profile">
                      <SelectValue placeholder="Select profile..." />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceTiers.map(tier => (
                        <SelectItem key={tier.id} value={`tier_${tier.id}`}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Destination:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Label className="text-sm">Run test on:</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDestinationDialog(true)}
                    data-testid="button-select-destination"
                  >
                    {selectedDestinationCount > 0 
                      ? `${selectedDestinationCount} selected`
                      : "no destination selected"
                    }
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Country:</Label>
                    <ScrollArea className="h-32 border rounded-md mt-1">
                      <div className="p-2">
                        <Input
                          placeholder="Search..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="mb-2"
                          data-testid="input-country-search"
                        />
                        {filteredCountries.map(country => (
                          <div 
                            key={country.code}
                            className="text-sm py-1 px-2 hover-elevate rounded cursor-pointer"
                            onClick={() => toggleCountry(country.code)}
                            data-testid={`country-${country.code}`}
                          >
                            {country.name}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Manual numbers:</Label>
                    <Textarea
                      value={testForm.manualNumbers}
                      onChange={(e) => setTestForm(prev => ({ ...prev, manualNumbers: e.target.value }))}
                      placeholder="One number per line..."
                      className="h-32 mt-1 resize-none text-sm"
                      data-testid="textarea-manual-numbers"
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="addToDb"
                      checked={testForm.addToDb}
                      onCheckedChange={(checked) => setTestForm(prev => ({ ...prev, addToDb: !!checked }))}
                      data-testid="checkbox-add-to-db"
                    />
                    <Label htmlFor="addToDb" className="text-sm">Add numbers to database</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="useDbNumbers"
                      checked={testForm.useDbNumbers}
                      onCheckedChange={(checked) => setTestForm(prev => ({ ...prev, useDbNumbers: !!checked }))}
                      data-testid="checkbox-use-db"
                    />
                    <Label htmlFor="useDbNumbers" className="text-sm">Use numbers from DB</Label>
                    {testNumbers.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{testNumbers.length} available</Badge>
                    )}
                  </div>
                  {testForm.useDbNumbers && dbCountriesWithNumbers.length > 0 && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground mb-2">
                        Database has {testNumbers.filter(n => n.isPublic).length} verified numbers from {dbCountriesWithNumbers.length} countries:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {dbCountriesWithNumbers.slice(0, 10).map(code => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code} ({dbNumbersByCountry[code]?.length})
                          </Badge>
                        ))}
                        {dbCountriesWithNumbers.length > 10 && (
                          <Badge variant="outline" className="text-xs">+{dbCountriesWithNumbers.length - 10} more</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Supplier:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Supplier list:</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-8"
                      data-testid="input-supplier-search"
                    />
                  </div>
                  <ScrollArea className="h-48 border rounded-md mt-2">
                    <div className="p-2 space-y-1">
                      {filteredSuppliers.map(supplier => (
                        <div key={supplier.id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={supplier.id}
                            checked={testForm.selectedSuppliers.includes(supplier.id)}
                            onCheckedChange={() => toggleSupplier(supplier.id)}
                            data-testid={`checkbox-supplier-${supplier.id}`}
                          />
                          <Label htmlFor={supplier.id} className="text-sm cursor-pointer">
                            {supplier.name}
                            {supplier.type === "tier" && (
                              <Badge variant="secondary" className="ml-2 text-xs">Tier</Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                      {filteredSuppliers.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No suppliers found
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Checked suppliers:</Label>
                  <div className="mt-2 p-3 border rounded-md min-h-[200px]">
                    {testForm.selectedSuppliers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">no suppliers selected</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {testForm.selectedSuppliers.map(id => {
                          const supplier = filteredSuppliers.find(s => s.id === id);
                          return (
                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                              {supplier?.name || id}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => toggleSupplier(id)}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">Codec:</Label>
                <Select
                  value={testForm.codec}
                  onValueChange={(v) => setTestForm(prev => ({ ...prev, codec: v }))}
                >
                  <SelectTrigger className="mt-2" data-testid="select-codec">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CODECS.map(codec => (
                      <SelectItem key={codec.value} value={codec.value}>{codec.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">Audio:</Label>
                <Select
                  value={testForm.audioFile}
                  onValueChange={(v) => setTestForm(prev => ({ ...prev, audioFile: v }))}
                >
                  <SelectTrigger className="mt-2" data-testid="select-audio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAudioFiles.map(audio => (
                      <SelectItem key={audio.id} value={audio.id}>{audio.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">Capacity:</Label>
                <Select
                  value={testForm.capacity.toString()}
                  onValueChange={(v) => setTestForm(prev => ({ ...prev, capacity: parseInt(v) }))}
                >
                  <SelectTrigger className="mt-2" data-testid="select-capacity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPACITY_OPTIONS.map(cap => (
                      <SelectItem key={cap} value={cap.toString()}>{cap}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <Label className="text-sm font-medium">ANI:</Label>
                <Select
                  value={testForm.aniMode}
                  onValueChange={(v) => {
                    if (v === "select") {
                      setShowAniDialog(true);
                    } else {
                      setTestForm(prev => ({ ...prev, aniMode: v }));
                    }
                  }}
                >
                  <SelectTrigger className="mt-2" data-testid="select-ani">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="select">Select destinations...</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 flex items-end">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => runTest.mutate()}
                  disabled={runTest.isPending || testForm.selectedSuppliers.length === 0}
                  data-testid="button-run-test"
                >
                  {runTest.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium whitespace-nowrap">Calls count:</Label>
                  <Select
                    value={testForm.callsCount.toString()}
                    onValueChange={(v) => setTestForm(prev => ({ ...prev, callsCount: parseInt(v) }))}
                  >
                    <SelectTrigger data-testid="select-calls-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CALLS_COUNT_OPTIONS.map(count => (
                        <SelectItem key={count} value={count.toString()}>{count}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium whitespace-nowrap">Maximum duration:</Label>
                  <Select
                    value={testForm.maxDuration.toString()}
                    onValueChange={(v) => setTestForm(prev => ({ ...prev, maxDuration: parseInt(v) }))}
                  >
                    <SelectTrigger data-testid="select-max-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(dur => (
                        <SelectItem key={dur} value={dur.toString()}>{dur}s</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Test Results</CardTitle>
                <p className="text-sm text-muted-foreground">History of your SIP tests</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/my/sip-test-runs"] })} 
                data-testid="button-refresh-results"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : testRuns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet</p>
                  <p className="text-sm">Run a test to see results here</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Calls</TableHead>
                        <TableHead>Success Rate</TableHead>
                        <TableHead>Avg MOS</TableHead>
                        <TableHead>Avg PDD</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testRuns.map((run) => (
                        <TableRow key={run.id} data-testid={`row-run-${run.id}`}>
                          <TableCell className="font-medium">{run.testName || "Unnamed Test"}</TableCell>
                          <TableCell>{getStatusBadge(run.status)}</TableCell>
                          <TableCell>
                            <span className="text-green-600">{run.successfulCalls || 0}</span>
                            {" / "}
                            <span>{run.totalCalls || 0}</span>
                          </TableCell>
                          <TableCell>
                            {run.totalCalls && run.totalCalls > 0 
                              ? `${Math.round(((run.successfulCalls || 0) / run.totalCalls) * 100)}%`
                              : "-"
                            }
                          </TableCell>
                          <TableCell>
                            {run.avgMos ? (
                              <div className="flex items-center gap-1">
                                <Signal className={`h-3 w-3 ${parseFloat(run.avgMos) >= 4 ? "text-green-500" : parseFloat(run.avgMos) >= 3 ? "text-yellow-500" : "text-red-500"}`} />
                                {parseFloat(run.avgMos).toFixed(1)}
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>{run.avgPdd ? `${run.avgPdd}ms` : "-"}</TableCell>
                          <TableCell>${parseFloat(run.totalCost || "0").toFixed(4)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {run.createdAt ? new Date(run.createdAt).toLocaleString() : "-"}
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

      <Dialog open={showDestinationDialog} onOpenChange={setShowDestinationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Destination:</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <Badge variant="outline">EU</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Selected destinations:</Label>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." aria-label="Search selected destinations" className="pl-8" />
              </div>
              <ScrollArea className="h-64 border rounded-md mt-2">
                <div className="p-2">
                  {testForm.selectedCountries.map(code => {
                    const country = COUNTRIES.find(c => c.code === code);
                    return (
                      <div key={code} className="flex items-center justify-between py-1 px-2 hover-elevate rounded">
                        <span className="text-sm">{country?.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto py-0 px-1 text-muted-foreground"
                          onClick={() => toggleCountry(code)}
                        >
                          remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setTestForm(prev => ({ ...prev, selectedCountries: [] }))}>
                Remove all
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Not selected destinations:</Label>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  aria-label="Search countries"
                  className="pl-8"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                />
              </div>
              <ScrollArea className="h-64 border rounded-md mt-2">
                <div className="p-2">
                  {filteredCountries.filter(c => !testForm.selectedCountries.includes(c.code)).map(country => (
                    <div 
                      key={country.code} 
                      className="text-sm py-1 px-2 hover-elevate rounded cursor-pointer"
                      onClick={() => toggleCountry(country.code)}
                    >
                      {country.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setTestForm(prev => ({ ...prev, selectedCountries: COUNTRIES.map(c => c.code) }))}
              >
                Add all
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Manual numbers:</Label>
              <Textarea
                value={testForm.manualNumbers}
                onChange={(e) => setTestForm(prev => ({ ...prev, manualNumbers: e.target.value }))}
                placeholder="One number per line..."
                className="h-72 mt-2 resize-none"
              />
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="addToDbDialog"
                    checked={testForm.addToDb}
                    onCheckedChange={(checked) => setTestForm(prev => ({ ...prev, addToDb: !!checked }))}
                  />
                  <Label htmlFor="addToDbDialog" className="text-sm">Add numbers to database</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="useDbNumbersDialog"
                    checked={testForm.useDbNumbers}
                    onCheckedChange={(checked) => setTestForm(prev => ({ ...prev, useDbNumbers: !!checked }))}
                  />
                  <Label htmlFor="useDbNumbersDialog" className="text-sm">Use numbers from DB</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDestinationDialog(false)} data-testid="button-save-destinations">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAniDialog} onOpenChange={setShowAniDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ANI Selection:</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Selected destinations:</Label>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." aria-label="Search selected ANI destinations" className="pl-8" />
              </div>
              <ScrollArea className="h-64 border rounded-md mt-2">
                <div className="p-2">
                  {testForm.aniCountries.map(code => {
                    const country = COUNTRIES.find(c => c.code === code);
                    return (
                      <div key={code} className="flex items-center justify-between py-1 px-2 hover-elevate rounded">
                        <span className="text-sm">{country?.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto py-0 px-1 text-muted-foreground"
                          onClick={() => toggleAniCountry(code)}
                        >
                          remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setTestForm(prev => ({ ...prev, aniCountries: [] }))}>
                Remove all
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Not selected destinations:</Label>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  aria-label="Search ANI countries"
                  className="pl-8"
                  value={aniCountrySearch}
                  onChange={(e) => setAniCountrySearch(e.target.value)}
                />
              </div>
              <ScrollArea className="h-64 border rounded-md mt-2">
                <div className="p-2">
                  {COUNTRIES.filter(c => 
                    !testForm.aniCountries.includes(c.code) &&
                    (!aniCountrySearch || c.name.toLowerCase().includes(aniCountrySearch.toLowerCase()))
                  ).map(country => (
                    <div 
                      key={country.code} 
                      className="text-sm py-1 px-2 hover-elevate rounded cursor-pointer"
                      onClick={() => toggleAniCountry(country.code)}
                    >
                      {country.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setTestForm(prev => ({ ...prev, aniCountries: COUNTRIES.map(c => c.code) }))}
              >
                Add all
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Manual ANI number:</Label>
              <Input
                value={testForm.aniNumber}
                onChange={(e) => setTestForm(prev => ({ ...prev, aniNumber: e.target.value }))}
                placeholder="+1234567890"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter a specific ANI number to use for all test calls
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setTestForm(prev => ({ ...prev, aniMode: "select" }));
                setShowAniDialog(false);
              }} 
              data-testid="button-save-ani"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
