import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, GripVertical } from "lucide-react";
import {
  Server, Layers, Radio, CreditCard, Building2, Globe, Building,
  Route as RouteIcon, Users, UserPlus, Tags, Gift, Ticket,
  FileText, Palette, Image, Mail, BarChart3, Activity, Bell,
  Shield, Key, Database, History, Settings, Webhook, Cpu, BookOpen,
  Bot, Phone, PhoneOutgoing, Network, Cog, Link2, Languages, DollarSign, ListTodo,
  LayoutDashboard, Megaphone, Trash2, FlaskConical, TestTube2
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";

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
      { id: "routes", label: "Routes", route: "/admin/routes", icon: RouteIcon },
    ],
  },
  carriers: {
    title: "Carriers",
    items: [
      { id: "carriers", label: "Carriers", route: "/admin/carriers", icon: Building2 },
    ],
  },
  "rate-cards": {
    title: "Rate Cards",
    items: [
      { id: "customer-rates", label: "Customer Rates", route: "/admin/rate-cards/customer", icon: Users },
      { id: "carrier-rates", label: "Carrier Rates", route: "/admin/rate-cards/carrier", icon: Building2 },
    ],
  },
  did: {
    title: "DID Management",
    items: [
      { id: "did-countries", label: "DID Countries", route: "/admin/did-countries", icon: Globe },
      { id: "did-providers", label: "DID Providers", route: "/admin/did-providers", icon: Building },
      { id: "did-inventory", label: "DID Inventory", route: "/admin/did-inventory", icon: Phone },
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
      { id: "currencies", label: "Currencies", route: "/admin/currencies", icon: Globe },
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
      { id: "cdrs", label: "CDRs", route: "/admin/cdrs", icon: Phone },
      { id: "alerts", label: "Alerts", route: "/admin/alerts", icon: Bell },
      { id: "rules", label: "Rules", route: "/admin/rules", icon: Settings },
    ],
  },
  "sip-tester": {
    title: "SIP Tester",
    items: [
      { id: "sip-new-test", label: "New Test", route: "/admin/sip-tester/new", icon: Cpu },
      { id: "sip-history", label: "History", route: "/admin/sip-tester/history", icon: History },
      { id: "sip-settings", label: "Settings", route: "/admin/sip-tester/settings", icon: Settings },
    ],
  },
  "ai-voice": {
    title: "AI Voice",
    items: [
      { id: "ai-voice-dashboard", label: "Dashboard", route: "/admin/ai-voice/dashboard", icon: LayoutDashboard },
      { id: "ai-voice-agents", label: "Agents", route: "/admin/ai-voice/agents", icon: Bot },
      { id: "ai-voice-knowledge-bases", label: "Knowledge Bases", route: "/admin/ai-voice/knowledge-bases", icon: Database },
      { id: "ai-voice-campaigns", label: "Campaigns", route: "/admin/ai-voice/campaigns", icon: Megaphone },
      { id: "ai-voice-call-logs", label: "Call Logs", route: "/admin/ai-voice/call-logs", icon: Phone },
      { id: "ai-voice-analytics", label: "Analytics", route: "/admin/ai-voice/analytics", icon: BarChart3 },
      { id: "ai-voice-billing", label: "Billing", route: "/admin/ai-voice/billing", icon: CreditCard },
      { id: "ai-voice-settings", label: "Settings", route: "/admin/ai-voice/settings", icon: Settings },
    ],
  },
  softswitch: {
    title: "Class 4 Softswitch",
    items: [
      { id: "class4-customers", label: "Customers", route: "/admin/class4-customers", icon: Users },
      { id: "class4-carriers", label: "Carriers", route: "/admin/class4-carriers", icon: Building2 },
      { id: "class4-rate-cards", label: "Rate Cards", route: "/admin/class4-rate-cards", icon: CreditCard },
    ],
  },
  "experience-manager": {
    title: "Experience Manager",
    items: [
      { id: "em-dashboard", label: "Dashboard", route: "/admin/experience-manager", icon: LayoutDashboard },
      { id: "em-marketing", label: "Marketing Website", route: "/admin/experience-manager/marketing", icon: Globe },
      { id: "em-portal-themes", label: "Portal Themes", route: "/admin/experience-manager/portal-themes", icon: Palette },
      { id: "em-white-label", label: "White-Label", route: "/admin/experience-manager/white-label", icon: Building2 },
      { id: "em-design-system", label: "Design System", route: "/admin/experience-manager/design-system", icon: Settings },
      { id: "em-documentation", label: "Documentation", route: "/admin/documentation", icon: BookOpen },
    ],
  },
  admin: {
    title: "Administration",
    items: [
      { id: "admin-users", label: "Admin Users", route: "/admin/admin-users", icon: Users },
      { id: "roles", label: "Roles", route: "/admin/roles", icon: Shield },
      { id: "audit-logs", label: "Audit Logs", route: "/admin/audit-logs", icon: History },
      { id: "trash", label: "Trash", route: "/admin/trash", icon: Trash2 },
      { id: "tickets", label: "Support Tickets", route: "/admin/tickets", icon: Ticket },
      { id: "job-queue", label: "Job Queue", route: "/admin/job-queue", icon: ListTodo },
      { id: "dev-tests", label: "Dev Tests", route: "/admin/dev-tests", icon: FlaskConical },
      { id: "testing-engine", label: "Testing Engine", route: "/admin/testing-engine", icon: TestTube2 },
    ],
  },
  "global-settings": {
    title: "Global Settings",
    items: [
      { id: "global-platform", label: "Platform", route: "/admin/global-settings/platform", icon: Cog },
      { id: "global-currencies", label: "Currencies", route: "/admin/global-settings/currencies", icon: DollarSign },
      { id: "global-localization", label: "Localization", route: "/admin/global-settings/localization", icon: Languages },
      { id: "global-az-database", label: "A-Z Database", route: "/admin/global-settings/az-database", icon: Database },
    ],
  },
  settings: {
    title: "Settings",
    items: [
      { id: "general", label: "General", route: "/admin/settings/general", icon: Settings },
      { id: "api-keys", label: "API Keys", route: "/admin/settings/api-keys", icon: Key },
      { id: "webhooks", label: "Webhooks", route: "/admin/settings/webhooks", icon: Webhook },
      { id: "integrations", label: "Integrations", route: "/admin/settings/integrations", icon: Database },
      { id: "connexcs-status", label: "ConnexCS Status", route: "/admin/settings/connexcs-status", icon: Server },
    ],
  },
};

