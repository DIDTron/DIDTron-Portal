import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Key, Smartphone, Clock, MapPin, 
  AlertTriangle, CheckCircle, LogOut, Eye, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState("");
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const sessions: LoginSession[] = [
    { id: "1", device: "Chrome on Windows", location: "New York, US", lastActive: "Now", isCurrent: true },
    { id: "2", device: "Safari on macOS", location: "New York, US", lastActive: "2 hours ago", isCurrent: false },
    { id: "3", device: "Mobile App on iPhone", location: "New York, US", lastActive: "Yesterday", isCurrent: false },
  ];

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    toast({ title: "Password Updated", description: "Your password has been changed successfully" });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleToggle2FA = () => {
    if (!twoFaEnabled) {
      toast({ title: "2FA Setup", description: "Two-factor authentication setup will be available soon" });
    } else {
      setTwoFaEnabled(false);
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been disabled" });
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    toast({ title: "Session Revoked", description: "The session has been logged out" });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">Manage your account security and access controls</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password regularly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  data-testid="input-current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                data-testid="input-confirm-password"
              />
            </div>
            <Button onClick={handlePasswordChange} className="w-full" data-testid="button-change-password">
              Update Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-3">
                {twoFaEnabled ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className="font-medium">2FA Status</p>
                  <p className="text-sm text-muted-foreground">
                    {twoFaEnabled ? "Enabled and active" : "Not enabled - your account is less secure"}
                  </p>
                </div>
              </div>
              <Switch
                checked={twoFaEnabled}
                onCheckedChange={handleToggle2FA}
                data-testid="switch-2fa"
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app when signing in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IP Whitelist
          </CardTitle>
          <CardDescription>Restrict API access to specific IP addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Allowed IP Addresses</Label>
            <Input
              placeholder="Enter IP addresses separated by commas (e.g., 192.168.1.1, 10.0.0.0/24)"
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              data-testid="input-ip-whitelist"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to allow access from any IP. Supports CIDR notation.
            </p>
          </div>
          <Button variant="outline" data-testid="button-save-whitelist">
            Save IP Whitelist
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage devices logged into your account</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-revoke-all">
              <LogOut className="h-4 w-4 mr-2" />
              Revoke All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.isCurrent && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                      <span className="mx-1">|</span>
                      <Clock className="h-3 w-3" />
                      {session.lastActive}
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRevokeSession(session.id)}
                    data-testid={`button-revoke-${session.id}`}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
