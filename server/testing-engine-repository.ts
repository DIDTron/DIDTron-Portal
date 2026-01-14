export interface TestModule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  order: number;
}

export interface TestPage {
  id: string;
  moduleId: string;
  name: string;
  route: string;
  description?: string;
  enabled: boolean;
  order: number;
}

interface PageToTest {
  moduleName: string;
  pageName: string;
  route: string;
}

const ALL_PAGES: PageToTest[] = [
  { moduleName: "Dashboard", pageName: "Overview", route: "/admin" },
  { moduleName: "VoIP", pageName: "POPs", route: "/admin/pops" },
  { moduleName: "VoIP", pageName: "Voice Tiers", route: "/admin/voice-tiers" },
  { moduleName: "VoIP", pageName: "Codecs", route: "/admin/codecs" },
  { moduleName: "VoIP", pageName: "Channel Plans", route: "/admin/channel-plans" },
  { moduleName: "VoIP", pageName: "Routes", route: "/admin/routes" },
  { moduleName: "Carriers", pageName: "Carriers", route: "/admin/carriers" },
  { moduleName: "Rate Cards", pageName: "Customer Rates", route: "/admin/rate-cards/customer" },
  { moduleName: "Rate Cards", pageName: "Carrier Rates", route: "/admin/rate-cards/carrier" },
  { moduleName: "DID", pageName: "DID Countries", route: "/admin/did-countries" },
  { moduleName: "DID", pageName: "DID Providers", route: "/admin/did-providers" },
  { moduleName: "DID", pageName: "DID Inventory", route: "/admin/did-inventory" },
  { moduleName: "Customers", pageName: "Customers", route: "/admin/customers" },
  { moduleName: "Customers", pageName: "Categories", route: "/admin/categories" },
  { moduleName: "Customers", pageName: "Groups", route: "/admin/groups" },
  { moduleName: "Customers", pageName: "KYC Requests", route: "/admin/kyc" },
  { moduleName: "Billing", pageName: "Invoices", route: "/admin/invoices" },
  { moduleName: "Billing", pageName: "Payments", route: "/admin/payments" },
  { moduleName: "Billing", pageName: "Currencies", route: "/admin/currencies" },
  { moduleName: "Billing", pageName: "Referrals", route: "/admin/referrals" },
  { moduleName: "Billing", pageName: "Promo Codes", route: "/admin/promo-codes" },
  { moduleName: "Billing", pageName: "Bonuses", route: "/admin/bonuses" },
  { moduleName: "Marketing", pageName: "Social Accounts", route: "/admin/social-accounts" },
  { moduleName: "Marketing", pageName: "Social Posts", route: "/admin/social-posts" },
  { moduleName: "Marketing", pageName: "Email Templates", route: "/admin/email-templates" },
  { moduleName: "Monitoring", pageName: "Metrics", route: "/admin/metrics" },
  { moduleName: "Monitoring", pageName: "CDRs", route: "/admin/cdrs" },
  { moduleName: "Monitoring", pageName: "Alerts", route: "/admin/alerts" },
  { moduleName: "Monitoring", pageName: "Rules", route: "/admin/rules" },
  { moduleName: "SIP Tester", pageName: "New Test", route: "/admin/sip-tester/new" },
  { moduleName: "SIP Tester", pageName: "History", route: "/admin/sip-tester/history" },
  { moduleName: "SIP Tester", pageName: "Settings", route: "/admin/sip-tester/settings" },
  { moduleName: "AI Voice", pageName: "Dashboard", route: "/admin/ai-voice/dashboard" },
  { moduleName: "AI Voice", pageName: "Agents", route: "/admin/ai-voice/agents" },
  { moduleName: "AI Voice", pageName: "Knowledge Bases", route: "/admin/ai-voice/knowledge-bases" },
  { moduleName: "AI Voice", pageName: "Campaigns", route: "/admin/ai-voice/campaigns" },
  { moduleName: "AI Voice", pageName: "Call Logs", route: "/admin/ai-voice/call-logs" },
  { moduleName: "AI Voice", pageName: "Analytics", route: "/admin/ai-voice/analytics" },
  { moduleName: "AI Voice", pageName: "Billing", route: "/admin/ai-voice/billing" },
  { moduleName: "AI Voice", pageName: "Settings", route: "/admin/ai-voice/settings" },
  { moduleName: "Class 4", pageName: "Customers", route: "/admin/class4-customers" },
  { moduleName: "Class 4", pageName: "Carriers", route: "/admin/class4-carriers" },
  { moduleName: "Class 4", pageName: "Rate Cards", route: "/admin/class4-rate-cards" },
  { moduleName: "Experience", pageName: "Dashboard", route: "/admin/experience-manager" },
  { moduleName: "Experience", pageName: "Marketing Website", route: "/admin/experience-manager/marketing" },
  { moduleName: "Experience", pageName: "Portal Themes", route: "/admin/experience-manager/portal-themes" },
  { moduleName: "Experience", pageName: "White-Label", route: "/admin/experience-manager/white-label" },
  { moduleName: "Experience", pageName: "Design System", route: "/admin/experience-manager/design-system" },
  { moduleName: "Experience", pageName: "Documentation", route: "/admin/documentation" },
  { moduleName: "Admin", pageName: "Admin Users", route: "/admin/admin-users" },
  { moduleName: "Admin", pageName: "Roles", route: "/admin/roles" },
  { moduleName: "Admin", pageName: "Audit Logs", route: "/admin/audit-logs" },
  { moduleName: "Admin", pageName: "Trash", route: "/admin/trash" },
  { moduleName: "Admin", pageName: "Support Tickets", route: "/admin/tickets" },
  { moduleName: "Admin", pageName: "Job Queue", route: "/admin/job-queue" },
  { moduleName: "Admin", pageName: "Dev Tests", route: "/admin/dev-tests" },
  { moduleName: "Admin", pageName: "Testing Engine", route: "/admin/testing-engine" },
  { moduleName: "Global Settings", pageName: "Platform", route: "/admin/global-settings/platform" },
  { moduleName: "Global Settings", pageName: "Currencies", route: "/admin/global-settings/currencies" },
  { moduleName: "Global Settings", pageName: "Localization", route: "/admin/global-settings/localization" },
  { moduleName: "Global Settings", pageName: "A-Z Database", route: "/admin/global-settings/az-database" },
  { moduleName: "Settings", pageName: "General", route: "/admin/settings/general" },
  { moduleName: "Settings", pageName: "API Keys", route: "/admin/settings/api-keys" },
  { moduleName: "Settings", pageName: "Webhooks", route: "/admin/settings/webhooks" },
  { moduleName: "Settings", pageName: "Integrations", route: "/admin/settings/integrations" },
  { moduleName: "Settings", pageName: "ConnexCS Status", route: "/admin/settings/connexcs-status" },
];

