import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, FileSpreadsheet, Calendar as CalendarIcon, 
  Clock, Filter, RefreshCw, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { format, subDays } from "date-fns";

interface ExportJob {
  id: string;
  fileName: string;
  dateRange: string;
  format: string;
  status: "pending" | "processing" | "completed" | "failed";
  recordCount: number;
  createdAt: string;
  downloadUrl?: string;
}

export default function CdrExportPage() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [exportFormat, setExportFormat] = useState("csv");
  const [includeFields, setIncludeFields] = useState({
    callId: true,
    fromNumber: true,
    toNumber: true,
    duration: true,
    cost: true,
    status: true,
    timestamp: true,
    route: false,
    codec: false,
  });

  const { data: exports, isLoading } = useQuery<ExportJob[]>({
    queryKey: ["/api/my/cdr-exports"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/my/cdr-exports", {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        format: exportFormat,
        fields: Object.entries(includeFields).filter(([_, v]) => v).map(([k]) => k),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/cdr-exports"] });
      toast({ 
        title: "Export Started", 
        description: "Your CDR export is being processed. You'll be notified when it's ready." 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start export", variant: "destructive" });
    },
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  const toggleField = (field: keyof typeof includeFields) => {
    setIncludeFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export CDRs</h1>
        <p className="text-muted-foreground">Download call detail records for billing and analysis</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Settings</CardTitle>
              <CardDescription>Configure your CDR export parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-start-date">
                        <CalendarIcon className="h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => d && setStartDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-end-date">
                        <CalendarIcon className="h-4 w-4" />
                        {format(endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(d) => d && setEndDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Include Fields</Label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(includeFields).map(([field, checked]) => (
                    <div key={field} className="flex items-center gap-2">
                      <Checkbox
                        id={field}
                        checked={checked}
                        onCheckedChange={() => toggleField(field as keyof typeof includeFields)}
                        data-testid={`checkbox-${field}`}
                      />
                      <label htmlFor={field} className="text-sm capitalize cursor-pointer">
                        {field.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleExport} className="w-full" disabled={exportMutation.isPending} data-testid="button-export">
                  <Download className="h-4 w-4 mr-2" />
                  {exportMutation.isPending ? "Generating..." : "Generate Export"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Records in Range</span>
                <span className="font-medium">~12,450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Size</span>
                <span className="font-medium">2.4 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Export</span>
                <span className="font-medium">3 days ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">Recent Exports</CardTitle>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : exports && exports.length > 0 ? (
            <div className="space-y-3">
              {exports.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exp.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.dateRange} | {exp.recordCount.toLocaleString()} records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={exp.status === "completed" ? "default" : exp.status === "processing" ? "secondary" : "outline"}>
                      {exp.status}
                    </Badge>
                    {exp.status === "completed" && (
                      <Button variant="ghost" size="sm" data-testid={`button-download-${exp.id}`}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No Exports Yet</h3>
              <p className="text-sm text-muted-foreground">
                Generate your first CDR export using the form above
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
