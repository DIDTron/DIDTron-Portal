import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { DataTableFooter } from "@/components/ui/data-table-footer";
import { ChevronDown, Search, Settings2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupplierRatingPlan, SupplierRatingPlanRate } from "@shared/schema";

const PARENT_ROUTE = "/admin/softswitch/rating/supplier-plans";

interface AddRateFormData {
  zone: string;
  codes: string[];
  originSet: string;
  timeClassId: string;
  timeClassName: string;
  effectiveDate: string;
  effectiveTime: string;
  endDate: string;
  endTime: string;
  useCurrentDateTime: boolean;
  connectionCharge: string;
  initialCharge: string;
  initialInterval: string;
  recurringCharge: string;
  recurringInterval: string;
  usePeriodException: boolean;
  copyRecurringFromInitial: boolean;
  advancedOptions: string;
  blocked: boolean;
}

const defaultAddRateForm: AddRateFormData = {
  zone: "",
  codes: [],
  originSet: "",
  timeClassId: "",
  timeClassName: "AnyDay",
  effectiveDate: new Date().toISOString().split("T")[0],
  effectiveTime: "00:00",
  endDate: "",
  endTime: "00:00",
  useCurrentDateTime: false,
  connectionCharge: "0.0000",
  initialCharge: "0.0000",
  initialInterval: "1",
  recurringCharge: "0.0000",
  recurringInterval: "1",
  usePeriodException: true,
  copyRecurringFromInitial: true,
  advancedOptions: "",
  blocked: false,
};

const timeClassOptions = [
  { id: "1", name: "AnyDay" },
  { id: "2", name: "Middle East Weekend" },
  { id: "3", name: "Weekend" },
];

