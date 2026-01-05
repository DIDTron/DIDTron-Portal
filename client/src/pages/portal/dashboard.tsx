import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, Phone, Globe, TrendingUp, TrendingDown,
  ArrowRight, Plus, CreditCard, MessageSquare
} from "lucide-react";
import { Link } from "wouter";

export default function CustomerDashboard() {
  const stats = [
    { label: "Account Balance", value: "$1,245.50", icon: DollarSign, change: null, trend: null },
    { label: "Calls Today", value: "1,234", icon: Phone, change: "+12%", trend: "up" },
    { label: "Active DIDs", value: "15", icon: Globe, change: null, trend: null },
    { label: "This Month", value: "$2,456.78", icon: TrendingUp, change: "-5%", trend: "down" },
  ];

  const recentCalls = [
    { destination: "+1 555 123 4567", duration: "4:32", cost: "$0.24", time: "2 min ago" },
    { destination: "+44 20 7946 0958", duration: "12:15", cost: "$0.89", time: "15 min ago" },
    { destination: "+33 1 42 86 82 28", duration: "1:45", cost: "$0.12", time: "1 hour ago" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Acme Corp</h1>
          <p className="text-muted-foreground">Here's your account overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/portal/billing">
            <Button variant="outline" data-testid="button-add-funds">
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </Link>
          <Link href="/portal/support/new">
            <Button variant="outline" data-testid="button-support">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
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
                  {stat.change && (
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span className={`text-xs ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Recent Calls</CardTitle>
            <Link href="/portal/voice/usage">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCalls.map((call, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`call-${index}`}>
                  <div>
                    <p className="font-mono text-sm">{call.destination}</p>
                    <p className="text-xs text-muted-foreground">{call.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{call.duration}</p>
                    <p className="text-xs text-muted-foreground">{call.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/portal/dids/search">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="action-buy-did">
                  <Globe className="h-5 w-5" />
                  <span>Buy DID</span>
                </Button>
              </Link>
              <Link href="/portal/voice/rates">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="action-view-rates">
                  <Phone className="h-5 w-5" />
                  <span>View Rates</span>
                </Button>
              </Link>
              <Link href="/portal/billing">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="action-add-credit">
                  <CreditCard className="h-5 w-5" />
                  <span>Add Credit</span>
                </Button>
              </Link>
              <Link href="/portal/billing/invoices">
                <Button variant="outline" className="w-full h-20 flex-col gap-2" data-testid="action-invoices">
                  <DollarSign className="h-5 w-5" />
                  <span>Invoices</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Prepaid</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voice Tier</p>
              <p className="font-medium mt-1">Premium Quality</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KYC Status</p>
              <Badge variant="default" className="mt-1">Verified</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open Tickets</p>
              <p className="font-medium mt-1">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
