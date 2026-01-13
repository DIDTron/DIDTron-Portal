import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Layers, Pencil, Trash2 } from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { CustomerGroup, CustomerCategory } from "@shared/schema";

type GroupFormData = {
  name: string;
  code: string;
  categoryId: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
};

export default function GroupsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    code: "",
    categoryId: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  const { data: groups = [], isLoading } = useQuery<CustomerGroup[]>({
    queryKey: ["/api/groups"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery<CustomerCategory[]>({
    queryKey: ["/api/categories"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(groups);

  const createMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const res = await apiRequest("POST", "/api/groups", {
        ...data,
        categoryId: data.categoryId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Group created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create group", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GroupFormData }) => {
      const res = await apiRequest("PATCH", `/api/groups/${id}`, {
        ...data,
        categoryId: data.categoryId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Group updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update group", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({ title: "Group deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete group", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      categoryId: "",
      description: "",
      displayOrder: 0,
      isActive: true,
    });
    setEditingGroup(null);
    setIsOpen(false);
  };

  const handleEdit = (group: CustomerGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      code: group.code,
      categoryId: group.categoryId || "",
      description: group.description || "",
      displayOrder: group.displayOrder || 0,
      isActive: group.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "-";
    return categories?.find(c => c.id === categoryId)?.name || "-";
  };

  return (
    <div className="space-y-4" data-testid="groups-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Customer Groups</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-group">
              <Plus className="h-4 w-4 mr-1" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="dialog-group-form">
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Edit Group" : "Add Group"}</DialogTitle>
              <DialogDescription>
                {editingGroup ? "Update group details" : "Create a new customer group"}
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
                      placeholder="Premium Tier"
                      required
                      data-testid="input-group-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="PREM"
                      required
                      data-testid="input-group-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Parent Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select a category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Premium customers with priority support"
                    data-testid="input-group-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      data-testid="input-display-order"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      data-testid="switch-is-active"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-group"
                >
                  {editingGroup ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading groups...</div>
          ) : !groups.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No groups found. Create your first group to organize customers within categories.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((group) => (
                    <TableRow key={group.id} data-testid={`row-group-${group.id}`}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{group.code}</Badge>
                      </TableCell>
                      <TableCell>{getCategoryName(group.categoryId)}</TableCell>
                      <TableCell>{group.displayOrder}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={group.isActive 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-muted text-muted-foreground"
                          }
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(group)}
                            aria-label="Edit"
                            title="Edit"
                            data-testid={`button-edit-group-${group.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(group.id)}
                            disabled={deleteMutation.isPending}
                            aria-label="Delete"
                            title="Delete"
                            data-testid={`button-delete-group-${group.id}`}
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
