import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CustomerIconRail } from "@/components/layout/customer-portal/icon-rail";
import { CustomerSecondarySidebar } from "@/components/layout/customer-portal/secondary-sidebar";
import { Phone, Bell, User, LogOut, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

import CustomerDashboard from "./dashboard";
import VoiceRatesPage from "./voice-rates";
import VoiceRoutesPage from "./voice-routes";
import VoiceUsagePage from "./voice-usage";
import DIDsPage from "./dids";
import DIDSearchPage from "./did-search";
import KycDocumentsPage from "./kyc-documents";
import BillingPage from "./billing";
import InvoicesPage from "./invoices";
import TransactionsPage from "./transactions";
import SupportPage from "./support";
import SettingsPage from "./settings";
import UsagePage from "./usage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">This feature is coming soon</p>
      </div>
    </div>
  );
}

const routeToSection: Record<string, { section: string; subItem: string }> = {
  "/portal": { section: "dashboard", subItem: "overview" },
  "/portal/usage": { section: "dashboard", subItem: "usage" },
  "/portal/voice": { section: "voice", subItem: "rates" },
  "/portal/voice/rates": { section: "voice", subItem: "rates" },
  "/portal/voice/routes": { section: "voice", subItem: "routes" },
  "/portal/voice/usage": { section: "voice", subItem: "usage" },
  "/portal/dids": { section: "dids", subItem: "inventory" },
  "/portal/dids/search": { section: "dids", subItem: "search" },
  "/portal/dids/kyc": { section: "dids", subItem: "kyc" },
  "/portal/pbx": { section: "pbx", subItem: "extensions" },
  "/portal/pbx/extensions": { section: "pbx", subItem: "extensions" },
  "/portal/pbx/ring-groups": { section: "pbx", subItem: "ring-groups" },
  "/portal/pbx/ivr": { section: "pbx", subItem: "ivr" },
  "/portal/ai-agent": { section: "ai-agent", subItem: "agents" },
  "/portal/ai-agent/personas": { section: "ai-agent", subItem: "personas" },
  "/portal/ai-agent/flows": { section: "ai-agent", subItem: "flows" },
  "/portal/ai-agent/training": { section: "ai-agent", subItem: "training" },
  "/portal/billing": { section: "billing", subItem: "balance" },
  "/portal/billing/invoices": { section: "billing", subItem: "invoices" },
  "/portal/billing/transactions": { section: "billing", subItem: "transactions" },
  "/portal/billing/export": { section: "billing", subItem: "export" },
  "/portal/support": { section: "support", subItem: "tickets" },
  "/portal/support/new": { section: "support", subItem: "new-ticket" },
  "/portal/support/kb": { section: "support", subItem: "kb" },
  "/portal/settings": { section: "settings", subItem: "profile" },
  "/portal/settings/security": { section: "settings", subItem: "security" },
  "/portal/settings/notifications": { section: "settings", subItem: "notifications" },
};

export default function CustomerPortal() {
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubItem, setActiveSubItem] = useState("overview");

  useEffect(() => {
    const mapping = routeToSection[location];
    if (mapping) {
      setActiveSection(mapping.section);
      setActiveSubItem(mapping.subItem);
    }
  }, [location]);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background">
        <CustomerIconRail 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <CustomerSecondarySidebar
          activeSection={activeSection}
          activeSubItem={activeSubItem}
          onSubItemChange={setActiveSubItem}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b flex items-center justify-between px-4 gap-4 bg-background">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-bold" data-testid="text-logo">DIDTron</span>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 h-9"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" data-testid="button-profile">
                <User className="h-4 w-4" />
              </Button>
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/30">
            <Switch>
              <Route path="/portal" component={CustomerDashboard} />
              <Route path="/portal/usage" component={UsagePage} />
              <Route path="/portal/voice" component={VoiceRatesPage} />
              <Route path="/portal/voice/rates" component={VoiceRatesPage} />
              <Route path="/portal/voice/routes" component={VoiceRoutesPage} />
              <Route path="/portal/voice/usage" component={VoiceUsagePage} />
              <Route path="/portal/dids" component={DIDsPage} />
              <Route path="/portal/dids/search" component={DIDSearchPage} />
              <Route path="/portal/dids/kyc" component={KycDocumentsPage} />
              <Route path="/portal/pbx">
                <PlaceholderPage title="Cloud PBX" />
              </Route>
              <Route path="/portal/pbx/extensions">
                <PlaceholderPage title="Extensions" />
              </Route>
              <Route path="/portal/pbx/ring-groups">
                <PlaceholderPage title="Ring Groups" />
              </Route>
              <Route path="/portal/pbx/ivr">
                <PlaceholderPage title="IVR" />
              </Route>
              <Route path="/portal/ai-agent">
                <PlaceholderPage title="AI Voice Agents" />
              </Route>
              <Route path="/portal/ai-agent/personas">
                <PlaceholderPage title="Agent Personas" />
              </Route>
              <Route path="/portal/ai-agent/flows">
                <PlaceholderPage title="Conversation Flows" />
              </Route>
              <Route path="/portal/ai-agent/training">
                <PlaceholderPage title="Training Data" />
              </Route>
              <Route path="/portal/billing" component={BillingPage} />
              <Route path="/portal/billing/invoices" component={InvoicesPage} />
              <Route path="/portal/billing/transactions" component={TransactionsPage} />
              <Route path="/portal/billing/export">
                <PlaceholderPage title="Export CDRs" />
              </Route>
              <Route path="/portal/support" component={SupportPage} />
              <Route path="/portal/support/new">
                <PlaceholderPage title="New Support Ticket" />
              </Route>
              <Route path="/portal/support/kb">
                <PlaceholderPage title="Knowledge Base" />
              </Route>
              <Route path="/portal/settings" component={SettingsPage} />
              <Route path="/portal/settings/security">
                <PlaceholderPage title="Security Settings" />
              </Route>
              <Route path="/portal/settings/notifications">
                <PlaceholderPage title="Notification Settings" />
              </Route>
              <Route>
                <PlaceholderPage title="Page Not Found" />
              </Route>
            </Switch>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
