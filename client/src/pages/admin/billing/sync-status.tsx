import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Server, Users, CreditCard, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const mockSyncStatus = [
  {
    id: "customers",
    name: "Customers",
    icon: Users,
    direction: "push",
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    status: "synced",
    recordsProcessed: 45,
  },
  {
    id: "balances",
    name: "Balances",
    icon: CreditCard,
    direction: "push",
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    status: "synced",
    recordsProcessed: 45,
  },
  {
    id: "rate-cards",
    name: "Rate Cards",
    icon: FileText,
    direction: "push",
    lastSync: new Date(Date.now() - 60 * 60 * 1000),
    status: "synced",
    recordsProcessed: 12,
  },
  {
    id: "cdrs",
    name: "CDRs",
    icon: FileText,
    direction: "pull",
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    status: "synced",
    recordsProcessed: 1523,
  },
  {
    id: "stats",
    name: "Real-time Stats",
    icon: Server,
    direction: "pull",
    lastSync: new Date(Date.now() - 1 * 60 * 1000),
    status: "synced",
    recordsProcessed: 1,
  },
];

const mockSyncHistory = [
  { timestamp: new Date(Date.now() - 5 * 60 * 1000), type: "cdrs", direction: "pull", records: 152, status: "success" },
  { timestamp: new Date(Date.now() - 10 * 60 * 1000), type: "cdrs", direction: "pull", records: 148, status: "success" },
  { timestamp: new Date(Date.now() - 15 * 60 * 1000), type: "cdrs", direction: "pull", records: 167, status: "success" },
  { timestamp: new Date(Date.now() - 20 * 60 * 1000), type: "balances", direction: "push", records: 3, status: "success" },
  { timestamp: new Date(Date.now() - 25 * 60 * 1000), type: "cdrs", direction: "pull", records: 143, status: "success" },
];

export default function SyncStatusPage() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "stale":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      synced: "secondary",
      syncing: "default",
      error: "destructive",
      stale: "outline",
    };
    return <Badge variant={variants[status] || "outline"} className="capitalize">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">ConnexCS Sync Status</h1>
          <p className="text-muted-foreground">Monitor data synchronization between DIDTron and ConnexCS</p>
        </div>
        <Button onClick={handleSyncAll} disabled={isSyncing} data-testid="button-sync-all">
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          Sync All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-blue-500" />
                  Push to ConnexCS
                </CardTitle>
                <CardDescription>Data sent from DIDTron to ConnexCS</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockSyncStatus.filter(s => s.direction === "push").map((sync) => {
              const Icon = sync.icon;
              return (
                <div key={sync.id} className="flex items-center justify-between gap-4" data-testid={`sync-${sync.id}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sync.status)}
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{sync.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(sync.lastSync, { addSuffix: true })}
                    </span>
                    {getStatusBadge(sync.status)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-green-500" />
                  Pull from ConnexCS
                </CardTitle>
                <CardDescription>Data received from ConnexCS to DIDTron</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockSyncStatus.filter(s => s.direction === "pull").map((sync) => {
              const Icon = sync.icon;
              return (
                <div key={sync.id} className="flex items-center justify-between gap-4" data-testid={`sync-${sync.id}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sync.status)}
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{sync.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(sync.lastSync, { addSuffix: true })}
                    </span>
                    {getStatusBadge(sync.status)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Recent synchronization activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="text-right">Records</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSyncHistory.map((entry, idx) => (
                <TableRow key={idx} data-testid={`row-history-${idx}`}>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                  </TableCell>
                  <TableCell className="capitalize">{entry.type}</TableCell>
                  <TableCell>
                    {entry.direction === "push" ? (
                      <Badge variant="outline" className="gap-1">
                        <ArrowUpRight className="h-3 w-3" />Push
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <ArrowDownRight className="h-3 w-3" />Pull
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">{entry.records}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === "success" ? "secondary" : "destructive"}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
