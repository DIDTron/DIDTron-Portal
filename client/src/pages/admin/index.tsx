import { useEffect, useState, lazy, Suspense } from "react";
import { useLocation, Switch, Route } from "wouter";
import { getCurrentUser, logout, type User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalHeader } from "@/components/layout/super-admin/global-header";
import { PrimarySidebar } from "@/components/layout/super-admin/primary-sidebar";
import { SecondarySidebar } from "@/components/layout/super-admin/secondary-sidebar";
import { WorkspaceTabs } from "@/components/layout/super-admin/workspace-tabs";
import { AdminSearchResults } from "@/components/layout/super-admin/search-results";
import { useSuperAdminTabs } from "@/stores/super-admin-tabs";
import { Loader2 } from "lucide-react";

import AdminDashboard from "./dashboard";
import POPsPage from "./pops";
import VoiceTiersPage from "./voice-tiers";
import CodecsPage from "./codecs";
import ChannelPlansPage from "./channel-plans";
import DIDCountriesPage from "./did-countries";
import PartnersPage from "./partners";
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
import DocumentationPage from "./documentation";
import SipTesterPage from "./sip-tester";
import KycPage from "./kyc";
import AdminUsersPage from "./admin-users";
import AuditLogsPage from "./audit-logs";
import TrashPage from "./trash";
import SettingsPage from "./settings";
import LiveActivityPage from "./live-activity";
import MetricsPage from "./metrics";
import SystemStatusPage from "./system-status";
import AlertsPage from "./alerts";
import MonitoringRulesPage from "./monitoring-rules";
import RolesPage from "./roles";
import DIDInventoryPage from "./did-inventory";
import CurrenciesPage from "./currencies";
import { GlobalSettingsPlatform, GlobalSettingsCurrencies, GlobalSettingsLocalization, GlobalSettingsAZDatabase } from "./global-settings";
import { CustomerRatesPage, CarrierRatesPage } from "./rate-cards";
import CdrsPage from "./cdrs";
import ConnexCSStatusPage from "./connexcs-status";
import JobQueuePage from "./job-queue";
import DevTestsPage from "./dev-tests";
import TestingEnginePage from "./testing-engine";

const CarrierDetailPage = lazy(() => import("./carrier-detail"));
const InterconnectDetailPage = lazy(() => import("./interconnect-detail"));

const SoftswitchCarriersPage = lazy(() => import("./softswitch").then(m => ({ default: m.SoftswitchCarriersPage })));
const CustomerRatingPlansPage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.CustomerRatingPlansPage })));
const SupplierRatingPlansPage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.SupplierRatingPlansPage })));
const PeriodExceptionsPage = lazy(() => import("./period-exceptions"));
const CDRReratingPage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.CDRReratingPage })));
const RatingZoneNamePage = lazy(() => import("./softswitch-rating").then(m => ({ default: m.RatingZoneNamePage })));
const CarrierBalancesPage = lazy(() => import("./softswitch-balance").then(m => ({ default: m.CarrierBalancesPage })));
const TwentyFourHourSpendPage = lazy(() => import("./softswitch-balance").then(m => ({ default: m.TwentyFourHourSpendPage })));
const BalanceTotalsPage = lazy(() => import("./softswitch-balance").then(m => ({ default: m.BalanceTotalsPage })));
const RatingPlanDetailPage = lazy(() => import("./softswitch-rating-plan-detail"));
const ImportJobDetailPage = lazy(() => import("./import-job-detail"));
const BusinessRuleDetailPage = lazy(() => import("./business-rule-detail").then(m => ({ default: m.BusinessRuleDetailPage })));
const ImportTemplateWizardPage = lazy(() => import("./import-template-wizard").then(m => ({ default: m.ImportTemplateWizardPage })));

const BillingOverviewPage = lazy(() => import("./billing/index"));
const BillingCustomersPage = lazy(() => import("./billing/customers"));
const CreditNotesPage = lazy(() => import("./billing/credit-notes"));
const SOAPage = lazy(() => import("./billing/soa"));
const NettingPage = lazy(() => import("./billing/netting"));
const SupplierAuditPage = lazy(() => import("./billing/supplier-audit"));
const TemplatesPage = lazy(() => import("./billing/templates"));
const SyncStatusPage = lazy(() => import("./billing/sync-status"));
const BillingTermsPage = lazy(() => import("./billing/terms"));

