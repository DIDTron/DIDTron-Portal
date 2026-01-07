import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Bot, Mic, Brain, GitBranch, Phone, MessageSquare, Clock, CheckCircle,
  ArrowLeft, ArrowRight, Loader2, Sparkles, Play, FileText, Zap, Shield
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
  { value: "outbound", label: "Outbound Sales", icon: Bot, description: "Make proactive sales calls" },
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

const scheduleItemSchema = z.object({
  day: z.string(),
  enabled: z.boolean(),
  start: z.string(),
  end: z.string(),
});

const agentFormSchema = z.object({
  name: z.string().min(2, "Agent name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Please select an agent type"),
  voice: z.string().min(1, "Please select a voice"),
  language: z.string().default("en-US"),
  personality: z.string().default("professional"),
  speakingRate: z.number().min(0.5).max(2.0).default(1.0),
  knowledgeBaseId: z.string().nullable().default(null),
  flowType: z.string().default("conversational"),
  greetingMessage: z.string().default("Hello! Thank you for calling. How can I help you today?"),
  closingMessage: z.string().default("Thank you for calling. Have a great day!"),
  transferMessage: z.string().default("Please hold while I transfer you to a specialist."),
  voicemailMessage: z.string().default("We're sorry we missed your call. Please leave a message after the tone."),
  phoneNumber: z.string().optional(),
  sipTrunk: z.string().optional(),
  businessHoursEnabled: z.boolean().default(false),
  timezone: z.string().default("America/New_York"),
  schedule: z.array(scheduleItemSchema).default([]),
  maxCallDuration: z.number().min(1).max(120).default(30),
  enableRecording: z.boolean().default(true),
  enableTranscription: z.boolean().default(true),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

const defaultSchedule = DAYS_OF_WEEK.map(day => ({
  day,
  enabled: !["Saturday", "Sunday"].includes(day),
  start: "09:00",
  end: "17:00",
}));

const defaultValues: AgentFormData = {
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
  businessHoursEnabled: false,
  timezone: "America/New_York",
  schedule: defaultSchedule,
  maxCallDuration: 30,
  enableRecording: true,
  enableTranscription: true,
};

export default function AIVoiceWizard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues,
    mode: "onChange",
  });

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

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof AgentFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["name", "type"];
        break;
      case 2:
        fieldsToValidate = ["voice", "language", "personality"];
        break;
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = (data: AgentFormData) => {
    createAgentMutation.mutate(data);
  };

  const progress = (currentStep / 8) * 100;
  const watchedValues = form.watch();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Customer Support Bot"
                      {...field}
                      data-testid="input-agent-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this agent does..."
                      {...field}
                      data-testid="input-agent-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Type *</FormLabel>
                  <div className="grid gap-3 md:grid-cols-2">
                    {AGENT_TYPES.map((type) => (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all ${
                          field.value === type.value ? "ring-2 ring-primary" : "hover-elevate"
                        }`}
                        onClick={() => field.onChange(type.value)}
                        data-testid={`card-agent-type-${type.value}`}
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className={`p-2 rounded-md ${field.value === type.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice Selection *</FormLabel>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {VOICE_OPTIONS.map((voice) => (
                      <Card
                        key={voice.value}
                        className={`cursor-pointer transition-all ${
                          field.value === voice.value ? "ring-2 ring-primary" : "hover-elevate"
                        }`}
                        onClick={() => field.onChange(voice.value)}
                        data-testid={`card-voice-${voice.value}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-1 mb-2">
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personality Style</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-personality">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="empathetic">Empathetic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="speakingRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speaking Rate: {field.value.toFixed(1)}x</FormLabel>
                  <FormControl>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="w-full"
                      data-testid="slider-speaking-rate"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slower (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Faster (2.0x)</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="knowledgeBaseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Knowledge Base</FormLabel>
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
                          field.value === null ? "ring-2 ring-primary" : "hover-elevate"
                        }`}
                        onClick={() => field.onChange(null)}
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
                            field.value === kb.id ? "ring-2 ring-primary" : "hover-elevate"
                          }`}
                          onClick={() => field.onChange(kb.id)}
                          data-testid={`card-kb-${kb.id}`}
                        >
                          <CardContent className="flex items-center justify-between gap-2 p-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-md ${field.value === kb.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="flowType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conversation Flow Type</FormLabel>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card
                      className={`cursor-pointer transition-all ${
                        field.value === "conversational" ? "ring-2 ring-primary" : "hover-elevate"
                      }`}
                      onClick={() => field.onChange("conversational")}
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
                        field.value === "scripted" ? "ring-2 ring-primary" : "hover-elevate"
                      }`}
                      onClick={() => field.onChange("scripted")}
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
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Phone Number</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Select a DID to route calls to this agent
                  </p>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-phone-number">
                        <SelectValue placeholder="Select a phone number" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No phone number assigned</SelectItem>
                      <SelectItem value="+1-555-0100">+1 (555) 010-0100</SelectItem>
                      <SelectItem value="+1-555-0101">+1 (555) 010-0101</SelectItem>
                      <SelectItem value="+1-555-0102">+1 (555) 010-0102</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sipTrunk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIP Trunk Assignment</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    For outbound campaigns, select a SIP trunk
                  </p>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-sip-trunk">
                        <SelectValue placeholder="Select a SIP trunk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No SIP trunk assigned</SelectItem>
                      <SelectItem value="trunk-primary">Primary Trunk (US)</SelectItem>
                      <SelectItem value="trunk-backup">Backup Trunk (EU)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="greetingMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Greeting Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="The first thing the agent says..."
                      rows={3}
                      {...field}
                      data-testid="input-greeting"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="closingMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How the agent ends calls..."
                      rows={3}
                      {...field}
                      data-testid="input-closing"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transferMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What to say when transferring..."
                      rows={2}
                      {...field}
                      data-testid="input-transfer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="voicemailMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voicemail Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Voicemail greeting..."
                      rows={2}
                      {...field}
                      data-testid="input-voicemail"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="businessHoursEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2 rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Enable Business Hours</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Only accept calls during specified hours
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-business-hours"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {watchedValues.businessHoursEnabled && (
              <>
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timezone">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-3">
                  <FormLabel>Weekly Schedule</FormLabel>
                  <div className="space-y-2">
                    {watchedValues.schedule.map((item, index) => (
                      <div key={item.day} className="flex items-center gap-3 rounded-lg border p-3">
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={(checked) => {
                            const newSchedule = [...watchedValues.schedule];
                            newSchedule[index] = { ...newSchedule[index], enabled: checked };
                            form.setValue("schedule", newSchedule);
                          }}
                          data-testid={`switch-day-${item.day.toLowerCase()}`}
                        />
                        <span className="w-24 font-medium">{item.day}</span>
                        {item.enabled ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={item.start}
                              onChange={(e) => {
                                const newSchedule = [...watchedValues.schedule];
                                newSchedule[index] = { ...newSchedule[index], start: e.target.value };
                                form.setValue("schedule", newSchedule);
                              }}
                              className="w-32"
                              data-testid={`input-start-${item.day.toLowerCase()}`}
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={item.end}
                              onChange={(e) => {
                                const newSchedule = [...watchedValues.schedule];
                                newSchedule[index] = { ...newSchedule[index], end: e.target.value };
                                form.setValue("schedule", newSchedule);
                              }}
                              className="w-32"
                              data-testid={`input-end-${item.day.toLowerCase()}`}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <FormField
              control={form.control}
              name="maxCallDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Call Duration: {field.value} minutes</FormLabel>
                  <FormControl>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      step="1"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full"
                      data-testid="slider-max-duration"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 min</span>
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="enableRecording"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-2 rounded-lg border p-4">
                    <div>
                      <FormLabel>Call Recording</FormLabel>
                      <p className="text-sm text-muted-foreground">Record all calls</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-recording"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enableTranscription"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-2 rounded-lg border p-4">
                    <div>
                      <FormLabel>Transcription</FormLabel>
                      <p className="text-sm text-muted-foreground">Auto-transcribe calls</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-transcription"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Deploy</h3>
              <p className="text-muted-foreground">Review your agent configuration below</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Basic Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium" data-testid="text-review-name">{watchedValues.name || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium" data-testid="text-review-type">
                        {AGENT_TYPES.find(t => t.value === watchedValues.type)?.label || watchedValues.type}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Settings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Voice</span>
                      <span className="font-medium" data-testid="text-review-voice">
                        {VOICE_OPTIONS.find(v => v.value === watchedValues.voice)?.label || watchedValues.voice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-medium">
                        {LANGUAGES.find(l => l.value === watchedValues.language)?.label || watchedValues.language}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Knowledge & Flow
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Knowledge Base</span>
                      <span className="font-medium">
                        {watchedValues.knowledgeBaseId 
                          ? knowledgeBases.find((kb: any) => kb.id === watchedValues.knowledgeBaseId)?.name || "Selected"
                          : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flow Type</span>
                      <span className="font-medium capitalize">{watchedValues.flowType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Settings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Duration</span>
                      <span className="font-medium">{watchedValues.maxCallDuration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recording</span>
                      <Badge variant={watchedValues.enableRecording ? "default" : "secondary"}>
                        {watchedValues.enableRecording ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/portal/ai-agent")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-wizard-title">Create AI Voice Agent</h1>
          <p className="text-muted-foreground">Step {currentStep} of 8: {WIZARD_STEPS[currentStep - 1]?.name}</p>
        </div>
      </div>

      <div className="mb-8">
        <Progress value={progress} className="h-2" data-testid="progress-wizard" />
        <div className="flex justify-between mt-4 overflow-x-auto">
          {WIZARD_STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center min-w-[80px] ${
                step.id === currentStep ? "text-primary" : step.id < currentStep ? "text-muted-foreground" : "text-muted-foreground/50"
              }`}
            >
              <div className={`p-2 rounded-full mb-1 ${
                step.id === currentStep ? "bg-primary text-primary-foreground" : 
                step.id < currentStep ? "bg-primary/20" : "bg-muted"
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-center hidden md:block">{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6">
              {renderStepContent()}
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              data-testid="button-prev-step"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep < 8 ? (
              <Button type="button" onClick={nextStep} data-testid="button-next-step">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createAgentMutation.isPending}
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
        </form>
      </Form>
    </div>
  );
}
