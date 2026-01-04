import { useLocation } from "wouter";
import { Phone, LayoutDashboard, Server, Users, CreditCard, Settings, Megaphone, FileText, BarChart3, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultRoute: string;
}

export const navSections: NavSection[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, defaultRoute: "/admin" },
  { id: "voip", label: "VoIP", icon: Phone, defaultRoute: "/admin/carriers" },
  { id: "customers", label: "Customers", icon: Users, defaultRoute: "/admin/customers" },
  { id: "billing", label: "Billing", icon: CreditCard, defaultRoute: "/admin/invoices" },
  { id: "marketing", label: "Marketing", icon: Megaphone, defaultRoute: "/admin/social-accounts" },
  { id: "monitoring", label: "Monitoring", icon: BarChart3, defaultRoute: "/admin/metrics" },
  { id: "cms", label: "CMS", icon: FileText, defaultRoute: "/admin/pages" },
  { id: "admin", label: "Admin", icon: Shield, defaultRoute: "/admin/admin-users" },
  { id: "settings", label: "Settings", icon: Settings, defaultRoute: "/admin/settings/general" },
];

export function PrimarySidebar() {
  const [, setLocation] = useLocation();
  const { activeSection, setActiveSection, openTab, setActiveSubItem } = useSuperAdminTabs();

  const handleSectionClick = (section: NavSection) => {
    setActiveSection(section.id);
    
    if (section.id === "dashboard") {
      setActiveSubItem(null);
      setLocation("/admin");
    } else {
      const firstSubItem = getFirstSubItemForSection(section.id);
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

  return (
    <div className="flex flex-col h-full w-44 border-r bg-sidebar shrink-0">
      <div className="flex h-12 items-center gap-2 px-4 border-b">
        <Phone className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">DIDTron</span>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="py-2 px-2 space-y-0.5">
          {navSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <div
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer hover-elevate",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                )}
                data-testid={`nav-section-${section.id}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{section.label}</span>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-2 border-t">
        <div 
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-foreground hover-elevate"
          data-testid="nav-section-help"
        >
          <Server className="h-5 w-5 shrink-0" />
          <span>System Status</span>
        </div>
      </div>
    </div>
  );
}

interface SubItem {
  id: string;
  label: string;
  route: string;
}

function getFirstSubItemForSection(sectionId: string): SubItem | null {
  const sectionItems: Record<string, SubItem> = {
    voip: { id: "carriers", label: "Carriers", route: "/admin/carriers" },
    customers: { id: "customers", label: "Customers", route: "/admin/customers" },
    billing: { id: "invoices", label: "Invoices", route: "/admin/invoices" },
    marketing: { id: "social-accounts", label: "Social Accounts", route: "/admin/social-accounts" },
    monitoring: { id: "metrics", label: "Metrics", route: "/admin/metrics" },
    cms: { id: "pages", label: "Pages", route: "/admin/pages" },
    admin: { id: "admin-users", label: "Admin Users", route: "/admin/admin-users" },
    settings: { id: "general", label: "General", route: "/admin/settings/general" },
  };
  
  return sectionItems[sectionId] || null;
}
