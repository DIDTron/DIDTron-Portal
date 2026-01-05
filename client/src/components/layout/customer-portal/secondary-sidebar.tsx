import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, TrendingUp, Phone, Route, BarChart3,
  Globe, Search, FileCheck, CreditCard, Receipt, 
  History, Download, HelpCircle, MessageSquare, BookOpen,
  Settings, User, Shield, Bell, Headphones, Users as UsersIcon,
  PhoneCall, Bot, Mic, Workflow, Database, Gift, Palette
} from "lucide-react";

interface SecondarySidebarProps {
  activeSection: string;
  activeSubItem: string;
  onSubItemChange: (item: string) => void;
}

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
  billing: {
    title: "Billing",
    items: [
      { id: "balance", label: "Balance", icon: CreditCard, path: "/portal/billing" },
      { id: "invoices", label: "Invoices", icon: Receipt, path: "/portal/billing/invoices" },
      { id: "transactions", label: "Transactions", icon: History, path: "/portal/billing/transactions" },
      { id: "referrals", label: "Referrals", icon: Gift, path: "/portal/billing/referrals" },
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
      { id: "branding", label: "Branding", icon: Palette, path: "/portal/settings/branding" },
      { id: "security", label: "Security", icon: Shield, path: "/portal/settings/security" },
      { id: "notifications", label: "Notifications", icon: Bell, path: "/portal/settings/notifications" },
    ],
  },
};

export function CustomerSecondarySidebar({ activeSection, activeSubItem, onSubItemChange }: SecondarySidebarProps) {
  const [location] = useLocation();
  const menu = sectionMenus[activeSection];

  if (!menu) return null;

  return (
    <div className="w-56 bg-sidebar border-r flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm">{menu.title}</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {menu.items.map((item) => {
            const isActive = location === item.path || activeSubItem === item.id;
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${isActive ? "bg-sidebar-accent" : ""}`}
                  onClick={() => onSubItemChange(item.id)}
                  data-testid={`nav-${item.id}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
