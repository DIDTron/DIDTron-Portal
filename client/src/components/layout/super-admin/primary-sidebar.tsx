import { useLocation } from "wouter";
import { LayoutDashboard, Server, Users, CreditCard, Settings, Megaphone, FileText, BarChart3, Shield, Bot, Network, Cpu, Globe, Building2, GripVertical, Cog, Receipt, Phone, Check, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultRoute: string;
}

export const navSections: NavSection[] = [
  { id: "voip", label: "VoIP", icon: Phone, defaultRoute: "/admin/pops" },
  { id: "wholesale-partners", label: "Wholesale", icon: Building2, defaultRoute: "/admin/wholesale/partners" },
  { id: "rate-cards", label: "Rate Cards", icon: Receipt, defaultRoute: "/admin/rate-cards/customer" },
  { id: "did", label: "DID", icon: Globe, defaultRoute: "/admin/did-countries" },
  { id: "customers", label: "Customers", icon: Users, defaultRoute: "/admin/customers" },
  { id: "billing", label: "Billing", icon: CreditCard, defaultRoute: "/admin/invoices" },
  { id: "marketing", label: "Marketing", icon: Megaphone, defaultRoute: "/admin/social-accounts" },
  { id: "monitoring", label: "Monitoring", icon: BarChart3, defaultRoute: "/admin/metrics" },
  { id: "sip-tester", label: "SIP Tester", icon: Cpu, defaultRoute: "/admin/sip-tester/new" },
  { id: "ai-voice", label: "AI Voice", icon: Bot, defaultRoute: "/admin/ai-voice/dashboard" },
  { id: "softswitch", label: "Softswitch", icon: Network, defaultRoute: "/admin/softswitch/carriers" },
  { id: "experience-manager", label: "Experience", icon: FileText, defaultRoute: "/admin/experience-manager" },
  { id: "admin", label: "Admin", icon: Shield, defaultRoute: "/admin/admin-users" },
  { id: "global-settings", label: "Global Settings", icon: Cog, defaultRoute: "/admin/global-settings/platform" },
  { id: "settings", label: "Settings", icon: Settings, defaultRoute: "/admin/settings/general" },
];

interface SortableNavItemProps {
  section: NavSection;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function SortableNavItem({ section, isActive, isCollapsed, onClick }: SortableNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = section.icon;

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            className={cn(
              "flex items-center justify-center p-2 rounded-md cursor-pointer",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover-elevate"
            )}
            data-testid={`nav-section-${section.id}`}
            onClick={onClick}
          >
            <Icon className="h-5 w-5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {section.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer group",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover-elevate"
      )}
      data-testid={`nav-section-${section.id}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 transition-opacity bg-transparent border-none p-0"
        aria-label={`Reorder ${section.label}`}
        data-testid={`drag-handle-${section.id}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button 
        type="button"
        className="flex items-center gap-3 flex-1 bg-transparent border-none p-0 text-inherit cursor-pointer text-left" 
        onClick={onClick}
        aria-label={section.label}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{section.label}</span>
      </button>
    </div>
  );
}

