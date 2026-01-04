import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, Layers, Radio, CreditCard, Globe, Users, Activity, AlertTriangle, 
  Building2, Route, Phone, Sparkles, RefreshCw, ArrowUpRight, TrendingUp, Clock
} from "lucide-react";
import { useSuperAdminTabs, type WorkspaceTab } from "@/stores/super-admin-tabs";
import type { CustomerCategory, Carrier, Pop } from "@shared/schema";

export default function AdminDashboard() {
  const { openTab, setActiveSection, setActiveSubItem } = useSuperAdminTabs();

  const { data: categories } = useQuery<CustomerCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: carriers } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
  });

  const { data: pops } = useQuery<Pop[]>({
    queryKey: ["/api/pops"],
  });

  const handleQuickAction = (section: string, subItem: string, label: string, route: string) => {
    setActiveSection(section);
    setActiveSubItem(subItem);
    const tab: WorkspaceTab = {
      id: subItem,
      label: label,
      route: route,
    };
    openTab(tab);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Last sync: 2 min ago
          </Badge>
          <Button variant="outline" size="sm" data-testid="button-refresh-all">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Building2} 
          title="Carriers" 
          value={carriers?.length?.toString() || "0"} 
          description="Active carriers" 
          testId="stat-carriers"
          onClick={() => handleQuickAction("voip", "carriers", "Carriers", "/admin/carriers")}
        />
        <StatCard 
          icon={Route} 
          title="Routes" 
          value="0" 
          description="Voice routes" 
          testId="stat-routes"
          onClick={() => handleQuickAction("voip", "routes", "Routes", "/admin/routes")}
        />
        <StatCard 
          icon={Server} 
          title="POPs" 
          value={pops?.length?.toString() || "0"} 
          description="Points of Presence" 
          testId="stat-pops"
          onClick={() => handleQuickAction("voip", "pops", "POPs", "/admin/pops")}
        />
        <StatCard 
          icon={Globe} 
          title="DID Countries" 
          value="0" 
          description="Available countries" 
          testId="stat-did-countries"
          onClick={() => handleQuickAction("voip", "did-countries", "DID Countries", "/admin/did-countries")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2" data-testid="card-ai-insights">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>AI-generated recommendations for your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InsightItem
                type="recommendation"
                title="Add more carriers for USA routes"
                description="Your USA termination has only 1 carrier. Adding 2 more carriers would improve redundancy and potentially reduce costs by 15%."
                action="Add Carrier"
                onAction={() => handleQuickAction("voip", "carriers", "Carriers", "/admin/carriers")}
              />
              <InsightItem
                type="alert"
                title="Low channel utilization detected"
                description="Your channel plans are using only 23% capacity. Consider offering promotions to increase usage."
                action="View Plans"
                onAction={() => handleQuickAction("voip", "channel-plans", "Channel Plans", "/admin/channel-plans")}
              />
              <InsightItem
                type="opportunity"
                title="New DID region available"
                description="ConnexCS has new DID inventory for UAE. Your customers have requested this region 12 times."
                action="Add Region"
                onAction={() => handleQuickAction("voip", "did-countries", "DID Countries", "/admin/did-countries")}
              />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-connexcs-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              ConnexCS Status
            </CardTitle>
            <CardDescription>Real-time connection status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusRow label="API Connection" status="online" />
              <StatusRow label="CDR Stream" status="online" />
              <StatusRow label="Metrics Feed" status="online" />
              <StatusRow label="Last Sync" status="pending" extra="2 min ago" />
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Mode</span>
                  <Badge variant="secondary">Mock</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-categories">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Categories
            </CardTitle>
            <CardDescription>Customer segmentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>{cat.name}</span>
                    <Badge variant="outline" className="text-xs">{cat.code}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No categories configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-system-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Service health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <StatusRow label="API Server" status="online" />
              <StatusRow label="Database" status="online" />
              <StatusRow label="AI Service" status="online" />
              <StatusRow label="Email (Brevo)" status="pending" extra="Not configured" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>System notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>ConnexCS API key not configured</span>
              </div>
              <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Stripe not connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-quick-stats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-md">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Active Customers</div>
            </div>
            <div className="text-center p-4 border rounded-md">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Active Trunks</div>
            </div>
            <div className="text-center p-4 border rounded-md">
              <div className="text-3xl font-bold text-primary">$0</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
            <div className="text-center p-4 border rounded-md">
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">DIDs Active</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  testId,
  onClick
}: {
  icon: typeof Server;
  title: string;
  value: string;
  description: string;
  testId: string;
  onClick?: () => void;
}) {
  return (
    <Card 
      className={onClick ? "cursor-pointer hover-elevate" : ""} 
      onClick={onClick}
      data-testid={testId}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, status, extra }: { label: string; status: "online" | "offline" | "pending"; extra?: string }) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-red-500",
    pending: "bg-yellow-500"
  };

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
        <span className="text-muted-foreground">{extra || status}</span>
      </div>
    </div>
  );
}

function InsightItem({
  type,
  title,
  description,
  action,
  onAction
}: {
  type: "recommendation" | "alert" | "opportunity";
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  const typeStyles = {
    recommendation: "border-l-primary",
    alert: "border-l-yellow-500",
    opportunity: "border-l-green-500"
  };

  return (
    <div className={`p-4 border-l-4 ${typeStyles[type]} bg-muted/30 rounded-r-md`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onAction}>
          {action}
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
