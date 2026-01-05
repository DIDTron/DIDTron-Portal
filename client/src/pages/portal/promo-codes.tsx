import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tag, Gift, CheckCircle, Clock, XCircle, 
  Percent, DollarSign, Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface RedeemedCode {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  status: "active" | "used" | "expired";
  redeemedAt: string;
  expiresAt?: string;
}

interface AvailableBonus {
  id: string;
  name: string;
  description: string;
  type: "signup" | "deposit" | "volume" | "percentage" | "fixed";
  value: number;
  minSpend?: number;
  expiresAt?: string;
}

export default function PromoCodesPage() {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");

  const { data: redeemedCodes, isLoading: loadingCodes } = useQuery<RedeemedCode[]>({
    queryKey: ["/api/my/promo-codes"],
  });

  const { data: bonuses, isLoading: loadingBonuses } = useQuery<AvailableBonus[]>({
    queryKey: ["/api/my/bonuses"],
  });

  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/my/promo-codes/redeem", { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/promo-codes"] });
      toast({ title: "Promo Code Applied", description: "Your discount has been added to your account" });
      setPromoCode("");
    },
    onError: () => {
      toast({ title: "Invalid Code", description: "This promo code is invalid or has expired", variant: "destructive" });
    },
  });

  const handleRedeem = () => {
    if (promoCode.trim()) {
      redeemMutation.mutate(promoCode.trim().toUpperCase());
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promo Codes & Bonuses</h1>
        <p className="text-muted-foreground">Redeem promo codes and view your available bonuses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Redeem Promo Code
          </CardTitle>
          <CardDescription>
            Enter a promo code to get discounts on your VoIP services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="promo-code" className="sr-only">Promo Code</Label>
              <Input
                id="promo-code"
                placeholder="Enter promo code (e.g., WELCOME20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="uppercase font-mono"
                data-testid="input-promo-code"
              />
            </div>
            <Button 
              onClick={handleRedeem} 
              disabled={!promoCode.trim() || redeemMutation.isPending}
              data-testid="button-redeem"
            >
              {redeemMutation.isPending ? "Applying..." : "Apply Code"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Available Bonuses
            </CardTitle>
            <CardDescription>Special offers available for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBonuses ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !bonuses?.length ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No bonuses available right now</p>
                <p className="text-sm text-muted-foreground">Check back later for special offers</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bonuses.map((bonus) => (
                  <div 
                    key={bonus.id} 
                    className="p-4 border rounded-md bg-muted/30"
                    data-testid={`card-bonus-${bonus.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{bonus.name}</p>
                          <p className="text-sm text-muted-foreground">{bonus.description}</p>
                          {bonus.minSpend && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Min. spend: ${bonus.minSpend}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {bonus.type === "percentage" ? (
                          <><Percent className="h-3 w-3 mr-1" />{bonus.value}% off</>
                        ) : (
                          <><DollarSign className="h-3 w-3 mr-1" />${bonus.value}</>
                        )}
                      </Badge>
                    </div>
                    {bonus.expiresAt && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Expires {bonus.expiresAt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Redeemed Codes
            </CardTitle>
            <CardDescription>Your promo code history</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCodes ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !redeemedCodes?.length ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No codes redeemed yet</p>
                <p className="text-sm text-muted-foreground">Enter a promo code above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redeemedCodes.map((code) => (
                  <div 
                    key={code.id} 
                    className="flex items-center justify-between p-3 border rounded-md"
                    data-testid={`row-code-${code.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        {code.status === "active" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : code.status === "used" ? (
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono font-medium">{code.code}</p>
                        <p className="text-sm text-muted-foreground">{code.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={code.status === "active" ? "default" : "secondary"}>
                        {code.discountType === "percentage" ? `${code.discountValue}%` : `$${code.discountValue}`}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {code.redeemedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