export function PrimarySidebar() {
  const [, setLocation] = useLocation();
  const { 
    activeSection, 
    setActiveSection, 
    openTab, 
    setActiveSubItem,
    primarySidebarOpen,
    primarySidebarCollapsed,
    togglePrimarySidebarCollapsed,
    openSecondarySidebar,
    primarySectionOrder,
    setPrimarySectionOrder,
    sectionItemOrder
  } = useSuperAdminTabs();

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

  const { data: alertData, isLoading: isAlertLoading, isError: isAlertError } = useQuery<{ stats?: { criticalCount: number; warningCount: number } }>({
    queryKey: ["/api/system/alerts"],
    refetchInterval: 60000,
    staleTime: 30000,
  });
  
  const activeAlertCount = (alertData?.stats?.criticalCount || 0) + (alertData?.stats?.warningCount || 0);
  const isAlertDataReady = !isAlertLoading && !isAlertError && alertData !== undefined;

  const orderedSections = useMemo(() => {
    if (primarySectionOrder.length === 0) {
      return navSections;
    }
    const sectionMap = new Map(navSections.map(s => [s.id, s]));
    const ordered: NavSection[] = [];
    for (const id of primarySectionOrder) {
      const section = sectionMap.get(id);
      if (section) {
        ordered.push(section);
        sectionMap.delete(id);
      }
    }
    Array.from(sectionMap.values()).forEach((section) => {
      ordered.push(section);
    });
    return ordered;
  }, [primarySectionOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderedSections.findIndex((s) => s.id === active.id);
      const newIndex = orderedSections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(orderedSections, oldIndex, newIndex);
      setPrimarySectionOrder(newOrder.map((s) => s.id));
    }
  };

  const handleSectionClick = (section: NavSection) => {
    setActiveSection(section.id);
    
    if (section.id !== "dashboard") {
      openSecondarySidebar();
    }
    
    if (section.id === "dashboard") {
      setActiveSubItem(null);
      setLocation("/admin");
    } else {
      const firstSubItem = getFirstSubItemForSection(section.id, sectionItemOrder);
      if (firstSubItem) {
        setActiveSubItem(firstSubItem.id);
        openTab({
          id: firstSubItem.id,
          label: firstSubItem.label,
          route: firstSubItem.route,
        });
        setLocation(firstSubItem.route);
      }
    }
  };

  if (!primarySidebarOpen) {
    return null;
  }

  const isCollapsed = primarySidebarCollapsed;

  return (
    <div className={cn(
      "flex flex-col h-full border-r bg-sidebar shrink-0 transition-all duration-200",
      isCollapsed ? "w-14" : "w-48"
    )}>
      <div className={cn(
        "flex h-10 items-center border-b shrink-0",
        isCollapsed ? "justify-center px-1" : "gap-3 px-2"
      )}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePrimarySidebarCollapsed}
              aria-label={isCollapsed ? "Expand primary sidebar" : "Collapse primary sidebar"}
              data-testid="toggle-primary-sidebar-collapsed"
              className="shrink-0 h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">Dashboard</TooltipContent>}
        </Tooltip>
        {!isCollapsed && (
          <span 
            className="font-semibold text-sm text-primary truncate cursor-pointer py-1 rounded-md hover-elevate"
            onClick={() => {
              setActiveSection("dashboard");
              setActiveSubItem(null);
              openTab({
                id: "dashboard",
                label: "Dashboard",
                route: "/admin",
              });
              setLocation("/admin");
            }}
            data-testid="nav-dashboard-header"
          >
            Dashboard
          </span>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <nav className={cn(
          "py-2 space-y-0.5",
          isCollapsed ? "px-1" : "px-2"
        )}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedSections.map((section) => (
                <SortableNavItem
                  key={section.id}
                  section={section}
                  isActive={activeSection === section.id}
                  isCollapsed={isCollapsed}
                  onClick={() => handleSectionClick(section)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </nav>
      </ScrollArea>

      <nav aria-label="System status" className={cn("border-t", isCollapsed ? "p-1" : "p-2")}>
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div 
                className="relative flex items-center justify-center p-2 rounded-md cursor-pointer text-sidebar-foreground hover-elevate"
                data-testid="nav-section-system-status"
                onClick={() => {
                  setActiveSection("system-status");
                  setActiveSubItem("system-status");
                  openTab({
                    id: "system-status",
                    label: "System Status",
                    route: "/admin/system-status",
                  });
                  setLocation("/admin/system-status");
                }}
              >
                <Server className="h-5 w-5" />
                {activeAlertCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white" data-testid="badge-system-alerts">
                    {activeAlertCount > 9 ? "9+" : activeAlertCount}
                  </span>
                ) : isAlertDataReady ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500" data-testid="badge-system-healthy">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </span>
                ) : null}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              System Status {activeAlertCount > 0 && `(${activeAlertCount} alerts)`}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div 
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm cursor-pointer hover-elevate",
              activeAlertCount > 0 ? "text-red-500" : isAlertDataReady ? "text-green-500" : "text-sidebar-foreground"
            )}
            data-testid="nav-section-system-status"
            onClick={() => {
              setActiveSection("system-status");
              setActiveSubItem("system-status");
              openTab({
                id: "system-status",
                label: "System Status",
                route: "/admin/system-status",
              });
              setLocation("/admin/system-status");
            }}
          >
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap">System Status</span>
            </div>
            {activeAlertCount > 0 ? (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1.5" data-testid="badge-system-alerts">
                {activeAlertCount > 99 ? "99+" : activeAlertCount}
              </Badge>
            ) : isAlertDataReady ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500" data-testid="badge-system-healthy">
                <Check className="h-3 w-3 text-white" />
              </span>
            ) : null}
          </div>
        )}
      </nav>
    </div>
  );
}

