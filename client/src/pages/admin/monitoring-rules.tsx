import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Gauge, Plus, Edit, Trash2, Play, Pause,
  AlertTriangle, Bell, Zap
} from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";

interface MonitoringRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  action: string;
  isActive: boolean;
  lastTriggered: Date | null;
}

export default function MonitoringRulesPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    metric: "asr",
    condition: "less_than",
    threshold: "50",
    action: "alert",
  });

  const rules: MonitoringRule[] = [
    {
      id: "1",
      name: "Low ASR Alert",
      metric: "ASR",
      condition: "Less than",
      threshold: 50,
      action: "Send Alert + Pause Route",
      isActive: true,
      lastTriggered: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      name: "High PDD Warning",
      metric: "PDD",
      condition: "Greater than",
      threshold: 8,
      action: "Send Alert",
      isActive: true,
      lastTriggered: null,
    },
    {
      id: "3",
      name: "Capacity Threshold",
      metric: "Concurrent Calls",
      condition: "Greater than",
      threshold: 1000,
      action: "Send Alert",
      isActive: false,
      lastTriggered: new Date(Date.now() - 86400000),
    },
    {
      id: "4",
      name: "Low Balance Alert",
      metric: "Customer Balance",
      condition: "Less than",
      threshold: 100,
      action: "Send Email",
      isActive: true,
      lastTriggered: new Date(Date.now() - 7200000),
    },
  ];

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(rules);

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleToggleRule = (ruleId: string, currentState: boolean) => {
    toast({
      title: currentState ? "Rule Disabled" : "Rule Enabled",
      description: `Monitoring rule has been ${currentState ? "disabled" : "enabled"}`,
    });
  };

  const handleCreateRule = () => {
    toast({ title: "Rule Created", description: "New monitoring rule has been created" });
    setShowCreateDialog(false);
    setNewRule({ name: "", metric: "asr", condition: "less_than", threshold: "50", action: "alert" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monitoring Rules</h1>
          <p className="text-muted-foreground">Configure automated alerts and actions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-rule">
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Monitoring Rule</DialogTitle>
              <DialogDescription>
                Set up automated monitoring and alerting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="Low ASR Alert"
                  data-testid="input-rule-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Metric</Label>
                  <Select
                    value={newRule.metric}
                    onValueChange={(v) => setNewRule({ ...newRule, metric: v })}
                  >
                    <SelectTrigger data-testid="select-metric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asr">ASR (Answer Seizure Ratio)</SelectItem>
                      <SelectItem value="pdd">PDD (Post Dial Delay)</SelectItem>
                      <SelectItem value="acd">ACD (Avg Call Duration)</SelectItem>
                      <SelectItem value="concurrent">Concurrent Calls</SelectItem>
                      <SelectItem value="balance">Customer Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={newRule.condition}
                    onValueChange={(v) => setNewRule({ ...newRule, condition: v })}
                  >
                    <SelectTrigger data-testid="select-condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Threshold Value</Label>
                <Input
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: e.target.value })}
                  data-testid="input-threshold"
                />
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={newRule.action}
                  onValueChange={(v) => setNewRule({ ...newRule, action: v })}
                >
                  <SelectTrigger data-testid="select-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert">Send Alert Only</SelectItem>
                    <SelectItem value="alert_pause">Alert + Pause Route</SelectItem>
                    <SelectItem value="alert_email">Alert + Email Customer</SelectItem>
                    <SelectItem value="webhook">Trigger Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule} data-testid="button-save-rule">
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-green-500/10">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => r.lastTriggered).length}</p>
                <p className="text-sm text-muted-foreground">Triggered Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rules.length}</p>
                <p className="text-sm text-muted-foreground">Total Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Rules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((rule) => (
                <TableRow key={rule.id} data-testid={`row-rule-${rule.id}`}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.metric}</Badge>
                  </TableCell>
                  <TableCell>
                    {rule.condition} {rule.threshold}
                  </TableCell>
                  <TableCell className="text-sm">{rule.action}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatTimeAgo(rule.lastTriggered)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => handleToggleRule(rule.id, rule.isActive)}
                      data-testid={`switch-rule-${rule.id}`}
                      aria-label={`Toggle ${rule.name} rule`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" aria-label="Edit rule">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Delete rule">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DataTableFooter
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