const ExperienceManagerPage = lazy(() => import("./experience-manager"));
const EMMarketingPage = lazy(() => import("./em-marketing"));
const EMPortalThemesPage = lazy(() => import("./em-portal-themes"));
const EMWhiteLabelPage = lazy(() => import("./em-white-label"));
const EMDesignSystemPage = lazy(() => import("./em-design-system"));
const EMComponentLibraryPage = lazy(() => import("./em-component-library"));
const EMBrandingPage = lazy(() => import("./em-branding"));

const AiVoiceAgentsPage = lazy(() => import("./ai-voice-agents"));
const AiVoiceDashboard = lazy(() => import("./ai-voice-dashboard"));
const AiVoiceKnowledgeBasesPage = lazy(() => import("./ai-voice-knowledge-bases"));
const AiVoiceBillingPage = lazy(() => import("./ai-voice-billing"));
const AiVoiceCampaignsPage = lazy(() => import("./ai-voice-campaigns"));
const AiVoiceCallLogsPage = lazy(() => import("./ai-voice-call-logs"));
const AiVoiceAnalyticsPage = lazy(() => import("./ai-voice-analytics"));
const AiVoiceSettingsPage = lazy(() => import("./ai-voice-settings"));
const AiVoiceAssignmentsPage = lazy(() => import("./ai-voice-assignments"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

const routeToSection: Record<string, { section: string; subItem: string }> = {
  "/admin": { section: "dashboard", subItem: "overview" },
  "/admin/pops": { section: "voip", subItem: "pops" },
  "/admin/voice-tiers": { section: "voip", subItem: "voice-tiers" },
  "/admin/codecs": { section: "voip", subItem: "codecs" },
  "/admin/channel-plans": { section: "voip", subItem: "channel-plans" },
  "/admin/wholesale/partners": { section: "wholesale-partners", subItem: "wholesale-partners" },
  "/admin/routes": { section: "voip", subItem: "routes" },
  "/admin/rate-cards/customer": { section: "rate-cards", subItem: "customer-rates" },
  "/admin/rate-cards/carrier": { section: "rate-cards", subItem: "carrier-rates" },
  "/admin/did-countries": { section: "did", subItem: "did-countries" },
  "/admin/did-providers": { section: "did", subItem: "did-providers" },
  "/admin/did-inventory": { section: "did", subItem: "did-inventory" },
  "/admin/customers": { section: "customers", subItem: "customers" },
  "/admin/categories": { section: "customers", subItem: "categories" },
  "/admin/groups": { section: "customers", subItem: "groups" },
  "/admin/kyc": { section: "customers", subItem: "kyc" },
  "/admin/billing": { section: "billing", subItem: "billing-overview" },
  "/admin/billing/customers": { section: "billing", subItem: "billing-customers" },
  "/admin/billing/terms": { section: "billing", subItem: "billing-terms" },
  "/admin/billing/invoices": { section: "billing", subItem: "invoices" },
  "/admin/billing/credit-notes": { section: "billing", subItem: "credit-notes" },
  "/admin/billing/soa": { section: "billing", subItem: "soa" },
  "/admin/billing/netting": { section: "billing", subItem: "netting" },
  "/admin/billing/supplier-audit": { section: "billing", subItem: "supplier-audit" },
  "/admin/billing/templates": { section: "billing", subItem: "billing-templates" },
  "/admin/billing/sync-status": { section: "billing", subItem: "sync-status" },
  "/admin/invoices": { section: "billing", subItem: "invoices" },
  "/admin/payments": { section: "billing", subItem: "payments" },
  "/admin/currencies": { section: "billing", subItem: "currencies" },
  "/admin/referrals": { section: "billing", subItem: "referrals" },
  "/admin/promo-codes": { section: "billing", subItem: "promo-codes" },
  "/admin/bonuses": { section: "billing", subItem: "bonuses" },
  "/admin/social-accounts": { section: "marketing", subItem: "social-accounts" },
  "/admin/social-posts": { section: "marketing", subItem: "social-posts" },
  "/admin/email-templates": { section: "marketing", subItem: "email-templates" },
  "/admin/metrics": { section: "monitoring", subItem: "metrics" },
  "/admin/cdrs": { section: "monitoring", subItem: "cdrs" },
  "/admin/alerts": { section: "monitoring", subItem: "alerts" },
  "/admin/rules": { section: "monitoring", subItem: "rules" },
  "/admin/sip-tester/new": { section: "sip-tester", subItem: "sip-new-test" },
  "/admin/sip-tester/history": { section: "sip-tester", subItem: "sip-history" },
  "/admin/sip-tester/settings": { section: "sip-tester", subItem: "sip-settings" },
  "/admin/ai-voice/dashboard": { section: "ai-voice", subItem: "ai-voice-dashboard" },
  "/admin/ai-voice/agents": { section: "ai-voice", subItem: "ai-voice-agents" },
  "/admin/ai-voice/knowledge-bases": { section: "ai-voice", subItem: "ai-voice-knowledge-bases" },
  "/admin/ai-voice/campaigns": { section: "ai-voice", subItem: "ai-voice-campaigns" },
  "/admin/ai-voice/call-logs": { section: "ai-voice", subItem: "ai-voice-call-logs" },
  "/admin/ai-voice/analytics": { section: "ai-voice", subItem: "ai-voice-analytics" },
  "/admin/ai-voice/billing": { section: "ai-voice", subItem: "ai-voice-billing" },
  "/admin/ai-voice/settings": { section: "ai-voice", subItem: "ai-voice-settings" },
  "/admin/ai-voice/assignments": { section: "ai-voice", subItem: "ai-voice-assignments" },
  "/admin/softswitch/carriers": { section: "softswitch", subItem: "softswitch-carriers" },
  "/admin/softswitch/rating/customer-plans": { section: "softswitch", subItem: "softswitch-customer-rating" },
  "/admin/softswitch/rating/customer-plans/:id": { section: "softswitch", subItem: "softswitch-customer-rating" },
  "/admin/softswitch/rating/supplier-plans": { section: "softswitch", subItem: "softswitch-supplier-rating" },
  "/admin/softswitch/rating/period-exceptions": { section: "softswitch", subItem: "softswitch-period-exceptions" },
  "/admin/softswitch/rating/az-database/period-exceptions": { section: "softswitch", subItem: "softswitch-period-exceptions" },
  "/admin/softswitch/rating/cdr-rerating": { section: "softswitch", subItem: "softswitch-cdr-rerating" },
  "/admin/softswitch/rating/zone-name": { section: "softswitch", subItem: "softswitch-zone-name" },
  "/admin/softswitch/routing": { section: "softswitch", subItem: "softswitch-routing" },
  "/admin/softswitch/balance/carrier-balances": { section: "softswitch", subItem: "softswitch-carrier-balances" },
  "/admin/softswitch/balance/24h-spend": { section: "softswitch", subItem: "softswitch-24h-spend" },
  "/admin/softswitch/balance/totals": { section: "softswitch", subItem: "softswitch-balance-totals" },
  "/admin/softswitch": { section: "softswitch", subItem: "softswitch-carriers" },
  "/admin/experience-manager": { section: "experience-manager", subItem: "em-dashboard" },
  "/admin/experience-manager/marketing": { section: "experience-manager", subItem: "em-marketing" },
  "/admin/experience-manager/portal-themes": { section: "experience-manager", subItem: "em-portal-themes" },
  "/admin/experience-manager/white-label": { section: "experience-manager", subItem: "em-white-label" },
  "/admin/experience-manager/design-system": { section: "experience-manager", subItem: "em-design-system" },
  "/admin/experience-manager/component-library": { section: "experience-manager", subItem: "em-component-library" },
  "/admin/experience-manager/branding": { section: "experience-manager", subItem: "em-branding" },
  "/admin/documentation": { section: "experience-manager", subItem: "em-documentation" },
  "/admin/admin-users": { section: "admin", subItem: "admin-users" },
  "/admin/roles": { section: "admin", subItem: "roles" },
  "/admin/audit-logs": { section: "admin", subItem: "audit-logs" },
  "/admin/trash": { section: "admin", subItem: "trash" },
  "/admin/tickets": { section: "admin", subItem: "tickets" },
  "/admin/job-queue": { section: "admin", subItem: "job-queue" },
  "/admin/dev-tests": { section: "admin", subItem: "dev-tests" },
  "/admin/testing-engine": { section: "admin", subItem: "testing-engine" },
  "/admin/settings/general": { section: "settings", subItem: "general" },
  "/admin/settings/api-keys": { section: "settings", subItem: "api-keys" },
  "/admin/settings/webhooks": { section: "settings", subItem: "webhooks" },
  "/admin/settings/integrations": { section: "settings", subItem: "integrations" },
  "/admin/settings/connexcs-status": { section: "settings", subItem: "connexcs-status" },
  "/admin/activity": { section: "dashboard", subItem: "activity" },
  "/admin/global-settings/platform": { section: "global-settings", subItem: "global-platform" },
  "/admin/global-settings/currencies": { section: "global-settings", subItem: "global-currencies" },
  "/admin/global-settings/localization": { section: "global-settings", subItem: "global-localization" },
  "/admin/global-settings/az-database": { section: "global-settings", subItem: "global-az-database" },
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
              <Suspense fallback={<LoadingFallback />}>
              <Switch>
                <Route path="/admin/search" component={AdminSearchResults} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/pops" component={POPsPage} />
                <Route path="/admin/voice-tiers" component={VoiceTiersPage} />
                <Route path="/admin/codecs" component={CodecsPage} />
                <Route path="/admin/channel-plans" component={ChannelPlansPage} />
                <Route path="/admin/wholesale/partners" component={PartnersPage} />
                <Route path="/admin/wholesale/partners/:partnerId/interconnects/:interconnectId" component={InterconnectDetailPage} />
                <Route path="/admin/wholesale/partners/:id" component={CarrierDetailPage} />
                <Route path="/admin/rate-cards/customer" component={CustomerRatesPage} />
                <Route path="/admin/rate-cards/carrier" component={CarrierRatesPage} />
                <Route path="/admin/routes" component={RoutesPage} />
                <Route path="/admin/did-countries" component={DIDCountriesPage} />
                <Route path="/admin/did-providers" component={DIDProvidersPage} />
                <Route path="/admin/did-inventory" component={DIDInventoryPage} />
                <Route path="/admin/customers" component={CustomersPage} />
                <Route path="/admin/categories" component={CategoriesPage} />
                <Route path="/admin/groups" component={GroupsPage} />
                <Route path="/admin/kyc" component={KycPage} />
                <Route path="/admin/billing" component={BillingOverviewPage} />
                <Route path="/admin/billing/customers" component={BillingCustomersPage} />
                <Route path="/admin/billing/terms" component={BillingTermsPage} />
                <Route path="/admin/billing/invoices" component={InvoicesPage} />
                <Route path="/admin/billing/credit-notes" component={CreditNotesPage} />
                <Route path="/admin/billing/soa" component={SOAPage} />
                <Route path="/admin/billing/netting" component={NettingPage} />
                <Route path="/admin/billing/supplier-audit" component={SupplierAuditPage} />
                <Route path="/admin/billing/templates" component={TemplatesPage} />
                <Route path="/admin/billing/sync-status" component={SyncStatusPage} />
                <Route path="/admin/invoices" component={InvoicesPage} />
                <Route path="/admin/payments" component={PaymentsPage} />
                <Route path="/admin/currencies" component={CurrenciesPage} />
                <Route path="/admin/referrals" component={ReferralsPage} />
                <Route path="/admin/promo-codes" component={PromoCodesPage} />
                <Route path="/admin/bonuses" component={BonusesPage} />
                <Route path="/admin/social-accounts" component={SocialAccountsPage} />
                <Route path="/admin/social-posts" component={SocialPostsPage} />
                <Route path="/admin/email-templates" component={EmailTemplatesPage} />
                <Route path="/admin/metrics" component={MetricsPage} />
                <Route path="/admin/system-status" component={SystemStatusPage} />
                <Route path="/admin/cdrs" component={CdrsPage} />
                <Route path="/admin/alerts" component={AlertsPage} />
                <Route path="/admin/rules" component={MonitoringRulesPage} />
                <Route path="/admin/sip-tester/new" component={SipTesterPage} />
                <Route path="/admin/sip-tester/history" component={SipTesterPage} />
                <Route path="/admin/sip-tester/settings" component={SipTesterPage} />
                <Route path="/admin/ai-voice/dashboard" component={AiVoiceDashboard} />
                <Route path="/admin/ai-voice/agents" component={AiVoiceAgentsPage} />
                <Route path="/admin/ai-voice/knowledge-bases" component={AiVoiceKnowledgeBasesPage} />
                <Route path="/admin/ai-voice/campaigns" component={AiVoiceCampaignsPage} />
                <Route path="/admin/ai-voice/call-logs" component={AiVoiceCallLogsPage} />
                <Route path="/admin/ai-voice/analytics" component={AiVoiceAnalyticsPage} />
                <Route path="/admin/ai-voice/billing" component={AiVoiceBillingPage} />
                <Route path="/admin/ai-voice/settings" component={AiVoiceSettingsPage} />
                <Route path="/admin/ai-voice/assignments" component={AiVoiceAssignmentsPage} />
                <Route path="/admin/softswitch/carriers" component={SoftswitchCarriersPage} />
                <Route path="/admin/softswitch/carriers/:id/interconnects/:interconnectId" component={InterconnectDetailPage} />
                <Route path="/admin/softswitch/carriers/:id" component={CarrierDetailPage} />
                <Route path="/admin/softswitch/rating/customer-plans" component={CustomerRatingPlansPage} />
                <Route path="/admin/softswitch/rating/customer-plans/:id" component={RatingPlanDetailPage} />
                <Route path="/admin/softswitch/rating/supplier-plans" component={SupplierRatingPlansPage} />
                <Route path="/admin/softswitch/rating/period-exceptions" component={PeriodExceptionsPage} />
                <Route path="/admin/softswitch/rating/az-database/period-exceptions" component={PeriodExceptionsPage} />
                <Route path="/admin/softswitch/rating/cdr-rerating" component={CDRReratingPage} />
                <Route path="/admin/softswitch/rating/zone-name" component={RatingZoneNamePage} />
                <Route path="/admin/softswitch/rating/import-job/:jobId" component={ImportJobDetailPage} />
                <Route path="/admin/softswitch/rating/business-rule/:ruleId" component={BusinessRuleDetailPage} />
                <Route path="/admin/softswitch/rating/supplier-rating/import-template/:id" component={ImportTemplateWizardPage} />
                <Route path="/admin/softswitch/routing">{() => <PlaceholderPage title="Routing" />}</Route>
                <Route path="/admin/softswitch/balance/carrier-balances" component={CarrierBalancesPage} />
                <Route path="/admin/softswitch/balance/24h-spend" component={TwentyFourHourSpendPage} />
                <Route path="/admin/softswitch/balance/totals" component={BalanceTotalsPage} />
                <Route path="/admin/experience-manager" component={ExperienceManagerPage} />
                <Route path="/admin/experience-manager/marketing" component={EMMarketingPage} />
                <Route path="/admin/experience-manager/portal-themes" component={EMPortalThemesPage} />
                <Route path="/admin/experience-manager/white-label" component={EMWhiteLabelPage} />
                <Route path="/admin/experience-manager/design-system" component={EMDesignSystemPage} />
                <Route path="/admin/experience-manager/component-library" component={EMComponentLibraryPage} />
                <Route path="/admin/experience-manager/branding" component={EMBrandingPage} />
                <Route path="/admin/documentation" component={DocumentationPage} />
                <Route path="/admin/admin-users" component={AdminUsersPage} />
                <Route path="/admin/roles" component={RolesPage} />
                <Route path="/admin/audit-logs" component={AuditLogsPage} />
                <Route path="/admin/trash" component={TrashPage} />
                <Route path="/admin/tickets" component={TicketsPage} />
                <Route path="/admin/job-queue" component={JobQueuePage} />
                <Route path="/admin/dev-tests" component={DevTestsPage} />
                <Route path="/admin/testing-engine" component={TestingEnginePage} />
                <Route path="/admin/settings/general" component={SettingsPage} />
                <Route path="/admin/settings/api-keys" component={SettingsPage} />
                <Route path="/admin/settings/webhooks" component={SettingsPage} />
                <Route path="/admin/settings/integrations" component={IntegrationsPage} />
                <Route path="/admin/settings/connexcs-status" component={ConnexCSStatusPage} />
                <Route path="/admin/activity" component={LiveActivityPage} />
                <Route path="/admin/global-settings/platform" component={GlobalSettingsPlatform} />
                <Route path="/admin/global-settings/currencies" component={GlobalSettingsCurrencies} />
                <Route path="/admin/global-settings/localization" component={GlobalSettingsLocalization} />
                <Route path="/admin/global-settings/az-database" component={GlobalSettingsAZDatabase} />
                <Route>
                  <PlaceholderPage title="Page Not Found" />
                </Route>
              </Switch>
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
