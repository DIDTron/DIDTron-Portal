import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCustomerPortalStore } from "@/stores/customer-portal-tabs";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, TrendingUp, Phone, Route, BarChart3,
  Globe, Search, FileCheck, CreditCard, Receipt, 
  History, Download, HelpCircle, MessageSquare, BookOpen,
  Settings, User, Shield, Bell, Headphones, Users as UsersIcon,
  PhoneCall, Bot, Mic, Workflow, Database, Gift, ListOrdered,
  Zap, Clock, Key, Webhook, Network, FileSpreadsheet, 
  TrendingDown, Calculator, Tag, Palette, Menu
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
}

const sectionMenus: Record<string, { title: string; items: SidebarItem[] }> = {
  dashboard: {
    title: "Dashboard",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/portal" },
      { id: "usage", label: "Usage Stats", icon: TrendingUp, path: "/portal/usage" },
    ],
  },
  voice: {
    title: "Voice Termination",
    items: [
      { id: "rates", label: "Rates", icon: Phone, path: "/portal/voice/rates" },
      { id: "routes", label: "My Routes", icon: Route, path: "/portal/voice/routes" },
      { id: "usage", label: "Usage", icon: BarChart3, path: "/portal/voice/usage" },
    ],
  },
  dids: {
    title: "DIDs",
    items: [
      { id: "inventory", label: "My DIDs", icon: Globe, path: "/portal/dids" },
      { id: "search", label: "Search DIDs", icon: Search, path: "/portal/dids/search" },
      { id: "kyc", label: "KYC Documents", icon: FileCheck, path: "/portal/dids/kyc" },
    ],
  },
  pbx: {
    title: "Cloud PBX",
    items: [
      { id: "extensions", label: "Extensions", icon: Headphones, path: "/portal/pbx/extensions" },
      { id: "ring-groups", label: "Ring Groups", icon: UsersIcon, path: "/portal/pbx/ring-groups" },
      { id: "ivr", label: "IVR", icon: PhoneCall, path: "/portal/pbx/ivr" },
      { id: "queues", label: "Queues", icon: ListOrdered, path: "/portal/pbx/queues" },
    ],
  },
  "ai-agent": {
    title: "AI Voice Agent",
    items: [
      { id: "agents", label: "My Agents", icon: Bot, path: "/portal/ai-agent" },
      { id: "personas", label: "Personas", icon: Mic, path: "/portal/ai-agent/personas" },
      { id: "flows", label: "Flows", icon: Workflow, path: "/portal/ai-agent/flows" },
      { id: "training", label: "Training Data", icon: Database, path: "/portal/ai-agent/training" },
    ],
  },
  "sip-tester": {
    title: "SIP Tester",
    items: [
      { id: "quick-test", label: "Quick Test", icon: Zap, path: "/portal/sip-tester" },
      { id: "configs", label: "Saved Configs", icon: Settings, path: "/portal/sip-tester/configs" },
      { id: "results", label: "Results", icon: BarChart3, path: "/portal/sip-tester/results" },
      { id: "schedules", label: "Schedules", icon: Clock, path: "/portal/sip-tester/schedules" },
    ],
  },
  developers: {
    title: "Developers",
    items: [
      { id: "api-keys", label: "API Keys", icon: Key, path: "/portal/developers/api-keys" },
      { id: "webhooks", label: "Webhooks", icon: Webhook, path: "/portal/developers/webhooks" },
    ],
  },
  class4: {
    title: "Class 4 Softswitch",
    items: [
      { id: "overview", label: "Overview", icon: Network, path: "/portal/class4" },
      { id: "rate-cards", label: "Rate Cards", icon: FileSpreadsheet, path: "/portal/class4/rate-cards" },
      { id: "lcr", label: "LCR Rules", icon: TrendingDown, path: "/portal/class4/lcr" },
      { id: "margins", label: "Margin Analysis", icon: Calculator, path: "/portal/class4/margins" },
    ],
  },
  billing: {
    title: "Billing",
    items: [
      { id: "balance", label: "Balance", icon: CreditCard, path: "/portal/billing" },
      { id: "invoices", label: "Invoices", icon: Receipt, path: "/portal/billing/invoices" },
      { id: "transactions", label: "Transactions", icon: History, path: "/portal/billing/transactions" },
      { id: "referrals", label: "Referrals", icon: Gift, path: "/portal/billing/referrals" },
      { id: "promo", label: "Promo Codes", icon: Tag, path: "/portal/billing/promo" },
      { id: "export", label: "Export CDRs", icon: Download, path: "/portal/billing/export" },
    ],
  },
  support: {
    title: "Support",
    items: [
      { id: "tickets", label: "My Tickets", icon: MessageSquare, path: "/portal/support" },
      { id: "new-ticket", label: "New Ticket", icon: HelpCircle, path: "/portal/support/new" },
      { id: "kb", label: "Knowledge Base", icon: BookOpen, path: "/portal/support/kb" },
    ],
  },
  settings: {
    title: "Settings",
    items: [
      { id: "profile", label: "Profile", icon: User, path: "/portal/settings" },
      { id: "branding", label: "My Branding", icon: Palette, path: "/portal/settings/branding" },
      { id: "security", label: "Security", icon: Shield, path: "/portal/settings/security" },
      { id: "notifications", label: "Notifications", icon: Bell, path: "/portal/settings/notifications" },
    ],
  },
};

export function CustomerSecondarySidebar() {
  const [location, setLocation] = useLocation();
  const { 
    activeSection, 
    activeSubItem, 
    setActiveSubItem,
    secondarySidebarOpen,
    toggleSecondarySidebar,
    openTab
  } = useCustomerPortalStore();

  if (!secondarySidebarOpen) {
    return null;
  }

  if (activeSection === "dashboard") {
    return null;
  }

  const menu = sectionMenus[activeSection];
  if (!menu) return null;

  const handleItemClick = (item: SidebarItem) => {
    setActiveSubItem(item.id);
    openTab({
      id: `${activeSection}-${item.id}`,
      label: item.label,
      route: item.path,
    });
    setLocation(item.path);
  };

  return (
    <div className="flex flex-col h-full w-48 border-r bg-sidebar shrink-0">
      <div className="flex h-12 items-center gap-2 px-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSecondarySidebar}
          className="shrink-0"
          data-testid="toggle-secondary-sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm text-sidebar-foreground truncate">{menu.title}</span>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="py-2 px-2 space-y-0.5">
          {menu.items.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || activeSubItem === item.id;
            
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer hover-elevate",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                )}
                data-testid={`nav-item-${item.id}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
