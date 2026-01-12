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
import { ChevronDown, Search, Settings, AlertCircle, Loader2 } from "lucide-react";
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
    { id: "refresh-inbox", label: "Refresh Inbox", testId: "menu-refresh-inbox" },
    { id: "clear-inbox", label: "Clear Inbox", testId: "menu-clear-inbox" },
  ],
  "import-jobs": [
    { id: "cancel-all-jobs", label: "Cancel All Jobs", testId: "menu-cancel-all-jobs" },
    { id: "clear-completed", label: "Clear Completed", testId: "menu-clear-completed" },
  ],
  "import-summary": [
    { id: "export-summary", label: "Export Summary", testId: "menu-export-summary" },
  ],
  "import-settings": [
    { id: "reset-settings", label: "Reset to Defaults", testId: "menu-reset-settings" },
  ],
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

const mockSupplierPlans: SupplierRatingPlan[] = [
  {
    id: "1",
    name: "ALLIP-SU-ATX",
    supplier: "All IP (All IP ATX SU)",
    supplierInterconnect: "All IP ATX SU",
    blockUnresolvableCodes: true,
    currency: "USD",
    creationTemplate: "ALLIP-SU-ATX",
    uncommittedChanges: false,
    lastUpdated: "12/01/2026 05:30",
    inUse: true,
  },
  {
    id: "2",
    name: "ALLIP-SU-PRM",
    supplier: "All IP (All IP PRM SU)",
    supplierInterconnect: "All IP PRM SU",
    blockUnresolvableCodes: true,
    currency: "USD",
    creationTemplate: "ALLIP-SU-PRM",
    uncommittedChanges: false,
    lastUpdated: "12/01/2026 05:36",
    inUse: true,
  },
  {
    id: "3",
    name: "ALLIP-SU-STD",
    supplier: "All IP (All IP STD SU)",
    supplierInterconnect: "All IP STD SU",
    blockUnresolvableCodes: true,
    currency: "USD",
    creationTemplate: "ALLIP-SU-STD",
    uncommittedChanges: false,
    lastUpdated: "12/01/2026 05:38",
    inUse: true,
  },
  {
    id: "4",
    name: "CKEF-ATX-A-Z",
    supplier: "CKEF (CKEF ATX SU)",
    supplierInterconnect: "CKEF ATX SU",
    blockUnresolvableCodes: true,
    currency: "USD",
    creationTemplate: "CKEF-ATX-A-Z",
    uncommittedChanges: false,
    lastUpdated: "14/11/2025 11:48",
    inUse: true,
  },
  {
    id: "5",
    name: "DEMO 2 VB",
    supplier: "",
    supplierInterconnect: "",
    blockUnresolvableCodes: true,
    currency: "USD",
    creationTemplate: "DEMO2",
    uncommittedChanges: true,
    lastUpdated: "16/10/2025 14:29",
    inUse: false,
  },
  {
    id: "6",
    name: "Egypt TDM SU",
    supplier: "Egypt TDM (Egy TDM SU), Egypt TDM (Egypt TDM NCLI Supplier Interconnect)",
    supplierInterconnect: "Egy TDM SU",
    blockUnresolvableCodes: true,
    currency: "USD",
    creationTemplate: "Default Template",
    uncommittedChanges: false,
    lastUpdated: "01/01/2026 05:04",
    inUse: true,
  },
  {
    id: "7",
    name: "Gizat Supplier Rate",
    supplier: "Gizat Global (Gizat Global Interconnect)",
    supplierInterconnect: "Gizat Global Interconnect",
    blockUnresolvableCodes: true,
    currency: "USD",
    creationTemplate: "Gizat Rate Template",
    uncommittedChanges: false,
    lastUpdated: "16/10/2025 05:48",
    inUse: true,
  },
];

export function SupplierRatingPlansPage() {
  const [tab, setTab] = useState<SupplierRatingTab>("rating-plans");
  const [nameFilter, setNameFilter] = useState("");
  const [uncommittedFilter, setUncommittedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
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

  const currentActions = supplierRatingTabActions[tab];

  const handleAction = (actionId: string) => {
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="rating-plans" data-testid="tab-rating-plans">Rating Plans</TabsTrigger>
          <TabsTrigger value="rate-inbox" data-testid="tab-rate-inbox">Rate Inbox</TabsTrigger>
          <TabsTrigger value="import-jobs" data-testid="tab-import-jobs">Import Jobs</TabsTrigger>
          <TabsTrigger value="import-summary" data-testid="tab-import-summary">Import Summary</TabsTrigger>
          <TabsTrigger value="import-settings" data-testid="tab-import-settings">Import Settings</TabsTrigger>
          <TabsTrigger value="import-templates" data-testid="tab-import-templates">Import Templates</TabsTrigger>
          <TabsTrigger value="import-notifications" data-testid="tab-import-notifications">Import Notifications</TabsTrigger>
          <TabsTrigger value="routing-codes" data-testid="tab-routing-codes">Routing Codes</TabsTrigger>
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

        <TabsContent value="rate-inbox">
          <div className="py-12 text-center text-muted-foreground">
            Rate Inbox coming soon
          </div>
        </TabsContent>

        <TabsContent value="import-jobs">
          <div className="py-12 text-center text-muted-foreground">
            Import Jobs coming soon
          </div>
        </TabsContent>

        <TabsContent value="import-summary">
          <div className="py-12 text-center text-muted-foreground">
            Import Summary coming soon
          </div>
        </TabsContent>

        <TabsContent value="import-settings">
          <div className="py-12 text-center text-muted-foreground">
            Import Settings coming soon
          </div>
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
