import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Bot, Mic, Brain, GitBranch, Phone, MessageSquare, Clock, CheckCircle,
  ArrowLeft, ArrowRight, Loader2, Sparkles, Volume2, Globe, Users,
  FileText, Zap, Calendar, Shield, Play
} from "lucide-react";

const WIZARD_STEPS = [
  { id: 1, name: "Basic Info", icon: Bot, description: "Name and type" },
  { id: 2, name: "Voice & Personality", icon: Mic, description: "Voice settings" },
  { id: 3, name: "Knowledge Base", icon: Brain, description: "Training data" },
  { id: 4, name: "Conversation Flow", icon: GitBranch, description: "Call scripts" },
  { id: 5, name: "Phone Numbers", icon: Phone, description: "DID assignment" },
  { id: 6, name: "Greeting & Scripts", icon: MessageSquare, description: "Messages" },
  { id: 7, name: "Business Hours", icon: Clock, description: "Schedule" },
  { id: 8, name: "Review & Deploy", icon: CheckCircle, description: "Activate" },
];

const AGENT_TYPES = [
  { value: "inbound", label: "Inbound Support", icon: Phone, description: "Handle incoming customer calls" },
  { value: "outbound", label: "Outbound Sales", icon: Users, description: "Make proactive sales calls" },
  { value: "ivr", label: "IVR Menu", icon: GitBranch, description: "Interactive voice response system" },
  { value: "assistant", label: "Virtual Assistant", icon: Bot, description: "General purpose AI helper" },
];

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy", gender: "Neutral", description: "Warm and conversational" },
  { value: "echo", label: "Echo", gender: "Male", description: "Clear and professional" },
  { value: "fable", label: "Fable", gender: "Male", description: "Expressive storyteller" },
  { value: "onyx", label: "Onyx", gender: "Male", description: "Deep and authoritative" },
  { value: "nova", label: "Nova", gender: "Female", description: "Friendly and upbeat" },
  { value: "shimmer", label: "Shimmer", gender: "Female", description: "Soft and soothing" },
];

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface AgentFormData {
  name: string;
  description: string;
  type: string;
  voice: string;
  language: string;
  personality: string;
  speakingRate: number;
  knowledgeBaseId: string | null;
  flowType: string;
  greetingMessage: string;
  closingMessage: string;
  transferMessage: string;
  voicemailMessage: string;
  phoneNumber: string;
  sipTrunk: string;
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: { day: string; enabled: boolean; start: string; end: string }[];
  };
  maxCallDuration: number;
  enableRecording: boolean;
  enableTranscription: boolean;
}

const defaultFormData: AgentFormData = {
  name: "",
  description: "",
  type: "inbound",
  voice: "nova",
  language: "en-US",
  personality: "professional",
  speakingRate: 1.0,
  knowledgeBaseId: null,
  flowType: "conversational",
  greetingMessage: "Hello! Thank you for calling. How can I help you today?",
  closingMessage: "Thank you for calling. Have a great day!",
  transferMessage: "Please hold while I transfer you to a specialist.",
  voicemailMessage: "We're sorry we missed your call. Please leave a message after the tone.",
  phoneNumber: "",
  sipTrunk: "",
  businessHours: {
    enabled: false,
    timezone: "America/New_York",
    schedule: DAYS_OF_WEEK.map(day => ({
      day,
      enabled: ["Saturday", "Sunday"].includes(day) ? false : true,
      start: "09:00",
      end: "17:00",
    })),
  },
  maxCallDuration: 30,
  enableRecording: true,
  enableTranscription: true,
};

