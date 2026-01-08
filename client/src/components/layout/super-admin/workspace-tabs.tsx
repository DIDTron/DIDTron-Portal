import { X } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function WorkspaceTabs() {
  const [, setLocation] = useLocation();
  const { tabs, activeTabId, setActiveTab, closeTab, closeOtherTabs, closeTabsToRight, closeAllTabs } = useSuperAdminTabs();

  if (tabs.length === 0) {
    return (
      <div className="flex h-10 items-center border-b bg-muted/30 px-4">
        <span className="text-sm text-muted-foreground">No tabs open - select an item from the sidebar</span>
      </div>
    );
  }

  const handleTabClick = (tab: WorkspaceTab) => {
    setActiveTab(tab.id);
    setLocation(tab.route);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    closeTab(tabId);
  };

  const handleCloseOthers = (tabId: string) => {
    closeOtherTabs(tabId);
  };

  const handleCloseToRight = (tabId: string) => {
    closeTabsToRight(tabId);
  };

  return (
    <div className="flex h-10 items-center border-b bg-muted/30">
      <ScrollArea className="w-full">
        <div className="flex h-10 items-center gap-0.5 px-2">
          {tabs.map((tab: WorkspaceTab, index: number) => {
            const isActive = tab.id === activeTabId;
            const isLastTab = index === tabs.length - 1;
            
            return (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger asChild>
                  <div
                    onClick={() => handleTabClick(tab)}
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
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      aria-label="Close tab"
                      data-testid={`tab-close-${tab.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                  <ContextMenuItem 
                    onClick={() => closeTab(tab.id)}
                    data-testid={`context-close-${tab.id}`}
                  >
                    Close
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => handleCloseOthers(tab.id)}
                    disabled={tabs.length <= 1}
                    data-testid={`context-close-others-${tab.id}`}
                  >
                    Close Others
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => handleCloseToRight(tab.id)}
                    disabled={isLastTab}
                    data-testid={`context-close-right-${tab.id}`}
                  >
                    Close Tabs To The Right
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem 
                    onClick={() => closeAllTabs()}
                    data-testid={`context-close-all-${tab.id}`}
                  >
                    Close All
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}
