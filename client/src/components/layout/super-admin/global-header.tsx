import { useState, KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { Search, Bell, LogOut, Menu, Phone } from "lucide-react";
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

interface GlobalHeaderProps {
  userEmail: string;
  onLogout: () => void;
}

export function GlobalHeader({ userEmail, onLogout }: GlobalHeaderProps) {
  const [, setLocation] = useLocation();
  const initials = userEmail?.substring(0, 2).toUpperCase() || "SA";
  const { primarySidebarOpen, toggleBothSidebars, openTab } = useSuperAdminTabs();
  const [searchQuery, setSearchQuery] = useState("");

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
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-4 flex-1">
        {!primarySidebarOpen && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBothSidebars}
              data-testid="header-toggle-sidebars"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Phone className="h-5 w-5 text-primary" />
            <span className="font-bold">DIDTron</span>
          </div>
        )}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search carriers, routes, customers..."
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
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">
            3
          </Badge>
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 gap-2 px-2" data-testid="button-user-menu">
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