const sectionDefaultItems: Record<string, { id: string; label: string; route: string }[]> = {
  dashboard: [
    { id: "overview", label: "Overview", route: "/admin" },
    { id: "activity", label: "Live Activity", route: "/admin/activity" },
  ],
  voip: [
    { id: "pops", label: "POPs", route: "/admin/pops" },
    { id: "voice-tiers", label: "Voice Tiers", route: "/admin/voice-tiers" },
    { id: "codecs", label: "Codecs", route: "/admin/codecs" },
    { id: "channel-plans", label: "Channel Plans", route: "/admin/channel-plans" },
    { id: "routes", label: "Routes", route: "/admin/routes" },
  ],
  "wholesale-partners": [
    { id: "wholesale-partners", label: "Partners", route: "/admin/carriers" },
    { id: "wholesale-customers", label: "Customers", route: "/admin/wholesale/customers" },
    { id: "wholesale-customer-rates", label: "Customer Rates", route: "/admin/wholesale/customer-rates" },
    { id: "wholesale-did-countries", label: "DID Countries", route: "/admin/wholesale/did-countries" },
  ],
  "rate-cards": [
    { id: "customer-rates", label: "Customer Rates", route: "/admin/rate-cards/customer" },
    { id: "carrier-rates", label: "Carrier Rates", route: "/admin/rate-cards/carrier" },
  ],
  did: [
    { id: "did-countries", label: "DID Countries", route: "/admin/did-countries" },
    { id: "did-providers", label: "DID Providers", route: "/admin/did-providers" },
    { id: "did-inventory", label: "DID Inventory", route: "/admin/did-inventory" },
  ],
  customers: [
    { id: "customers", label: "Customers", route: "/admin/customers" },
    { id: "categories", label: "Categories", route: "/admin/categories" },
    { id: "groups", label: "Groups", route: "/admin/groups" },
    { id: "kyc", label: "KYC Requests", route: "/admin/kyc" },
  ],
  billing: [
    { id: "invoices", label: "Invoices", route: "/admin/invoices" },
    { id: "payments", label: "Payments", route: "/admin/payments" },
    { id: "currencies", label: "Currencies", route: "/admin/currencies" },
    { id: "referrals", label: "Referrals", route: "/admin/referrals" },
    { id: "promo-codes", label: "Promo Codes", route: "/admin/promo-codes" },
    { id: "bonuses", label: "Bonuses", route: "/admin/bonuses" },
  ],
  marketing: [
    { id: "social-accounts", label: "Social Accounts", route: "/admin/social-accounts" },
    { id: "social-posts", label: "Social Posts", route: "/admin/social-posts" },
    { id: "email-templates", label: "Email Templates", route: "/admin/email-templates" },
  ],
  monitoring: [
    { id: "metrics", label: "Metrics", route: "/admin/metrics" },
    { id: "alerts", label: "Alerts", route: "/admin/alerts" },
    { id: "rules", label: "Rules", route: "/admin/rules" },
  ],
  "sip-tester": [
    { id: "sip-new-test", label: "New Test", route: "/admin/sip-tester/new" },
    { id: "sip-history", label: "History", route: "/admin/sip-tester/history" },
    { id: "sip-settings", label: "Settings", route: "/admin/sip-tester/settings" },
  ],
  "ai-voice": [
    { id: "ai-voice-dashboard", label: "Dashboard", route: "/admin/ai-voice/dashboard" },
    { id: "ai-voice-agents", label: "Agents", route: "/admin/ai-voice/agents" },
    { id: "ai-voice-knowledge-bases", label: "Knowledge Bases", route: "/admin/ai-voice/knowledge-bases" },
    { id: "ai-voice-campaigns", label: "Campaigns", route: "/admin/ai-voice/campaigns" },
    { id: "ai-voice-call-logs", label: "Call Logs", route: "/admin/ai-voice/call-logs" },
    { id: "ai-voice-analytics", label: "Analytics", route: "/admin/ai-voice/analytics" },
    { id: "ai-voice-billing", label: "Billing", route: "/admin/ai-voice/billing" },
    { id: "ai-voice-settings", label: "Settings", route: "/admin/ai-voice/settings" },
  ],
  softswitch: [
    { id: "softswitch-carriers", label: "Carriers", route: "/admin/softswitch/carriers" },
    { id: "softswitch-customer-rating", label: "Customer Rating Plans", route: "/admin/softswitch/rating/customer-plans" },
    { id: "softswitch-routing", label: "Routing", route: "/admin/softswitch/routing" },
  ],
  cms: [
    { id: "pages", label: "Pages", route: "/admin/pages" },
    { id: "website-sections", label: "Website Sections", route: "/admin/website-sections" },
    { id: "login-pages", label: "Portal Logins", route: "/admin/login-pages" },
    { id: "site-settings", label: "Site Settings", route: "/admin/site-settings" },
    { id: "themes", label: "Themes", route: "/admin/themes" },
    { id: "media", label: "Media Library", route: "/admin/media" },
    { id: "documentation", label: "Documentation", route: "/admin/documentation" },
  ],
  admin: [
    { id: "admin-users", label: "Admin Users", route: "/admin/admin-users" },
    { id: "roles", label: "Roles", route: "/admin/roles" },
    { id: "audit-logs", label: "Audit Logs", route: "/admin/audit-logs" },
    { id: "tickets", label: "Support Tickets", route: "/admin/tickets" },
  ],
  "global-settings": [
    { id: "global-platform", label: "Platform", route: "/admin/global-settings/platform" },
    { id: "global-integrations", label: "Integrations", route: "/admin/global-settings/integrations" },
    { id: "global-currencies", label: "Currencies", route: "/admin/global-settings/currencies" },
    { id: "global-localization", label: "Localization", route: "/admin/global-settings/localization" },
    { id: "global-az-database", label: "A-Z Database", route: "/admin/global-settings/az-database" },
  ],
  settings: [
    { id: "general", label: "General", route: "/admin/settings/general" },
    { id: "api-keys", label: "API Keys", route: "/admin/settings/api-keys" },
    { id: "webhooks", label: "Webhooks", route: "/admin/settings/webhooks" },
    { id: "integrations", label: "Integrations", route: "/admin/settings/integrations" },
  ],
};

export function getFirstSubItemForSection(sectionId: string, sectionItemOrder?: Record<string, string[]>): { id: string; label: string; route: string } | null {
  const defaultItems = sectionDefaultItems[sectionId];
  if (!defaultItems || defaultItems.length === 0) return null;

  const savedOrder = sectionItemOrder?.[sectionId];
  if (savedOrder && savedOrder.length > 0) {
    const firstId = savedOrder[0];
    const item = defaultItems.find(i => i.id === firstId);
    if (item) return item;
  }
  
  return defaultItems[0];
}
