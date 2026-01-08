import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus, Pencil, Trash2, Users, Building2, Tag, CheckCircle2, XCircle, Loader2, Shield
} from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";

type Assignment = {
  id: string;
  featureName: string;
  assignmentType: string | null;
  categoryIds: string[] | null;
  groupIds: string[] | null;
  customerIds: string[] | null;
  pricingTierId: string | null;
  maxAgents: number | null;
  maxCallsPerDay: number | null;
  maxConcurrentCalls: number | null;
  allowOutbound: boolean | null;
  allowInbound: boolean | null;
  isActive: boolean | null;
  createdAt: string;
};

type Category = { id: string; name: string };
type Group = { id: string; name: string };
type PricingTier = { id: string; name: string };

type AssignmentFormData = {
  featureName: string;
  assignmentType: string;
  categoryIds: string[];
  groupIds: string[];
  customerIds: string[];
  pricingTierId: string;
  maxAgents: number;
  maxCallsPerDay: number;
  maxConcurrentCalls: number;
  allowOutbound: boolean;
  allowInbound: boolean;
  isActive: boolean;
};

const defaultForm: AssignmentFormData = {
  featureName: "ai_voice",
  assignmentType: "all",
  categoryIds: [],
  groupIds: [],
  customerIds: [],
  pricingTierId: "",
  maxAgents: 10,
  maxCallsPerDay: 1000,
  maxConcurrentCalls: 5,
  allowOutbound: true,
  allowInbound: true,
  isActive: true,
};

const FEATURE_OPTIONS = [
  { value: "ai_voice", label: "AI Voice (Full Access)" },
  { value: "ai_voice_inbound", label: "AI Voice - Inbound Only" },
  { value: "ai_voice_outbound", label: "AI Voice - Outbound Only" },
  { value: "ai_voice_campaigns", label: "AI Voice - Campaigns" },
  { value: "ai_voice_knowledge", label: "AI Voice - Knowledge Base" },
  { value: "ai_voice_analytics", label: "AI Voice - Analytics" },
];

const ASSIGNMENT_TYPES = [
  { value: "all", label: "All Customers" },
  { value: "categories", label: "By Category" },
  { value: "groups", label: "By Group" },
  { value: "specific", label: "Specific Customers" },
];

