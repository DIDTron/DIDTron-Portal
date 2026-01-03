import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Layers, Pencil, Trash2 } from "lucide-react";
import type { VoiceTier } from "@shared/schema";

export default function VoiceTiersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<VoiceTier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    baseRate: "0.012",
  });

  const { data: tiers, isLoading } = useQuery<VoiceTier[]>({
    queryKey: ["/api/voice-tiers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/voice-tiers", {
        ...data,
        baseRate: data.baseRate,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-tiers"] });
      toast({ title: "Voice tier created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create voice tier", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/voice-tiers/${id}`, {
        ...data,
        baseRate: data.baseRate,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-tiers"] });
      toast({ title: "Voice tier updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update voice tier", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/voice-tiers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-tiers"] });
      toast({ title: "Voice tier deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete voice tier", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "", baseRate: "0.012" });
    setEditingTier(null);
    setIsOpen(false);
  };

  const handleEdit = (tier: VoiceTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      code: tier.code,
      description: tier.description || "",
      baseRate: tier.baseRate || "0.012",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTier) {
      updateMutation.mutate({ id: editingTier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-voice-tiers-title">Voice Tiers</h1>
          <p className="text-muted-foreground">Configure voice quality levels</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTier(null); setFormData({ name: "", code: "", description: "", baseRate: "0.012" }); }} data-testid="button-add-tier">
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingTier ? "Edit Voice Tier" : "Add Voice Tier"}</DialogTitle>
                <DialogDescription>{editingTier ? "Update voice tier settings" : "Create a new voice quality tier"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Premium"
                      required
                      data-testid="input-tier-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="PREMIUM"
                      required
                      data-testid="input-tier-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Rate ($/min)</Label>
                  <Input
                    id="baseRate"
                    value={formData.baseRate}
                    onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
                    placeholder="0.012"
                    data-testid="input-tier-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="High-quality voice with premium routing"
                    data-testid="input-tier-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-tier">Cancel</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-tier">
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : tiers && tiers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Base Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id} data-testid={`row-tier-${tier.id}`}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell><code className="text-xs">{tier.code}</code></TableCell>
                    <TableCell>${tier.baseRate}/min</TableCell>
                    <TableCell>
                      <Badge variant={tier.status === "active" ? "default" : "secondary"}>
                        {tier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(tier)} data-testid={`button-edit-tier-${tier.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(tier.id)} data-testid={`button-delete-tier-${tier.id}`}>
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
              <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No voice tiers configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add voice quality tiers for routing</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-tier">
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
