import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser, logout, type User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  LogOut, 
  BarChart3, 
  PhoneCall, 
  Globe, 
  DollarSign,
  Activity,
  Users
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const result = await getCurrentUser();
      if (!result) {
        setLocation("/login");
        return;
      }
      setUser(result.user);
      setIsLoading(false);
    }
    checkAuth();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out successfully" });
      setLocation("/");
    } catch (error) {
      toast({ 
        title: "Logout failed", 
        variant: "destructive" 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold" data-testid="text-logo">DIDTron</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground" data-testid="text-user-email">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your DIDTron portal</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            icon={PhoneCall}
            title="Active Calls"
            value="0"
            change="+0%"
            testId="metric-active-calls"
          />
          <MetricCard
            icon={Globe}
            title="DIDs"
            value="0"
            change="0 countries"
            testId="metric-dids"
          />
          <MetricCard
            icon={DollarSign}
            title="Balance"
            value="$0.00"
            change="Pay as you go"
            testId="metric-balance"
          />
          <MetricCard
            icon={Activity}
            title="Minutes Today"
            value="0"
            change="0 calls"
            testId="metric-minutes"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            icon={Phone}
            title="SIP Trunks"
            description="Configure your SIP trunk connections"
            testId="card-sip-trunks"
          />
          <QuickActionCard
            icon={Globe}
            title="DID Numbers"
            description="Manage your phone numbers"
            testId="card-did-numbers"
          />
          <QuickActionCard
            icon={Users}
            title="Extensions"
            description="Set up PBX extensions"
            testId="card-extensions"
          />
          <QuickActionCard
            icon={BarChart3}
            title="Call History"
            description="View your call records"
            testId="card-call-history"
          />
          <QuickActionCard
            icon={DollarSign}
            title="Billing"
            description="Add funds and view invoices"
            testId="card-billing"
          />
          <QuickActionCard
            icon={Activity}
            title="Reports"
            description="Analytics and usage reports"
            testId="card-reports"
          />
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  change,
  testId
}: {
  icon: typeof Phone;
  title: string;
  value: string;
  change: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  testId
}: {
  icon: typeof Phone;
  title: string;
  description: string;
  testId: string;
}) {
  return (
    <Card className="hover-elevate cursor-pointer" data-testid={testId}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
