import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TrendingUp,
  X,
  Save,
  ChevronLeft,
  History,
  AlertCircle
} from "lucide-react";
import type { Carrier, CustomerCategory, CustomerGroup, Customer, AuditLog, CarrierAssignment } from "@shared/schema";

interface PlatformStatus {
  mockMode: boolean;
  connected: boolean;
  metrics?: {
    active_channels: number;
    cps: number;
    total_calls_24h: number;
    asr: number;
    acd: number;
    revenue_24h: number;
    cost_24h: number;
  };
}

interface AIAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: string;
}

type ViewMode = "list" | "edit";

export default function CarriersPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysis | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "wholesale",
    status: "active",
    sipHost: "",
    sipPort: "5060",
    sipUsername: "",
    sipPassword: "",
    techPrefix: "",
    billingEmail: "",
    technicalEmail: "",
    description: "",
  });

  const [assignmentData, setAssignmentData] = useState({
    assignmentType: "all" as "all" | "categories" | "groups" | "specific",
    categoryIds: [] as string[],
    groupIds: [] as string[],
    customerIds: [] as string[],
  });

  const { data: carriers, isLoading } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedCarriers,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(carriers || []);

  const { data: platformStatus } = useQuery<PlatformStatus>({
    queryKey: ["/api/platform/status"],
    refetchInterval: 30000,
  });

  const { data: categories } = useQuery<CustomerCategory[]>({
    queryKey: ["/api/customer-categories"],
  });

  const { data: groups } = useQuery<CustomerGroup[]>({
    queryKey: ["/api/customer-groups"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: auditLogs } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs", { tableName: "carriers", recordId: editingCarrier?.id }],
    enabled: !!editingCarrier?.id,
  });

  const { data: carrierAssignment } = useQuery<CarrierAssignment>({
    queryKey: ["/api/carriers", editingCarrier?.id, "assignment"],
    enabled: !!editingCarrier?.id,
  });

  useEffect(() => {
    if (carrierAssignment && editingCarrier) {
      setAssignmentData({
        assignmentType: carrierAssignment.assignmentType || "all",
        categoryIds: carrierAssignment.categoryIds || [],
        groupIds: carrierAssignment.groupIds || [],
        customerIds: carrierAssignment.customerIds || [],
      });
    }
  }, [carrierAssignment, editingCarrier]);

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
      setFormData(prev => ({ ...prev, description: data.description }));
      toast({ title: "AI description generated" });
    },
    onError: () => {
      toast({ title: "Failed to generate description", variant: "destructive" });
    },
  });

  const syncCarrierMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/carriers/${id}/sync`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ 
        title: data.synced ? "Carrier synced successfully" : "Sync completed (mock mode)",
        description: data.platformId ? `Platform ID: ${data.platformId}` : undefined
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
    onSuccess: async (carrier) => {
      await saveAssignment(carrier.id);
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier created successfully" });
      setViewMode("list");
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
    onSuccess: async (carrier) => {
      await saveAssignment(carrier.id);
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier updated successfully" });
      setViewMode("list");
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

  const saveAssignment = async (carrierId: string) => {
    try {
      await apiRequest("PUT", `/api/carriers/${carrierId}/assignment`, assignmentData);
    } catch (error) {
      console.error("Failed to save assignment", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "wholesale",
      status: "active",
      sipHost: "",
      sipPort: "5060",
      sipUsername: "",
      sipPassword: "",
      techPrefix: "",
      billingEmail: "",
      technicalEmail: "",
      description: "",
    });
    setAssignmentData({
      assignmentType: "all",
      categoryIds: [],
      groupIds: [],
      customerIds: [],
    });
    setEditingCarrier(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode("edit");
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      name: carrier.name,
      code: carrier.code,
      type: carrier.type || "wholesale",
      status: carrier.status || "active",
      sipHost: carrier.sipHost || "",
      sipPort: String(carrier.sipPort || 5060),
      sipUsername: carrier.sipUsername || "",
      sipPassword: carrier.sipPassword || "",
      techPrefix: carrier.techPrefix || "",
      billingEmail: carrier.billingEmail || "",
      technicalEmail: carrier.technicalEmail || "",
      description: carrier.description || "",
    });
    setViewMode("edit");
  };

  const handleCancel = () => {
    setViewMode("list");
    resetForm();
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

  if (viewMode === "edit") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
          <Button variant="ghost" size="icon" onClick={handleCancel} data-testid="button-back">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold" data-testid="text-form-title">
              {editingCarrier ? `Edit Carrier: ${editingCarrier.name}` : "New Carrier"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {editingCarrier ? "Update carrier configuration" : "Configure a new carrier connection"}
            </p>
          </div>
          {editingCarrier?.connexcsCarrierId && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Cloud className="h-3 w-3 mr-1" /> Platform Synced
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <Tabs defaultValue="general" className="h-full">
            <div className="border-b px-4">
              <TabsList className="h-10 bg-transparent">
                <TabsTrigger value="general" data-testid="tab-general">GENERAL</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">ADVANCED</TabsTrigger>
                <TabsTrigger value="assignment" data-testid="tab-assignment">ASSIGNMENT</TabsTrigger>
                {editingCarrier && (
                  <TabsTrigger value="history" data-testid="tab-history">HISTORY</TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="general" className="mt-0 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Carrier Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter carrier name"
                      required
                      data-testid="input-carrier-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="CARRIER1"
                      required
                      data-testid="input-carrier-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger data-testid="select-carrier-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger data-testid="select-carrier-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
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

                <div className="grid grid-cols-2 gap-6">
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
              </TabsContent>

              <TabsContent value="advanced" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">SIP Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="sipUsername">SIP Username</Label>
                        <Input
                          id="sipUsername"
                          value={formData.sipUsername}
                          onChange={(e) => setFormData({ ...formData, sipUsername: e.target.value })}
                          placeholder="username"
                          data-testid="input-carrier-sip-username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sipPassword">SIP Password</Label>
                        <Input
                          id="sipPassword"
                          type="password"
                          value={formData.sipPassword}
                          onChange={(e) => setFormData({ ...formData, sipPassword: e.target.value })}
                          placeholder="********"
                          data-testid="input-carrier-sip-password"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="techPrefix">Tech Prefix</Label>
                      <Input
                        id="techPrefix"
                        value={formData.techPrefix}
                        onChange={(e) => setFormData({ ...formData, techPrefix: e.target.value })}
                        placeholder="Optional tech prefix for routing"
                        data-testid="input-carrier-tech-prefix"
                      />
                    </div>
                  </CardContent>
                </Card>

                {editingCarrier && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Platform Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Sync Status</p>
                          <p className="text-sm text-muted-foreground">
                            {editingCarrier.connexcsCarrierId 
                              ? `Synced (ID: ${editingCarrier.connexcsCarrierId})`
                              : "Not synced to platform"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => syncCarrierMutation.mutate(editingCarrier.id)}
                          disabled={syncCarrierMutation.isPending}
                          data-testid="button-sync-carrier"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${syncCarrierMutation.isPending ? 'animate-spin' : ''}`} />
                          {editingCarrier.connexcsCarrierId ? "Re-sync" : "Sync to Platform"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="assignment" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visibility Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Assignment Type</Label>
                      <Select 
                        value={assignmentData.assignmentType} 
                        onValueChange={(v: "all" | "categories" | "groups" | "specific") => 
                          setAssignmentData({ ...assignmentData, assignmentType: v })
                        }
                      >
                        <SelectTrigger data-testid="select-assignment-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          <SelectItem value="categories">By Category</SelectItem>
                          <SelectItem value="groups">By Group</SelectItem>
                          <SelectItem value="specific">Specific Customers</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Control which customers can see and use this carrier
                      </p>
                    </div>

                    {assignmentData.assignmentType === "categories" && (
                      <div className="space-y-2">
                        <Label>Select Categories</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-md p-3">
                          {categories?.map((cat) => (
                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={assignmentData.categoryIds.includes(cat.id)}
                                onCheckedChange={(checked) => {
                                  setAssignmentData(prev => ({
                                    ...prev,
                                    categoryIds: checked 
                                      ? [...prev.categoryIds, cat.id]
                                      : prev.categoryIds.filter(id => id !== cat.id)
                                  }));
                                }}
                                data-testid={`checkbox-category-${cat.id}`}
                              />
                              <span className="text-sm">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {assignmentData.assignmentType === "groups" && (
                      <div className="space-y-2">
                        <Label>Select Groups</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-md p-3">
                          {groups?.map((group) => (
                            <label key={group.id} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={assignmentData.groupIds.includes(group.id)}
                                onCheckedChange={(checked) => {
                                  setAssignmentData(prev => ({
                                    ...prev,
                                    groupIds: checked 
                                      ? [...prev.groupIds, group.id]
                                      : prev.groupIds.filter(id => id !== group.id)
                                  }));
                                }}
                                data-testid={`checkbox-group-${group.id}`}
                              />
                              <span className="text-sm">{group.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {assignmentData.assignmentType === "specific" && (
                      <div className="space-y-2">
                        <Label>Select Customers</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded-md p-3">
                          {customers?.map((customer) => (
                            <label key={customer.id} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={assignmentData.customerIds.includes(customer.id)}
                                onCheckedChange={(checked) => {
                                  setAssignmentData(prev => ({
                                    ...prev,
                                    customerIds: checked 
                                      ? [...prev.customerIds, customer.id]
                                      : prev.customerIds.filter(id => id !== customer.id)
                                  }));
                                }}
                                data-testid={`checkbox-customer-${customer.id}`}
                              />
                              <span className="text-sm">{customer.companyName || customer.billingEmail || customer.accountNumber}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {editingCarrier && (
                <TabsContent value="history" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Audit History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {auditLogs && auditLogs.length > 0 ? (
                        <div className="space-y-3">
                          {auditLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                              <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="text-sm font-medium capitalize">{log.action}</p>
                                <p className="text-xs text-muted-foreground">
                                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown date"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No history available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </form>

        <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/30">
          {editingCarrier && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate(editingCarrier.id);
                setViewMode("list");
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-carrier"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button type="button" variant="outline" onClick={handleCancel} data-testid="button-cancel">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-carrier">
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-carriers-title">Carriers</h1>
          <p className="text-muted-foreground">Manage carrier connections and routing</p>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                {platformStatus?.connected ? (
                  <>
                    <Cloud className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Platform Connected</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Mock Mode</span>
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {platformStatus?.mockMode 
                ? "Running in mock mode" 
                : "Connected to switching platform"}
            </TooltipContent>
          </Tooltip>
          
          <Button onClick={handleCreate} data-testid="button-add-carrier">
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </div>
      </div>

      {platformStatus?.metrics && (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStatus.metrics.active_channels ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calls (24h)</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(platformStatus.metrics.total_calls_24h ?? 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ASR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStatus.metrics.asr ?? 0}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ACD</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStatus.metrics.acd ?? 0}s</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (24h)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(platformStatus.metrics.revenue_24h ?? 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : carriers && carriers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>SIP Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Synced</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCarriers.map((carrier) => (
                  <TableRow 
                    key={carrier.id} 
                    className="cursor-pointer hover-elevate"
                    onClick={() => handleEdit(carrier)}
                    data-testid={`row-carrier-${carrier.id}`}
                  >
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
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                          <TooltipContent>Sync to Platform</TooltipContent>
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
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => deleteMutation.mutate(carrier.id)} 
                          data-testid={`button-delete-carrier-${carrier.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
              <DataTableFooter
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </>
          ) : (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No carriers configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add carrier connections for voice routing</p>
              <Button onClick={handleCreate} data-testid="button-add-first-carrier">
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showAnalysis && analysisData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Carrier Analysis
            </CardTitle>
            <Button size="icon" variant="ghost" onClick={() => setShowAnalysis(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{analysisData.score}/100</div>
              <Badge variant={analysisData.riskLevel === "low" ? "default" : analysisData.riskLevel === "medium" ? "secondary" : "destructive"}>
                {analysisData.riskLevel} risk
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                <ul className="text-sm space-y-1">
                  {analysisData.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-red-600">Weaknesses</h4>
                <ul className="text-sm space-y-1">
                  {analysisData.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="text-sm space-y-1">
                {analysisData.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
