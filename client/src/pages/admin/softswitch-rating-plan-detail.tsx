import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
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
import { ChevronDown, Search, Settings2, Loader2, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { CustomerRatingPlan, CustomerRatingPlanRate } from "@shared/schema";

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
  advancedOptions: string;
  minMargin: string;
  applyDefaultMargin: boolean;
  blocked: boolean;
  locked: boolean;
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
  advancedOptions: "",
  minMargin: "0",
  applyDefaultMargin: false,
  blocked: false,
  locked: false,
};

const timeClassOptions = [
  { id: "1", name: "AnyDay" },
  { id: "2", name: "Middle East Weekend" },
  { id: "3", name: "Weekend" },
];

export default function RatingPlanDetailPage() {
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
  const [showFilter, setShowFilter] = useState("assigned");
  const [codeFilter, setCodeFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [timeClassFilter, setTimeClassFilter] = useState("any");
  const [originSetFilter, setOriginSetFilter] = useState("");
  const [originRatesFilter, setOriginRatesFilter] = useState("any");
  const [blockedFilter, setBlockedFilter] = useState(false);
  const [lockedFilter, setLockedFilter] = useState("any");
  
  const [zoneSuggestions, setZoneSuggestions] = useState<string[]>([]);
  const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);
  const [codesText, setCodesText] = useState("");
  
  const [displayOptions, setDisplayOptions] = useState({
    options: false,
    connectionCharge: false,
    initialCharge: false,
    initialInterval: false,
    minMargin: false,
  });
  const [displayTimeZone, setDisplayTimeZone] = useState("UTC");
  const [carrierTimeZone, setCarrierTimeZone] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: plan, isLoading: planLoading } = useQuery<CustomerRatingPlan>({
    queryKey: [`/api/softswitch/rating/customer-plans/${planId}`],
    enabled: !!planId,
  });

  const { data: rates = [], isLoading: ratesLoading, refetch: refetchRates } = useQuery<CustomerRatingPlanRate[]>({
    queryKey: [`/api/softswitch/rating/customer-plans/${planId}/rates`],
    enabled: !!planId,
  });

  const createRateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/softswitch/rating/customer-plans/${planId}/rates`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/softswitch/rating/customer-plans/${planId}/rates`] });
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

  const handleSaveRate = () => {
    if (!addRateForm.zone || addRateForm.codes.length === 0) {
      toast({ title: "Error", description: "Zone and codes are required", variant: "destructive" });
      return;
    }
    if (!addRateForm.recurringCharge || parseFloat(addRateForm.recurringCharge) < 0) {
      toast({ title: "Error", description: "Valid recurring charge is required", variant: "destructive" });
      return;
    }

    const effectiveDateISO = addRateForm.useCurrentDateTime 
      ? new Date().toISOString()
      : new Date(`${addRateForm.effectiveDate}T${addRateForm.effectiveTime}:00`).toISOString();
    
    const endDateISO = addRateForm.endDate 
      ? new Date(`${addRateForm.endDate}T${addRateForm.endTime}:00`).toISOString()
      : null;

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
      recurringCharge: addRateForm.recurringCharge,
      recurringInterval: parseInt(addRateForm.recurringInterval) || 1,
      advancedOptions: addRateForm.advancedOptions || null,
      minMargin: addRateForm.minMargin,
      applyDefaultMargin: addRateForm.applyDefaultMargin,
      blocked: addRateForm.blocked,
      locked: addRateForm.locked,
      currency: plan?.currency || "USD",
    });
  };

  const getEffectiveStatus = (rate: CustomerRatingPlanRate) => {
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
      if (lockedFilter !== "any") {
        if (lockedFilter === "yes" && !rate.locked) return false;
        if (lockedFilter === "no" && rate.locked) return false;
      }
      return true;
    });
  }, [rates, codeFilter, zoneFilter, timeClassFilter, effectiveFilter, blockedFilter, lockedFilter]);

  const totalRates = filteredRates.length;
  const totalPages = Math.ceil(totalRates / pageSize);
  const paginatedRates = filteredRates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a 
            href="/admin/softswitch/rating/customer-plans" 
            className="hover:underline text-primary"
            onClick={(e) => { e.preventDefault(); setLocation("/admin/softswitch/rating/customer-plans"); }}
          >
            Customer Rating Plans
          </a>
          <span>/</span>
          <span className="font-medium text-foreground">{plan.name}</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="button-actions">
              Actions <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowAddRateModal(true)} data-testid="menu-add-rate">
              Add Rate
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-export-rates">Export Rates</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-import-rates">Import Customer Rates</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-usage-check">Usage Check</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-update-blocking">Update Blocking</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-update-locking">Update Locking</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-update-margin">Update Margin</DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-apply-floor-price">Apply Floor Price</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rates" data-testid="tab-rates">Rates</TabsTrigger>
          <TabsTrigger value="plan-details" data-testid="tab-plan-details">Plan Details</TabsTrigger>
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
                type="time" 
                value={effectiveTime}
                onChange={(e) => setEffectiveTime(e.target.value)}
                className="w-20"
                data-testid="input-effective-time"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Show</Label>
              <Select value={showFilter} onValueChange={setShowFilter}>
                <SelectTrigger className="w-36" data-testid="select-show-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned Codes</SelectItem>
                  <SelectItem value="all">All Codes</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Locked</Label>
              <Select value={lockedFilter} onValueChange={setLockedFilter}>
                <SelectTrigger className="w-20" data-testid="select-locked-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
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
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="display-min-margin"
                          checked={displayOptions.minMargin}
                          onCheckedChange={(checked) => setDisplayOptions(prev => ({ ...prev, minMargin: checked as boolean }))}
                        />
                        <Label htmlFor="display-min-margin" className="text-sm">Min Margin</Label>
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
                    <div className="flex items-center gap-4">
                      <Label className="text-sm">Carrier Time Zone</Label>
                      <Input 
                        value={carrierTimeZone}
                        onChange={(e) => setCarrierTimeZone(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">Default</Button>
                    </div>
                  </div>
                  <Button className="w-full" data-testid="button-apply-display-options">
                    Apply Display Options
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="outline" size="sm" data-testid="button-change-code-view">
            Change to Code View
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
                    <TableHead>Locked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No rates found. Click "Actions" → "Add Rate" to add rates.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRates.map((rate) => {
                      const status = getEffectiveStatus(rate);
                      return (
                        <TableRow key={rate.id} data-testid={`row-rate-${rate.id}`}>
                          <TableCell className="text-primary">{rate.zone}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={rate.codes.join(", ")}>
                            {rate.codes.length > 3 ? `${rate.codes.slice(0, 3).join(", ")}...` : rate.codes.join(", ")}
                          </TableCell>
                          <TableCell>{rate.originSet || "-"}</TableCell>
                          <TableCell>{rate.timeClassName}</TableCell>
                          <TableCell>
                            {new Date(rate.effectiveDate).toLocaleString("en-GB", { 
                              day: "2-digit", month: "2-digit", year: "numeric", 
                              hour: "2-digit", minute: "2-digit" 
                            })}
                          </TableCell>
                          <TableCell>
                            {rate.endDate ? new Date(rate.endDate).toLocaleString("en-GB", { 
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
                          <TableCell>{rate.recurringCharge}</TableCell>
                          <TableCell>{rate.recurringInterval}</TableCell>
                          <TableCell>{rate.locked ? "1" : "-"}</TableCell>
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
          <div className="py-12 text-center text-muted-foreground">
            Plan Details configuration coming soon
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="py-12 text-center text-muted-foreground">
            Rate History & Restore coming soon
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddRateModal} onOpenChange={setShowAddRateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Rate</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <Badge className="bg-primary mb-6">Details</Badge>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Zone and Code</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-24 text-right text-sm">Zone</Label>
                      <div className="flex-1 relative">
                        <Input 
                          value={addRateForm.zone}
                          onChange={(e) => setAddRateForm(prev => ({ ...prev, zone: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              setShowZoneSuggestions(false);
                              handleLookupCodes();
                            }
                          }}
                          onBlur={() => setTimeout(() => setShowZoneSuggestions(false), 200)}
                          placeholder=""
                          data-testid="input-add-rate-zone"
                        />
                        {showZoneSuggestions && zoneSuggestions.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {zoneSuggestions.map((zone) => (
                              <div 
                                key={zone}
                                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                                onClick={() => handleZoneSelect(zone)}
                              >
                                {zone}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={handleLookupCodes} data-testid="button-lookup-codes">
                        Lookup Codes
                      </Button>
                    </div>
                    <div className="flex items-start gap-4">
                      <Label className="w-24 text-right text-sm pt-2">Codes</Label>
                      <div className="flex-1">
                        <textarea 
                          value={codesText}
                          onChange={(e) => handleCodesChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleLookupZone();
                            }
                          }}
                          placeholder=""
                          className="w-full h-20 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                          data-testid="input-add-rate-codes"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={handleLookupZone} data-testid="button-lookup-zone">
                        Lookup Zone
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-24 text-right text-sm">Origin Set</Label>
                      <Select 
                        value={addRateForm.originSet} 
                        onValueChange={(val) => setAddRateForm(prev => ({ ...prev, originSet: val }))}
                      >
                        <SelectTrigger className="flex-1" data-testid="select-add-rate-origin-set">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Effective Time</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-24 text-right text-sm">Time Class</Label>
                      <Select 
                        value={addRateForm.timeClassName} 
                        onValueChange={(val) => setAddRateForm(prev => ({ ...prev, timeClassName: val }))}
                      >
                        <SelectTrigger className="flex-1" data-testid="select-add-rate-time-class">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeClassOptions.map(tc => (
                            <SelectItem key={tc.id} value={tc.name}>{tc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-24 text-right text-sm">Time Zone</Label>
                      <span className="text-sm text-muted-foreground">UTC</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Effective Dates and Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-24 text-right text-sm">Effective Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-36 justify-start text-left font-normal",
                              !addRateForm.effectiveDate && "text-muted-foreground"
                            )}
                            data-testid="input-add-rate-effective-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {addRateForm.effectiveDate 
                              ? format(new Date(addRateForm.effectiveDate), "MM/dd/yyyy")
                              : "mm/dd/yyyy"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-0">
                            <Calendar
                              mode="single"
                              selected={addRateForm.effectiveDate ? new Date(addRateForm.effectiveDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setAddRateForm(prev => ({ 
                                    ...prev, 
                                    effectiveDate: format(date, "yyyy-MM-dd") 
                                  }));
                                }
                              }}
                              initialFocus
                            />
                            <div className="border-t p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setAddRateForm(prev => ({ 
                                    ...prev, 
                                    effectiveDate: format(new Date(), "yyyy-MM-dd") 
                                  }));
                                }}
                                data-testid="button-effective-date-today"
                              >
                                Today
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Input 
                        type="text"
                        placeholder="00:00"
                        value={addRateForm.effectiveTime}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9:]/g, '');
                          setAddRateForm(prev => ({ ...prev, effectiveTime: val }));
                        }}
                        className="w-20 text-center"
                        data-testid="input-add-rate-effective-time"
                      />
                    </div>
                    <div className="flex items-center gap-4 pl-28">
                      <Checkbox 
                        id="use-current-datetime"
                        checked={addRateForm.useCurrentDateTime}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const now = new Date();
                            const dateStr = format(now, "yyyy-MM-dd");
                            const timeStr = now.toTimeString().slice(0, 5);
                            setAddRateForm(prev => ({ 
                              ...prev, 
                              useCurrentDateTime: true,
                              effectiveDate: dateStr,
                              effectiveTime: timeStr
                            }));
                          } else {
                            setAddRateForm(prev => ({ ...prev, useCurrentDateTime: false }));
                          }
                        }}
                        data-testid="checkbox-use-current-datetime"
                      />
                      <Label htmlFor="use-current-datetime" className="text-sm">Use Current Date & Time</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-24 text-right text-sm">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-36 justify-start text-left font-normal",
                              !addRateForm.endDate && "text-muted-foreground"
                            )}
                            data-testid="input-add-rate-end-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {addRateForm.endDate 
                              ? format(new Date(addRateForm.endDate), "MM/dd/yyyy")
                              : "mm/dd/yyyy"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-0">
                            <Calendar
                              mode="single"
                              selected={addRateForm.endDate ? new Date(addRateForm.endDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setAddRateForm(prev => ({ 
                                    ...prev, 
                                    endDate: format(date, "yyyy-MM-dd") 
                                  }));
                                }
                              }}
                              initialFocus
                            />
                            <div className="border-t p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setAddRateForm(prev => ({ 
                                    ...prev, 
                                    endDate: format(new Date(), "yyyy-MM-dd") 
                                  }));
                                }}
                                data-testid="button-end-date-today"
                              >
                                Today
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Input 
                        type="text"
                        placeholder="00:00"
                        value={addRateForm.endTime}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9:]/g, '');
                          setAddRateForm(prev => ({ ...prev, endTime: val }));
                        }}
                        className="w-20 text-center"
                        data-testid="input-add-rate-end-time"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-24 text-right text-sm">Effective Status</Label>
                      <span className="text-sm text-muted-foreground">
                        {addRateForm.useCurrentDateTime || new Date(`${addRateForm.effectiveDate}T${addRateForm.effectiveTime}`) <= new Date() 
                          ? "Active" 
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Applied Charges</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Connection Charge</Label>
                      <Input 
                        type="number"
                        step="0.0001"
                        value={addRateForm.connectionCharge}
                        onChange={(e) => setAddRateForm(prev => ({ ...prev, connectionCharge: e.target.value }))}
                        className="w-24"
                        data-testid="input-add-rate-connection-charge"
                      />
                      <span className="text-sm">{plan?.currency}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Initial Charge</Label>
                      <Input 
                        type="number"
                        step="0.0001"
                        value={addRateForm.initialCharge}
                        onChange={(e) => setAddRateForm(prev => ({ ...prev, initialCharge: e.target.value }))}
                        className="w-24"
                        data-testid="input-add-rate-initial-charge"
                      />
                      <span className="text-sm">{plan?.currency}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Initial Interval</Label>
                      <Input 
                        type="number"
                        value={addRateForm.initialInterval}
                        onChange={(e) => setAddRateForm(prev => ({ ...prev, initialInterval: e.target.value }))}
                        className="w-24"
                        data-testid="input-add-rate-initial-interval"
                      />
                      <span className="text-sm">Seconds</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Recurring Charge</Label>
                      <Input 
                        type="number"
                        step="0.0001"
                        value={addRateForm.recurringCharge}
                        onChange={(e) => setAddRateForm(prev => ({ ...prev, recurringCharge: e.target.value }))}
                        className="w-24"
                        data-testid="input-add-rate-recurring-charge"
                      />
                      <span className="text-sm">{plan?.currency}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Recurring Interval</Label>
                      <Input 
                        type="number"
                        value={addRateForm.recurringInterval}
                        onChange={(e) => setAddRateForm(prev => ({ ...prev, recurringInterval: e.target.value }))}
                        className="w-24"
                        data-testid="input-add-rate-recurring-interval"
                      />
                      <span className="text-sm">Seconds</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm text-primary">Period Exception</Label>
                      <Checkbox 
                        id="use-period-exception"
                        checked={addRateForm.usePeriodException}
                        onCheckedChange={(checked) => {
                          setAddRateForm(prev => ({ ...prev, usePeriodException: !!checked }));
                        }}
                        data-testid="checkbox-use-period-exception"
                      />
                      <span className="text-sm text-primary">Apply Defaults</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Rating Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Advanced Options</Label>
                      <Input 
                        value={addRateForm.advancedOptions}
                        onChange={(e) => setAddRateForm(prev => ({ ...prev, advancedOptions: e.target.value }))}
                        className="flex-1"
                        data-testid="input-add-rate-advanced-options"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Margin Enforcement</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Min Margin</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={addRateForm.minMargin}
                        onChange={(e) => setAddRateForm(prev => ({ ...prev, minMargin: e.target.value }))}
                        className="w-16"
                        data-testid="input-add-rate-min-margin"
                      />
                      <span className="text-sm">%</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Checkbox 
                          id="apply-default-margin"
                          checked={addRateForm.applyDefaultMargin}
                          onCheckedChange={(checked) => setAddRateForm(prev => ({ ...prev, applyDefaultMargin: checked as boolean }))}
                          data-testid="checkbox-apply-default-margin"
                        />
                        <Label htmlFor="apply-default-margin" className="text-sm">Apply Default</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Rate Blocking</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Blocked</Label>
                      <Select 
                        value={addRateForm.blocked ? "yes" : "no"} 
                        onValueChange={(val) => setAddRateForm(prev => ({ ...prev, blocked: val === "yes" }))}
                      >
                        <SelectTrigger className="w-20" data-testid="select-add-rate-blocked">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Rate Locking</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="w-36 text-right text-sm">Locked</Label>
                      <Select 
                        value={addRateForm.locked ? "yes" : "no"} 
                        onValueChange={(val) => setAddRateForm(prev => ({ ...prev, locked: val === "yes" }))}
                      >
                        <SelectTrigger className="w-20" data-testid="select-add-rate-locked">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => { setShowAddRateModal(false); setAddRateForm(defaultAddRateForm); setCodesText(""); }}
              data-testid="button-cancel-add-rate"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRate}
              disabled={createRateMutation.isPending}
              data-testid="button-save-rate"
            >
              {createRateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
