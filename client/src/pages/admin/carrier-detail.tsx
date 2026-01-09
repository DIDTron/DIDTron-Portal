import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, MoreVertical, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import type { Carrier, Currency, CarrierInterconnect, CarrierContact, CarrierCreditAlert } from "@shared/schema";

export default function CarrierDetailPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/carriers/:id");
  const carrierId = params?.id;

  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [showInterconnectDialog, setShowInterconnectDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [editingInterconnect, setEditingInterconnect] = useState<CarrierInterconnect | null>(null);
  const [editingContact, setEditingContact] = useState<CarrierContact | null>(null);
  const [editingAlert, setEditingAlert] = useState<CarrierCreditAlert | null>(null);

  const { data: carrier, isLoading } = useQuery<Carrier>({
    queryKey: ["/api/carriers", carrierId],
    enabled: !!carrierId,
  });

  const { data: currencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
  });

  const { data: interconnects } = useQuery<CarrierInterconnect[]>({
    queryKey: ["/api/carriers", carrierId, "interconnects"],
    enabled: !!carrierId,
  });

  const { data: contacts } = useQuery<CarrierContact[]>({
    queryKey: ["/api/carriers", carrierId, "contacts"],
    enabled: !!carrierId,
  });

  const { data: creditAlerts } = useQuery<CarrierCreditAlert[]>({
    queryKey: ["/api/carriers", carrierId, "credit-alerts"],
    enabled: !!carrierId,
  });

  const [formData, setFormData] = useState({
    customerAccountNumber: "",
    supplierAccountNumber: "",
    supplierAccountSameAsCustomer: true,
    taxCode: "",
    billTo: "",
    shipTo: "",
    billingName: "",
    telephone: "",
    fax: "",
    website: "",
    billingEmail: "",
    companyAddress: "",
    companyAddress2: "",
    companyPostcode: "",
    companyCountry: "",
    billingAddress: "",
    billingAddress2: "",
    billingPostcode: "",
    billingCountry: "",
    billingAddressSameAsCompany: true,
  });

  useEffect(() => {
    if (carrier) {
      setFormData({
        customerAccountNumber: carrier.customerAccountNumber || "",
        supplierAccountNumber: carrier.supplierAccountNumber || "",
        supplierAccountSameAsCustomer: carrier.supplierAccountSameAsCustomer ?? true,
        taxCode: carrier.taxCode || "",
        billTo: carrier.billTo || "",
        shipTo: carrier.shipTo || "",
        billingName: carrier.billingName || "",
        telephone: carrier.telephone || "",
        fax: carrier.fax || "",
        website: carrier.website || "",
        billingEmail: carrier.billingEmail || "",
        companyAddress: carrier.companyAddress || "",
        companyAddress2: carrier.companyAddress2 || "",
        companyPostcode: carrier.companyPostcode || "",
        companyCountry: carrier.companyCountry || "",
        billingAddress: carrier.billingAddress || "",
        billingAddress2: carrier.billingAddress2 || "",
        billingPostcode: carrier.billingPostcode || "",
        billingCountry: carrier.billingCountry || "",
        billingAddressSameAsCompany: carrier.billingAddressSameAsCompany ?? true,
      });
    }
  }, [carrier]);

  const [interconnectForm, setInterconnectForm] = useState({
    name: "",
    direction: "both",
    currencyCode: "USD",
    protocol: "SIP",
    capacityMode: "unrestricted",
    capacityLimit: "",
    isActive: true,
    techPrefix: "",
    ipAddress: "",
  });

  const [contactForm, setContactForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    name: "",
    jobTitle: "",
    telephone: "",
    mobile: "",
    fax: "",
    email: "",
    note: "",
    portalAccess: false,
    portalUsername: "",
    portalLocked: false,
  });

  const [alertForm, setAlertForm] = useState({
    alertType: "Low Balance Alert",
    currencyCode: "USD",
    threshold: "-8000",
    direction: "customer",
    maxAlerts: 4,
    perMinutes: 1440,
  });

  const updateCarrierMutation = useMutation({
    mutationFn: async (data: Partial<typeof formData>) => {
      const res = await apiRequest("PUT", `/api/carriers/${carrierId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId] });
      toast({ title: "Carrier updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update carrier", variant: "destructive" });
    },
  });

  const createInterconnectMutation = useMutation({
    mutationFn: async (data: typeof interconnectForm) => {
      const res = await apiRequest("POST", `/api/carriers/${carrierId}/interconnects`, {
        ...data,
        capacityLimit: data.capacityMode === "unrestricted" ? null : parseInt(data.capacityLimit) || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId, "interconnects"] });
      toast({ title: "Interconnect created successfully" });
      setShowInterconnectDialog(false);
      resetInterconnectForm();
    },
    onError: () => {
      toast({ title: "Failed to create interconnect", variant: "destructive" });
    },
  });

  const deleteInterconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/interconnects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId, "interconnects"] });
      toast({ title: "Interconnect deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete interconnect", variant: "destructive" });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: typeof contactForm) => {
      const res = await apiRequest("POST", `/api/carriers/${carrierId}/contacts`, {
        ...data,
        name: `${data.firstName} ${data.lastName}`.trim() || data.name,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId, "contacts"] });
      toast({ title: "Contact created successfully" });
      setShowContactDialog(false);
      resetContactForm();
    },
    onError: () => {
      toast({ title: "Failed to create contact", variant: "destructive" });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId, "contacts"] });
      toast({ title: "Contact deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete contact", variant: "destructive" });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: typeof alertForm) => {
      const res = await apiRequest("POST", `/api/carriers/${carrierId}/credit-alerts`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId, "credit-alerts"] });
      toast({ title: "Credit alert created successfully" });
      setShowAlertDialog(false);
      resetAlertForm();
    },
    onError: () => {
      toast({ title: "Failed to create credit alert", variant: "destructive" });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/credit-alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId, "credit-alerts"] });
      toast({ title: "Credit alert deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete credit alert", variant: "destructive" });
    },
  });

  const resetInterconnectForm = () => {
    setInterconnectForm({
      name: "",
      direction: "both",
      currencyCode: "USD",
      protocol: "SIP",
      capacityMode: "unrestricted",
      capacityLimit: "",
      isActive: true,
      techPrefix: "",
      ipAddress: "",
    });
    setEditingInterconnect(null);
  };

  const resetContactForm = () => {
    setContactForm({
      title: "",
      firstName: "",
      lastName: "",
      name: "",
      jobTitle: "",
      telephone: "",
      mobile: "",
      fax: "",
      email: "",
      note: "",
      portalAccess: false,
      portalUsername: "",
      portalLocked: false,
    });
    setEditingContact(null);
  };

  const resetAlertForm = () => {
    setAlertForm({
      alertType: "Low Balance Alert",
      currencyCode: "USD",
      threshold: "-8000",
      direction: "customer",
      maxAlerts: 4,
      perMinutes: 1440,
    });
    setEditingAlert(null);
  };

  const currency = currencies?.find(c => c.id === carrier?.primaryCurrencyId);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!carrier) {
    return <div className="p-8 text-center text-muted-foreground">Carrier not found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/carriers")} data-testid="button-back">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-sm text-muted-foreground">Carrier Management</div>
            <h1 className="text-lg font-semibold" data-testid="text-carrier-name">{carrier.name}</h1>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="button-actions">
              Actions <MoreVertical className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {activeTab === "interconnects" && (
              <DropdownMenuItem onClick={() => setShowInterconnectDialog(true)} data-testid="menu-add-interconnect">
                <Plus className="h-4 w-4 mr-2" />
                Add Interconnect
              </DropdownMenuItem>
            )}
            {activeTab === "contacts" && (
              <DropdownMenuItem onClick={() => setShowContactDialog(true)} data-testid="menu-add-contact">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </DropdownMenuItem>
            )}
            {activeTab === "alerts" && (
              <DropdownMenuItem onClick={() => setShowAlertDialog(true)} data-testid="menu-add-alert">
                <Plus className="h-4 w-4 mr-2" />
                Add Alert
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="details" data-testid="tab-details">Carrier Details</TabsTrigger>
            <TabsTrigger value="interconnects" data-testid="tab-interconnects">Interconnects</TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">Contact Details</TabsTrigger>
            <TabsTrigger value="accounting" data-testid="tab-accounting">Accounting Details</TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-alerts">Credit Alerts</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="details" className="mt-0">
            <CarrierDetailsTab carrier={carrier} currency={currency} />
          </TabsContent>

          <TabsContent value="interconnects" className="mt-0">
            <InterconnectsTab
              interconnects={interconnects || []}
              onDelete={(id) => deleteInterconnectMutation.mutate(id)}
              onAdd={() => setShowInterconnectDialog(true)}
            />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <ContactDetailsTab
              carrier={carrier}
              contacts={contacts || []}
              formData={formData}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onSave={() => updateCarrierMutation.mutate(formData)}
              onCancel={() => setIsEditing(false)}
              onFormChange={setFormData}
              onDeleteContact={(id) => deleteContactMutation.mutate(id)}
              onAddContact={() => setShowContactDialog(true)}
            />
          </TabsContent>

          <TabsContent value="accounting" className="mt-0">
            <AccountingDetailsTab
              formData={formData}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onSave={() => updateCarrierMutation.mutate(formData)}
              onCancel={() => setIsEditing(false)}
              onFormChange={setFormData}
              isPending={updateCarrierMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="alerts" className="mt-0">
            <CreditAlertsTab
              alerts={creditAlerts || []}
              onDelete={(id) => deleteAlertMutation.mutate(id)}
              onAdd={() => setShowAlertDialog(true)}
            />
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={showInterconnectDialog} onOpenChange={setShowInterconnectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Interconnect</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Interconnect Name</Label>
              <Input
                value={interconnectForm.name}
                onChange={(e) => setInterconnectForm({ ...interconnectForm, name: e.target.value })}
                placeholder="e.g., Primary SIP"
                data-testid="input-interconnect-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={interconnectForm.direction}
                  onValueChange={(v) => setInterconnectForm({ ...interconnectForm, direction: v })}
                >
                  <SelectTrigger data-testid="select-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer (C)</SelectItem>
                    <SelectItem value="supplier">Supplier (S)</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Select
                  value={interconnectForm.protocol}
                  onValueChange={(v) => setInterconnectForm({ ...interconnectForm, protocol: v })}
                >
                  <SelectTrigger data-testid="select-protocol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIP">SIP</SelectItem>
                    <SelectItem value="TDM">TDM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tech Prefix</Label>
                <Input
                  value={interconnectForm.techPrefix}
                  onChange={(e) => setInterconnectForm({ ...interconnectForm, techPrefix: e.target.value })}
                  placeholder="e.g., 55#"
                  data-testid="input-tech-prefix"
                />
              </div>
              <div className="space-y-2">
                <Label>IP Address</Label>
                <Input
                  value={interconnectForm.ipAddress}
                  onChange={(e) => setInterconnectForm({ ...interconnectForm, ipAddress: e.target.value })}
                  placeholder="e.g., 192.168.1.1"
                  data-testid="input-ip-address"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="interconnect-active"
                checked={interconnectForm.isActive}
                onCheckedChange={(c) => setInterconnectForm({ ...interconnectForm, isActive: c === true })}
              />
              <Label htmlFor="interconnect-active">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterconnectDialog(false)}>Cancel</Button>
            <Button
              onClick={() => createInterconnectMutation.mutate(interconnectForm)}
              disabled={!interconnectForm.name || createInterconnectMutation.isPending}
              data-testid="button-save-interconnect"
            >
              {createInterconnectMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-auto">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={contactForm.title}
                onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                placeholder="Mr/Mrs/Ms"
                data-testid="input-contact-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  data-testid="input-contact-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                  data-testid="input-contact-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={contactForm.jobTitle}
                onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                data-testid="input-contact-job-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telephone</Label>
                <Input
                  value={contactForm.telephone}
                  onChange={(e) => setContactForm({ ...contactForm, telephone: e.target.value })}
                  data-testid="input-contact-telephone"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input
                  value={contactForm.mobile}
                  onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                  data-testid="input-contact-mobile"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fax</Label>
                <Input
                  value={contactForm.fax}
                  onChange={(e) => setContactForm({ ...contactForm, fax: e.target.value })}
                  data-testid="input-contact-fax"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  data-testid="input-contact-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Input
                value={contactForm.note}
                onChange={(e) => setContactForm({ ...contactForm, note: e.target.value })}
                data-testid="input-contact-note"
              />
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Partner Portal</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={contactForm.portalUsername}
                    onChange={(e) => setContactForm({ ...contactForm, portalUsername: e.target.value })}
                    data-testid="input-portal-username"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Access</Label>
                    <Select
                      value={contactForm.portalAccess ? "yes" : "no"}
                      onValueChange={(v) => setContactForm({ ...contactForm, portalAccess: v === "yes" })}
                    >
                      <SelectTrigger className="w-20" data-testid="select-portal-access">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="portal-locked"
                      checked={contactForm.portalLocked}
                      onCheckedChange={(c) => setContactForm({ ...contactForm, portalLocked: c === true })}
                    />
                    <Label htmlFor="portal-locked">Locked</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>Cancel</Button>
            <Button
              onClick={() => createContactMutation.mutate(contactForm)}
              disabled={(!contactForm.firstName && !contactForm.lastName) || createContactMutation.isPending}
              data-testid="button-save-contact"
            >
              {createContactMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Credit Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Alert Type</Label>
              <Select
                value={alertForm.alertType}
                onValueChange={(v) => setAlertForm({ ...alertForm, alertType: v })}
              >
                <SelectTrigger data-testid="select-alert-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low Balance Alert">Low Balance Alert</SelectItem>
                  <SelectItem value="Credit Limit Alert">Credit Limit Alert</SelectItem>
                  <SelectItem value="Spend Limit Alert">Spend Limit Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={alertForm.direction}
                  onValueChange={(v) => setAlertForm({ ...alertForm, direction: v })}
                >
                  <SelectTrigger data-testid="select-alert-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={alertForm.currencyCode}
                  onValueChange={(v) => setAlertForm({ ...alertForm, currencyCode: v })}
                >
                  <SelectTrigger data-testid="select-alert-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Threshold</Label>
              <Input
                type="number"
                value={alertForm.threshold}
                onChange={(e) => setAlertForm({ ...alertForm, threshold: e.target.value })}
                placeholder="-8000"
                data-testid="input-alert-threshold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Alerts</Label>
                <Input
                  type="number"
                  value={alertForm.maxAlerts}
                  onChange={(e) => setAlertForm({ ...alertForm, maxAlerts: parseInt(e.target.value) || 4 })}
                  data-testid="input-max-alerts"
                />
              </div>
              <div className="space-y-2">
                <Label>Per (Minutes)</Label>
                <Input
                  type="number"
                  value={alertForm.perMinutes}
                  onChange={(e) => setAlertForm({ ...alertForm, perMinutes: parseInt(e.target.value) || 1440 })}
                  data-testid="input-per-minutes"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Cancel</Button>
            <Button
              onClick={() => createAlertMutation.mutate(alertForm)}
              disabled={createAlertMutation.isPending}
              data-testid="button-save-alert"
            >
              {createAlertMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CarrierDetailsTab({ carrier, currency }: { carrier: Carrier; currency?: Currency }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carrier Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carrier Name</span>
              <span className="font-medium">{carrier.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline">{carrier.partnerType}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Zone</span>
              <span>{carrier.timezone || "(UTC)"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Manager</span>
              <span>{carrier.accountManager || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer Billing</span>
              <span>{carrier.customerBillingMode || "Automatic"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Currency</span>
              <span className="font-medium">{currency?.code || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency 2</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency 3</span>
              <span>-</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Routing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacity</span>
              <span>{carrier.capacityMode === "unrestricted" ? "Unrestricted" : carrier.capacityLimit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Circular Routing</span>
              <span>{carrier.circularRouting ? "Enabled" : "Disabled"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credit Control</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>$/€</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") && (
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>{currency?.code || "USD"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={parseFloat(carrier.customerBalance || "0") < 0 ? "destructive" : "default"}>
                        {parseFloat(carrier.customerBalance || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(parseFloat(carrier.customerCreditLimit || "0") - Math.abs(parseFloat(carrier.customerBalance || "0"))).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {carrier.customerCreditLimitUnlimited ? "∞" : parseFloat(carrier.customerCreditLimit || "0").toFixed(0)}
                    </TableCell>
                  </TableRow>
                )}
                {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") && (
                  <TableRow>
                    <TableCell>Supplier</TableCell>
                    <TableCell>{currency?.code || "USD"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default">
                        {parseFloat(carrier.supplierBalance || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">
                      {carrier.supplierCreditLimitUnlimited ? "∞" : parseFloat(carrier.supplierCreditLimit || "0").toFixed(0)}
                    </TableCell>
                  </TableRow>
                )}
                {carrier.partnerType === "bilateral" && (
                  <TableRow>
                    <TableCell>Bilateral</TableCell>
                    <TableCell>{currency?.code || "USD"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={parseFloat(carrier.bilateralBalance || "0") < 0 ? "destructive" : "default"}>
                        {parseFloat(carrier.bilateralBalance || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">24 Hour Spend Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>$/€</TableHead>
                  <TableHead className="text-right">24 Hr Spend</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") && (
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>{currency?.code || "USD"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default">
                        {parseFloat(carrier.customer24HrSpend || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                )}
                {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") && (
                  <TableRow>
                    <TableCell>Supplier</TableCell>
                    <TableCell>{currency?.code || "USD"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default">
                        {parseFloat(carrier.supplier24HrSpend || "0").toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {(carrier.partnerType === "customer" || carrier.partnerType === "bilateral") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Customer Credit Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credit Type</span>
                <span className="capitalize">{carrier.customerCreditType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bilateral Limit Breach</span>
                <span>{carrier.customerBilateralLimitBreach || "Alert Only"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">24 Hr Spend Limit Breach</span>
                <span>{carrier.customer24HrSpendLimitBreach || "Alert Only"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">24 Hr Spend Mode</span>
                <span>{carrier.customer24HrSpendMode || "Rolling 24 Hours"}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {(carrier.partnerType === "supplier" || carrier.partnerType === "bilateral") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Supplier Credit Settings</CardTitle>
              <Button variant="outline" size="sm">Edit</Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credit Type</span>
                <span className="capitalize">{carrier.supplierCreditType}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InterconnectsTab({
  interconnects,
  onDelete,
  onAdd,
}: {
  interconnects: CarrierInterconnect[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Interconnects will be matched in the order presented here.</p>
        <Button onClick={onAdd} data-testid="button-add-interconnect">
          <Plus className="h-4 w-4 mr-2" />
          Add Interconnect
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {interconnects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Interconnect</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>$/€</TableHead>
                  <TableHead>Protocol</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Tech-Prefix</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Supplier Buy Rates</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interconnects.map((ic) => (
                  <TableRow key={ic.id} data-testid={`row-interconnect-${ic.id}`}>
                    <TableCell className="w-8">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </TableCell>
                    <TableCell className="font-medium text-primary cursor-pointer hover:underline">{ic.name}</TableCell>
                    <TableCell>
                      <Badge variant={ic.direction === "customer" ? "default" : ic.direction === "supplier" ? "secondary" : "outline"}>
                        {ic.direction === "customer" ? "C" : ic.direction === "supplier" ? "S" : "B"}
                      </Badge>
                    </TableCell>
                    <TableCell>{ic.currencyCode || "USD"}</TableCell>
                    <TableCell>{ic.protocol || "SIP"}</TableCell>
                    <TableCell>{ic.capacityMode === "unrestricted" ? "Unrestricted" : ic.capacityLimit}</TableCell>
                    <TableCell>
                      <Badge variant={ic.isActive ? "default" : "destructive"}>
                        {ic.isActive ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{ic.techPrefix || "-"}</TableCell>
                    <TableCell>{ic.ipAddress || "-"}</TableCell>
                    <TableCell>{ic.supplierBuyRates || "-"}</TableCell>
                    <TableCell>{ic.servicesCount || 0}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => onDelete(ic.id)} data-testid={`button-delete-interconnect-${ic.id}`}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No interconnects configured</p>
              <Button className="mt-4" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Interconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactDetailsTab({
  carrier,
  contacts,
  formData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  onDeleteContact,
  onAddContact,
}: {
  carrier: Carrier;
  contacts: CarrierContact[];
  formData: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (data: any) => void;
  onDeleteContact: (id: string) => void;
  onAddContact: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Contact Details</CardTitle>
            {!isEditing && <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Billing Name</Label>
              {isEditing ? (
                <Input
                  value={formData.billingName}
                  onChange={(e) => onFormChange({ ...formData, billingName: e.target.value })}
                  data-testid="input-billing-name"
                />
              ) : (
                <p>{formData.billingName || carrier.billingName || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Telephone</Label>
              {isEditing ? (
                <Input
                  value={formData.telephone}
                  onChange={(e) => onFormChange({ ...formData, telephone: e.target.value })}
                  data-testid="input-telephone"
                />
              ) : (
                <p>{formData.telephone || carrier.telephone || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Fax</Label>
              {isEditing ? (
                <Input
                  value={formData.fax}
                  onChange={(e) => onFormChange({ ...formData, fax: e.target.value })}
                  data-testid="input-fax"
                />
              ) : (
                <p>{formData.fax || carrier.fax || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Email</Label>
              {isEditing ? (
                <Input
                  value={formData.billingEmail}
                  onChange={(e) => onFormChange({ ...formData, billingEmail: e.target.value })}
                  data-testid="input-email"
                />
              ) : (
                <p className="text-primary">{formData.billingEmail || carrier.billingEmail || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Website</Label>
              {isEditing ? (
                <Input
                  value={formData.website}
                  onChange={(e) => onFormChange({ ...formData, website: e.target.value })}
                  data-testid="input-website"
                />
              ) : (
                <p>{formData.website || carrier.website || "-"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Address</Label>
              {isEditing ? (
                <>
                  <Input
                    value={formData.companyAddress}
                    onChange={(e) => onFormChange({ ...formData, companyAddress: e.target.value })}
                    placeholder="Address Line 1"
                    data-testid="input-company-address"
                  />
                  <Input
                    value={formData.companyAddress2}
                    onChange={(e) => onFormChange({ ...formData, companyAddress2: e.target.value })}
                    placeholder="Address Line 2"
                    data-testid="input-company-address2"
                  />
                </>
              ) : (
                <>
                  <p>{formData.companyAddress || "-"}</p>
                  {formData.companyAddress2 && <p>{formData.companyAddress2}</p>}
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Postcode</Label>
              {isEditing ? (
                <Input
                  value={formData.companyPostcode}
                  onChange={(e) => onFormChange({ ...formData, companyPostcode: e.target.value })}
                  data-testid="input-company-postcode"
                />
              ) : (
                <p>{formData.companyPostcode || "-"}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Country</Label>
              {isEditing ? (
                <Input
                  value={formData.companyCountry}
                  onChange={(e) => onFormChange({ ...formData, companyCountry: e.target.value })}
                  data-testid="input-company-country"
                />
              ) : (
                <p>{formData.companyCountry || "-"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Billing Address</CardTitle>
            {isEditing && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="same-as-company"
                  checked={formData.billingAddressSameAsCompany}
                  onCheckedChange={(c) => onFormChange({ ...formData, billingAddressSameAsCompany: c === true })}
                />
                <Label htmlFor="same-as-company" className="text-xs">Same as Company Address</Label>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {formData.billingAddressSameAsCompany ? (
              <p className="text-muted-foreground">Same as Company Address</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Address</Label>
                  {isEditing ? (
                    <>
                      <Input
                        value={formData.billingAddress}
                        onChange={(e) => onFormChange({ ...formData, billingAddress: e.target.value })}
                        placeholder="Address Line 1"
                        data-testid="input-billing-address"
                      />
                      <Input
                        value={formData.billingAddress2}
                        onChange={(e) => onFormChange({ ...formData, billingAddress2: e.target.value })}
                        placeholder="Address Line 2"
                        data-testid="input-billing-address2"
                      />
                    </>
                  ) : (
                    <>
                      <p>{formData.billingAddress || "-"}</p>
                      {formData.billingAddress2 && <p>{formData.billingAddress2}</p>}
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Postcode</Label>
                  {isEditing ? (
                    <Input
                      value={formData.billingPostcode}
                      onChange={(e) => onFormChange({ ...formData, billingPostcode: e.target.value })}
                      data-testid="input-billing-postcode"
                    />
                  ) : (
                    <p>{formData.billingPostcode || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Country</Label>
                  {isEditing ? (
                    <Input
                      value={formData.billingCountry}
                      onChange={(e) => onFormChange({ ...formData, billingCountry: e.target.value })}
                      data-testid="input-billing-country"
                    />
                  ) : (
                    <p>{formData.billingCountry || "-"}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
          {isEditing && (
            <div className="px-6 pb-4 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
              <Button size="sm" onClick={onSave}>Save</Button>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Contacts</CardTitle>
          <Button onClick={onAddContact} data-testid="button-add-contact">Add Contact</Button>
        </CardHeader>
        <CardContent className="p-0">
          {contacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Telephone</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Fax</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Portal Access</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                    <TableCell className="font-medium text-primary">{contact.name}</TableCell>
                    <TableCell>{contact.jobTitle || "-"}</TableCell>
                    <TableCell>{contact.telephone || "-"}</TableCell>
                    <TableCell>{contact.mobile || "-"}</TableCell>
                    <TableCell>{contact.fax || "-"}</TableCell>
                    <TableCell className="text-primary">{contact.email || "-"}</TableCell>
                    <TableCell>{contact.note || "-"}</TableCell>
                    <TableCell>{contact.portalAccess ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => onDeleteContact(contact.id)} data-testid={`button-delete-contact-${contact.id}`}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No contacts configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountingDetailsTab({
  formData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  isPending,
}: {
  formData: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (data: any) => void;
  isPending: boolean;
}) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-base">Accounting Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Customer Account Number</Label>
          <Input
            value={formData.customerAccountNumber}
            onChange={(e) => onFormChange({ ...formData, customerAccountNumber: e.target.value })}
            disabled={!isEditing}
            data-testid="input-customer-account-number"
          />
        </div>
        <div className="space-y-2">
          <Label>Supplier Account Number</Label>
          <Input
            value={formData.supplierAccountSameAsCustomer ? formData.customerAccountNumber : formData.supplierAccountNumber}
            onChange={(e) => onFormChange({ ...formData, supplierAccountNumber: e.target.value })}
            disabled={!isEditing || formData.supplierAccountSameAsCustomer}
            className={formData.supplierAccountSameAsCustomer ? "bg-muted" : ""}
            data-testid="input-supplier-account-number"
          />
          <div className="flex items-center gap-2 mt-1">
            <Checkbox
              id="same-as-customer"
              checked={formData.supplierAccountSameAsCustomer}
              onCheckedChange={(c) => onFormChange({ ...formData, supplierAccountSameAsCustomer: c === true })}
              disabled={!isEditing}
            />
            <Label htmlFor="same-as-customer" className="text-sm">Same as Customer</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tax Code</Label>
          <Input
            value={formData.taxCode}
            onChange={(e) => onFormChange({ ...formData, taxCode: e.target.value })}
            disabled={!isEditing}
            data-testid="input-tax-code"
          />
        </div>
        <div className="space-y-2">
          <Label>Bill To</Label>
          <Input
            value={formData.billTo}
            onChange={(e) => onFormChange({ ...formData, billTo: e.target.value })}
            disabled={!isEditing}
            data-testid="input-bill-to"
          />
        </div>
        <div className="space-y-2">
          <Label>Ship To</Label>
          <Input
            value={formData.shipTo}
            onChange={(e) => onFormChange({ ...formData, shipTo: e.target.value })}
            disabled={!isEditing}
            data-testid="input-ship-to"
          />
        </div>

        <div className="flex gap-2 pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
              <Button onClick={onSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={onEdit}>Edit</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CreditAlertsTab({
  alerts,
  onDelete,
  onAdd,
}: {
  alerts: CarrierCreditAlert[];
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Credit Alerts</CardTitle>
          <Button onClick={onAdd} data-testid="button-add-alert">Add Alert</Button>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>$/€</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} data-testid={`row-alert-${alert.id}`}>
                    <TableCell className="font-medium text-primary cursor-pointer hover:underline">
                      {alert.direction === "customer" ? "Customer " : "Supplier "}{alert.alertType}
                    </TableCell>
                    <TableCell>{alert.currencyCode || "USD"}</TableCell>
                    <TableCell>{parseFloat(alert.threshold).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => onDelete(alert.id)} data-testid={`button-delete-alert-${alert.id}`}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No credit alerts configured</p>
              <Button className="mt-4" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Alert
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
