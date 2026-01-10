import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ChevronLeft, Pencil } from "lucide-react";
import type { CarrierInterconnect, Carrier } from "@shared/schema";

// Helper function to get tabs based on direction (hoisted)
function getTabsForDirection(direction: string) {
  const baseTabs = [{ id: "details", label: "Details" }];
  
  if (direction === "customer") {
    return [
      ...baseTabs,
      { id: "services", label: "Services" },
      { id: "ingress-validation", label: "Ingress Validation" },
      { id: "ingress-translation", label: "Ingress Translation" },
      { id: "media", label: "Media" },
      { id: "signalling", label: "Signalling" },
    ];
  } else if (direction === "supplier") {
    return [
      ...baseTabs,
      { id: "egress-routing", label: "Egress Routing" },
      { id: "egress-translations", label: "Egress Translations" },
      { id: "media", label: "Media" },
      { id: "monitoring", label: "Monitoring" },
      { id: "signalling", label: "Signalling" },
    ];
  } else {
    return [
      ...baseTabs,
      { id: "services", label: "Services" },
      { id: "ingress-validation", label: "Ingress Validation" },
      { id: "ingress-translation", label: "Ingress Translation" },
      { id: "egress-routing", label: "Egress Routing" },
      { id: "egress-translations", label: "Egress Translations" },
      { id: "media", label: "Media" },
      { id: "monitoring", label: "Monitoring" },
      { id: "signalling", label: "Signalling" },
    ];
  }
}

