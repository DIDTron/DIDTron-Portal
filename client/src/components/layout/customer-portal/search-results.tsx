import { useLocation } from "wouter";
import { useCustomerPortalStore } from "@/stores/customer-portal-tabs";
import { 
  LayoutDashboard, Phone, Globe, Headphones, Bot, TestTube, Network, 
  CreditCard, Settings, HelpCircle, Code, Route, BarChart3, Search,
  FileCheck, UsersIcon, PhoneCall, Voicemail, Mic, MessageSquare,
  Users, Building2, FileSpreadsheet, TrendingDown, Calculator,
  Key, Webhook, Receipt, History, Gift, Tag, Download, BookOpen,
  User, Palette, Shield, Bell
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface SearchItem {
  id: string;
  label: string;
  section: string;
  sectionLabel: string;
  path: string;
  icon: LucideIcon;
  keywords?: string[];
}

const allSearchItems: SearchItem[] = [
  { id: "dashboard", label: "Dashboard", section: "dashboard", sectionLabel: "Dashboard", path: "/portal", icon: LayoutDashboard, keywords: ["home", "overview", "main"] },
  
  { id: "voice-rates", label: "Rates", section: "voice", sectionLabel: "Voice Termination", path: "/portal/voice/rates", icon: Phone, keywords: ["pricing", "cost", "termination", "voice"] },
  { id: "voice-routes", label: "My Routes", section: "voice", sectionLabel: "Voice Termination", path: "/portal/voice/routes", icon: Route, keywords: ["routing", "destinations", "voice"] },
  { id: "voice-usage", label: "Voice Usage", section: "voice", sectionLabel: "Voice Termination", path: "/portal/voice/usage", icon: BarChart3, keywords: ["minutes", "calls", "statistics", "voice"] },
  
  { id: "dids-inventory", label: "My DIDs", section: "dids", sectionLabel: "DIDs", path: "/portal/dids", icon: Globe, keywords: ["did", "dids", "numbers", "phone numbers", "inventory", "telephone"] },
  { id: "dids-search", label: "Search DIDs", section: "dids", sectionLabel: "DIDs", path: "/portal/dids/search", icon: Search, keywords: ["did", "dids", "find", "buy", "purchase", "order"] },
  { id: "dids-kyc", label: "KYC Documents", section: "dids", sectionLabel: "DIDs", path: "/portal/dids/kyc", icon: FileCheck, keywords: ["did", "dids", "verification", "identity", "compliance", "document"] },
  
  { id: "pbx-extensions", label: "Extensions", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/extensions", icon: Headphones, keywords: ["users", "phones", "sip", "pbx"] },
  { id: "pbx-ring-groups", label: "Ring Groups", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/ring-groups", icon: UsersIcon, keywords: ["hunt groups", "simultaneous", "pbx"] },
  { id: "pbx-ivr", label: "IVR", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/ivr", icon: PhoneCall, keywords: ["ivr", "auto attendant", "menu", "interactive voice", "pbx"] },
  { id: "pbx-voicemail", label: "Voicemail", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/voicemail", icon: Voicemail, keywords: ["messages", "recordings", "pbx"] },
  { id: "pbx-recordings", label: "Call Recordings", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/recordings", icon: Mic, keywords: ["audio", "calls", "pbx"] },
  { id: "pbx-queues", label: "Queues", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/queues", icon: Users, keywords: ["call center", "agents", "pbx"] },
  
  { id: "ai-personas", label: "Personas", section: "ai-agent", sectionLabel: "AI Agent", path: "/portal/ai-agent/personas", icon: Bot, keywords: ["ai", "assistant", "character"] },
  { id: "ai-flows", label: "Flows", section: "ai-agent", sectionLabel: "AI Agent", path: "/portal/ai-agent/flows", icon: Route, keywords: ["ai", "workflow", "conversation"] },
  { id: "ai-training", label: "Training Data", section: "ai-agent", sectionLabel: "AI Agent", path: "/portal/ai-agent/training", icon: MessageSquare, keywords: ["ai", "knowledge", "learning"] },
  { id: "ai-campaigns", label: "Outbound Campaigns", section: "ai-agent", sectionLabel: "AI Agent", path: "/portal/ai-agent/campaigns", icon: Phone, keywords: ["ai", "dialer", "outreach"] },
  
  { id: "sip-tester-quality", label: "Quality Tests", section: "sip-tester", sectionLabel: "SIP Tester", path: "/portal/sip-tester/quality", icon: TestTube, keywords: ["sip", "mos", "audio quality"] },
  { id: "sip-tester-pdd", label: "PDD Tests", section: "sip-tester", sectionLabel: "SIP Tester", path: "/portal/sip-tester/pdd", icon: BarChart3, keywords: ["sip", "post dial delay", "latency"] },
  { id: "sip-tester-capacity", label: "Capacity Tests", section: "sip-tester", sectionLabel: "SIP Tester", path: "/portal/sip-tester/capacity", icon: Building2, keywords: ["sip", "load", "stress", "concurrent"] },
  
  { id: "class4-overview", label: "Class 4 Overview", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4", icon: Network, keywords: ["softswitch", "carrier", "class4"] },
  { id: "class4-rate-cards", label: "Rate Cards", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4/rate-cards", icon: FileSpreadsheet, keywords: ["pricing", "rates", "class4"] },
  { id: "class4-lcr", label: "LCR Rules", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4/lcr", icon: TrendingDown, keywords: ["least cost routing", "optimization", "class4"] },
  { id: "class4-margins", label: "Margin Analysis", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4/margins", icon: Calculator, keywords: ["profit", "revenue", "class4"] },
  
  { id: "dev-api-keys", label: "API Keys", section: "developers", sectionLabel: "Developers", path: "/portal/developers/api-keys", icon: Key, keywords: ["tokens", "authentication", "access", "api"] },
  { id: "dev-webhooks", label: "Webhooks", section: "developers", sectionLabel: "Developers", path: "/portal/developers/webhooks", icon: Webhook, keywords: ["callbacks", "events", "notifications", "api"] },
  
  { id: "billing-balance", label: "Balance", section: "billing", sectionLabel: "Billing", path: "/portal/billing", icon: CreditCard, keywords: ["funds", "credit", "prepaid", "billing"] },
  { id: "billing-invoices", label: "Invoices", section: "billing", sectionLabel: "Billing", path: "/portal/billing/invoices", icon: Receipt, keywords: ["bills", "statements", "billing"] },
  { id: "billing-transactions", label: "Transactions", section: "billing", sectionLabel: "Billing", path: "/portal/billing/transactions", icon: History, keywords: ["payments", "history", "billing"] },
  { id: "billing-referrals", label: "Referrals", section: "billing", sectionLabel: "Billing", path: "/portal/billing/referrals", icon: Gift, keywords: ["invite", "earn", "rewards", "billing"] },
  { id: "billing-promo", label: "Promo Codes", section: "billing", sectionLabel: "Billing", path: "/portal/billing/promo", icon: Tag, keywords: ["discount", "coupon", "billing"] },
  { id: "billing-export", label: "Export CDRs", section: "billing", sectionLabel: "Billing", path: "/portal/billing/export", icon: Download, keywords: ["download", "records", "call detail", "billing"] },
  
  { id: "support-tickets", label: "My Tickets", section: "support", sectionLabel: "Support", path: "/portal/support", icon: MessageSquare, keywords: ["help", "issues", "requests", "support"] },
  { id: "support-new-ticket", label: "New Ticket", section: "support", sectionLabel: "Support", path: "/portal/support/new", icon: HelpCircle, keywords: ["create", "submit", "report", "support"] },
  { id: "support-kb", label: "Knowledge Base", section: "support", sectionLabel: "Support", path: "/portal/support/kb", icon: BookOpen, keywords: ["docs", "faq", "articles", "support"] },
  
  { id: "settings-profile", label: "Profile", section: "settings", sectionLabel: "Settings", path: "/portal/settings", icon: User, keywords: ["account", "personal", "settings"] },
  { id: "settings-branding", label: "My Branding", section: "settings", sectionLabel: "Settings", path: "/portal/settings/branding", icon: Palette, keywords: ["white label", "logo", "colors", "settings"] },
  { id: "settings-security", label: "Security", section: "settings", sectionLabel: "Settings", path: "/portal/settings/security", icon: Shield, keywords: ["password", "2fa", "authentication", "settings"] },
  { id: "settings-notifications", label: "Notifications", section: "settings", sectionLabel: "Settings", path: "/portal/settings/notifications", icon: Bell, keywords: ["alerts", "email", "preferences", "settings"] },
  
  { id: "reports-ivr-stats", label: "IVR Stats", section: "reports", sectionLabel: "Reports", path: "/portal/reports/ivr-stats", icon: BarChart3, keywords: ["ivr", "statistics", "analytics", "reports"] },
];

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [, setLocation] = useLocation();
  const { setActiveSection, setActiveSubItem, openTab, closeTab } = useCustomerPortalStore();
  
  const searchTerm = query.toLowerCase().trim();
  
  const filteredItems = searchTerm
    ? allSearchItems.filter((item) => {
        const searchableText = [
          item.id,
          item.label,
          item.sectionLabel,
          ...(item.keywords || [])
        ].join(" ").toLowerCase();
        return searchableText.includes(searchTerm);
      })
    : [];

  const handleSelect = (item: SearchItem) => {
    closeTab("search");
    setActiveSection(item.section);
    setActiveSubItem(item.id.split("-").slice(1).join("-") || item.id);
    openTab({
      id: item.id,
      label: item.label,
      route: item.path,
    });
    setLocation(item.path);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Search Results</h2>
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for "{query}"
        </p>
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found for "{query}"</p>
          <p className="text-sm mt-2">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="cursor-pointer hover-elevate transition-all"
                onClick={() => handleSelect(item)}
                data-testid={`search-result-card-${item.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.label}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.sectionLabel}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-xs">
                      MODULE
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { allSearchItems };
export type { SearchItem };
