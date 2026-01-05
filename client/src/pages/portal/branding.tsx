import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, ImageIcon, Save, Loader2 } from "lucide-react";
import type { TenantBranding, Customer } from "@shared/schema";

type BrandingFormData = {
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
};

const defaultFormData: BrandingFormData = {
  logoUrl: "",
  faviconUrl: "",
  companyName: "",
  primaryColor: "#2563EB",
  secondaryColor: "#64748B",
};

export default function BrandingPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BrandingFormData>(defaultFormData);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: profile } = useQuery<Customer>({
    queryKey: ["/api/my/profile"],
  });

  const { data: branding, isLoading } = useQuery<TenantBranding | null>({
    queryKey: ["/api/my/branding"],
    enabled: !!profile,
  });

  useEffect(() => {
    if (branding) {
      setFormData({
        logoUrl: branding.logoUrl || "",
        faviconUrl: branding.faviconUrl || "",
        companyName: branding.companyName || "",
        primaryColor: branding.primaryColor || "#2563EB",
        secondaryColor: branding.secondaryColor || "#64748B",
      });
      setHasChanges(false);
    }
  }, [branding]);

  const saveMutation = useMutation({
    mutationFn: async (data: BrandingFormData) => {
      if (branding) {
        const res = await apiRequest("PATCH", `/api/my/branding`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", `/api/my/branding`, data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/branding"] });
      toast({ title: "Branding saved successfully" });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save branding", description: error.message, variant: "destructive" });
    },
  });

  const handleChange = (field: keyof BrandingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Portal Branding</h1>
          <p className="text-muted-foreground">Customize your portal appearance with your brand</p>
        </div>
        <Button
          data-testid="button-save-branding"
          onClick={handleSubmit}
          disabled={!hasChanges || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Logo & Assets
            </CardTitle>
            <CardDescription>Upload your company logo and favicon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                data-testid="input-company-name"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Your Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                data-testid="input-logo-url"
                value={formData.logoUrl}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              {formData.logoUrl && (
                <div className="mt-2 p-4 border rounded-md bg-muted/30">
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                data-testid="input-favicon-url"
                value={formData.faviconUrl}
                onChange={(e) => handleChange("faviconUrl", e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
              {formData.faviconUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <img
                    src={formData.faviconUrl}
                    alt="Favicon preview"
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Brand Colors
            </CardTitle>
            <CardDescription>Set your brand colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-xs">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    data-testid="input-primary-color"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className="text-xs">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    data-testid="input-secondary-color"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm text-muted-foreground mb-3 block">Preview</Label>
              <div
                className="rounded-md p-4 border"
                style={{
                  background: `linear-gradient(135deg, ${formData.primaryColor}10 0%, ${formData.secondaryColor}10 100%)`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div
                      className="h-8 w-8 rounded flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      {(formData.companyName || "B").charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold">{formData.companyName || "Your Company"}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Primary
                  </span>
                  <span
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: formData.secondaryColor }}
                  >
                    Secondary
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
