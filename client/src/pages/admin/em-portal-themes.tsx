import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Palette, 
  Save, 
  Eye, 
  Upload, 
  Monitor, 
  Smartphone,
  RefreshCw,
  Check,
  Settings,
  Layout,
  Type,
  Image,
  Loader2
} from "lucide-react";

interface PortalTheme {
  id: string;
  name: string;
  portalType: "super_admin" | "customer" | "carrier" | "class4";
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  isActive: boolean;
}

interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  faviconUrl: string;
  fontFamily: string;
  borderRadius: string;
  showAIVoice: boolean;
  showDIDs: boolean;
  showClass4: boolean;
  showPBX: boolean;
}

const PORTAL_TYPES = [
  { id: "super_admin", label: "Super Admin", description: "Administrative portal for platform operators", color: "#2563EB" },
  { id: "customer", label: "Customer Portal", description: "Self-service portal for customers", color: "#10B981" },
  { id: "carrier", label: "Carrier Portal", description: "Management portal for carrier partners", color: "#14B8A6" },
  { id: "class4", label: "Class 4 Portal", description: "Softswitch operator portal", color: "#8B5CF6" },
];

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#10B981",
  accentColor: "#34D399",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  logoUrl: "",
  faviconUrl: "",
  fontFamily: "Inter",
  borderRadius: "md",
  showAIVoice: true,
  showDIDs: true,
  showClass4: false,
  showPBX: true,
};

