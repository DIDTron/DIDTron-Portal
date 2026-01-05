import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Clock, DollarSign, Search, Download, Calendar } from "lucide-react";

interface CallRecord {
  id: string;
  timestamp: Date;
  destination: string;
  duration: number;
  cost: number;
  status: "completed" | "failed" | "busy";
}

export default function VoiceUsagePage() {
  const [dateRange, setDateRange] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");

  const calls: CallRecord[] = [
    { id: "1", timestamp: new Date(Date.now() - 120000), destination: "+1 555 123 4567", duration: 272, cost: 0.24, status: "completed" },
    { id: "2", timestamp: new Date(Date.now() - 900000), destination: "+44 20 7946 0958", duration: 735, cost: 0.89, status: "completed" },
    { id: "3", timestamp: new Date(Date.now() - 1800000), destination: "+33 1 42 86 82 28", duration: 105, cost: 0.12, status: "completed" },
    { id: "4", timestamp: new Date(Date.now() - 3600000), destination: "+49 30 1234567", duration: 0, cost: 0, status: "failed" },
    { id: "5", timestamp: new Date(Date.now() - 7200000), destination: "+1 212 555 1234", duration: 423, cost: 0.35, status: "completed" },
  ];

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const totalCalls = calls.length;
  const totalMinutes = Math.round(calls.reduce((acc, c) => acc + c.duration, 0) / 60);
  const totalCost = calls.reduce((acc, c) => acc + c.cost, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Voice Usage</h1>
          <p className="text-muted-foreground">View your call history and usage</p>
        </div>
        <Button variant="outline" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export CDRs
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCalls}</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-accent">
                <Clock className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMinutes}</p>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Call History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-calls"
                />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32" data-testid="select-date-range">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id} data-testid={`row-call-${call.id}`}>
                  <TableCell>{formatTime(call.timestamp)}</TableCell>
                  <TableCell className="font-mono">{call.destination}</TableCell>
                  <TableCell>{formatDuration(call.duration)}</TableCell>
                  <TableCell>${call.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={call.status === "completed" ? "default" : "destructive"}>
                      {call.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