export default function InterconnectDetailPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/carriers/:carrierId/interconnects/:interconnectId");
  const carrierId = params?.carrierId;
  const interconnectId = params?.interconnectId;

  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);

  const { data: carrier } = useQuery<Carrier>({
    queryKey: ["/api/carriers", carrierId],
    enabled: !!carrierId,
  });

  const { data: interconnect, isLoading } = useQuery<CarrierInterconnect>({
    queryKey: ["/api/interconnects", interconnectId],
    enabled: !!interconnectId,
  });

  // Fetch ConnexCS servers for Session Border Controller section
  interface ConnexCSServer {
    id: number;
    type: string;
    ip: string;
    alias: string;
    fqdn: string | null;
    status: string;
    channels: number;
    cps: number;
    rtp_capacity: number;
    flags: string[];
  }
  
  const { data: serversData } = useQuery<{ success: boolean; data: ConnexCSServer[]; count: number; mockMode: boolean }>({
    queryKey: ["/api/connexcs/servers"],
  });

  const [formData, setFormData] = useState({
    name: "",
    direction: "both",
    currencyCode: "USD",
    protocol: "SIP",
    capacityMode: "unrestricted",
    capacityLimit: "",
    isActive: true,
    techPrefix: "",
    ipAddress: "",
    sipPort: 5060,
  });

  // Reset tab state when navigating to a different interconnect
  useEffect(() => {
    setActiveTab("details");
  }, [interconnectId]);

  useEffect(() => {
    if (interconnect) {
      setFormData({
        name: interconnect.name || "",
        direction: interconnect.direction || "both",
        currencyCode: interconnect.currencyCode || "USD",
        protocol: interconnect.protocol || "SIP",
        capacityMode: interconnect.capacityMode || "unrestricted",
        capacityLimit: interconnect.capacityLimit?.toString() || "",
        isActive: interconnect.isActive ?? true,
        techPrefix: interconnect.techPrefix || "",
        ipAddress: interconnect.ipAddress || "",
        sipPort: interconnect.sipPort || 5060,
      });
      
      // Set active tab to first tab for this direction when data loads
      const firstTab = getTabsForDirection(interconnect.direction || "both")[0]?.id || "details";
      setActiveTab(firstTab);
    }
  }, [interconnect]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("PUT", `/api/interconnects/${interconnectId}`, {
        ...data,
        capacityLimit: data.capacityMode === "unrestricted" ? null : parseInt(data.capacityLimit) || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/carriers", carrierId, "interconnects"] });
      toast({ title: "Interconnect updated successfully" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update interconnect", variant: "destructive" });
    },
  });

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case "customer":
        return <Badge className="bg-blue-500 text-white">Customer</Badge>;
      case "supplier":
        return <Badge className="bg-purple-500 text-white">Supplier</Badge>;
      case "both":
        return <Badge className="bg-gray-500 text-white">Bilateral</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Bilateral</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!interconnect) {
    return <div className="p-8 text-center text-muted-foreground">Interconnect not found</div>;
  }

  const tabs = getTabsForDirection(interconnect.direction || "both");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation(`/admin/carriers/${carrierId}`)} 
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span 
                className="cursor-pointer hover:underline text-primary"
                onClick={() => setLocation("/admin/carriers")}
              >
                Carrier Management
              </span>
              <span>/</span>
              <span 
                className="cursor-pointer hover:underline text-primary"
                onClick={() => setLocation(`/admin/carriers/${carrierId}`)}
              >
                {carrier?.name || "Carrier"}
              </span>
              <span>/</span>
              <span>{interconnect.name}</span>
            </div>
            <h1 className="text-lg font-semibold" data-testid="text-interconnect-name">{interconnect.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{carrier?.name} Carrier Cloud</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="h-12">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} data-testid={`tab-${tab.id}`}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="details" className="mt-0">
            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-base">Interconnect Details</CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} data-testid="button-edit">
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Name</span>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="input-name"
                      />
                    ) : (
                      <span className="text-sm font-medium">{interconnect.name}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Direction</span>
                    {isEditing ? (
                      <Select
                        value={formData.direction}
                        onValueChange={(v) => setFormData({ ...formData, direction: v })}
                      >
                        <SelectTrigger data-testid="select-direction">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="both">Bilateral</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getDirectionBadge(interconnect.direction || "both")
                    )}
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Currency</span>
                    {isEditing ? (
                      <Select
                        value={formData.currencyCode}
                        onValueChange={(v) => setFormData({ ...formData, currencyCode: v })}
                      >
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{interconnect.currencyCode || "USD"}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Protocol</span>
                    {isEditing ? (
                      <Select
                        value={formData.protocol}
                        onValueChange={(v) => setFormData({ ...formData, protocol: v })}
                      >
                        <SelectTrigger data-testid="select-protocol">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SIP">SIP</SelectItem>
                          <SelectItem value="H.323">H.323</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{interconnect.protocol || "SIP"}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Capacity</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.capacityMode === "unrestricted" ? "" : formData.capacityLimit}
                          onChange={(e) => setFormData({ ...formData, capacityLimit: e.target.value, capacityMode: "capped" })}
                          disabled={formData.capacityMode === "unrestricted"}
                          className="w-24"
                          data-testid="input-capacity"
                        />
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={formData.capacityMode === "unrestricted"}
                            onCheckedChange={(checked) => setFormData({ ...formData, capacityMode: checked ? "unrestricted" : "capped" })}
                          />
                          <span className="text-sm">Unrestricted</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm">{interconnect.capacityMode === "unrestricted" ? "Unrestricted" : interconnect.capacityLimit}</span>
                    )}
                  </div>
                  
                  {(interconnect.direction === "supplier" || interconnect.direction === "bilateral") && (
                    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Supplier Buy Rates</span>
                      <span className="text-sm">{interconnect.supplierBuyRates || "-"}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Interconnect Status</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                        <span className="text-sm text-muted-foreground">Operational Status</span>
                        <div className={`w-3 h-3 rounded-full ${interconnect.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      </div>
                      <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                        <span className="text-sm text-muted-foreground">Enabled</span>
                        {isEditing ? (
                          <Select
                            value={formData.isActive ? "yes" : "no"}
                            onValueChange={(v) => setFormData({ ...formData, isActive: v === "yes" })}
                          >
                            <SelectTrigger className="w-24" data-testid="select-enabled">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">{interconnect.isActive ? "Yes" : "No"}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => updateMutation.mutate(formData)}
                        disabled={updateMutation.isPending}
                        data-testid="button-save"
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Session Border Controller</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary">
                        <TableHead className="text-primary-foreground">Network</TableHead>
                        <TableHead className="text-primary-foreground">IP</TableHead>
                        <TableHead className="text-primary-foreground text-center">Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serversData?.data && serversData.data.length > 0 ? (
                        serversData.data.map((server) => (
                          <TableRow key={server.id}>
                            <TableCell>{server.alias || `Server-${server.id}`}</TableCell>
                            <TableCell className="font-mono text-sm">{server.ip}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={server.status === "Active"} disabled />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No SBC configured
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Services configuration for this interconnect.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingress-validation" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Ingress Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ingress validation rules for incoming traffic.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingress-translation" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Ingress Translation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ingress parameter manipulation settings.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="egress-routing" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Egress Routing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Egress routing configuration for outbound traffic.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="egress-translations" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Egress Translations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Egress translation rules.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Media handling configuration (codecs, transcoding, etc.)</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Monitoring and alerting settings for this interconnect.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signalling" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Signalling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">SIP signalling configuration.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