export default function SupplierRatingPlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("rates");
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [addRateForm, setAddRateForm] = useState<AddRateFormData>(defaultAddRateForm);
  
  const [effectiveFilter, setEffectiveFilter] = useState("any");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [effectiveTime, setEffectiveTime] = useState("00:00");
  const [codeFilter, setCodeFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [timeClassFilter, setTimeClassFilter] = useState("any");
  const [originSetFilter, setOriginSetFilter] = useState("");
  const [originRatesFilter, setOriginRatesFilter] = useState("any");
  const [blockedFilter, setBlockedFilter] = useState(false);
  
  const [zoneSuggestions, setZoneSuggestions] = useState<string[]>([]);
  const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);
  const [codesText, setCodesText] = useState("");
  
  const [isEditingPlanDetails, setIsEditingPlanDetails] = useState(false);
  const [selectedHistoryVersion, setSelectedHistoryVersion] = useState<string | null>(null);
  const [showRestoreConfirmDialog, setShowRestoreConfirmDialog] = useState(false);
  const [planDetailsForm, setPlanDetailsForm] = useState({
    name: "",
    shortCode: "",
    currency: "USD",
    originMappingGroupId: "",
  });
  
  const [displayOptions, setDisplayOptions] = useState({
    options: false,
    connectionCharge: false,
    initialCharge: false,
    initialInterval: false,
  });
  const [displayTimeZone, setDisplayTimeZone] = useState("UTC");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [showRecurringWarning, setShowRecurringWarning] = useState(false);
  const [warningConfirmText, setWarningConfirmText] = useState("");
  const [displayMode, setDisplayMode] = useState<"zone" | "code">("zone");

  const { data: plan, isLoading: planLoading } = useQuery<SupplierRatingPlan>({
    queryKey: [`/api/softswitch/rating/supplier-plans/${planId}`],
    enabled: !!planId,
    staleTime: STALE_TIME.DETAIL,
  });

  const { data: ratesResponse, isLoading: ratesLoading, refetch: refetchRates } = useQuery<{ items: SupplierRatingPlanRate[], nextCursor: string | null }>({
    queryKey: [`/api/softswitch/rating/supplier-plans/${planId}/rates`],
    enabled: !!planId,
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });
  const rates = ratesResponse?.items ?? [];

  const createRateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/softswitch/rating/supplier-plans/${planId}/rates`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/softswitch/rating/supplier-plans/${planId}/rates`] });
      setShowAddRateModal(false);
      setAddRateForm(defaultAddRateForm);
      setCodesText("");
      toast({ title: "Success", description: "Rate added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add rate", variant: "destructive" });
    },
  });

  const searchZonesMutation = useMutation({
    mutationFn: async (search: string) => {
      const response = await fetch(`/api/softswitch/rating/az-lookup/zones?search=${encodeURIComponent(search)}`);
      return response.json();
    },
    onSuccess: (zones: string[]) => {
      setZoneSuggestions(zones);
      setShowZoneSuggestions(zones.length > 0);
    },
  });

  const lookupCodesMutation = useMutation({
    mutationFn: async (zone: string) => {
      const response = await fetch(`/api/softswitch/rating/az-lookup/codes?zone=${encodeURIComponent(zone)}&withIntervals=true`);
      return response.json();
    },
    onSuccess: (data: { codes: string[], billingIncrement: string | null }) => {
      const { codes, billingIncrement } = data;
      setAddRateForm(prev => {
        let initialInterval = prev.initialInterval;
        let recurringInterval = prev.recurringInterval;
        if (prev.usePeriodException && billingIncrement) {
          const parts = billingIncrement.split('/');
          if (parts.length === 2) {
            initialInterval = parts[0];
            recurringInterval = parts[1];
          }
        }
        return { ...prev, codes, initialInterval, recurringInterval };
      });
      setCodesText(codes.join(", "));
    },
  });

  const lookupZoneMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(`/api/softswitch/rating/az-lookup/zone-by-code?code=${encodeURIComponent(code)}`);
      return response.json();
    },
    onSuccess: (data: { zone: string | null }) => {
      if (data.zone) {
        setAddRateForm(prev => ({ ...prev, zone: data.zone! }));
      } else {
        toast({ title: "Not Found", description: "No zone found for this code", variant: "destructive" });
      }
    },
  });

  useEffect(() => {
    if (addRateForm.zone.length >= 2) {
      const timer = setTimeout(() => {
        searchZonesMutation.mutate(addRateForm.zone);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setZoneSuggestions([]);
      setShowZoneSuggestions(false);
    }
  }, [addRateForm.zone]);

  useEffect(() => {
    if (plan) {
      setPlanDetailsForm({
        name: plan.name || "",
        shortCode: plan.shortCode || "",
        currency: plan.currency || "USD",
        originMappingGroupId: (plan as any).originMappingGroupId || "",
      });
    }
  }, [plan]);

  const updatePlanDetailsMutation = useMutation({
    mutationFn: async (data: typeof planDetailsForm) => {
      const response = await apiRequest("PATCH", `/api/softswitch/rating/supplier-plans/${planId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/softswitch/rating/supplier-plans/${planId}`] });
      setIsEditingPlanDetails(false);
      toast({ title: "Success", description: "Plan details updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleZoneSelect = (zone: string) => {
    setAddRateForm(prev => ({ ...prev, zone }));
    setShowZoneSuggestions(false);
  };

  const handleLookupCodes = () => {
    if (addRateForm.zone) {
      lookupCodesMutation.mutate(addRateForm.zone);
    }
  };

  const handleLookupZone = () => {
    const firstCode = codesText.split(",")[0]?.trim();
    if (firstCode) {
      lookupZoneMutation.mutate(firstCode);
    }
  };

  const handleCodesChange = (value: string) => {
    setCodesText(value);
    const codes = value.split(",").map(c => c.trim()).filter(c => c);
    setAddRateForm(prev => ({ ...prev, codes }));
  };

  const doSubmitRate = () => {
    const effectiveDateISO = addRateForm.useCurrentDateTime 
      ? new Date().toISOString()
      : new Date(`${addRateForm.effectiveDate}T${addRateForm.effectiveTime}:00`).toISOString();
    
    const endDateISO = addRateForm.endDate 
      ? new Date(`${addRateForm.endDate}T${addRateForm.endTime}:00`).toISOString()
      : null;

    const finalRecurringCharge = addRateForm.copyRecurringFromInitial 
      ? addRateForm.initialCharge 
      : addRateForm.recurringCharge;

    createRateMutation.mutate({
      zone: addRateForm.zone,
      codes: addRateForm.codes,
      originSet: addRateForm.originSet || null,
      timeClassId: addRateForm.timeClassId || null,
      timeClassName: addRateForm.timeClassName,
      effectiveDate: effectiveDateISO,
      endDate: endDateISO,
      connectionCharge: addRateForm.connectionCharge,
      initialCharge: addRateForm.initialCharge,
      initialInterval: parseInt(addRateForm.initialInterval) || 1,
      recurringCharge: finalRecurringCharge,
      recurringInterval: parseInt(addRateForm.recurringInterval) || 1,
      advancedOptions: addRateForm.advancedOptions || null,
      blocked: addRateForm.blocked,
      currency: plan?.currency || "USD",
    });
  };

  const handleSaveRate = () => {
    if (!addRateForm.zone || addRateForm.codes.length === 0) {
      toast({ title: "Error", description: "Zone and codes are required", variant: "destructive" });
      return;
    }
    
    const finalRecurringCharge = addRateForm.copyRecurringFromInitial 
      ? addRateForm.initialCharge 
      : addRateForm.recurringCharge;
      
    if (!finalRecurringCharge || parseFloat(finalRecurringCharge) < 0) {
      toast({ title: "Error", description: "Valid recurring charge is required", variant: "destructive" });
      return;
    }

    if (!addRateForm.copyRecurringFromInitial) {
      const recurring = parseFloat(addRateForm.recurringCharge) || 0;
      const initial = parseFloat(addRateForm.initialCharge) || 0;
      if (recurring < initial) {
        setShowRecurringWarning(true);
        setWarningConfirmText("");
        return;
      }
    }

    doSubmitRate();
  };

  const handleWarningConfirm = () => {
    if (warningConfirmText.toLowerCase() === "yes") {
      setShowRecurringWarning(false);
      setWarningConfirmText("");
      doSubmitRate();
    }
  };

  const getEffectiveStatus = (rate: SupplierRatingPlanRate) => {
    const now = new Date();
    const effectiveDate = new Date(rate.effectiveDate);
    const endDate = rate.endDate ? new Date(rate.endDate) : null;
    
    if (endDate && now > endDate) return "expired";
    if (now >= effectiveDate) return "active";
    return "pending";
  };

  const filteredRates = useMemo(() => {
    return rates.filter(rate => {
      if (codeFilter && !rate.codes.some(c => c.includes(codeFilter))) return false;
      if (zoneFilter && !rate.zone.toLowerCase().includes(zoneFilter.toLowerCase())) return false;
      if (timeClassFilter !== "any" && rate.timeClassName !== timeClassFilter) return false;
      if (effectiveFilter !== "any") {
        const status = getEffectiveStatus(rate);
        if (effectiveFilter === "active" && status !== "active") return false;
        if (effectiveFilter === "pending" && status !== "pending") return false;
        if (effectiveFilter === "expired" && status !== "expired") return false;
        if (effectiveFilter === "active_and_pending" && status === "expired") return false;
      }
      if (blockedFilter && !rate.blocked) return false;
      return true;
    });
  }, [rates, codeFilter, zoneFilter, timeClassFilter, effectiveFilter, blockedFilter]);

  interface DisplayRow {
    id: string;
    zone: string;
    codes: string;
    codesFullList: string;
    originSet: string | null;
    timeClassName: string;
    effectiveDate: Date | string;
    endDate: Date | string | null;
    recurringCharge: string;
    recurringInterval: number | null;
    blocked: boolean | null;
    originalRate: SupplierRatingPlanRate;
  }

  const displayRows = useMemo((): DisplayRow[] => {
    if (displayMode === "zone") {
      return filteredRates.map(rate => ({
        id: rate.id,
        zone: rate.zone,
        codes: rate.codes.length > 3 ? `${rate.codes.slice(0, 3).join(", ")}...` : rate.codes.join(", "),
        codesFullList: rate.codes.join(", "),
        originSet: rate.originSet,
        timeClassName: rate.timeClassName || "AnyDay",
        effectiveDate: rate.effectiveDate,
        endDate: rate.endDate,
        recurringCharge: rate.recurringCharge,
        recurringInterval: rate.recurringInterval,
        blocked: rate.blocked,
        originalRate: rate,
      }));
    } else {
      const rows: DisplayRow[] = [];
      filteredRates.forEach(rate => {
        rate.codes.forEach((code, idx) => {
          rows.push({
            id: `${rate.id}-${idx}`,
            zone: rate.zone,
            codes: code,
            codesFullList: code,
            originSet: rate.originSet,
            timeClassName: rate.timeClassName || "AnyDay",
            effectiveDate: rate.effectiveDate,
            endDate: rate.endDate,
            recurringCharge: rate.recurringCharge,
            recurringInterval: rate.recurringInterval,
            blocked: rate.blocked,
            originalRate: rate,
          });
        });
      });
      return rows;
    }
  }, [filteredRates, displayMode]);

  const totalRates = displayRows.length;
  const totalPages = Math.ceil(totalRates / pageSize);
  const paginatedRates = displayRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  if (planLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        Loading rating plan...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Rating plan not found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link 
            href={PARENT_ROUTE}
            className="text-primary hover:underline"
          >
            Supplier Rating
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{plan.name}</span>
        </div>
        
        {activeTab === "rates" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid="button-actions">
                Actions <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowAddRateModal(true)} data-testid="menu-add-supplier-rate">
                Add Supplier Rate
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-export-rates">Export Rates</DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-import-supplier-rates">Import Supplier Rates</DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-update-blocking">Update Blocking</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {activeTab === "history" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid="button-actions-history">
                Actions <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                disabled={!selectedHistoryVersion}
                onClick={() => selectedHistoryVersion && setShowRestoreConfirmDialog(true)}
                className={!selectedHistoryVersion ? "opacity-50 cursor-not-allowed" : ""}
                data-testid="menu-restore-version"
              >
                Restore Selected Version
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rates" data-testid="tab-rates">Rates</TabsTrigger>
          <TabsTrigger value="plan-details" data-testid="tab-plan-details">Plan Details</TabsTrigger>
          <TabsTrigger value="origin-codes" data-testid="tab-origin-codes">Origin Codes</TabsTrigger>
          <TabsTrigger value="origin-sets" data-testid="tab-origin-sets">Origin Sets</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Rate History & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 border-b pb-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">Effective</Label>
              <Select value={effectiveFilter} onValueChange={setEffectiveFilter}>
                <SelectTrigger className="w-32" data-testid="select-effective-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active_and_pending">Active and Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="effective_from">Effective From</SelectItem>
                  <SelectItem value="effective_at">Effective At</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-36"
                data-testid="input-effective-date"
              />
              <Input 
                type="text" 
                value={effectiveTime}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val) || val.length <= 5) {
                    setEffectiveTime(val);
                  }
                }}
                placeholder="00:00"
                maxLength={5}
                className="w-20 text-center"
                data-testid="input-effective-time"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Code</Label>
              <Input 
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
                placeholder=""
                className="w-28"
                data-testid="input-code-filter"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Zone</Label>
              <Input 
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                placeholder=""
                className="w-28"
                data-testid="input-zone-filter"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Time Class</Label>
              <Select value={timeClassFilter} onValueChange={setTimeClassFilter}>
                <SelectTrigger className="w-24" data-testid="select-time-class-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {timeClassOptions.map(tc => (
                    <SelectItem key={tc.id} value={tc.name}>{tc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Origin Set</Label>
              <Input 
                value={originSetFilter}
                onChange={(e) => setOriginSetFilter(e.target.value)}
                placeholder=""
                className="w-28"
                data-testid="input-origin-set-filter"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Origin Rates</Label>
              <Select value={originRatesFilter} onValueChange={setOriginRatesFilter}>
                <SelectTrigger className="w-20" data-testid="select-origin-rates-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="blocked-filter"
                checked={blockedFilter}
                onCheckedChange={(checked) => setBlockedFilter(checked as boolean)}
                data-testid="checkbox-blocked-filter"
              />
              <Label htmlFor="blocked-filter" className="text-sm">Blocked</Label>
            </div>
            <Button variant="ghost" size="icon" data-testid="button-search-rates">
              <Search className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-display-options">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium">Display Options</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Display Fields</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="display-options"
                          checked={displayOptions.options}
                          onCheckedChange={(checked) => setDisplayOptions(prev => ({ ...prev, options: checked as boolean }))}
                        />
                        <Label htmlFor="display-options" className="text-sm">Options</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="display-connection-charge"
                          checked={displayOptions.connectionCharge}
                          onCheckedChange={(checked) => setDisplayOptions(prev => ({ ...prev, connectionCharge: checked as boolean }))}
                        />
                        <Label htmlFor="display-connection-charge" className="text-sm">Connection Charge</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="display-initial-charge"
                          checked={displayOptions.initialCharge}
                          onCheckedChange={(checked) => setDisplayOptions(prev => ({ ...prev, initialCharge: checked as boolean }))}
                        />
                        <Label htmlFor="display-initial-charge" className="text-sm">Initial Charge</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="display-initial-interval"
                          checked={displayOptions.initialInterval}
                          onCheckedChange={(checked) => setDisplayOptions(prev => ({ ...prev, initialInterval: checked as boolean }))}
                        />
                        <Label htmlFor="display-initial-interval" className="text-sm">Initial Interval</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Label className="text-sm">Time Zone</Label>
                      <Select value={displayTimeZone} onValueChange={setDisplayTimeZone}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="local">Local</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" data-testid="button-apply-display-options">
                    Apply Display Options
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDisplayMode(prev => prev === "zone" ? "code" : "zone")}
            data-testid="button-change-code-view"
          >
            {displayMode === "zone" ? "Change to Code View" : "Change to Zone View"}
          </Button>

          {ratesLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading rates...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Codes</TableHead>
                    <TableHead>Origin Set</TableHead>
                    <TableHead>Time Class</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Effective Status</TableHead>
                    <TableHead>Recurring Charge ({plan.currency})</TableHead>
                    <TableHead>Recurring Interval</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No rates found. Click "Actions" → "Add Supplier Rate" to add rates.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRates.map((row) => {
                      const status = getEffectiveStatus(row.originalRate);
                      return (
                        <TableRow key={row.id} data-testid={`row-rate-${row.id}`}>
                          <TableCell className="text-primary">{row.zone}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={row.codesFullList}>
                            {row.codes}
                          </TableCell>
                          <TableCell>{row.originSet || "-"}</TableCell>
                          <TableCell>{row.timeClassName}</TableCell>
                          <TableCell>
                            {new Date(row.effectiveDate).toLocaleString("en-GB", { 
                              day: "2-digit", month: "2-digit", year: "numeric", 
                              hour: "2-digit", minute: "2-digit" 
                            })}
                          </TableCell>
                          <TableCell>
                            {row.endDate ? new Date(row.endDate).toLocaleString("en-GB", { 
                              day: "2-digit", month: "2-digit", year: "numeric", 
                              hour: "2-digit", minute: "2-digit" 
                            }) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={cn(
                                status === "active" && "bg-teal-500 hover:bg-teal-500",
                                status === "pending" && "bg-amber-500 hover:bg-amber-500",
                                status === "expired" && "bg-gray-500 hover:bg-gray-500"
                              )}
                            >
                              {status === "active" ? "A" : status === "pending" ? "P" : "E"}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.recurringCharge}</TableCell>
                          <TableCell>{row.recurringInterval}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-destructive" data-testid={`button-delete-rate-${row.id}`}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <DataTableFooter
                totalItems={totalRates}
                totalPages={totalPages}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="plan-details">
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-md font-medium">
                Plan Details
              </div>
              <div className="space-y-3 px-2">
                <div className="flex items-center gap-4">
                  <Label className="w-40 text-right text-sm text-muted-foreground">Name</Label>
                  {isEditingPlanDetails ? (
                    <Input 
                      value={planDetailsForm.name}
                      onChange={(e) => setPlanDetailsForm(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1"
                      data-testid="input-plan-name"
                    />
                  ) : (
                    <span className="text-sm font-medium">{plan?.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Label className="w-40 text-right text-sm text-muted-foreground">Plan Identifier</Label>
                  {isEditingPlanDetails ? (
                    <Input 
                      value={planDetailsForm.shortCode}
                      onChange={(e) => setPlanDetailsForm(prev => ({ ...prev, shortCode: e.target.value }))}
                      className="flex-1"
                      data-testid="input-plan-identifier"
                    />
                  ) : (
                    <span className="text-sm font-medium">{plan?.shortCode || "-"}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Label className="w-40 text-right text-sm text-muted-foreground">Currency</Label>
                  <span className="text-sm font-medium">{plan?.currency || "USD"}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-2">
                {isEditingPlanDetails ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditingPlanDetails(false)}>Cancel</Button>
                    <Button onClick={() => updatePlanDetailsMutation.mutate(planDetailsForm)} disabled={updatePlanDetailsMutation.isPending}>
                      {updatePlanDetailsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditingPlanDetails(true)} data-testid="button-edit-plan-details">Edit</Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="origin-codes">
          <div className="py-8 text-center text-muted-foreground">
            <p className="mb-4">Origin Codes allow you to define rate variations based on call origin.</p>
            <p>This feature will be implemented to manage origin-based pricing rules.</p>
          </div>
        </TabsContent>

        <TabsContent value="origin-sets">
          <div className="py-8 text-center text-muted-foreground">
            <p className="mb-4">Origin Sets allow you to group origin codes for easier management.</p>
            <p>This feature will be implemented to manage origin set configurations.</p>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4 mt-4">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-md font-medium">
              Rate History & Restore
            </div>
            <div className="py-8 text-center text-muted-foreground">
              <p className="mb-4">View historical versions of this rating plan and restore previous rates.</p>
              <p>Select a version from the history list and use "Actions" → "Restore Selected Version".</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddRateModal} onOpenChange={setShowAddRateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Supplier Rate</DialogTitle>
            <DialogDescription>
              Add a new rate to this supplier rating plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zone</Label>
                <div className="relative">
                  <Input 
                    value={addRateForm.zone}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, zone: e.target.value }))}
                    placeholder="Type to search zones..."
                    data-testid="input-add-zone"
                  />
                  {showZoneSuggestions && zoneSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                      {zoneSuggestions.map((zone, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                          onClick={() => handleZoneSelect(zone)}
                        >
                          {zone}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleLookupCodes} disabled={!addRateForm.zone}>
                  Lookup Codes
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Codes</Label>
                <Input 
                  value={codesText}
                  onChange={(e) => handleCodesChange(e.target.value)}
                  placeholder="Comma separated codes..."
                  data-testid="input-add-codes"
                />
                <Button variant="outline" size="sm" onClick={handleLookupZone} disabled={!codesText}>
                  Lookup Zone
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origin Set</Label>
                <Input 
                  value={addRateForm.originSet}
                  onChange={(e) => setAddRateForm(prev => ({ ...prev, originSet: e.target.value }))}
                  data-testid="input-add-origin-set"
                />
              </div>
              <div className="space-y-2">
                <Label>Time Class</Label>
                <Select 
                  value={addRateForm.timeClassName} 
                  onValueChange={(val) => setAddRateForm(prev => ({ ...prev, timeClassName: val }))}
                >
                  <SelectTrigger data-testid="select-add-time-class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeClassOptions.map(tc => (
                      <SelectItem key={tc.id} value={tc.name}>{tc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date"
                    value={addRateForm.effectiveDate}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    disabled={addRateForm.useCurrentDateTime}
                    data-testid="input-add-effective-date"
                  />
                  <Input 
                    type="text"
                    value={addRateForm.effectiveTime}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, effectiveTime: e.target.value }))}
                    placeholder="00:00"
                    disabled={addRateForm.useCurrentDateTime}
                    className="w-20"
                    data-testid="input-add-effective-time"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="use-current-datetime"
                    checked={addRateForm.useCurrentDateTime}
                    onCheckedChange={(checked) => setAddRateForm(prev => ({ ...prev, useCurrentDateTime: !!checked }))}
                  />
                  <Label htmlFor="use-current-datetime" className="text-sm">Use current date/time</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date"
                    value={addRateForm.endDate}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, endDate: e.target.value }))}
                    data-testid="input-add-end-date"
                  />
                  <Input 
                    type="text"
                    value={addRateForm.endTime}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, endTime: e.target.value }))}
                    placeholder="00:00"
                    className="w-20"
                    data-testid="input-add-end-time"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Charges</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Connection Charge</Label>
                  <Input 
                    type="number"
                    step="0.0001"
                    value={addRateForm.connectionCharge}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, connectionCharge: e.target.value }))}
                    data-testid="input-add-connection-charge"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Initial Charge</Label>
                  <Input 
                    type="number"
                    step="0.0001"
                    value={addRateForm.initialCharge}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, initialCharge: e.target.value }))}
                    data-testid="input-add-initial-charge"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Initial Interval (sec)</Label>
                  <Input 
                    type="number"
                    value={addRateForm.initialInterval}
                    onChange={(e) => setAddRateForm(prev => ({ ...prev, initialInterval: e.target.value }))}
                    data-testid="input-add-initial-interval"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox 
                  id="copy-recurring"
                  checked={addRateForm.copyRecurringFromInitial}
                  onCheckedChange={(checked) => setAddRateForm(prev => ({ ...prev, copyRecurringFromInitial: !!checked }))}
                />
                <Label htmlFor="copy-recurring" className="text-sm">Use Initial Charge as Recurring Charge</Label>
              </div>
              {!addRateForm.copyRecurringFromInitial && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Recurring Charge</Label>
                    <Input 
                      type="number"
                      step="0.0001"
                      value={addRateForm.recurringCharge}
                      onChange={(e) => setAddRateForm(prev => ({ ...prev, recurringCharge: e.target.value }))}
                      data-testid="input-add-recurring-charge"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Recurring Interval (sec)</Label>
                    <Input 
                      type="number"
                      value={addRateForm.recurringInterval}
                      onChange={(e) => setAddRateForm(prev => ({ ...prev, recurringInterval: e.target.value }))}
                      data-testid="input-add-recurring-interval"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="blocked-rate"
                  checked={addRateForm.blocked}
                  onCheckedChange={(checked) => setAddRateForm(prev => ({ ...prev, blocked: !!checked }))}
                />
                <Label htmlFor="blocked-rate" className="text-sm">Blocked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="use-period-exception"
                  checked={addRateForm.usePeriodException}
                  onCheckedChange={(checked) => setAddRateForm(prev => ({ ...prev, usePeriodException: !!checked }))}
                />
                <Label htmlFor="use-period-exception" className="text-sm">Use Period Exception Intervals</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRateModal(false)}>Cancel</Button>
            <Button onClick={handleSaveRate} disabled={createRateMutation.isPending} data-testid="button-save-rate">
              {createRateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRecurringWarning} onOpenChange={setShowRecurringWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning: Recurring Charge Lower Than Initial</DialogTitle>
            <DialogDescription>
              The recurring charge is lower than the initial charge. This is unusual. Type "yes" to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={warningConfirmText}
            onChange={(e) => setWarningConfirmText(e.target.value)}
            placeholder='Type "yes" to confirm'
            data-testid="input-warning-confirm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecurringWarning(false)}>Cancel</Button>
            <Button onClick={handleWarningConfirm} disabled={warningConfirmText.toLowerCase() !== "yes"}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRestoreConfirmDialog} onOpenChange={setShowRestoreConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Rating Plan Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? Current rates will be replaced.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreConfirmDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowRestoreConfirmDialog(false);
              toast({ title: "Version restored", description: "The selected version has been restored." });
            }}>
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