function buildModulesAndPages(): { modules: TestModule[]; pages: TestPage[] } {
  const moduleNames = Array.from(new Set(ALL_PAGES.map(p => p.moduleName)));
  const modules: TestModule[] = moduleNames.map((name, idx) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    enabled: true,
    order: idx,
  }));

  const pages: TestPage[] = [];
  for (const pageData of ALL_PAGES) {
    const module = modules.find(m => m.name === pageData.moduleName);
    if (module) {
      pages.push({
        id: pageData.route.replace(/\//g, "-").replace(/^-/, ""),
        moduleId: module.id,
        name: pageData.pageName,
        route: pageData.route,
        enabled: true,
        order: pages.filter(p => p.moduleId === module.id).length,
      });
    }
  }

  return { modules, pages };
}

const { modules: MODULES, pages: PAGES } = buildModulesAndPages();

class TestingEngineRepository {
  async getModules(): Promise<TestModule[]> {
    return MODULES;
  }

  async getModuleById(id: string): Promise<TestModule | null> {
    return MODULES.find(m => m.id === id) || null;
  }

  async getPages(moduleId: string): Promise<TestPage[]> {
    return PAGES.filter(p => p.moduleId === moduleId);
  }

  async getAllPages(): Promise<TestPage[]> {
    return PAGES;
  }
}

export const testingEngineRepository = new TestingEngineRepository();
