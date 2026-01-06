import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { useCustomerPortalStore } from "@/stores/customer-portal-tabs";
import { 
  LayoutDashboard, TrendingUp, Phone, Route, BarChart3,
  Globe, Search, FileCheck, CreditCard, Receipt, 
  History, Download, HelpCircle, MessageSquare, BookOpen,
  Settings, User, Shield, Bell, Headphones, Users as UsersIcon,
  PhoneCall, Bot, Mic, Workflow, Database, Gift, ListOrdered,
  Zap, Clock, Key, Webhook, Network, FileSpreadsheet, 
  TrendingDown, Calculator, Tag, Palette
} from "lucide-react";

interface SearchItem {
  id: string;
  label: string;
  section: string;
  sectionLabel: string;
  path: string;
  icon: typeof LayoutDashboard;
  keywords?: string[];
}

const allSearchItems: SearchItem[] = [
  { id: "dashboard-overview", label: "Overview", section: "dashboard", sectionLabel: "Dashboard", path: "/portal", icon: LayoutDashboard, keywords: ["home", "main", "dashboard"] },
  { id: "dashboard-usage", label: "Usage Stats", section: "dashboard", sectionLabel: "Dashboard", path: "/portal/usage", icon: TrendingUp, keywords: ["statistics", "analytics", "metrics"] },
  
  { id: "voice-rates", label: "Rates", section: "voice", sectionLabel: "Voice Termination", path: "/portal/voice/rates", icon: Phone, keywords: ["pricing", "cost", "termination"] },
  { id: "voice-routes", label: "My Routes", section: "voice", sectionLabel: "Voice Termination", path: "/portal/voice/routes", icon: Route, keywords: ["routing", "destinations"] },
  { id: "voice-usage", label: "Voice Usage", section: "voice", sectionLabel: "Voice Termination", path: "/portal/voice/usage", icon: BarChart3, keywords: ["minutes", "calls", "statistics"] },
  
  { id: "dids-inventory", label: "My DIDs", section: "dids", sectionLabel: "DIDs", path: "/portal/dids", icon: Globe, keywords: ["did", "numbers", "phone numbers", "inventory", "telephone"] },
  { id: "dids-search", label: "Search DIDs", section: "dids", sectionLabel: "DIDs", path: "/portal/dids/search", icon: Search, keywords: ["did", "find", "buy", "purchase", "order"] },
  { id: "dids-kyc", label: "KYC Documents", section: "dids", sectionLabel: "DIDs", path: "/portal/dids/kyc", icon: FileCheck, keywords: ["did", "verification", "identity", "compliance", "document"] },
  
  { id: "pbx-extensions", label: "Extensions", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/extensions", icon: Headphones, keywords: ["users", "phones", "sip"] },
  { id: "pbx-ring-groups", label: "Ring Groups", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/ring-groups", icon: UsersIcon, keywords: ["hunt groups", "simultaneous"] },
  { id: "pbx-ivr", label: "IVR", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/ivr", icon: PhoneCall, keywords: ["auto attendant", "menu", "interactive voice"] },
  { id: "pbx-queues", label: "Queues", section: "pbx", sectionLabel: "Cloud PBX", path: "/portal/pbx/queues", icon: ListOrdered, keywords: ["call queue", "waiting", "agents"] },
  
  { id: "ai-agents", label: "My Agents", section: "ai-agent", sectionLabel: "AI Voice Agent", path: "/portal/ai-agent", icon: Bot, keywords: ["ai", "virtual", "assistant"] },
  { id: "ai-personas", label: "Personas", section: "ai-agent", sectionLabel: "AI Voice Agent", path: "/portal/ai-agent/personas", icon: Mic, keywords: ["voice", "personality", "character"] },
  { id: "ai-flows", label: "Flows", section: "ai-agent", sectionLabel: "AI Voice Agent", path: "/portal/ai-agent/flows", icon: Workflow, keywords: ["conversation", "script", "dialog"] },
  { id: "ai-training", label: "Training Data", section: "ai-agent", sectionLabel: "AI Voice Agent", path: "/portal/ai-agent/training", icon: Database, keywords: ["knowledge", "learn", "data"] },
  
  { id: "sip-quick-test", label: "Quick Test", section: "sip-tester", sectionLabel: "SIP Tester", path: "/portal/sip-tester", icon: Zap, keywords: ["test", "diagnose", "check"] },
  { id: "sip-configs", label: "Saved Configs", section: "sip-tester", sectionLabel: "SIP Tester", path: "/portal/sip-tester/configs", icon: Settings, keywords: ["presets", "saved"] },
  { id: "sip-results", label: "Test Results", section: "sip-tester", sectionLabel: "SIP Tester", path: "/portal/sip-tester/results", icon: BarChart3, keywords: ["history", "reports"] },
  { id: "sip-schedules", label: "Schedules", section: "sip-tester", sectionLabel: "SIP Tester", path: "/portal/sip-tester/schedules", icon: Clock, keywords: ["automated", "recurring"] },
  
  { id: "class4-overview", label: "Class 4 Overview", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4", icon: Network, keywords: ["softswitch", "carrier"] },
  { id: "class4-rate-cards", label: "Rate Cards", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4/rate-cards", icon: FileSpreadsheet, keywords: ["pricing", "rates"] },
  { id: "class4-lcr", label: "LCR Rules", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4/lcr", icon: TrendingDown, keywords: ["least cost routing", "optimization"] },
  { id: "class4-margins", label: "Margin Analysis", section: "class4", sectionLabel: "Class 4 Softswitch", path: "/portal/class4/margins", icon: Calculator, keywords: ["profit", "revenue"] },
  
  { id: "dev-api-keys", label: "API Keys", section: "developers", sectionLabel: "Developers", path: "/portal/developers/api-keys", icon: Key, keywords: ["tokens", "authentication", "access"] },
  { id: "dev-webhooks", label: "Webhooks", section: "developers", sectionLabel: "Developers", path: "/portal/developers/webhooks", icon: Webhook, keywords: ["callbacks", "events", "notifications"] },
  
  { id: "billing-balance", label: "Balance", section: "billing", sectionLabel: "Billing", path: "/portal/billing", icon: CreditCard, keywords: ["funds", "credit", "prepaid"] },
  { id: "billing-invoices", label: "Invoices", section: "billing", sectionLabel: "Billing", path: "/portal/billing/invoices", icon: Receipt, keywords: ["bills", "statements"] },
  { id: "billing-transactions", label: "Transactions", section: "billing", sectionLabel: "Billing", path: "/portal/billing/transactions", icon: History, keywords: ["payments", "history"] },
  { id: "billing-referrals", label: "Referrals", section: "billing", sectionLabel: "Billing", path: "/portal/billing/referrals", icon: Gift, keywords: ["invite", "earn", "rewards"] },
  { id: "billing-promo", label: "Promo Codes", section: "billing", sectionLabel: "Billing", path: "/portal/billing/promo", icon: Tag, keywords: ["discount", "coupon"] },
  { id: "billing-export", label: "Export CDRs", section: "billing", sectionLabel: "Billing", path: "/portal/billing/export", icon: Download, keywords: ["download", "records", "call detail"] },
  
  { id: "support-tickets", label: "My Tickets", section: "support", sectionLabel: "Support", path: "/portal/support", icon: MessageSquare, keywords: ["help", "issues", "requests"] },
  { id: "support-new-ticket", label: "New Ticket", section: "support", sectionLabel: "Support", path: "/portal/support/new", icon: HelpCircle, keywords: ["create", "submit", "report"] },
  { id: "support-kb", label: "Knowledge Base", section: "support", sectionLabel: "Support", path: "/portal/support/kb", icon: BookOpen, keywords: ["docs", "faq", "articles"] },
  
  { id: "settings-profile", label: "Profile", section: "settings", sectionLabel: "Settings", path: "/portal/settings", icon: User, keywords: ["account", "personal"] },
  { id: "settings-branding", label: "My Branding", section: "settings", sectionLabel: "Settings", path: "/portal/settings/branding", icon: Palette, keywords: ["white label", "logo", "colors"] },
  { id: "settings-security", label: "Security", section: "settings", sectionLabel: "Settings", path: "/portal/settings/security", icon: Shield, keywords: ["password", "2fa", "authentication"] },
  { id: "settings-notifications", label: "Notifications", section: "settings", sectionLabel: "Settings", path: "/portal/settings/notifications", icon: Bell, keywords: ["alerts", "email", "preferences"] },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const { setActiveSection, setActiveSubItem, openTab } = useCustomerPortalStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    allSearchItems.forEach((item) => {
      if (!groups[item.sectionLabel]) {
        groups[item.sectionLabel] = [];
      }
      groups[item.sectionLabel].push(item);
    });
    return groups;
  }, []);

  const handleSelect = (item: SearchItem) => {
    setActiveSection(item.section);
    setActiveSubItem(item.id.split("-").slice(1).join("-"));
    openTab({
      id: item.id,
      label: item.label,
      route: item.path,
    });
    setLocation(item.path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search all features, modules, and pages..." data-testid="command-search-input" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedItems).map(([sectionLabel, items], idx) => (
          <div key={sectionLabel}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={sectionLabel}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.id} ${item.label} ${item.sectionLabel} ${item.keywords?.join(" ") || ""}`}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                    data-testid={`search-result-${item.id}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
