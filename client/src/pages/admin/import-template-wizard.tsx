import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Loader2, Upload, FileSpreadsheet, X, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Carrier {
  id: string;
  name: string;
  partnerType: string;
}

interface Interconnect {
  id: string;
  name: string;
  carrierId: string;
  direction: string;
}

interface BusinessRule {
  id: string;
  name: string;
}

interface SupplierImportTemplate {
  id: string;
  name: string;
  carrierId: string | null;
  interconnectId: string | null;
  identificationType: string | null;
  trustedIdentifier: string | null;
  subjectKeyword: string | null;
  allowMultipleFiles: boolean | null;
  fileNamePattern: string | null;
  businessRuleId: string | null;
  periodExceptionId: string | null;
  fileFormat: string | null;
  decimalSeparator: string | null;
  importType: string | null;
  deleteText: string | null;
  sheetNumber: number | null;
  startingRow: number | null;
  startingColumn: string | null;
  allowMultipleMnc: boolean | null;
  delimiter: string | null;
  columnMappings: Record<string, string> | null;
}

type WizardTab = "general" | "upload";

const COLUMN_MAPPING_VARIABLES = {
  destOrig: [
    { id: "zone", label: "Zone (Area)" },
    { id: "code", label: "Code (Area)" },
    { id: "originSet", label: "Origin Set" },
    { id: "originSetArea", label: "Origin Set (Area)" },
    { id: "originCode", label: "Origin Code" },
    { id: "location", label: "Location" },
  ],
  effective: [
    { id: "effectiveDateTime", label: "Effective Date/Time" },
    { id: "effectiveTime", label: "Effective Time" },
    { id: "endDateTime", label: "End Date/Time" },
    { id: "endTimeOnly", label: "End Time Only" },
    { id: "originCodeEffectiveDate", label: "Origin Code Effective Date" },
    { id: "originCodeEndDate", label: "Origin Code End Date" },
  ],
  rates: [
    { id: "connectionCharge", label: "Connection Charge" },
    { id: "rate", label: "Rate" },
    { id: "mccMnc", label: "MCC MNC" },
    { id: "mcc", label: "MCC" },
    { id: "mnc", label: "MNC" },
  ],
  other: [
    { id: "timeClass", label: "Time Class" },
    { id: "interval", label: "Interval" },
    { id: "deleteStatus", label: "Delete Status" },
    { id: "blockedStatus", label: "Blocked Status" },
    { id: "rateMatching", label: "Rate Matching" },
    { id: "missingInvalid", label: "Missing/Invalid" },
    { id: "omitRates", label: "Omit Rates" },
    { id: "remarks", label: "Remarks" },
    { id: "changeColumn", label: "Change Column" },
  ],
};

const ALL_MAPPING_VARIABLES = [
  ...COLUMN_MAPPING_VARIABLES.destOrig,
  ...COLUMN_MAPPING_VARIABLES.effective,
  ...COLUMN_MAPPING_VARIABLES.rates,
  ...COLUMN_MAPPING_VARIABLES.other,
];

const getVariableLabel = (variableId: string): string | null => {
  const variable = ALL_MAPPING_VARIABLES.find((v) => v.id === variableId);
  return variable?.label || null;
};

const getVariableCategory = (variableId: string): string | null => {
  if (COLUMN_MAPPING_VARIABLES.destOrig.some((v) => v.id === variableId)) return "destOrig";
  if (COLUMN_MAPPING_VARIABLES.effective.some((v) => v.id === variableId)) return "effective";
  if (COLUMN_MAPPING_VARIABLES.rates.some((v) => v.id === variableId)) return "rates";
  if (COLUMN_MAPPING_VARIABLES.other.some((v) => v.id === variableId)) return "other";
  return null;
};

