import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard, DollarSign, TrendingUp, Plus, 
  ArrowUpRight, Clock, Receipt, Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function BillingPage() {
  const { toast } = useToast();
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [amount, setAmount] = useState("50");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleAddFunds = () => {
    toast({ title: "Payment Processing", description: `Adding $${amount} to your balance...` });
    setShowAddFundsDialog(false);
  };

  const recentTransactions = [
    { type: "credit", description: "Balance Top-up", amount: 100, date: new Date(Date.now() - 86400000) },
    { type: "debit", description: "Voice Usage - Jan 4", amount: -24.56, date: new Date(Date.now() - 172800000) },
    { type: "debit", description: "DID Renewal - +1 555 123 4567", amount: -1.50, date: new Date(Date.now() - 259200000) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing & Balance</h1>
          <p className="text-muted-foreground">Manage your account balance and payments</p>
        </div>
        <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-funds">
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funds</DialogTitle>
              <DialogDescription>
                Top up your account balance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="grid grid-cols-4 gap-2">
                  {["25", "50", "100", "250"].map(val => (
                    <Button
                      key={val}
                      variant={amount === val ? "default" : "outline"}
                      onClick={() => setAmount(val)}
                    >
                      ${val}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="mt-2"
                  data-testid="input-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddFundsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFunds} data-testid="button-confirm-payment">
                Pay ${amount}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">$1,245.50</p>
                <p className="text-sm text-muted-foreground">Current Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">$456.78</p>
                <p className="text-sm text-muted-foreground">This Month Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-accent">
                <Receipt className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">$12.50</p>
                <p className="text-sm text-muted-foreground">DID Renewals Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">27 days</p>
                <p className="text-sm text-muted-foreground">Est. Balance Life</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`tx-${index}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${tx.type === "credit" ? "bg-primary/10" : "bg-destructive/10"}`}>
                      {tx.type === "credit" ? (
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-mono ${tx.amount > 0 ? "text-primary" : ""}`}>
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/portal/billing/transactions">
              <Button variant="ghost" className="w-full mt-4">
                View All Transactions
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Badge variant="default">Default</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" data-testid="button-add-card">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auto Top-Up</CardTitle>
          <CardDescription>
            Automatically add funds when your balance gets low
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto top-up is disabled</p>
              <p className="text-sm text-muted-foreground">
                Enable to automatically add $50 when balance falls below $25
              </p>
            </div>
            <Button variant="outline" data-testid="button-enable-auto-topup">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