interface SortableSubItemProps {
  item: NavSubItem;
  isActive: boolean;
  onClick: () => void;
}

function SortableSubItem({ item, isActive, onClick }: SortableSubItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1 px-2 py-2 rounded-md text-sm cursor-pointer group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover-elevate"
      )}
      data-testid={`nav-item-${item.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 transition-opacity"
        data-testid={`drag-handle-item-${item.id}`}
      >
        <GripVertical className="h-3 w-3" />
      </div>
      <div className="flex items-center gap-2 flex-1" onClick={onClick}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </div>
    </div>
  );
}

export function SecondarySidebar() {
  const [, setLocation] = useLocation();
  const { 
    activeSection, 
    activeSubItem, 
    setActiveSubItem, 
    openTab,
    secondarySidebarOpen,
    toggleSecondarySidebar,
    sectionItemOrder,
    setSectionItemOrder
  } = useSuperAdminTabs();

  const config = activeSection ? sectionConfigs[activeSection] : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const orderedItems = useMemo(() => {
    if (!config || !activeSection) return [];
    const savedOrder = sectionItemOrder[activeSection];
    if (!savedOrder || savedOrder.length === 0) {
      return config.items;
    }
    const itemMap = new Map(config.items.map(i => [i.id, i]));
    const ordered: NavSubItem[] = [];
    for (const id of savedOrder) {
      const item = itemMap.get(id);
      if (item) {
        ordered.push(item);
        itemMap.delete(id);
      }
    }
    Array.from(itemMap.values()).forEach((item) => {
      ordered.push(item);
    });
    return ordered;
  }, [activeSection, sectionItemOrder, config]);

  if (!secondarySidebarOpen) {
    return null;
  }

  if (!activeSection || activeSection === "dashboard") {
    return null;
  }

  if (!config) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderedItems.findIndex((i) => i.id === active.id);
      const newIndex = orderedItems.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
      setSectionItemOrder(activeSection, newOrder.map((i) => i.id));
    }
  };

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
      <div className="flex h-12 items-center gap-2 px-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSecondarySidebar}
          className="shrink-0"
          aria-label="Menu"
          data-testid="toggle-secondary-sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm text-sidebar-foreground truncate">{config.title}</span>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="py-2 px-2 space-y-0.5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedItems.map((item) => (
                <SortableSubItem
                  key={item.id}
                  item={item}
                  isActive={activeSubItem === item.id}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </nav>
      </ScrollArea>
    </div>
  );
}
