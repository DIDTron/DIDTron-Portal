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
import { Plus, Tag, Pencil, Trash2 } from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { PromoCode } from "@shared/schema";

type PromoCodeFormData = {
  code: string;
  description: string;
  discountType: string;
  discountValue: string;
  maxUses: string;
  isActive: boolean;
};

export default function PromoCodesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxUses: "",
    isActive: true,
  });

  const { data: promoCodes, isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/promo-codes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: PromoCodeFormData) => {
      const res = await apiRequest("POST", "/api/promo-codes", {
        ...data,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promo code created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create promo code", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PromoCodeFormData }) => {
      const res = await apiRequest("PATCH", `/api/promo-codes/${id}`, {
        ...data,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promo code updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update promo code", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({ title: "Promo code deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete promo code", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      maxUses: "",
      isActive: true,
    });
    setEditingCode(null);
    setIsOpen(false);
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      description: promoCode.description || "",
      discountType: promoCode.discountType || "percentage",
      discountValue: promoCode.discountValue,
      maxUses: promoCode.maxUses?.toString() || "",
      isActive: promoCode.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(promoCodes ?? []);

  return (
    <div className="space-y-4" data-testid="promo-codes-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Promo Codes</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-promo">
              <Plus className="h-4 w-4 mr-1" />
              Add Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="dialog-promo-form">
            <DialogHeader>
              <DialogTitle>{editingCode ? "Edit Promo Code" : "Add Promo Code"}</DialogTitle>
              <DialogDescription>
                {editingCode ? "Update promo code details" : "Create a new promotional code"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME20"
                      required
                      data-testid="input-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(v) => setFormData({ ...formData, discountType: v })}
                    >
                      <SelectTrigger data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="20% off for new customers"
                    data-testid="input-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Value {formData.discountType === "percentage" ? "(%)" : "($)"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === "percentage" ? "20" : "10.00"}
                      required
                      data-testid="input-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Max Uses (optional)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      placeholder="100"
                      data-testid="input-max-uses"
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
                  data-testid="button-save-promo"
                >
                  {editingCode ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading promo codes...</div>
          ) : !promoCodes?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No promo codes found. Create your first promotional code.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((promo) => (
                    <TableRow key={promo.id} data-testid={`row-promo-${promo.id}`}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{promo.code}</Badge>
                      </TableCell>
                      <TableCell>
                        {promo.discountType === "percentage" 
                          ? `${promo.discountValue}%` 
                          : `$${promo.discountValue}`}
                      </TableCell>
                      <TableCell>
                        {promo.usedCount || 0} / {promo.maxUses || "Unlimited"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={promo.isActive 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-muted text-muted-foreground"
                          }
                        >
                          {promo.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(promo)}
                            data-testid={`button-edit-promo-${promo.id}`}
                            aria-label="Edit promo code"
                            title="Edit promo code"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(promo.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-promo-${promo.id}`}
                            aria-label="Delete promo code"
                            title="Delete promo code"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
