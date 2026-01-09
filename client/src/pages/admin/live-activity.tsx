import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, Phone, PhoneCall, PhoneOff, Users, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Pause, Play
} from "lucide-react";

interface LiveCall {
  id: string;
  callerId: string;
  destination: string;
  duration: number;
  direction: "inbound" | "outbound";
  status: "ringing" | "connected" | "on_hold";
  startedAt: Date;
}

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

export default function LiveActivityPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh for mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const [activeCalls, setActiveCalls] = useState<LiveCall[]>([
    {
      id: "1",
      callerId: "+1 (555) 123-4567",
      destination: "+44 20 7946 0958",
      duration: 125,
      direction: "outbound",
      status: "connected",
      startedAt: new Date(Date.now() - 125000),
    },
    {
      id: "2",
      callerId: "+1 (555) 987-6543",
      destination: "+33 1 42 86 82 28",
      duration: 45,
      direction: "inbound",
      status: "ringing",
      startedAt: new Date(Date.now() - 45000),
    },
  ]);

  const [recentEvents, setRecentEvents] = useState<ActivityEvent[]>([
    { id: "1", type: "call_started", message: "Call started to +44 20 7946 0958", timestamp: new Date(Date.now() - 125000) },
    { id: "2", type: "customer_login", message: "Customer Acme Corp logged in", timestamp: new Date(Date.now() - 300000) },
    { id: "3", type: "payment", message: "Payment of $500.00 received from TechStart Inc", timestamp: new Date(Date.now() - 600000) },
    { id: "4", type: "did_provisioned", message: "DID +1 (555) 111-2222 provisioned", timestamp: new Date(Date.now() - 900000) },
  ]);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveCalls(prev => prev.map(call => ({
        ...call,
        duration: call.duration + 1
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live Activity</h1>
          <p className="text-muted-foreground">Platform activity monitoring (Demo)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPaused(!isPaused)}
            data-testid="button-toggle-pause"
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-green-500/10">
                <PhoneCall className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCalls.length}</p>
                <p className="text-sm text-muted-foreground">Active Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Online Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Events Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-yellow-500/10">
                <Phone className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-muted-foreground">Calls Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Active Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCalls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PhoneOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active calls</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`call-${call.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {call.direction === "outbound" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-blue-600" />
                      )}
                      <div>
                        <p className="font-mono text-sm">{call.callerId}</p>
                        <p className="text-xs text-muted-foreground">to {call.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={call.status === "connected" ? "default" : "secondary"}
                      >
                        {call.status}
                      </Badge>
                      <span className="font-mono text-sm tabular-nums">
                        {formatDuration(call.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-sm">{event.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
