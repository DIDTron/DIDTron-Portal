import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

type RuleAction = "none" | "alert-only" | "reject-rate" | "block-rate";

interface RuleConfig {
  ruleType: string;
  rule: string;
  threshold: string;
  unit: string;
  action: RuleAction;
}

const defaultRules: RuleConfig[] = [
  { ruleType: "Notice Period", rule: "Rate Increase", threshold: "7", unit: "Days", action: "none" },
  { ruleType: "Notice Period", rule: "Rate Decrease", threshold: "1", unit: "Days", action: "none" },
  { ruleType: "Notice Period", rule: "New Rate", threshold: "7", unit: "Days", action: "none" },
  { ruleType: "Notice Period", rule: "Rate Deletion", threshold: "7", unit: "Days", action: "none" },
  { ruleType: "Notice Period", rule: "Rate Blocked", threshold: "7", unit: "Days", action: "none" },
  { ruleType: "Notice Period", rule: "Oldest Effective Date", threshold: "30", unit: "Days", action: "none" },
  { ruleType: "Notice Period", rule: "Maximum Effective Date", threshold: "30", unit: "Days", action: "none" },
  { ruleType: "Pricing", rule: "Max Increase", threshold: "", unit: "%", action: "none" },
  { ruleType: "Pricing", rule: "Max Decrease", threshold: "", unit: "%", action: "none" },
  { ruleType: "Pricing", rule: "Max Rate", threshold: "", unit: "", action: "none" },
  { ruleType: "Valid Periods", rule: "Initial Periods", threshold: "0,1,60", unit: "", action: "none" },
  { ruleType: "Valid Periods", rule: "Recurring Periods", threshold: "1,60", unit: "", action: "none" },
  { ruleType: "Destination", rule: "Code Moved To New Zone", threshold: "", unit: "", action: "none" },
];

export function BusinessRuleDetailPage() {
  const [, params] = useRoute("/admin/softswitch/rating/business-rule/:ruleId");
  const ruleId = params?.ruleId;
  const isNew = ruleId === "new";
  
  const [name, setName] = useState(isNew ? "" : "");
  const [rules, setRules] = useState<RuleConfig[]>(defaultRules);
  const [isEditing, setIsEditing] = useState(isNew);
  
  const { toast } = useToast();

  const updateRule = (index: number, field: keyof RuleConfig, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter a name for the business rule", variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: `Business rule "${name}" has been saved` });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isNew) {
      window.location.href = "/admin/softswitch/rating/supplier-plans";
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/admin/softswitch/rating/supplier-plans" className="hover:text-foreground">Supplier Rating</a>
        <span>/</span>
        <span className="text-foreground">{isNew ? "New Business Rule" : name || "Business Rule"}</span>
      </div>

      {/* Tab */}
      <div className="border-b">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-none border-b-2 border-primary px-4"
          data-testid="tab-business-rule"
        >
          Business Rule
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-[300px_1fr] gap-8">
        {/* Left Side - Rule Details */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Rule Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-business-rule-name"
                />
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label>Assigned</Label>
                <span className="text-sm">{isNew ? "No" : "No"}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <Label>Last Updated</Label>
                <span className="text-sm">{isNew ? "-" : "-"}</span>
              </div>
            </div>
          </div>

          {/* Business Rules Breach Actions Info Card */}
          <Card className="border-muted">
            <CardContent className="pt-4 space-y-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Business Rules Breach Actions</span>
              </div>
              
              <div>
                <h4 className="font-semibold">None</h4>
                <p className="text-muted-foreground">Business Rule will not be applied to imported rates.</p>
              </div>

              <div>
                <h4 className="font-semibold">Alert Only</h4>
                <p className="text-muted-foreground">
                  Rate changes breaching Business Rule will be identified on the import analysis. 
                  Alerted rates can be manually rejected if required. By default, alerted rates will 
                  be included within the import when plan changes are committed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Reject Rate</h4>
                <p className="text-muted-foreground">
                  Rate changes breaching Business Rule will be identified and automatically added to 
                  the rejected section of the import analysis. Rejected rates will not be imported 
                  when the plan changes are committed unless manually accepted.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Block Rate</h4>
                <p className="text-muted-foreground">
                  Rate changes breaching Business Rule will be identified and automatically added to 
                  the BR Blocked section of the import analysis. Blocked rates will be imported with 
                  blocked state when the plan changes are committed and unless manually unblocked on 
                  the analysis.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Importing a New Plan</h4>
                <p className="text-muted-foreground">
                  On importing a new plan, where business rules have been configured, then only the 
                  following Business Rules will be applied: Max Rate, Oldest Effective Date, Maximum 
                  Effective Date, Initial Periods and Recurring Period.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Rules and Actions Table */}
        <div>
          <h3 className="font-semibold mb-4">Rules and Actions</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#3d4f5f]">
                <TableHead className="text-white text-xs">Rule Type</TableHead>
                <TableHead className="text-white text-xs">Rule</TableHead>
                <TableHead className="text-white text-xs" colSpan={2}>Threshold</TableHead>
                <TableHead className="text-white text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule, index) => (
                <TableRow key={index}>
                  <TableCell className="text-sm">{rule.ruleType}</TableCell>
                  <TableCell className="text-sm">{rule.rule}</TableCell>
                  <TableCell className="text-sm">
                    <Input
                      value={rule.threshold}
                      onChange={(e) => updateRule(index, "threshold", e.target.value)}
                      disabled={!isEditing}
                      className="w-24 h-8"
                      data-testid={`input-threshold-${index}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{rule.unit}</TableCell>
                  <TableCell>
                    <Select
                      value={rule.action}
                      onValueChange={(v) => updateRule(index, "action", v as RuleAction)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="w-28 h-8" data-testid={`select-action-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="alert-only">Alert Only</SelectItem>
                        <SelectItem value="reject-rate">Reject Rate</SelectItem>
                        <SelectItem value="block-rate">Block Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save">
              Save
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} data-testid="button-edit">
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
