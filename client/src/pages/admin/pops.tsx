import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Server, Pencil, Trash2 } from "lucide-react";
import type { Pop } from "@shared/schema";

export default function POPsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPop, setEditingPop] = useState<Pop | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    region: "",
    country: "",
    city: "",
    fqdn: "",
    ipAddress: "",
  });

  const { data: pops, isLoading } = useQuery<Pop[]>({
    queryKey: ["/api/pops"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/pops", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pops"] });
      toast({ title: "POP created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create POP", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/pops/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pops"] });
      toast({ title: "POP updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update POP", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/pops/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pops"] });
      toast({ title: "POP deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete POP", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", region: "", country: "", city: "", fqdn: "", ipAddress: "" });
    setEditingPop(null);
    setIsOpen(false);
  };

  const handleEdit = (pop: Pop) => {
    setEditingPop(pop);
    setFormData({
      name: pop.name,
      code: pop.code,
      region: pop.region || "",
      country: pop.country || "",
      city: pop.city || "",
      fqdn: pop.fqdn || "",
      ipAddress: pop.ipAddress || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPop) {
      updateMutation.mutate({ id: editingPop.id, data: formData });
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
  } = useDataTablePagination(pops || []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-pops-title">Points of Presence</h1>
          <p className="text-muted-foreground">Manage your network POPs</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-pop">
              <Plus className="h-4 w-4 mr-2" />
              Add POP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingPop ? "Edit POP" : "Add New POP"}</DialogTitle>
                <DialogDescription>Configure a Point of Presence for your network</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="US East"
                      required
                      data-testid="input-pop-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="US-EAST-1"
                      required
                      data-testid="input-pop-code"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      placeholder="North America"
                      data-testid="input-pop-region"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="US"
                      data-testid="input-pop-country"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                      data-testid="input-pop-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fqdn">FQDN</Label>
                    <Input
                      id="fqdn"
                      value={formData.fqdn}
                      onChange={(e) => setFormData({ ...formData, fqdn: e.target.value })}
                      placeholder="pop1.example.com"
                      required
                      data-testid="input-pop-fqdn"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="192.168.1.1"
                    data-testid="input-pop-ip"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-pop">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
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
          ) : pops && pops.length > 0 ? (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((pop) => (
                  <TableRow key={pop.id} data-testid={`row-pop-${pop.id}`}>
                    <TableCell className="font-medium">{pop.name}</TableCell>
                    <TableCell><code className="text-xs">{pop.code}</code></TableCell>
                    <TableCell>{pop.region || "-"}</TableCell>
                    <TableCell>{[pop.city, pop.country].filter(Boolean).join(", ") || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={pop.status === "active" ? "default" : "secondary"}>
                        {pop.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(pop)} data-testid={`button-edit-pop-${pop.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(pop.id)} data-testid={`button-delete-pop-${pop.id}`}>
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
              <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No POPs configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add your first Point of Presence to get started</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-pop">
                <Plus className="h-4 w-4 mr-2" />
                Add POP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
