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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users, Phone } from "lucide-react";
import type { RingGroup } from "@shared/schema";

type RingGroupFormData = {
  name: string;
  extension: string;
  strategy: string;
  ringTimeout: number;
  noAnswerDestination: string;
  isActive: boolean;
};

const defaultForm: RingGroupFormData = {
  name: "",
  extension: "",
  strategy: "ring_all",
  ringTimeout: 20,
  noAnswerDestination: "",
  isActive: true,
};

const strategyLabels: Record<string, string> = {
  ring_all: "Ring All",
  round_robin: "Round Robin",
  linear: "Linear Hunt",
  random: "Random",
};

export default function PortalRingGroupsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRg, setEditingRg] = useState<RingGroup | null>(null);
  const [form, setForm] = useState<RingGroupFormData>(defaultForm);

  const { data: ringGroups = [], isLoading } = useQuery<RingGroup[]>({
    queryKey: ["/api/my/ring-groups"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: RingGroupFormData) => {
      const res = await apiRequest("POST", "/api/my/ring-groups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ring-groups"] });
      toast({ title: "Ring group created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create ring group", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RingGroupFormData> }) => {
      const res = await apiRequest("PATCH", `/api/my/ring-groups/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ring-groups"] });
      toast({ title: "Ring group updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update ring group", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/ring-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ring-groups"] });
      toast({ title: "Ring group deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete ring group", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingRg(null);
    setIsOpen(false);
  };

  const handleEdit = (rg: RingGroup) => {
    setEditingRg(rg);
    setForm({
      name: rg.name,
      extension: rg.extension || "",
      strategy: rg.strategy || "ring_all",
      ringTimeout: rg.ringTimeout ?? 20,
      noAnswerDestination: rg.noAnswerDestination || "",
      isActive: rg.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (editingRg) {
      updateMutation.mutate({ id: editingRg.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this ring group?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading ring groups...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ring Groups</h1>
          <p className="text-muted-foreground">Group extensions to ring together</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-ring-group">
              <Plus className="h-4 w-4 mr-2" />
              Add Ring Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRg ? "Edit" : "Create"} Ring Group</DialogTitle>
              <DialogDescription>
                Configure your ring group settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sales Team"
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extension">Extension</Label>
                <Input
                  id="extension"
                  value={form.extension}
                  onChange={(e) => setForm({ ...form, extension: e.target.value })}
                  placeholder="8001"
                  data-testid="input-extension"
                />
                <p className="text-sm text-muted-foreground">Dial this extension to reach the ring group</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy">Ring Strategy</Label>
                <Select
                  value={form.strategy}
                  onValueChange={(value) => setForm({ ...form, strategy: value })}
                >
                  <SelectTrigger data-testid="select-strategy">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ring_all">Ring All - Ring all members simultaneously</SelectItem>
                    <SelectItem value="round_robin">Round Robin - Distribute calls evenly</SelectItem>
                    <SelectItem value="linear">Linear Hunt - Ring in order</SelectItem>
                    <SelectItem value="random">Random - Random selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ringTimeout">Ring Timeout (seconds)</Label>
                <Input
                  id="ringTimeout"
                  type="number"
                  value={form.ringTimeout}
                  onChange={(e) => setForm({ ...form, ringTimeout: parseInt(e.target.value) || 20 })}
                  data-testid="input-ring-timeout"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noAnswerDestination">No Answer Destination</Label>
                <Input
                  id="noAnswerDestination"
                  value={form.noAnswerDestination}
                  onChange={(e) => setForm({ ...form, noAnswerDestination: e.target.value })}
                  placeholder="Extension or voicemail"
                  data-testid="input-no-answer"
                />
                <p className="text-sm text-muted-foreground">Where to route if no one answers</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Enable this ring group</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  data-testid="switch-active"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-ring-group"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingRg ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ring Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-ring-groups">{ringGroups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ring Groups</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-ring-groups">
              {ringGroups.filter(r => r.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Ring Groups</CardTitle>
          <CardDescription>Group extensions to handle calls together</CardDescription>
        </CardHeader>
        <CardContent>
          {ringGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No ring groups yet</h3>
              <p className="text-muted-foreground mb-4">Create a ring group to route calls to multiple extensions.</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ring Group
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Extension</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ringGroups.map((rg) => (
                  <TableRow key={rg.id} data-testid={`row-ring-group-${rg.id}`}>
                    <TableCell className="font-medium">{rg.name}</TableCell>
                    <TableCell>
                      {rg.extension ? (
                        <Badge variant="outline">{rg.extension}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {strategyLabels[rg.strategy || "ring_all"] || rg.strategy}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rg.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(rg)}
                          data-testid={`button-edit-${rg.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(rg.id)}
                          data-testid={`button-delete-${rg.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
