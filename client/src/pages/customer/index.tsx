import { useState, useEffect } from "react";
import { useLocation, Switch, Route } from "wouter";
import { getCurrentUser, logout, type User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  Phone, 
  CreditCard, 
  Settings, 
  Palette, 
  HelpCircle, 
  LogOut,
  User as UserIcon,
  ChevronDown
} from "lucide-react";

import MyBrandingPage from "./my-branding";

function CustomerDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your customer portal</p>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">This module is coming soon</p>
      </div>
    </div>
  );
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/customer" },
  { id: "services", label: "My Services", icon: Phone, path: "/customer/services" },
  { id: "billing", label: "Billing", icon: CreditCard, path: "/customer/billing" },
  { id: "branding", label: "My Branding", icon: Palette, path: "/customer/branding" },
  { id: "support", label: "Support", icon: HelpCircle, path: "/customer/support" },
  { id: "settings", label: "Settings", icon: Settings, path: "/customer/settings" },
];

export default function CustomerPortal() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate("/login");
          return;
        }
        setUser(currentUser);
      } catch {
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      toast({ title: "Failed to logout", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <TooltipProvider>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <Sidebar>
            <SidebarHeader className="p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  D
                </div>
                <span className="font-semibold">DIDTron</span>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                {navItems.map(item => {
                  const isActive = location === item.path || 
                    (item.path !== "/customer" && location.startsWith(item.path));
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => navigate(item.path)}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user?.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/customer/settings")}>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="flex-1 overflow-auto">
              <Switch>
                <Route path="/customer" component={CustomerDashboard} />
                <Route path="/customer/branding" component={MyBrandingPage} />
                <Route path="/customer/services">
                  <PlaceholderPage title="My Services" />
                </Route>
                <Route path="/customer/billing">
                  <PlaceholderPage title="Billing" />
                </Route>
                <Route path="/customer/support">
                  <PlaceholderPage title="Support" />
                </Route>
                <Route path="/customer/settings">
                  <PlaceholderPage title="Settings" />
                </Route>
                <Route>
                  <PlaceholderPage title="Page Not Found" />
                </Route>
              </Switch>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
