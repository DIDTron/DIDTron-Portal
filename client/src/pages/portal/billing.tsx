import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard, DollarSign, TrendingUp, Plus, 
  ArrowUpRight, Clock, Receipt, Wallet, ArrowDownLeft, Gift, Loader2, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import type { Customer, Payment } from "@shared/schema";

export default function BillingPage() {
  const { toast } = useToast();
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [showAutoTopUpDialog, setShowAutoTopUpDialog] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [amount, setAmount] = useState("50");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [autoTopUpEnabled, setAutoTopUpEnabled] = useState(false);
  const [autoTopUpAmount, setAutoTopUpAmount] = useState("50");
  const [autoTopUpThreshold, setAutoTopUpThreshold] = useState("25");

  const { data: profile, isLoading: profileLoading } = useQuery<Customer>({
    queryKey: ["/api/my/profile"],
    staleTime: STALE_TIME.DETAIL,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/my/payments"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const addFundsMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      return await apiRequest("POST", "/api/my/add-funds", data);
    },
    onSuccess: () => {
      toast({ title: "Payment Processing", description: `Adding $${amount} to your balance...` });
      queryClient.invalidateQueries({ queryKey: ["/api/my/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my/payments"] });
      setShowAddFundsDialog(false);
    },
    onError: () => {
      toast({ title: "Payment Failed", description: "Unable to process payment. Please try again.", variant: "destructive" });
    },
  });

  const redeemPromoMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/my/promo-codes/redeem", { code });
      return res.json() as Promise<{ message: string }>;
    },
    onSuccess: (data) => {
      toast({ title: "Promo Code Redeemed", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/my/profile"] });
      setShowPromoDialog(false);
      setPromoCode("");
    },
    onError: (error: Error) => {
      toast({ title: "Invalid Code", description: error.message, variant: "destructive" });
    },
  });

  const handleAddFunds = () => {
    addFundsMutation.mutate({ amount: parseFloat(amount), method: paymentMethod });
  };

  const updateAutoTopUpMutation = useMutation({
    mutationFn: async (data: { autoTopUpEnabled: boolean; autoTopUpAmount: string; autoTopUpThreshold: string }) => {
      return await apiRequest("PATCH", "/api/my/profile", data);
    },
    onSuccess: () => {
      toast({ title: "Auto Top-Up Updated", description: autoTopUpEnabled ? "Auto top-up has been enabled" : "Auto top-up settings saved" });
      queryClient.invalidateQueries({ queryKey: ["/api/my/profile"] });
      setShowAutoTopUpDialog(false);
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleAutoTopUpSave = () => {
    updateAutoTopUpMutation.mutate({
      autoTopUpEnabled,
      autoTopUpAmount,
      autoTopUpThreshold,
    });
  };

  const openAutoTopUpDialog = () => {
    setAutoTopUpEnabled(profile?.autoTopUpEnabled || false);
    setAutoTopUpAmount(profile?.autoTopUpAmount || "50");
    setAutoTopUpThreshold(profile?.autoTopUpThreshold || "25");
    setShowAutoTopUpDialog(true);
  };

  const balance = parseFloat(profile?.balance || "0");
  const recentPayments = payments.slice(0, 5);

  const estimateDaysRemaining = () => {
    const avgDailySpend = 16.7;
    if (avgDailySpend <= 0) return "N/A";
    const days = Math.floor(balance / avgDailySpend);
    return `${days} days`;
  };

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
              <Button onClick={handleAddFunds} disabled={addFundsMutation.isPending} data-testid="button-confirm-payment">
                {addFundsMutation.isPending ? "Processing..." : `Pay $${amount}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" data-testid="button-redeem-promo">
              <Gift className="h-4 w-4 mr-2" />
              Redeem Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redeem Promo Code</DialogTitle>
              <DialogDescription>
                Enter a promo code to add credits to your account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Promo Code</Label>
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  data-testid="input-promo-code"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPromoDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => redeemPromoMutation.mutate(promoCode)} 
                disabled={redeemPromoMutation.isPending || !promoCode.trim()}
                data-testid="button-confirm-promo"
              >
                {redeemPromoMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redeeming...</>
                ) : (
                  "Redeem"
                )}
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
                {profileLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-balance">${balance.toFixed(2)}</p>
                )}
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
                <p className="text-2xl font-bold" data-testid="text-monthly-usage">$0.00</p>
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
                <p className="text-2xl font-bold">$0.00</p>
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
                <p className="text-2xl font-bold" data-testid="text-balance-life">{estimateDaysRemaining()}</p>
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
            {paymentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment, index) => {
                  const isCredit = payment.status === "completed" && parseFloat(payment.amount || "0") > 0;
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50" data-testid={`tx-${index}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${isCredit ? "bg-primary/10" : "bg-destructive/10"}`}>
                          {isCredit ? (
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payment.description || payment.paymentMethod || "Payment"}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                      <span className={`font-mono ${isCredit ? "text-primary" : ""}`}>
                        {isCredit ? "+" : "-"}${Math.abs(parseFloat(payment.amount || "0")).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href="/portal/transactions">
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
                    <p className="font-medium text-sm">No cards on file</p>
                    <p className="text-xs text-muted-foreground">Add a payment method</p>
                  </div>
                </div>
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
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto Top-Up
          </CardTitle>
          <CardDescription>
            Automatically add funds when your balance gets low
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Auto top-up is {profile?.autoTopUpEnabled ? "enabled" : "disabled"}</p>
                {profile?.autoTopUpEnabled && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {profile?.autoTopUpEnabled 
                  ? `Add $${profile?.autoTopUpAmount || 50} when balance falls below $${profile?.autoTopUpThreshold || 25}`
                  : "Enable to never run out of balance"
                }
              </p>
            </div>
            <Button variant="outline" onClick={openAutoTopUpDialog} data-testid="button-toggle-auto-topup">
              {profile?.autoTopUpEnabled ? "Configure" : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAutoTopUpDialog} onOpenChange={setShowAutoTopUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto Top-Up Settings</DialogTitle>
            <DialogDescription>
              Configure automatic balance recharge to never run out of funds
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Auto Top-Up</p>
                <p className="text-sm text-muted-foreground">Automatically add funds when balance is low</p>
              </div>
              <Switch
                checked={autoTopUpEnabled}
                onCheckedChange={setAutoTopUpEnabled}
                data-testid="switch-auto-topup"
              />
            </div>
            {autoTopUpEnabled && (
              <>
                <div className="space-y-2">
                  <Label>Top-Up Amount ($)</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["25", "50", "100", "250"].map(val => (
                      <Button
                        key={val}
                        variant={autoTopUpAmount === val ? "default" : "outline"}
                        onClick={() => setAutoTopUpAmount(val)}
                        data-testid={`button-amount-${val}`}
                      >
                        ${val}
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    value={autoTopUpAmount}
                    onChange={(e) => setAutoTopUpAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="mt-2"
                    data-testid="input-auto-topup-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Threshold ($)</Label>
                  <p className="text-sm text-muted-foreground">Top up when balance falls below this amount</p>
                  <div className="grid grid-cols-4 gap-2">
                    {["10", "25", "50", "100"].map(val => (
                      <Button
                        key={val}
                        variant={autoTopUpThreshold === val ? "default" : "outline"}
                        onClick={() => setAutoTopUpThreshold(val)}
                        data-testid={`button-threshold-${val}`}
                      >
                        ${val}
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    value={autoTopUpThreshold}
                    onChange={(e) => setAutoTopUpThreshold(e.target.value)}
                    placeholder="Custom threshold"
                    className="mt-2"
                    data-testid="input-auto-topup-threshold"
                  />
                </div>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm">
                    When your balance falls below <span className="font-bold">${autoTopUpThreshold}</span>, 
                    we will automatically charge your default payment method <span className="font-bold">${autoTopUpAmount}</span>.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoTopUpDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAutoTopUpSave} 
              disabled={updateAutoTopUpMutation.isPending}
              data-testid="button-save-auto-topup"
            >
              {updateAutoTopUpMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                "Save Settings"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