export function ImportTemplateWizardPage() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = params.id && params.id !== "new";
  
  const [activeTab, setActiveTab] = useState<WizardTab>("general");
  
  const [formData, setFormData] = useState({
    name: "",
    carrierId: "",
    interconnectId: "",
    identificationType: "email",
    trustedIdentifier: "",
    subjectKeyword: "",
    allowMultipleFiles: false,
    fileNamePattern: "",
    businessRuleId: "",
    periodExceptionId: "",
    fileFormat: "CSV",
    decimalSeparator: ".",
    importType: "merge",
    deleteText: "",
    sheetNumber: 1,
    startingRow: 1,
    startingColumn: "A",
    allowMultipleMnc: false,
    delimiter: ",",
    columnMappings: {} as Record<string, string>,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [startingColumnExplicitlySet, setStartingColumnExplicitlySet] = useState(false);
  const [startingRowExplicitlySet, setStartingRowExplicitlySet] = useState(false);

  const parseFile = async (file: File) => {
    setIsParsingFile(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const buffer = await file.arrayBuffer();
      
      if (extension === "csv") {
        const delimiter = formData.delimiter || ",";
        const workbook = XLSX.read(buffer, { 
          type: "array",
          FS: delimiter,
          raw: true
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { 
          header: 1, 
          defval: "",
          raw: false
        });
        setParsedData((jsonData as string[][]).filter((row) => row.some((cell) => cell !== "")));
      } else if (extension === "xlsx" || extension === "xls") {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetIndex = Math.max(0, (formData.sheetNumber || 1) - 1);
        const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: "" });
        setParsedData(jsonData as string[][]);
      } else {
        toast({
          title: "Unsupported file format",
          description: "Please upload a CSV, XLSX, or XLS file",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "File parsed successfully",
        description: `Loaded ${file.name}`,
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Error parsing file",
        description: "Please check the file format and try again",
        variant: "destructive",
      });
      setParsedData([]);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    const isExcelExtension = extension === "xlsx" || extension === "xls";
    const isCsvExtension = extension === "csv";
    const currentFormat = formData.fileFormat.toLowerCase();
    const currentIsExcel = currentFormat === "excel" || currentFormat === "xlsx" || currentFormat === "xls";
    const currentIsCsv = currentFormat === "csv";
    
    let formatChanged = false;
    let newFileFormat = formData.fileFormat;
    const oldFileFormat = formData.fileFormat;
    
    if (isExcelExtension && !currentIsExcel) {
      formatChanged = true;
      newFileFormat = "Excel";
      updateField("fileFormat", newFileFormat);
    } else if (isCsvExtension && !currentIsCsv) {
      formatChanged = true;
      newFileFormat = "CSV";
      updateField("fileFormat", newFileFormat);
    }
    
    if (formatChanged) {
      toast({
        title: "File format mismatch detected",
        description: `Expected ${oldFileFormat} but uploaded ${extension?.toUpperCase()} file. Format changed to ${newFileFormat}.`,
        variant: "default",
      });
    }
    
    setUploadedFile(file);
    await parseFile(file);
  };
  
  const setStartingColumn = (col: string) => {
    updateField("startingColumn", col);
    setStartingColumnExplicitlySet(true);
  };
  
  const setStartingRow = (row: number) => {
    updateField("startingRow", row);
    setStartingRowExplicitlySet(true);
  };
  
  const clearStartingColumn = () => {
    updateField("startingColumn", "A");
    setStartingColumnExplicitlySet(false);
  };
  
  const clearStartingRow = () => {
    updateField("startingRow", 1);
    setStartingRowExplicitlySet(false);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getColumnLetter = (index: number): string => {
    let letter = "";
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  };

  const maxColumns = Math.max(11, ...parsedData.map((row) => row.length));
  const displayColumns = Array.from({ length: maxColumns }, (_, i) => getColumnLetter(i));
  const displayRows = parsedData.length > 0 ? parsedData.slice(0, 50) : Array(5).fill([]);

  const { data: carriersResponse, isLoading: isLoadingCarriers } = useQuery<{ data: Carrier[] }>({
    queryKey: ["/api/carriers"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const carriers = carriersResponse?.data || [];
  const supplierCarriers = carriers.filter(
    (c) => c.partnerType === "supplier" || c.partnerType === "bilateral"
  );

  const { data: interconnectsResponse, isLoading: isLoadingInterconnects } = useQuery<{ data: Interconnect[] }>({
    queryKey: ["/api/carrier-interconnects"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const interconnects = interconnectsResponse?.data || [];
  const filteredInterconnects = interconnects.filter(
    (ic) =>
      ic.carrierId === formData.carrierId &&
      (ic.direction === "supplier" || ic.direction === "both")
  );

  const { data: businessRules = [], isLoading: isLoadingBusinessRules } = useQuery<BusinessRule[]>({
    queryKey: ["/api/softswitch/rating/business-rules"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  interface PeriodExceptionPlan {
    id: string;
    name: string;
    description: string;
    exceptionCount: number;
    isDefault: boolean;
    isActive: boolean;
  }

  const { data: periodExceptionPlans = [], isLoading: isLoadingPeriodExceptionPlans } = useQuery<PeriodExceptionPlan[]>({
    queryKey: ["/api/softswitch/rating/period-exception-plans"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const { data: existingTemplate, isLoading: isLoadingTemplate } = useQuery<SupplierImportTemplate>({
    queryKey: ["/api/supplier-import-templates", params.id],
    enabled: !!isEditing,
    staleTime: STALE_TIME.STATIC,
  });

  useEffect(() => {
    if (existingTemplate && isEditing) {
      setFormData({
        name: existingTemplate.name || "",
        carrierId: existingTemplate.carrierId || "",
        interconnectId: existingTemplate.interconnectId || "",
        identificationType: existingTemplate.identificationType || "email",
        trustedIdentifier: existingTemplate.trustedIdentifier || "",
        subjectKeyword: existingTemplate.subjectKeyword || "",
        allowMultipleFiles: existingTemplate.allowMultipleFiles || false,
        fileNamePattern: existingTemplate.fileNamePattern || "",
        businessRuleId: existingTemplate.businessRuleId || "",
        periodExceptionId: existingTemplate.periodExceptionId || "",
        fileFormat: existingTemplate.fileFormat || "CSV",
        decimalSeparator: existingTemplate.decimalSeparator || ".",
        importType: existingTemplate.importType || "merge",
        deleteText: existingTemplate.deleteText || "",
        sheetNumber: existingTemplate.sheetNumber || 1,
        startingRow: existingTemplate.startingRow || 1,
        startingColumn: existingTemplate.startingColumn || "A",
        allowMultipleMnc: existingTemplate.allowMultipleMnc || false,
        delimiter: existingTemplate.delimiter || ",",
        columnMappings: existingTemplate.columnMappings || {},
      });
      
      if (existingTemplate.startingRow !== null && existingTemplate.startingRow !== undefined) {
        setStartingRowExplicitlySet(true);
      }
      if (existingTemplate.startingColumn !== null && existingTemplate.startingColumn !== undefined) {
        setStartingColumnExplicitlySet(true);
      }
    }
  }, [existingTemplate, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/supplier-import-templates/${params.id}`, data);
      } else {
        return apiRequest("POST", "/api/supplier-import-templates", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-import-templates"] });
      toast({ title: "Success", description: `Import template ${isEditing ? "updated" : "created"} successfully` });
      navigate("/admin/softswitch/rating/supplier-plans?tab=import-templates");
    },
    onError: () => {
      toast({ title: "Error", description: `Failed to ${isEditing ? "update" : "create"} import template`, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: "Validation Error", description: "Template name is required", variant: "destructive" });
      return;
    }
    saveMutation.mutate(formData);
  };

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "carrierId") {
      setFormData((prev) => ({ ...prev, interconnectId: "" }));
    }
  };

  const assignColumnMapping = (column: string, variableId: string) => {
    setFormData((prev) => {
      const newMappings = { ...prev.columnMappings };
      Object.keys(newMappings).forEach((key) => {
        if (newMappings[key] === variableId) {
          delete newMappings[key];
        }
      });
      newMappings[column] = variableId;
      return { ...prev, columnMappings: newMappings };
    });
  };

  const removeColumnMapping = (column: string) => {
    setFormData((prev) => {
      const newMappings = { ...prev.columnMappings };
      delete newMappings[column];
      return { ...prev, columnMappings: newMappings };
    });
  };

  const getColumnMapping = (column: string): string | null => {
    return formData.columnMappings[column] || null;
  };

  const isVariableMapped = (variableId: string): string | null => {
    for (const [col, varId] of Object.entries(formData.columnMappings)) {
      if (varId === variableId) return col;
    }
    return null;
  };

  const PARENT_ROUTE = "/admin/softswitch/rating/supplier-plans?tab=import-templates";

  if (isEditing && isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href={PARENT_ROUTE}>
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={PARENT_ROUTE} className="hover:text-foreground hover:underline">
            Supplier Rating
          </Link>
          <span>/</span>
          <Link href={PARENT_ROUTE} className="hover:text-foreground hover:underline">
            Import Templates
          </Link>
          <span>/</span>
          <span className="text-foreground">{isEditing ? "Edit Template" : "New Template"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">{isEditing ? "Edit Import Template" : "New Import Template"}</h1>
        <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-submit">
          {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </div>

      <Card>
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex-1 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "general"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            data-testid="tab-general"
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex-1 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "upload"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            data-testid="tab-upload-file"
          >
            Upload File
          </button>
        </div>

        <CardContent className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter template name"
                    data-testid="input-template-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Select Supplier</Label>
                  <Select
                    value={formData.carrierId}
                    onValueChange={(v) => updateField("carrierId", v)}
                  >
                    <SelectTrigger data-testid="select-supplier">
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCarriers ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : supplierCarriers.length === 0 ? (
                        <SelectItem value="none" disabled>No suppliers available</SelectItem>
                      ) : (
                        supplierCarriers.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Interconnect</Label>
                  <Select
                    value={formData.interconnectId}
                    onValueChange={(v) => updateField("interconnectId", v)}
                    disabled={!formData.carrierId}
                  >
                    <SelectTrigger data-testid="select-interconnect">
                      <SelectValue placeholder={formData.carrierId ? "Select Interconnect" : "Select carrier first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingInterconnects ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : filteredInterconnects.length === 0 ? (
                        <SelectItem value="none" disabled>No supplier interconnects</SelectItem>
                      ) : (
                        filteredInterconnects.map((ic) => (
                          <SelectItem key={ic.id} value={ic.id}>
                            {ic.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Identification Type</Label>
                  <Select
                    value={formData.identificationType}
                    onValueChange={(v) => updateField("identificationType", v)}
                  >
                    <SelectTrigger data-testid="select-identification-type">
                      <SelectValue placeholder="Select Identification Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>{formData.identificationType === "email" ? "Email" : "Domain"}</Label>
                  <Input
                    value={formData.trustedIdentifier}
                    onChange={(e) => updateField("trustedIdentifier", e.target.value)}
                    placeholder={formData.identificationType === "email" ? "admin@acme.com" : "www.acme.com"}
                    data-testid="input-trusted-identifier"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Search Keyword</Label>
                  <Input
                    value={formData.subjectKeyword}
                    onChange={(e) => updateField("subjectKeyword", e.target.value)}
                    placeholder="Search Keyword"
                    data-testid="input-search-keyword"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Business Rules</Label>
                  <Select
                    value={formData.businessRuleId || "none"}
                    onValueChange={(v) => updateField("businessRuleId", v === "none" ? "" : v)}
                  >
                    <SelectTrigger data-testid="select-business-rules">
                      <SelectValue placeholder="Select Business Rule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {isLoadingBusinessRules ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        businessRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Period Exception</Label>
                  <Select
                    value={formData.periodExceptionId || "none"}
                    onValueChange={(v) => updateField("periodExceptionId", v === "none" ? "" : v)}
                  >
                    <SelectTrigger data-testid="select-period-exception">
                      <SelectValue placeholder="Select Period Exception" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {isLoadingPeriodExceptionPlans ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        periodExceptionPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} ({plan.exceptionCount} rules)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Allow Multiple Files</Label>
                  <RadioGroup
                    value={formData.allowMultipleFiles ? "yes" : "no"}
                    onValueChange={(v) => updateField("allowMultipleFiles", v === "yes")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="multiple-yes" />
                      <Label htmlFor="multiple-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="multiple-no" />
                      <Label htmlFor="multiple-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.allowMultipleFiles && (
                  <div className="space-y-2">
                    <Label>File Name Keyword</Label>
                    <Input
                      value={formData.fileNamePattern}
                      onChange={(e) => updateField("fileNamePattern", e.target.value)}
                      placeholder="%Acme STD Rate%"
                      data-testid="input-file-name-keyword"
                    />
                    <p className="text-xs text-muted-foreground">Use % as wildcard (e.g., %Acme STD Rate%)</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("upload")} data-testid="button-next">
                  Next
                </Button>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Select File Type</Label>
                  <Select
                    value={formData.fileFormat}
                    onValueChange={(v) => updateField("fileFormat", v)}
                  >
                    <SelectTrigger data-testid="select-file-type">
                      <SelectValue placeholder="Select File Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="Excel">Excel (XLSX/XLS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.fileFormat === "CSV" && (
                  <div className="space-y-2">
                    <Label>Delimiter</Label>
                    <Input
                      value={formData.delimiter}
                      onChange={(e) => updateField("delimiter", e.target.value)}
                      placeholder=","
                      data-testid="input-delimiter"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Decimal Separator</Label>
                  <Select
                    value={formData.decimalSeparator}
                    onValueChange={(v) => updateField("decimalSeparator", v)}
                  >
                    <SelectTrigger data-testid="select-decimal-separator">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=".">. (dot)</SelectItem>
                      <SelectItem value=",">, (comma)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Import Type</Label>
                  <Select
                    value={formData.importType}
                    onValueChange={(v) => updateField("importType", v)}
                  >
                    <SelectTrigger data-testid="select-import-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merge">Merge</SelectItem>
                      <SelectItem value="replace">Replace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Delete Text</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Text/rows to remove from the top of the file before processing. This is used to skip carrier header information (account numbers, dates, etc.) that appears above the actual rate data. Only rate rows should be synced to ConnexCS.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    value={formData.deleteText}
                    onChange={(e) => updateField("deleteText", e.target.value)}
                    placeholder="e.g. Account Number, Carrier Name..."
                    data-testid="input-delete-text"
                  />
                </div>

                {(formData.fileFormat === "XLSX" || formData.fileFormat === "XLS" || formData.fileFormat === "Excel") && (
                  <div className="space-y-2">
                    <Label>Sheet Number</Label>
                    <Input
                      type="number"
                      value={formData.sheetNumber}
                      onChange={(e) => updateField("sheetNumber", parseInt(e.target.value) || 1)}
                      min={1}
                      data-testid="input-sheet-number"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Starting Row</Label>
                    {startingRowExplicitlySet && (
                      <span 
                        className="text-primary cursor-pointer text-xs hover:underline"
                        onClick={clearStartingRow}
                      >
                        clear
                      </span>
                    )}
                  </div>
                  <Input
                    type="number"
                    value={formData.startingRow}
                    onChange={(e) => {
                      updateField("startingRow", parseInt(e.target.value) || 1);
                      setStartingRowExplicitlySet(true);
                    }}
                    min={1}
                    data-testid="input-starting-row"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Starting Column</Label>
                    {startingColumnExplicitlySet && (
                      <span 
                        className="text-primary cursor-pointer text-xs hover:underline"
                        onClick={clearStartingColumn}
                      >
                        clear
                      </span>
                    )}
                  </div>
                  <Input
                    value={formData.startingColumn}
                    onChange={(e) => {
                      updateField("startingColumn", e.target.value.toUpperCase());
                      setStartingColumnExplicitlySet(true);
                    }}
                    placeholder="A"
                    data-testid="input-starting-column"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Allow Multiple MNC</Label>
                  <RadioGroup
                    value={formData.allowMultipleMnc ? "yes" : "no"}
                    onValueChange={(v) => updateField("allowMultipleMnc", v === "yes")}
                    className="flex gap-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="mnc-yes" />
                      <Label htmlFor="mnc-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="mnc-no" />
                      <Label htmlFor="mnc-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Column Mapping Variables</h3>
                  {Object.keys(formData.columnMappings).length > 0 && (
                    <Badge variant="secondary">
                      {Object.keys(formData.columnMappings).length} mapped
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Right-click on column headers in the preview below to assign these variables to columns.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Dest/Orig</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.destOrig.map((v) => {
                        const mappedColumn = isVariableMapped(v.id);
                        return (
                          <div 
                            key={v.id} 
                            className={cn(
                              "text-sm flex items-center justify-between",
                              mappedColumn ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            <span>{v.label}</span>
                            {mappedColumn && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {mappedColumn}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Effective</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.effective.map((v) => {
                        const mappedColumn = isVariableMapped(v.id);
                        return (
                          <div 
                            key={v.id} 
                            className={cn(
                              "text-sm flex items-center justify-between",
                              mappedColumn ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            <span>{v.label}</span>
                            {mappedColumn && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {mappedColumn}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Rates</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.rates.map((v) => {
                        const mappedColumn = isVariableMapped(v.id);
                        return (
                          <div 
                            key={v.id} 
                            className={cn(
                              "text-sm flex items-center justify-between",
                              mappedColumn ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            <span>{v.label}</span>
                            {mappedColumn && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {mappedColumn}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Other</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.other.map((v) => {
                        const mappedColumn = isVariableMapped(v.id);
                        return (
                          <div 
                            key={v.id} 
                            className={cn(
                              "text-sm flex items-center justify-between",
                              mappedColumn ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            <span>{v.label}</span>
                            {mappedColumn && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {mappedColumn}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2">
                  <Label>Upload Rate File</Label>
                  {uploadedFile ? (
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                            {parsedData.length > 0 && ` - ${parsedData.length} rows`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearUploadedFile}
                        data-testid="button-clear-file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileUpload}
                        data-testid="input-file-upload"
                      />
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-block px-4 py-2 bg-card border rounded hover:bg-muted transition-colors"
                      >
                        {isParsingFile ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                            Parsing...
                          </>
                        ) : (
                          "Select file..."
                        )}
                      </label>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload a {formData.fileFormat} file to preview and map columns
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-2 py-1 text-xs font-medium border-b flex items-center justify-between">
                  <span>Preview {parsedData.length > 0 && `(${parsedData.length} rows)`}</span>
                  <div className="flex items-center gap-2">
                    {parsedData.length > 50 && (
                      <span className="text-muted-foreground">Showing first 50 rows</span>
                    )}
                    <span className="text-muted-foreground">Right-click column headers to assign mappings</span>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-muted/50">
                        <th className="w-10 px-2 py-2 text-left font-medium border-r bg-muted/50"></th>
                        {displayColumns.map((col) => {
                          const mapping = getColumnMapping(col);
                          const mappingLabel = mapping ? getVariableLabel(mapping) : null;
                          return (
                            <th
                              key={col}
                              className={cn(
                                "min-w-[100px] px-3 py-1 text-left font-medium border-r bg-muted/50 cursor-context-menu",
                                startingColumnExplicitlySet && formData.startingColumn === col && "bg-primary/20",
                                mapping && "bg-accent/30"
                              )}
                            >
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
                                  <div className="flex flex-col gap-0.5 w-full h-full">
                                    <span>{col}</span>
                                    {mappingLabel && (
                                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 font-normal">
                                        {mappingLabel}
                                      </Badge>
                                    )}
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-56">
                                  <ContextMenuItem onClick={() => setStartingColumn(col)}>
                                    Set as Starting Column
                                    {startingColumnExplicitlySet && formData.startingColumn === col && <Check className="ml-auto h-4 w-4" />}
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger>Dest/Orig</ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48">
                                      {COLUMN_MAPPING_VARIABLES.destOrig.map((v) => (
                                        <ContextMenuItem
                                          key={v.id}
                                          onClick={() => assignColumnMapping(col, v.id)}
                                        >
                                          {v.label}
                                          {mapping === v.id && <Check className="ml-auto h-4 w-4" />}
                                        </ContextMenuItem>
                                      ))}
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger>Effective</ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48">
                                      {COLUMN_MAPPING_VARIABLES.effective.map((v) => (
                                        <ContextMenuItem
                                          key={v.id}
                                          onClick={() => assignColumnMapping(col, v.id)}
                                        >
                                          {v.label}
                                          {mapping === v.id && <Check className="ml-auto h-4 w-4" />}
                                        </ContextMenuItem>
                                      ))}
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger>Rates</ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48">
                                      {COLUMN_MAPPING_VARIABLES.rates.map((v) => (
                                        <ContextMenuItem
                                          key={v.id}
                                          onClick={() => assignColumnMapping(col, v.id)}
                                        >
                                          {v.label}
                                          {mapping === v.id && <Check className="ml-auto h-4 w-4" />}
                                        </ContextMenuItem>
                                      ))}
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                  <ContextMenuSub>
                                    <ContextMenuSubTrigger>Other</ContextMenuSubTrigger>
                                    <ContextMenuSubContent className="w-48">
                                      {COLUMN_MAPPING_VARIABLES.other.map((v) => (
                                        <ContextMenuItem
                                          key={v.id}
                                          onClick={() => assignColumnMapping(col, v.id)}
                                        >
                                          {v.label}
                                          {mapping === v.id && <Check className="ml-auto h-4 w-4" />}
                                        </ContextMenuItem>
                                      ))}
                                    </ContextMenuSubContent>
                                  </ContextMenuSub>
                                  {mapping && (
                                    <>
                                      <ContextMenuSeparator />
                                      <ContextMenuItem
                                        onClick={() => removeColumnMapping(col)}
                                        className="text-destructive"
                                      >
                                        Remove Mapping
                                      </ContextMenuItem>
                                    </>
                                  )}
                                </ContextMenuContent>
                              </ContextMenu>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.length === 0 || displayRows.every((row) => !row.length) ? (
                        Array.from({ length: 5 }, (_, i) => i + 1).map((rowNum) => (
                          <tr key={rowNum} className="border-t">
                            <td className="px-2 py-2 text-muted-foreground border-r bg-muted/30 font-medium cursor-context-menu hover:bg-primary/10">
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
                                  <div className="w-full h-full">
                                    {rowNum}
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-48">
                                  <ContextMenuItem onClick={() => setStartingRow(rowNum)}>
                                    Set as Starting Row
                                    {startingRowExplicitlySet && formData.startingRow === rowNum && <Check className="ml-auto h-4 w-4" />}
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            </td>
                            {displayColumns.map((col) => (
                              <td key={col} className="px-3 py-2 border-r h-8 cursor-context-menu">
                                <ContextMenu>
                                  <ContextMenuTrigger asChild>
                                    <div className="w-full h-full min-h-[1rem]"></div>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent className="w-48">
                                    <ContextMenuItem onClick={() => setStartingRow(rowNum)}>
                                      Set as Starting Row
                                      {startingRowExplicitlySet && formData.startingRow === rowNum && <Check className="ml-auto h-4 w-4" />}
                                    </ContextMenuItem>
                                    <ContextMenuItem onClick={() => setStartingColumn(col)}>
                                      Set as Starting Column
                                      {startingColumnExplicitlySet && formData.startingColumn === col && <Check className="ml-auto h-4 w-4" />}
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        displayRows.map((rowData, rowIndex) => {
                          const rowNum = rowIndex + 1;
                          const isStartingRow = startingRowExplicitlySet && formData.startingRow === rowNum;
                          return (
                            <tr 
                              key={rowNum} 
                              className={cn(
                                "border-t",
                                isStartingRow && "bg-primary/10"
                              )}
                            >
                              <td 
                                className={cn(
                                  "px-2 py-2 text-muted-foreground border-r bg-muted/30 font-medium cursor-context-menu hover:bg-primary/10",
                                  isStartingRow && "bg-primary/20 text-primary"
                                )}
                              >
                                <ContextMenu>
                                  <ContextMenuTrigger asChild>
                                    <div className="w-full h-full">
                                      {rowNum}
                                    </div>
                                  </ContextMenuTrigger>
                                  <ContextMenuContent className="w-48">
                                    <ContextMenuItem onClick={() => setStartingRow(rowNum)}>
                                      Set as Starting Row
                                      {isStartingRow && <Check className="ml-auto h-4 w-4" />}
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenu>
                              </td>
                              {displayColumns.map((col, colIndex) => {
                                const isStartingCol = startingColumnExplicitlySet && formData.startingColumn === col;
                                return (
                                  <td 
                                    key={col}
                                    className={cn(
                                      "px-3 py-2 border-r max-w-[200px] truncate cursor-context-menu",
                                      isStartingCol && "bg-primary/10",
                                      isStartingRow && isStartingCol && "bg-primary/20"
                                    )}
                                    title={rowData[colIndex] || ""}
                                  >
                                    <ContextMenu>
                                      <ContextMenuTrigger asChild>
                                        <div className="w-full h-full">
                                          {rowData[colIndex] || ""}
                                        </div>
                                      </ContextMenuTrigger>
                                      <ContextMenuContent className="w-48">
                                        <ContextMenuItem onClick={() => setStartingRow(rowNum)}>
                                          Set as Starting Row
                                          {isStartingRow && <Check className="ml-auto h-4 w-4" />}
                                        </ContextMenuItem>
                                        <ContextMenuItem onClick={() => setStartingColumn(col)}>
                                          Set as Starting Column
                                          {isStartingCol && <Check className="ml-auto h-4 w-4" />}
                                        </ContextMenuItem>
                                      </ContextMenuContent>
                                    </ContextMenu>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("general")} data-testid="button-back-general">
                  Back
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
