import { useEffect, useState } from "react";
import { useLocation, Link, Switch, Route } from "wouter";
import { getCurrentUser, logout, type User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Phone,
  LogOut,
  Server,
  Layers,
  Radio,
  CreditCard,
  Globe,
  Building2,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

import AdminDashboard from "./dashboard";
import POPsPage from "./pops";
import VoiceTiersPage from "./voice-tiers";
import CodecsPage from "./codecs";
import ChannelPlansPage from "./channel-plans";
import DIDCountriesPage from "./did-countries";

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "POPs", url: "/admin/pops", icon: Server },
  { title: "Voice Tiers", url: "/admin/voice-tiers", icon: Layers },
  { title: "Codecs", url: "/admin/codecs", icon: Radio },
  { title: "Channel Plans", url: "/admin/channel-plans", icon: CreditCard },
  { title: "DID Countries", url: "/admin/did-countries", icon: Globe },
];

function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Phone className="h-6 w-6 text-primary" />
          <div>
            <span className="font-bold text-lg">DIDTron</span>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || (item.url !== "/admin" && location.startsWith(item.url))}
                  >
                    <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full" data-testid="button-back-to-portal">
            <Users className="h-4 w-4 mr-2" />
            Customer Portal
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout() {
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
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground" data-testid="text-admin-email">
                {user?.email}
              </span>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/pops" component={POPsPage} />
              <Route path="/admin/voice-tiers" component={VoiceTiersPage} />
              <Route path="/admin/codecs" component={CodecsPage} />
              <Route path="/admin/channel-plans" component={ChannelPlansPage} />
              <Route path="/admin/did-countries" component={DIDCountriesPage} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
