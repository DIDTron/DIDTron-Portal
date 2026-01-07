import { useState, useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CustomerPrimarySidebar } from "@/components/layout/customer-portal/primary-sidebar";
import { CustomerSecondarySidebar } from "@/components/layout/customer-portal/secondary-sidebar";
import { CustomerWorkspaceTabs } from "@/components/layout/customer-portal/workspace-tabs";
import { SearchResults } from "@/components/layout/customer-portal/search-results";
import { useCustomerPortalStore } from "@/stores/customer-portal-tabs";
import { Phone, Bell, LogOut, Search, Loader2, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CustomerDashboard from "./dashboard";
import VoiceRatesPage from "./voice-rates";
import VoiceRoutesPage from "./voice-routes";
import VoiceUsagePage from "./voice-usage";
import DIDsPage from "./dids";
import DIDSearchPage from "./did-search";
import KycDocumentsPage from "./kyc-documents";
import BillingPage from "./billing";
import InvoicesPage from "./invoices";
import TransactionsPage from "./transactions";
import ReferralsPage from "./referrals";
import SupportPage from "./support";
import SettingsPage from "./settings";
import UsagePage from "./usage";
import PortalAiAgentsPage from "./ai-agents";
import PortalExtensionsPage from "./extensions";
import PortalIvrPage from "./ivr";
import PortalRingGroupsPage from "./ring-groups";
import PortalQueuesPage from "./queues";
import PortalSipTesterPage from "./sip-tester";
import ApiWebhooksPage from "./api-webhooks";
import Class4Page from "./class4";
import CdrExportPage from "./cdr-export";
import NewTicketPage from "./new-ticket";
import KnowledgeBasePage from "./knowledge-base";
import SecuritySettingsPage from "./security-settings";
import NotificationSettingsPage from "./notification-settings";
import PromoCodesPage from "./promo-codes";
import MyBrandingPage from "./my-branding";
import CustomerAiVoiceDashboard from "./ai-voice-dashboard";
import FlowDesignerPage from "./ai-voice-flow-designer";
import CustomerKnowledgeWorkspace from "./ai-voice-knowledge";
import CustomerCampaignsPage from "./ai-voice-campaigns";
import CustomerCallLogsPage from "./ai-voice-call-logs";
import CustomerAnalyticsPage from "./ai-voice-analytics";
import CustomerAiVoiceBillingPage from "./ai-voice-billing";
import AIVoiceWizard from "./ai-voice-wizard";
import CrmIntegrationsPage from "./crm-integrations";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">This feature is coming soon</p>
      </div>
    </div>
  );
}

