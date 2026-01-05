import { useEffect, useState } from "react";
import { useLocation, Switch, Route } from "wouter";
import { getCurrentUser, logout, type User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalHeader } from "@/components/layout/super-admin/global-header";
import { PrimarySidebar } from "@/components/layout/super-admin/primary-sidebar";
import { SecondarySidebar } from "@/components/layout/super-admin/secondary-sidebar";
import { WorkspaceTabs } from "@/components/layout/super-admin/workspace-tabs";
import { useSuperAdminTabs } from "@/stores/super-admin-tabs";

import AdminDashboard from "./dashboard";
import POPsPage from "./pops";
import VoiceTiersPage from "./voice-tiers";
import CodecsPage from "./codecs";
import ChannelPlansPage from "./channel-plans";
import DIDCountriesPage from "./did-countries";
import CarriersPage from "./carriers";
import RoutesPage from "./routes";
import DIDProvidersPage from "./did-providers";
import IntegrationsPage from "./integrations";
import CustomersPage from "./customers";
import CategoriesPage from "./categories";
import GroupsPage from "./groups";
import InvoicesPage from "./invoices";
import PaymentsPage from "./payments";
import PromoCodesPage from "./promo-codes";
import ReferralsPage from "./referrals";
import BonusesPage from "./bonuses";
import EmailTemplatesPage from "./email-templates";
import TicketsPage from "./tickets";
import SocialAccountsPage from "./social-accounts";
import SocialPostsPage from "./social-posts";
import CmsThemesPage from "./cms-themes";
import CmsPagesPage from "./cms-pages";
import MediaLibraryPage from "./media-library";

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

const routeToSection: Record<string, { section: string; subItem: string }> = {
  "/admin": { section: "dashboard", subItem: "overview" },
  "/admin/pops": { section: "voip", subItem: "pops" },
  "/admin/voice-tiers": { section: "voip", subItem: "voice-tiers" },
  "/admin/codecs": { section: "voip", subItem: "codecs" },
  "/admin/channel-plans": { section: "voip", subItem: "channel-plans" },
  "/admin/carriers": { section: "voip", subItem: "carriers" },
  "/admin/routes": { section: "voip", subItem: "routes" },
  "/admin/did-countries": { section: "voip", subItem: "did-countries" },
  "/admin/did-providers": { section: "voip", subItem: "did-providers" },
  "/admin/customers": { section: "customers", subItem: "customers" },
  "/admin/categories": { section: "customers", subItem: "categories" },
  "/admin/groups": { section: "customers", subItem: "groups" },
  "/admin/kyc": { section: "customers", subItem: "kyc" },
  "/admin/invoices": { section: "billing", subItem: "invoices" },
  "/admin/payments": { section: "billing", subItem: "payments" },
  "/admin/referrals": { section: "billing", subItem: "referrals" },
  "/admin/promo-codes": { section: "billing", subItem: "promo-codes" },
  "/admin/bonuses": { section: "billing", subItem: "bonuses" },
  "/admin/social-accounts": { section: "marketing", subItem: "social-accounts" },
  "/admin/social-posts": { section: "marketing", subItem: "social-posts" },
  "/admin/email-templates": { section: "marketing", subItem: "email-templates" },
  "/admin/metrics": { section: "monitoring", subItem: "metrics" },
  "/admin/alerts": { section: "monitoring", subItem: "alerts" },
  "/admin/rules": { section: "monitoring", subItem: "rules" },
  "/admin/sip-tester": { section: "monitoring", subItem: "sip-tester" },
  "/admin/pages": { section: "cms", subItem: "pages" },
  "/admin/themes": { section: "cms", subItem: "themes" },
  "/admin/media": { section: "cms", subItem: "media" },
  "/admin/admin-users": { section: "admin", subItem: "admin-users" },
  "/admin/roles": { section: "admin", subItem: "roles" },
  "/admin/audit-logs": { section: "admin", subItem: "audit-logs" },
  "/admin/tickets": { section: "admin", subItem: "tickets" },
  "/admin/settings/general": { section: "settings", subItem: "general" },
  "/admin/settings/api-keys": { section: "settings", subItem: "api-keys" },
  "/admin/settings/webhooks": { section: "settings", subItem: "webhooks" },
  "/admin/settings/integrations": { section: "settings", subItem: "integrations" },
  "/admin/activity": { section: "dashboard", subItem: "activity" },
};

