import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronDown, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import type { CarrierInterconnect, Carrier } from "@shared/schema";

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

interface Service {
  id: string;
  name: string;
  customerRatingPlan: string;
  routingPlan: string;
  currency: string;
  capacity: string;
  status: "active" | "inactive";
}

interface IPAddress {
  id: string;
  ip: string;
  isRange: boolean;
  rangeEnd?: string;
  addressType: "transport" | "via";
  includeLastVia: boolean;
  active: boolean;
}

interface Codec {
  id: string;
  name: string;
  allowed: boolean;
  relayOnly: boolean;
  vad: boolean;
  ptime: number;
}

const defaultCodecs: Codec[] = [
  { id: "g711u", name: "G.711 μ-law (PCMU)", allowed: true, relayOnly: false, vad: false, ptime: 20 },
  { id: "g711a", name: "G.711 A-law (PCMA)", allowed: true, relayOnly: false, vad: false, ptime: 20 },
  { id: "g729", name: "G.729", allowed: true, relayOnly: false, vad: true, ptime: 20 },
  { id: "g723", name: "G.723.1", allowed: true, relayOnly: false, vad: true, ptime: 30 },
  { id: "gsm", name: "GSM", allowed: true, relayOnly: true, vad: false, ptime: 20 },
  { id: "opus", name: "Opus", allowed: true, relayOnly: true, vad: false, ptime: 20 },
  { id: "amr", name: "AMR", allowed: false, relayOnly: true, vad: false, ptime: 20 },
  { id: "amr-wb", name: "AMR-WB", allowed: false, relayOnly: true, vad: false, ptime: 20 },
];

