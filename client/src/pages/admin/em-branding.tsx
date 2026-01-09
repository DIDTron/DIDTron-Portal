import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, RotateCcw, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBrandingStore } from "@/stores/branding-store";

interface BrandingSettings {
  baseColor: string;
  appTitle: string;
  applicationName: string;
  slogan: string;
  facebookPage: string;
  instagramPage: string;
  twitterPage: string;
  youtubeChannel: string;
  loginFooter: string;
  meetUrl: string;
  disableBranding: boolean;
  desktopLogo: string | null;
  desktopLogoDark: string | null;
  mobileLogo: string | null;
  mobileLogoDark: string | null;
}

const defaultSettings: BrandingSettings = {
  baseColor: "#2563EB",
  appTitle: "DIDTron",
  applicationName: "DIDTron Communications",
  slogan: "AI-Powered Wholesale VoIP Platform",
  facebookPage: "",
  instagramPage: "",
  twitterPage: "",
  youtubeChannel: "",
  loginFooter: "",
  meetUrl: "",
  disableBranding: false,
  desktopLogo: null,
  desktopLogoDark: null,
  mobileLogo: null,
  mobileLogoDark: null,
};

export default function EMBrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const { headerLogo, setHeaderLogo } = useBrandingStore();
  const headerLogoInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setHeaderLogo(result);
        toast({
          title: "Header logo uploaded",
          description: "The logo will appear in the header immediately.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeHeaderLogo = () => {
    setHeaderLogo(null);
    toast({
      title: "Header logo removed",
      description: "The default text logo will be shown.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Branding settings saved",
      description: "Your branding settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast({
      title: "Settings reset",
      description: "Branding settings have been reset to defaults.",
    });
  };

  const updateSetting = <K extends keyof BrandingSettings>(
    key: K,
    value: BrandingSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-branding-title">Branding</h1>
          <p className="text-muted-foreground">
            Customize your platform's branding, logos, and appearance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} data-testid="button-reset-branding">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} data-testid="button-save-branding">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-branding">
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="gui" data-testid="tab-gui">GUI</TabsTrigger>
          <TabsTrigger value="login-design" data-testid="tab-login-design">Login Design</TabsTrigger>
          <TabsTrigger value="addons" data-testid="tab-addons">Addons</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseColor">Base Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="baseColor"
                      value={settings.baseColor}
                      onChange={(e) => updateSetting("baseColor", e.target.value)}
                      className="flex-1"
                      data-testid="input-base-color"
                    />
                    <input
                      type="color"
                      value={settings.baseColor}
                      onChange={(e) => updateSetting("baseColor", e.target.value)}
                      className="h-9 w-9 rounded border cursor-pointer"
                      data-testid="input-color-picker"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appTitle">APP Title</Label>
                  <Input
                    id="appTitle"
                    value={settings.appTitle}
                    onChange={(e) => updateSetting("appTitle", e.target.value)}
                    data-testid="input-app-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationName">Application Name</Label>
                  <Input
                    id="applicationName"
                    value={settings.applicationName}
                    onChange={(e) => updateSetting("applicationName", e.target.value)}
                    data-testid="input-application-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    value={settings.slogan}
                    onChange={(e) => updateSetting("slogan", e.target.value)}
                    data-testid="input-slogan"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login & Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginFooter">Login Footer</Label>
                  <Textarea
                    id="loginFooter"
                    value={settings.loginFooter}
                    onChange={(e) => updateSetting("loginFooter", e.target.value)}
                    placeholder='<a target="_blank" href="https://yoursite.com">Your Company</a> is a registered trademark.'
                    rows={4}
                    data-testid="input-login-footer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetUrl">Meet URL</Label>
                  <Input
                    id="meetUrl"
                    value={settings.meetUrl}
                    onChange={(e) => updateSetting("meetUrl", e.target.value)}
                    placeholder="https://meet.example.com"
                    data-testid="input-meet-url"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="disableBranding">Disable Branding</Label>
                  <Switch
                    id="disableBranding"
                    checked={settings.disableBranding}
                    onCheckedChange={(checked) => updateSetting("disableBranding", checked)}
                    data-testid="switch-disable-branding"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Social Media Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebookPage">Facebook Page</Label>
                    <Input
                      id="facebookPage"
                      value={settings.facebookPage}
                      onChange={(e) => updateSetting("facebookPage", e.target.value)}
                      placeholder="YourCompany"
                      data-testid="input-facebook-page"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagramPage">Instagram Page</Label>
                    <Input
                      id="instagramPage"
                      value={settings.instagramPage}
                      onChange={(e) => updateSetting("instagramPage", e.target.value)}
                      placeholder="YourCompany"
                      data-testid="input-instagram-page"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterPage">Twitter Page</Label>
                    <Input
                      id="twitterPage"
                      value={settings.twitterPage}
                      onChange={(e) => updateSetting("twitterPage", e.target.value)}
                      placeholder="YourCompany"
                      data-testid="input-twitter-page"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtubeChannel">YouTube Channel</Label>
                    <Input
                      id="youtubeChannel"
                      value={settings.youtubeChannel}
                      onChange={(e) => updateSetting("youtubeChannel", e.target.value)}
                      placeholder="YourCompany"
                      data-testid="input-youtube-channel"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Header Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 flex flex-col items-center justify-center min-h-[120px] bg-zinc-900 relative">
                  {headerLogo ? (
                    <>
                      <img src={headerLogo} alt="Header Logo" className="h-8 object-contain" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={removeHeaderLogo}
                        data-testid="button-remove-header-logo"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl font-bold tracking-tight">
                        <span className="text-primary">DID</span>
                        <span className="text-white">Tron</span>
                      </span>
                      <p className="text-xs text-muted-foreground mt-2">Default text logo</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 200x32 pixels or similar aspect ratio (PNG with transparency)
                </p>
                <input
                  ref={headerLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeaderLogoUpload}
                  data-testid="input-header-logo-file"
                />
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => headerLogoInputRef.current?.click()}
                  data-testid="button-upload-header-logo"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Header Logo
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Logo Size Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg bg-muted/20">
                    <p className="font-medium text-sm mb-1">Header Logo</p>
                    <p className="text-xl font-bold text-primary">200 x 32 px</p>
                    <p className="text-xs text-muted-foreground mt-1">Shown in the global header (32px height)</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/20">
                    <p className="font-medium text-sm mb-1">Desktop Logo</p>
                    <p className="text-xl font-bold text-primary">200 x 60 px</p>
                    <p className="text-xs text-muted-foreground mt-1">Horizontal logo for sidebar and login</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/20">
                    <p className="font-medium text-sm mb-1">Mobile Logo</p>
                    <p className="text-xl font-bold text-primary">60 x 60 px</p>
                    <p className="text-xs text-muted-foreground mt-1">Square logo for mobile views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desktop Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center min-h-[160px] bg-muted/20">
                  {settings.desktopLogo ? (
                    <img src={settings.desktopLogo} alt="Desktop Logo" className="max-h-24 object-contain" />
                  ) : (
                    <p className="text-muted-foreground text-sm">No logo uploaded</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 200x60 pixels (PNG with transparency)
                </p>
                <Button variant="outline" className="w-full" data-testid="button-upload-desktop-logo">
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desktop Logo (Dark Mode)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center min-h-[160px] bg-zinc-800">
                  {settings.desktopLogoDark ? (
                    <img src={settings.desktopLogoDark} alt="Desktop Logo Dark" className="max-h-24 object-contain" />
                  ) : (
                    <p className="text-muted-foreground text-sm">No logo uploaded</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 200x60 pixels (PNG with transparency, light colors for dark backgrounds)
                </p>
                <Button variant="outline" className="w-full" data-testid="button-upload-desktop-logo-dark">
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center min-h-[160px] bg-muted/20">
                  {settings.mobileLogo ? (
                    <img src={settings.mobileLogo} alt="Mobile Logo" className="max-h-16 object-contain" />
                  ) : (
                    <p className="text-muted-foreground text-sm">No logo uploaded</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 60x60 pixels (Square PNG with transparency)
                </p>
                <Button variant="outline" className="w-full" data-testid="button-upload-mobile-logo">
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile Logo (Dark Mode)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center min-h-[160px] bg-zinc-800">
                  {settings.mobileLogoDark ? (
                    <img src={settings.mobileLogoDark} alt="Mobile Logo Dark" className="max-h-16 object-contain" />
                  ) : (
                    <p className="text-muted-foreground text-sm">No logo uploaded</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 60x60 pixels (Square PNG with transparency, light colors for dark backgrounds)
                </p>
                <Button variant="outline" className="w-full" data-testid="button-upload-mobile-logo-dark">
                  <Upload className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gui" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>GUI Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">GUI customization options coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login-design" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Login Page Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Login page design options coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Addons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Addon configurations coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
