import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Route, Activity, Settings, TrendingUp } from "lucide-react";

interface CustomerRoute {
  id: string;
  name: string;
  prefix: string;
  carrier: string;
  asr: number;
  acd: number;
  status: "active" | "paused";
}

export default function VoiceRoutesPage() {
  const routes: CustomerRoute[] = [
    { id: "1", name: "US Mobile", prefix: "1", carrier: "T1 Premium", asr: 96.5, acd: 245, status: "active" },
    { id: "2", name: "UK Landline", prefix: "44", carrier: "EU Carrier", asr: 94.2, acd: 312, status: "active" },
    { id: "3", name: "Germany All", prefix: "49", carrier: "DE Premium", asr: 93.8, acd: 198, status: "paused" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Routes</h1>
          <p className="text-muted-foreground">View your assigned voice routes</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Route className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{routes.filter(r => r.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Routes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">94.8%</p>
                <p className="text-sm text-muted-foreground">Avg ASR</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-accent">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">4:12</p>
                <p className="text-sm text-muted-foreground">Avg ACD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Routes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>ASR</TableHead>
                <TableHead>ACD</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id} data-testid={`row-route-${route.id}`}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{route.prefix}</Badge>
                  </TableCell>
                  <TableCell>{route.carrier}</TableCell>
                  <TableCell>
                    <Badge variant={route.asr > 95 ? "default" : "secondary"}>
                      {route.asr}%
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.floor(route.acd / 60)}:{(route.acd % 60).toString().padStart(2, "0")}</TableCell>
                  <TableCell>
                    <Badge variant={route.status === "active" ? "default" : "secondary"}>
                      {route.status}
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
