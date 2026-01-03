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
import { Plus, Building, Pencil, Trash2 } from "lucide-react";
import type { didProviders } from "@shared/schema";

type DidProvider = typeof didProviders.$inferSelect;

export default function DIDProvidersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<DidProvider | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    apiEndpoint: "",
    isActive: true,
  });

  const { data: providers, isLoading } = useQuery<DidProvider[]>({
    queryKey: ["/api/did-providers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/did-providers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/did-providers"] });
      toast({ title: "DID provider created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create DID provider", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/did-providers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/did-providers"] });
      toast({ title: "DID provider updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update DID provider", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/did-providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/did-providers"] });
      toast({ title: "DID provider deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete DID provider", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      apiEndpoint: "",
      isActive: true,
    });
    setEditingProvider(null);
    setIsOpen(false);
  };

  const handleEdit = (provider: DidProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      code: provider.code,
      apiEndpoint: provider.apiEndpoint || "",
      isActive: provider.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProvider) {
      updateMutation.mutate({ id: editingProvider.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-did-providers-title">DID Providers</h1>
          <p className="text-muted-foreground">Manage DID number providers</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProvider(null); setFormData({ name: "", code: "", apiEndpoint: "", isActive: true }); }} data-testid="button-add-provider">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingProvider ? "Edit DID Provider" : "Add DID Provider"}</DialogTitle>
                <DialogDescription>{editingProvider ? "Update provider settings" : "Configure a new DID provider"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Provider Name"
                      required
                      data-testid="input-provider-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="PROVIDER1"
                      required
                      data-testid="input-provider-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input
                    id="apiEndpoint"
                    value={formData.apiEndpoint}
                    onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                    placeholder="https://api.provider.com"
                    data-testid="input-provider-api"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    data-testid="switch-provider-active"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-provider">Cancel</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-provider">
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
          ) : providers && providers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>API Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id} data-testid={`row-provider-${provider.id}`}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell><code className="text-xs">{provider.code}</code></TableCell>
                    <TableCell className="text-sm">{provider.apiEndpoint || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={provider.isActive ? "default" : "secondary"}>
                        {provider.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(provider)} data-testid={`button-edit-provider-${provider.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(provider.id)} data-testid={`button-delete-provider-${provider.id}`}>
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
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No DID providers configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add providers for DID number sourcing</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-provider">
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