export default function EMPortalThemesPage() {
  const { toast } = useToast();
  const [selectedPortal, setSelectedPortal] = useState("customer");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [hasChanges, setHasChanges] = useState(false);
  
  const { data: draftData, isLoading } = useQuery<{ data: ThemeSettings | null }>({
    queryKey: ["/api/em/content/portal_themes/theme", selectedPortal, "draft"],
  });
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME);

  useEffect(() => {
    if (draftData?.data) {
      const data = draftData.data;
      setThemeSettings({
        primaryColor: data.primaryColor || PORTAL_TYPES.find(p => p.id === selectedPortal)?.color || DEFAULT_THEME.primaryColor,
        accentColor: data.accentColor || DEFAULT_THEME.accentColor,
        backgroundColor: data.backgroundColor || DEFAULT_THEME.backgroundColor,
        textColor: data.textColor || DEFAULT_THEME.textColor,
        logoUrl: data.logoUrl || DEFAULT_THEME.logoUrl,
        faviconUrl: data.faviconUrl || DEFAULT_THEME.faviconUrl,
        fontFamily: data.fontFamily || DEFAULT_THEME.fontFamily,
        borderRadius: data.borderRadius || DEFAULT_THEME.borderRadius,
        showAIVoice: data.showAIVoice ?? DEFAULT_THEME.showAIVoice,
        showDIDs: data.showDIDs ?? DEFAULT_THEME.showDIDs,
        showClass4: data.showClass4 ?? DEFAULT_THEME.showClass4,
        showPBX: data.showPBX ?? DEFAULT_THEME.showPBX,
      });
      setHasChanges(false);
    } else if (!isLoading) {
      const portalDefault = PORTAL_TYPES.find(p => p.id === selectedPortal);
      setThemeSettings({
        ...DEFAULT_THEME,
        primaryColor: portalDefault?.color || DEFAULT_THEME.primaryColor,
      });
      setHasChanges(false);
    }
  }, [selectedPortal, draftData, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/em/content/portal_themes/theme/${selectedPortal}/save-draft`, {
        data: themeSettings,
        changeDescription: `Updated ${selectedPortal} portal theme`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/em/content/portal_themes/theme", selectedPortal, "draft"] });
      toast({ title: "Theme saved", description: "Changes saved as draft. Preview before publishing." });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/em/content/portal_themes/theme/${selectedPortal}/publish`, {
        note: `Published ${selectedPortal} portal theme`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/em/content/portal_themes/theme", selectedPortal, "draft"] });
      toast({ title: "Theme published", description: "Theme is now live for all users." });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({ title: "Publish failed", description: error.message, variant: "destructive" });
    },
  });

  const updateSetting = (key: string, value: any) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handlePublish = () => {
    publishMutation.mutate();
  };

  const currentPortal = PORTAL_TYPES.find(p => p.id === selectedPortal);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Portal Themes</h1>
          <p className="text-sm text-muted-foreground">Customize the appearance of each portal type</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && <Badge variant="secondary">Unsaved changes</Badge>}
          <Button variant="outline" onClick={handleSave} data-testid="button-save-draft">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} data-testid="button-publish">
            <Upload className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-80 border-r overflow-auto p-4">
          <div className="space-y-2 mb-6">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Select Portal</Label>
            {PORTAL_TYPES.map((portal) => (
              <button
                key={portal.id}
                onClick={() => {
                  setSelectedPortal(portal.id);
                  setThemeSettings(prev => ({ ...prev, primaryColor: portal.color }));
                }}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedPortal === portal.id
                    ? "bg-primary text-primary-foreground"
                    : "hover-elevate"
                }`}
                data-testid={`button-portal-${portal.id}`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: portal.color }}
                  />
                  <div>
                    <div className="font-medium text-sm">{portal.label}</div>
                    <div className={`text-xs ${selectedPortal === portal.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {portal.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Tabs defaultValue="brand">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="brand" data-testid="tab-brand" aria-label="Brand settings" title="Brand settings">
                <Palette className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="layout" data-testid="tab-layout" aria-label="Layout settings" title="Layout settings">
                <Layout className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="features" data-testid="tab-features" aria-label="Feature settings" title="Feature settings">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brand" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={themeSettings.primaryColor}
                    onChange={(e) => updateSetting("primaryColor", e.target.value)}
                    className="w-12 h-9 p-1"
                    data-testid="input-primary-color"
                  />
                  <Input
                    value={themeSettings.primaryColor}
                    onChange={(e) => updateSetting("primaryColor", e.target.value)}
                    className="flex-1 font-mono"
                    data-testid="input-primary-color-hex"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={themeSettings.accentColor}
                    onChange={(e) => updateSetting("accentColor", e.target.value)}
                    className="w-12 h-9 p-1"
                    data-testid="input-accent-color"
                  />
                  <Input
                    value={themeSettings.accentColor}
                    onChange={(e) => updateSetting("accentColor", e.target.value)}
                    className="flex-1 font-mono"
                    data-testid="input-accent-color-hex"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center hover-elevate cursor-pointer">
                  <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">PNG, SVG up to 2MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center hover-elevate cursor-pointer">
                  <Image className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload favicon</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input
                  id="fontFamily"
                  value={themeSettings.fontFamily}
                  onChange={(e) => updateSetting("fontFamily", e.target.value)}
                  data-testid="input-font-family"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <div className="flex gap-2">
                  {["sm", "md", "lg", "xl"].map((radius) => (
                    <Button
                      key={radius}
                      variant={themeSettings.borderRadius === radius ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting("borderRadius", radius)}
                      data-testid={`button-radius-${radius}`}
                    >
                      {radius.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Voice</Label>
                    <p className="text-xs text-muted-foreground">Show AI Voice features</p>
                  </div>
                  <Switch
                    checked={themeSettings.showAIVoice}
                    onCheckedChange={(checked) => updateSetting("showAIVoice", checked)}
                    data-testid="switch-ai-voice"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>DIDs</Label>
                    <p className="text-xs text-muted-foreground">Show DID management</p>
                  </div>
                  <Switch
                    checked={themeSettings.showDIDs}
                    onCheckedChange={(checked) => updateSetting("showDIDs", checked)}
                    data-testid="switch-dids"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Class 4</Label>
                    <p className="text-xs text-muted-foreground">Show Class 4 Softswitch</p>
                  </div>
                  <Switch
                    checked={themeSettings.showClass4}
                    onCheckedChange={(checked) => updateSetting("showClass4", checked)}
                    data-testid="switch-class4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cloud PBX</Label>
                    <p className="text-xs text-muted-foreground">Show PBX features</p>
                  </div>
                  <Switch
                    checked={themeSettings.showPBX}
                    onCheckedChange={(checked) => updateSetting("showPBX", checked)}
                    data-testid="switch-pbx"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 flex flex-col bg-muted/30">
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{currentPortal?.label} Preview</span>
              <Badge variant="secondary">Draft</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                size="icon"
                onClick={() => setPreviewMode("desktop")}
                data-testid="button-preview-desktop"
                aria-label="Desktop preview"
                title="Desktop preview"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                size="icon"
                onClick={() => setPreviewMode("mobile")}
                data-testid="button-preview-mobile"
                aria-label="Mobile preview"
                title="Mobile preview"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-refresh-preview" aria-label="Refresh preview" title="Refresh preview">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto" tabIndex={0} role="region" aria-label="Theme preview panel">
            <div 
              className={`mx-auto bg-background rounded-lg shadow-lg overflow-hidden transition-all ${
                previewMode === "mobile" ? "max-w-sm" : "max-w-4xl"
              }`}
              style={{ minHeight: "500px" }}
            >
              <div 
                className="h-12 flex items-center px-4 gap-3"
                style={{ backgroundColor: themeSettings.primaryColor }}
              >
                <div className="w-6 h-6 rounded bg-white/20" />
                <span className="text-white font-medium">{currentPortal?.label}</span>
              </div>
              <div className="flex">
                <div 
                  className="w-48 p-4 border-r"
                  style={{ backgroundColor: themeSettings.accentColor + "10" }}
                >
                  <div className="space-y-2">
                    {["Dashboard", "Voice", "DIDs", "Billing", "Settings"].map((item) => (
                      <div key={item} className="p-2 rounded-md text-sm hover-elevate cursor-pointer">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold" style={{ color: themeSettings.primaryColor }}>
                            {Math.floor(Math.random() * 1000)}
                          </div>
                          <div className="text-sm text-muted-foreground">Metric {i}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