export default function AiVoiceAssignmentsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState<AssignmentFormData>(defaultForm);

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/admin/ai-voice/assignments"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(assignments);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["/api/admin/groups"],
  });

  const { data: pricingTiers = [] } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/ai-voice/pricing-tiers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const res = await apiRequest("POST", "/api/admin/ai-voice/assignments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/assignments"] });
      toast({ title: "Assignment created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create assignment", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AssignmentFormData> }) => {
      const res = await apiRequest("PATCH", `/api/admin/ai-voice/assignments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/assignments"] });
      toast({ title: "Assignment updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update assignment", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ai-voice/assignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/assignments"] });
      toast({ title: "Assignment deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingAssignment(null);
    setIsOpen(false);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setForm({
      featureName: assignment.featureName,
      assignmentType: assignment.assignmentType || "all",
      categoryIds: assignment.categoryIds || [],
      groupIds: assignment.groupIds || [],
      customerIds: assignment.customerIds || [],
      pricingTierId: assignment.pricingTierId || "",
      maxAgents: assignment.maxAgents || 10,
      maxCallsPerDay: assignment.maxCallsPerDay || 1000,
      maxConcurrentCalls: assignment.maxConcurrentCalls || 5,
      allowOutbound: assignment.allowOutbound ?? true,
      allowInbound: assignment.allowInbound ?? true,
      isActive: assignment.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.featureName) {
      toast({ title: "Feature name is required", variant: "destructive" });
      return;
    }
    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const getFeatureLabel = (value: string) => {
    return FEATURE_OPTIONS.find(o => o.value === value)?.label || value;
  };

  const getAssignmentTypeLabel = (value: string | null) => {
    return ASSIGNMENT_TYPES.find(o => o.value === value)?.label || value || "All";
  };

  const getAssignmentScope = (assignment: Assignment) => {
    switch (assignment.assignmentType) {
      case "categories":
        return `${assignment.categoryIds?.length || 0} categories`;
      case "groups":
        return `${assignment.groupIds?.length || 0} groups`;
      case "specific":
        return `${assignment.customerIds?.length || 0} customers`;
      default:
        return "All customers";
    }
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Feature Assignments</h1>
          <p className="text-muted-foreground">
            Control AI Voice feature access by category, group, or customer
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsOpen(true); }} data-testid="button-add-assignment">
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-assignments">{assignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-active-rules">
              {assignments.filter(a => a.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-by-category">
              {assignments.filter(a => a.assignmentType === "category").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-by-customer">
              {assignments.filter(a => a.assignmentType === "customer").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Rules</CardTitle>
          <CardDescription>
            Define which customers can access AI Voice features and their limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Assignment Type</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No assignments configured. Add one to control feature access.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((assignment) => (
                  <TableRow key={assignment.id} data-testid={`row-assignment-${assignment.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {getFeatureLabel(assignment.featureName)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getAssignmentTypeLabel(assignment.assignmentType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getAssignmentScope(assignment)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="space-y-1">
                        <div>Agents: {assignment.maxAgents || "Unlimited"}</div>
                        <div>Calls/day: {assignment.maxCallsPerDay || "Unlimited"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {assignment.allowInbound && (
                          <Badge variant="secondary" className="text-xs">In</Badge>
                        )}
                        {assignment.allowOutbound && (
                          <Badge variant="secondary" className="text-xs">Out</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.isActive ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(assignment)}
                          data-testid={`button-edit-${assignment.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(assignment.id)}
                          data-testid={`button-delete-${assignment.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? "Edit Assignment" : "Create Assignment"}
            </DialogTitle>
            <DialogDescription>
              Configure which customers can access this AI Voice feature
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Feature</Label>
                <Select
                  value={form.featureName}
                  onValueChange={(v) => setForm({ ...form, featureName: v })}
                >
                  <SelectTrigger data-testid="select-feature">
                    <SelectValue placeholder="Select feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <Select
                  value={form.assignmentType}
                  onValueChange={(v) => setForm({ ...form, assignmentType: v })}
                >
                  <SelectTrigger data-testid="select-assignment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_TYPES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.assignmentType === "category" && (
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px]">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={form.categoryIds.includes(cat.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const ids = form.categoryIds.includes(cat.id)
                          ? form.categoryIds.filter(id => id !== cat.id)
                          : [...form.categoryIds, cat.id];
                        setForm({ ...form, categoryIds: ids });
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {cat.name}
                    </Badge>
                  ))}
                  {categories.length === 0 && (
                    <span className="text-muted-foreground text-sm">No categories available</span>
                  )}
                </div>
              </div>
            )}

            {form.assignmentType === "group" && (
              <div className="space-y-2">
                <Label>Groups</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px]">
                  {groups.map((grp) => (
                    <Badge
                      key={grp.id}
                      variant={form.groupIds.includes(grp.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const ids = form.groupIds.includes(grp.id)
                          ? form.groupIds.filter(id => id !== grp.id)
                          : [...form.groupIds, grp.id];
                        setForm({ ...form, groupIds: ids });
                      }}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {grp.name}
                    </Badge>
                  ))}
                  {groups.length === 0 && (
                    <span className="text-muted-foreground text-sm">No groups available</span>
                  )}
                </div>
              </div>
            )}

            {form.assignmentType === "customer" && (
              <div className="space-y-2">
                <Label>Customer IDs (comma-separated)</Label>
                <Input
                  value={form.customerIds.join(", ")}
                  onChange={(e) => setForm({
                    ...form,
                    customerIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Enter customer IDs"
                  data-testid="input-customer-ids"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Pricing Tier</Label>
              <Select
                value={form.pricingTierId}
                onValueChange={(v) => setForm({ ...form, pricingTierId: v })}
              >
                <SelectTrigger data-testid="select-pricing-tier">
                  <SelectValue placeholder="Select pricing tier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  {pricingTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Max Agents</Label>
                <Input
                  type="number"
                  value={form.maxAgents}
                  onChange={(e) => setForm({ ...form, maxAgents: parseInt(e.target.value) || 0 })}
                  data-testid="input-max-agents"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Calls/Day</Label>
                <Input
                  type="number"
                  value={form.maxCallsPerDay}
                  onChange={(e) => setForm({ ...form, maxCallsPerDay: parseInt(e.target.value) || 0 })}
                  data-testid="input-max-calls"
                />
              </div>
              <div className="space-y-2">
                <Label>Concurrent Calls</Label>
                <Input
                  type="number"
                  value={form.maxConcurrentCalls}
                  onChange={(e) => setForm({ ...form, maxConcurrentCalls: parseInt(e.target.value) || 0 })}
                  data-testid="input-concurrent-calls"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.allowInbound}
                  onCheckedChange={(c) => setForm({ ...form, allowInbound: c })}
                  data-testid="switch-inbound"
                />
                <Label>Allow Inbound</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.allowOutbound}
                  onCheckedChange={(c) => setForm({ ...form, allowOutbound: c })}
                  data-testid="switch-outbound"
                />
                <Label>Allow Outbound</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(c) => setForm({ ...form, isActive: c })}
                  data-testid="switch-active"
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingAssignment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
