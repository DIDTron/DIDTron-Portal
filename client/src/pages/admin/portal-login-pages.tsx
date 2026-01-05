import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Monitor, Smartphone, Loader2 } from "lucide-react";
import type { PortalLoginPage } from "@shared/schema";

const PORTAL_TYPES = [
  { id: "super_admin", label: "Super Admin Portal", description: "Administrative login for platform operators" },
  { id: "customer", label: "Customer Portal", description: "Login for customers and resellers" },
  { id: "carrier", label: "Carrier Portal", description: "Login for carrier partners" },
  { id: "documentation", label: "Documentation Portal", description: "Login for documentation access" },
];

export default function PortalLoginPagesPage() {
  const { toast } = useToast();
  const [selectedPortal, setSelectedPortal] = useState("super_admin");
  const [formData, setFormData] = useState<Partial<PortalLoginPage>>({});
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const { data: pages, isLoading } = useQuery<PortalLoginPage[]>({
    queryKey: ["/api/portal-login-pages"],
  });

  const currentPage = pages?.find(p => p.portalType === selectedPortal);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PortalLoginPage>) => {
      if (currentPage) {
        const res = await apiRequest("PATCH", `/api/portal-login-pages/${currentPage.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/portal-login-pages", {
          portalType: selectedPortal,
          title: data.title || PORTAL_TYPES.find(p => p.id === selectedPortal)?.label || "Login",
          ...data,
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal-login-pages"] });
      toast({ title: "Login page saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const updateField = (field: keyof PortalLoginPage, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const effectiveData = { ...currentPage, ...formData };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Portal Login Pages</h1>
          <p className="text-muted-foreground">Customize the login experience for each portal type</p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-login-page">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portal Types</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {PORTAL_TYPES.map(portal => (
                  <button
                    key={portal.id}
                    onClick={() => {
                      setSelectedPortal(portal.id);
                      setFormData({});
                    }}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedPortal === portal.id
                        ? "bg-primary text-primary-foreground"
                        : "hover-elevate"
                    }`}
                    data-testid={`button-portal-${portal.id}`}
                  >
                    <div className="font-medium text-sm">{portal.label}</div>
                    <div className={`text-xs ${selectedPortal === portal.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {portal.description}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Login Page Settings</CardTitle>
              <CardDescription>Configure the appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content">
                <TabsList className="mb-4">
                  <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
                  <TabsTrigger value="appearance" data-testid="tab-appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="options" data-testid="tab-options">Options</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={effectiveData.title || ""}
                      onChange={e => updateField("title", e.target.value)}
                      placeholder="Sign in to your account"
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={effectiveData.subtitle || ""}
                      onChange={e => updateField("subtitle", e.target.value)}
                      placeholder="Enter your credentials to continue"
                      data-testid="input-subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Textarea
                      value={effectiveData.welcomeMessage || ""}
                      onChange={e => updateField("welcomeMessage", e.target.value)}
                      placeholder="Welcome back! Please sign in to access your dashboard."
                      rows={3}
                      data-testid="input-welcome-message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Text</Label>
                    <Input
                      value={effectiveData.footerText || ""}
                      onChange={e => updateField("footerText", e.target.value)}
                      placeholder="2025 DIDTron Communications. All rights reserved."
                      data-testid="input-footer-text"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={effectiveData.logoUrl || ""}
                      onChange={e => updateField("logoUrl", e.target.value)}
                      placeholder="https://example.com/logo.png"
                      data-testid="input-logo-url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Background Image URL</Label>
                    <Input
                      value={effectiveData.backgroundImageUrl || ""}
                      onChange={e => updateField("backgroundImageUrl", e.target.value)}
                      placeholder="https://example.com/background.jpg"
                      data-testid="input-background-image"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={effectiveData.backgroundColor || "#1e3a5f"}
                          onChange={e => updateField("backgroundColor", e.target.value)}
                          className="w-12 h-9 p-1"
                          data-testid="input-bg-color"
                        />
                        <Input
                          value={effectiveData.backgroundColor || ""}
                          onChange={e => updateField("backgroundColor", e.target.value)}
                          placeholder="#1e3a5f"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={effectiveData.primaryColor || "#2563eb"}
                          onChange={e => updateField("primaryColor", e.target.value)}
                          className="w-12 h-9 p-1"
                          data-testid="input-primary-color"
                        />
                        <Input
                          value={effectiveData.primaryColor || ""}
                          onChange={e => updateField("primaryColor", e.target.value)}
                          placeholder="#2563eb"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={effectiveData.textColor || "#ffffff"}
                          onChange={e => updateField("textColor", e.target.value)}
                          className="w-12 h-9 p-1"
                          data-testid="input-text-color"
                        />
                        <Input
                          value={effectiveData.textColor || ""}
                          onChange={e => updateField("textColor", e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Custom CSS</Label>
                    <Textarea
                      value={effectiveData.customCss || ""}
                      onChange={e => updateField("customCss", e.target.value)}
                      placeholder=".login-form { border-radius: 12px; }"
                      rows={4}
                      className="font-mono text-sm"
                      data-testid="input-custom-css"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="options" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Social Login</Label>
                      <p className="text-sm text-muted-foreground">Allow login with Google, GitHub, etc.</p>
                    </div>
                    <Switch
                      checked={effectiveData.showSocialLogin || false}
                      onCheckedChange={v => updateField("showSocialLogin", v)}
                      data-testid="switch-social-login"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Remember Me</Label>
                      <p className="text-sm text-muted-foreground">Display "Remember me" checkbox</p>
                    </div>
                    <Switch
                      checked={effectiveData.showRememberMe ?? true}
                      onCheckedChange={v => updateField("showRememberMe", v)}
                      data-testid="switch-remember-me"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Forgot Password</Label>
                      <p className="text-sm text-muted-foreground">Display password recovery link</p>
                    </div>
                    <Switch
                      checked={effectiveData.showForgotPassword ?? true}
                      onCheckedChange={v => updateField("showForgotPassword", v)}
                      data-testid="switch-forgot-password"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active</Label>
                      <p className="text-sm text-muted-foreground">Enable this login page</p>
                    </div>
                    <Switch
                      checked={effectiveData.isActive ?? true}
                      onCheckedChange={v => updateField("isActive", v)}
                      data-testid="switch-active"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <CardTitle className="text-base">Preview</CardTitle>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant={previewMode === "desktop" ? "default" : "ghost"}
                  onClick={() => setPreviewMode("desktop")}
                  data-testid="button-preview-desktop"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={previewMode === "mobile" ? "default" : "ghost"}
                  onClick={() => setPreviewMode("mobile")}
                  data-testid="button-preview-mobile"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`rounded-lg overflow-hidden border ${
                  previewMode === "mobile" ? "max-w-[320px] mx-auto" : ""
                }`}
                style={{
                  backgroundColor: effectiveData.backgroundColor || "#1e3a5f",
                  backgroundImage: effectiveData.backgroundImageUrl ? `url(${effectiveData.backgroundImageUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
                  {effectiveData.logoUrl && (
                    <img src={effectiveData.logoUrl} alt="Logo" className="h-12 mb-6" />
                  )}
                  <div
                    className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-lg p-6"
                    style={{ color: effectiveData.textColor || "#ffffff" }}
                  >
                    <h2 className="text-xl font-semibold text-center mb-2">
                      {effectiveData.title || "Sign In"}
                    </h2>
                    {effectiveData.subtitle && (
                      <p className="text-sm text-center opacity-80 mb-4">{effectiveData.subtitle}</p>
                    )}
                    <div className="space-y-3">
                      <div className="h-10 bg-white/20 rounded" />
                      <div className="h-10 bg-white/20 rounded" />
                      {effectiveData.showRememberMe && (
                        <div className="flex items-center gap-2 text-sm opacity-80">
                          <div className="w-4 h-4 border rounded" />
                          <span>Remember me</span>
                        </div>
                      )}
                      <div
                        className="h-10 rounded flex items-center justify-center text-sm font-medium"
                        style={{ backgroundColor: effectiveData.primaryColor || "#2563eb" }}
                      >
                        Sign In
                      </div>
                      {effectiveData.showForgotPassword && (
                        <p className="text-center text-sm opacity-80">Forgot password?</p>
                      )}
                    </div>
                  </div>
                  {effectiveData.footerText && (
                    <p
                      className="text-xs mt-6 opacity-60"
                      style={{ color: effectiveData.textColor || "#ffffff" }}
                    >
                      {effectiveData.footerText}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
