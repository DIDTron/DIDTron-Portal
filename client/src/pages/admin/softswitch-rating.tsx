import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTableFooter } from "@/components/ui/data-table-footer";
import { ChevronDown, ChevronRight, Download, Search, Settings, AlertCircle, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerRatingPlan as APICustomerRatingPlan } from "@shared/schema";

type WizardStage = 1 | 2 | 3 | 4 | 5;

interface TimeClass {
  id: string;
  name: string;
  days: string;
  startPeriod: string;
  endPeriod: string;
}

interface AddPlanFormData {
  name: string;
  currency: string;
  timeZone: string;
  carrierTimeZone: string;
  defaultRates: string;
  marginEnforcement: string;
  minMargin: string;
  effectiveDate: string;
  effectiveTime: string;
  initialInterval: string;
  recurringInterval: string;
  periodExceptionTemplate: string;
  zonesSelect: string;
  zonesFilter: string;
  assignOrigin: string;
  selectedTimeClasses: string[];
  selectedZones: string[];
}

const defaultFormData: AddPlanFormData = {
  name: "",
  currency: "USD",
  timeZone: "UTC",
  carrierTimeZone: "",
  defaultRates: "Define Later",
  marginEnforcement: "Enabled",
  minMargin: "0",
  effectiveDate: new Date().toISOString().split("T")[0],
  effectiveTime: "00:00",
  initialInterval: "0",
  recurringInterval: "1",
  periodExceptionTemplate: "None",
  zonesSelect: "None",
  zonesFilter: "",
  assignOrigin: "None",
  selectedTimeClasses: [],
  selectedZones: [],
};


