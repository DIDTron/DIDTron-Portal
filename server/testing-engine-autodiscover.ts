import { testingEngineRepository } from "./testing-engine-repository";
import { db } from "./db";

interface SidebarItem {
  id: string;
  label: string;
  route: string;
}

interface SidebarSection {
  title: string;
  slug: string;
  items: SidebarItem[];
}

const SIDEBAR_CONFIG: SidebarSection[] = [
  {
    title: "Dashboard",
    slug: "dashboard",
    items: [
      { id: "overview", label: "Overview", route: "/admin" },
      { id: "activity", label: "Live Activity", route: "/admin/activity" },
    ],
  },
  {
    title: "VoIP Configuration",
    slug: "voip",
    items: [
      { id: "pops", label: "POPs", route: "/admin/pops" },
      { id: "voice-tiers", label: "Voice Tiers", route: "/admin/voice-tiers" },
      { id: "codecs", label: "Codecs", route: "/admin/codecs" },
      { id: "channel-plans", label: "Channel Plans", route: "/admin/channel-plans" },
      { id: "routes", label: "Routes", route: "/admin/routes" },
    ],
  },
  {
    title: "Carriers",
    slug: "carriers",
    items: [
      { id: "carriers", label: "Carriers", route: "/admin/carriers" },
    ],
  },
  {
    title: "Rate Cards",
    slug: "rate-cards",
    items: [
      { id: "customer-rates", label: "Customer Rates", route: "/admin/rate-cards/customer" },
      { id: "carrier-rates", label: "Carrier Rates", route: "/admin/rate-cards/carrier" },
    ],
  },
  {
    title: "DID Management",
    slug: "did",
    items: [
      { id: "did-countries", label: "DID Countries", route: "/admin/did-countries" },
      { id: "did-providers", label: "DID Providers", route: "/admin/did-providers" },
      { id: "did-inventory", label: "DID Inventory", route: "/admin/did-inventory" },
    ],
  },
  {
    title: "Customer Management",
    slug: "customers",
    items: [
      { id: "customers", label: "Customers", route: "/admin/customers" },
      { id: "categories", label: "Categories", route: "/admin/categories" },
      { id: "groups", label: "Groups", route: "/admin/groups" },
      { id: "kyc", label: "KYC Requests", route: "/admin/kyc" },
    ],
  },
  {
    title: "Billing & Payments",
    slug: "billing",
    items: [
      { id: "invoices", label: "Invoices", route: "/admin/invoices" },
      { id: "payments", label: "Payments", route: "/admin/payments" },
      { id: "currencies", label: "Currencies", route: "/admin/currencies" },
      { id: "referrals", label: "Referrals", route: "/admin/referrals" },
      { id: "promo-codes", label: "Promo Codes", route: "/admin/promo-codes" },
      { id: "bonuses", label: "Bonuses", route: "/admin/bonuses" },
    ],
  },
  {
    title: "Marketing",
    slug: "marketing",
    items: [
      { id: "social-accounts", label: "Social Accounts", route: "/admin/social-accounts" },
      { id: "social-posts", label: "Social Posts", route: "/admin/social-posts" },
      { id: "email-templates", label: "Email Templates", route: "/admin/email-templates" },
    ],
  },
  {
    title: "Monitoring & Alerts",
    slug: "monitoring",
    items: [
      { id: "metrics", label: "Metrics", route: "/admin/metrics" },
      { id: "cdrs", label: "CDRs", route: "/admin/cdrs" },
      { id: "alerts", label: "Alerts", route: "/admin/alerts" },
      { id: "rules", label: "Rules", route: "/admin/rules" },
    ],
  },
  {
    title: "SIP Tester",
    slug: "sip-tester",
    items: [
      { id: "sip-new-test", label: "New Test", route: "/admin/sip-tester/new" },
      { id: "sip-history", label: "History", route: "/admin/sip-tester/history" },
      { id: "sip-settings", label: "Settings", route: "/admin/sip-tester/settings" },
    ],
  },
  {
    title: "AI Voice",
    slug: "ai-voice",
    items: [
      { id: "ai-voice-dashboard", label: "Dashboard", route: "/admin/ai-voice/dashboard" },
      { id: "ai-voice-agents", label: "Agents", route: "/admin/ai-voice/agents" },
      { id: "ai-voice-knowledge-bases", label: "Knowledge Bases", route: "/admin/ai-voice/knowledge-bases" },
      { id: "ai-voice-campaigns", label: "Campaigns", route: "/admin/ai-voice/campaigns" },
      { id: "ai-voice-call-logs", label: "Call Logs", route: "/admin/ai-voice/call-logs" },
      { id: "ai-voice-analytics", label: "Analytics", route: "/admin/ai-voice/analytics" },
      { id: "ai-voice-billing", label: "Billing", route: "/admin/ai-voice/billing" },
      { id: "ai-voice-settings", label: "Settings", route: "/admin/ai-voice/settings" },
    ],
  },
  {
    title: "Class 4 Softswitch",
    slug: "softswitch",
    items: [
      { id: "class4-customers", label: "Customers", route: "/admin/class4-customers" },
      { id: "class4-carriers", label: "Carriers", route: "/admin/class4-carriers" },
      { id: "class4-rate-cards", label: "Rate Cards", route: "/admin/class4-rate-cards" },
    ],
  },
  {
    title: "Experience Manager",
    slug: "experience-manager",
    items: [
      { id: "em-dashboard", label: "Dashboard", route: "/admin/experience-manager" },
      { id: "em-marketing", label: "Marketing Website", route: "/admin/experience-manager/marketing" },
      { id: "em-portal-themes", label: "Portal Themes", route: "/admin/experience-manager/portal-themes" },
      { id: "em-white-label", label: "White-Label", route: "/admin/experience-manager/white-label" },
      { id: "em-design-system", label: "Design System", route: "/admin/experience-manager/design-system" },
      { id: "em-documentation", label: "Documentation", route: "/admin/documentation" },
    ],
  },
  {
    title: "Administration",
    slug: "admin",
    items: [
      { id: "admin-users", label: "Admin Users", route: "/admin/admin-users" },
      { id: "roles", label: "Roles", route: "/admin/roles" },
      { id: "audit-logs", label: "Audit Logs", route: "/admin/audit-logs" },
      { id: "trash", label: "Trash", route: "/admin/trash" },
      { id: "tickets", label: "Support Tickets", route: "/admin/tickets" },
      { id: "job-queue", label: "Job Queue", route: "/admin/job-queue" },
      { id: "dev-tests", label: "Dev Tests", route: "/admin/dev-tests" },
      { id: "testing-engine", label: "Testing Engine", route: "/admin/testing-engine" },
    ],
  },
  {
    title: "Global Settings",
    slug: "global-settings",
    items: [
      { id: "global-platform", label: "Platform", route: "/admin/global-settings/platform" },
      { id: "global-currencies", label: "Currencies", route: "/admin/global-settings/currencies" },
      { id: "global-localization", label: "Localization", route: "/admin/global-settings/localization" },
      { id: "global-az-database", label: "A-Z Database", route: "/admin/global-settings/az-database" },
    ],
  },
  {
    title: "Settings",
    slug: "settings",
    items: [
      { id: "general", label: "General", route: "/admin/settings/general" },
      { id: "api-keys", label: "API Keys", route: "/admin/settings/api-keys" },
      { id: "webhooks", label: "Webhooks", route: "/admin/settings/webhooks" },
      { id: "integrations", label: "Integrations", route: "/admin/settings/integrations" },
      { id: "connexcs-status", label: "ConnexCS Status", route: "/admin/settings/connexcs-status" },
    ],
  },
];

