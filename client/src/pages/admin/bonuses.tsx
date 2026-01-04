import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Gift, Pencil, Trash2 } from "lucide-react";
import type { BonusType } from "@shared/schema";

type BonusFormData = {
  name: string;
  code: string;
  type: string;
  amount: string;
  percentage: string;
  isActive: boolean;
};

export default function BonusesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<BonusType | null>(null);
  const [formData, setFormData] = useState<BonusFormData>({
    name: "",
    code: "",
    type: "signup",
    amount: "",
    percentage: "",
    isActive: true,
  });

  const { data: bonuses, isLoading } = useQuery<BonusType[]>({
    queryKey: ["/api/bonuses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: BonusFormData) => {
      const res = await apiRequest("POST", "/api/bonuses", {
        ...data,
        amount: data.amount || null,
        percentage: data.percentage || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonuses"] });
      toast({ title: "Bonus created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create bonus", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BonusFormData }) => {
      const res = await apiRequest("PATCH", `/api/bonuses/${id}`, {
        ...data,
        amount: data.amount || null,
        percentage: data.percentage || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonuses"] });
      toast({ title: "Bonus updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update bonus", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bonuses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bonuses"] });
      toast({ title: "Bonus deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete bonus", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "signup",
      amount: "",
      percentage: "",
      isActive: true,
    });
    setEditingBonus(null);
    setIsOpen(false);
  };

  const handleEdit = (bonus: BonusType) => {
    setEditingBonus(bonus);
    setFormData({
      name: bonus.name,
      code: bonus.code,
      type: bonus.type || "signup",
      amount: bonus.amount || "",
      percentage: bonus.percentage || "",
      isActive: bonus.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBonus) {
      updateMutation.mutate({ id: editingBonus.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getBonusValue = (bonus: BonusType) => {
    if (bonus.percentage) return `${bonus.percentage}%`;
    if (bonus.amount) return `$${bonus.amount}`;
    return "-";
  };

  return (
    <div className="space-y-4" data-testid="bonuses-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Bonuses</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-bonus">
              <Plus className="h-4 w-4 mr-1" />
              Add Bonus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="dialog-bonus-form">
            <DialogHeader>
              <DialogTitle>{editingBonus ? "Edit Bonus" : "Add Bonus"}</DialogTitle>
              <DialogDescription>
                {editingBonus ? "Update bonus details" : "Create a new bonus type"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Welcome Bonus"
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME"
                      required
                      data-testid="input-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Bonus Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signup">Signup Bonus</SelectItem>
                      <SelectItem value="deposit">Deposit Match</SelectItem>
                      <SelectItem value="usage">Usage Bonus</SelectItem>
                      <SelectItem value="referral">Referral Bonus</SelectItem>
                      <SelectItem value="loyalty">Loyalty Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Fixed Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="10.00"
                      data-testid="input-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Percentage (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.01"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      placeholder="10"
                      data-testid="input-percentage"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    data-testid="switch-active"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-bonus"
                >
                  {editingBonus ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading bonuses...</div>
          ) : !(bonuses ?? []).length ? (
            <div className="p-8 text-center text-muted-foreground">
              No bonuses found. Create your first bonus type.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(bonuses ?? []).map((bonus) => (
                  <TableRow key={bonus.id} data-testid={`row-bonus-${bonus.id}`}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{bonus.code}</Badge>
                    </TableCell>
                    <TableCell>{bonus.name}</TableCell>
                    <TableCell className="capitalize">{bonus.type}</TableCell>
                    <TableCell>{getBonusValue(bonus)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={bonus.isActive 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {bonus.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(bonus)}
                          data-testid={`button-edit-bonus-${bonus.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(bonus.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-bonus-${bonus.id}`}
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
