import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Phone, MessageSquare } from "lucide-react";
import type { Ivr } from "@shared/schema";

type IvrFormData = {
  name: string;
  description: string;
  greetingType: string;
  greetingText: string;
  timeout: number;
  maxRetries: number;
  invalidDestination: string;
  timeoutDestination: string;
  isActive: boolean;
};

const defaultForm: IvrFormData = {
  name: "",
  description: "",
  greetingType: "tts",
  greetingText: "",
  timeout: 10,
  maxRetries: 3,
  invalidDestination: "",
  timeoutDestination: "",
  isActive: true,
};

export default function PortalIvrPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingIvr, setEditingIvr] = useState<Ivr | null>(null);
  const [form, setForm] = useState<IvrFormData>(defaultForm);
  const [activeTab, setActiveTab] = useState("general");

  const { data: ivrs = [], isLoading } = useQuery<Ivr[]>({
    queryKey: ["/api/my/ivrs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: IvrFormData) => {
      const res = await apiRequest("POST", "/api/my/ivrs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ivrs"] });
      toast({ title: "IVR created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create IVR", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IvrFormData> }) => {
      const res = await apiRequest("PATCH", `/api/my/ivrs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ivrs"] });
      toast({ title: "IVR updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update IVR", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/ivrs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ivrs"] });
      toast({ title: "IVR deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete IVR", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingIvr(null);
    setIsOpen(false);
    setActiveTab("general");
  };

  const handleEdit = (ivr: Ivr) => {
    setEditingIvr(ivr);
    setForm({
      name: ivr.name,
      description: ivr.description || "",
      greetingType: ivr.greetingType || "tts",
      greetingText: ivr.greetingText || "",
      timeout: ivr.timeout ?? 10,
      maxRetries: ivr.maxRetries ?? 3,
      invalidDestination: ivr.invalidDestination || "",
      timeoutDestination: ivr.timeoutDestination || "",
      isActive: ivr.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (editingIvr) {
      updateMutation.mutate({ id: editingIvr.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this IVR?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading IVRs...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">IVR Menus</h1>
          <p className="text-muted-foreground">Create interactive voice response menus</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-ivr">
              <Plus className="h-4 w-4 mr-2" />
              Add IVR
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingIvr ? "Edit" : "Create"} IVR</DialogTitle>
              <DialogDescription>
                Configure your interactive voice response menu.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Main Menu"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Welcome menu for incoming calls"
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greetingType">Greeting Type</Label>
                  <Select
                    value={form.greetingType}
                    onValueChange={(value) => setForm({ ...form, greetingType: value })}
                  >
                    <SelectTrigger data-testid="select-greeting-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tts">Text-to-Speech</SelectItem>
                      <SelectItem value="audio">Audio File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greetingText">Greeting Text</Label>
                  <Textarea
                    id="greetingText"
                    value={form.greetingText}
                    onChange={(e) => setForm({ ...form, greetingText: e.target.value })}
                    placeholder="Thank you for calling. Press 1 for Sales, Press 2 for Support..."
                    rows={3}
                    data-testid="input-greeting-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={form.timeout}
                      onChange={(e) => setForm({ ...form, timeout: parseInt(e.target.value) || 10 })}
                      data-testid="input-timeout"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      value={form.maxRetries}
                      onChange={(e) => setForm({ ...form, maxRetries: parseInt(e.target.value) || 3 })}
                      data-testid="input-max-retries"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">Enable this IVR menu</p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    data-testid="switch-active"
                  />
                </div>
              </TabsContent>

              <TabsContent value="destinations" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="invalidDestination">Invalid Input Destination</Label>
                  <Input
                    id="invalidDestination"
                    value={form.invalidDestination}
                    onChange={(e) => setForm({ ...form, invalidDestination: e.target.value })}
                    placeholder="Extension or phone number for invalid inputs"
                    data-testid="input-invalid-destination"
                  />
                  <p className="text-sm text-muted-foreground">Where to route when caller presses invalid key</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeoutDestination">Timeout Destination</Label>
                  <Input
                    id="timeoutDestination"
                    value={form.timeoutDestination}
                    onChange={(e) => setForm({ ...form, timeoutDestination: e.target.value })}
                    placeholder="Extension or phone number for timeout"
                    data-testid="input-timeout-destination"
                  />
                  <p className="text-sm text-muted-foreground">Where to route when caller does not respond</p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-ivr"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingIvr ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IVRs</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-ivrs">{ivrs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active IVRs</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-ivrs">
              {ivrs.filter(i => i.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your IVR Menus</CardTitle>
          <CardDescription>Interactive voice response menus for routing callers</CardDescription>
        </CardHeader>
        <CardContent>
          {ivrs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No IVR menus yet</h3>
              <p className="text-muted-foreground mb-4">Create your first IVR menu to route callers.</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First IVR
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Greeting Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ivrs.map((ivr) => (
                  <TableRow key={ivr.id} data-testid={`row-ivr-${ivr.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ivr.name}</div>
                        {ivr.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{ivr.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ivr.greetingType === "tts" ? "Text-to-Speech" : "Audio"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ivr.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(ivr)}
                          data-testid={`button-edit-${ivr.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(ivr.id)}
                          data-testid={`button-delete-${ivr.id}`}
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
