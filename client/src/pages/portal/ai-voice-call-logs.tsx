import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Phone, PhoneIncoming, PhoneOutgoing, Search, Play, FileText,
  Clock, CheckCircle2, XCircle, Download, Loader2, MessageSquare,
  ThumbsUp, ThumbsDown, Minus
} from "lucide-react";

type CallLog = {
  id: string;
  agentId: string;
  agentName: string;
  direction: string;
  callerNumber: string;
  calleeNumber: string;
  duration: number;
  status: string;
  sentiment: string | null;
  transcriptSummary: string | null;
  transcript: { role: string; content: string; timestamp: number }[] | null;
  recordingUrl: string | null;
  cost: number;
  createdAt: string;
};

export default function CustomerCallLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);

  const { data: callLogs = [], isLoading } = useQuery<CallLog[]>({
    queryKey: ["/api/my/ai-voice/call-logs"],
  });

  const filteredLogs = callLogs.filter((log) => {
    const matchesSearch = searchQuery === "" ||
      log.callerNumber.includes(searchQuery) ||
      log.calleeNumber.includes(searchQuery) ||
      log.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDirection = directionFilter === "all" || log.direction === directionFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesDirection && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "no_answer":
        return <Badge variant="secondary">No Answer</Badge>;
      case "busy":
        return <Badge variant="secondary">Busy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Call Logs</h1>
          <p className="text-muted-foreground">
            View and analyze your AI voice call history
          </p>
        </div>
        <Button variant="outline" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {callLogs.filter(l => l.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(callLogs.reduce((sum, l) => sum + l.duration, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${callLogs.reduce((sum, l) => sum + l.cost, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Call History</CardTitle>
              <CardDescription>All AI voice interactions</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 w-48"
                  data-testid="input-search"
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
                  <SelectItem value="no_answer">No Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Direction</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>From / To</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No call logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} data-testid={`row-call-${log.id}`}>
                    <TableCell>
                      {log.direction === "inbound" ? (
                        <PhoneIncoming className="h-4 w-4 text-green-500" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{log.agentName}</TableCell>
                    <TableCell className="text-sm">
                      <div>{log.callerNumber}</div>
                      <div className="text-muted-foreground">{log.calleeNumber}</div>
                    </TableCell>
                    <TableCell>{formatDuration(log.duration)}</TableCell>
                    <TableCell>{getSentimentIcon(log.sentiment)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>${log.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLog(log)}
                          data-testid={`button-view-${log.id}`}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {log.recordingUrl && (
                          <Button variant="ghost" size="icon" data-testid={`button-play-${log.id}`}>
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Call Transcript
            </DialogTitle>
            <DialogDescription>
              {selectedLog && (
                <span>
                  {selectedLog.direction === "inbound" ? "Inbound" : "Outbound"} call with {selectedLog.agentName}
                  {" - "}{new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-md text-sm">
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-medium">{formatDuration(selectedLog.duration)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cost</span>
                  <p className="font-medium">${selectedLog.cost.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sentiment</span>
                  <div className="flex items-center gap-1">
                    {getSentimentIcon(selectedLog.sentiment)}
                    <span className="font-medium capitalize">{selectedLog.sentiment || "Neutral"}</span>
                  </div>
                </div>
              </div>

              {selectedLog.transcriptSummary && (
                <div className="space-y-2">
                  <h4 className="font-medium">Summary</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedLog.transcriptSummary}
                  </p>
                </div>
              )}

              {selectedLog.transcript && selectedLog.transcript.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Full Transcript</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto border rounded-md p-3">
                    {selectedLog.transcript.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-md ${
                          entry.role === "assistant" ? "bg-primary/10 ml-4" : "bg-muted mr-4"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.role === "assistant" ? "AI Agent" : "Caller"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.recordingUrl && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recording</h4>
                  <audio controls className="w-full">
                    <source src={selectedLog.recordingUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
