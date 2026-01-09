import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, TrendingDown, Phone, DollarSign, 
  Users, Clock, Activity, RefreshCw
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: typeof BarChart3;
  trend: "up" | "down" | "neutral";
}

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh for mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const metrics: MetricCard[] = [
    { title: "Total Calls", value: "12,456", change: 8.2, icon: Phone, trend: "up" },
    { title: "Revenue", value: "$45,230", change: 12.5, icon: DollarSign, trend: "up" },
    { title: "Active Customers", value: "342", change: 3.1, icon: Users, trend: "up" },
    { title: "Avg Call Duration", value: "4:32", change: -2.1, icon: Clock, trend: "down" },
    { title: "ASR", value: "94.5%", change: 0.3, icon: Activity, trend: "up" },
    { title: "ACD", value: "2:45", change: 5.2, icon: BarChart3, trend: "up" },
  ];

  const topRoutes = [
    { route: "US Mobile Premium", calls: 4521, revenue: 15230.50, asr: 96.2 },
    { route: "UK Landline", calls: 3210, revenue: 8450.25, asr: 94.8 },
    { route: "Germany Mobile", calls: 2156, revenue: 6780.00, asr: 92.1 },
    { route: "France All", calls: 1890, revenue: 4560.75, asr: 95.5 },
    { route: "Spain Mobile", calls: 1450, revenue: 3890.00, asr: 93.2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Metrics</h1>
          <p className="text-muted-foreground">Analytics and performance data (Demo)</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh-metrics"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                  <span className={metric.trend === "up" ? "text-green-600 text-sm" : metric.trend === "down" ? "text-red-600 text-sm" : "text-muted-foreground text-sm"}>
                    {metric.change > 0 ? "+" : ""}{metric.change}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Routes by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRoutes.map((route, index) => (
                <div key={route.route} className="flex items-center justify-between" data-testid={`route-${index}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-6">{index + 1}.</span>
                    <span className="font-medium">{route.route}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{route.calls.toLocaleString()} calls</Badge>
                    <span className="text-sm font-medium">${route.revenue.toLocaleString()}</span>
                    <Badge variant={route.asr > 95 ? "default" : "secondary"}>
                      {route.asr}% ASR
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chart visualization</p>
                <p className="text-sm">Connect to analytics service for live data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