export default function AIVoiceWizard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AgentFormData>(defaultFormData);

  const { data: knowledgeBases = [] } = useQuery<any[]>({
    queryKey: ["/api/my/ai-voice/knowledge-bases"],
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      const apiData = {
        name: data.name,
        description: data.description || null,
        type: data.type,
        voiceId: data.voice,
        voiceProvider: "openai",
        systemPrompt: `You are ${data.name}, a ${data.personality} AI assistant. Language: ${data.language}. Speaking rate: ${data.speakingRate}x.`,
        greetingMessage: data.greetingMessage,
        fallbackMessage: data.closingMessage,
        maxCallDuration: data.maxCallDuration * 60,
      };
      const res = await apiRequest("POST", "/api/my/ai-voice/agents", apiData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents"] });
      toast({ title: "Agent created successfully!" });
      navigate("/portal/ai-agent");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create agent", description: error.message, variant: "destructive" });
    },
  });

  const updateField = (field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Agent name is required";
    }
    if (formData.name.trim().length < 2) {
      return "Agent name must be at least 2 characters";
    }
    if (!formData.type) {
      return "Agent type is required";
    }
    if (!formData.voice) {
      return "Voice selection is required";
    }
    return null;
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      toast({ title: "Validation Error", description: error, variant: "destructive" });
      return;
    }
    createAgentMutation.mutate(formData);
  };

  const progress = (currentStep / 8) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Customer Support Bot"
                data-testid="input-agent-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe what this agent does..."
                data-testid="input-agent-description"
              />
            </div>
            <div className="space-y-3">
              <Label>Agent Type *</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {AGENT_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      formData.type === type.value ? "ring-2 ring-primary" : "hover-elevate"
                    }`}
                    onClick={() => updateField("type", type.value)}
                    data-testid={`card-agent-type-${type.value}`}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className={`p-2 rounded-md ${formData.type === type.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Voice Selection *</Label>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {VOICE_OPTIONS.map((voice) => (
                  <Card
                    key={voice.value}
                    className={`cursor-pointer transition-all ${
                      formData.voice === voice.value ? "ring-2 ring-primary" : "hover-elevate"
                    }`}
                    onClick={() => updateField("voice", voice.value)}
                    data-testid={`card-voice-${voice.value}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{voice.label}</span>
                        <Badge variant="outline">{voice.gender}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{voice.description}</p>
                      <Button variant="ghost" size="sm" className="mt-2 w-full" data-testid={`button-preview-${voice.value}`}>
                        <Play className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={formData.language} onValueChange={(v) => updateField("language", v)}>
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Personality Style</Label>
                <Select value={formData.personality} onValueChange={(v) => updateField("personality", v)}>
                  <SelectTrigger data-testid="select-personality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="empathetic">Empathetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Speaking Rate: {formData.speakingRate.toFixed(1)}x</Label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={formData.speakingRate}
                onChange={(e) => updateField("speakingRate", parseFloat(e.target.value))}
                className="w-full"
                data-testid="slider-speaking-rate"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slower (0.5x)</span>
                <span>Normal (1.0x)</span>
                <span>Faster (2.0x)</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Select Knowledge Base</Label>
              <p className="text-sm text-muted-foreground">
                Choose a knowledge base to give your agent context and information
              </p>
              {knowledgeBases.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No knowledge bases available</p>
                    <Button variant="outline" onClick={() => navigate("/portal/ai-voice/knowledge")} data-testid="button-create-kb">
                      Create Knowledge Base
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  <Card
                    className={`cursor-pointer transition-all ${
                      formData.knowledgeBaseId === null ? "ring-2 ring-primary" : "hover-elevate"
                    }`}
                    onClick={() => updateField("knowledgeBaseId", null)}
                    data-testid="card-kb-none"
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="p-2 rounded-md bg-muted">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">No Knowledge Base</p>
                        <p className="text-sm text-muted-foreground">Agent will use general knowledge only</p>
                      </div>
                    </CardContent>
                  </Card>
                  {knowledgeBases.map((kb: any) => (
                    <Card
                      key={kb.id}
                      className={`cursor-pointer transition-all ${
                        formData.knowledgeBaseId === kb.id ? "ring-2 ring-primary" : "hover-elevate"
                      }`}
                      onClick={() => updateField("knowledgeBaseId", kb.id)}
                      data-testid={`card-kb-${kb.id}`}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${formData.knowledgeBaseId === kb.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{kb.name}</p>
                            <p className="text-sm text-muted-foreground">{kb.description || "No description"}</p>
                          </div>
                        </div>
                        <Badge variant={kb.status === "ready" ? "default" : "secondary"}>
                          {kb.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Conversation Flow Type</Label>
              <div className="grid gap-3 md:grid-cols-2">
                <Card
                  className={`cursor-pointer transition-all ${
                    formData.flowType === "conversational" ? "ring-2 ring-primary" : "hover-elevate"
                  }`}
                  onClick={() => updateField("flowType", "conversational")}
                  data-testid="card-flow-conversational"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="font-medium">Conversational AI</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Natural language understanding with dynamic responses based on context
                    </p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${
                    formData.flowType === "scripted" ? "ring-2 ring-primary" : "hover-elevate"
                  }`}
                  onClick={() => updateField("flowType", "scripted")}
                  data-testid="card-flow-scripted"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      <span className="font-medium">Scripted Flow</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Predefined conversation paths with structured decision trees
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Visual Flow Designer</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      After creating your agent, use the Visual Flow Designer to customize conversation paths
                    </p>
                    <Button variant="outline" size="sm" disabled data-testid="button-open-flow-designer">
                      Available after agent creation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Assign Phone Number</Label>
              <p className="text-sm text-muted-foreground">
                Select a DID to route calls to this agent
              </p>
              <Select value={formData.phoneNumber} onValueChange={(v) => updateField("phoneNumber", v)}>
                <SelectTrigger data-testid="select-phone-number">
                  <SelectValue placeholder="Select a phone number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No phone number assigned</SelectItem>
                  <SelectItem value="+1-555-0100">+1 (555) 010-0100</SelectItem>
                  <SelectItem value="+1-555-0101">+1 (555) 010-0101</SelectItem>
                  <SelectItem value="+1-555-0102">+1 (555) 010-0102</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>SIP Trunk Assignment</Label>
              <p className="text-sm text-muted-foreground">
                For outbound campaigns, select a SIP trunk
              </p>
              <Select value={formData.sipTrunk} onValueChange={(v) => updateField("sipTrunk", v)}>
                <SelectTrigger data-testid="select-sip-trunk">
                  <SelectValue placeholder="Select a SIP trunk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No SIP trunk assigned</SelectItem>
                  <SelectItem value="trunk-primary">Primary Trunk (US)</SelectItem>
                  <SelectItem value="trunk-backup">Backup Trunk (EU)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Phone numbers and SIP trunks are managed in your account settings. 
                    Contact support to add more resources.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="greeting">Greeting Message</Label>
              <Textarea
                id="greeting"
                value={formData.greetingMessage}
                onChange={(e) => updateField("greetingMessage", e.target.value)}
                placeholder="The first thing the agent says..."
                rows={3}
                data-testid="input-greeting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing">Closing Message</Label>
              <Textarea
                id="closing"
                value={formData.closingMessage}
                onChange={(e) => updateField("closingMessage", e.target.value)}
                placeholder="How the agent ends calls..."
                rows={3}
                data-testid="input-closing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer">Transfer Message</Label>
              <Textarea
                id="transfer"
                value={formData.transferMessage}
                onChange={(e) => updateField("transferMessage", e.target.value)}
                placeholder="What to say when transferring..."
                rows={2}
                data-testid="input-transfer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voicemail">Voicemail Message</Label>
              <Textarea
                id="voicemail"
                value={formData.voicemailMessage}
                onChange={(e) => updateField("voicemailMessage", e.target.value)}
                placeholder="Voicemail greeting..."
                rows={2}
                data-testid="input-voicemail"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Business Hours</Label>
                <p className="text-sm text-muted-foreground">Enable to restrict agent availability</p>
              </div>
              <Switch
                checked={formData.businessHours.enabled}
                onCheckedChange={(checked) => updateField("businessHours", { ...formData.businessHours, enabled: checked })}
                data-testid="switch-business-hours"
              />
            </div>
            {formData.businessHours.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={formData.businessHours.timezone}
                    onValueChange={(v) => updateField("businessHours", { ...formData.businessHours, timezone: v })}
                  >
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">GMT/BST</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  {formData.businessHours.schedule.map((day, idx) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <div className="w-28">
                        <Checkbox
                          id={`day-${day.day}`}
                          checked={day.enabled}
                          onCheckedChange={(checked) => {
                            const newSchedule = [...formData.businessHours.schedule];
                            newSchedule[idx] = { ...day, enabled: !!checked };
                            updateField("businessHours", { ...formData.businessHours, schedule: newSchedule });
                          }}
                          data-testid={`checkbox-day-${day.day.toLowerCase()}`}
                        />
                        <label htmlFor={`day-${day.day}`} className="ml-2 text-sm">{day.day}</label>
                      </div>
                      {day.enabled && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={day.start}
                            onChange={(e) => {
                              const newSchedule = [...formData.businessHours.schedule];
                              newSchedule[idx] = { ...day, start: e.target.value };
                              updateField("businessHours", { ...formData.businessHours, schedule: newSchedule });
                            }}
                            className="w-32"
                            data-testid={`input-start-${day.day.toLowerCase()}`}
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={day.end}
                            onChange={(e) => {
                              const newSchedule = [...formData.businessHours.schedule];
                              newSchedule[idx] = { ...day, end: e.target.value };
                              updateField("businessHours", { ...formData.businessHours, schedule: newSchedule });
                            }}
                            className="w-32"
                            data-testid={`input-end-${day.day.toLowerCase()}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Max Call Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.maxCallDuration}
                  onChange={(e) => updateField("maxCallDuration", parseInt(e.target.value))}
                  min={1}
                  max={120}
                  data-testid="input-max-duration"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Call Recording</Label>
                  <p className="text-sm text-muted-foreground">Record all conversations</p>
                </div>
                <Switch
                  checked={formData.enableRecording}
                  onCheckedChange={(checked) => updateField("enableRecording", checked)}
                  data-testid="switch-recording"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Transcription</Label>
                  <p className="text-sm text-muted-foreground">Generate text transcripts</p>
                </div>
                <Switch
                  checked={formData.enableTranscription}
                  onCheckedChange={(checked) => updateField("enableTranscription", checked)}
                  data-testid="switch-transcription"
                />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Agent Summary
                </CardTitle>
                <CardDescription>Review your agent configuration before deployment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{formData.name || "Unnamed Agent"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{AGENT_TYPES.find(t => t.value === formData.type)?.label}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Voice</p>
                    <p className="font-medium">{VOICE_OPTIONS.find(v => v.value === formData.voice)?.label}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Language</p>
                    <p className="font-medium">{LANGUAGES.find(l => l.value === formData.language)?.label}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Knowledge Base</p>
                    <p className="font-medium">
                      {formData.knowledgeBaseId
                        ? knowledgeBases.find((kb: any) => kb.id === formData.knowledgeBaseId)?.name
                        : "None"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Flow Type</p>
                    <p className="font-medium">{formData.flowType === "conversational" ? "Conversational AI" : "Scripted Flow"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{formData.phoneNumber || "Not assigned"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Business Hours</p>
                    <p className="font-medium">{formData.businessHours.enabled ? "Enabled" : "24/7"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={formData.enableRecording ? "default" : "secondary"}>
                      {formData.enableRecording ? "Recording On" : "Recording Off"}
                    </Badge>
                    <Badge variant={formData.enableTranscription ? "default" : "secondary"}>
                      {formData.enableTranscription ? "Transcription On" : "Transcription Off"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Ready to Deploy</p>
                    <p className="text-sm text-muted-foreground">
                      Your agent will be created and ready to handle calls. You can edit settings anytime from the dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portal/ai-voice")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Create AI Voice Agent</h1>
          <p className="text-muted-foreground">Step {currentStep} of 8: {WIZARD_STEPS[currentStep - 1].name}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" data-testid="progress-wizard" />
        <div className="hidden md:flex justify-between">
          {WIZARD_STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                currentStep === step.id
                  ? "text-primary"
                  : currentStep > step.id
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
              }`}
              data-testid={`step-indicator-${step.id}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </div>
              <span className="hidden lg:block">{step.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = WIZARD_STEPS[currentStep - 1].icon;
              return <StepIcon className="h-5 w-5" />;
            })()}
            {WIZARD_STEPS[currentStep - 1].name}
          </CardTitle>
          <CardDescription>{WIZARD_STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          data-testid="button-prev-step"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {currentStep < 8 ? (
          <Button onClick={nextStep} data-testid="button-next-step">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createAgentMutation.isPending || !formData.name}
            data-testid="button-create-agent"
          >
            {createAgentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Agent
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