const mockTimeClasses: TimeClass[] = [
  { id: "1", name: "AnyDay", days: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday", startPeriod: "00:00", endPeriod: "00:00" },
  { id: "2", name: "Middle East Weekend", days: "Friday, Saturday", startPeriod: "00:00", endPeriod: "00:00" },
  { id: "3", name: "Weekend", days: "Saturday, Sunday", startPeriod: "00:00", endPeriod: "00:00" },
];

const regionOptions = [
  "Africa-Eastern Africa", "Africa-MENA", "Africa-Middle Africa", "Africa-Southern Africa",
  "Africa-Western Africa", "Americas-Caribbean", "Americas-Central America", "Americas-Northern America",
  "Americas-South America", "Antarctica-non", "Asia-CIS", "Asia-Eastern Asia"
];

function StageIndicator({ currentStage }: { currentStage: WizardStage }) {
  const stages = [
    { num: 1, label: "Plan Details" },
    { num: 2, label: "Default Rates" },
    { num: 3, label: "Time Classes" },
    { num: 4, label: "Zones" },
    { num: 5, label: "Analysis and Creation" },
  ];

  return (
    <div className="flex items-center gap-2 text-sm border-b pb-4 mb-6">
      {stages.map((stage, idx) => (
        <div key={stage.num} className="flex items-center gap-2">
          <span
            className={cn(
              "cursor-pointer",
              currentStage === stage.num
                ? "text-primary font-medium"
                : currentStage > stage.num
                  ? "text-muted-foreground"
                  : "text-muted-foreground"
            )}
          >
            {stage.num}. {stage.label}
          </span>
          {idx < stages.length - 1 && <span className="text-muted-foreground">&gt;</span>}
        </div>
      ))}
    </div>
  );
}

function Stage1PlanDetails({ form, setForm }: { form: AddPlanFormData; setForm: (f: AddPlanFormData) => void }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-4">Customer Rating Plan Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                data-testid="input-plan-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder=""
              />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <Label htmlFor="currency">Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger data-testid="select-currency" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-4">Time Zone</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-[100px_1fr_auto_1fr] items-center gap-4">
              <Label htmlFor="timeZone">Time Zone</Label>
              <Select value={form.timeZone} onValueChange={(v) => setForm({ ...form, timeZone: v })}>
                <SelectTrigger data-testid="select-timezone" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">EST</SelectItem>
                  <SelectItem value="PST">PST</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">Default</Button>
              <div className="flex items-center gap-2">
                <Label htmlFor="carrierTimeZone">Carrier Time Zone</Label>
                <Input
                  id="carrierTimeZone"
                  data-testid="input-carrier-timezone"
                  value={form.carrierTimeZone}
                  onChange={(e) => setForm({ ...form, carrierTimeZone: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Assigned Currency
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Assigning currency to a Customer Rating Plan is mandatory.</p>
            <p className="text-destructive font-medium">Important</p>
            <p className="text-muted-foreground">
              It is not possible to change currency once the Customer Rating Plan has been created. If the wrong currency is assigned you will need to delete the rating plan and then create a new plan with the correct currency assigned.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stage2DefaultRates({ form, setForm }: { form: AddPlanFormData; setForm: (f: AddPlanFormData) => void }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-4">Default Rates</h3>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label htmlFor="defaultRates">Default Rates</Label>
            <Select value={form.defaultRates} onValueChange={(v) => setForm({ ...form, defaultRates: v })}>
              <SelectTrigger data-testid="select-default-rates" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Define Later">Define Later</SelectItem>
                <SelectItem value="Floor Price">Floor Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-4">Default Periods</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <Label htmlFor="initialInterval">Initial Interval</Label>
              <Input
                id="initialInterval"
                data-testid="input-initial-interval"
                value={form.initialInterval}
                onChange={(e) => setForm({ ...form, initialInterval: e.target.value })}
                className="w-24"
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <Label htmlFor="recurringInterval">Recurring Interval</Label>
              <Input
                id="recurringInterval"
                data-testid="input-recurring-interval"
                value={form.recurringInterval}
                onChange={(e) => setForm({ ...form, recurringInterval: e.target.value })}
                className="w-24"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-4">Period Exception</h3>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <Label htmlFor="template">Template</Label>
            <Select value={form.periodExceptionTemplate} onValueChange={(v) => setForm({ ...form, periodExceptionTemplate: v })}>
              <SelectTrigger data-testid="select-period-exception" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Period-Exception-ALL">Period-Exception-ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-4">Default Options</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
              <Label htmlFor="marginEnforcement">Margin Enforcement</Label>
              <Select value={form.marginEnforcement} onValueChange={(v) => setForm({ ...form, marginEnforcement: v })}>
                <SelectTrigger data-testid="select-margin-enforcement" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enabled">Enabled</SelectItem>
                  <SelectItem value="Disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-[140px_1fr_auto] items-center gap-4">
              <Label htmlFor="minMargin">Min Margin</Label>
              <Input
                id="minMargin"
                data-testid="input-min-margin"
                value={form.minMargin}
                onChange={(e) => setForm({ ...form, minMargin: e.target.value })}
                className="w-24"
              />
              <span>%</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-4">Rates effective from</h3>
          <div className="flex items-center gap-4">
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              type="date"
              data-testid="input-effective-date"
              value={form.effectiveDate}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              className="w-40"
            />
            <Input
              id="effectiveTime"
              type="time"
              data-testid="input-effective-time"
              value={form.effectiveTime}
              onChange={(e) => setForm({ ...form, effectiveTime: e.target.value })}
              className="w-24"
            />
          </div>
        </div>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Period Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>Period Exceptions enable overriding periods to be defined for specific Prefixes.</p>
            <p className="text-muted-foreground">
              For example: Mexico destinations (Prefix 52) often charge per minute - or "60/60". Therefore an exception can be added which defines both the initial and recurring periods as 60 seconds for all codes starting with the prefix 52.
            </p>
            <p className="font-medium">Floor Price</p>
            <p className="text-muted-foreground">
              Floor price enables customers rates to be automatically generated based on Supplier rates and Supplier position in a routing plan.
            </p>
            <p className="text-muted-foreground">
              Note: The calculation of floor price is based on a set of rules which must be created along with a routing plan before automatic rate generation can be performed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stage3TimeClasses({ form, setForm }: { form: AddPlanFormData; setForm: (f: AddPlanFormData) => void }) {
  const toggleTimeClass = (id: string) => {
    if (form.selectedTimeClasses.includes(id)) {
      setForm({ ...form, selectedTimeClasses: form.selectedTimeClasses.filter(tc => tc !== id) });
    } else {
      setForm({ ...form, selectedTimeClasses: [...form.selectedTimeClasses, id] });
    }
  };

  return (
    <div>
      <h3 className="font-medium mb-4">Select Time Classes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                data-testid="checkbox-select-all-timeclasses"
                checked={form.selectedTimeClasses.length === mockTimeClasses.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setForm({ ...form, selectedTimeClasses: mockTimeClasses.map(tc => tc.id) });
                  } else {
                    setForm({ ...form, selectedTimeClasses: [] });
                  }
                }}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Start Period</TableHead>
            <TableHead>End Period</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTimeClasses.map((tc) => (
            <TableRow key={tc.id} data-testid={`row-timeclass-${tc.id}`}>
              <TableCell>
                <Checkbox
                  data-testid={`checkbox-timeclass-${tc.id}`}
                  checked={form.selectedTimeClasses.includes(tc.id)}
                  onCheckedChange={() => toggleTimeClass(tc.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{tc.name}</TableCell>
              <TableCell className="text-muted-foreground">{tc.days}</TableCell>
              <TableCell>{tc.startPeriod}</TableCell>
              <TableCell>{tc.endPeriod}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Stage4Zones({ form, setForm }: { form: AddPlanFormData; setForm: (f: AddPlanFormData) => void }) {
  const [showRegions, setShowRegions] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Select Routing Zones to include in Rating Plan</h3>
        <div className="grid grid-cols-[80px_1fr] items-center gap-4">
          <Label htmlFor="zonesSelect">Select</Label>
          <Select value={form.zonesSelect} onValueChange={(v) => {
            setForm({ ...form, zonesSelect: v });
            setShowRegions(v === "Specify");
          }}>
            <SelectTrigger data-testid="select-zones" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Specify">Specify</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {form.zonesSelect === "Specify" && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <Label htmlFor="zonesFilter">Zones & Codes</Label>
              <Input
                id="zonesFilter"
                data-testid="input-zones-filter"
                value={form.zonesFilter}
                onChange={(e) => {
                  setForm({ ...form, zonesFilter: e.target.value });
                  setShowRegions(e.target.value.length > 0);
                }}
                placeholder="Click to filter"
                className="flex-1"
              />
            </div>
            {showRegions && (
              <div className="border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Region</h4>
                    <div className="text-sm text-muted-foreground">Region</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Routing</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Zones</div>
                      <div>Codes</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {regionOptions.map((region) => (
                    <div key={region} className="flex items-center gap-2">
                      <Checkbox
                        id={`region-${region}`}
                        data-testid={`checkbox-region-${region.replace(/\s+/g, "-")}`}
                        checked={form.selectedZones.includes(region)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setForm({ ...form, selectedZones: [...form.selectedZones, region] });
                          } else {
                            setForm({ ...form, selectedZones: form.selectedZones.filter(z => z !== region) });
                          }
                        }}
                      />
                      <label htmlFor={`region-${region}`} className="text-sm">{region}</label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" data-testid="button-select-all-zones" onClick={() => setForm({ ...form, selectedZones: regionOptions })}>
                    Select all
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-add-filter">
                    Add another filter
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-medium mb-4">Origin Sets to Include</h3>
        <div className="grid grid-cols-[100px_1fr] items-center gap-4">
          <Label htmlFor="assignOrigin">Assign Origin</Label>
          <Select value={form.assignOrigin} onValueChange={(v) => setForm({ ...form, assignOrigin: v })}>
            <SelectTrigger data-testid="select-assign-origin" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Origin Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>Origin Rates can be added to a new Rating Plan on creation. Origin Rates can only be added for Zones and Codes identified above.</p>
          <p className="font-medium">Origin Mapping</p>
          <p className="text-muted-foreground">
            Assigning an Origin Mapping Group to the Rating Plan enables Origin Sets to be automatically applied to Zones based on the defined mappings. Furthermore, Origin Mapping Groups define which Zones, that are mapped to one or more Origin Sets, will also need a Rest of World entry.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stage5Analysis({ form, isCreating, creationComplete }: { form: AddPlanFormData; isCreating: boolean; creationComplete: boolean }) {
  const zonesCount = form.zonesSelect === "None" ? 0 : form.zonesSelect === "All" ? "All" : form.selectedZones.length;
  const timeClassesCount = form.selectedTimeClasses.length;

  return (
    <div>
      <h3 className="font-medium mb-4">Sheet creation status</h3>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p>The following rate plan will be created: <strong>{form.name || "(unnamed)"}</strong></p>
          <p>The new rate plan will consist of:</p>
          <ul className="list-none space-y-1">
            <li>{zonesCount} Zones</li>
            <li>{timeClassesCount} Time class{timeClassesCount !== 1 ? "es" : ""}</li>
          </ul>
          {creationComplete && (
            <>
              <p className="font-medium mt-4">Creation Complete</p>
              <p>A new rating plan was created successfully containing 0 rates:</p>
              <p className="text-muted-foreground">No errors were reported</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddRatingPlanWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [stage, setStage] = useState<WizardStage>(1);
  const [form, setForm] = useState<AddPlanFormData>(defaultFormData);
  const [creationComplete, setCreationComplete] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: AddPlanFormData) => {
      const payload: Record<string, unknown> = {
        name: data.name,
        currency: data.currency,
        timeZone: data.timeZone,
        carrierTimeZone: data.carrierTimeZone || null,
        defaultRates: data.defaultRates,
        marginEnforcement: data.marginEnforcement,
        minMargin: data.minMargin,
        initialInterval: parseInt(data.initialInterval) || 0,
        recurringInterval: parseInt(data.recurringInterval) || 1,
        periodExceptionTemplate: data.periodExceptionTemplate !== "None" ? data.periodExceptionTemplate : null,
        selectedTimeClasses: data.selectedTimeClasses,
        selectedZones: data.selectedZones,
        zonesSelect: data.zonesSelect,
        assignOrigin: data.assignOrigin,
      };
      if (data.effectiveDate) {
        payload.effectiveDate = new Date(data.effectiveDate + "T" + data.effectiveTime);
      }
      const response = await apiRequest("POST", "/api/softswitch/rating/customer-plans", payload);
      return response.json();
    },
    onSuccess: () => {
      setCreationComplete(true);
      toast({ title: "Rating plan created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/softswitch/rating/customer-plans"] });
    },
    onError: (error) => {
      toast({ title: "Failed to create rating plan", description: String(error), variant: "destructive" });
    },
  });

  const handlePrevious = () => {
    if (stage > 1) {
      setStage((s) => (s - 1) as WizardStage);
    }
  };

  const handleNext = () => {
    if (stage < 5) {
      setStage((s) => (s + 1) as WizardStage);
    } else if (stage === 5 && !creationComplete) {
      createMutation.mutate(form);
    }
  };

  const handleDone = () => {
    setStage(1);
    setForm(defaultFormData);
    setCreationComplete(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setStage(1);
    setForm(defaultFormData);
    setCreationComplete(false);
    onOpenChange(false);
  };
  
  const isCreating = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Rating Plan</DialogTitle>
        </DialogHeader>
        <StageIndicator currentStage={stage} />
        <div className="min-h-[400px]">
          {stage === 1 && <Stage1PlanDetails form={form} setForm={setForm} />}
          {stage === 2 && <Stage2DefaultRates form={form} setForm={setForm} />}
          {stage === 3 && <Stage3TimeClasses form={form} setForm={setForm} />}
          {stage === 4 && <Stage4Zones form={form} setForm={setForm} />}
          {stage === 5 && <Stage5Analysis form={form} isCreating={isCreating} creationComplete={creationComplete} />}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          {creationComplete ? (
            <Button data-testid="button-done" onClick={handleDone}>Done</Button>
          ) : (
            <>
              <Button variant="outline" data-testid="button-previous" onClick={handlePrevious} disabled={stage === 1}>
                Previous
              </Button>
              <Button data-testid="button-next" onClick={handleNext} disabled={isCreating}>
                {isCreating ? "Creating..." : "Next"}
              </Button>
              <Button variant="outline" data-testid="button-cancel" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CustomerRatingPlansPage() {
  const [tab, setTab] = useState("rating-plans");
  const [nameFilter, setNameFilter] = useState("");
  const [uncommittedFilter, setUncommittedFilter] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { toast } = useToast();
  
  const { data: plans = [], isLoading, isFetching, refetch, isError } = useQuery<APICustomerRatingPlan[]>({
    queryKey: ["/api/softswitch/rating/customer-plans"],
  });

  useEffect(() => {
    if (isError) {
      toast({ title: "Failed to load rating plans", variant: "destructive" });
    }
  }, [isError, toast]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/softswitch/rating/customer-plans/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Rating plan deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/softswitch/rating/customer-plans"] });
    },
    onError: (error) => {
      toast({ title: "Failed to delete rating plan", description: String(error), variant: "destructive" });
    },
  });

  const filteredPlans = plans.filter((plan) => {
    if (nameFilter && !plan.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    if (uncommittedFilter === "yes" && !plan.uncommittedChanges) {
      return false;
    }
    if (uncommittedFilter === "no" && plan.uncommittedChanges) {
      return false;
    }
    return true;
  });

  const totalPlans = filteredPlans.length;
  const totalPages = Math.ceil(totalPlans / pageSize);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [nameFilter, uncommittedFilter]);
  
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Customer Rating Plans</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="button-actions">
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem data-testid="menu-add-plan" onClick={() => setWizardOpen(true)}>
              Add Plan
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-copy-plan">Copy Plan</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-export-rates">Export Rates</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-import-new-rating-plan">Import New Rating Plan</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-import-rates-multiple">Import Rates into Multiple Plans</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-replace-plan">Replace Plan</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-usage-check">Usage Check</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-restore-plans">Restore Plans</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-delete-old-versions">Delete Old Versions</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-delete-import-templates">Delete Import Templates</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-delete-export-templates">Delete Export Templates</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rating-plans" data-testid="tab-rating-plans">Rating Plans</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="floor-price-rules" data-testid="tab-floor-price-rules">Floor Price Rules</TabsTrigger>
          <TabsTrigger value="multiplan-import" data-testid="tab-multiplan-import">Multiplan Import</TabsTrigger>
          <TabsTrigger value="business-rules" data-testid="tab-business-rules">Business Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="rating-plans" className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="nameFilter" className="text-sm">Name</Label>
              <Input
                id="nameFilter"
                data-testid="input-name-filter"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="uncommittedFilter" className="text-sm">Uncommitted Changes</Label>
              <Select value={uncommittedFilter} onValueChange={setUncommittedFilter}>
                <SelectTrigger data-testid="select-uncommitted-filter" className="w-32">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" data-testid="button-search">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading rating plans...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>£/$</TableHead>
                    <TableHead>Margin Enforcement</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Uncommitted Changes</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No rating plans found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPlans.map((plan) => (
                      <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                        <TableCell>
                          <a 
                            href={`/admin/softswitch/rating/customer-plans/${plan.shortCode || plan.id}`}
                            className="text-primary hover:underline" 
                            data-testid={`link-plan-${plan.id}`}
                          >
                            {plan.name}
                          </a>
                        </TableCell>
                        <TableCell>{plan.currency}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-teal-600 hover:bg-teal-600">
                            {plan.marginEnforcement === "Enabled" ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>{plan.template || "-"}</TableCell>
                        <TableCell>
                          {plan.uncommittedChanges ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-600">Yes</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {plan.updatedAt ? new Date(plan.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                        </TableCell>
                        <TableCell>{plan.assigned ? "Yes" : "-"}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            data-testid={`button-delete-${plan.id}`}
                            onClick={() => deleteMutation.mutate(plan.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? "..." : "Delete"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <DataTableFooter
                totalItems={totalPlans}
                totalPages={totalPages}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <div className="py-12 text-center text-muted-foreground">
            Notifications configuration coming soon
          </div>
        </TabsContent>

        <TabsContent value="floor-price-rules">
          <div className="py-12 text-center text-muted-foreground">
            Floor Price Rules configuration coming soon
          </div>
        </TabsContent>

        <TabsContent value="multiplan-import">
          <div className="py-12 text-center text-muted-foreground">
            Multiplan Import configuration coming soon
          </div>
        </TabsContent>

        <TabsContent value="business-rules">
          <div className="py-12 text-center text-muted-foreground">
            Business Rules configuration coming soon
          </div>
        </TabsContent>
      </Tabs>

      <AddRatingPlanWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}

type SupplierRatingTab = 
  | "rating-plans" 
  | "rate-inbox" 
  | "import-jobs" 
  | "import-summary" 
  | "import-settings" 
  | "import-templates" 
  | "import-notifications" 
  | "routing-codes";

interface TabAction {
  id: string;
  label: string;
  testId: string;
}

const supplierRatingTabActions: Record<SupplierRatingTab, TabAction[]> = {
  "rating-plans": [
    { id: "copy-rating-plan", label: "Copy Rating Plan", testId: "menu-copy-rating-plan" },
    { id: "import-new-rating-plan", label: "Import New Rating Plan", testId: "menu-import-new-rating-plan" },
    { id: "export-rates", label: "Export Rates", testId: "menu-export-rates" },
    { id: "replace-plan", label: "Replace Plan", testId: "menu-replace-plan" },
    { id: "restore-plans", label: "Restore Plans", testId: "menu-restore-plans" },
    { id: "delete-old-versions", label: "Delete Old Versions", testId: "menu-delete-old-versions" },
    { id: "delete-import-templates", label: "Delete Import Templates", testId: "menu-delete-import-templates" },
    { id: "delete-export-templates", label: "Delete Export Templates", testId: "menu-delete-export-templates" },
  ],
  "rate-inbox": [
    { id: "download-rates-file", label: "Download Rates File", testId: "menu-download-rates-file" },
    { id: "import-existing-plan", label: "Import Into Existing Plan", testId: "menu-import-existing-plan" },
    { id: "import-new-plan", label: "Import Into New Plan", testId: "menu-import-new-plan" },
  ],
  "import-jobs": [
    { id: "export-history", label: "Export History", testId: "menu-export-history" },
  ],
  "import-summary": [
    { id: "new-report", label: "New Report", testId: "menu-new-report" },
    { id: "save-report", label: "Save Report", testId: "menu-save-report" },
    { id: "export", label: "Export", testId: "menu-export" },
  ],
  "import-settings": [],
  "import-templates": [
    { id: "add-template", label: "Add Template", testId: "menu-add-template" },
    { id: "delete-all-templates", label: "Delete All Templates", testId: "menu-delete-all-templates" },
  ],
  "import-notifications": [
    { id: "configure-notifications", label: "Configure Notifications", testId: "menu-configure-notifications" },
    { id: "clear-notifications", label: "Clear Notifications", testId: "menu-clear-notifications" },
  ],
  "routing-codes": [
    { id: "add-routing-code", label: "Add Routing Code", testId: "menu-add-routing-code" },
    { id: "import-routing-codes", label: "Import Routing Codes", testId: "menu-import-routing-codes" },
    { id: "export-routing-codes", label: "Export Routing Codes", testId: "menu-export-routing-codes" },
  ],
};

interface SupplierRatingPlan {
  id: string;
  name: string;
  supplier: string;
  supplierInterconnect: string;
  blockUnresolvableCodes: boolean;
  currency: string;
  creationTemplate: string;
  uncommittedChanges: boolean;
  lastUpdated: string;
  inUse: boolean;
}

const mockSupplierPlans: SupplierRatingPlan[] = [];

type RateInboxSubTab = "action-required" | "carrier-assigned" | "deleted" | "junk";
type RateInboxPeriod = "specify" | "today" | "yesterday" | "this-week" | "this-month" | "last-2-months" | "last-6-months" | "this-year";

const rateInboxSubTabActions: Record<RateInboxSubTab, TabAction[]> = {
  "action-required": [
    { id: "download-rates-file", label: "Download Rates File", testId: "menu-download-rates-file" },
  ],
  "carrier-assigned": [
    { id: "download-rates-file", label: "Download Rates File", testId: "menu-download-rates-file" },
    { id: "import-existing-plan", label: "Import Into Existing Plan", testId: "menu-import-existing-plan" },
    { id: "import-new-plan", label: "Import Into New Plan", testId: "menu-import-new-plan" },
  ],
  "deleted": [
    { id: "restore-selected", label: "Restore Selected", testId: "menu-restore-selected" },
    { id: "delete-selected", label: "Delete Selected", testId: "menu-delete-selected" },
  ],
  "junk": [
    { id: "delete-selected", label: "Delete Selected", testId: "menu-delete-selected" },
  ],
};

interface RateInboxItem {
  id: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  receivedTime: string;
  receivedDate: string;
  trustLevel: "high" | "medium" | "low";
  carrierImportSettings: string;
  ratingPlanImportType: string;
  attachment: string;
  importJob: string;
  status: string;
  processingNote: string;
  emailBody: string;
  emailTo: string;
  emailCc: string;
  attachmentFileName: string;
}

const mockRateInboxItems: RateInboxItem[] = [];

// Import Jobs types and mock data
type ImportJobPeriod = "specify" | "today" | "yesterday" | "this-week" | "this-month" | "last-2-months" | "last-6-months" | "this-year";

interface ImportJob {
  id: string;
  jobId: string;
  date: string;
  status: "Committed" | "Pending" | "Failed" | "Processing";
  importSettings: string;
  ratingPlan: string;
  importType: string;
  auto: boolean;
  email: boolean;
  rateChanges: number;
}

const mockImportJobs: ImportJob[] = [];

// Import Summary types and mock data
type ImportSummarySubTab = "rate-changes" | "origin-changes";

interface SavedReport {
  id: string;
  name: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

interface ImportSummaryRateChange {
  id: string;
  zone: string;
  code: string;
  originSet: string;
  timeclass: string;
  effectiveDate: string;
  effectiveDays: number;
  currency: string;
  newRate: number;
  oldRate: number;
  change: number;
  changePercent: number;
  changeType: "Increase" | "Decrease" | "New" | "Deleted";
  plan: string;
  supplier: string;
  importJob: string;
  status: "Committed" | "Pending" | "Failed";
}

interface ImportSummarySummary {
  changes: number;
  increases: number;
  decreases: number;
  new: number;
  deleted: number;
  blocked: number;
  other: number;
  brBlocked: number;
  rejected: number;
}

interface ImportSummaryOriginSummary {
  newOriginSets: number;
  newOriginCodes: number;
  deletedOriginCodes: number;
}

const mockSavedReports: SavedReport[] = [];
const mockImportSummaryRateChanges: ImportSummaryRateChange[] = [];
const mockImportSummarySummary: ImportSummarySummary = {
  changes: 0, increases: 0, decreases: 0, new: 0, deleted: 0, blocked: 0, other: 0, brBlocked: 0, rejected: 0
};
const mockImportSummaryOriginSummary: ImportSummaryOriginSummary = {
  newOriginSets: 0, newOriginCodes: 0, deletedOriginCodes: 0
};

// Import Settings types
type ImportSettingsSubTab = "import-settings" | "business-rules";

interface ImportSettingItem {
  id: string;
  name: string;
  currency: string;
  businessRules: string;
  carrierValidation: {
    from: string;
    filename: string;
    subject: string;
  };
  autoImportRules: number;
  notifications: number;
}

interface BusinessRule {
  id: string;
  name: string;
  increase: number;
  decrease: number;
  new: number;
  deletion: number;
  initialPeriod: string;
  recurringPeriod: string;
  assigned: boolean;
}

const mockImportSettings: ImportSettingItem[] = [];
const mockBusinessRules: BusinessRule[] = [];

// Import Settings sub-tab actions
const importSettingsSubTabActions: Record<ImportSettingsSubTab, TabAction[]> = {
  "import-settings": [
    { id: "add-import-setting", label: "Add Import Setting", testId: "menu-add-import-setting" },
  ],
  "business-rules": [
    { id: "create-business-rule", label: "Create Business Rule", testId: "menu-create-business-rule" },
  ],
};

const periodOptions: { value: RateInboxPeriod; label: string }[] = [
  { value: "specify", label: "Specify" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-2-months", label: "Last 2 Months" },
  { value: "last-6-months", label: "Last 6 Months" },
  { value: "this-year", label: "This Year" },
];

export function SupplierRatingPlansPage() {
  const [tab, setTab] = useState<SupplierRatingTab>("rating-plans");
  const [nameFilter, setNameFilter] = useState("");
  const [uncommittedFilter, setUncommittedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Rate Inbox state
  const [rateInboxSubTab, setRateInboxSubTab] = useState<RateInboxSubTab>("action-required");
  const [rateInboxPeriod, setRateInboxPeriod] = useState<RateInboxPeriod>("last-2-months");
  const [rateInboxFromDate, setRateInboxFromDate] = useState("2025-11-01");
  const [rateInboxToDate, setRateInboxToDate] = useState("2026-01-13");
  const [rateInboxSearchFilter, setRateInboxSearchFilter] = useState("");
  const [rateInboxSelectedItems, setRateInboxSelectedItems] = useState<string[]>([]);
  const [rateInboxExpandedItems, setRateInboxExpandedItems] = useState<string[]>([]);
  const [rateInboxCurrentPage, setRateInboxCurrentPage] = useState(1);
  const [rateInboxPageSize, setRateInboxPageSize] = useState(20);
  
  // Import Jobs state
  const [importJobsPeriod, setImportJobsPeriod] = useState<ImportJobPeriod>("this-month");
  const [importJobsFromDate, setImportJobsFromDate] = useState("2026-01-01");
  const [importJobsToDate, setImportJobsToDate] = useState("2026-01-13");
  const [importJobsSearchFilter, setImportJobsSearchFilter] = useState("");
  const [importJobsCurrentPage, setImportJobsCurrentPage] = useState(1);
  const [importJobsPageSize, setImportJobsPageSize] = useState(20);
  
  // Import Summary state
  const [importSummarySelectedReport, setImportSummarySelectedReport] = useState("untitled");
  const [importSummaryPeriod, setImportSummaryPeriod] = useState<RateInboxPeriod>("this-year");
  const [importSummaryFromDate, setImportSummaryFromDate] = useState("2026-01-01");
  const [importSummaryToDate, setImportSummaryToDate] = useState("2026-01-13");
  const [importSummaryMinMinutes, setImportSummaryMinMinutes] = useState(false);
  const [importSummaryMinMinutesValue, setImportSummaryMinMinutesValue] = useState("0");
  const [importSummarySubTab, setImportSummarySubTab] = useState<ImportSummarySubTab>("rate-changes");
  const [importSummarySearchFilter, setImportSummarySearchFilter] = useState("");
  const [importSummaryCurrentPage, setImportSummaryCurrentPage] = useState(1);
  const [importSummaryPageSize, setImportSummaryPageSize] = useState(20);
  const [showSaveReportDialog, setShowSaveReportDialog] = useState(false);
  const [saveReportName, setSaveReportName] = useState("");
  const [saveReportPublic, setSaveReportPublic] = useState(false);
  const [importSummaryViewMode, setImportSummaryViewMode] = useState<"zone" | "code">("zone");
  
  // Import Settings tab state
  const [importSettingsSubTab, setImportSettingsSubTab] = useState<ImportSettingsSubTab>("import-settings");
  const [importSettingsSearchFilter, setImportSettingsSearchFilter] = useState("");
  const [showAddImportSettingDialog, setShowAddImportSettingDialog] = useState(false);
  const [addImportSettingCarrier, setAddImportSettingCarrier] = useState("");
  const [addImportSettingBusinessRule, setAddImportSettingBusinessRule] = useState("");
  const [businessRulesSearchFilter, setBusinessRulesSearchFilter] = useState("");
  
  const { toast } = useToast();

  const filteredPlans = mockSupplierPlans.filter((plan) => {
    if (nameFilter && !plan.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    if (uncommittedFilter === "yes" && !plan.uncommittedChanges) {
      return false;
    }
    if (uncommittedFilter === "no" && plan.uncommittedChanges) {
      return false;
    }
    return true;
  });

  const totalPlans = filteredPlans.length;
  const totalPages = Math.ceil(totalPlans / pageSize);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [nameFilter, uncommittedFilter]);
  
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const currentActions = tab === "rate-inbox" 
    ? rateInboxSubTabActions[rateInboxSubTab] 
    : tab === "import-settings"
    ? importSettingsSubTabActions[importSettingsSubTab]
    : supplierRatingTabActions[tab];

  const handleAction = (actionId: string) => {
    if (actionId === "save-report") {
      setShowSaveReportDialog(true);
      return;
    }
    if (actionId === "new-report") {
      setImportSummarySelectedReport("untitled");
      setSaveReportName("");
      toast({ title: "New Report", description: "Started a new untitled report" });
      return;
    }
    if (actionId === "export") {
      toast({ title: "Export", description: "Exporting report to CSV..." });
      return;
    }
    if (actionId === "add-import-setting") {
      setShowAddImportSettingDialog(true);
      return;
    }
    if (actionId === "create-business-rule") {
      window.location.href = "/admin/softswitch/rating/business-rule/new";
      return;
    }
    toast({ title: `Action: ${actionId}`, description: "This action is not yet implemented" });
  };

  const handleDelete = (planId: string) => {
    toast({ title: "Delete", description: `Deleting plan ${planId} - not yet implemented` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Supplier Rating</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="button-actions">
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {currentActions.map((action) => (
              <DropdownMenuItem 
                key={action.id} 
                data-testid={action.testId}
                onClick={() => handleAction(action.id)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SupplierRatingTab)}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="rating-plans" data-testid="tab-rating-plans">Rating Plans</TabsTrigger>
            <TabsTrigger value="rate-inbox" data-testid="tab-rate-inbox">Rate Inbox</TabsTrigger>
            <TabsTrigger value="import-jobs" data-testid="tab-import-jobs">Import Jobs</TabsTrigger>
            <TabsTrigger value="import-summary" data-testid="tab-import-summary">Import Summary</TabsTrigger>
            <TabsTrigger value="import-settings" data-testid="tab-import-settings">Import Settings</TabsTrigger>
            <TabsTrigger value="import-templates" data-testid="tab-import-templates">Import Templates</TabsTrigger>
            <TabsTrigger value="import-notifications" data-testid="tab-import-notifications">Import Notifications</TabsTrigger>
            <TabsTrigger value="routing-codes" data-testid="tab-routing-codes">Routing Codes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rating-plans" className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="nameFilter" className="text-sm">Name</Label>
              <Input
                id="nameFilter"
                data-testid="input-name-filter"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="uncommittedFilter" className="text-sm">Uncommitted Changes</Label>
              <Select value={uncommittedFilter} onValueChange={setUncommittedFilter}>
                <SelectTrigger data-testid="select-uncommitted-filter" className="w-32">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" data-testid="button-search">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Block Unresolvable Codes</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Creation Template</TableHead>
                <TableHead>Uncommitted Changes</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>In Use</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No supplier rating plans found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlans.map((plan) => (
                  <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                    <TableCell>
                      <a 
                        href={`/admin/softswitch/rating/supplier-plans/${plan.id}`}
                        className="text-primary hover:underline" 
                        data-testid={`link-plan-${plan.id}`}
                      >
                        {plan.name}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={plan.supplier}>
                      {plan.supplier || "-"}
                    </TableCell>
                    <TableCell>{plan.blockUnresolvableCodes ? "Yes" : "No"}</TableCell>
                    <TableCell>{plan.currency}</TableCell>
                    <TableCell>{plan.creationTemplate}</TableCell>
                    <TableCell>{plan.uncommittedChanges ? "Yes" : "-"}</TableCell>
                    <TableCell>{plan.lastUpdated}</TableCell>
                    <TableCell>{plan.inUse ? "Yes" : "-"}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        data-testid={`button-delete-${plan.id}`}
                        onClick={() => handleDelete(plan.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <DataTableFooter
            totalItems={totalPlans}
            totalPages={totalPages}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </TabsContent>

        <TabsContent value="rate-inbox" className="space-y-4">
          {/* Sub-tabs: Action Required, Carrier Assigned, Deleted, Junk */}
          <div className="flex items-center gap-2">
            <Button
              variant={rateInboxSubTab === "action-required" ? "default" : "outline"}
              size="sm"
              onClick={() => setRateInboxSubTab("action-required")}
              data-testid="subtab-action-required"
            >
              Action Required
            </Button>
            <Button
              variant={rateInboxSubTab === "carrier-assigned" ? "default" : "outline"}
              size="sm"
              onClick={() => setRateInboxSubTab("carrier-assigned")}
              data-testid="subtab-carrier-assigned"
            >
              Carrier Assigned
            </Button>
            <Button
              variant={rateInboxSubTab === "deleted" ? "default" : "outline"}
              size="sm"
              onClick={() => setRateInboxSubTab("deleted")}
              data-testid="subtab-deleted"
            >
              Deleted
            </Button>
            <Button
              variant={rateInboxSubTab === "junk" ? "default" : "outline"}
              size="sm"
              onClick={() => setRateInboxSubTab("junk")}
              data-testid="subtab-junk"
            >
              Junk
            </Button>
          </div>

          {/* Period Filter Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Period</Label>
              <Select value={rateInboxPeriod} onValueChange={(v) => setRateInboxPeriod(v as RateInboxPeriod)}>
                <SelectTrigger data-testid="select-rate-inbox-period" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">From</Label>
              <Input
                type="date"
                value={rateInboxFromDate}
                onChange={(e) => setRateInboxFromDate(e.target.value)}
                className="w-36"
                data-testid="input-rate-inbox-from-date"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">To</Label>
              <Input
                type="date"
                value={rateInboxToDate}
                onChange={(e) => setRateInboxToDate(e.target.value)}
                className="w-36"
                data-testid="input-rate-inbox-to-date"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <Input
              value={rateInboxSearchFilter}
              onChange={(e) => setRateInboxSearchFilter(e.target.value)}
              placeholder="Click to filter"
              className="max-w-md"
              data-testid="input-rate-inbox-search"
            />
            <Button variant="ghost" size="icon" data-testid="button-rate-inbox-search">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Data Table - Structure varies by sub-tab */}
          {rateInboxSubTab === "junk" ? (
            /* Junk Tab - Simplified table with fewer columns */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={mockRateInboxItems.length > 0 && rateInboxSelectedItems.length === mockRateInboxItems.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRateInboxSelectedItems(mockRateInboxItems.map(item => item.id));
                        } else {
                          setRateInboxSelectedItems([]);
                        }
                      }}
                      data-testid="checkbox-select-all-rate-inbox"
                    />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Email <ChevronDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div>Trust</div>
                    <div className="text-xs text-muted-foreground font-normal">Level</div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRateInboxItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No junk items found
                    </TableCell>
                  </TableRow>
                ) : (
                  mockRateInboxItems
                    .slice((rateInboxCurrentPage - 1) * rateInboxPageSize, rateInboxCurrentPage * rateInboxPageSize)
                    .flatMap((item) => {
                      const mainRow = (
                        <TableRow key={item.id} data-testid={`row-rate-inbox-${item.id}`}>
                          <TableCell>
                            <Checkbox
                              checked={rateInboxSelectedItems.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setRateInboxSelectedItems([...rateInboxSelectedItems, item.id]);
                                } else {
                                  setRateInboxSelectedItems(rateInboxSelectedItems.filter(id => id !== item.id));
                                }
                              }}
                              data-testid={`checkbox-rate-inbox-${item.id}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (rateInboxExpandedItems.includes(item.id)) {
                                    setRateInboxExpandedItems(rateInboxExpandedItems.filter(id => id !== item.id));
                                  } else {
                                    setRateInboxExpandedItems([...rateInboxExpandedItems, item.id]);
                                  }
                                }}
                                className="p-0.5 hover-elevate rounded"
                                data-testid={`button-expand-${item.id}`}
                              >
                                <ChevronRight className={cn(
                                  "h-4 w-4 transition-transform",
                                  rateInboxExpandedItems.includes(item.id) && "rotate-90"
                                )} />
                              </button>
                              <div>
                                <div className="text-sm">{item.senderEmail}</div>
                                <div className="font-medium">{item.subject}</div>
                              </div>
                              <span className="text-sm text-muted-foreground ml-auto">{item.receivedTime}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={cn(
                              "w-4 h-4 rounded-sm",
                              item.trustLevel === "high" && "bg-orange-500",
                              item.trustLevel === "medium" && "bg-pink-500",
                              item.trustLevel === "low" && "bg-red-500"
                            )} />
                          </TableCell>
                          <TableCell className="text-sm">{item.status || "-"}</TableCell>
                        </TableRow>
                      );
                      
                      if (!rateInboxExpandedItems.includes(item.id)) {
                        return [mainRow];
                      }
                      
                      const expandedRow = (
                        <TableRow key={`${item.id}-expanded`} className="bg-muted/30">
                          <TableCell colSpan={4} className="p-6">
                            <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <h4 className="font-semibold">Email Details</h4>
                                <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
                                  <span className="text-muted-foreground">ID</span>
                                  <span>{item.id}</span>
                                  <span className="text-muted-foreground">Received</span>
                                  <span>{item.receivedDate} {item.receivedTime}</span>
                                  <span className="text-muted-foreground">From</span>
                                  <span>{item.senderName} &lt;{item.senderEmail}&gt;</span>
                                  <span className="text-muted-foreground">Subject</span>
                                  <span>{item.subject}</span>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-semibold">Message</h4>
                                <div className="text-sm whitespace-pre-wrap bg-background p-4 rounded-md border max-h-64 overflow-y-auto">
                                  {item.emailBody}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                      
                      return [mainRow, expandedRow];
                    })
                )}
              </TableBody>
            </Table>
          ) : (
            /* Action Required, Carrier Assigned, Deleted - Full table */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={mockRateInboxItems.length > 0 && rateInboxSelectedItems.length === mockRateInboxItems.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRateInboxSelectedItems(mockRateInboxItems.map(item => item.id));
                        } else {
                          setRateInboxSelectedItems([]);
                        }
                      }}
                      data-testid="checkbox-select-all-rate-inbox"
                    />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Email <ChevronDown className="h-3 w-3" />
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">Validated to Import Settings</div>
                  </TableHead>
                  <TableHead>
                    <div>Trust</div>
                    <div className="text-xs text-muted-foreground font-normal">Level</div>
                  </TableHead>
                  <TableHead>
                    <div>Carrier</div>
                    <div className="text-xs text-muted-foreground font-normal">Import Settings</div>
                  </TableHead>
                  <TableHead>
                    <div>Attachment Processing</div>
                    <div className="text-xs text-muted-foreground font-normal">Rating Plan/Import Type</div>
                  </TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>
                    <div>Import</div>
                    <div className="text-xs text-muted-foreground font-normal">Job</div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processing Note</TableHead>
                  {(rateInboxSubTab === "action-required" || rateInboxSubTab === "carrier-assigned") && (
                    <TableHead className="w-24"></TableHead>
                  )}
                </TableRow>
              </TableHeader>
            <TableBody>
              {mockRateInboxItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={rateInboxSubTab === "deleted" ? 9 : 10} className="text-center text-muted-foreground py-8">
                    No rate inbox items found
                  </TableCell>
                </TableRow>
              ) : (
                mockRateInboxItems
                  .slice((rateInboxCurrentPage - 1) * rateInboxPageSize, rateInboxCurrentPage * rateInboxPageSize)
                  .flatMap((item) => {
                    const mainRow = (
                      <TableRow key={item.id} data-testid={`row-rate-inbox-${item.id}`}>
                        <TableCell>
                          <Checkbox
                            checked={rateInboxSelectedItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setRateInboxSelectedItems([...rateInboxSelectedItems, item.id]);
                              } else {
                                setRateInboxSelectedItems(rateInboxSelectedItems.filter(id => id !== item.id));
                              }
                            }}
                            data-testid={`checkbox-rate-inbox-${item.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (rateInboxExpandedItems.includes(item.id)) {
                                  setRateInboxExpandedItems(rateInboxExpandedItems.filter(id => id !== item.id));
                                } else {
                                  setRateInboxExpandedItems([...rateInboxExpandedItems, item.id]);
                                }
                              }}
                              className="p-0.5 hover-elevate rounded"
                              data-testid={`button-expand-${item.id}`}
                            >
                              <ChevronRight className={cn(
                                "h-4 w-4 transition-transform",
                                rateInboxExpandedItems.includes(item.id) && "rotate-90"
                              )} />
                            </button>
                            <div>
                              <div className="text-sm">{item.senderEmail}</div>
                              <div className="font-medium">{item.subject}</div>
                            </div>
                            <span className="text-sm text-muted-foreground ml-auto">{item.receivedTime}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={cn(
                            "w-4 h-4 rounded-sm",
                            item.trustLevel === "high" && "bg-orange-500",
                            item.trustLevel === "medium" && "bg-pink-500",
                            item.trustLevel === "low" && "bg-red-500"
                          )} />
                        </TableCell>
                        <TableCell className="text-sm">{item.carrierImportSettings || "-"}</TableCell>
                        <TableCell className="text-sm">{item.ratingPlanImportType || "-"}</TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{item.attachment || "-"}</TableCell>
                        <TableCell className="text-sm">{item.importJob || "-"}</TableCell>
                        <TableCell className="text-sm">{item.status || "-"}</TableCell>
                        <TableCell className="text-sm max-w-[150px]">{item.processingNote || "-"}</TableCell>
                        {(rateInboxSubTab === "action-required" || rateInboxSubTab === "carrier-assigned") && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-actions-${item.id}`}>
                                  Actions <ChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  data-testid={`menu-download-${item.id}`}
                                  onClick={() => toast({ title: "Download", description: "Downloading rates file..." })}
                                >
                                  Download Rates File
                                </DropdownMenuItem>
                                {rateInboxSubTab === "carrier-assigned" && (
                                  <>
                                    <DropdownMenuItem 
                                      data-testid={`menu-import-existing-${item.id}`}
                                      onClick={() => toast({ title: "Import", description: "Import into existing plan..." })}
                                    >
                                      Import Into Existing Plan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      data-testid={`menu-import-new-${item.id}`}
                                      onClick={() => toast({ title: "Import", description: "Import into new plan..." })}
                                    >
                                      Import Into New Plan
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                    
                    if (!rateInboxExpandedItems.includes(item.id)) {
                      return [mainRow];
                    }
                    
                    const expandedRow = (
                      <TableRow key={`${item.id}-expanded`} className="bg-muted/30">
                        <TableCell colSpan={rateInboxSubTab === "deleted" ? 9 : 10} className="p-6">
                          <div className="grid grid-cols-2 gap-8">
                            {/* Email Details */}
                            <div className="space-y-3">
                              <h4 className="font-semibold">Email Details</h4>
                              <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
                                <span className="text-muted-foreground">ID</span>
                                <span>{item.id}</span>
                                <span className="text-muted-foreground">Received</span>
                                <span>{item.receivedDate} {item.receivedTime}</span>
                                <span className="text-muted-foreground">From</span>
                                <span>{item.senderName} &lt;{item.senderEmail}&gt;</span>
                                <span className="text-muted-foreground">Sender</span>
                                <span>{item.senderEmail}</span>
                                <span className="text-muted-foreground">Subject</span>
                                <span>{item.subject}</span>
                                <span className="text-muted-foreground">To</span>
                                <span>{item.emailTo}</span>
                                <span className="text-muted-foreground">CC</span>
                                <span className="max-w-md">{item.emailCc}</span>
                              </div>
                              
                              {/* Attachments */}
                              {item.attachmentFileName && (
                                <div className="space-y-2 mt-4">
                                  <h4 className="font-semibold">Attachments</h4>
                                  <div className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                    <a href="#" className="text-primary hover:underline text-sm">
                                      {item.attachmentFileName}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button variant="outline" size="sm" data-testid={`button-delete-attachment-${item.id}`}>
                                      Delete
                                    </Button>
                                    <Button variant="outline" size="sm" data-testid={`button-view-source-${item.id}`}>
                                      View Source
                                    </Button>
                                    <Button variant="outline" size="sm" data-testid={`button-assign-import-${item.id}`}>
                                      Assign Import Setting
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Message Body */}
                            <div className="space-y-3">
                              <h4 className="font-semibold">Message</h4>
                              <div className="text-sm whitespace-pre-wrap bg-background p-4 rounded-md border max-h-64 overflow-y-auto">
                                {item.emailBody}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                    
                    return [mainRow, expandedRow];
                  })
              )}
            </TableBody>
          </Table>
          )}
          <DataTableFooter
            totalItems={mockRateInboxItems.length}
            totalPages={Math.ceil(mockRateInboxItems.length / rateInboxPageSize)}
            pageSize={rateInboxPageSize}
            currentPage={rateInboxCurrentPage}
            onPageChange={setRateInboxCurrentPage}
            onPageSizeChange={setRateInboxPageSize}
          />
        </TabsContent>

        <TabsContent value="import-jobs">
          {/* Period Filter */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period</span>
              <Select value={importJobsPeriod} onValueChange={(v) => setImportJobsPeriod(v as ImportJobPeriod)}>
                <SelectTrigger className="w-[140px]" data-testid="select-import-jobs-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From</span>
              <Input
                type="date"
                value={importJobsFromDate}
                onChange={(e) => setImportJobsFromDate(e.target.value)}
                className="w-[140px]"
                data-testid="input-import-jobs-from-date"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To</span>
              <Input
                type="date"
                value={importJobsToDate}
                onChange={(e) => setImportJobsToDate(e.target.value)}
                className="w-[140px]"
                data-testid="input-import-jobs-to-date"
              />
            </div>
          </div>

          {/* Search Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Click to filter"
              value={importJobsSearchFilter}
              onChange={(e) => setImportJobsSearchFilter(e.target.value)}
              className="max-w-md"
              data-testid="input-import-jobs-search"
            />
            <Button variant="ghost" size="icon" data-testid="button-import-jobs-search">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Import Jobs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Import Job <ChevronDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Import Settings</TableHead>
                <TableHead>Rating Plan</TableHead>
                <TableHead>Import Type</TableHead>
                <TableHead>Auto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rate Changes</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockImportJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No import jobs found
                  </TableCell>
                </TableRow>
              ) : (
                mockImportJobs
                  .slice((importJobsCurrentPage - 1) * importJobsPageSize, importJobsCurrentPage * importJobsPageSize)
                  .map((job) => (
                    <TableRow key={job.id} data-testid={`row-import-job-${job.id}`}>
                      <TableCell>
                        <a href="#" className="text-primary hover:underline" data-testid={`link-job-${job.id}`}>
                          {job.jobId}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">{job.date}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={job.status === "Committed" ? "default" : job.status === "Failed" ? "destructive" : "secondary"}
                          className={job.status === "Committed" ? "bg-sky-500 hover:bg-sky-600" : ""}
                          data-testid={`badge-status-${job.id}`}
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a href="#" className="text-primary hover:underline text-sm" data-testid={`link-import-settings-${job.id}`}>
                          {job.importSettings}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">{job.ratingPlan}</TableCell>
                      <TableCell className="text-sm">{job.importType}</TableCell>
                      <TableCell className="text-sm text-center">{job.auto ? "Yes" : "-"}</TableCell>
                      <TableCell className="text-sm text-center">{job.email ? "Yes" : "-"}</TableCell>
                      <TableCell className="text-sm text-right">{job.rateChanges.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({ title: "Delete", description: `Deleting job ${job.jobId}...` })}
                          data-testid={`button-delete-${job.id}`}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <DataTableFooter
            totalItems={mockImportJobs.length}
            totalPages={Math.ceil(mockImportJobs.length / importJobsPageSize)}
            pageSize={importJobsPageSize}
            currentPage={importJobsCurrentPage}
            onPageChange={setImportJobsCurrentPage}
            onPageSizeChange={setImportJobsPageSize}
          />
        </TabsContent>

        <TabsContent value="import-summary">
          {/* Report and Period Filters */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Select value={importSummarySelectedReport} onValueChange={setImportSummarySelectedReport}>
              <SelectTrigger className="w-[160px]" data-testid="select-import-summary-report">
                <SelectValue placeholder="Untitled Report" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="untitled">Untitled Report</SelectItem>
                {mockSavedReports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>{report.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period</span>
              <Select value={importSummaryPeriod} onValueChange={(v) => setImportSummaryPeriod(v as RateInboxPeriod)}>
                <SelectTrigger className="w-[140px]" data-testid="select-import-summary-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={importSummaryFromDate}
                onChange={(e) => setImportSummaryFromDate(e.target.value)}
                className="w-[140px]"
                data-testid="input-import-summary-from-date"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To</span>
              <Input
                type="date"
                value={importSummaryToDate}
                onChange={(e) => setImportSummaryToDate(e.target.value)}
                className="w-[140px]"
                data-testid="input-import-summary-to-date"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={importSummaryMinMinutes}
                onCheckedChange={(checked) => setImportSummaryMinMinutes(!!checked)}
                data-testid="checkbox-min-minutes"
              />
              <span className="text-sm text-muted-foreground">Min Minutes</span>
              <Input
                type="number"
                value={importSummaryMinMinutesValue}
                onChange={(e) => setImportSummaryMinMinutesValue(e.target.value)}
                className="w-[60px]"
                disabled={!importSummaryMinMinutes}
                data-testid="input-min-minutes"
              />
            </div>
            <span className="text-sm text-muted-foreground">({importSummaryViewMode === "zone" ? "Zone" : "Code"}: Last 7 Days)</span>
          </div>

          {/* Summary Tables */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Summary Of Rate Changes */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Summary Of Rate Changes</h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#3d4f5f]">
                    <TableHead className="text-white text-xs">Changes</TableHead>
                    <TableHead className="text-white text-xs">Increases</TableHead>
                    <TableHead className="text-white text-xs">Decreases</TableHead>
                    <TableHead className="text-white text-xs">New</TableHead>
                    <TableHead className="text-white text-xs">Deleted</TableHead>
                    <TableHead className="text-white text-xs">Blocked</TableHead>
                    <TableHead className="text-white text-xs">Other</TableHead>
                    <TableHead className="text-white text-xs">Br Blocked</TableHead>
                    <TableHead className="text-white text-xs">Rejected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center">{mockImportSummarySummary.changes}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.increases}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.decreases}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.new}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.deleted}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.blocked}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.other}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.brBlocked}</TableCell>
                    <TableCell className="text-center">{mockImportSummarySummary.rejected}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Summary Of Origin Changes */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Summary Of Origin Changes</h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#3d4f5f]">
                    <TableHead className="text-white text-xs">New Origin Sets</TableHead>
                    <TableHead className="text-white text-xs">New Origin Codes</TableHead>
                    <TableHead className="text-white text-xs">Deleted Origin Codes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center">{mockImportSummaryOriginSummary.newOriginSets}</TableCell>
                    <TableCell className="text-center">{mockImportSummaryOriginSummary.newOriginCodes}</TableCell>
                    <TableCell className="text-center">{mockImportSummaryOriginSummary.deletedOriginCodes}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={importSummarySubTab === "rate-changes" ? "default" : "outline"}
              size="sm"
              onClick={() => setImportSummarySubTab("rate-changes")}
              className={importSummarySubTab === "rate-changes" ? "bg-[#3d4f5f] hover:bg-[#4d5f6f]" : ""}
              data-testid="button-rate-changes-tab"
            >
              Rate Changes
            </Button>
            <Button
              variant={importSummarySubTab === "origin-changes" ? "default" : "outline"}
              size="sm"
              onClick={() => setImportSummarySubTab("origin-changes")}
              className={importSummarySubTab === "origin-changes" ? "bg-[#3d4f5f] hover:bg-[#4d5f6f]" : ""}
              data-testid="button-origin-changes-tab"
            >
              Origin Changes
            </Button>
          </div>

          {/* Search Filter Row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Input
              placeholder="Click to filter"
              value={importSummarySearchFilter}
              onChange={(e) => setImportSummarySearchFilter(e.target.value)}
              className="max-w-md"
              data-testid="input-import-summary-search"
            />
            <Button variant="ghost" size="icon" data-testid="button-import-summary-search">
              <Search className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-auto">UTC</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setImportSummaryViewMode(importSummaryViewMode === "zone" ? "code" : "zone")}
              data-testid="button-toggle-view-mode"
            >
              {importSummaryViewMode === "zone" ? "Change to Code View" : "Change to Zone View"}
            </Button>
          </div>

          {/* Rate Changes Table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-[#3d4f5f]">
                <TableHead className="text-white text-xs">
                  <div className="flex items-center gap-1">Zone <ChevronDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="text-white text-xs">Code</TableHead>
                <TableHead className="text-white text-xs">Origin Set</TableHead>
                <TableHead className="text-white text-xs">Timeclass</TableHead>
                <TableHead className="text-white text-xs">Effective Date</TableHead>
                <TableHead className="text-white text-xs">$/£</TableHead>
                <TableHead className="text-white text-xs">New Rate</TableHead>
                <TableHead className="text-white text-xs">Old Rate</TableHead>
                <TableHead className="text-white text-xs">Change</TableHead>
                <TableHead className="text-white text-xs">Change Type</TableHead>
                <TableHead className="text-white text-xs">Plan</TableHead>
                <TableHead className="text-white text-xs">Supplier</TableHead>
                <TableHead className="text-white text-xs">Import Job</TableHead>
                <TableHead className="text-white text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockImportSummaryRateChanges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                    No rate changes found
                  </TableCell>
                </TableRow>
              ) : (
                mockImportSummaryRateChanges
                  .slice((importSummaryCurrentPage - 1) * importSummaryPageSize, importSummaryCurrentPage * importSummaryPageSize)
                  .map((item) => (
                    <TableRow key={item.id} data-testid={`row-rate-change-${item.id}`}>
                      <TableCell className="text-sm">{item.zone}</TableCell>
                      <TableCell className="text-sm">{item.code}</TableCell>
                      <TableCell className="text-sm">{item.originSet}</TableCell>
                      <TableCell className="text-sm">{item.timeclass}</TableCell>
                      <TableCell className="text-sm">{item.effectiveDate} ({item.effectiveDays})</TableCell>
                      <TableCell className="text-sm">{item.currency}</TableCell>
                      <TableCell className="text-sm">{item.newRate.toFixed(4)}</TableCell>
                      <TableCell className="text-sm">{item.oldRate.toFixed(4)}</TableCell>
                      <TableCell className="text-sm">{item.change.toFixed(4)} ({item.changePercent.toFixed(2)}%)</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.changeType === "Increase" ? "default" : item.changeType === "Decrease" ? "secondary" : "outline"}
                          className={item.changeType === "Increase" ? "bg-orange-500 hover:bg-orange-600" : item.changeType === "Decrease" ? "bg-blue-500 hover:bg-blue-600" : ""}
                          data-testid={`badge-change-type-${item.id}`}
                        >
                          {item.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.plan}</TableCell>
                      <TableCell className="text-sm">{item.supplier}</TableCell>
                      <TableCell>
                        <a href={`/admin/softswitch/rating/import-job/${item.importJob}`} className="text-primary hover:underline text-sm" data-testid={`link-import-job-${item.id}`}>
                          {item.importJob}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === "Committed" ? "default" : "secondary"}
                          className={item.status === "Committed" ? "bg-sky-500 hover:bg-sky-600" : ""}
                          data-testid={`badge-status-${item.id}`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <DataTableFooter
            totalItems={mockImportSummaryRateChanges.length}
            totalPages={Math.ceil(mockImportSummaryRateChanges.length / importSummaryPageSize)}
            pageSize={importSummaryPageSize}
            currentPage={importSummaryCurrentPage}
            onPageChange={setImportSummaryCurrentPage}
            onPageSizeChange={setImportSummaryPageSize}
          />

          {/* Save Report Dialog */}
          <Dialog open={showSaveReportDialog} onOpenChange={setShowSaveReportDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Save This Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label htmlFor="report-name">Name</Label>
                  <Input
                    id="report-name"
                    value={saveReportName}
                    onChange={(e) => setSaveReportName(e.target.value)}
                    placeholder="Enter report name"
                    data-testid="input-report-name"
                  />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <Label>Available to other users</Label>
                  <Select value={saveReportPublic ? "yes" : "no"} onValueChange={(v) => setSaveReportPublic(v === "yes")}>
                    <SelectTrigger data-testid="select-report-public">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveReportDialog(false)} data-testid="button-cancel-save-report">
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast({ title: "Report Saved", description: `Report "${saveReportName}" saved successfully` });
                    setShowSaveReportDialog(false);
                    setSaveReportName("");
                    setSaveReportPublic(false);
                  }}
                  data-testid="button-save-report"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="import-settings">
          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={importSettingsSubTab === "import-settings" ? "default" : "outline"}
              size="sm"
              onClick={() => setImportSettingsSubTab("import-settings")}
              className={importSettingsSubTab === "import-settings" ? "bg-[#3d4f5f] hover:bg-[#4d5f6f]" : ""}
              data-testid="button-import-settings-subtab"
            >
              Import Settings
            </Button>
            <Button
              variant={importSettingsSubTab === "business-rules" ? "default" : "outline"}
              size="sm"
              onClick={() => setImportSettingsSubTab("business-rules")}
              className={importSettingsSubTab === "business-rules" ? "bg-[#3d4f5f] hover:bg-[#4d5f6f]" : ""}
              data-testid="button-business-rules-subtab"
            >
              Business Rules
            </Button>
          </div>

          {/* Search Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Click to filter"
              value={importSettingsSubTab === "import-settings" ? importSettingsSearchFilter : businessRulesSearchFilter}
              onChange={(e) => importSettingsSubTab === "import-settings" 
                ? setImportSettingsSearchFilter(e.target.value) 
                : setBusinessRulesSearchFilter(e.target.value)
              }
              className="max-w-md"
              data-testid="input-import-settings-search"
            />
            <Button variant="ghost" size="icon" data-testid="button-import-settings-search">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Import Settings List */}
          {importSettingsSubTab === "import-settings" && (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#3d4f5f]">
                  <TableHead className="text-white text-xs">Name</TableHead>
                  <TableHead className="text-white text-xs">Currency</TableHead>
                  <TableHead className="text-white text-xs">Business Rules</TableHead>
                  <TableHead className="text-white text-xs">Carrier Validation</TableHead>
                  <TableHead className="text-white text-xs text-center">Auto Import Rules</TableHead>
                  <TableHead className="text-white text-xs text-center">Notifications</TableHead>
                  <TableHead className="text-white text-xs w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockImportSettings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No import settings found
                    </TableCell>
                  </TableRow>
                ) : (
                  mockImportSettings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell>
                        <a 
                          href={`/admin/softswitch/rating/import-setting/${setting.id}`}
                          className="text-primary hover:underline text-sm"
                          data-testid={`link-import-setting-${setting.id}`}
                        >
                          {setting.name}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">{setting.currency}</TableCell>
                      <TableCell className="text-sm">{setting.businessRules}</TableCell>
                      <TableCell className="text-sm space-y-1">
                        <div>From={setting.carrierValidation.from}</div>
                        <div>Filename="{setting.carrierValidation.filename}"</div>
                        <div>Subject="{setting.carrierValidation.subject}"</div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{setting.autoImportRules}</TableCell>
                      <TableCell className="text-center text-sm">{setting.notifications}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({ title: "Delete", description: `Deleting import setting ${setting.name}...` })}
                          data-testid={`button-delete-import-setting-${setting.id}`}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Business Rules List */}
          {importSettingsSubTab === "business-rules" && (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#3d4f5f]">
                  <TableHead className="text-white text-xs">Business Rule</TableHead>
                  <TableHead className="text-white text-xs text-center">Increase</TableHead>
                  <TableHead className="text-white text-xs text-center">Decrease</TableHead>
                  <TableHead className="text-white text-xs text-center">New</TableHead>
                  <TableHead className="text-white text-xs text-center">Deletion</TableHead>
                  <TableHead className="text-white text-xs">Initial Period</TableHead>
                  <TableHead className="text-white text-xs">Recurring Period</TableHead>
                  <TableHead className="text-white text-xs">Assigned</TableHead>
                  <TableHead className="text-white text-xs w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBusinessRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No business rules found
                    </TableCell>
                  </TableRow>
                ) : (
                  mockBusinessRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <a 
                          href={`/admin/softswitch/rating/business-rule/${rule.id}`}
                          className="text-primary hover:underline text-sm"
                          data-testid={`link-business-rule-${rule.id}`}
                        >
                          {rule.name}
                        </a>
                      </TableCell>
                      <TableCell className="text-center text-sm">{rule.increase}</TableCell>
                      <TableCell className="text-center text-sm">{rule.decrease}</TableCell>
                      <TableCell className="text-center text-sm">{rule.new}</TableCell>
                      <TableCell className="text-center text-sm">{rule.deletion}</TableCell>
                      <TableCell className="text-sm">{rule.initialPeriod}</TableCell>
                      <TableCell className="text-sm">{rule.recurringPeriod}</TableCell>
                      <TableCell className="text-sm">{rule.assigned ? "Yes" : "-"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast({ title: "Delete", description: `Deleting business rule ${rule.name}...` })}
                          data-testid={`button-delete-business-rule-${rule.id}`}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Add Import Setting Dialog */}
          <Dialog open={showAddImportSettingDialog} onOpenChange={setShowAddImportSettingDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Import Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Carrier</Label>
                  <Select value={addImportSettingCarrier} onValueChange={setAddImportSettingCarrier}>
                    <SelectTrigger data-testid="select-add-import-carrier">
                      <SelectValue placeholder="Select carrier..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carrier1">Carrier 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessRule">Business Rule</Label>
                  <Select value={addImportSettingBusinessRule} onValueChange={setAddImportSettingBusinessRule}>
                    <SelectTrigger data-testid="select-add-import-business-rule">
                      <SelectValue placeholder="Select business rule..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBusinessRules.length === 0 ? (
                        <SelectItem value="none" disabled>No business rules available</SelectItem>
                      ) : (
                        mockBusinessRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>{rule.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddImportSettingDialog(false)} data-testid="button-cancel-add-import-setting">
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast({ title: "Import Setting Created", description: "New import setting has been created" });
                    setShowAddImportSettingDialog(false);
                    setAddImportSettingCarrier("");
                    setAddImportSettingBusinessRule("");
                  }}
                  data-testid="button-save-add-import-setting"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="import-templates">
          <div className="py-12 text-center text-muted-foreground">
            Import Templates coming soon
          </div>
        </TabsContent>

        <TabsContent value="import-notifications">
          <div className="py-12 text-center text-muted-foreground">
            Import Notifications coming soon
          </div>
        </TabsContent>

        <TabsContent value="routing-codes">
          <div className="py-12 text-center text-muted-foreground">
            Routing Codes coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function PeriodExceptionsPage() {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <h1 className="text-2xl font-semibold mb-4">Period Exceptions Rating Zone Name</h1>
      <p>Period Exceptions configuration coming soon</p>
    </div>
  );
}

export function CDRReratingPage() {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <h1 className="text-2xl font-semibold mb-4">CDR Rerating</h1>
      <p>CDR Rerating configuration coming soon</p>
    </div>
  );
}

export function RatingZoneNamePage() {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <h1 className="text-2xl font-semibold mb-4">Rating Zone Name</h1>
      <p>Rating Zone Name configuration coming soon</p>
    </div>
  );
}
