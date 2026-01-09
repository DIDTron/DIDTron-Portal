import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus, Pencil, Trash2, DollarSign, Star, CheckCircle2, Clock, Loader2
} from "lucide-react";

type PricingTier = {
  id: string;
  name: string;
  description: string | null;
  ratePerMinute: string;
  setupFee: string | null;
  minimumBillableSeconds: number | null;
  billingIncrement: number | null;
  llmProvider: string | null;
  ttsProvider: string | null;
  sttProvider: string | null;
  maxCallDuration: number | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
};

type TierFormData = {
  name: string;
  description: string;
  ratePerMinute: string;
  setupFee: string;
  minimumBillableSeconds: number;
  billingIncrement: number;
  llmProvider: string;
  ttsProvider: string;
  sttProvider: string;
  maxCallDuration: number;
  isDefault: boolean;
  isActive: boolean;
};

const defaultForm: TierFormData = {
  name: "",
  description: "",
  ratePerMinute: "0.10",
  setupFee: "0",
  minimumBillableSeconds: 60,
  billingIncrement: 6,
  llmProvider: "openai",
  ttsProvider: "openai",
  sttProvider: "openai",
  maxCallDuration: 1800,
  isDefault: false,
  isActive: true,
};

export default function AiVoiceBillingPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [form, setForm] = useState<TierFormData>(defaultForm);

  const { data: pricingTiers = [], isLoading } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/ai-voice/pricing-tiers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TierFormData) => {
      const res = await apiRequest("POST", "/api/admin/ai-voice/pricing-tiers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/pricing-tiers"] });
      toast({ title: "Pricing tier created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create pricing tier", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TierFormData> }) => {
      const res = await apiRequest("PATCH", `/api/admin/ai-voice/pricing-tiers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/pricing-tiers"] });
      toast({ title: "Pricing tier updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update pricing tier", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ai-voice/pricing-tiers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/pricing-tiers"] });
      toast({ title: "Pricing tier deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingTier(null);
    setIsOpen(false);
  };

  const handleEdit = (tier: PricingTier) => {
    setEditingTier(tier);
    setForm({
      name: tier.name,
      description: tier.description || "",
      ratePerMinute: tier.ratePerMinute,
      setupFee: tier.setupFee || "0",
      minimumBillableSeconds: tier.minimumBillableSeconds || 60,
      billingIncrement: tier.billingIncrement || 6,
      llmProvider: tier.llmProvider || "openai",
      ttsProvider: tier.ttsProvider || "openai",
      sttProvider: tier.sttProvider || "openai",
      maxCallDuration: tier.maxCallDuration || 1800,
      isDefault: tier.isDefault,
      isActive: tier.isActive,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.ratePerMinute) {
      toast({ title: "Name and rate are required", variant: "destructive" });
      return;
    }
    if (editingTier) {
      updateMutation.mutate({ id: editingTier.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const defaultTier = pricingTiers.find(t => t.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">AI Voice Billing</h1>
          <p className="text-muted-foreground">Configure pricing tiers and rates</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tier" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Pricing Tier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTier ? "Edit Pricing Tier" : "Create Pricing Tier"}</DialogTitle>
              <DialogDescription>Configure billing rates for AI Voice calls</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Tier Name</Label>
                  <Input
                    id="name"
                    data-testid="input-tier-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Standard"
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-tier-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Default pricing tier..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ratePerMinute">Rate per Minute ($)</Label>
                  <Input
                    id="ratePerMinute"
                    data-testid="input-rate"
                    value={form.ratePerMinute}
                    onChange={(e) => setForm({ ...form, ratePerMinute: e.target.value })}
                    placeholder="0.10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="setupFee">Setup Fee ($)</Label>
                  <Input
                    id="setupFee"
                    data-testid="input-setup-fee"
                    value={form.setupFee}
                    onChange={(e) => setForm({ ...form, setupFee: e.target.value })}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimumBillableSeconds">Min Billable (sec)</Label>
                  <Input
                    id="minimumBillableSeconds"
                    type="number"
                    data-testid="input-min-billable"
                    value={form.minimumBillableSeconds}
                    onChange={(e) => setForm({ ...form, minimumBillableSeconds: parseInt(e.target.value) || 60 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billingIncrement">Billing Increment (sec)</Label>
                  <Input
                    id="billingIncrement"
                    type="number"
                    data-testid="input-increment"
                    value={form.billingIncrement}
                    onChange={(e) => setForm({ ...form, billingIncrement: parseInt(e.target.value) || 6 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="llmProvider">LLM Provider</Label>
                  <Select value={form.llmProvider} onValueChange={(v) => setForm({ ...form, llmProvider: v })}>
                    <SelectTrigger data-testid="select-llm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxCallDuration">Max Duration (sec)</Label>
                  <Input
                    id="maxCallDuration"
                    type="number"
                    data-testid="input-max-duration"
                    value={form.maxCallDuration}
                    onChange={(e) => setForm({ ...form, maxCallDuration: parseInt(e.target.value) || 1800 })}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isDefault"
                    checked={form.isDefault}
                    onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
                    data-testid="switch-default"
                  />
                  <Label htmlFor="isDefault">Default Tier</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                    data-testid="switch-active"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                data-testid="button-save-tier"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Tier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Pricing Tiers</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingTiers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${defaultTier?.ratePerMinute || "0.10"}/min
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Active Tiers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricingTiers.filter(t => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Min Billable</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {defaultTier?.minimumBillableSeconds || 60}s
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Tiers</CardTitle>
          <CardDescription>Configure billing rates for AI Voice calls</CardDescription>
        </CardHeader>
        <CardContent>
          {pricingTiers.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Pricing Tiers</h3>
              <p className="text-muted-foreground mb-4">
                Create pricing tiers for AI Voice billing
              </p>
              <Button data-testid="button-create-first-tier" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Pricing Tier
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Min Billable</TableHead>
                  <TableHead>Increment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingTiers.map(tier => (
                  <TableRow key={tier.id} data-testid={`row-tier-${tier.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{tier.name}</div>
                        {tier.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      {tier.description && (
                        <div className="text-sm text-muted-foreground">{tier.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">${tier.ratePerMinute}/min</TableCell>
                    <TableCell>{tier.minimumBillableSeconds || 60}s</TableCell>
                    <TableCell>{tier.billingIncrement || 6}s</TableCell>
                    <TableCell>
                      {tier.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-edit-tier-${tier.id}`}
                          onClick={() => handleEdit(tier)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-delete-tier-${tier.id}`}
                          onClick={() => {
                            if (confirm("Delete this pricing tier?")) {
                              deleteMutation.mutate(tier.id);
                            }
                          }}
                          disabled={tier.isDefault}
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
