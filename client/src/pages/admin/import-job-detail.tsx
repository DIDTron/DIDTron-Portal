import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DataTableFooter } from "@/components/ui/data-table-footer";
import { ChevronDown, ChevronRight, ArrowLeft, Search } from "lucide-react";

type ImportJobDetailTab = "rate-analysis" | "notifications";

interface RateChange {
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
  plan: string;
  status: "Committed" | "Pending" | "Failed";
}

interface Notification {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "error";
  message: string;
}

const mockRateIncreases: RateChange[] = [];
const mockRateDecreases: RateChange[] = [];
const mockNotifications: Notification[] = [];

export default function ImportJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<ImportJobDetailTab>("rate-analysis");
  const [rateIncreasesOpen, setRateIncreasesOpen] = useState(true);
  const [rateDecreasesOpen, setRateDecreasesOpen] = useState(true);

  const [increasesSearchFilter, setIncreasesSearchFilter] = useState("");
  const [decreasesSearchFilter, setDecreasesSearchFilter] = useState("");
  const [notificationsSearchFilter, setNotificationsSearchFilter] = useState("");

  const [increasesCurrentPage, setIncreasesCurrentPage] = useState(1);
  const [increasesPageSize, setIncreasesPageSize] = useState(20);
  const [decreasesCurrentPage, setDecreasesCurrentPage] = useState(1);
  const [decreasesPageSize, setDecreasesPageSize] = useState(20);
  const [notificationsCurrentPage, setNotificationsCurrentPage] = useState(1);
  const [notificationsPageSize, setNotificationsPageSize] = useState(20);

  const handleGoBack = () => {
    navigate("/admin/softswitch/rating");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          data-testid="button-go-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-semibold" data-testid="text-import-job-title">Import Job: {jobId || "Unknown"}</h1>
        <Badge variant="outline" className="ml-2" data-testid="badge-job-status">
          Completed
        </Badge>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ImportJobDetailTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="rate-analysis" data-testid="tab-rate-analysis">
              Rate Analysis
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rate-analysis">
            <div className="space-y-4">
              <Collapsible open={rateIncreasesOpen} onOpenChange={setRateIncreasesOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 p-3 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md cursor-pointer hover-elevate" data-testid="trigger-rate-increases">
                    {rateIncreasesOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-orange-700 dark:text-orange-400">
                      Rate Increases ({mockRateIncreases.length})
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Click to filter"
                        value={increasesSearchFilter}
                        onChange={(e) => setIncreasesSearchFilter(e.target.value)}
                        className="max-w-md"
                        data-testid="input-increases-search"
                      />
                      <Button variant="ghost" size="icon" data-testid="button-increases-search">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
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
                          <TableHead className="text-white text-xs">Plan</TableHead>
                          <TableHead className="text-white text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockRateIncreases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                              No rate increases found
                            </TableCell>
                          </TableRow>
                        ) : (
                          mockRateIncreases
                            .slice((increasesCurrentPage - 1) * increasesPageSize, increasesCurrentPage * increasesPageSize)
                            .map((item) => (
                              <TableRow key={item.id} data-testid={`row-increase-${item.id}`}>
                                <TableCell className="text-sm">{item.zone}</TableCell>
                                <TableCell className="text-sm">{item.code}</TableCell>
                                <TableCell className="text-sm">{item.originSet}</TableCell>
                                <TableCell className="text-sm">{item.timeclass}</TableCell>
                                <TableCell className="text-sm">{item.effectiveDate} ({item.effectiveDays})</TableCell>
                                <TableCell className="text-sm">{item.currency}</TableCell>
                                <TableCell className="text-sm">{item.newRate.toFixed(4)}</TableCell>
                                <TableCell className="text-sm">{item.oldRate.toFixed(4)}</TableCell>
                                <TableCell className="text-sm text-orange-600 dark:text-orange-400">
                                  +{item.change.toFixed(4)} (+{item.changePercent.toFixed(2)}%)
                                </TableCell>
                                <TableCell className="text-sm">{item.plan}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={item.status === "Committed" ? "default" : "secondary"}
                                    className={item.status === "Committed" ? "bg-sky-500 hover:bg-sky-600" : ""}
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
                      totalItems={mockRateIncreases.length}
                      totalPages={Math.ceil(mockRateIncreases.length / increasesPageSize) || 1}
                      pageSize={increasesPageSize}
                      currentPage={increasesCurrentPage}
                      onPageChange={setIncreasesCurrentPage}
                      onPageSizeChange={setIncreasesPageSize}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={rateDecreasesOpen} onOpenChange={setRateDecreasesOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md cursor-pointer hover-elevate" data-testid="trigger-rate-decreases">
                    {rateDecreasesOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-blue-700 dark:text-blue-400">
                      Rate Decreases ({mockRateDecreases.length})
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Click to filter"
                        value={decreasesSearchFilter}
                        onChange={(e) => setDecreasesSearchFilter(e.target.value)}
                        className="max-w-md"
                        data-testid="input-decreases-search"
                      />
                      <Button variant="ghost" size="icon" data-testid="button-decreases-search">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
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
                          <TableHead className="text-white text-xs">Plan</TableHead>
                          <TableHead className="text-white text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockRateDecreases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                              No rate decreases found
                            </TableCell>
                          </TableRow>
                        ) : (
                          mockRateDecreases
                            .slice((decreasesCurrentPage - 1) * decreasesPageSize, decreasesCurrentPage * decreasesPageSize)
                            .map((item) => (
                              <TableRow key={item.id} data-testid={`row-decrease-${item.id}`}>
                                <TableCell className="text-sm">{item.zone}</TableCell>
                                <TableCell className="text-sm">{item.code}</TableCell>
                                <TableCell className="text-sm">{item.originSet}</TableCell>
                                <TableCell className="text-sm">{item.timeclass}</TableCell>
                                <TableCell className="text-sm">{item.effectiveDate} ({item.effectiveDays})</TableCell>
                                <TableCell className="text-sm">{item.currency}</TableCell>
                                <TableCell className="text-sm">{item.newRate.toFixed(4)}</TableCell>
                                <TableCell className="text-sm">{item.oldRate.toFixed(4)}</TableCell>
                                <TableCell className="text-sm text-blue-600 dark:text-blue-400">
                                  {item.change.toFixed(4)} ({item.changePercent.toFixed(2)}%)
                                </TableCell>
                                <TableCell className="text-sm">{item.plan}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={item.status === "Committed" ? "default" : "secondary"}
                                    className={item.status === "Committed" ? "bg-sky-500 hover:bg-sky-600" : ""}
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
                      totalItems={mockRateDecreases.length}
                      totalPages={Math.ceil(mockRateDecreases.length / decreasesPageSize) || 1}
                      pageSize={decreasesPageSize}
                      currentPage={decreasesCurrentPage}
                      onPageChange={setDecreasesCurrentPage}
                      onPageSizeChange={setDecreasesPageSize}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Click to filter"
                  value={notificationsSearchFilter}
                  onChange={(e) => setNotificationsSearchFilter(e.target.value)}
                  className="max-w-md"
                  data-testid="input-notifications-search"
                />
                <Button variant="ghost" size="icon" data-testid="button-notifications-search">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#3d4f5f]">
                    <TableHead className="text-white text-xs">Timestamp</TableHead>
                    <TableHead className="text-white text-xs">Type</TableHead>
                    <TableHead className="text-white text-xs">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No notifications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    mockNotifications
                      .slice((notificationsCurrentPage - 1) * notificationsPageSize, notificationsCurrentPage * notificationsPageSize)
                      .map((item) => (
                        <TableRow key={item.id} data-testid={`row-notification-${item.id}`}>
                          <TableCell className="text-sm">{item.timestamp}</TableCell>
                          <TableCell>
                            <Badge
                              variant={item.type === "error" ? "destructive" : item.type === "warning" ? "secondary" : "outline"}
                            >
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{item.message}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              <DataTableFooter
                totalItems={mockNotifications.length}
                totalPages={Math.ceil(mockNotifications.length / notificationsPageSize) || 1}
                pageSize={notificationsPageSize}
                currentPage={notificationsCurrentPage}
                onPageChange={setNotificationsCurrentPage}
                onPageSizeChange={setNotificationsPageSize}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
