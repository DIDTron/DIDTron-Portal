import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, Clock, DollarSign, Globe, TrendingUp, 
  ArrowUp, ArrowDown, Calendar
} from "lucide-react";
import { useState } from "react";

export default function UsagePage() {
  const [period, setPeriod] = useState("month");

  const usageStats = [
    { label: "Total Calls", value: "12,456", icon: Phone, change: "+15%", trend: "up" },
    { label: "Total Minutes", value: "45,230", icon: Clock, change: "+8%", trend: "up" },
    { label: "Total Cost", value: "$1,245.67", icon: DollarSign, change: "-3%", trend: "down" },
    { label: "Active DIDs", value: "15", icon: Globe, change: "+2", trend: "up" },
  ];

  const topDestinations = [
    { country: "United States", calls: 5230, minutes: 18450, cost: 221.40 },
    { country: "United Kingdom", calls: 2145, minutes: 8560, cost: 154.08 },
    { country: "Germany", calls: 1560, minutes: 4680, cost: 88.92 },
    { country: "France", calls: 890, minutes: 2670, cost: 58.74 },
    { country: "Australia", calls: 456, minutes: 1368, cost: 38.30 },
  ];

  const dailyUsage = [
    { day: "Mon", calls: 1850, cost: 178.50 },
    { day: "Tue", calls: 1920, cost: 185.40 },
    { day: "Wed", calls: 1780, cost: 171.80 },
    { day: "Thu", calls: 2100, cost: 203.50 },
    { day: "Fri", calls: 1950, cost: 188.30 },
    { day: "Sat", calls: 890, cost: 86.20 },
    { day: "Sun", calls: 756, cost: 73.10 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usage Statistics</h1>
          <p className="text-muted-foreground">Track your account usage and spending</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40" data-testid="select-period">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {usageStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="p-2 rounded-md bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDestinations.map((dest, index) => (
                <div key={dest.country} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`dest-${index}`}>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div>
                      <p className="font-medium text-sm">{dest.country}</p>
                      <p className="text-xs text-muted-foreground">
                        {dest.calls.toLocaleString()} calls | {dest.minutes.toLocaleString()} min
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm">${dest.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyUsage.map((day) => (
                <div key={day.day} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`day-${day.day.toLowerCase()}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-center">
                      <p className="font-medium text-sm">{day.day}</p>
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${(day.calls / 2100) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{day.calls.toLocaleString()} calls</p>
                    <p className="text-xs text-muted-foreground">${day.cost.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Usage Trends</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs last period
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Call Duration</p>
              <p className="text-xl font-bold mt-1">3:38</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Hour</p>
              <p className="text-xl font-bold mt-1">2:00 PM</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost per Minute</p>
              <p className="text-xl font-bold mt-1">$0.028</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-xl font-bold mt-1">97.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
