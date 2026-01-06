import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, Bell, BellOff, Check, X, Search, 
  Filter, Clock, Plus
} from "lucide-react";

interface Alert {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
}

export default function AlertsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const alerts: Alert[] = [
    {
      id: "1",
      type: "route_failure",
      severity: "critical",
      message: "Route US-MOBILE-T1 failed with ASR below 50%",
      source: "Route Monitoring",
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false,
    },
    {
      id: "2",
      type: "low_balance",
      severity: "warning",
      message: "Customer Acme Corp balance below $100 threshold",
      source: "Billing System",
      timestamp: new Date(Date.now() - 900000),
      acknowledged: false,
    },
    {
      id: "3",
      type: "capacity",
      severity: "info",
      message: "Trunk EU-CARRIER-1 approaching 80% capacity",
      source: "Traffic Monitor",
      timestamp: new Date(Date.now() - 1800000),
      acknowledged: true,
    },
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = !searchTerm || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "warning": return "secondary";
      default: return "outline";
    }
  };

  const handleAcknowledge = (alertId: string) => {
    toast({ title: "Alert Acknowledged", description: "Alert has been marked as acknowledged" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-alert">
              <Plus className="h-4 w-4 mr-2" />
              Create Test Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Test Alert</DialogTitle>
              <DialogDescription>
                Create a test alert for debugging purposes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Alert Message</Label>
                <Input placeholder="Enter alert message" data-testid="input-alert-message" />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select defaultValue="warning">
                  <SelectTrigger data-testid="select-alert-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button data-testid="button-submit-alert">Create Alert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.filter(a => a.severity === "critical" && !a.acknowledged).length}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-yellow-500/10">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.filter(a => a.severity === "warning" && !a.acknowledged).length}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-blue-500/10">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.filter(a => a.severity === "info" && !a.acknowledged).length}</p>
                <p className="text-sm text-muted-foreground">Info</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-green-500/10">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.filter(a => a.acknowledged).length}</p>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Active Alerts</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-alerts"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-36" data-testid="select-severity-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id} data-testid={`row-alert-${alert.id}`}>
                  <TableCell>
                    <Badge variant={getSeverityVariant(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">{alert.message}</TableCell>
                  <TableCell className="text-muted-foreground">{alert.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(alert.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {alert.acknowledged ? (
                      <Badge variant="outline">Acknowledged</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledge(alert.id)}
                        data-testid={`button-acknowledge-${alert.id}`}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Acknowledge
                      </Button>
                    )}
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
