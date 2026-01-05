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
import { Plus, Pencil, Trash2, Phone, User, Voicemail, PhoneForwarded, Settings } from "lucide-react";
import type { Extension } from "@shared/schema";

type ExtensionFormData = {
  extension: string;
  name: string;
  email: string;
  sipUsername: string;
  sipPassword: string;
  callerId: string;
  voicemailEnabled: boolean;
  voicemailPin: string;
  voicemailEmail: string;
  ringTimeout: number;
  dndEnabled: boolean;
  callWaitingEnabled: boolean;
  forwardingEnabled: boolean;
  forwardingDestination: string;
};

const defaultForm: ExtensionFormData = {
  extension: "",
  name: "",
  email: "",
  sipUsername: "",
  sipPassword: "",
  callerId: "",
  voicemailEnabled: true,
  voicemailPin: "",
  voicemailEmail: "",
  ringTimeout: 20,
  dndEnabled: false,
  callWaitingEnabled: true,
  forwardingEnabled: false,
  forwardingDestination: "",
};

function getStatusBadge(status: string | null) {
  switch (status) {
    case "active":
      return <Badge variant="default">Active</Badge>;
    case "suspended":
      return <Badge variant="secondary">Suspended</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

export default function PortalExtensionsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingExt, setEditingExt] = useState<Extension | null>(null);
  const [form, setForm] = useState<ExtensionFormData>(defaultForm);
  const [activeTab, setActiveTab] = useState("general");

  const { data: extensions = [], isLoading } = useQuery<Extension[]>({
    queryKey: ["/api/my/extensions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExtensionFormData) => {
      const res = await apiRequest("POST", "/api/my/extensions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/extensions"] });
      toast({ title: "Extension created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create extension", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ExtensionFormData> }) => {
      const res = await apiRequest("PATCH", `/api/my/extensions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/extensions"] });
      toast({ title: "Extension updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update extension", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/extensions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/extensions"] });
      toast({ title: "Extension deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete extension", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingExt(null);
    setIsOpen(false);
    setActiveTab("general");
  };

  const handleEdit = (ext: Extension) => {
    setEditingExt(ext);
    setForm({
      extension: ext.extension,
      name: ext.name,
      email: ext.email || "",
      sipUsername: ext.sipUsername,
      sipPassword: ext.sipPassword,
      callerId: ext.callerId || "",
      voicemailEnabled: ext.voicemailEnabled ?? true,
      voicemailPin: ext.voicemailPin || "",
      voicemailEmail: ext.voicemailEmail || "",
      ringTimeout: ext.ringTimeout ?? 20,
      dndEnabled: ext.dndEnabled ?? false,
      callWaitingEnabled: ext.callWaitingEnabled ?? true,
      forwardingEnabled: ext.forwardingEnabled ?? false,
      forwardingDestination: ext.forwardingDestination || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.extension || !form.name || !form.sipUsername || !form.sipPassword) {
      toast({ title: "Extension, name, SIP username and password are required", variant: "destructive" });
      return;
    }
    if (editingExt) {
      updateMutation.mutate({ id: editingExt.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this extension?")) {
      deleteMutation.mutate(id);
    }
  };

  const generateCredentials = () => {
    const username = `ext${form.extension || Math.floor(Math.random() * 9000) + 1000}`;
    const password = Array.from({ length: 16 }, () => 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62))
    ).join("");
    setForm({ ...form, sipUsername: username, sipPassword: password });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading extensions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Extensions</h1>
          <p className="text-muted-foreground">Manage your Cloud PBX extensions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-extension">
              <Plus className="h-4 w-4 mr-2" />
              Add Extension
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExt ? "Edit" : "Create"} Extension</DialogTitle>
              <DialogDescription>
                Configure your PBX extension settings.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="voicemail">Voicemail</TabsTrigger>
                <TabsTrigger value="forwarding">Forwarding</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="extension">Extension Number</Label>
                    <Input
                      id="extension"
                      value={form.extension}
                      onChange={(e) => setForm({ ...form, extension: e.target.value })}
                      placeholder="1001"
                      data-testid="input-extension"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      data-testid="input-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callerId">Caller ID</Label>
                  <Input
                    id="callerId"
                    value={form.callerId}
                    onChange={(e) => setForm({ ...form, callerId: e.target.value })}
                    placeholder="+1234567890"
                    data-testid="input-caller-id"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>SIP Credentials</Label>
                    <Button type="button" variant="outline" size="sm" onClick={generateCredentials} data-testid="button-generate-credentials">
                      Generate
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sipUsername">SIP Username</Label>
                      <Input
                        id="sipUsername"
                        value={form.sipUsername}
                        onChange={(e) => setForm({ ...form, sipUsername: e.target.value })}
                        data-testid="input-sip-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sipPassword">SIP Password</Label>
                      <Input
                        id="sipPassword"
                        type="password"
                        value={form.sipPassword}
                        onChange={(e) => setForm({ ...form, sipPassword: e.target.value })}
                        data-testid="input-sip-password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ring Timeout (seconds)</Label>
                  </div>
                  <Input
                    type="number"
                    value={form.ringTimeout}
                    onChange={(e) => setForm({ ...form, ringTimeout: parseInt(e.target.value) || 20 })}
                    className="w-24"
                    data-testid="input-ring-timeout"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Do Not Disturb</Label>
                    <p className="text-sm text-muted-foreground">Send calls directly to voicemail</p>
                  </div>
                  <Switch
                    checked={form.dndEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, dndEnabled: checked })}
                    data-testid="switch-dnd"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call Waiting</Label>
                    <p className="text-sm text-muted-foreground">Allow multiple incoming calls</p>
                  </div>
                  <Switch
                    checked={form.callWaitingEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, callWaitingEnabled: checked })}
                    data-testid="switch-call-waiting"
                  />
                </div>
              </TabsContent>

              <TabsContent value="voicemail" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Voicemail</Label>
                    <p className="text-sm text-muted-foreground">Allow callers to leave messages</p>
                  </div>
                  <Switch
                    checked={form.voicemailEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, voicemailEnabled: checked })}
                    data-testid="switch-voicemail"
                  />
                </div>

                {form.voicemailEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="voicemailPin">Voicemail PIN</Label>
                      <Input
                        id="voicemailPin"
                        type="password"
                        value={form.voicemailPin}
                        onChange={(e) => setForm({ ...form, voicemailPin: e.target.value })}
                        placeholder="1234"
                        data-testid="input-voicemail-pin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voicemailEmail">Voicemail Email</Label>
                      <Input
                        id="voicemailEmail"
                        type="email"
                        value={form.voicemailEmail}
                        onChange={(e) => setForm({ ...form, voicemailEmail: e.target.value })}
                        placeholder="Send voicemails to this email"
                        data-testid="input-voicemail-email"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="forwarding" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Call Forwarding</Label>
                    <p className="text-sm text-muted-foreground">Forward calls to another number</p>
                  </div>
                  <Switch
                    checked={form.forwardingEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, forwardingEnabled: checked })}
                    data-testid="switch-forwarding"
                  />
                </div>

                {form.forwardingEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="forwardingDestination">Forward To</Label>
                    <Input
                      id="forwardingDestination"
                      value={form.forwardingDestination}
                      onChange={(e) => setForm({ ...form, forwardingDestination: e.target.value })}
                      placeholder="+1234567890"
                      data-testid="input-forwarding-destination"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm} data-testid="button-cancel">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-extension"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingExt ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Extensions</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-extensions">{extensions.length}</div>
            <p className="text-xs text-muted-foreground">$3.00/extension/month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Extensions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-extensions">
              {extensions.filter(e => e.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voicemail Enabled</CardTitle>
            <Voicemail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-voicemail-enabled">
              {extensions.filter(e => e.voicemailEnabled).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Extensions</CardTitle>
          <CardDescription>Manage your Cloud PBX extensions</CardDescription>
        </CardHeader>
        <CardContent>
          {extensions.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No extensions yet</h3>
              <p className="text-muted-foreground mb-4">Create your first extension to get started.</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Extension
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Extension</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extensions.map((ext) => (
                  <TableRow key={ext.id} data-testid={`row-extension-${ext.id}`}>
                    <TableCell>
                      <Badge variant="outline">{ext.extension}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ext.name}</div>
                        <div className="text-sm text-muted-foreground">{ext.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ext.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ext.voicemailEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            <Voicemail className="h-3 w-3 mr-1" />VM
                          </Badge>
                        )}
                        {ext.forwardingEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            <PhoneForwarded className="h-3 w-3 mr-1" />FWD
                          </Badge>
                        )}
                        {ext.dndEnabled && (
                          <Badge variant="destructive" className="text-xs">DND</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(ext)}
                          data-testid={`button-edit-${ext.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(ext.id)}
                          data-testid={`button-delete-${ext.id}`}
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
