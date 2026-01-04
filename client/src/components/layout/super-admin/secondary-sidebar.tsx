import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Server, Layers, Radio, CreditCard, Building2, Globe, Building,
  Route as RouteIcon, Users, UserPlus, Tags, Gift, Ticket,
  FileText, Palette, Image, Mail, BarChart3, Activity, Bell,
  Shield, Key, Database, History, Settings, Webhook, Cpu
} from "lucide-react";

interface NavSubItem {
  id: string;
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionConfig {
  title: string;
  items: NavSubItem[];
}

const sectionConfigs: Record<string, SectionConfig> = {
  dashboard: {
    title: "Dashboard",
    items: [
      { id: "overview", label: "Overview", route: "/admin", icon: BarChart3 },
      { id: "activity", label: "Live Activity", route: "/admin/activity", icon: Activity },
    ],
  },
  voip: {
    title: "VoIP Configuration",
    items: [
      { id: "pops", label: "POPs", route: "/admin/pops", icon: Server },
      { id: "voice-tiers", label: "Voice Tiers", route: "/admin/voice-tiers", icon: Layers },
      { id: "codecs", label: "Codecs", route: "/admin/codecs", icon: Radio },
      { id: "channel-plans", label: "Channel Plans", route: "/admin/channel-plans", icon: CreditCard },
      { id: "carriers", label: "Carriers", route: "/admin/carriers", icon: Building2 },
      { id: "routes", label: "Routes", route: "/admin/routes", icon: RouteIcon },
      { id: "did-countries", label: "DID Countries", route: "/admin/did-countries", icon: Globe },
      { id: "did-providers", label: "DID Providers", route: "/admin/did-providers", icon: Building },
    ],
  },
  customers: {
    title: "Customer Management",
    items: [
      { id: "customers", label: "Customers", route: "/admin/customers", icon: Users },
      { id: "categories", label: "Categories", route: "/admin/categories", icon: Tags },
      { id: "groups", label: "Groups", route: "/admin/groups", icon: UserPlus },
      { id: "kyc", label: "KYC Requests", route: "/admin/kyc", icon: Shield },
    ],
  },
  billing: {
    title: "Billing & Payments",
    items: [
      { id: "invoices", label: "Invoices", route: "/admin/invoices", icon: FileText },
      { id: "payments", label: "Payments", route: "/admin/payments", icon: CreditCard },
      { id: "referrals", label: "Referrals", route: "/admin/referrals", icon: Users },
      { id: "promo-codes", label: "Promo Codes", route: "/admin/promo-codes", icon: Gift },
      { id: "bonuses", label: "Bonuses", route: "/admin/bonuses", icon: Gift },
    ],
  },
  marketing: {
    title: "Marketing",
    items: [
      { id: "social-accounts", label: "Social Accounts", route: "/admin/social-accounts", icon: Users },
      { id: "social-posts", label: "Social Posts", route: "/admin/social-posts", icon: FileText },
      { id: "email-templates", label: "Email Templates", route: "/admin/email-templates", icon: Mail },
    ],
  },
  monitoring: {
    title: "Monitoring & Alerts",
    items: [
      { id: "metrics", label: "Metrics", route: "/admin/metrics", icon: BarChart3 },
      { id: "alerts", label: "Alerts", route: "/admin/alerts", icon: Bell },
      { id: "rules", label: "Rules", route: "/admin/rules", icon: Settings },
      { id: "sip-tester", label: "SIP Tester", route: "/admin/sip-tester", icon: Cpu },
    ],
  },
  cms: {
    title: "CMS & Branding",
    items: [
      { id: "pages", label: "Pages", route: "/admin/pages", icon: FileText },
      { id: "themes", label: "Themes", route: "/admin/themes", icon: Palette },
      { id: "media", label: "Media Library", route: "/admin/media", icon: Image },
    ],
  },
  admin: {
    title: "Administration",
    items: [
      { id: "admin-users", label: "Admin Users", route: "/admin/admin-users", icon: Users },
      { id: "roles", label: "Roles", route: "/admin/roles", icon: Shield },
      { id: "audit-logs", label: "Audit Logs", route: "/admin/audit-logs", icon: History },
      { id: "tickets", label: "Support Tickets", route: "/admin/tickets", icon: Ticket },
    ],
  },
  settings: {
    title: "Settings",
    items: [
      { id: "general", label: "General", route: "/admin/settings/general", icon: Settings },
      { id: "api-keys", label: "API Keys", route: "/admin/settings/api-keys", icon: Key },
      { id: "webhooks", label: "Webhooks", route: "/admin/settings/webhooks", icon: Webhook },
      { id: "integrations", label: "Integrations", route: "/admin/settings/integrations", icon: Database },
    ],
  },
};

export function SecondarySidebar() {
  const [, setLocation] = useLocation();
  const { activeSection, activeSubItem, setActiveSubItem, openTab } = useSuperAdminTabs();

  if (!activeSection || activeSection === "dashboard") {
    return null;
  }

  const config = sectionConfigs[activeSection];
  if (!config) return null;

  const handleItemClick = (item: NavSubItem) => {
    setActiveSubItem(item.id);
    const tab: WorkspaceTab = {
      id: item.id,
      label: item.label,
      route: item.route,
    };
    openTab(tab);
    setLocation(item.route);
  };

  return (
    <div className="flex flex-col h-full w-48 border-r bg-sidebar shrink-0">
      <div className="flex h-12 items-center px-4 border-b">
        <span className="font-semibold text-sm text-sidebar-foreground">{config.title}</span>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="py-2 px-2 space-y-0.5">
          {config.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubItem === item.id;
            
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
