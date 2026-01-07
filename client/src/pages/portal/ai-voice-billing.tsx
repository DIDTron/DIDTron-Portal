import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";
import { 
  DollarSign, CreditCard, Clock, TrendingUp, Download, Plus,
  Phone, Bot, BarChart3, Loader2, ArrowUpRight
} from "lucide-react";

type BillingData = {
  balance: number;
  totalSpent: number;
  currentPeriodUsage: number;
  pricingTier: {
    name: string;
    ratePerMinute: number;
    setupFee: number;
  };
};

type UsageRecord = {
  id: string;
  date: string;
  agentName: string;
  minutes: number;
  calls: number;
  cost: number;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

export default function CustomerAiVoiceBillingPage() {
  const [period, setPeriod] = useState("current");

  const { data: billing, isLoading: billingLoading } = useQuery<BillingData>({
    queryKey: ["/api/my/ai-voice/billing"],
  });

  const { data: usageRecords = [], isLoading: usageLoading } = useQuery<UsageRecord[]>({
    queryKey: ["/api/my/ai-voice/usage", period],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/my/ai-voice/transactions"],
  });

  const defaultBilling: BillingData = {
    balance: 0,
    totalSpent: 0,
    currentPeriodUsage: 0,
    pricingTier: {
      name: "Standard",
      ratePerMinute: 0.10,
      setupFee: 0,
    },
  };

  const data = billing || defaultBilling;

  if (billingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">AI Voice Billing</h1>
          <p className="text-muted-foreground">
            Monitor usage and manage your AI voice spending
          </p>
        </div>
        <Link href="/portal/billing">
          <Button data-testid="button-add-funds">
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-balance">
              ${data.balance.toFixed(2)}
            </div>
            <Link href="/portal/billing">
              <Button variant="ghost" className="px-0 h-auto text-xs text-primary">Top up now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">This Period</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-period-usage">
              ${data.currentPeriodUsage.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Resets on the 1st of each month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-spent">
              ${data.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Your Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rate">
              ${data.pricingTier.ratePerMinute.toFixed(2)}/min
            </div>
            <Badge variant="secondary" className="mt-1">{data.pricingTier.name}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Usage Breakdown</CardTitle>
                <CardDescription>Daily AI voice usage by agent</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32" data-testid="select-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">This Month</SelectItem>
                    <SelectItem value="last">Last Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" data-testid="button-export">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : usageRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No usage records for this period
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Minutes</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageRecords.map((record) => (
                    <TableRow key={record.id} data-testid={`row-usage-${record.id}`}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{record.agentName}</TableCell>
                      <TableCell>{record.calls}</TableCell>
                      <TableCell>{record.minutes.toFixed(1)}</TableCell>
                      <TableCell className="text-right">${record.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>AI Voice related charges</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={tx.type === "credit" ? "text-green-600" : ""}>
                      {tx.type === "credit" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Details</CardTitle>
          <CardDescription>Your current AI Voice pricing plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Per-Minute Rate</h4>
              </div>
              <p className="text-2xl font-bold">${data.pricingTier.ratePerMinute.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">
                Billed per second with 6-second increments
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Setup Fee</h4>
              </div>
              <p className="text-2xl font-bold">
                {data.pricingTier.setupFee > 0 ? `$${data.pricingTier.setupFee.toFixed(2)}` : "Free"}
              </p>
              <p className="text-sm text-muted-foreground">
                One-time fee per agent created
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Included Features</h4>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">AI Conversations</Badge>
                <Badge variant="secondary">Transcripts</Badge>
                <Badge variant="secondary">Analytics</Badge>
                <Badge variant="secondary">Recording</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
