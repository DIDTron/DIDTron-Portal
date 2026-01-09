import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Plus, Edit, Trash2, Star, RefreshCw, Calendar, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { BillingTerm } from "@shared/schema";

export default function BillingTermsPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTerm, setEditingTerm] = useState<BillingTerm | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    label: "",
    cycleType: "monthly" as "weekly" | "semi_monthly" | "monthly",
    cycleDays: 30,
    dueDays: 15,
    description: "",
    anchorDayOfWeek: 1,
    anchorDaysOfMonth: [1, 16],
    anchorDayOfMonth: 1,
  });

  const { data: billingTerms, isLoading, isFetching, refetch } = useQuery<BillingTerm[]>({
    queryKey: ["/api/billing-terms"],
  });

  const { paginatedItems, ...paginationProps } = useDataTablePagination(billingTerms || []);

  const buildAnchorConfig = () => {
    switch (formData.cycleType) {
      case "weekly":
        return { dayOfWeek: formData.anchorDayOfWeek };
      case "semi_monthly":
        return { daysOfMonth: formData.anchorDaysOfMonth };
      case "monthly":
        return { dayOfMonth: formData.anchorDayOfMonth };
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        code: data.code,
        label: data.label,
        cycleType: data.cycleType,
        cycleDays: data.cycleDays,
        dueDays: data.dueDays,
        description: data.description,
        anchorConfig: buildAnchorConfig(),
      };
      return await apiRequest("POST", "/api/billing-terms", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing-terms"] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Billing term created", description: "The billing term has been created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create billing term.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const payload = {
        code: data.code,
        label: data.label,
        cycleType: data.cycleType,
        cycleDays: data.cycleDays,
        dueDays: data.dueDays,
        description: data.description,
        anchorConfig: buildAnchorConfig(),
      };
      return await apiRequest("PATCH", `/api/billing-terms/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing-terms"] });
      setShowEditDialog(false);
      setEditingTerm(null);
      resetForm();
      toast({ title: "Billing term updated", description: "The billing term has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update billing term.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/billing-terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing-terms"] });
      toast({ title: "Billing term deleted", description: "The billing term has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete billing term.", variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/billing-terms/${id}/set-default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/billing-terms"] });
      toast({ title: "Default updated", description: "The default billing term has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to set default billing term.", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      label: "",
      cycleType: "monthly",
      cycleDays: 30,
      dueDays: 15,
      description: "",
      anchorDayOfWeek: 1,
      anchorDaysOfMonth: [1, 16],
      anchorDayOfMonth: 1,
    });
  };

  const openEditDialog = (term: BillingTerm) => {
    setEditingTerm(term);
    const anchor = term.anchorConfig as Record<string, unknown> | null;
    setFormData({
      code: term.code,
      label: term.label,
      cycleType: term.cycleType,
      cycleDays: term.cycleDays,
      dueDays: term.dueDays,
      description: term.description || "",
      anchorDayOfWeek: (anchor?.dayOfWeek as number) ?? 1,
      anchorDaysOfMonth: (anchor?.daysOfMonth as number[]) ?? [1, 16],
      anchorDayOfMonth: (anchor?.dayOfMonth as number) ?? 1,
    });
    setShowEditDialog(true);
  };

  const handleCycleTypeChange = (value: "weekly" | "semi_monthly" | "monthly") => {
    const cycleDefaults: Record<string, number> = {
      weekly: 7,
      semi_monthly: 15,
      monthly: 30,
    };
    setFormData({
      ...formData,
      cycleType: value,
      cycleDays: cycleDefaults[value],
    });
  };

  const dayOfWeekOptions = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const renderAnchorConfigFields = () => {
    switch (formData.cycleType) {
      case "weekly":
        return (
          <div className="space-y-2">
            <Label>Invoice Day (Day of Week)</Label>
            <Select
              value={String(formData.anchorDayOfWeek)}
              onValueChange={(v) => setFormData({ ...formData, anchorDayOfWeek: parseInt(v) })}
            >
              <SelectTrigger data-testid="select-anchor-day-of-week">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dayOfWeekOptions.map((day) => (
                  <SelectItem key={day.value} value={String(day.value)}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Invoices will be generated on this day each week
            </p>
          </div>
        );
      case "semi_monthly":
        return (
          <div className="space-y-2">
            <Label>Invoice Days (Days of Month)</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={1}
                max={28}
                value={formData.anchorDaysOfMonth[0]}
                onChange={(e) => setFormData({ ...formData, anchorDaysOfMonth: [parseInt(e.target.value) || 1, formData.anchorDaysOfMonth[1]] })}
                className="w-20"
                data-testid="input-anchor-day-1"
              />
              <span className="text-muted-foreground">and</span>
              <Input
                type="number"
                min={1}
                max={28}
                value={formData.anchorDaysOfMonth[1]}
                onChange={(e) => setFormData({ ...formData, anchorDaysOfMonth: [formData.anchorDaysOfMonth[0], parseInt(e.target.value) || 16] })}
                className="w-20"
                data-testid="input-anchor-day-2"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Invoices will be generated on these two days each month (e.g., 1st and 16th)
            </p>
          </div>
        );
      case "monthly":
        return (
          <div className="space-y-2">
            <Label>Invoice Day (Day of Month)</Label>
            <Input
              type="number"
              min={1}
              max={28}
              value={formData.anchorDayOfMonth}
              onChange={(e) => setFormData({ ...formData, anchorDayOfMonth: parseInt(e.target.value) || 1 })}
              className="w-20"
              data-testid="input-anchor-day-of-month"
            />
            <p className="text-xs text-muted-foreground">
              Invoices will be generated on this day each month (use 1-28 to avoid month-length issues)
            </p>
          </div>
        );
    }
  };

  const getCycleDescription = (term: BillingTerm) => {
    switch (term.cycleType) {
      case "weekly":
        return "Every Monday";
      case "semi_monthly":
        return "16th & 1st of month";
      case "monthly":
        return "1st of each month";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Billing Terms</h1>
          <p className="text-muted-foreground">Configure invoice frequency and payment due terms (e.g., 7/3, 15/15, 30/30)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh">
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-term">
            <Plus className="h-4 w-4 mr-2" />
            Add Term
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Terms</CardTitle>
          <CardDescription>
            Define invoice frequency (first number) and payment due days (second number). Example: 7/3 = Weekly invoice, due in 3 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Invoice Schedule</TableHead>
                    <TableHead>Due Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((term: BillingTerm) => (
                    <TableRow key={term.id} data-testid={`row-term-${term.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">{term.code}</Badge>
                          {term.isDefault && (
                            <Badge variant="default" className="bg-amber-500">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{term.label}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="capitalize">{term.cycleType.replace("_", "-")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{getCycleDescription(term)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {term.dueDays} days
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={term.isActive ? "default" : "secondary"}>
                          {term.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!term.isDefault && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDefaultMutation.mutate(term.id)}
                              title="Set as default"
                              data-testid={`button-set-default-${term.id}`}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(term)}
                            data-testid={`button-edit-${term.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(term.id)}
                            data-testid={`button-delete-${term.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTableFooter {...paginationProps} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Billing Term</DialogTitle>
            <DialogDescription>
              Define a new billing term with invoice frequency and payment due days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  placeholder="e.g., 7/3"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  data-testid="input-code"
                />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  placeholder="e.g., Weekly / 3 days"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  data-testid="input-label"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cycle Type</Label>
              <Select value={formData.cycleType} onValueChange={handleCycleTypeChange}>
                <SelectTrigger data-testid="select-cycle-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="semi_monthly">Semi-monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderAnchorConfigFields()}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cycle Days</Label>
                <Input
                  type="number"
                  value={formData.cycleDays}
                  onChange={(e) => setFormData({ ...formData, cycleDays: parseInt(e.target.value) || 0 })}
                  data-testid="input-cycle-days"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Days (after invoice)</Label>
                <Input
                  type="number"
                  value={formData.dueDays}
                  onChange={(e) => setFormData({ ...formData, dueDays: parseInt(e.target.value) || 0 })}
                  data-testid="input-due-days"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} data-testid="button-save">
              {createMutation.isPending ? "Creating..." : "Create Term"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Billing Term</DialogTitle>
            <DialogDescription>
              Update the billing term configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  placeholder="e.g., 7/3"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  data-testid="input-edit-code"
                />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  placeholder="e.g., Weekly / 3 days"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  data-testid="input-edit-label"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cycle Type</Label>
              <Select value={formData.cycleType} onValueChange={handleCycleTypeChange}>
                <SelectTrigger data-testid="select-edit-cycle-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="semi_monthly">Semi-monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderAnchorConfigFields()}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cycle Days</Label>
                <Input
                  type="number"
                  value={formData.cycleDays}
                  onChange={(e) => setFormData({ ...formData, cycleDays: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-cycle-days"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Days (after invoice)</Label>
                <Input
                  type="number"
                  value={formData.dueDays}
                  onChange={(e) => setFormData({ ...formData, dueDays: parseInt(e.target.value) || 0 })}
                  data-testid="input-edit-due-days"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} data-testid="button-edit-cancel">
              Cancel
            </Button>
            <Button
              onClick={() => editingTerm && updateMutation.mutate({ id: editingTerm.id, data: formData })}
              disabled={updateMutation.isPending}
              data-testid="button-edit-save"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
