import { useLocation } from "wouter";
import { 
  Phone, LayoutDashboard, Globe, Headphones, CreditCard, 
  Settings, FileText, Bot, TestTube, Code, Network, HelpCircle, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCustomerPortalStore } from "@/stores/customer-portal-tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultRoute: string;
  external?: boolean;
}

export const navSections: NavSection[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, defaultRoute: "/portal" },
  { id: "voice", label: "Voice", icon: Phone, defaultRoute: "/portal/voice" },
  { id: "dids", label: "DIDs", icon: Globe, defaultRoute: "/portal/dids" },
  { id: "pbx", label: "Cloud PBX", icon: Headphones, defaultRoute: "/portal/pbx" },
  { id: "ai-agent", label: "AI Agent", icon: Bot, defaultRoute: "/portal/ai-agent" },
  { id: "sip-tester", label: "SIP Tester", icon: TestTube, defaultRoute: "/portal/sip-tester" },
  { id: "class4", label: "Class 4", icon: Network, defaultRoute: "/portal/class4" },
  { id: "developers", label: "Developers", icon: Code, defaultRoute: "/portal/developers" },
  { id: "billing", label: "Billing", icon: CreditCard, defaultRoute: "/portal/billing" },
  { id: "support", label: "Support", icon: HelpCircle, defaultRoute: "/portal/support" },
  { id: "settings", label: "Settings", icon: Settings, defaultRoute: "/portal/settings" },
];

export function CustomerPrimarySidebar() {
  const [, setLocation] = useLocation();
  const { 
    activeSection, 
    setActiveSection, 
    setActiveSubItem,
    primarySidebarOpen,
    toggleBothSidebars
  } = useCustomerPortalStore();

  const handleSectionClick = (section: NavSection) => {
    setActiveSection(section.id);
    
    if (section.id === "dashboard") {
      setActiveSubItem(null);
      setLocation("/portal");
    } else {
      const firstSubItem = getFirstSubItemForSection(section.id);
      if (firstSubItem) {
        setActiveSubItem(firstSubItem.id);
        setLocation(firstSubItem.route);
      }
    }
  };

  if (!primarySidebarOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-44 border-r bg-sidebar shrink-0">
      <div className="flex h-12 items-center gap-2 px-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleBothSidebars}
          className="shrink-0"
          aria-label="Menu"
          data-testid="toggle-both-sidebars"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Phone className="h-5 w-5 text-primary shrink-0" />
        <span className="font-bold text-base truncate">DIDTron</span>
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
        <a 
          href="/docs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-foreground hover-elevate"
          data-testid="nav-section-docs"
        >
          <FileText className="h-5 w-5 shrink-0" />
          <span>Documentation</span>
        </a>
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
    voice: { id: "trunks", label: "Trunks", route: "/portal/voice/trunks" },
    dids: { id: "inventory", label: "My Numbers", route: "/portal/dids/inventory" },
    pbx: { id: "extensions", label: "Extensions", route: "/portal/pbx/extensions" },
    "ai-agent": { id: "personas", label: "Personas", route: "/portal/ai-agent/personas" },
    "sip-tester": { id: "tests", label: "Tests", route: "/portal/sip-tester/tests" },
    class4: { id: "rate-cards", label: "Rate Cards", route: "/portal/class4/rate-cards" },
    developers: { id: "api-keys", label: "API Keys", route: "/portal/developers/api-keys" },
    billing: { id: "balance", label: "Balance", route: "/portal/billing" },
    support: { id: "tickets", label: "Tickets", route: "/portal/support" },
    settings: { id: "profile", label: "Profile", route: "/portal/settings" },
  };
  
  return sectionItems[sectionId] || null;
}
