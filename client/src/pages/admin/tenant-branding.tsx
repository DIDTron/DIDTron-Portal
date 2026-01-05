import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Building2, Pencil, Trash2, Globe, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import type { TenantBranding, Customer } from "@shared/schema";

type BrandingFormData = {
  customerId: string;
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  emailFromName: string;
  emailFromAddress: string;
  footerText: string;
  termsUrl: string;
  privacyUrl: string;
};

const defaultFormData: BrandingFormData = {
  customerId: "",
  companyName: "",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#2563EB",
  secondaryColor: "#64748B",
  customDomain: "",
  emailFromName: "",
  emailFromAddress: "",
  footerText: "",
  termsUrl: "",
  privacyUrl: "",
};

export default function TenantBrandingPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranding, setEditingBranding] = useState<TenantBranding | null>(null);
  const [formData, setFormData] = useState<BrandingFormData>(defaultFormData);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: brandings, isLoading } = useQuery<TenantBranding[]>({
    queryKey: ["/api/tenant-brandings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: BrandingFormData) => {
      const res = await apiRequest("POST", "/api/tenant-branding", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant-brandings"] });
      toast({ title: "Branding created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create branding", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BrandingFormData> }) => {
      const res = await apiRequest("PATCH", `/api/tenant-branding/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant-brandings"] });
      toast({ title: "Branding updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update branding", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingBranding(null);
    setIsOpen(false);
  };

  const handleEdit = (branding: TenantBranding) => {
    setEditingBranding(branding);
    setFormData({
      customerId: branding.customerId,
      companyName: branding.companyName || "",
      logoUrl: branding.logoUrl || "",
      faviconUrl: branding.faviconUrl || "",
      primaryColor: branding.primaryColor || "#2563EB",
      secondaryColor: branding.secondaryColor || "#64748B",
      customDomain: branding.customDomain || "",
      emailFromName: branding.emailFromName || "",
      emailFromAddress: branding.emailFromAddress || "",
      footerText: branding.footerText || "",
      termsUrl: branding.termsUrl || "",
      privacyUrl: branding.privacyUrl || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.customerId) {
      toast({ title: "Customer is required", variant: "destructive" });
      return;
    }
    if (editingBranding) {
      updateMutation.mutate({ id: editingBranding.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers?.find(c => c.id === customerId);
    return customer?.companyName || customer?.accountNumber || customerId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tenant brandings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tenant Branding</h1>
          <p className="text-muted-foreground">Manage white-label portal customization for customers</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-branding" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Branding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBranding ? "Edit Branding" : "Create Branding"}</DialogTitle>
              <DialogDescription>
                Configure white-label branding for a customer portal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {!editingBranding && (
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <select
                    id="customerId"
                    data-testid="select-customer"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Select a customer</option>
                    {customers?.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.companyName || customer.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    data-testid="input-company-name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme VoIP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input
                    id="customDomain"
                    data-testid="input-custom-domain"
                    value={formData.customDomain}
                    onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                    placeholder="portal.acme.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    data-testid="input-logo-url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    data-testid="input-favicon-url"
                    value={formData.faviconUrl}
                    onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      data-testid="input-primary-color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-9 p-1"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      data-testid="input-secondary-color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-10 h-9 p-1"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFromName">Email From Name</Label>
                  <Input
                    id="emailFromName"
                    data-testid="input-email-from-name"
                    value={formData.emailFromName}
                    onChange={(e) => setFormData({ ...formData, emailFromName: e.target.value })}
                    placeholder="Acme Support"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">Email From Address</Label>
                  <Input
                    id="emailFromAddress"
                    data-testid="input-email-from-address"
                    value={formData.emailFromAddress}
                    onChange={(e) => setFormData({ ...formData, emailFromAddress: e.target.value })}
                    placeholder="support@acme.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termsUrl">Terms URL</Label>
                  <Input
                    id="termsUrl"
                    data-testid="input-terms-url"
                    value={formData.termsUrl}
                    onChange={(e) => setFormData({ ...formData, termsUrl: e.target.value })}
                    placeholder="https://acme.com/terms"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacyUrl">Privacy URL</Label>
                  <Input
                    id="privacyUrl"
                    data-testid="input-privacy-url"
                    value={formData.privacyUrl}
                    onChange={(e) => setFormData({ ...formData, privacyUrl: e.target.value })}
                    placeholder="https://acme.com/privacy"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  data-testid="input-footer-text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  placeholder="© 2024 Acme VoIP. All rights reserved."
                  rows={2}
                />
              </div>

              {(formData.logoUrl || formData.primaryColor) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Preview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border p-4" style={{ borderColor: formData.primaryColor }}>
                      <div className="flex items-center gap-3 mb-3">
                        {formData.logoUrl ? (
                          <img
                            src={formData.logoUrl}
                            alt="Logo"
                            className="h-8 max-w-24 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: formData.primaryColor }}
                          >
                            {formData.companyName?.charAt(0) || "A"}
                          </div>
                        )}
                        <span className="font-semibold">{formData.companyName || "Company Name"}</span>
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="px-3 py-1 rounded text-white text-sm"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          Primary
                        </div>
                        <div
                          className="px-3 py-1 rounded text-white text-sm"
                          style={{ backgroundColor: formData.secondaryColor }}
                        >
                          Secondary
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-branding"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Branding"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!brandings?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-1">No tenant brandings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create white-label branding configurations for your customers
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Branding
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandings.map((branding) => (
                <TableRow key={branding.id} data-testid={`row-branding-${branding.id}`}>
                  <TableCell>
                    <span className="font-medium">{getCustomerName(branding.customerId)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {branding.logoUrl ? (
                        <img
                          src={branding.logoUrl}
                          alt="Logo"
                          className="h-6 w-6 object-contain rounded"
                        />
                      ) : (
                        <div
                          className="h-6 w-6 rounded flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: branding.primaryColor || "#2563EB" }}
                        >
                          {branding.companyName?.charAt(0) || "?"}
                        </div>
                      )}
                      <span>{branding.companyName || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {branding.customDomain ? (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`https://${branding.customDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          {branding.customDomain}
                        </a>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: branding.primaryColor || "#2563EB" }}
                        title="Primary"
                      />
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: branding.secondaryColor || "#64748B" }}
                        title="Secondary"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {branding.customDomainVerified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : branding.customDomain ? (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      data-testid={`button-edit-branding-${branding.id}`}
                      onClick={() => handleEdit(branding)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
