import { useState, KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { STALE_TIME, keepPreviousData, queryClient, apiRequest } from "@/lib/queryClient";
import { Search, Bell, LogOut, Cloud, CloudOff, Loader2, Menu, AlertTriangle, AlertCircle, Info, CheckCircle, ExternalLink } from "lucide-react";
import { useBrandingStore } from "@/stores/branding-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSuperAdminTabs } from "@/stores/super-admin-tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConnexCSStatus {
  connected: boolean;
  mockMode: boolean;
  message: string;
}

interface SystemAlert {
  id: number;
  alertType: string;
  severity: string;
  message: string;
  firstSeenAt: string | null;
  acknowledgedAt: string | null;
}

interface AlertsResponse {
  alerts: SystemAlert[];
  stats: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

interface GlobalHeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export function GlobalHeader({ userEmail, onLogout }: GlobalHeaderProps) {
  const [, setLocation] = useLocation();
  const initials = userEmail?.substring(0, 2).toUpperCase() || "SA";
  const { openTab, toggleBothSidebars } = useSuperAdminTabs();
  const [searchQuery, setSearchQuery] = useState("");
  const { headerLogo } = useBrandingStore();

  const { data: connexcsStatus, isLoading: statusLoading } = useQuery<ConnexCSStatus>({
    queryKey: ["/api/connexcs/status"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });

  const { data: alertsData } = useQuery<AlertsResponse>({
    queryKey: ["/api/system/alerts", "active"],
    queryFn: async () => {
      const response = await fetch("/api/system/alerts?status=active");
      return response.json();
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const acknowledgeAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/system/alerts/acknowledge-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/alerts"] });
    },
  });

  const activeAlertCount = (alertsData?.stats?.criticalCount || 0) + (alertsData?.stats?.warningCount || 0) + (alertsData?.stats?.infoCount || 0);
  const recentAlerts = alertsData?.alerts?.slice(0, 5) || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      openTab({
        id: "search",
        label: "Search",
        route: `/admin/search?q=${encodeURIComponent(searchQuery.trim())}`,
      });
      setLocation(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleBothSidebars}
          aria-label="Toggle sidebar"
          data-testid="header-toggle-sidebars"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center" data-testid="header-logo">
          {headerLogo ? (
            <img 
              src={headerLogo} 
              alt="DIDTron Logo" 
              className="h-8 object-contain"
            />
          ) : (
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-primary">DID</span>
              <span className="text-foreground">Tron</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search carriers, routes, customers..."
            aria-label="Search carriers, routes, customers"
            className="pl-9 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            data-testid="input-global-search"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              aria-label="ConnexCS status"
              data-testid="button-connexcs-status"
            >
              {statusLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : connexcsStatus?.connected ? (
                <Cloud className="h-4 w-4 text-green-500" />
              ) : connexcsStatus?.mockMode ? (
                <CloudOff className="h-4 w-4 text-yellow-500" />
              ) : (
                <CloudOff className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{connexcsStatus?.message || "Checking ConnexCS status..."}</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
              {activeAlertCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">
                  {activeAlertCount > 9 ? "9+" : activeAlertCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>System Alerts</span>
              {activeAlertCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {activeAlertCount} active
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentAlerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>All systems healthy</p>
                <p className="text-xs mt-1">No active alerts</p>
              </div>
            ) : (
              <>
                {recentAlerts.map((alert) => (
                  <DropdownMenuItem
                    key={alert.id}
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => {
                      openTab({
                        id: "system-status",
                        label: "System Status",
                        route: "/admin/system-status",
                      });
                      setLocation("/admin/system-status");
                    }}
                    data-testid={`alert-item-${alert.id}`}
                  >
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.alertType.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(alert.firstSeenAt)}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-primary cursor-pointer"
                  onClick={() => {
                    openTab({
                      id: "system-status",
                      label: "System Status",
                      route: "/admin/system-status",
                    });
                    setLocation("/admin/system-status");
                  }}
                  data-testid="link-view-all-alerts"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  View all in System Status
                </DropdownMenuItem>
                {activeAlertCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="justify-center text-muted-foreground cursor-pointer"
                      onClick={() => acknowledgeAllMutation.mutate()}
                      disabled={acknowledgeAllMutation.isPending}
                      data-testid="button-acknowledge-all"
                    >
                      {acknowledgeAllMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-2" />
                      )}
                      Acknowledge all
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 gap-2 px-2" aria-label="User menu" data-testid="button-user-menu">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm hidden md:inline-block">{userEmail}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Super Admin</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-item-profile">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-item-api-keys">
              API Keys
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} data-testid="menu-item-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
