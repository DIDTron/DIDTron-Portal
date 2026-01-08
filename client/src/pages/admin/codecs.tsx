import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Radio, Pencil, Trash2 } from "lucide-react";
import type { Codec } from "@shared/schema";

export default function CodecsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCodec, setEditingCodec] = useState<Codec | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    priority: "1",
  });

  const { data: codecs, isLoading } = useQuery<Codec[]>({
    queryKey: ["/api/codecs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/codecs", {
        ...data,
        priority: parseInt(data.priority),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/codecs"] });
      toast({ title: "Codec created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create codec", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/codecs/${id}`, {
        ...data,
        priority: parseInt(data.priority),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/codecs"] });
      toast({ title: "Codec updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update codec", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/codecs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/codecs"] });
      toast({ title: "Codec deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete codec", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "", priority: "1" });
    setEditingCodec(null);
    setIsOpen(false);
  };

  const handleEdit = (codec: Codec) => {
    setEditingCodec(codec);
    setFormData({
      name: codec.name,
      code: codec.code,
      description: codec.description || "",
      priority: String(codec.priority || 1),
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCodec) {
      updateMutation.mutate({ id: editingCodec.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(codecs || []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-codecs-title">Codecs</h1>
          <p className="text-muted-foreground">Configure audio codecs</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCodec(null); setFormData({ name: "", code: "", description: "", priority: "1" }); }} data-testid="button-add-codec">
              <Plus className="h-4 w-4 mr-2" />
              Add Codec
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCodec ? "Edit Codec" : "Add Codec"}</DialogTitle>
                <DialogDescription>{editingCodec ? "Update codec settings" : "Configure a new audio codec"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="G.711 ulaw"
                      required
                      data-testid="input-codec-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="PCMU"
                      required
                      data-testid="input-codec-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="High quality audio codec"
                    data-testid="input-codec-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    placeholder="1"
                    data-testid="input-codec-priority"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-codec">Cancel</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-codec">
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
          ) : codecs && codecs.length > 0 ? (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((codec) => (
                  <TableRow key={codec.id} data-testid={`row-codec-${codec.id}`}>
                    <TableCell className="font-medium">{codec.name}</TableCell>
                    <TableCell><code className="text-xs">{codec.code}</code></TableCell>
                    <TableCell>{codec.description || "-"}</TableCell>
                    <TableCell>{codec.priority}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(codec)} aria-label="Edit" data-testid={`button-edit-codec-${codec.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(codec.id)} aria-label="Delete" data-testid={`button-delete-codec-${codec.id}`}>
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
              <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No codecs configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add audio codecs for voice quality</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-codec">
                <Plus className="h-4 w-4 mr-2" />
                Add Codec
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