export default function InterconnectDetailPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, wholesaleParams] = useRoute("/admin/wholesale/partners/:carrierId/interconnects/:interconnectId");
  const [, softswitchParams] = useRoute("/admin/softswitch/carriers/:carrierId/interconnects/:interconnectId");
  const params = wholesaleParams || softswitchParams;
  const carrierId = params?.carrierId;
  const interconnectId = params?.interconnectId;
  const isSoftswitchRoute = !!softswitchParams;

  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAddIPDialog, setShowAddIPDialog] = useState(false);
  const [isEditingValidation, setIsEditingValidation] = useState(false);
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [isEditingMedia, setIsEditingMedia] = useState(false);
  const [isEditingSignalling, setIsEditingSignalling] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [ipAddresses, setIpAddresses] = useState<IPAddress[]>([]);
  const [codecs, setCodecs] = useState<Codec[]>(defaultCodecs);

  const [validationData, setValidationData] = useState({
    techPrefix: "",
    fromUri: "",
    contactUri: "",
    trunkGroup: "",
    trunkContext: "",
    validateTrunkGroup: false,
    addressType: "transport",
    maxCps: "",
    maxCpsEnabled: false,
    testSystemControl: "dont_allow",
  });

  const [translationData, setTranslationData] = useState({
    originationPreference: "pai_then_from",
    originationValidation: "none",
    setPaiHeader: "none",
    globalTranslation: "",
    originTranslation: "",
    destinationTranslation: "",
  });

  const [mediaData, setMediaData] = useState({
    dtmfDetection: "rfc2833",
    mediaRelay: "always",
    mediaNetwork: "same_as_signalling",
    rtpTimeout: "",
    rtpTimeoutEnabled: false,
  });

  const [signallingData, setSignallingData] = useState({
    privacyMethod: "rfc3325",
    sessionTimerEnabled: true,
    minSessionTimer: 90,
    defaultSessionTimer: 1800,
    rel100: "supported",
    maxCallDurationEnabled: false,
    maxCallDuration: 0,
    callProgressDefault: true,
    tryingTimeout: 180000,
    ringingTimeout: 180000,
    releaseCauseMapping: "",
  });

  const [monitoringData, setMonitoringData] = useState({
    monitoringEnabled: "none",
    alarmSeverity: "low",
    sendEmailOn: "breach_only",
    recipients: "",
  });

  const [isEditingMonitoring, setIsEditingMonitoring] = useState(false);

  const [newService, setNewService] = useState({
    name: "",
    ratingPlanId: "",
    timeClass: "AnyDay",
    capacityMode: "unrestricted" as "unrestricted" | "capped",
    capacityLimit: "",
    allowTranscoding: false,
    enforcementPolicy: "",
    routingMethod: "routing_plan" as "routing_plan" | "route_to_interconnect",
    routingPlanId: "",
    routeToInterconnectId: "",
    useTranslationFromSupplier: false,
    originationTranslation: "",
    destinationTranslation: "",
    originationMatchType: "any" as "any" | "define_matches" | "assign_list",
    originationIncludeExclude: "including" as "including" | "excluding",
    originationMatches: "",
    originationMinDigits: "0",
    originationMaxDigits: "0",
    originationMatchListId: "",
    destinationMatchType: "any" as "any" | "define_matches" | "assign_list",
    destinationIncludeExclude: "including" as "including" | "excluding",
    destinationMatches: "",
    destinationMinDigits: "0",
    destinationMaxDigits: "0",
    destinationMatchListId: "",
    originationBlacklistId: "",
    originationExceptionsId: "",
    destinationBlacklistId: "",
    destinationExceptionsId: "",
  });

  const [newIP, setNewIP] = useState({
    ip: "",
    isRange: false,
    rangeEnd: "",
    addressType: "transport" as "transport" | "via",
    includeLastVia: false,
  });

  const { data: carrier } = useQuery<Carrier>({
    queryKey: ["/api/carriers", carrierId],
    enabled: !!carrierId,
  });

  const { data: interconnect, isLoading } = useQuery<CarrierInterconnect>({
    queryKey: ["/api/interconnects", interconnectId],
    enabled: !!interconnectId,
  });

  // Fetch IP addresses from backend
  const { data: ipAddressesData } = useQuery<Array<{ id: string; interconnectId: string; ipAddress: string; isRange: boolean; rangeEnd?: string; addressType: string; includeLastVia: boolean; isActive: boolean }>>({
    queryKey: ["/api/interconnects", interconnectId, "ip-addresses"],
    enabled: !!interconnectId,
  });

  // Fetch validation settings from backend
  const { data: validationSettingsData } = useQuery<Record<string, any>>({
    queryKey: ["/api/interconnects", interconnectId, "validation-settings"],
    enabled: !!interconnectId,
  });

  // Fetch translation settings from backend
  const { data: translationSettingsData } = useQuery<Record<string, any>>({
    queryKey: ["/api/interconnects", interconnectId, "translation-settings"],
    enabled: !!interconnectId,
  });

  // Fetch media settings from backend
  const { data: mediaSettingsData } = useQuery<Record<string, any>>({
    queryKey: ["/api/interconnects", interconnectId, "media-settings"],
    enabled: !!interconnectId,
  });

  // Fetch signalling settings from backend
  const { data: signallingSettingsData } = useQuery<Record<string, any>>({
    queryKey: ["/api/interconnects", interconnectId, "signalling-settings"],
    enabled: !!interconnectId,
  });

  // Fetch monitoring settings from backend
  const { data: monitoringSettingsData } = useQuery<Record<string, any>>({
    queryKey: ["/api/interconnects", interconnectId, "monitoring-settings"],
    enabled: !!interconnectId,
  });

  // Fetch codecs from backend
  const { data: codecsData } = useQuery<Array<{ id: string; interconnectId: string; codecName: string; allowed: boolean; relayOnly: boolean; vad: boolean; ptime: number; sortOrder: number }>>({
    queryKey: ["/api/interconnects", interconnectId, "codecs"],
    enabled: !!interconnectId,
  });

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
      
      const firstTab = getTabsForDirection(interconnect.direction || "both")[0]?.id || "details";
      setActiveTab(firstTab);
    }
  }, [interconnect]);

  // Sync IP addresses from backend
  useEffect(() => {
    if (ipAddressesData) {
      setIpAddresses(ipAddressesData.map(addr => ({
        id: addr.id,
        ip: addr.ipAddress,
        isRange: addr.isRange || false,
        rangeEnd: addr.rangeEnd,
        addressType: (addr.addressType as "transport" | "via") || "transport",
        includeLastVia: addr.includeLastVia || false,
        active: addr.isActive ?? true,
      })));
    }
  }, [ipAddressesData]);

  // Sync validation settings from backend
  useEffect(() => {
    if (validationSettingsData && Object.keys(validationSettingsData).length > 0) {
      setValidationData({
        techPrefix: validationSettingsData.techPrefix || "",
        fromUri: validationSettingsData.fromUri || "",
        contactUri: validationSettingsData.contactUri || "",
        trunkGroup: validationSettingsData.trunkGroup || "",
        trunkContext: validationSettingsData.trunkContext || "",
        validateTrunkGroup: validationSettingsData.validateTrunkGroup || false,
        addressType: validationSettingsData.addressType || "transport",
        maxCps: validationSettingsData.maxCps?.toString() || "",
        maxCpsEnabled: validationSettingsData.maxCpsEnabled || false,
        testSystemControl: validationSettingsData.testSystemControl || "dont_allow",
      });
    }
  }, [validationSettingsData]);

  // Sync translation settings from backend
  useEffect(() => {
    if (translationSettingsData && Object.keys(translationSettingsData).length > 0) {
      setTranslationData({
        originationPreference: translationSettingsData.originationPreference || "pai_then_from",
        originationValidation: translationSettingsData.originationValidation || "none",
        setPaiHeader: translationSettingsData.setPaiHeader || "none",
        globalTranslation: translationSettingsData.globalTranslation || "",
        originTranslation: translationSettingsData.originTranslation || "",
        destinationTranslation: translationSettingsData.destinationTranslation || "",
      });
    }
  }, [translationSettingsData]);

  // Sync media settings from backend
  useEffect(() => {
    if (mediaSettingsData && Object.keys(mediaSettingsData).length > 0) {
      setMediaData({
        dtmfDetection: mediaSettingsData.dtmfDetection || "rfc2833",
        mediaRelay: mediaSettingsData.mediaRelay || "always",
        mediaNetwork: mediaSettingsData.mediaNetwork || "same_as_signalling",
        rtpTimeout: mediaSettingsData.rtpTimeout?.toString() || "",
        rtpTimeoutEnabled: mediaSettingsData.rtpTimeoutEnabled || false,
      });
    }
  }, [mediaSettingsData]);

  // Sync signalling settings from backend
  useEffect(() => {
    if (signallingSettingsData && Object.keys(signallingSettingsData).length > 0) {
      setSignallingData({
        privacyMethod: signallingSettingsData.privacyMethod || "rfc3325",
        sessionTimerEnabled: signallingSettingsData.sessionTimerEnabled ?? true,
        minSessionTimer: signallingSettingsData.minSessionTimer || 90,
        defaultSessionTimer: signallingSettingsData.defaultSessionTimer || 1800,
        rel100: signallingSettingsData.rel100 || "supported",
        maxCallDurationEnabled: signallingSettingsData.maxCallDurationEnabled || false,
        maxCallDuration: signallingSettingsData.maxCallDuration || 0,
        callProgressDefault: signallingSettingsData.callProgressDefault ?? true,
        tryingTimeout: signallingSettingsData.tryingTimeout || 180000,
        ringingTimeout: signallingSettingsData.ringingTimeout || 180000,
        releaseCauseMapping: signallingSettingsData.releaseCauseMapping || "",
      });
    }
  }, [signallingSettingsData]);

  // Sync monitoring settings from backend
  useEffect(() => {
    if (monitoringSettingsData && Object.keys(monitoringSettingsData).length > 0) {
      setMonitoringData({
        monitoringEnabled: monitoringSettingsData.monitoringEnabled || "none",
        alarmSeverity: monitoringSettingsData.alarmSeverity || "low",
        sendEmailOn: monitoringSettingsData.sendEmailOn || "breach_only",
        recipients: monitoringSettingsData.recipients || "",
      });
    }
  }, [monitoringSettingsData]);

  // Sync codecs from backend (merge with defaults)
  useEffect(() => {
    if (codecsData && codecsData.length > 0) {
      const backendCodecMap = new Map(codecsData.map(c => [c.codecName, c]));
      setCodecs(defaultCodecs.map(dc => {
        const backendCodec = backendCodecMap.get(dc.id);
        if (backendCodec) {
          return {
            ...dc,
            allowed: backendCodec.allowed,
            relayOnly: backendCodec.relayOnly,
            vad: backendCodec.vad,
            ptime: backendCodec.ptime,
          };
        }
        return dc;
      }));
    }
  }, [codecsData]);

  // Mutation to add IP address
  const addIpAddressMutation = useMutation({
    mutationFn: async (data: typeof newIP) => {
      const res = await apiRequest("POST", `/api/interconnects/${interconnectId}/ip-addresses`, {
        ipAddress: data.ip,
        isRange: data.isRange,
        rangeEnd: data.rangeEnd || null,
        addressType: data.addressType,
        includeLastVia: data.includeLastVia,
        isActive: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "ip-addresses"] });
      toast({ title: "IP address added successfully" });
      setShowAddIPDialog(false);
      setNewIP({ ip: "", isRange: false, rangeEnd: "", addressType: "transport", includeLastVia: false });
    },
    onError: () => {
      toast({ title: "Failed to add IP address", variant: "destructive" });
    },
  });

  // Mutation to delete IP address
  const deleteIpAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ip-addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "ip-addresses"] });
      toast({ title: "IP address removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove IP address", variant: "destructive" });
    },
  });

  // Mutation to save validation settings
  const saveValidationMutation = useMutation({
    mutationFn: async (data: typeof validationData) => {
      const res = await apiRequest("PUT", `/api/interconnects/${interconnectId}/validation-settings`, {
        techPrefix: data.techPrefix || null,
        fromUri: data.fromUri || null,
        contactUri: data.contactUri || null,
        trunkGroup: data.trunkGroup || null,
        trunkContext: data.trunkContext || null,
        validateTrunkGroup: data.validateTrunkGroup,
        addressType: data.addressType,
        maxCps: data.maxCps ? parseInt(data.maxCps) : null,
        maxCpsEnabled: data.maxCpsEnabled,
        testSystemControl: data.testSystemControl,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "validation-settings"] });
      toast({ title: "Validation settings saved" });
      setIsEditingValidation(false);
    },
    onError: () => {
      toast({ title: "Failed to save validation settings", variant: "destructive" });
    },
  });

  // Mutation to save translation settings
  const saveTranslationMutation = useMutation({
    mutationFn: async (data: typeof translationData) => {
      const res = await apiRequest("PUT", `/api/interconnects/${interconnectId}/translation-settings`, {
        originationPreference: data.originationPreference,
        originationValidation: data.originationValidation,
        setPaiHeader: data.setPaiHeader,
        globalTranslation: data.globalTranslation || null,
        originTranslation: data.originTranslation || null,
        destinationTranslation: data.destinationTranslation || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "translation-settings"] });
      toast({ title: "Translation settings saved" });
      setIsEditingTranslation(false);
    },
    onError: () => {
      toast({ title: "Failed to save translation settings", variant: "destructive" });
    },
  });

  // Mutation to save media settings (success/error handled in combined save handler)
  const saveMediaMutation = useMutation({
    mutationFn: async (data: typeof mediaData) => {
      const res = await apiRequest("PUT", `/api/interconnects/${interconnectId}/media-settings`, {
        dtmfDetection: data.dtmfDetection,
        mediaRelay: data.mediaRelay,
        mediaNetwork: data.mediaNetwork,
        rtpTimeout: data.rtpTimeout ? parseInt(data.rtpTimeout) : null,
        rtpTimeoutEnabled: data.rtpTimeoutEnabled,
      });
      return res.json();
    },
  });

  // Mutation to save signalling settings
  const saveSignallingMutation = useMutation({
    mutationFn: async (data: typeof signallingData) => {
      const res = await apiRequest("PUT", `/api/interconnects/${interconnectId}/signalling-settings`, {
        privacyMethod: data.privacyMethod,
        sessionTimerEnabled: data.sessionTimerEnabled,
        minSessionTimer: data.minSessionTimer,
        defaultSessionTimer: data.defaultSessionTimer,
        rel100: data.rel100,
        maxCallDurationEnabled: data.maxCallDurationEnabled,
        maxCallDuration: data.maxCallDuration,
        callProgressDefault: data.callProgressDefault,
        tryingTimeout: data.tryingTimeout,
        ringingTimeout: data.ringingTimeout,
        releaseCauseMapping: data.releaseCauseMapping || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "signalling-settings"] });
      toast({ title: "Signalling settings saved" });
      setIsEditingSignalling(false);
    },
    onError: () => {
      toast({ title: "Failed to save signalling settings", variant: "destructive" });
    },
  });

  // Mutation to save monitoring settings
  const saveMonitoringMutation = useMutation({
    mutationFn: async (data: typeof monitoringData) => {
      const res = await apiRequest("PUT", `/api/interconnects/${interconnectId}/monitoring-settings`, {
        monitoringEnabled: data.monitoringEnabled,
        alarmSeverity: data.alarmSeverity,
        sendEmailOn: data.sendEmailOn,
        recipients: data.recipients || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "monitoring-settings"] });
      toast({ title: "Monitoring settings saved" });
      setIsEditingMonitoring(false);
    },
    onError: () => {
      toast({ title: "Failed to save monitoring settings", variant: "destructive" });
    },
  });

  // Mutation to save codecs (success/error handled in combined save handler)
  const saveCodecsMutation = useMutation({
    mutationFn: async (codecsToSave: Codec[]) => {
      const res = await apiRequest("PUT", `/api/interconnects/${interconnectId}/codecs`, {
        codecs: codecsToSave.map((c, index) => ({
          codecName: c.id,
          allowed: c.allowed,
          relayOnly: c.relayOnly,
          vad: c.vad,
          ptime: c.ptime,
          sortOrder: index,
        })),
      });
      return res.json();
    },
  });

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

  const createServiceMutation = useMutation({
    mutationFn: async () => {
      const serviceData = {
        name: newService.name,
        carrierId: carrierId,
        interconnectId: interconnectId,
        ratingPlanId: newService.ratingPlanId || null,
        routingPlanId: newService.routingPlanId || null,
        timeClass: newService.timeClass,
        capacityMode: newService.capacityMode,
        capacityLimit: newService.capacityMode === "capped" ? parseInt(newService.capacityLimit) || null : null,
        allowTranscoding: newService.allowTranscoding,
        enforcementPolicy: newService.enforcementPolicy || null,
        routingMethod: newService.routingMethod,
        routeToInterconnectId: newService.routingMethod === "route_to_interconnect" ? newService.routeToInterconnectId || null : null,
        useTranslationFromSupplier: newService.useTranslationFromSupplier,
        originationTranslation: newService.originationTranslation || null,
        destinationTranslation: newService.destinationTranslation || null,
        originationMatchType: newService.originationMatchType,
        originationMatchListId: newService.originationMatchType === "assign_list" ? newService.originationMatchListId || null : null,
        originationMatchConfig: newService.originationMatchType === "define_matches" ? {
          includeExclude: newService.originationIncludeExclude,
          matches: newService.originationMatches,
          minDigits: parseInt(newService.originationMinDigits) || 0,
          maxDigits: parseInt(newService.originationMaxDigits) || 0,
        } : null,
        destinationMatchType: newService.destinationMatchType,
        destinationMatchListId: newService.destinationMatchType === "assign_list" ? newService.destinationMatchListId || null : null,
        destinationMatchConfig: newService.destinationMatchType === "define_matches" ? {
          includeExclude: newService.destinationIncludeExclude,
          matches: newService.destinationMatches,
          minDigits: parseInt(newService.destinationMinDigits) || 0,
          maxDigits: parseInt(newService.destinationMaxDigits) || 0,
        } : null,
        originationBlacklistId: newService.originationBlacklistId || null,
        originationExceptionsId: newService.originationExceptionsId || null,
        destinationBlacklistId: newService.destinationBlacklistId || null,
        destinationExceptionsId: newService.destinationExceptionsId || null,
      };
      const res = await apiRequest("POST", `/api/carriers/${carrierId}/services`, serviceData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "services"] });
      setShowAddServiceDialog(false);
      resetNewService();
      toast({ title: "Service added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create service", variant: "destructive" });
    },
  });

  const resetNewService = () => {
    setNewService({
      name: "",
      ratingPlanId: "",
      timeClass: "AnyDay",
      capacityMode: "unrestricted",
      capacityLimit: "",
      allowTranscoding: false,
      enforcementPolicy: "",
      routingMethod: "routing_plan",
      routingPlanId: "",
      routeToInterconnectId: "",
      useTranslationFromSupplier: false,
      originationTranslation: "",
      destinationTranslation: "",
      originationMatchType: "any",
      originationIncludeExclude: "including",
      originationMatches: "",
      originationMinDigits: "0",
      originationMaxDigits: "0",
      originationMatchListId: "",
      destinationMatchType: "any",
      destinationIncludeExclude: "including",
      destinationMatches: "",
      destinationMinDigits: "0",
      destinationMaxDigits: "0",
      destinationMatchListId: "",
      originationBlacklistId: "",
      originationExceptionsId: "",
      destinationBlacklistId: "",
      destinationExceptionsId: "",
    });
  };

  const handleAddService = () => {
    createServiceMutation.mutate();
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
    toast({ title: "Service deleted" });
  };

  const handleAddIP = () => {
    addIpAddressMutation.mutate(newIP);
  };

  const handleDeleteIP = (id: string) => {
    deleteIpAddressMutation.mutate(id);
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
            onClick={() => setLocation(isSoftswitchRoute ? `/admin/softswitch/carriers/${carrierId}` : `/admin/wholesale/partners/${carrierId}`)} 
            data-testid="button-back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span 
                className="cursor-pointer hover:underline text-primary"
                onClick={() => setLocation("/admin/softswitch/carriers")}
              >
                Carrier Management
              </span>
              <span>/</span>
              <span 
                className="cursor-pointer hover:underline text-primary"
                onClick={() => setLocation(isSoftswitchRoute ? `/admin/softswitch/carriers/${carrierId}` : `/admin/wholesale/partners/${carrierId}`)}
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
        <div className="border-b px-4 overflow-x-auto">
          <TabsList className="h-12 w-max">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} data-testid={`tab-${tab.id}`}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Details Tab */}
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

          {/* Services Tab */}
          <TabsContent value="services" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-xl">Services</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button data-testid="button-services-actions">
                      Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAddServiceDialog(true)} data-testid="menu-add-service">
                      <Plus className="mr-2 h-4 w-4" /> Add Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No services configured for this interconnect. Click Actions &gt; Add Service to create one.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary">
                        <TableHead className="text-primary-foreground">Name</TableHead>
                        <TableHead className="text-primary-foreground">Customer Rating Plan</TableHead>
                        <TableHead className="text-primary-foreground">Routing Plan</TableHead>
                        <TableHead className="text-primary-foreground">Currency</TableHead>
                        <TableHead className="text-primary-foreground">Capacity</TableHead>
                        <TableHead className="text-primary-foreground">Status</TableHead>
                        <TableHead className="text-primary-foreground w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id} data-testid={`row-service-${service.id}`}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>{service.customerRatingPlan || "-"}</TableCell>
                          <TableCell>{service.routingPlan || "-"}</TableCell>
                          <TableCell>{service.currency}</TableCell>
                          <TableCell>{service.capacity}</TableCell>
                          <TableCell>
                            <Badge className={service.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                              {service.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" data-testid={`button-edit-service-${service.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteService(service.id)}
                                data-testid={`button-delete-service-${service.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingress Validation Tab */}
          <TabsContent value="ingress-validation" className="mt-0">
            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-base">Call Validation</CardTitle>
                  {!isEditingValidation && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingValidation(true)} data-testid="button-edit-validation">
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tech Prefix</span>
                      {isEditingValidation ? (
                        <Input
                          value={validationData.techPrefix}
                          onChange={(e) => setValidationData({ ...validationData, techPrefix: e.target.value })}
                          placeholder="e.g., 1234"
                          data-testid="input-tech-prefix"
                        />
                      ) : (
                        <span className="text-sm font-mono">{validationData.techPrefix || "-"}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">From URI</span>
                      {isEditingValidation ? (
                        <Input
                          value={validationData.fromUri}
                          onChange={(e) => setValidationData({ ...validationData, fromUri: e.target.value })}
                          placeholder="e.g., %sip.example.com"
                          data-testid="input-from-uri"
                        />
                      ) : (
                        <span className="text-sm font-mono">{validationData.fromUri || "-"}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Contact URI</span>
                      {isEditingValidation ? (
                        <Input
                          value={validationData.contactUri}
                          onChange={(e) => setValidationData({ ...validationData, contactUri: e.target.value })}
                          placeholder="e.g., %sip.example.com"
                          data-testid="input-contact-uri"
                        />
                      ) : (
                        <span className="text-sm font-mono">{validationData.contactUri || "-"}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                      <span className="text-sm text-muted-foreground pt-2">Trunk Group</span>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={validationData.validateTrunkGroup}
                            onCheckedChange={(checked) => setValidationData({ ...validationData, validateTrunkGroup: !!checked })}
                            disabled={!isEditingValidation}
                          />
                          <span className="text-sm">Validate</span>
                        </div>
                        {isEditingValidation && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={validationData.trunkGroup}
                              onChange={(e) => setValidationData({ ...validationData, trunkGroup: e.target.value })}
                              placeholder="Trunk Group"
                            />
                            <Input
                              value={validationData.trunkContext}
                              onChange={(e) => setValidationData({ ...validationData, trunkContext: e.target.value })}
                              placeholder="Trunk Context"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditingValidation && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => saveValidationMutation.mutate(validationData)} 
                        disabled={saveValidationMutation.isPending}
                      >
                        {saveValidationMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingValidation(false)}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-base">IP Addresses</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowAddIPDialog(true)} data-testid="button-add-ip">
                    <Plus className="mr-1 h-4 w-4" /> Add IP
                  </Button>
                </CardHeader>
                <CardContent>
                  {ipAddresses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 text-sm">
                      No IP addresses configured. Click Add IP to add one.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary">
                          <TableHead className="text-primary-foreground">IP Address</TableHead>
                          <TableHead className="text-primary-foreground">Type</TableHead>
                          <TableHead className="text-primary-foreground text-center">Active</TableHead>
                          <TableHead className="text-primary-foreground w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ipAddresses.map((addr) => (
                          <TableRow key={addr.id}>
                            <TableCell className="font-mono text-sm">
                              {addr.isRange ? `${addr.ip} - ${addr.rangeEnd}` : addr.ip}
                            </TableCell>
                            <TableCell className="text-sm">{addr.addressType === "transport" ? "Transport Address" : "Via Address"}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={addr.active} disabled />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteIP(addr.id)}
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
            </div>

            {/* Ingress Options Card - Full Width */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-base">Ingress Options</CardTitle>
                {!isEditingValidation && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingValidation(true)} data-testid="button-edit-ingress-options">
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-[180px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Address Type</span>
                    {isEditingValidation ? (
                      <Select
                        value={validationData.addressType}
                        onValueChange={(v) => setValidationData({ ...validationData, addressType: v })}
                      >
                        <SelectTrigger data-testid="select-address-type" className="w-56">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="via">Via Address</SelectItem>
                          <SelectItem value="transport">Transport address</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{validationData.addressType === "via" ? "Via Address" : "Transport address"}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[180px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Max Calls Per Second</span>
                    <div className="flex items-center gap-3">
                      {isEditingValidation ? (
                        <>
                          <Input
                            type="number"
                            value={validationData.maxCps}
                            onChange={(e) => setValidationData({ ...validationData, maxCps: e.target.value })}
                            className="w-32"
                            placeholder="CPS"
                            disabled={!validationData.maxCpsEnabled}
                          />
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={!validationData.maxCpsEnabled}
                              onCheckedChange={(checked) => setValidationData({ ...validationData, maxCpsEnabled: !checked })}
                              data-testid="checkbox-unlimited-cps"
                            />
                            <span className="text-sm">Unlimited</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm">{validationData.maxCpsEnabled ? validationData.maxCps : "-"}</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-[180px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Test System Control</span>
                    {isEditingValidation ? (
                      <Select
                        value={validationData.testSystemControl}
                        onValueChange={(v) => setValidationData({ ...validationData, testSystemControl: v })}
                      >
                        <SelectTrigger data-testid="select-test-system-control" className="w-56">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="allow">Allow</SelectItem>
                          <SelectItem value="dont_allow">Don't Allow</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{validationData.testSystemControl === "dont_allow" ? "Don't Allow" : "Allow"}</span>
                    )}
                  </div>
                </div>

                {isEditingValidation && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => saveValidationMutation.mutate(validationData)} 
                      disabled={saveValidationMutation.isPending}
                    >
                      {saveValidationMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingValidation(false)}>Cancel</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingress Translation Tab */}
          <TabsContent value="ingress-translation" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-base">Ingress Parameter Manipulation</CardTitle>
                {!isEditingTranslation && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingTranslation(true)} data-testid="button-edit-translation">
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Origination Settings</h4>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Origination Preference</span>
                      {isEditingTranslation ? (
                        <Select
                          value={translationData.originationPreference}
                          onValueChange={(v) => setTranslationData({ ...translationData, originationPreference: v })}
                        >
                          <SelectTrigger data-testid="select-origination-preference">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pai_then_from">PAI then From</SelectItem>
                            <SelectItem value="from_then_pai">From then PAI</SelectItem>
                            <SelectItem value="from">From only</SelectItem>
                            <SelectItem value="pai">PAI only</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">
                          {translationData.originationPreference === "pai_then_from" ? "PAI then From" :
                           translationData.originationPreference === "from_then_pai" ? "From then PAI" :
                           translationData.originationPreference === "from" ? "From only" : "PAI only"}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Origination Validation</span>
                      {isEditingTranslation ? (
                        <Select
                          value={translationData.originationValidation}
                          onValueChange={(v) => setTranslationData({ ...translationData, originationValidation: v })}
                        >
                          <SelectTrigger data-testid="select-origination-validation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="e164">E.164 Format</SelectItem>
                            <SelectItem value="nanpa">NANPA Format</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{translationData.originationValidation === "none" ? "Not Checked" : translationData.originationValidation}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Set PAI Header</span>
                      {isEditingTranslation ? (
                        <Select
                          value={translationData.setPaiHeader}
                          onValueChange={(v) => setTranslationData({ ...translationData, setPaiHeader: v })}
                        >
                          <SelectTrigger data-testid="select-set-pai">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="always">Always Generate</SelectItem>
                            <SelectItem value="if_missing">If Missing</SelectItem>
                            <SelectItem value="from_to_and_destination">From To & Destination</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{translationData.setPaiHeader === "none" ? "None" : translationData.setPaiHeader}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Number Translation</h4>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Global Translation</span>
                      {isEditingTranslation ? (
                        <Select
                          value={translationData.globalTranslation || "none"}
                          onValueChange={(v) => setTranslationData({ ...translationData, globalTranslation: v === "none" ? "" : v })}
                        >
                          <SelectTrigger data-testid="select-global-translation">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="strip_plus">Strip + Prefix</SelectItem>
                            <SelectItem value="strip_00">Strip 00 Prefix</SelectItem>
                            <SelectItem value="add_plus">Add + Prefix</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{translationData.globalTranslation || "None"}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Origin Translation</span>
                      {isEditingTranslation ? (
                        <Input
                          value={translationData.originTranslation}
                          onChange={(e) => setTranslationData({ ...translationData, originTranslation: e.target.value })}
                          placeholder="e.g., ^\\+(.*)$|\\1"
                          data-testid="input-origin-translation"
                        />
                      ) : (
                        <span className="text-sm font-mono">{translationData.originTranslation || "-"}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Destination Translation</span>
                      {isEditingTranslation ? (
                        <Input
                          value={translationData.destinationTranslation}
                          onChange={(e) => setTranslationData({ ...translationData, destinationTranslation: e.target.value })}
                          placeholder="e.g., ^\\+(.*)$|\\1"
                          data-testid="input-destination-translation"
                        />
                      ) : (
                        <span className="text-sm font-mono">{translationData.destinationTranslation || "-"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {isEditingTranslation && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => saveTranslationMutation.mutate(translationData)} 
                      disabled={saveTranslationMutation.isPending}
                    >
                      {saveTranslationMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingTranslation(false)}>Cancel</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="mt-0">
            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-base">Codecs</CardTitle>
                  {!isEditingMedia && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingMedia(true)} data-testid="button-edit-media">
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary">
                        {isEditingMedia && <TableHead className="text-primary-foreground w-10"></TableHead>}
                        <TableHead className="text-primary-foreground">Codec</TableHead>
                        <TableHead className="text-primary-foreground text-center">Allow</TableHead>
                        <TableHead className="text-primary-foreground text-center">VAD</TableHead>
                        <TableHead className="text-primary-foreground text-center">ptime</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codecs.map((codec) => (
                        <TableRow key={codec.id}>
                          {isEditingMedia && (
                            <TableCell>
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{codec.name}</span>
                              {codec.relayOnly && (
                                <Badge variant="secondary" className="text-xs">Relay Only</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={codec.allowed}
                              onCheckedChange={(checked) => {
                                if (isEditingMedia) {
                                  setCodecs(codecs.map(c => c.id === codec.id ? { ...c, allowed: !!checked } : c));
                                }
                              }}
                              disabled={!isEditingMedia}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={codec.vad}
                              onCheckedChange={(checked) => {
                                if (isEditingMedia) {
                                  setCodecs(codecs.map(c => c.id === codec.id ? { ...c, vad: !!checked } : c));
                                }
                              }}
                              disabled={!isEditingMedia || codec.relayOnly}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {isEditingMedia && !codec.relayOnly ? (
                              <Select
                                value={codec.ptime.toString()}
                                onValueChange={(v) => setCodecs(codecs.map(c => c.id === codec.id ? { ...c, ptime: parseInt(v) } : c))}
                              >
                                <SelectTrigger className="w-16 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="30">30</SelectItem>
                                  <SelectItem value="40">40</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm">{codec.ptime}ms</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {isEditingMedia && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={async () => {
                          try {
                            await Promise.all([
                              saveCodecsMutation.mutateAsync(codecs),
                              saveMediaMutation.mutateAsync(mediaData),
                            ]);
                            // Only show success and exit edit mode if both succeed
                            queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "codecs"] });
                            queryClient.invalidateQueries({ queryKey: ["/api/interconnects", interconnectId, "media-settings"] });
                            toast({ title: "Media settings saved" });
                            setIsEditingMedia(false);
                          } catch {
                            toast({ title: "Failed to save media settings", variant: "destructive" });
                          }
                        }} 
                        disabled={saveCodecsMutation.isPending || saveMediaMutation.isPending}
                      >
                        {(saveCodecsMutation.isPending || saveMediaMutation.isPending) ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingMedia(false)}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Media Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">DTMF Detection</span>
                    {isEditingMedia ? (
                      <Select
                        value={mediaData.dtmfDetection}
                        onValueChange={(v) => setMediaData({ ...mediaData, dtmfDetection: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rfc2833">RFC 2833</SelectItem>
                          <SelectItem value="inband">Inband</SelectItem>
                          <SelectItem value="sip_info">SIP INFO</SelectItem>
                          <SelectItem value="auto">Auto Detect</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{mediaData.dtmfDetection.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Media Relay</span>
                    {isEditingMedia ? (
                      <Select
                        value={mediaData.mediaRelay}
                        onValueChange={(v) => setMediaData({ ...mediaData, mediaRelay: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">Always</SelectItem>
                          <SelectItem value="never">Never (Direct RTP)</SelectItem>
                          <SelectItem value="on_transcoding">On Transcoding</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{mediaData.mediaRelay === "always" ? "Always" : mediaData.mediaRelay === "never" ? "Never (Direct RTP)" : "On Transcoding"}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Media Network</span>
                    <span className="text-sm">Same as Signalling</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">RTP Timeout</span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={mediaData.rtpTimeoutEnabled}
                        onCheckedChange={(checked) => setMediaData({ ...mediaData, rtpTimeoutEnabled: !!checked })}
                        disabled={!isEditingMedia}
                      />
                      {isEditingMedia && mediaData.rtpTimeoutEnabled ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={mediaData.rtpTimeout}
                            onChange={(e) => setMediaData({ ...mediaData, rtpTimeout: e.target.value })}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">seconds</span>
                        </div>
                      ) : (
                        <span className="text-sm">{mediaData.rtpTimeoutEnabled ? `${mediaData.rtpTimeout} seconds` : "Disabled"}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Signalling Tab */}
          <TabsContent value="signalling" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-base">Signalling Configuration</CardTitle>
                {!isEditingSignalling && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSignalling(true)} data-testid="button-edit-signalling">
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Privacy & Identity</h4>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Privacy Method</span>
                      {isEditingSignalling ? (
                        <Select
                          value={signallingData.privacyMethod}
                          onValueChange={(v) => setSignallingData({ ...signallingData, privacyMethod: v })}
                        >
                          <SelectTrigger data-testid="select-privacy-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rfc3261">RFC 3261</SelectItem>
                            <SelectItem value="remote_party_id">Remote Party ID</SelectItem>
                            <SelectItem value="rfc3325">RFC 3325 (P-Asserted Identity)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">
                          {signallingData.privacyMethod === "rfc3261" ? "RFC 3261" :
                           signallingData.privacyMethod === "remote_party_id" ? "Remote Party ID" :
                           "RFC 3325 (P-Asserted Identity)"}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">100rel</span>
                      {isEditingSignalling ? (
                        <Select
                          value={signallingData.rel100}
                          onValueChange={(v) => setSignallingData({ ...signallingData, rel100: v })}
                        >
                          <SelectTrigger data-testid="select-100rel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="supported">Supported</SelectItem>
                            <SelectItem value="required">Required</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm capitalize">{signallingData.rel100}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Session Timer</h4>
                    <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                      <span className="text-sm text-muted-foreground">Enabled</span>
                      <Switch
                        checked={signallingData.sessionTimerEnabled}
                        onCheckedChange={(checked) => setSignallingData({ ...signallingData, sessionTimerEnabled: checked })}
                        disabled={!isEditingSignalling}
                      />
                    </div>
                    {signallingData.sessionTimerEnabled && (
                      <>
                        <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                          <span className="text-sm text-muted-foreground">Min Session Timer</span>
                          {isEditingSignalling ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={signallingData.minSessionTimer}
                                onChange={(e) => setSignallingData({ ...signallingData, minSessionTimer: parseInt(e.target.value) || 90 })}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">sec</span>
                            </div>
                          ) : (
                            <span className="text-sm">{signallingData.minSessionTimer} sec</span>
                          )}
                        </div>
                        <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                          <span className="text-sm text-muted-foreground">Default Session Timer</span>
                          {isEditingSignalling ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={signallingData.defaultSessionTimer}
                                onChange={(e) => setSignallingData({ ...signallingData, defaultSessionTimer: parseInt(e.target.value) || 1800 })}
                                className="w-24"
                              />
                              <span className="text-sm text-muted-foreground">sec</span>
                            </div>
                          ) : (
                            <span className="text-sm">{signallingData.defaultSessionTimer} sec</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Call Duration</h4>
                      <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                        <span className="text-sm text-muted-foreground">Max Call Duration</span>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={!signallingData.maxCallDurationEnabled}
                            onCheckedChange={(checked) => setSignallingData({ ...signallingData, maxCallDurationEnabled: !checked })}
                            disabled={!isEditingSignalling}
                          />
                          <span className="text-sm">No Limit</span>
                          {signallingData.maxCallDurationEnabled && isEditingSignalling && (
                            <div className="flex items-center gap-1 ml-2">
                              <Input
                                type="number"
                                value={signallingData.maxCallDuration}
                                onChange={(e) => setSignallingData({ ...signallingData, maxCallDuration: parseInt(e.target.value) || 0 })}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Call Progress Timers</h4>
                      <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                        <span className="text-sm text-muted-foreground">Use Default</span>
                        <Switch
                          checked={signallingData.callProgressDefault}
                          onCheckedChange={(checked) => setSignallingData({ ...signallingData, callProgressDefault: checked })}
                          disabled={!isEditingSignalling}
                        />
                      </div>
                      {!signallingData.callProgressDefault && (
                        <>
                          <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                            <span className="text-sm text-muted-foreground">Trying Timeout</span>
                            {isEditingSignalling ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={signallingData.tryingTimeout}
                                  onChange={(e) => setSignallingData({ ...signallingData, tryingTimeout: parseInt(e.target.value) || 0 })}
                                  className="w-28"
                                />
                                <span className="text-sm text-muted-foreground">ms</span>
                              </div>
                            ) : (
                              <span className="text-sm">{signallingData.tryingTimeout} ms</span>
                            )}
                          </div>
                          <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                            <span className="text-sm text-muted-foreground">Ringing Timeout</span>
                            {isEditingSignalling ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={signallingData.ringingTimeout}
                                  onChange={(e) => setSignallingData({ ...signallingData, ringingTimeout: parseInt(e.target.value) || 0 })}
                                  className="w-28"
                                />
                                <span className="text-sm text-muted-foreground">ms</span>
                              </div>
                            ) : (
                              <span className="text-sm">{signallingData.ringingTimeout} ms</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-[160px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Release Cause Mapping</span>
                    {isEditingSignalling ? (
                      <Select
                        value={signallingData.releaseCauseMapping || "none"}
                        onValueChange={(v) => setSignallingData({ ...signallingData, releaseCauseMapping: v === "none" ? "" : v })}
                      >
                        <SelectTrigger className="w-64" data-testid="select-release-cause">
                          <SelectValue placeholder="Select mapping group..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="default">Default Mapping</SelectItem>
                          <SelectItem value="strict">Strict Mapping</SelectItem>
                          <SelectItem value="carrier_specific">Carrier Specific</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{signallingData.releaseCauseMapping || "None"}</span>
                    )}
                  </div>
                </div>

                {isEditingSignalling && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => saveSignallingMutation.mutate(signallingData)} 
                      disabled={saveSignallingMutation.isPending}
                    >
                      {saveSignallingMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingSignalling(false)}>Cancel</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Egress Routing Tab (Supplier) */}
          <TabsContent value="egress-routing" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Egress Routing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Egress routing configuration for outbound traffic to this supplier.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Egress Translations Tab (Supplier) */}
          <TabsContent value="egress-translations" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Egress Translations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Egress translation rules for outbound traffic.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab (Supplier) */}
          <TabsContent value="monitoring" className="mt-0">
            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-base font-medium">Supplier Availability Monitoring</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-[160px_1fr_auto] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Monitoring Enabled</span>
                    {isEditingMonitoring ? (
                      <Select
                        value={monitoringData.monitoringEnabled}
                        onValueChange={(v) => setMonitoringData({ ...monitoringData, monitoringEnabled: v })}
                      >
                        <SelectTrigger data-testid="select-monitoring-enabled">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sip_options">SIP OPTIONS</SelectItem>
                          <SelectItem value="call_response">Call Response</SelectItem>
                          <SelectItem value="sip_options_and_call_response">SIP OPTIONS & Call Response</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm font-medium">
                        {monitoringData.monitoringEnabled === "none" ? "None" :
                         monitoringData.monitoringEnabled === "sip_options" ? "SIP OPTIONS" :
                         monitoringData.monitoringEnabled === "call_response" ? "Call Response" :
                         monitoringData.monitoringEnabled === "sip_options_and_call_response" ? "SIP OPTIONS & Call Response" : "None"}
                      </span>
                    )}
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs cursor-help" title="Monitoring type determines how the system checks supplier availability">
                      i
                    </div>
                  </div>
                  {!isEditingMonitoring && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingMonitoring(true)} data-testid="button-edit-monitoring">
                      Edit
                    </Button>
                  )}
                  {isEditingMonitoring && (
                    <div className="flex gap-2">
                      <Button onClick={() => saveMonitoringMutation.mutate(monitoringData)} disabled={saveMonitoringMutation.isPending} data-testid="button-save-monitoring">
                        {saveMonitoringMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingMonitoring(false)}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                  <CardTitle className="text-base font-medium">Monitoring Alarm</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Alarm Severity</span>
                    {isEditingMonitoring ? (
                      <Select
                        value={monitoringData.alarmSeverity}
                        onValueChange={(v) => setMonitoringData({ ...monitoringData, alarmSeverity: v })}
                      >
                        <SelectTrigger data-testid="select-alarm-severity">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm font-medium capitalize">{monitoringData.alarmSeverity}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Send Email on</span>
                    {isEditingMonitoring ? (
                      <Select
                        value={monitoringData.sendEmailOn}
                        onValueChange={(v) => setMonitoringData({ ...monitoringData, sendEmailOn: v })}
                      >
                        <SelectTrigger data-testid="select-send-email-on">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breach_only">Breach Only</SelectItem>
                          <SelectItem value="breach_and_clear">Breach And Clear</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm font-medium">
                        {monitoringData.sendEmailOn === "breach_only" ? "Breach Only" : "Breach And Clear"}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                    <span className="text-sm text-muted-foreground pt-2">Recipients</span>
                    <div className="space-y-1">
                      {isEditingMonitoring ? (
                        <Input
                          value={monitoringData.recipients}
                          onChange={(e) => setMonitoringData({ ...monitoringData, recipients: e.target.value })}
                          placeholder="email1@example.com, email2@example.com"
                          data-testid="input-recipients"
                        />
                      ) : (
                        <span className="text-sm font-medium">{monitoringData.recipients || "—"}</span>
                      )}
                      <p className="text-xs text-muted-foreground">Multiple e-mail addresses must be separated with a comma character (",")</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Add Service Dialog - Digitalk Style */}
      <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-8 py-4">
            {/* Left Column - Service Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Service Details</h4>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Name</span>
                <Input
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Enter service name"
                  data-testid="input-service-name"
                />
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Customer Rating Plan</span>
                <Select
                  value={newService.ratingPlanId}
                  onValueChange={(v) => setNewService({ ...newService, ratingPlanId: v })}
                >
                  <SelectTrigger data-testid="select-rating-plan">
                    <SelectValue placeholder="Select rating plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Rate Plan</SelectItem>
                    <SelectItem value="premium">Premium Rate Plan</SelectItem>
                    <SelectItem value="wholesale">Wholesale Rate Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Time Class</span>
                <Select
                  value={newService.timeClass}
                  onValueChange={(v) => setNewService({ ...newService, timeClass: v })}
                >
                  <SelectTrigger data-testid="select-time-class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AnyDay">AnyDay</SelectItem>
                    <SelectItem value="Weekday">Weekday</SelectItem>
                    <SelectItem value="Weekend">Weekend</SelectItem>
                    <SelectItem value="PeakHours">Peak Hours</SelectItem>
                    <SelectItem value="OffPeak">Off Peak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Capacity</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newService.capacityLimit}
                    onChange={(e) => setNewService({ ...newService, capacityLimit: e.target.value, capacityMode: e.target.value ? "capped" : "unrestricted" })}
                    placeholder="Channels"
                    className="w-24"
                    disabled={newService.capacityMode === "unrestricted"}
                    data-testid="input-capacity-limit"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <Checkbox
                      checked={newService.capacityMode === "unrestricted"}
                      onCheckedChange={(checked) => setNewService({ ...newService, capacityMode: checked ? "unrestricted" : "capped", capacityLimit: checked ? "" : newService.capacityLimit })}
                      data-testid="checkbox-unrestricted"
                    />
                    Unrestricted
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Allow Transcoding</span>
                <Select
                  value={newService.allowTranscoding ? "yes" : "no"}
                  onValueChange={(v) => setNewService({ ...newService, allowTranscoding: v === "yes" })}
                >
                  <SelectTrigger data-testid="select-transcoding">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Enforcement Policy</span>
                <Select
                  value={newService.enforcementPolicy || "none"}
                  onValueChange={(v) => setNewService({ ...newService, enforcementPolicy: v === "none" ? "" : v })}
                >
                  <SelectTrigger data-testid="select-enforcement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Routing Section */}
              <h4 className="font-semibold text-sm border-b pb-2 mt-6">Routing</h4>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Routing Method</span>
                <Select
                  value={newService.routingMethod}
                  onValueChange={(v: "routing_plan" | "route_to_interconnect") => setNewService({ ...newService, routingMethod: v })}
                >
                  <SelectTrigger data-testid="select-routing-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routing_plan">Routing Plan</SelectItem>
                    <SelectItem value="route_to_interconnect">Route to Interconnect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newService.routingMethod === "routing_plan" && (
                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-sm text-muted-foreground">Routing Plan</span>
                  <Select
                    value={newService.routingPlanId}
                    onValueChange={(v) => setNewService({ ...newService, routingPlanId: v })}
                  >
                    <SelectTrigger data-testid="select-routing-plan">
                      <SelectValue placeholder="Select routing plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lcr">LCR Routing</SelectItem>
                      <SelectItem value="quality">Quality Routing</SelectItem>
                      <SelectItem value="direct">Direct Routing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {newService.routingMethod === "route_to_interconnect" && (
                <>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Carrier Interconnect</span>
                    <Select
                      value={newService.routeToInterconnectId}
                      onValueChange={(v) => setNewService({ ...newService, routeToInterconnectId: v })}
                    >
                      <SelectTrigger data-testid="select-carrier-interconnect">
                        <SelectValue placeholder="Select supplier interconnect..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder">Select from available suppliers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground"></span>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newService.useTranslationFromSupplier}
                        onCheckedChange={(checked) => setNewService({ ...newService, useTranslationFromSupplier: !!checked })}
                        data-testid="checkbox-use-translation"
                      />
                      Use Translation From Supplier
                    </label>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Origination Translation</span>
                    <Input
                      value={newService.originationTranslation}
                      onChange={(e) => setNewService({ ...newService, originationTranslation: e.target.value })}
                      placeholder="%"
                      data-testid="input-orig-translation"
                    />
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Destination Translation</span>
                    <Input
                      value={newService.destinationTranslation}
                      onChange={(e) => setNewService({ ...newService, destinationTranslation: e.target.value })}
                      placeholder="%"
                      data-testid="input-dest-translation"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Matching */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Origination Matching</h4>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Origination</span>
                <Select
                  value={newService.originationMatchType}
                  onValueChange={(v: "any" | "define_matches" | "assign_list") => setNewService({ ...newService, originationMatchType: v })}
                >
                  <SelectTrigger data-testid="select-orig-match-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="define_matches">Define Matches</SelectItem>
                    <SelectItem value="assign_list">Assign List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newService.originationMatchType === "define_matches" && (
                <>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground"></span>
                    <Select
                      value={newService.originationIncludeExclude}
                      onValueChange={(v: "including" | "excluding") => setNewService({ ...newService, originationIncludeExclude: v })}
                    >
                      <SelectTrigger data-testid="select-orig-include-exclude">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="including">Including</SelectItem>
                        <SelectItem value="excluding">Excluding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-start gap-2">
                    <span className="text-sm text-muted-foreground pt-2">Matches</span>
                    <textarea
                      value={newService.originationMatches}
                      onChange={(e) => setNewService({ ...newService, originationMatches: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Enter patterns, one per line"
                      data-testid="textarea-orig-matches"
                    />
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Min Digits</span>
                    <Input
                      type="number"
                      value={newService.originationMinDigits}
                      onChange={(e) => setNewService({ ...newService, originationMinDigits: e.target.value })}
                      data-testid="input-orig-min-digits"
                    />
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Max Digits</span>
                    <Input
                      type="number"
                      value={newService.originationMaxDigits}
                      onChange={(e) => setNewService({ ...newService, originationMaxDigits: e.target.value })}
                      data-testid="input-orig-max-digits"
                    />
                  </div>
                </>
              )}
              {newService.originationMatchType === "assign_list" && (
                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-sm text-muted-foreground">Matches</span>
                  <Select
                    value={newService.originationMatchListId}
                    onValueChange={(v) => setNewService({ ...newService, originationMatchListId: v })}
                  >
                    <SelectTrigger data-testid="select-orig-match-list">
                      <SelectValue placeholder="Select match list..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder">No match lists available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <h4 className="font-semibold text-sm border-b pb-2 mt-6">Destination Matching</h4>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Destination Matching</span>
                <Select
                  value={newService.destinationMatchType}
                  onValueChange={(v: "any" | "define_matches" | "assign_list") => setNewService({ ...newService, destinationMatchType: v })}
                >
                  <SelectTrigger data-testid="select-dest-match-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="define_matches">Define Matches</SelectItem>
                    <SelectItem value="assign_list">Assign List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newService.destinationMatchType === "define_matches" && (
                <>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground"></span>
                    <Select
                      value={newService.destinationIncludeExclude}
                      onValueChange={(v: "including" | "excluding") => setNewService({ ...newService, destinationIncludeExclude: v })}
                    >
                      <SelectTrigger data-testid="select-dest-include-exclude">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="including">Including</SelectItem>
                        <SelectItem value="excluding">Excluding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-start gap-2">
                    <span className="text-sm text-muted-foreground pt-2">Matches</span>
                    <textarea
                      value={newService.destinationMatches}
                      onChange={(e) => setNewService({ ...newService, destinationMatches: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Enter patterns, one per line"
                      data-testid="textarea-dest-matches"
                    />
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Min Digits</span>
                    <Input
                      type="number"
                      value={newService.destinationMinDigits}
                      onChange={(e) => setNewService({ ...newService, destinationMinDigits: e.target.value })}
                      data-testid="input-dest-min-digits"
                    />
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                    <span className="text-sm text-muted-foreground">Max Digits</span>
                    <Input
                      type="number"
                      value={newService.destinationMaxDigits}
                      onChange={(e) => setNewService({ ...newService, destinationMaxDigits: e.target.value })}
                      data-testid="input-dest-max-digits"
                    />
                  </div>
                </>
              )}
              {newService.destinationMatchType === "assign_list" && (
                <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                  <span className="text-sm text-muted-foreground">Matches</span>
                  <Select
                    value={newService.destinationMatchListId}
                    onValueChange={(v) => setNewService({ ...newService, destinationMatchListId: v })}
                  >
                    <SelectTrigger data-testid="select-dest-match-list">
                      <SelectValue placeholder="Select match list..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder">No match lists available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Blacklisting Section */}
              <h4 className="font-semibold text-sm border-b pb-2 mt-6">Blacklisting</h4>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Global Blacklist</span>
                <span className="text-sm font-medium">None</span>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Origination Blacklist</span>
                <Select
                  value={newService.originationBlacklistId || "none"}
                  onValueChange={(v) => setNewService({ ...newService, originationBlacklistId: v === "none" ? "" : v })}
                >
                  <SelectTrigger data-testid="select-orig-blacklist">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Origination Exceptions</span>
                <Select
                  value={newService.originationExceptionsId || "none"}
                  onValueChange={(v) => setNewService({ ...newService, originationExceptionsId: v === "none" ? "" : v })}
                >
                  <SelectTrigger data-testid="select-orig-exceptions">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Destination Blacklist</span>
                <Select
                  value={newService.destinationBlacklistId || "none"}
                  onValueChange={(v) => setNewService({ ...newService, destinationBlacklistId: v === "none" ? "" : v })}
                >
                  <SelectTrigger data-testid="select-dest-blacklist">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[130px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Destination Exceptions</span>
                <Select
                  value={newService.destinationExceptionsId || "none"}
                  onValueChange={(v) => setNewService({ ...newService, destinationExceptionsId: v === "none" ? "" : v })}
                >
                  <SelectTrigger data-testid="select-dest-exceptions">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddServiceDialog(false); resetNewService(); }}>Cancel</Button>
            <Button onClick={handleAddService} disabled={!newService.name || createServiceMutation.isPending} data-testid="button-save-service">
              {createServiceMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add IP Dialog */}
      <Dialog open={showAddIPDialog} onOpenChange={setShowAddIPDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add IP Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="text-sm font-medium">IP Address</span>
              <Input
                value={newIP.ip}
                onChange={(e) => setNewIP({ ...newIP, ip: e.target.value })}
                placeholder="e.g., 192.168.1.1"
                data-testid="input-ip-address"
              />
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="text-sm font-medium">Range</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={newIP.isRange}
                  onCheckedChange={(checked) => setNewIP({ ...newIP, isRange: !!checked })}
                />
                {newIP.isRange && (
                  <Input
                    value={newIP.rangeEnd}
                    onChange={(e) => setNewIP({ ...newIP, rangeEnd: e.target.value })}
                    placeholder="End IP"
                    className="w-40"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <span className="text-sm font-medium">Address Type</span>
              <Select
                value={newIP.addressType}
                onValueChange={(v: "transport" | "via") => setNewIP({ ...newIP, addressType: v })}
              >
                <SelectTrigger data-testid="select-address-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transport">Transport Address</SelectItem>
                  <SelectItem value="via">Via Address</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newIP.addressType === "via" && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium">Include Last Via</span>
                <Checkbox
                  checked={newIP.includeLastVia}
                  onCheckedChange={(checked) => setNewIP({ ...newIP, includeLastVia: !!checked })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddIPDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleAddIP} 
              disabled={!newIP.ip || addIpAddressMutation.isPending} 
              data-testid="button-save-ip"
            >
              {addIpAddressMutation.isPending ? "Adding..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
