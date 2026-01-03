import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plus, 
  Building2, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Cloud, 
  CloudOff,
  Activity,
  Zap,
  TrendingUp
} from "lucide-react";
import type { Carrier } from "@shared/schema";

interface ConnexCSStatus {
  mockMode: boolean;
  connected: boolean;
  metrics?: {
    activeCalls: number;
    callsToday: number;
    asr: number;
    acd: number;
    revenue: number;
  };
}

interface AIAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: string;
}

export default function CarriersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [aiDescription, setAiDescription] = useState("");
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysis | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "wholesale",
    sipHost: "",
    sipPort: "5060",
    billingEmail: "",
    technicalEmail: "",
    description: "",
  });

  const { data: carriers, isLoading } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const { data: connexcsStatus } = useQuery<ConnexCSStatus>({
    queryKey: ["/api/connexcs/status"],
    refetchInterval: 30000,
  });

  const generateDescriptionMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/ai/generate-description", {
        entityType: "carrier",
        name,
        context: { type: formData.type, sipHost: formData.sipHost }
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAiDescription(data.description);
      setFormData(prev => ({ ...prev, description: data.description }));
      toast({ title: "AI description generated" });
    },
    onError: () => {
      toast({ title: "Failed to generate description", variant: "destructive" });
    },
  });

  const syncCarrierMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/connexcs/sync-carrier/${id}`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ 
        title: data.synced ? "Carrier synced to ConnexCS" : "Sync completed (mock mode)",
        description: data.connexcsId ? `ConnexCS ID: ${data.connexcsId}` : undefined
      });
    },
    onError: () => {
      toast({ title: "Failed to sync carrier", variant: "destructive" });
    },
  });

  const analyzeCarrierMutation = useMutation({
    mutationFn: async (carrier: Carrier) => {
      const res = await apiRequest("POST", "/api/ai/carrier-analysis", {
        name: carrier.name,
        type: carrier.type,
        sipHost: carrier.sipHost,
        status: carrier.status,
      });
      return res.json();
    },
    onSuccess: (data, carrier) => {
      setAnalysisData(data);
      setShowAnalysis(carrier.id);
    },
    onError: () => {
      toast({ title: "Failed to analyze carrier", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/carriers", {
        ...data,
        sipPort: parseInt(data.sipPort),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create carrier", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/carriers/${id}`, {
        ...data,
        sipPort: parseInt(data.sipPort),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update carrier", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/carriers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete carrier", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "wholesale",
      sipHost: "",
      sipPort: "5060",
      billingEmail: "",
      technicalEmail: "",
      description: "",
    });
    setAiDescription("");
    setEditingCarrier(null);
    setIsOpen(false);
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      name: carrier.name,
      code: carrier.code,
      type: carrier.type || "wholesale",
      sipHost: carrier.sipHost || "",
      sipPort: String(carrier.sipPort || 5060),
      billingEmail: carrier.billingEmail || "",
      technicalEmail: carrier.technicalEmail || "",
      description: carrier.description || "",
    });
    setAiDescription(carrier.description || "");
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCarrier) {
      updateMutation.mutate({ id: editingCarrier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-carriers-title">Carriers</h1>
          <p className="text-muted-foreground">Manage carrier connections and sync with ConnexCS</p>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                {connexcsStatus?.connected ? (
                  <>
                    <Cloud className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">ConnexCS Connected</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">Mock Mode</span>
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {connexcsStatus?.mockMode 
                ? "Running in mock mode - set CONNEXCS_API_KEY for live sync" 
                : "Connected to ConnexCS API"}
            </TooltipContent>
          </Tooltip>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCarrier(null); resetForm(); }} data-testid="button-add-carrier">
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCarrier ? "Edit Carrier" : "Add Carrier"}</DialogTitle>
                  <DialogDescription>{editingCarrier ? "Update carrier settings" : "Configure a new carrier connection"}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Carrier Name"
                        required
                        data-testid="input-carrier-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="CARRIER1"
                        required
                        data-testid="input-carrier-code"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger data-testid="select-carrier-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wholesale" data-testid="option-carrier-type-wholesale">Wholesale</SelectItem>
                        <SelectItem value="retail" data-testid="option-carrier-type-retail">Retail</SelectItem>
                        <SelectItem value="hybrid" data-testid="option-carrier-type-hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="sipHost">SIP Host</Label>
                      <Input
                        id="sipHost"
                        value={formData.sipHost}
                        onChange={(e) => setFormData({ ...formData, sipHost: e.target.value })}
                        placeholder="sip.carrier.com"
                        data-testid="input-carrier-host"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sipPort">Port</Label>
                      <Input
                        id="sipPort"
                        type="number"
                        value={formData.sipPort}
                        onChange={(e) => setFormData({ ...formData, sipPort: e.target.value })}
                        placeholder="5060"
                        data-testid="input-carrier-port"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingEmail">Billing Email</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        value={formData.billingEmail}
                        onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                        placeholder="billing@carrier.com"
                        data-testid="input-carrier-billing-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technicalEmail">Technical Email</Label>
                      <Input
                        id="technicalEmail"
                        type="email"
                        value={formData.technicalEmail}
                        onChange={(e) => setFormData({ ...formData, technicalEmail: e.target.value })}
                        placeholder="noc@carrier.com"
                        data-testid="input-carrier-technical-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formData.name && generateDescriptionMutation.mutate(formData.name)}
                        disabled={!formData.name || generateDescriptionMutation.isPending}
                        data-testid="button-generate-ai-description"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {generateDescriptionMutation.isPending ? "Generating..." : "AI Generate"}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Carrier description..."
                      rows={3}
                      data-testid="input-carrier-description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-carrier">Cancel</Button>
                  <Button type="submit" disabled={isPending} data-testid="button-save-carrier">
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {connexcsStatus?.metrics && (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connexcsStatus.metrics.activeCalls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connexcsStatus.metrics.callsToday.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ASR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connexcsStatus.metrics.asr}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ACD</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connexcsStatus.metrics.acd}s</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${connexcsStatus.metrics.revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : carriers && carriers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>SIP Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ConnexCS</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier) => (
                  <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{carrier.name}</span>
                        {carrier.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{carrier.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><code className="text-xs">{carrier.code}</code></TableCell>
                    <TableCell>
                      <Badge variant="outline">{carrier.type}</Badge>
                    </TableCell>
                    <TableCell>{carrier.sipHost ? `${carrier.sipHost}:${carrier.sipPort}` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={carrier.status === "active" ? "default" : "secondary"}>
                        {carrier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {carrier.connexcsCarrierId ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Synced
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not synced
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => syncCarrierMutation.mutate(carrier.id)}
                              disabled={syncCarrierMutation.isPending}
                              data-testid={`button-sync-carrier-${carrier.id}`}
                            >
                              <RefreshCw className={`h-4 w-4 ${syncCarrierMutation.isPending ? 'animate-spin' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Sync to ConnexCS</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => analyzeCarrierMutation.mutate(carrier)}
                              disabled={analyzeCarrierMutation.isPending}
                              data-testid={`button-analyze-carrier-${carrier.id}`}
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>AI Analysis</TooltipContent>
                        </Tooltip>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(carrier)} data-testid={`button-edit-carrier-${carrier.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(carrier.id)} data-testid={`button-delete-carrier-${carrier.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No carriers configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add carrier connections for voice routing</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-carrier">
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!showAnalysis} onOpenChange={() => { setShowAnalysis(null); setAnalysisData(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Carrier Analysis
            </DialogTitle>
            <DialogDescription>AI-powered insights for this carrier</DialogDescription>
          </DialogHeader>
          {analysisData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Performance Score</span>
                <Badge variant={analysisData.score >= 80 ? "default" : analysisData.score >= 60 ? "secondary" : "destructive"}>
                  {analysisData.score}/100
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <Badge variant={analysisData.riskLevel === "low" ? "default" : analysisData.riskLevel === "medium" ? "secondary" : "destructive"}>
                  {analysisData.riskLevel}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Strengths</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysisData.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Areas for Improvement</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysisData.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {analysisData.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500">*</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
