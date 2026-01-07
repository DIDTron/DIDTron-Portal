import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search, Phone, PhoneIncoming, PhoneOutgoing, Clock, DollarSign,
  MessageSquare, FileText, Download, PlayCircle, Loader2, X
} from "lucide-react";
import { format } from "date-fns";
import type { Customer, AiVoiceAgent } from "@shared/schema";

type CallLog = {
  id: string;
  customerId: string;
  agentId: string | null;
  campaignId: string | null;
  callSid: string | null;
  direction: string | null;
  fromNumber: string | null;
  toNumber: string | null;
  status: string | null;
  duration: number | null;
  billableDuration: number | null;
  cost: string | null;
  recordingUrl: string | null;
  transcript: string | null;
  sentiment: string | null;
  aiTokensUsed: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
};

function getStatusBadge(status: string | null) {
  switch (status) {
    case "completed":
      return <Badge variant="default">Completed</Badge>;
    case "in-progress":
      return <Badge variant="secondary">In Progress</Badge>;
    case "ringing":
      return <Badge variant="outline">Ringing</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "no-answer":
      return <Badge variant="outline">No Answer</Badge>;
    case "busy":
      return <Badge variant="outline">Busy</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

function getSentimentBadge(sentiment: string | null) {
  switch (sentiment) {
    case "positive":
      return <Badge variant="default" className="bg-green-500/10 text-green-600">Positive</Badge>;
    case "neutral":
      return <Badge variant="secondary">Neutral</Badge>;
    case "negative":
      return <Badge variant="destructive" className="bg-red-500/10 text-red-600">Negative</Badge>;
    default:
      return null;
  }
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AiVoiceCallLogsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  const { data: callLogs = [], isLoading } = useQuery<CallLog[]>({
    queryKey: ["/api/admin/ai-voice/call-logs"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: agents = [] } = useQuery<AiVoiceAgent[]>({
    queryKey: ["/api/admin/ai-voice/agents"],
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || "Unknown";
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return "-";
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || "Unknown";
  };

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = !search || 
      log.fromNumber?.includes(search) || 
      log.toNumber?.includes(search) ||
      log.callSid?.includes(search);
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesDirection = directionFilter === "all" || log.direction === directionFilter;
    return matchesSearch && matchesStatus && matchesDirection;
  });

  const totalDuration = callLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const totalCost = callLogs.reduce((sum, log) => sum + parseFloat(log.cost || "0"), 0);
  const avgDuration = callLogs.length > 0 ? Math.round(totalDuration / callLogs.length) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Call Logs</h1>
          <p className="text-muted-foreground">View and analyze AI Voice call history</p>
        </div>
        <Button variant="outline" data-testid="button-export-logs">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(avgDuration)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Call History</CardTitle>
              <CardDescription>View call details, recordings, and transcripts</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calls..."
                  className="pl-8 w-48"
                  data-testid="input-search-calls"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-32" data-testid="select-direction">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="no-answer">No Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Call Logs</h3>
              <p className="text-muted-foreground">
                Call logs will appear here once calls are made
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>From / To</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead className="w-20">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id} data-testid={`row-call-${log.id}`}>
                    <TableCell>
                      {log.direction === "inbound" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <PhoneIncoming className="h-4 w-4" />
                          <span className="text-sm">In</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-blue-600">
                          <PhoneOutgoing className="h-4 w-4" />
                          <span className="text-sm">Out</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{log.fromNumber || "-"}</div>
                        <div className="text-muted-foreground">{log.toNumber || "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getAgentName(log.agentId)}</TableCell>
                    <TableCell>{formatDuration(log.duration)}</TableCell>
                    <TableCell className="font-mono">${log.cost || "0.00"}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{getSentimentBadge(log.sentiment)}</TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-view-call-${log.id}`}
                        onClick={() => setSelectedCall(log)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Details
            </DialogTitle>
            <DialogDescription>
              {selectedCall?.callSid || selectedCall?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Direction:</span>
                  <span className="ml-2 capitalize">{selectedCall.direction}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2">{getStatusBadge(selectedCall.status)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">From:</span>
                  <span className="ml-2">{selectedCall.fromNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>
                  <span className="ml-2">{selectedCall.toNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2">{formatDuration(selectedCall.duration)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="ml-2 font-mono">${selectedCall.cost || "0.00"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">AI Tokens:</span>
                  <span className="ml-2">{selectedCall.aiTokensUsed || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span className="ml-2">{getSentimentBadge(selectedCall.sentiment) || "-"}</span>
                </div>
              </div>

              {selectedCall.recordingUrl && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Recording
                  </h4>
                  <audio controls className="w-full">
                    <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                  </audio>
                </div>
              )}

              {selectedCall.transcript && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Transcript
                  </h4>
                  <ScrollArea className="h-48 rounded-md border p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedCall.transcript}</p>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
