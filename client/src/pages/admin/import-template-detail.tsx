import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Plus, Trash2, Loader2, Save, X, ChevronRight } from "lucide-react";
import { 
  TEMPLATE_FIELD_CATEGORIES, 
  SHEET_TYPES, 
  TIME_CLASSES, 
  DECIMAL_SEPARATORS, 
  CODE_SHEET_TARGETS,
  COLUMN_LETTERS,
  COMMON_TIMEZONES
} from "@shared/rating-import-fields";

const PARENT_ROUTE = "/admin/softswitch/rating/supplier-plans";

const templateFormSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  defaultTimeClass: z.string().default("AnyDay"),
  timeZone: z.string().default("UTC"),
  periodExceptions: z.string().optional(),
  allowZeroCharges: z.boolean().default(false),
  decimalSeparator: z.string().default("."),
  normaliseZones: z.boolean().default(false),
  applyCodeSheetTo: z.string().default("Rates 1 Sheet"),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface Sheet {
  id?: string;
  sheetType: string;
  isEnabled: boolean;
  worksheetName: string;
  headerRows: number;
  footerRows: number;
}

interface FieldMapping {
  id?: string;
  sheetType: string;
  columnLetter: string;
  fieldType: string;
  displayOrder: number;
}

interface TemplateData extends TemplateFormValues {
  id: string;
  sheets: Sheet[];
  fields: FieldMapping[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ImportTemplateDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/softswitch/rating/import-template/:id");
  const { toast } = useToast();
  const isNew = params?.id === "new";
  const templateId = isNew ? null : params?.id;

  const [activeSheetTab, setActiveSheetTab] = useState("rates1");
  const [sheets, setSheets] = useState<Sheet[]>([
    { sheetType: "rates1", isEnabled: true, worksheetName: "", headerRows: 1, footerRows: 0 },
    { sheetType: "rates2", isEnabled: false, worksheetName: "", headerRows: 1, footerRows: 0 },
    { sheetType: "codes", isEnabled: false, worksheetName: "", headerRows: 1, footerRows: 0 },
    { sheetType: "origin_codes", isEnabled: false, worksheetName: "", headerRows: 1, footerRows: 0 },
  ]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultTimeClass: "AnyDay",
      timeZone: "UTC",
      periodExceptions: "",
      allowZeroCharges: false,
      decimalSeparator: ".",
      normaliseZones: false,
      applyCodeSheetTo: "Rates 1 Sheet",
    },
  });

  const { data: template, isLoading } = useQuery<TemplateData>({
    queryKey: ["/api/supplier-import-templates", templateId],
    enabled: !!templateId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        description: template.description || "",
        defaultTimeClass: template.defaultTimeClass || "AnyDay",
        timeZone: template.timeZone || "UTC",
        periodExceptions: template.periodExceptions || "",
        allowZeroCharges: template.allowZeroCharges || false,
        decimalSeparator: template.decimalSeparator || ".",
        normaliseZones: template.normaliseZones || false,
        applyCodeSheetTo: template.applyCodeSheetTo || "Rates 1 Sheet",
      });
      if (template.sheets?.length > 0) {
        setSheets(template.sheets);
      }
      if (template.fields?.length > 0) {
        setFieldMappings(template.fields);
      }
    }
  }, [template, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      const payload = {
        ...data,
        sheets: sheets.filter(s => s.isEnabled),
        fields: fieldMappings,
      };
      if (templateId) {
        return apiRequest("PATCH", `/api/supplier-import-templates/${templateId}`, payload);
      } else {
        return apiRequest("POST", "/api/supplier-import-templates", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier-import-templates"] });
      toast({ title: isNew ? "Template created" : "Template saved" });
      setLocation(PARENT_ROUTE);
    },
    onError: (error) => {
      toast({ title: "Failed to save template", description: String(error), variant: "destructive" });
    },
  });

  const handleAddFieldMapping = () => {
    setFieldMappings((prev) => [
      ...prev,
      {
        sheetType: activeSheetTab,
        columnLetter: "A",
        fieldType: "zone",
        displayOrder: prev.filter(f => f.sheetType === activeSheetTab).length,
      },
    ]);
  };

  const handleRemoveFieldMapping = (index: number) => {
    const sheetFields = fieldMappings.filter(f => f.sheetType === activeSheetTab);
    const fieldToRemove = sheetFields[index];
    if (fieldToRemove) {
      setFieldMappings(prev => prev.filter(f => f !== fieldToRemove));
    }
  };

  const handleUpdateFieldMapping = (index: number, field: string, value: string) => {
    const sheetFields = fieldMappings.filter(f => f.sheetType === activeSheetTab);
    const fieldToUpdate = sheetFields[index];
    if (fieldToUpdate) {
      setFieldMappings(prev => 
        prev.map(f => f === fieldToUpdate ? { ...f, [field]: value } : f)
      );
    }
  };

  const handleSheetChange = (sheetType: string, field: keyof Sheet, value: string | number | boolean) => {
    setSheets(prev => prev.map(s => s.sheetType === sheetType ? { ...s, [field]: value } : s));
  };

  const onSubmit = (data: TemplateFormValues) => {
    saveMutation.mutate(data);
  };

  const currentSheetFields = fieldMappings.filter(f => f.sheetType === activeSheetTab);
  const currentSheet = sheets.find(s => s.sheetType === activeSheetTab);

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href={PARENT_ROUTE} className="hover:text-foreground hover:underline">
          Supplier Rating
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={PARENT_ROUTE} className="hover:text-foreground hover:underline">
          Import Templates
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{isNew ? "New Template" : template?.name || "Template"}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation(PARENT_ROUTE)} data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? "New Rate Import Template" : "Edit Rate Import Template"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setLocation(PARENT_ROUTE)} data-testid="button-cancel">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={saveMutation.isPending} data-testid="button-save">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-template-name" placeholder="Enter template name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-description" placeholder="Optional description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="defaultTimeClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Time Class</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-time-class">
                            <SelectValue placeholder="Select time class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_CLASSES.map((tc) => (
                            <SelectItem key={tc.value} value={tc.value}>{tc.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timezone">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="periodExceptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Exceptions</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-period-exceptions" placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decimalSeparator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimal Separator</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-decimal-separator">
                            <SelectValue placeholder="Select separator" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DECIMAL_SEPARATORS.map((ds) => (
                            <SelectItem key={ds.value} value={ds.value}>{ds.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applyCodeSheetTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apply Code Sheet To</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-code-sheet-target">
                            <SelectValue placeholder="Select target" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CODE_SHEET_TARGETS.map((cs) => (
                            <SelectItem key={cs.value} value={cs.value}>{cs.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="allowZeroCharges"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-allow-zero-charges"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Allow Zero Charges</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="normaliseZones"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-normalise-zones"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Normalise Zones</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workbook Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {SHEET_TYPES.map((st) => {
                  const sheet = sheets.find(s => s.sheetType === st.value);
                  return (
                    <div key={st.value} className="flex items-center gap-2">
                      <Switch
                        checked={sheet?.isEnabled || false}
                        onCheckedChange={(checked) => handleSheetChange(st.value, "isEnabled", checked)}
                        data-testid={`switch-sheet-${st.value}`}
                      />
                      <Label>{st.label}</Label>
                    </div>
                  );
                })}
              </div>

              <Tabs value={activeSheetTab} onValueChange={setActiveSheetTab}>
                <TabsList>
                  {SHEET_TYPES.map((st) => {
                    const sheet = sheets.find(s => s.sheetType === st.value);
                    return (
                      <TabsTrigger 
                        key={st.value} 
                        value={st.value}
                        disabled={!sheet?.isEnabled}
                        data-testid={`tab-sheet-${st.value}`}
                      >
                        {st.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {SHEET_TYPES.map((st) => {
                  const sheet = sheets.find(s => s.sheetType === st.value);
                  if (!sheet?.isEnabled) return (
                    <TabsContent key={st.value} value={st.value}>
                      <div className="text-center py-8 text-muted-foreground">
                        Enable {st.label} sheet to configure it.
                      </div>
                    </TabsContent>
                  );

                  return (
                    <TabsContent key={st.value} value={st.value} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Worksheet Name</Label>
                          <Input
                            value={sheet.worksheetName}
                            onChange={(e) => handleSheetChange(st.value, "worksheetName", e.target.value)}
                            placeholder="Sheet1"
                            data-testid={`input-worksheet-name-${st.value}`}
                          />
                        </div>
                        <div>
                          <Label>Header Rows</Label>
                          <Input
                            type="number"
                            min={0}
                            value={sheet.headerRows}
                            onChange={(e) => handleSheetChange(st.value, "headerRows", parseInt(e.target.value) || 0)}
                            data-testid={`input-header-rows-${st.value}`}
                          />
                        </div>
                        <div>
                          <Label>Footer Rows</Label>
                          <Input
                            type="number"
                            min={0}
                            value={sheet.footerRows}
                            onChange={(e) => handleSheetChange(st.value, "footerRows", parseInt(e.target.value) || 0)}
                            data-testid={`input-footer-rows-${st.value}`}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Field Locations - {SHEET_TYPES.find(s => s.value === activeSheetTab)?.label}</CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddFieldMapping}
                disabled={!currentSheet?.isEnabled}
                data-testid="button-add-field-mapping"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </CardHeader>
            <CardContent>
              {!currentSheet?.isEnabled ? (
                <div className="text-center py-8 text-muted-foreground">
                  Enable the {SHEET_TYPES.find(s => s.value === activeSheetTab)?.label} sheet to configure field mappings.
                </div>
              ) : currentSheetFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No field mappings configured. Click "Add Field" to add column-to-field mappings.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Column</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSheetFields.map((mapping, index) => (
                      <TableRow key={index} data-testid={`row-field-mapping-${index}`}>
                        <TableCell>
                          <Select
                            value={mapping.columnLetter}
                            onValueChange={(value) => handleUpdateFieldMapping(index, "columnLetter", value)}
                          >
                            <SelectTrigger data-testid={`select-column-${index}`}>
                              <SelectValue placeholder="Column" />
                            </SelectTrigger>
                            <SelectContent>
                              {COLUMN_LETTERS.map((col) => (
                                <SelectItem key={col} value={col}>{col}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mapping.fieldType}
                            onValueChange={(value) => handleUpdateFieldMapping(index, "fieldType", value)}
                          >
                            <SelectTrigger data-testid={`select-field-${index}`}>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TEMPLATE_FIELD_CATEGORIES).map(([category, fields]) => (
                                <SelectGroup key={category}>
                                  <SelectLabel>{category}</SelectLabel>
                                  {fields.map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFieldMapping(index)}
                            data-testid={`button-remove-field-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
