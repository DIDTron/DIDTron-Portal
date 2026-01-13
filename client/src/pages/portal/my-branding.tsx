import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Building, Palette, Globe, Mail, Eye, CheckCircle, AlertCircle } from "lucide-react";
import type { TenantBranding } from "@shared/schema";

export default function MyBrandingPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<TenantBranding>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: branding, isLoading } = useQuery<TenantBranding | null>({
    queryKey: ["/api/my/branding"],
    queryFn: async () => {
      const res = await fetch("/api/my/branding");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch branding");
      return res.json();
    },
    staleTime: STALE_TIME.DETAIL,
  });

  useEffect(() => {
    if (branding) {
      setFormData({
        companyName: branding.companyName || "",
        logoUrl: branding.logoUrl || "",
        faviconUrl: branding.faviconUrl || "",
        primaryColor: branding.primaryColor || "#2563eb",
        secondaryColor: branding.secondaryColor || "#1e40af",
        customDomain: branding.customDomain || "",
        emailFromName: branding.emailFromName || "",
        emailFromAddress: branding.emailFromAddress || "",
        footerText: branding.footerText || "",
        termsUrl: branding.termsUrl || "",
        privacyUrl: branding.privacyUrl || "",
      });
    }
  }, [branding]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<TenantBranding>) => {
      const res = await apiRequest("PUT", "/api/my/branding", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/branding"] });
      toast({ title: "Branding saved successfully" });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  const updateField = (field: keyof TenantBranding, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">My Branding</h1>
          <p className="text-muted-foreground">
            Customize how your portal appears to your customers
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          data-testid="button-save-branding"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company" data-testid="tab-company">
            <Building className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="domain" data-testid="tab-domain">
            <Globe className="h-4 w-4 mr-2" />
            Custom Domain
          </TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">
            <Mail className="h-4 w-4 mr-2" />
            Email Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Your company details that will appear on your branded portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ""}
                  onChange={e => updateField("companyName", e.target.value)}
                  placeholder="Your Company Name"
                  data-testid="input-company-name"
                />
                <p className="text-sm text-muted-foreground">
                  This appears in the header, emails, and portal title
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="termsUrl">Terms of Service URL</Label>
                  <Input
                    id="termsUrl"
                    value={formData.termsUrl || ""}
                    onChange={e => updateField("termsUrl", e.target.value)}
                    placeholder="https://yoursite.com/terms"
                    data-testid="input-terms-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                  <Input
                    id="privacyUrl"
                    value={formData.privacyUrl || ""}
                    onChange={e => updateField("privacyUrl", e.target.value)}
                    placeholder="https://yoursite.com/privacy"
                    data-testid="input-privacy-url"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  value={formData.footerText || ""}
                  onChange={e => updateField("footerText", e.target.value)}
                  placeholder="2025 Your Company. All rights reserved."
                  rows={2}
                  data-testid="input-footer-text"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Visual Branding</CardTitle>
              <CardDescription>
                Customize colors and logos to match your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl || ""}
                    onChange={e => updateField("logoUrl", e.target.value)}
                    placeholder="https://yoursite.com/logo.png"
                    data-testid="input-logo-url"
                  />
                  {formData.logoUrl && (
                    <div className="mt-2 p-4 border rounded-md bg-muted/50">
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="max-h-12 object-contain"
                        onError={e => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={formData.faviconUrl || ""}
                    onChange={e => updateField("faviconUrl", e.target.value)}
                    placeholder="https://yoursite.com/favicon.ico"
                    data-testid="input-favicon-url"
                  />
                  {formData.faviconUrl && (
                    <div className="mt-2 p-4 border rounded-md bg-muted/50">
                      <img
                        src={formData.faviconUrl}
                        alt="Favicon preview"
                        className="h-8 w-8 object-contain"
                        onError={e => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primaryColor || "#2563eb"}
                      onChange={e => updateField("primaryColor", e.target.value)}
                      className="w-12 h-9 p-1"
                      data-testid="input-primary-color-picker"
                    />
                    <Input
                      value={formData.primaryColor || ""}
                      onChange={e => updateField("primaryColor", e.target.value)}
                      placeholder="#2563eb"
                      data-testid="input-primary-color"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for buttons, links, and accents
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondaryColor || "#1e40af"}
                      onChange={e => updateField("secondaryColor", e.target.value)}
                      className="w-12 h-9 p-1"
                      data-testid="input-secondary-color-picker"
                    />
                    <Input
                      value={formData.secondaryColor || ""}
                      onChange={e => updateField("secondaryColor", e.target.value)}
                      placeholder="#1e40af"
                      data-testid="input-secondary-color"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for hover states and secondary elements
                  </p>
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Color Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-center">
                    <div
                      className="h-12 w-24 rounded-md flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: formData.primaryColor || "#2563eb" }}
                    >
                      Primary
                    </div>
                    <div
                      className="h-12 w-24 rounded-md flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: formData.secondaryColor || "#1e40af" }}
                    >
                      Secondary
                    </div>
                    <div className="flex-1 text-sm text-muted-foreground">
                      These colors will be applied to your customer portal
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domain</CardTitle>
              <CardDescription>
                Use your own domain for your customer portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  value={formData.customDomain || ""}
                  onChange={e => updateField("customDomain", e.target.value)}
                  placeholder="portal.yourcompany.com"
                  data-testid="input-custom-domain"
                />
                <p className="text-sm text-muted-foreground">
                  Enter your domain without http:// or https://
                </p>
              </div>

              {formData.customDomain && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {branding?.customDomainVerified ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-600">Domain Verified</p>
                            <p className="text-sm text-muted-foreground">
                              Your custom domain is active and serving your portal.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-600">DNS Setup Required</p>
                            <p className="text-sm text-muted-foreground mb-3">
                              Add the following DNS record to verify your domain:
                            </p>
                            <div className="bg-background p-3 rounded-md border font-mono text-sm">
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="col-span-2">CNAME</span>
                                <span className="text-muted-foreground">Name:</span>
                                <span className="col-span-2">{formData.customDomain?.split(".")[0] || "portal"}</span>
                                <span className="text-muted-foreground">Value:</span>
                                <span className="col-span-2">portals.didtron.com</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure how emails appear to your customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emailFromName">From Name</Label>
                  <Input
                    id="emailFromName"
                    value={formData.emailFromName || ""}
                    onChange={e => updateField("emailFromName", e.target.value)}
                    placeholder="Your Company Support"
                    data-testid="input-email-from-name"
                  />
                  <p className="text-sm text-muted-foreground">
                    Name that appears in the "From" field
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">From Email</Label>
                  <Input
                    id="emailFromAddress"
                    type="email"
                    value={formData.emailFromAddress || ""}
                    onChange={e => updateField("emailFromAddress", e.target.value)}
                    placeholder="support@yourcompany.com"
                    data-testid="input-email-from-address"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address that appears as sender
                  </p>
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-2">Email Preview</p>
                  <div className="bg-background p-3 rounded-md border">
                    <p className="text-sm">
                      <span className="text-muted-foreground">From: </span>
                      <span className="font-medium">
                        {formData.emailFromName || "Your Company"} &lt;{formData.emailFromAddress || "noreply@didtron.com"}&gt;
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
