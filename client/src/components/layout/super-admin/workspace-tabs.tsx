import { X } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function WorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useSuperAdminTabs();

  if (tabs.length === 0) {
    return (
      <div className="flex h-10 items-center border-b bg-muted/30 px-4">
        <span className="text-sm text-muted-foreground">No tabs open - select an item from the sidebar</span>
      </div>
    );
  }

  return (
    <div className="flex h-10 items-center border-b bg-muted/30">
      <ScrollArea className="w-full">
        <div className="flex h-10 items-center gap-0.5 px-2">
          {tabs.map((tab: WorkspaceTab) => {
            const isActive = tab.id === activeTabId;
            
            return (
              <Link key={tab.id} href={tab.route}>
                <div
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group flex h-8 items-center gap-2 px-3 rounded-t-md text-sm cursor-pointer transition-colors",
                    isActive
                      ? "bg-background text-foreground border-t border-x border-border"
                      : "text-muted-foreground hover-elevate"
                  )}
                  data-testid={`tab-${tab.id}`}
                >
                  <span className="truncate max-w-[120px]">{tab.label}</span>
                  {tab.isDirty && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                      isActive && "opacity-100"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    data-testid={`tab-close-${tab.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}
