import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
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
import { Plus, Pencil, Trash2, Users, Clock } from "lucide-react";
import type { Queue } from "@shared/schema";

type QueueFormData = {
  name: string;
  extension: string;
  strategy: string;
  maxWaitTime: number;
  announcePosition: boolean;
  holdMusicUrl: string;
  timeoutDestination: string;
  isActive: boolean;
};

const defaultForm: QueueFormData = {
  name: "",
  extension: "",
  strategy: "round_robin",
  maxWaitTime: 300,
  announcePosition: true,
  holdMusicUrl: "",
  timeoutDestination: "",
  isActive: true,
};

const strategyLabels: Record<string, string> = {
  round_robin: "Round Robin",
  ring_all: "Ring All",
  least_recent: "Least Recent",
  fewest_calls: "Fewest Calls",
  random: "Random",
};

export default function PortalQueuesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const [form, setForm] = useState<QueueFormData>(defaultForm);

  const { data: queues = [], isLoading } = useQuery<Queue[]>({
    queryKey: ["/api/my/queues"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: async (data: QueueFormData) => {
      const res = await apiRequest("POST", "/api/my/queues", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/queues"] });
      toast({ title: "Queue created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create queue", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QueueFormData> }) => {
      const res = await apiRequest("PATCH", `/api/my/queues/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/queues"] });
      toast({ title: "Queue updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update queue", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/queues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/queues"] });
      toast({ title: "Queue deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete queue", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingQueue(null);
    setIsOpen(false);
  };

  const handleEdit = (queue: Queue) => {
    setEditingQueue(queue);
    setForm({
      name: queue.name,
      extension: queue.extension || "",
      strategy: queue.strategy || "round_robin",
      maxWaitTime: queue.maxWaitTime ?? 300,
      announcePosition: queue.announcePosition ?? true,
      holdMusicUrl: queue.holdMusicUrl || "",
      timeoutDestination: queue.timeoutDestination || "",
      isActive: queue.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (editingQueue) {
      updateMutation.mutate({ id: editingQueue.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this queue?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading queues...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Call Queues</h1>
          <p className="text-muted-foreground">Manage call queues for your contact center</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-queue">
              <Plus className="h-4 w-4 mr-2" />
              Add Queue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingQueue ? "Edit" : "Create"} Queue</DialogTitle>
              <DialogDescription>
                Configure your call queue settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Support Queue"
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extension">Extension</Label>
                <Input
                  id="extension"
                  value={form.extension}
                  onChange={(e) => setForm({ ...form, extension: e.target.value })}
                  placeholder="9001"
                  data-testid="input-extension"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy">Queue Strategy</Label>
                <Select
                  value={form.strategy}
                  onValueChange={(value) => setForm({ ...form, strategy: value })}
                >
                  <SelectTrigger data-testid="select-strategy">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round_robin">Round Robin - Distribute evenly</SelectItem>
                    <SelectItem value="ring_all">Ring All - Ring all agents</SelectItem>
                    <SelectItem value="least_recent">Least Recent - Agent idle longest</SelectItem>
                    <SelectItem value="fewest_calls">Fewest Calls - Agent with least calls</SelectItem>
                    <SelectItem value="random">Random - Random agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWaitTime">Max Wait Time (seconds)</Label>
                <Input
                  id="maxWaitTime"
                  type="number"
                  value={form.maxWaitTime}
                  onChange={(e) => setForm({ ...form, maxWaitTime: parseInt(e.target.value) || 300 })}
                  data-testid="input-max-wait"
                />
                <p className="text-sm text-muted-foreground">Maximum time a caller waits before timeout</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holdMusicUrl">Hold Music URL</Label>
                <Input
                  id="holdMusicUrl"
                  value={form.holdMusicUrl}
                  onChange={(e) => setForm({ ...form, holdMusicUrl: e.target.value })}
                  placeholder="https://example.com/music.mp3"
                  data-testid="input-hold-music"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeoutDestination">Timeout Destination</Label>
                <Input
                  id="timeoutDestination"
                  value={form.timeoutDestination}
                  onChange={(e) => setForm({ ...form, timeoutDestination: e.target.value })}
                  placeholder="Extension or voicemail"
                  data-testid="input-timeout-destination"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Announce Position</Label>
                  <p className="text-sm text-muted-foreground">Tell callers their queue position</p>
                </div>
                <Switch
                  checked={form.announcePosition}
                  onCheckedChange={(checked) => setForm({ ...form, announcePosition: checked })}
                  data-testid="switch-announce"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Enable this queue</p>
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
                data-testid="button-save-queue"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingQueue ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queues</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-queues">{queues.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Queues</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-queues">
              {queues.filter(q => q.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Call Queues</CardTitle>
          <CardDescription>Manage queues for handling high call volume</CardDescription>
        </CardHeader>
        <CardContent>
          {queues.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No queues yet</h3>
              <p className="text-muted-foreground mb-4">Create a queue to manage inbound calls.</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Queue
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Extension</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Max Wait</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.map((queue) => (
                  <TableRow key={queue.id} data-testid={`row-queue-${queue.id}`}>
                    <TableCell className="font-medium">{queue.name}</TableCell>
                    <TableCell>
                      {queue.extension ? (
                        <Badge variant="outline">{queue.extension}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {strategyLabels[queue.strategy || "round_robin"] || queue.strategy}
                      </Badge>
                    </TableCell>
                    <TableCell>{queue.maxWaitTime}s</TableCell>
                    <TableCell>
                      {queue.isActive ? (
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
                          onClick={() => handleEdit(queue)}
                          data-testid={`button-edit-${queue.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(queue.id)}
                          data-testid={`button-delete-${queue.id}`}
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
