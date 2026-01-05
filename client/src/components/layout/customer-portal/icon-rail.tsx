import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  LayoutDashboard, Phone, Globe, Headphones, CreditCard, 
  HelpCircle, Settings, FileText, Bot, TestTube, Code, Network
} from "lucide-react";

interface IconRailProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/portal", external: false },
  { id: "voice", icon: Phone, label: "Voice", path: "/portal/voice", external: false },
  { id: "dids", icon: Globe, label: "DIDs", path: "/portal/dids", external: false },
  { id: "pbx", icon: Headphones, label: "Cloud PBX", path: "/portal/pbx", external: false },
  { id: "ai-agent", icon: Bot, label: "AI Agent", path: "/portal/ai-agent", external: false },
  { id: "sip-tester", icon: TestTube, label: "SIP Tester", path: "/portal/sip-tester", external: false },
  { id: "class4", icon: Network, label: "Class 4", path: "/portal/class4", external: false },
  { id: "developers", icon: Code, label: "Developers", path: "/portal/developers", external: false },
  { id: "billing", icon: CreditCard, label: "Billing", path: "/portal/billing", external: false },
  { id: "support", icon: HelpCircle, label: "Support", path: "/portal/support", external: false },
  { id: "docs", icon: FileText, label: "Docs", path: "/docs", external: true },
  { id: "settings", icon: Settings, label: "Settings", path: "/portal/settings", external: false },
];

export function CustomerIconRail({ activeSection, onSectionChange }: IconRailProps) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col items-center py-4 px-2 gap-1 bg-sidebar border-r w-14">
      {sections.map((section) => {
        const isActive = activeSection === section.id || 
          (section.id === "dashboard" && location === "/portal");
        
        const buttonContent = (
          <Button
            size="icon"
            variant="ghost"
            className={`w-10 h-10 ${isActive ? "bg-sidebar-accent" : ""}`}
            onClick={() => !section.external && onSectionChange(section.id)}
            data-testid={`icon-${section.id}`}
          >
            <section.icon className="h-5 w-5" />
          </Button>
        );

        return (
          <Tooltip key={section.id} delayDuration={0}>
            <TooltipTrigger asChild>
              {section.external ? (
                <a href={section.path} target="_blank" rel="noopener noreferrer">
                  {buttonContent}
                </a>
              ) : (
                <Link href={section.path}>
                  {buttonContent}
                </Link>
              )}
            </TooltipTrigger>
            <TooltipContent side="right">
              {section.label}{section.external && " (opens in new tab)"}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
