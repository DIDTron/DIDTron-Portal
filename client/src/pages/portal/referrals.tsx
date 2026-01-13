import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Gift, DollarSign, Copy, Share2, 
  CheckCircle, Clock, UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/queryClient";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: {
    total: number;
    successful: number;
    pending: number;
    earnings: string;
  };
  referrals: Array<{
    id: string;
    referredId: string | null;
    status: string;
    commission: string | null;
    createdAt: string;
  }>;
}

export default function ReferralsPage() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ["/api/my/referral"],
    staleTime: STALE_TIME.DETAIL,
  });

  const copyToClipboard = async (text: string) => {
    try {
      if (!navigator.clipboard) {
        toast({ title: "Copy Failed", description: "Clipboard access not available", variant: "destructive" });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Referral link copied to clipboard" });
    } catch (err) {
      toast({ title: "Copy Failed", description: "Unable to copy to clipboard", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">Earn rewards by inviting others to DIDTron</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-total-referrals">{data?.stats.total || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-successful">{data?.stats.successful || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-accent">
                <Clock className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{data?.stats.pending || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold" data-testid="text-earnings">${data?.stats.earnings || "0.00"}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends and earn $10 for each successful signup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {isLoading ? (
              <Skeleton className="h-10 flex-1" />
            ) : (
              <>
                <Input 
                  value={data?.referralLink || ""} 
                  readOnly 
                  className="flex-1 font-mono text-sm"
                  data-testid="input-referral-link"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(data?.referralLink || "")}
                  data-testid="button-copy-link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  data-testid="button-share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Your code: <span className="font-mono font-medium text-foreground">{data?.referralCode}</span></span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">1. Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Send your unique referral link to friends, colleagues, or on social media
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">2. They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                When they create an account and make their first purchase
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">3. Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                You get $10 credit and they get 10% off their first month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.referrals.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet</p>
              <p className="text-sm">Share your link to start earning rewards</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.referrals.map((referral, index) => (
                <div 
                  key={referral.id} 
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  data-testid={`referral-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {referral.referredId ? "Referred User" : "Pending Signup"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={referral.status === "converted" ? "default" : "secondary"}>
                      {referral.status}
                    </Badge>
                    {referral.commission && parseFloat(referral.commission) > 0 && (
                      <span className="text-primary font-mono">
                        +${parseFloat(referral.commission).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
