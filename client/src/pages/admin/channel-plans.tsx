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
import { Plus, CreditCard, Trash2 } from "lucide-react";
import type { ChannelPlan } from "@shared/schema";

export default function ChannelPlansPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    channels: "10",
    cps: "10",
    monthlyPrice: "0",
  });

  const { data: plans, isLoading } = useQuery<ChannelPlan[]>({
    queryKey: ["/api/channel-plans"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/channel-plans", {
        ...data,
        channels: parseInt(data.channels),
        cps: parseInt(data.cps),
        monthlyPrice: data.monthlyPrice,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channel-plans"] });
      toast({ title: "Channel plan created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create channel plan", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/channel-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channel-plans"] });
      toast({ title: "Channel plan deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete channel plan", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "", channels: "10", cps: "10", monthlyPrice: "0" });
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-channel-plans-title">Channel Plans</h1>
          <p className="text-muted-foreground">Configure concurrent channel limits</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-plan">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Channel Plan</DialogTitle>
                <DialogDescription>Configure concurrent channel limits</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Starter"
                      required
                      data-testid="input-plan-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="STARTER"
                      required
                      data-testid="input-plan-code"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="channels">Channels</Label>
                    <Input
                      id="channels"
                      type="number"
                      value={formData.channels}
                      onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                      placeholder="10"
                      required
                      data-testid="input-plan-channels"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cps">CPS</Label>
                    <Input
                      id="cps"
                      type="number"
                      value={formData.cps}
                      onChange={(e) => setFormData({ ...formData, cps: e.target.value })}
                      placeholder="10"
                      required
                      data-testid="input-plan-cps"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                    <Input
                      id="monthlyPrice"
                      value={formData.monthlyPrice}
                      onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                      placeholder="0"
                      data-testid="input-plan-price"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Basic plan for small businesses"
                    data-testid="input-plan-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-plan">
                  {createMutation.isPending ? "Saving..." : "Save"}
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
          ) : plans && plans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>CPS</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell><code className="text-xs">{plan.code}</code></TableCell>
                    <TableCell>{plan.channels}</TableCell>
                    <TableCell>{plan.cps}</TableCell>
                    <TableCell>${plan.monthlyPrice || "0"}</TableCell>
                    <TableCell>
                      <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(plan.id)} data-testid={`button-delete-plan-${plan.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No channel plans configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add channel plans for capacity management</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-plan">
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
