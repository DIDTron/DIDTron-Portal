import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Search, 
  Calendar as CalendarIcon, 
  Download, 
  RefreshCw,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { format, subDays } from "date-fns";

interface Cdr {
  id: string;
  customerId: string;
  callId: string;
  callerNumber: string;
  calledNumber: string;
  direction: string;
  startTime: string;
  answerTime: string | null;
  endTime: string;
  duration: number;
  billableSeconds: number;
  rate: string;
  cost: string;
  carrierId: string;
  routeId: string;
  sipResponseCode: number;
  hangupCause: string;
  createdAt: string;
}

interface CdrResponse {
  data: Cdr[];
  total: number;
  limit: number;
  offset: number;
}

interface CdrStats {
  totalCalls: number;
  answeredCalls: number;
  failedCalls: number;
  totalDuration: number;
  totalCost: number;
  avgDuration: number;
  asr: number;
  acd: number;
  ner: number;
}

export default function CdrsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCdr, setSelectedCdr] = useState<Cdr | null>(null);

  const { data: cdrsResponse, isLoading, refetch } = useQuery<CdrResponse>({
    queryKey: ['/api/cdrs', { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd'), direction: directionFilter !== 'all' ? directionFilter : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      params.append('endDate', format(endDate, 'yyyy-MM-dd'));
      if (directionFilter !== 'all') params.append('direction', directionFilter);
      
      const res = await fetch(`/api/cdrs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch CDRs');
      return res.json();
    },
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: stats } = useQuery<CdrStats>({
    queryKey: ['/api/cdrs/stats/summary'],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (sipCode: number) => {
    if (sipCode >= 200 && sipCode < 300) {
      return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Answered</Badge>;
    } else if (sipCode >= 400 && sipCode < 500) {
      return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><XCircle className="h-3 w-3 mr-1" />Client Error</Badge>;
    } else if (sipCode >= 500) {
      return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Server Error</Badge>;
    }
    return <Badge variant="outline">{sipCode}</Badge>;
  };

  const filteredCdrs = (cdrsResponse?.data || []).filter(cdr => {
    const matchesSearch = searchTerm === "" || 
      cdr.callerNumber.includes(searchTerm) || 
      cdr.calledNumber.includes(searchTerm) ||
      cdr.callId.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "answered" && cdr.sipResponseCode >= 200 && cdr.sipResponseCode < 300) ||
      (statusFilter === "failed" && cdr.sipResponseCode >= 400);
    
    return matchesSearch && matchesStatus;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedCdrs,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredCdrs, 25);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Call Detail Records</h1>
          <p className="text-muted-foreground">View and analyze call history across all customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-cdrs">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" data-testid="button-export-cdrs">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalCalls?.toLocaleString() || '-'}</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.asr?.toFixed(1) || '-'}%</p>
                <p className="text-sm text-muted-foreground">ASR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.acd ? formatDuration(stats.acd) : '-'}</p>
                <p className="text-sm text-muted-foreground">ACD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats?.totalCost?.toLocaleString() || '-'}</p>
                <p className="text-sm text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Call Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number or call ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-cdrs"
                aria-label="Search call records"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-start-date">
                  <CalendarIcon className="h-4 w-4" />
                  {format(startDate, "MMM d")}
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
            
            <span className="text-muted-foreground">to</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-end-date">
                  <CalendarIcon className="h-4 w-4" />
                  {format(endDate, "MMM d")}
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

            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-32" data-testid="select-direction-filter">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Dir</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCdrs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No call records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCdrs.map((cdr) => (
                      <TableRow key={cdr.id} data-testid={`row-cdr-${cdr.id}`}>
                        <TableCell>
                          {cdr.direction === 'inbound' ? (
                            <PhoneIncoming className="h-4 w-4 text-green-500" />
                          ) : (
                            <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{cdr.callerNumber}</TableCell>
                        <TableCell className="font-mono text-sm">{cdr.calledNumber}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(cdr.startTime), "MMM d, HH:mm:ss")}
                        </TableCell>
                        <TableCell className="font-mono">{formatDuration(cdr.duration)}</TableCell>
                        <TableCell className="text-right font-mono">${parseFloat(cdr.cost).toFixed(4)}</TableCell>
                        <TableCell>{getStatusBadge(cdr.sipResponseCode)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedCdr(cdr)}
                            data-testid={`button-view-cdr-${cdr.id}`}
                            aria-label="View call details"
                            title="View call details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <DataTableFooter
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCdr} onOpenChange={() => setSelectedCdr(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
          </DialogHeader>
          {selectedCdr && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Call ID</p>
                  <p className="font-mono text-sm">{selectedCdr.callId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Direction</p>
                  <p className="capitalize">{selectedCdr.direction}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-mono">{selectedCdr.callerNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-mono">{selectedCdr.calledNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p>{format(new Date(selectedCdr.startTime), "PPpp")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p>{format(new Date(selectedCdr.endTime), "PPpp")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-mono">{formatDuration(selectedCdr.duration)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Billable Seconds</p>
                  <p className="font-mono">{selectedCdr.billableSeconds}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Rate</p>
                  <p className="font-mono">${selectedCdr.rate}/min</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="font-mono">${parseFloat(selectedCdr.cost).toFixed(6)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">SIP Response</p>
                  <p>{selectedCdr.sipResponseCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Hangup Cause</p>
                  <p className="font-mono text-sm">{selectedCdr.hangupCause}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
