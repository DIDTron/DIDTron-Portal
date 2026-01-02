import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Layers, Radio, CreditCard, Globe, Users, Activity, AlertTriangle } from "lucide-react";
import type { CustomerCategory } from "@shared/schema";

export default function AdminDashboard() {
  const { data: categories } = useQuery<CustomerCategory[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">Admin Dashboard</h1>
        <p className="text-muted-foreground">System configuration and monitoring</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={Server} title="POPs" value="0" description="Points of Presence" testId="stat-pops" />
        <StatCard icon={Layers} title="Voice Tiers" value="0" description="Quality levels" testId="stat-voice-tiers" />
        <StatCard icon={Radio} title="Codecs" value="0" description="Audio codecs" testId="stat-codecs" />
        <StatCard icon={Globe} title="DID Countries" value="0" description="Available countries" testId="stat-did-countries" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{cat.name}</span>
                  <span className="text-muted-foreground">{cat.code}</span>
                </div>
              )) || <p className="text-sm text-muted-foreground">No categories configured</p>}
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
              <StatusRow label="ConnexCS Sync" status="pending" />
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
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  testId
}: {
  icon: typeof Server;
  title: string;
  value: string;
  description: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
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

function StatusRow({ label, status }: { label: string; status: "online" | "offline" | "pending" }) {
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
        <span className="text-muted-foreground capitalize">{status}</span>
      </div>
    </div>
  );
}
