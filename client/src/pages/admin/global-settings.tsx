import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Cog, Link2, DollarSign, Languages, Check, AlertCircle } from "lucide-react";

export function GlobalSettingsPlatform() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>Basic platform settings and configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="DIDTron Communications" data-testid="input-platform-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" placeholder="support@example.com" data-testid="input-support-email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-timezone">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="cet">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="iso">
                    <SelectTrigger data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                      <SelectItem value="us">MM/DD/YYYY</SelectItem>
                      <SelectItem value="eu">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Disable access for non-admin users</p>
                </div>
                <Switch data-testid="switch-maintenance" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>Advanced platform settings for experienced administrators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable verbose logging</p>
                </div>
                <Switch data-testid="switch-debug" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>API Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">Enable rate limiting on API endpoints</p>
                </div>
                <Switch defaultChecked data-testid="switch-rate-limit" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
        <Button data-testid="button-save">Save Changes</Button>
      </div>
    </div>
  );
}

export function GlobalSettingsIntegrations() {
  const integrations = [
    { name: "Stripe", status: "connected", description: "Payment processing" },
    { name: "Brevo", status: "disconnected", description: "Email delivery" },
    { name: "Ayrshare", status: "disconnected", description: "Social media automation" },
    { name: "OpenAI", status: "connected", description: "AI-powered features" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Integrations</h1>
        <p className="text-muted-foreground">Manage third-party service integrations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                <CardTitle className="text-base">{integration.name}</CardTitle>
              </div>
              <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                {integration.status === "connected" ? (
                  <><Check className="h-3 w-3 mr-1" />Connected</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" />Disconnected</>
                )}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
              <Button 
                variant={integration.status === "connected" ? "outline" : "default"} 
                size="sm"
                data-testid={`button-${integration.name.toLowerCase()}`}
              >
                {integration.status === "connected" ? "Configure" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GlobalSettingsCurrencies() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Currencies</h1>
        <p className="text-muted-foreground">Configure supported currencies and exchange rates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Configuration
          </CardTitle>
          <CardDescription>Set base currency and exchange rate source</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Base Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger data-testid="select-base-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                  <SelectItem value="gbp">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exchange Rate Source</Label>
              <Select defaultValue="openexchange">
                <SelectTrigger data-testid="select-fx-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openexchange">Open Exchange Rates</SelectItem>
                  <SelectItem value="ecb">European Central Bank</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Auto-refresh Exchange Rates</Label>
              <p className="text-sm text-muted-foreground">Automatically update rates hourly</p>
            </div>
            <Switch defaultChecked data-testid="switch-auto-refresh" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
        <Button data-testid="button-save">Save Changes</Button>
      </div>
    </div>
  );
}

export function GlobalSettingsLocalization() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Localization</h1>
        <p className="text-muted-foreground">Configure language and regional settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language Settings
          </CardTitle>
          <CardDescription>Configure default and supported languages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger data-testid="select-default-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number Format</Label>
              <Select defaultValue="en-us">
                <SelectTrigger data-testid="select-number-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-us">1,234.56 (US)</SelectItem>
                  <SelectItem value="en-gb">1,234.56 (UK)</SelectItem>
                  <SelectItem value="de">1.234,56 (German)</SelectItem>
                  <SelectItem value="fr">1 234,56 (French)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>RTL Support</Label>
              <p className="text-sm text-muted-foreground">Enable right-to-left language support</p>
            </div>
            <Switch data-testid="switch-rtl" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
        <Button data-testid="button-save">Save Changes</Button>
      </div>
    </div>
  );
}
