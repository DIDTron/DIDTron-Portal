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
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
import type { Carrier } from "@shared/schema";

export default function CarriersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "wholesale",
    sipHost: "",
    sipPort: "5060",
    billingEmail: "",
    technicalEmail: "",
  });

  const { data: carriers, isLoading } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/carriers", {
        ...data,
        sipPort: parseInt(data.sipPort),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create carrier", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/carriers/${id}`, {
        ...data,
        sipPort: parseInt(data.sipPort),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update carrier", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/carriers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({ title: "Carrier deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete carrier", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "wholesale",
      sipHost: "",
      sipPort: "5060",
      billingEmail: "",
      technicalEmail: "",
    });
    setEditingCarrier(null);
    setIsOpen(false);
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      name: carrier.name,
      code: carrier.code,
      type: carrier.type || "wholesale",
      sipHost: carrier.sipHost || "",
      sipPort: String(carrier.sipPort || 5060),
      billingEmail: carrier.billingEmail || "",
      technicalEmail: carrier.technicalEmail || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCarrier) {
      updateMutation.mutate({ id: editingCarrier.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-carriers-title">Carriers</h1>
          <p className="text-muted-foreground">Manage carrier connections</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCarrier(null); setFormData({ name: "", code: "", type: "wholesale", sipHost: "", sipPort: "5060", billingEmail: "", technicalEmail: "" }); }} data-testid="button-add-carrier">
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCarrier ? "Edit Carrier" : "Add Carrier"}</DialogTitle>
                <DialogDescription>{editingCarrier ? "Update carrier settings" : "Configure a new carrier connection"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Carrier Name"
                      required
                      data-testid="input-carrier-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="CARRIER1"
                      required
                      data-testid="input-carrier-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger data-testid="select-carrier-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale" data-testid="option-carrier-type-wholesale">Wholesale</SelectItem>
                      <SelectItem value="retail" data-testid="option-carrier-type-retail">Retail</SelectItem>
                      <SelectItem value="hybrid" data-testid="option-carrier-type-hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="sipHost">SIP Host</Label>
                    <Input
                      id="sipHost"
                      value={formData.sipHost}
                      onChange={(e) => setFormData({ ...formData, sipHost: e.target.value })}
                      placeholder="sip.carrier.com"
                      data-testid="input-carrier-host"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sipPort">Port</Label>
                    <Input
                      id="sipPort"
                      type="number"
                      value={formData.sipPort}
                      onChange={(e) => setFormData({ ...formData, sipPort: e.target.value })}
                      placeholder="5060"
                      data-testid="input-carrier-port"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingEmail">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      placeholder="billing@carrier.com"
                      data-testid="input-carrier-billing-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technicalEmail">Technical Email</Label>
                    <Input
                      id="technicalEmail"
                      type="email"
                      value={formData.technicalEmail}
                      onChange={(e) => setFormData({ ...formData, technicalEmail: e.target.value })}
                      placeholder="noc@carrier.com"
                      data-testid="input-carrier-technical-email"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-carrier">Cancel</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-carrier">
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
          ) : carriers && carriers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>SIP Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((carrier) => (
                  <TableRow key={carrier.id} data-testid={`row-carrier-${carrier.id}`}>
                    <TableCell className="font-medium">{carrier.name}</TableCell>
                    <TableCell><code className="text-xs">{carrier.code}</code></TableCell>
                    <TableCell>
                      <Badge variant="outline">{carrier.type}</Badge>
                    </TableCell>
                    <TableCell>{carrier.sipHost ? `${carrier.sipHost}:${carrier.sipPort}` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={carrier.status === "active" ? "default" : "secondary"}>
                        {carrier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(carrier)} data-testid={`button-edit-carrier-${carrier.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(carrier.id)} data-testid={`button-delete-carrier-${carrier.id}`}>
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
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No carriers configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add carrier connections for voice routing</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-carrier">
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