const routeToSection: Record<string, { section: string; subItem: string }> = {
  "/portal": { section: "dashboard", subItem: "overview" },
  "/portal/usage": { section: "dashboard", subItem: "usage" },
  "/portal/voice": { section: "voice", subItem: "rates" },
  "/portal/voice/rates": { section: "voice", subItem: "rates" },
  "/portal/voice/routes": { section: "voice", subItem: "routes" },
  "/portal/voice/usage": { section: "voice", subItem: "usage" },
  "/portal/dids": { section: "dids", subItem: "inventory" },
  "/portal/dids/search": { section: "dids", subItem: "search" },
  "/portal/dids/kyc": { section: "dids", subItem: "kyc" },
  "/portal/pbx": { section: "pbx", subItem: "extensions" },
  "/portal/pbx/extensions": { section: "pbx", subItem: "extensions" },
  "/portal/pbx/ring-groups": { section: "pbx", subItem: "ring-groups" },
  "/portal/pbx/ivr": { section: "pbx", subItem: "ivr" },
  "/portal/pbx/queues": { section: "pbx", subItem: "queues" },
  "/portal/ai-agent": { section: "ai-agent", subItem: "dashboard" },
  "/portal/ai-agent/agents": { section: "ai-agent", subItem: "agents" },
  "/portal/ai-agent/flows": { section: "ai-agent", subItem: "flows" },
  "/portal/ai-agent/knowledge": { section: "ai-agent", subItem: "knowledge" },
  "/portal/ai-agent/campaigns": { section: "ai-agent", subItem: "campaigns" },
  "/portal/ai-agent/call-logs": { section: "ai-agent", subItem: "call-logs" },
  "/portal/ai-agent/analytics": { section: "ai-agent", subItem: "analytics" },
  "/portal/ai-agent/billing": { section: "ai-agent", subItem: "billing" },
  "/portal/ai-agent/crm": { section: "ai-agent", subItem: "crm" },
  "/portal/sip-tester": { section: "sip-tester", subItem: "quick-test" },
  "/portal/sip-tester/configs": { section: "sip-tester", subItem: "configs" },
  "/portal/sip-tester/results": { section: "sip-tester", subItem: "results" },
  "/portal/sip-tester/schedules": { section: "sip-tester", subItem: "schedules" },
  "/portal/class4": { section: "class4", subItem: "overview" },
  "/portal/class4/rate-cards": { section: "class4", subItem: "rate-cards" },
  "/portal/class4/lcr": { section: "class4", subItem: "lcr" },
  "/portal/class4/margins": { section: "class4", subItem: "margins" },
  "/portal/developers": { section: "developers", subItem: "api-keys" },
  "/portal/developers/api-keys": { section: "developers", subItem: "api-keys" },
  "/portal/developers/webhooks": { section: "developers", subItem: "webhooks" },
  "/portal/billing": { section: "billing", subItem: "balance" },
  "/portal/billing/invoices": { section: "billing", subItem: "invoices" },
  "/portal/billing/transactions": { section: "billing", subItem: "transactions" },
  "/portal/billing/referrals": { section: "billing", subItem: "referrals" },
  "/portal/billing/promo": { section: "billing", subItem: "promo" },
  "/portal/billing/export": { section: "billing", subItem: "export" },
  "/portal/support": { section: "support", subItem: "tickets" },
  "/portal/support/new": { section: "support", subItem: "new-ticket" },
  "/portal/support/kb": { section: "support", subItem: "kb" },
  "/portal/settings": { section: "settings", subItem: "profile" },
  "/portal/settings/branding": { section: "settings", subItem: "branding" },
  "/portal/settings/security": { section: "settings", subItem: "security" },
  "/portal/settings/notifications": { section: "settings", subItem: "notifications" },
};

function PortalLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Invalid credentials");
      }
      
      // Invalidate auth query to refetch user state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Phone className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">DIDTron</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Customer Portal</h1>
          <p className="text-muted-foreground">
            Sign in to access your VoIP services
          </p>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <a href="#" className="text-xs text-primary hover:underline" data-testid="link-forgot-password">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="button-login">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
              Sign up
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back-home">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPortal() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { 
    setActiveSection, 
    setActiveSubItem,
    primarySidebarOpen,
    toggleBothSidebars,
    openTab
  } = useCustomerPortalStore();

  useEffect(() => {
    const mapping = routeToSection[location];
    if (mapping) {
      setActiveSection(mapping.section);
      setActiveSubItem(mapping.subItem);
    }
  }, [location, setActiveSection, setActiveSubItem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      openTab({
        id: "search",
        label: "Search",
        route: `/portal/search?q=${encodeURIComponent(searchQuery.trim())}`,
      });
      setLocation(`/portal/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PortalLoginPage />;
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background">
        <CustomerPrimarySidebar />
        <CustomerSecondarySidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-50 flex h-12 items-center justify-between gap-4 border-b bg-background px-4">
            <div className="flex items-center gap-4 flex-1">
              {!primarySidebarOpen && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleBothSidebars}
                    data-testid="header-toggle-sidebars"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="font-bold">DIDTron</span>
                </div>
              )}
              <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search services, DIDs, tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-14 h-8"
                  data-testid="input-global-search"
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">Ctrl</span>K
                </kbd>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">
                  2
                </Badge>
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 gap-2 px-2" data-testid="button-profile">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden md:inline-block">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user?.firstName} {user?.lastName}
                    <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/portal/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <CustomerWorkspaceTabs />

          <main className="flex-1 overflow-auto bg-muted/30">
            <Switch>
              <Route path="/portal/search" component={SearchResults} />
              <Route path="/portal" component={CustomerDashboard} />
              <Route path="/portal/usage" component={UsagePage} />
              <Route path="/portal/voice" component={VoiceRatesPage} />
              <Route path="/portal/voice/rates" component={VoiceRatesPage} />
              <Route path="/portal/voice/routes" component={VoiceRoutesPage} />
              <Route path="/portal/voice/usage" component={VoiceUsagePage} />
              <Route path="/portal/dids" component={DIDsPage} />
              <Route path="/portal/dids/search" component={DIDSearchPage} />
              <Route path="/portal/dids/kyc" component={KycDocumentsPage} />
              <Route path="/portal/pbx" component={PortalExtensionsPage} />
              <Route path="/portal/pbx/extensions" component={PortalExtensionsPage} />
              <Route path="/portal/pbx/ring-groups" component={PortalRingGroupsPage} />
              <Route path="/portal/pbx/ivr" component={PortalIvrPage} />
              <Route path="/portal/pbx/queues" component={PortalQueuesPage} />
              <Route path="/portal/ai-agent" component={CustomerAiVoiceDashboard} />
              <Route path="/portal/ai-agent/agents" component={PortalAiAgentsPage} />
              <Route path="/portal/ai-agent/wizard" component={AIVoiceWizard} />
              <Route path="/portal/ai-agent/flows" component={FlowDesignerPage} />
              <Route path="/portal/ai-agent/knowledge" component={CustomerKnowledgeWorkspace} />
              <Route path="/portal/ai-agent/campaigns" component={CustomerCampaignsPage} />
              <Route path="/portal/ai-agent/call-logs" component={CustomerCallLogsPage} />
              <Route path="/portal/ai-agent/analytics" component={CustomerAnalyticsPage} />
              <Route path="/portal/ai-agent/billing" component={CustomerAiVoiceBillingPage} />
              <Route path="/portal/ai-agent/crm" component={CrmIntegrationsPage} />
              <Route path="/portal/sip-tester" component={PortalSipTesterPage} />
              <Route path="/portal/sip-tester/configs" component={PortalSipTesterPage} />
              <Route path="/portal/sip-tester/results" component={PortalSipTesterPage} />
              <Route path="/portal/sip-tester/schedules" component={PortalSipTesterPage} />
              <Route path="/portal/class4" component={Class4Page} />
              <Route path="/portal/class4/rate-cards" component={Class4Page} />
              <Route path="/portal/class4/lcr" component={Class4Page} />
              <Route path="/portal/class4/margins" component={Class4Page} />
              <Route path="/portal/developers" component={ApiWebhooksPage} />
              <Route path="/portal/developers/api-keys" component={ApiWebhooksPage} />
              <Route path="/portal/developers/webhooks" component={ApiWebhooksPage} />
              <Route path="/portal/billing" component={BillingPage} />
              <Route path="/portal/billing/invoices" component={InvoicesPage} />
              <Route path="/portal/billing/transactions" component={TransactionsPage} />
              <Route path="/portal/billing/referrals" component={ReferralsPage} />
              <Route path="/portal/billing/promo" component={PromoCodesPage} />
              <Route path="/portal/billing/export" component={CdrExportPage} />
              <Route path="/portal/support" component={SupportPage} />
              <Route path="/portal/support/new" component={NewTicketPage} />
              <Route path="/portal/support/kb" component={KnowledgeBasePage} />
              <Route path="/portal/settings" component={SettingsPage} />
              <Route path="/portal/settings/branding" component={MyBrandingPage} />
              <Route path="/portal/settings/security" component={SecuritySettingsPage} />
              <Route path="/portal/settings/notifications" component={NotificationSettingsPage} />
              <Route>
                <PlaceholderPage title="Page Not Found" />
              </Route>
            </Switch>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
