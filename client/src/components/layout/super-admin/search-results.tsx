import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Phone, Globe, Users, CreditCard, BarChart3, Shield, Settings, MessageSquare, FileText, Palette, Bot, Radio, Database, LayoutDashboard, Megaphone, Building2, Route, Ticket } from "lucide-react";
import { useSuperAdminTabs } from "@/stores/super-admin-tabs";
import { allPageSearchItems, filterSearchItems, type SearchItem } from "@/lib/search-registry";

interface DataResult {
  id: string;
  label: string;
  type: string;
  path: string;
  description?: string;
  icon?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  building2: Building2,
  "file-text": FileText,
  ticket: Ticket,
  route: Route,
  phone: Phone,
  globe: Globe,
  creditcard: CreditCard,
  shield: Shield,
  settings: Settings,
  palette: Palette,
  bot: Bot,
  radio: Radio,
  database: Database,
  barchart3: BarChart3,
  messagesquare: MessageSquare,
  layoutdashboard: LayoutDashboard,
  megaphone: Megaphone,
};

export function AdminSearchResults() {
  const [, setLocation] = useLocation();
  const { setActiveSection, setActiveSubItem, openTab, closeTab } = useSuperAdminTabs();
  
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("q") || "";
  const searchTerm = query.toLowerCase().trim();
  
  // Get page results from registry (auto-discovered from navigation)
  const pageResults = filterSearchItems(allPageSearchItems, searchTerm);
  
  // Get data results from API (customers, carriers, invoices, etc.)
  const { data: dataResults, isLoading } = useQuery<{ results: DataResult[] }>({
    queryKey: ["/api/search", searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return { results: [] };
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      return response.json();
    },
    enabled: searchTerm.length >= 2,
  });

  const handlePageClick = (item: SearchItem) => {
    closeTab("search");
    setActiveSection(item.section);
    setActiveSubItem(item.id.split("-").slice(1).join("-"));
    openTab({
      id: item.id,
      label: item.label,
      route: item.path,
    });
    setLocation(item.path);
  };

  const handleDataClick = (item: DataResult) => {
    closeTab("search");
    setLocation(item.path);
  };

  const getDataIcon = (iconName?: string) => {
    if (!iconName) return FileText;
    return iconMap[iconName.toLowerCase()] || FileText;
  };

  const totalResults = pageResults.length + (dataResults?.results?.length || 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground mb-6">
        {isLoading ? "Searching..." : `${totalResults} results for "${query}"`}
      </p>

      {/* Page Results Section */}
      {pageResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Pages & Modules
            <Badge variant="secondary">{pageResults.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pageResults.map((item) => (
              <Card
                key={item.id}
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => handlePageClick(item)}
                data-testid={`search-result-page-${item.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.label}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.sectionLabel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Data Results Section */}
      {isLoading ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Records
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : dataResults?.results && dataResults.results.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Records
            <Badge variant="secondary">{dataResults.results.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dataResults.results.map((item) => {
              const Icon = getDataIcon(item.icon);
              return (
                <Card
                  key={item.id}
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => handleDataClick(item)}
                  data-testid={`search-result-data-${item.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-accent/50">
                        <Icon className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.label}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.type}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* No Results */}
      {!isLoading && totalResults === 0 && searchTerm && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No results found for "{query}"
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}
