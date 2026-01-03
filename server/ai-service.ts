import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface AIDescriptionRequest {
  entityType: string;
  name: string;
  context?: Record<string, unknown>;
}

export interface AIAnalysisRequest {
  dataType: string;
  data: unknown;
  question?: string;
}

export interface AIMarketingRequest {
  service: string;
  targetAudience?: string;
  tone?: "professional" | "friendly" | "technical";
}

export const aiService = {
  async generateDescription(request: AIDescriptionRequest): Promise<string> {
    const { entityType, name, context } = request;
    
    const contextStr = context 
      ? Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(", ")
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a technical writer for DIDTron Communications, a wholesale VoIP platform. 
Generate concise, professional descriptions for VoIP infrastructure components.
Keep descriptions under 100 words. Focus on technical accuracy and business value.
Do not use marketing fluff. Be direct and informative.`,
        },
        {
          role: "user",
          content: `Generate a description for this ${entityType}:
Name: ${name}
${contextStr ? `Additional context: ${contextStr}` : ""}

Provide a brief, professional description suitable for a VoIP platform admin interface.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || `${entityType}: ${name}`;
  },

  async generateMarketingCopy(request: AIMarketingRequest): Promise<{ headline: string; description: string; features: string[] }> {
    const { service, targetAudience, tone = "professional" } = request;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a marketing copywriter for DIDTron Communications, a wholesale VoIP platform.
Generate compelling B2B marketing copy. Target audience: ${targetAudience || "telecom professionals"}.
Tone: ${tone}. Focus on value proposition and competitive advantages.
Respond in JSON format with: headline, description, features (array of 3-5 bullet points).`,
        },
        {
          role: "user",
          content: `Generate marketing copy for: ${service}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
      temperature: 0.8,
    });

    try {
      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        headline: service,
        description: `Professional ${service} solution for your telecom needs.`,
        features: ["Enterprise-grade reliability", "Competitive pricing", "24/7 support"],
      };
    }
  },

  async analyzeData(request: AIAnalysisRequest): Promise<{ summary: string; insights: string[]; recommendations: string[] }> {
    const { dataType, data, question } = request;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a VoIP analytics expert for DIDTron Communications.
Analyze telecom data and provide actionable insights.
Focus on: quality metrics (MOS, jitter, packet loss), routing efficiency, cost optimization, and capacity planning.
Respond in JSON format with: summary (brief overview), insights (array of key findings), recommendations (array of actionable steps).`,
        },
        {
          role: "user",
          content: `Analyze this ${dataType} data:
${JSON.stringify(data, null, 2)}
${question ? `\nSpecific question: ${question}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.5,
    });

    try {
      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        summary: "Unable to analyze data",
        insights: ["Data analysis pending"],
        recommendations: ["Review data manually"],
      };
    }
  },

  async generateCarrierAnalysis(carrierData: {
    name: string;
    asr?: number;
    acd?: number;
    mos?: number;
    pdd?: number;
    callVolume?: number;
  }): Promise<{ quality: string; issues: string[]; suggestions: string[] }> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a VoIP carrier quality analyst. Analyze carrier metrics:
- ASR (Answer Seizure Ratio): Good >50%, Excellent >70%
- ACD (Average Call Duration): Good >2min
- MOS (Mean Opinion Score): Good >4.0, Excellent >4.2
- PDD (Post Dial Delay): Good <3s, Excellent <1.5s
Respond in JSON: quality (rating), issues (array), suggestions (array).`,
        },
        {
          role: "user",
          content: `Analyze carrier: ${JSON.stringify(carrierData)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.5,
    });

    try {
      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        quality: "Unknown",
        issues: ["Unable to analyze"],
        suggestions: ["Review metrics manually"],
      };
    }
  },

  async generateRouteRecommendation(request: {
    destination: string;
    budget?: string;
    qualityPriority?: "cost" | "quality" | "balanced";
    currentRoutes?: Array<{ name: string; cost: number; mos: number }>;
  }): Promise<{ recommendation: string; reasoning: string; alternativeRoutes: string[] }> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a VoIP routing optimization expert. Recommend optimal routes based on:
- Cost efficiency
- Quality metrics (MOS, ASR)
- Geographic proximity
- Redundancy requirements
Respond in JSON: recommendation, reasoning, alternativeRoutes (array).`,
        },
        {
          role: "user",
          content: `Route recommendation needed:
Destination: ${request.destination}
Priority: ${request.qualityPriority || "balanced"}
${request.budget ? `Budget: ${request.budget}` : ""}
${request.currentRoutes ? `Current routes: ${JSON.stringify(request.currentRoutes)}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.6,
    });

    try {
      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        recommendation: "Use primary carrier",
        reasoning: "Default recommendation - unable to process request",
        alternativeRoutes: [],
      };
    }
  },

  async generateAuditSummary(changes: Array<{
    entity: string;
    action: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
  }>): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a configuration audit summarizer for a VoIP platform.
Generate a brief, human-readable summary of configuration changes.
Focus on what changed, potential impact, and any concerns.
Keep summaries under 150 words.`,
        },
        {
          role: "user",
          content: `Summarize these configuration changes:
${JSON.stringify(changes, null, 2)}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || "Configuration changes applied.";
  },

  async generateAlertExplanation(alert: {
    type: string;
    severity: string;
    metric?: string;
    value?: number;
    threshold?: number;
    entity?: string;
  }): Promise<{ explanation: string; impact: string; suggestedActions: string[] }> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a VoIP monitoring expert. Explain alerts in plain English:
- What the alert means
- Potential business impact
- Suggested remediation steps
Respond in JSON: explanation, impact, suggestedActions (array).`,
        },
        {
          role: "user",
          content: `Explain this alert: ${JSON.stringify(alert)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.5,
    });

    try {
      const content = response.choices[0]?.message?.content || "{}";
      return JSON.parse(content);
    } catch {
      return {
        explanation: `${alert.type} alert triggered`,
        impact: "Review required",
        suggestedActions: ["Check system metrics", "Review logs"],
      };
    }
  },

  async chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are the DIDTron AI Assistant, helping users manage their VoIP platform.
You can help with:
- Carrier and route configuration
- Quality monitoring and troubleshooting
- DID management
- PBX settings
- Billing questions
Be concise, technical when needed, and always helpful.`,
        },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  },
};

export default aiService;
