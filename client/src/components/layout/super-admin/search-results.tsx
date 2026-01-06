import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Phone, Globe, Users, CreditCard, BarChart3, Shield, Settings, MessageSquare, FileText, Palette, Bot, Radio, Database } from "lucide-react";
import { useSuperAdminTabs } from "@/stores/super-admin-tabs";

interface SearchItem {
  id: string;
  label: string;
  section: string;
  sectionLabel: string;
  path: string;
  icon: typeof Phone;
  keywords: string[];
}

const allSearchItems: SearchItem[] = [
  { id: "voip-pops", label: "POPs", section: "voip", sectionLabel: "VoIP", path: "/admin/pops", icon: Radio, keywords: ["pops", "points of presence", "locations", "servers"] },
  { id: "voip-voice-tiers", label: "Voice Tiers", section: "voip", sectionLabel: "VoIP", path: "/admin/voice-tiers", icon: Phone, keywords: ["tiers", "quality", "voice", "premium", "standard"] },
  { id: "voip-codecs", label: "Codecs", section: "voip", sectionLabel: "VoIP", path: "/admin/codecs", icon: Settings, keywords: ["codecs", "audio", "g711", "g729", "opus"] },
  { id: "voip-channel-plans", label: "Channel Plans", section: "voip", sectionLabel: "VoIP", path: "/admin/channel-plans", icon: Database, keywords: ["channels", "plans", "capacity"] },
  { id: "voip-carriers", label: "Carriers", section: "voip", sectionLabel: "VoIP", path: "/admin/carriers", icon: Phone, keywords: ["carriers", "providers", "upstream", "termination"] },
  { id: "voip-routes", label: "Routes", section: "voip", sectionLabel: "VoIP", path: "/admin/routes", icon: Phone, keywords: ["routes", "routing", "lcr", "destinations"] },
  { id: "voip-did-countries", label: "DID Countries", section: "voip", sectionLabel: "VoIP", path: "/admin/did-countries", icon: Globe, keywords: ["did", "countries", "numbers", "international"] },
  { id: "voip-did-providers", label: "DID Providers", section: "voip", sectionLabel: "VoIP", path: "/admin/did-providers", icon: Globe, keywords: ["did", "providers", "numbers", "suppliers"] },
  { id: "voip-did-inventory", label: "DID Inventory", section: "voip", sectionLabel: "VoIP", path: "/admin/did-inventory", icon: Globe, keywords: ["did", "inventory", "numbers", "stock"] },
  
  { id: "customers-customers", label: "Customers", section: "customers", sectionLabel: "Customers", path: "/admin/customers", icon: Users, keywords: ["customers", "users", "accounts", "clients"] },
  { id: "customers-categories", label: "Categories", section: "customers", sectionLabel: "Customers", path: "/admin/categories", icon: Users, keywords: ["categories", "types", "groups", "segments"] },
  { id: "customers-groups", label: "Groups", section: "customers", sectionLabel: "Customers", path: "/admin/groups", icon: Users, keywords: ["groups", "teams", "organizations"] },
  { id: "customers-kyc", label: "KYC", section: "customers", sectionLabel: "Customers", path: "/admin/kyc", icon: Shield, keywords: ["kyc", "verification", "identity", "compliance"] },
  
  { id: "billing-invoices", label: "Invoices", section: "billing", sectionLabel: "Billing", path: "/admin/invoices", icon: CreditCard, keywords: ["invoices", "billing", "payments", "charges"] },
  { id: "billing-payments", label: "Payments", section: "billing", sectionLabel: "Billing", path: "/admin/payments", icon: CreditCard, keywords: ["payments", "transactions", "receipts"] },
  { id: "billing-currencies", label: "Currencies", section: "billing", sectionLabel: "Billing", path: "/admin/currencies", icon: CreditCard, keywords: ["currencies", "forex", "exchange", "rates"] },
  { id: "billing-referrals", label: "Referrals", section: "billing", sectionLabel: "Billing", path: "/admin/referrals", icon: Users, keywords: ["referrals", "affiliate", "rewards"] },
  { id: "billing-promo-codes", label: "Promo Codes", section: "billing", sectionLabel: "Billing", path: "/admin/promo-codes", icon: CreditCard, keywords: ["promo", "codes", "discounts", "coupons"] },
  { id: "billing-bonuses", label: "Bonuses", section: "billing", sectionLabel: "Billing", path: "/admin/bonuses", icon: CreditCard, keywords: ["bonuses", "rewards", "credits"] },
  
  { id: "marketing-social-accounts", label: "Social Accounts", section: "marketing", sectionLabel: "Marketing", path: "/admin/social-accounts", icon: MessageSquare, keywords: ["social", "accounts", "facebook", "twitter", "linkedin"] },
  { id: "marketing-social-posts", label: "Social Posts", section: "marketing", sectionLabel: "Marketing", path: "/admin/social-posts", icon: MessageSquare, keywords: ["social", "posts", "content", "publishing"] },
  { id: "marketing-email-templates", label: "Email Templates", section: "marketing", sectionLabel: "Marketing", path: "/admin/email-templates", icon: FileText, keywords: ["email", "templates", "notifications", "messages"] },
  
  { id: "monitoring-metrics", label: "Metrics", section: "monitoring", sectionLabel: "Monitoring", path: "/admin/metrics", icon: BarChart3, keywords: ["metrics", "statistics", "analytics", "data"] },
  { id: "monitoring-alerts", label: "Alerts", section: "monitoring", sectionLabel: "Monitoring", path: "/admin/alerts", icon: BarChart3, keywords: ["alerts", "notifications", "warnings"] },
  { id: "monitoring-rules", label: "Monitoring Rules", section: "monitoring", sectionLabel: "Monitoring", path: "/admin/rules", icon: Settings, keywords: ["rules", "monitoring", "thresholds"] },
  
  { id: "sip-tester-run", label: "Run Tests", section: "sip-tester", sectionLabel: "SIP Tester", path: "/admin/sip-tester", icon: Phone, keywords: ["sip", "tester", "testing", "quality", "diagnostics"] },
  { id: "sip-tester-audio", label: "Audio Files", section: "sip-tester", sectionLabel: "SIP Tester", path: "/admin/sip-tester?tab=audio", icon: Phone, keywords: ["sip", "audio", "files", "ivr", "prompts"] },
  { id: "sip-tester-numbers", label: "Number Database", section: "sip-tester", sectionLabel: "SIP Tester", path: "/admin/sip-tester?tab=numbers", icon: Phone, keywords: ["sip", "numbers", "database", "crowdsourced"] },
  
  { id: "ai-voice-agents", label: "AI Voice Agents", section: "ai", sectionLabel: "AI", path: "/admin/ai-voice-agents", icon: Bot, keywords: ["ai", "voice", "agents", "assistant", "chatbot", "ivr"] },
  
  { id: "softswitch-customers", label: "Class 4 Customers", section: "softswitch", sectionLabel: "Softswitch", path: "/admin/class4-customers", icon: Users, keywords: ["class4", "softswitch", "customers", "wholesale"] },
  { id: "softswitch-carriers", label: "Class 4 Carriers", section: "softswitch", sectionLabel: "Softswitch", path: "/admin/class4-carriers", icon: Phone, keywords: ["class4", "softswitch", "carriers", "upstream"] },
  { id: "softswitch-rate-cards", label: "Class 4 Rate Cards", section: "softswitch", sectionLabel: "Softswitch", path: "/admin/class4-rate-cards", icon: CreditCard, keywords: ["class4", "softswitch", "rates", "pricing", "lcr"] },
  
  { id: "cms-pages", label: "Website Pages", section: "cms", sectionLabel: "CMS", path: "/admin/pages", icon: FileText, keywords: ["pages", "website", "content", "cms"] },
  { id: "cms-sections", label: "Website Sections", section: "cms", sectionLabel: "CMS", path: "/admin/website-sections", icon: FileText, keywords: ["sections", "website", "blocks", "components"] },
  { id: "cms-login-pages", label: "Portal Login Pages", section: "cms", sectionLabel: "CMS", path: "/admin/login-pages", icon: FileText, keywords: ["login", "portal", "branding", "customization"] },
  { id: "cms-site-settings", label: "Site Settings", section: "cms", sectionLabel: "CMS", path: "/admin/site-settings", icon: Settings, keywords: ["site", "settings", "configuration", "seo"] },
  { id: "cms-themes", label: "Themes", section: "cms", sectionLabel: "CMS", path: "/admin/themes", icon: Palette, keywords: ["themes", "design", "colors", "branding"] },
  { id: "cms-media", label: "Media Library", section: "cms", sectionLabel: "CMS", path: "/admin/media", icon: FileText, keywords: ["media", "images", "files", "uploads"] },
  { id: "cms-documentation", label: "Documentation", section: "cms", sectionLabel: "CMS", path: "/admin/documentation", icon: FileText, keywords: ["docs", "documentation", "help", "guides"] },
  
  { id: "admin-users", label: "Admin Users", section: "admin", sectionLabel: "Admin", path: "/admin/admin-users", icon: Shield, keywords: ["admin", "users", "staff", "team"] },
  { id: "admin-roles", label: "Roles & Permissions", section: "admin", sectionLabel: "Admin", path: "/admin/roles", icon: Shield, keywords: ["roles", "permissions", "access", "security"] },
  { id: "admin-audit-logs", label: "Audit Logs", section: "admin", sectionLabel: "Admin", path: "/admin/audit-logs", icon: FileText, keywords: ["audit", "logs", "history", "changes"] },
  { id: "admin-tickets", label: "Support Tickets", section: "admin", sectionLabel: "Admin", path: "/admin/tickets", icon: MessageSquare, keywords: ["tickets", "support", "help", "issues"] },
  
  { id: "settings-general", label: "General Settings", section: "settings", sectionLabel: "Settings", path: "/admin/settings/general", icon: Settings, keywords: ["settings", "general", "configuration"] },
  { id: "settings-api-keys", label: "API Keys", section: "settings", sectionLabel: "Settings", path: "/admin/settings/api-keys", icon: Settings, keywords: ["api", "keys", "integration", "tokens"] },
  { id: "settings-webhooks", label: "Webhooks", section: "settings", sectionLabel: "Settings", path: "/admin/settings/webhooks", icon: Settings, keywords: ["webhooks", "callbacks", "events"] },
  { id: "settings-integrations", label: "Integrations", section: "settings", sectionLabel: "Settings", path: "/admin/settings/integrations", icon: Settings, keywords: ["integrations", "connectors", "third-party"] },
];

export function AdminSearchResults() {
  const [, setLocation] = useLocation();
  const { setActiveSection, setActiveSubItem, openTab, closeTab } = useSuperAdminTabs();
  
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("q") || "";
  const searchTerm = query.toLowerCase().trim();
  
  const filteredItems = searchTerm
    ? allSearchItems.filter((item) => {
        const searchableText = [
          item.label.toLowerCase(),
          item.sectionLabel.toLowerCase(),
          ...item.keywords.map(k => k.toLowerCase()),
        ].join(" ");
        return searchableText.includes(searchTerm);
      })
    : [];

  const handleItemClick = (item: SearchItem) => {
    closeTab("search");
    setActiveSection(item.section);
    setActiveSubItem(item.id.split("-").slice(1).join("-"));
    openTab({
      id: item.id,
      label: item.label,
      route: item.path,
    });
    setLocation(item.path);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground mb-6">
        {filteredItems.length} results for "{query}"
      </p>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => handleItemClick(item)}
              data-testid={`search-result-${item.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.label}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.sectionLabel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No results found for "{query}"
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}
