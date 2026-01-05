import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Globe, Mail, BarChart3, Shield, Palette } from "lucide-react";
import type { SiteSetting } from "@shared/schema";

const SETTING_CATEGORIES = [
  { id: "general", label: "General", icon: Globe },
  { id: "seo", label: "SEO", icon: BarChart3 },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

const DEFAULT_SETTINGS: Record<string, { key: string; label: string; description: string; inputType: string; category: string }[]> = {
  general: [
    { key: "site_name", label: "Site Name", description: "The name of your website", inputType: "text", category: "general" },
    { key: "site_tagline", label: "Tagline", description: "A short description of your site", inputType: "text", category: "general" },
    { key: "site_url", label: "Site URL", description: "Your website's primary URL", inputType: "text", category: "general" },
    { key: "timezone", label: "Timezone", description: "Default timezone for the platform", inputType: "text", category: "general" },
  ],
  seo: [
    { key: "meta_title", label: "Default Meta Title", description: "Default title for pages", inputType: "text", category: "seo" },
    { key: "meta_description", label: "Default Meta Description", description: "Default description for SEO", inputType: "textarea", category: "seo" },
    { key: "meta_keywords", label: "Default Keywords", description: "Comma-separated keywords", inputType: "text", category: "seo" },
    { key: "google_analytics_id", label: "Google Analytics ID", description: "GA tracking ID (e.g., G-XXXXXXX)", inputType: "text", category: "seo" },
    { key: "google_tag_manager_id", label: "Google Tag Manager ID", description: "GTM container ID", inputType: "text", category: "seo" },
  ],
  contact: [
    { key: "support_email", label: "Support Email", description: "Email for customer support", inputType: "email", category: "contact" },
    { key: "sales_email", label: "Sales Email", description: "Email for sales inquiries", inputType: "email", category: "contact" },
    { key: "billing_email", label: "Billing Email", description: "Email for billing questions", inputType: "email", category: "contact" },
    { key: "phone_number", label: "Phone Number", description: "Primary contact number", inputType: "text", category: "contact" },
    { key: "address", label: "Business Address", description: "Physical address", inputType: "textarea", category: "contact" },
  ],
  branding: [
    { key: "primary_color", label: "Primary Color", description: "Main brand color", inputType: "color", category: "branding" },
    { key: "secondary_color", label: "Secondary Color", description: "Secondary brand color", inputType: "color", category: "branding" },
    { key: "logo_url", label: "Logo URL", description: "URL to your logo image", inputType: "text", category: "branding" },
    { key: "favicon_url", label: "Favicon URL", description: "URL to your favicon", inputType: "text", category: "branding" },
  ],
  security: [
    { key: "session_timeout", label: "Session Timeout (minutes)", description: "Auto-logout after inactivity", inputType: "number", category: "security" },
    { key: "require_2fa", label: "Require 2FA for Admins", description: "Force two-factor authentication", inputType: "boolean", category: "security" },
    { key: "password_min_length", label: "Minimum Password Length", description: "Minimum characters required", inputType: "number", category: "security" },
    { key: "allowed_login_attempts", label: "Max Login Attempts", description: "Before account lockout", inputType: "number", category: "security" },
  ],
};

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("general");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());

  const { data: settings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/site-settings"],
  });

  const saveMutation = useMutation({
    mutationFn: async (settingData: { key: string; value: string; label: string; category: string }) => {
      const res = await apiRequest("PUT", "/api/site-settings", {
        key: settingData.key,
        value: settingData.value,
        label: settingData.label,
        category: settingData.category,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      setPendingChanges(prev => {
        const next = new Set(prev);
        next.delete(variables.key);
        return next;
      });
      toast({ title: "Setting saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    },
  });

  const getSettingValue = (key: string): string => {
    if (formValues[key] !== undefined) return formValues[key];
    const setting = settings?.find(s => s.key === key);
    return setting?.value || "";
  };

  const updateValue = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setPendingChanges(prev => new Set(prev).add(key));
  };

  const saveAllPending = async () => {
    const categorySettings = DEFAULT_SETTINGS[activeCategory] || [];
    for (const setting of categorySettings) {
      if (pendingChanges.has(setting.key)) {
        await saveMutation.mutateAsync({
          key: setting.key,
          value: formValues[setting.key] || "",
          label: setting.label,
          category: setting.category,
        });
      }
    }
  };

  const hasPendingChanges = Array.from(pendingChanges).some(key =>
    DEFAULT_SETTINGS[activeCategory]?.some(s => s.key === key)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const categorySettings = DEFAULT_SETTINGS[activeCategory] || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Site Settings</h1>
          <p className="text-muted-foreground">Configure global settings for the main website</p>
        </div>
        <Button
          onClick={saveAllPending}
          disabled={!hasPendingChanges || saveMutation.isPending}
          data-testid="button-save-settings"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {SETTING_CATEGORIES.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${
                        activeCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-category-${category.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Card>
            <CardHeader>
              <CardTitle className="text-base capitalize">{activeCategory} Settings</CardTitle>
              <CardDescription>
                Configure {activeCategory} settings for your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {categorySettings.map(setting => (
                <div key={setting.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    {pendingChanges.has(setting.key) && (
                      <span className="text-xs text-amber-500">Unsaved</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                  
                  {setting.inputType === "textarea" ? (
                    <Textarea
                      id={setting.key}
                      value={getSettingValue(setting.key)}
                      onChange={e => updateValue(setting.key, e.target.value)}
                      rows={3}
                      data-testid={`input-${setting.key}`}
                    />
                  ) : setting.inputType === "boolean" ? (
                    <Switch
                      checked={getSettingValue(setting.key) === "true"}
                      onCheckedChange={v => updateValue(setting.key, v ? "true" : "false")}
                      data-testid={`switch-${setting.key}`}
                    />
                  ) : setting.inputType === "color" ? (
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id={setting.key}
                        value={getSettingValue(setting.key) || "#2563eb"}
                        onChange={e => updateValue(setting.key, e.target.value)}
                        className="w-12 h-9 p-1"
                        data-testid={`input-${setting.key}`}
                      />
                      <Input
                        value={getSettingValue(setting.key)}
                        onChange={e => updateValue(setting.key, e.target.value)}
                        placeholder="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <Input
                      type={setting.inputType}
                      id={setting.key}
                      value={getSettingValue(setting.key)}
                      onChange={e => updateValue(setting.key, e.target.value)}
                      data-testid={`input-${setting.key}`}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
