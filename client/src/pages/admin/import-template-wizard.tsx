import { useState, useEffect } from "react";
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
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Carrier {
  id: string;
  name: string;
  carrierType: string;
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
    { id: "deleteStatus", label: "Delete Status" },
    { id: "blockedStatus", label: "Blocked Status" },
    { id: "rateMatching", label: "Rate Matching" },
    { id: "missingInvalid", label: "Missing/Invalid" },
    { id: "omitRates", label: "Omit Rates" },
    { id: "remarks", label: "Remarks" },
    { id: "changeColumn", label: "Change Column" },
  ],
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

  const { data: carriers = [], isLoading: isLoadingCarriers } = useQuery<Carrier[]>({
    queryKey: ["/api/carriers"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const supplierCarriers = carriers.filter(
    (c) => c.carrierType === "supplier" || c.carrierType === "bilateral"
  );

  const { data: interconnects = [], isLoading: isLoadingInterconnects } = useQuery<Interconnect[]>({
    queryKey: ["/api/carrier-interconnects"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const filteredInterconnects = interconnects.filter(
    (ic) =>
      ic.carrierId === formData.carrierId &&
      (ic.direction === "egress" || ic.direction === "bilateral")
  );

  const { data: businessRules = [], isLoading: isLoadingBusinessRules } = useQuery<BusinessRule[]>({
    queryKey: ["/api/softswitch/rating/business-rules"],
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
      navigate("/admin/softswitch/rating?tab=import-templates");
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

  const PARENT_ROUTE = "/admin/softswitch/rating?tab=import-templates";

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
                  <Label>Select Vendor Connection</Label>
                  <Select
                    value={formData.carrierId}
                    onValueChange={(v) => updateField("carrierId", v)}
                  >
                    <SelectTrigger data-testid="select-vendor-connection">
                      <SelectValue placeholder="Select Vendor Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCarriers ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : supplierCarriers.length === 0 ? (
                        <SelectItem value="none" disabled>No supplier carriers</SelectItem>
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
                    value={formData.businessRuleId}
                    onValueChange={(v) => updateField("businessRuleId", v)}
                  >
                    <SelectTrigger data-testid="select-business-rules">
                      <SelectValue placeholder="Select Business Rule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
                    value={formData.periodExceptionId}
                    onValueChange={(v) => updateField("periodExceptionId", v)}
                  >
                    <SelectTrigger data-testid="select-period-exception">
                      <SelectValue placeholder="Select Period Exception" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
                      <SelectItem value="XLSX">XLSX</SelectItem>
                      <SelectItem value="XLS">XLS</SelectItem>
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
                  <Label>Delete Text</Label>
                  <Input
                    value={formData.deleteText}
                    onChange={(e) => updateField("deleteText", e.target.value)}
                    placeholder="Delete Text"
                    data-testid="input-delete-text"
                  />
                </div>

                {(formData.fileFormat === "XLSX" || formData.fileFormat === "XLS") && (
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
                  <Label>Starting Row <span className="text-primary cursor-pointer text-xs">clear</span></Label>
                  <Input
                    type="number"
                    value={formData.startingRow}
                    onChange={(e) => updateField("startingRow", parseInt(e.target.value) || 1)}
                    min={1}
                    data-testid="input-starting-row"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Starting Column <span className="text-primary cursor-pointer text-xs">clear</span></Label>
                  <Input
                    value={formData.startingColumn}
                    onChange={(e) => updateField("startingColumn", e.target.value.toUpperCase())}
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
                <h3 className="text-lg font-medium mb-4">Column Mapping Variables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Dest/Orig</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.destOrig.map((v) => (
                        <div key={v.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Effective</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.effective.map((v) => (
                        <div key={v.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Rates</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.rates.map((v) => (
                        <div key={v.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">Other</h4>
                    <div className="space-y-1">
                      {COLUMN_MAPPING_VARIABLES.other.map((v) => (
                        <div key={v.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2">
                  <Label>Select files...</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      id="file-upload"
                      data-testid="input-file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-block px-4 py-2 bg-card border rounded hover:bg-muted transition-colors"
                    >
                      Select files...
                    </label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload a rate file to preview and map columns
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-2 py-1 text-xs font-medium border-b">
                  Preview
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="w-8 px-2 py-2 text-left font-medium border-r"></th>
                        {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].map((col) => (
                          <th
                            key={col}
                            className="min-w-[100px] px-3 py-2 text-left font-medium border-r"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row} className="border-t">
                          <td className="px-2 py-2 text-muted-foreground border-r bg-muted/30 font-medium">
                            {row}
                          </td>
                          {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].map((col) => (
                            <td key={col} className="px-3 py-2 border-r">
                            </td>
                          ))}
                        </tr>
                      ))}
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