export default function AdminLayout() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setActiveSection, setActiveSubItem } = useSuperAdminTabs();

  useEffect(() => {
    const mapping = routeToSection[location];
    if (mapping) {
      setActiveSection(mapping.section);
      setActiveSubItem(mapping.subItem);
    }
  }, [location, setActiveSection, setActiveSubItem]);

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

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-background">
        <GlobalHeader userEmail={user?.email || ""} onLogout={handleLogout} />
        
        <div className="flex flex-1 overflow-hidden">
          <PrimarySidebar />
          <SecondarySidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <WorkspaceTabs />
            
            <main className="flex-1 overflow-auto p-6">
              <Switch>
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/pops" component={POPsPage} />
                <Route path="/admin/voice-tiers" component={VoiceTiersPage} />
                <Route path="/admin/codecs" component={CodecsPage} />
                <Route path="/admin/channel-plans" component={ChannelPlansPage} />
                <Route path="/admin/carriers" component={CarriersPage} />
                <Route path="/admin/routes" component={RoutesPage} />
                <Route path="/admin/did-countries" component={DIDCountriesPage} />
                <Route path="/admin/did-providers" component={DIDProvidersPage} />
                <Route path="/admin/customers" component={CustomersPage} />
                <Route path="/admin/categories" component={CategoriesPage} />
                <Route path="/admin/groups" component={GroupsPage} />
                <Route path="/admin/kyc">
                  <PlaceholderPage title="KYC Requests" />
                </Route>
                <Route path="/admin/invoices" component={InvoicesPage} />
                <Route path="/admin/payments" component={PaymentsPage} />
                <Route path="/admin/referrals" component={ReferralsPage} />
                <Route path="/admin/promo-codes" component={PromoCodesPage} />
                <Route path="/admin/bonuses" component={BonusesPage} />
                <Route path="/admin/social-accounts" component={SocialAccountsPage} />
                <Route path="/admin/social-posts" component={SocialPostsPage} />
                <Route path="/admin/email-templates" component={EmailTemplatesPage} />
                <Route path="/admin/metrics">
                  <PlaceholderPage title="Metrics" />
                </Route>
                <Route path="/admin/alerts">
                  <PlaceholderPage title="Alerts" />
                </Route>
                <Route path="/admin/rules">
                  <PlaceholderPage title="Monitoring Rules" />
                </Route>
                <Route path="/admin/sip-tester">
                  <PlaceholderPage title="SIP Tester" />
                </Route>
                <Route path="/admin/pages" component={CmsPagesPage} />
                <Route path="/admin/themes" component={CmsThemesPage} />
                <Route path="/admin/media" component={MediaLibraryPage} />
                <Route path="/admin/admin-users">
                  <PlaceholderPage title="Admin Users" />
                </Route>
                <Route path="/admin/roles">
                  <PlaceholderPage title="Roles" />
                </Route>
                <Route path="/admin/audit-logs">
                  <PlaceholderPage title="Audit Logs" />
                </Route>
                <Route path="/admin/tickets" component={TicketsPage} />
                <Route path="/admin/settings/general">
                  <PlaceholderPage title="General Settings" />
                </Route>
                <Route path="/admin/settings/api-keys">
                  <PlaceholderPage title="API Keys" />
                </Route>
                <Route path="/admin/settings/webhooks">
                  <PlaceholderPage title="Webhooks" />
                </Route>
                <Route path="/admin/settings/integrations" component={IntegrationsPage} />
                <Route path="/admin/activity">
                  <PlaceholderPage title="Live Activity" />
                </Route>
                <Route>
                  <PlaceholderPage title="Page Not Found" />
                </Route>
              </Switch>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
