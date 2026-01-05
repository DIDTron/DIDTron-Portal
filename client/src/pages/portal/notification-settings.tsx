import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, Mail, Smartphone, DollarSign, Receipt, 
  AlertTriangle, CheckCircle, MessageSquare, TrendingUp,
  Globe, Phone, Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState("10.00");
  const [digestFrequency, setDigestFrequency] = useState("weekly");

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: "low_balance", label: "Low Balance Alert", description: "When your balance falls below threshold", icon: DollarSign, email: true, push: true, sms: true },
    { id: "invoice", label: "New Invoice", description: "When a new invoice is generated", icon: Receipt, email: true, push: false, sms: false },
    { id: "payment", label: "Payment Received", description: "When a payment is processed", icon: CheckCircle, email: true, push: true, sms: false },
    { id: "ticket", label: "Support Ticket Updates", description: "When there's activity on your tickets", icon: MessageSquare, email: true, push: true, sms: false },
    { id: "service", label: "Service Alerts", description: "Route issues, quality degradation, outages", icon: AlertTriangle, email: true, push: true, sms: true },
    { id: "usage", label: "Usage Reports", description: "Weekly usage summary and analytics", icon: TrendingUp, email: true, push: false, sms: false },
    { id: "did", label: "DID Notifications", description: "DID renewals, assignments, releases", icon: Globe, email: true, push: false, sms: false },
    { id: "pbx", label: "PBX Events", description: "Voicemails, missed calls, system alerts", icon: Phone, email: true, push: true, sms: false },
    { id: "ai_agent", label: "AI Agent Activity", description: "Agent completions, errors, training updates", icon: Bot, email: true, push: false, sms: false },
  ]);

  const toggleNotification = (id: string, channel: "email" | "push" | "sms") => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, [channel]: !n[channel] } : n
    ));
  };

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your notification preferences have been updated" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Configure how and when you want to be notified</p>
        </div>
        <Button onClick={handleSave} data-testid="button-save-notifications">
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Channels</CardTitle>
              <CardDescription>Choose which notifications you want to receive and how</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 p-3 bg-muted/50 border-b text-sm font-medium">
                  <div>Notification Type</div>
                  <div className="text-center flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="text-center flex items-center justify-center gap-1">
                    <Bell className="h-4 w-4" />
                    Push
                  </div>
                  <div className="text-center flex items-center justify-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    SMS
                  </div>
                </div>
                {notifications.map((notification) => (
                  <div key={notification.id} className="grid grid-cols-[1fr,80px,80px,80px] gap-4 p-3 border-b last:border-0 items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <notification.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{notification.label}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={notification.email}
                        onCheckedChange={() => toggleNotification(notification.id, "email")}
                        data-testid={`switch-${notification.id}-email`}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={notification.push}
                        onCheckedChange={() => toggleNotification(notification.id, "push")}
                        data-testid={`switch-${notification.id}-push`}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch
                        checked={notification.sms}
                        onCheckedChange={() => toggleNotification(notification.id, "sms")}
                        data-testid={`switch-${notification.id}-sms`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Balance Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Low Balance Threshold</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={lowBalanceThreshold}
                    onChange={(e) => setLowBalanceThreshold(e.target.value)}
                    className="pl-10"
                    data-testid="input-balance-threshold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll be notified when your balance drops below this amount
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Digest Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Usage Report Frequency</Label>
                <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                  <SelectTrigger data-testid="select-digest-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-enable-all">
                <CheckCircle className="h-4 w-4 mr-2" />
                Enable All Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-disable-all">
                <Bell className="h-4 w-4 mr-2" />
                Disable All Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-test-email">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