export interface AutoDiscoveryResult {
  modulesCreated: number;
  modulesUpdated: number;
  pagesCreated: number;
  pagesUpdated: number;
  totalModules: number;
  totalPages: number;
}

export async function autoDiscoverAndRegister(): Promise<AutoDiscoveryResult> {
  let modulesCreated = 0;
  let modulesUpdated = 0;
  let pagesCreated = 0;
  let pagesUpdated = 0;

  for (let moduleOrder = 0; moduleOrder < SIDEBAR_CONFIG.length; moduleOrder++) {
    const section = SIDEBAR_CONFIG[moduleOrder];
    
    let existingModule = await testingEngineRepository.getModuleBySlug(section.slug);
    
    if (existingModule) {
      await testingEngineRepository.updateModule(existingModule.id, {
        name: section.title,
        order: moduleOrder,
      });
      modulesUpdated++;
    } else {
      existingModule = await testingEngineRepository.createModule({
        name: section.title,
        slug: section.slug,
        description: `${section.title} module (auto-discovered)`,
        order: moduleOrder,
        enabled: true,
      });
      modulesCreated++;
    }

    for (let pageOrder = 0; pageOrder < section.items.length; pageOrder++) {
      const item = section.items[pageOrder];
      const pageSlug = `${section.slug}-${item.id}`;
      
      const existingPages = await testingEngineRepository.getPages(existingModule.id);
      const existingPage = existingPages.find(p => p.slug === pageSlug);
      
      if (existingPage) {
        await testingEngineRepository.updatePage(existingPage.id, {
          name: item.label,
          route: item.route,
          order: pageOrder,
        });
        pagesUpdated++;
      } else {
        await testingEngineRepository.createPage({
          moduleId: existingModule.id,
          name: item.label,
          slug: pageSlug,
          route: item.route,
          description: `${item.label} page`,
          order: pageOrder,
          enabled: true,
        });
        pagesCreated++;
      }
    }
  }

  const modules = await testingEngineRepository.getModules();
  const pages = await testingEngineRepository.getPages();

  return {
    modulesCreated,
    modulesUpdated,
    pagesCreated,
    pagesUpdated,
    totalModules: modules.length,
    totalPages: pages.length,
  };
}

export function getSidebarConfig(): SidebarSection[] {
  return SIDEBAR_CONFIG;
}
