import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Route as RouteIcon, Pencil, Trash2 } from "lucide-react";
import type { Route, Carrier } from "@shared/schema";

export default function RoutesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    carrierId: "",
    priority: "1",
    weight: "100",
  });

  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const { data: carriers } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/routes", {
        name: data.name,
        prefix: data.prefix,
        priority: parseInt(data.priority),
        weight: parseInt(data.weight),
        carrierId: data.carrierId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({ title: "Route created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create route", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/routes/${id}`, {
        name: data.name,
        prefix: data.prefix,
        priority: parseInt(data.priority),
        weight: parseInt(data.weight),
        carrierId: data.carrierId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({ title: "Route updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update route", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({ title: "Route deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete route", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      prefix: "",
      carrierId: "",
      priority: "1",
      weight: "100",
    });
    setEditingRoute(null);
    setIsOpen(false);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      prefix: route.prefix || "",
      carrierId: route.carrierId || "",
      priority: String(route.priority || 1),
      weight: String(route.weight || 100),
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoute) {
      updateMutation.mutate({ id: editingRoute.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  
  const getCarrierName = (carrierId: string | null) => {
    if (!carrierId || !carriers) return "-";
    const carrier = carriers.find(c => c.id === carrierId);
    return carrier?.name || carrierId;
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-routes-title">Routes</h1>
          <p className="text-muted-foreground">Configure call routing rules</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingRoute(null); setFormData({ name: "", prefix: "", carrierId: "", priority: "1", weight: "100" }); }} data-testid="button-add-route">
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRoute ? "Edit Route" : "Add Route"}</DialogTitle>
                <DialogDescription>{editingRoute ? "Update routing rule" : "Configure a new routing rule"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="US Domestic"
                      required
                      data-testid="input-route-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Prefix</Label>
                    <Input
                      id="prefix"
                      value={formData.prefix}
                      onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                      placeholder="1"
                      data-testid="input-route-prefix"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrierId">Carrier</Label>
                    <Select value={formData.carrierId} onValueChange={(v) => setFormData({ ...formData, carrierId: v })}>
                      <SelectTrigger data-testid="select-route-carrier">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers?.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      placeholder="1"
                      data-testid="input-route-priority"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="100"
                    data-testid="input-route-weight"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-route">Cancel</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-route">
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
          ) : routes && routes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id} data-testid={`row-route-${route.id}`}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell><code className="text-xs">{route.prefix || "*"}</code></TableCell>
                    <TableCell>{getCarrierName(route.carrierId)}</TableCell>
                    <TableCell>{route.priority}</TableCell>
                    <TableCell>
                      <Badge variant={route.status === "active" ? "default" : "secondary"}>
                        {route.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(route)} data-testid={`button-edit-route-${route.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(route.id)} data-testid={`button-delete-route-${route.id}`}>
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
              <RouteIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No routes configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add routing rules for call handling</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-route">
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
