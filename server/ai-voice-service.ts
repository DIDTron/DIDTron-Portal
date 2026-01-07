import OpenAI from "openai";
import { db } from "./db";
import { 
  aiVoiceAgents, aiVoiceFlows, aiVoiceTrainingData, aiVoiceCampaigns,
  aiVoiceCallLogs, aiVoiceRateConfigs, aiVoicePricingTiers, aiVoiceKnowledgeBases,
  aiVoiceKbSources, aiVoicePhonebooks, aiVoiceContacts, aiVoiceTemplates,
  aiVoiceUsage, aiVoiceAssignments, aiVoiceSettings, aiVoiceWebhooks
} from "@shared/schema";
import { eq, and, desc, asc, sql, like, gte, lte, or, inArray } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export class AiVoiceService {
  async trainKnowledgeBase(knowledgeBaseId: string): Promise<{ topics: string[], faqs: any[], keyPhrases: string[], confidence: number, summary: string }> {
    const kb = await db.select().from(aiVoiceKnowledgeBases).where(eq(aiVoiceKnowledgeBases.id, knowledgeBaseId)).limit(1);
    if (!kb.length) throw new Error("Knowledge base not found");

    const sources = await db.select().from(aiVoiceKbSources).where(eq(aiVoiceKbSources.knowledgeBaseId, knowledgeBaseId));
    
    let allContent = "";
    for (const source of sources) {
      if (source.content) {
        allContent += `\n\n--- Source: ${source.name} ---\n${source.content}`;
      }
    }

    if (!allContent.trim()) {
      return { topics: [], faqs: [], keyPhrases: [], confidence: 0, summary: "No content to analyze" };
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a knowledge extraction AI. Analyze the provided content and extract:
1. Main topics (list of topic names)
2. Frequently asked questions with answers (array of {question, answer} objects)
3. Key phrases and terms (list of important terms)
4. Confidence score (0-100) based on content quality and completeness
5. Training summary (2-3 sentences describing what the agent learned)

Respond in JSON format:
{
  "topics": ["topic1", "topic2"],
  "faqs": [{"question": "...", "answer": "..."}],
  "keyPhrases": ["phrase1", "phrase2"],
  "confidence": 85,
  "summary": "..."
}`
          },
          { role: "user", content: allContent.substring(0, 50000) }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      await db.update(aiVoiceKnowledgeBases)
        .set({
          learnedTopics: result.topics || [],
          extractedFaqs: result.faqs || [],
          keyPhrases: result.keyPhrases || [],
          confidenceScore: String(result.confidence || 0),
          trainingSummary: result.summary || "",
          status: "ready",
          lastTrainedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(aiVoiceKnowledgeBases.id, knowledgeBaseId));

      return {
        topics: result.topics || [],
        faqs: result.faqs || [],
        keyPhrases: result.keyPhrases || [],
        confidence: result.confidence || 0,
        summary: result.summary || ""
      };
    } catch (error) {
      console.error("[AiVoice] Training error:", error);
      await db.update(aiVoiceKnowledgeBases)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(aiVoiceKnowledgeBases.id, knowledgeBaseId));
      throw error;
    }
  }

  async generateAgentResponse(agentId: string, userMessage: string, conversationHistory: any[] = []): Promise<string> {
    const agent = await db.select().from(aiVoiceAgents).where(eq(aiVoiceAgents.id, agentId)).limit(1);
    if (!agent.length) throw new Error("Agent not found");

    const agentData = agent[0];
    let systemPrompt = agentData.systemPrompt || "You are a helpful AI voice assistant.";

    const trainingData = await db.select().from(aiVoiceTrainingData)
      .where(and(eq(aiVoiceTrainingData.agentId, agentId), eq(aiVoiceTrainingData.isActive, true)));
    
    if (trainingData.length > 0) {
      systemPrompt += "\n\nHere is your knowledge base:\n";
      for (const item of trainingData) {
        systemPrompt += `Q: ${item.question}\nA: ${item.answer}\n\n`;
      }
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500
    });

    return response.choices[0].message.content || agentData.fallbackMessage || "I apologize, I couldn't process that request.";
  }

  async getAgentDashboardStats(customerId?: string) {
    const whereClause = customerId ? eq(aiVoiceAgents.customerId, customerId) : undefined;
    
    const agents = await db.select().from(aiVoiceAgents).where(whereClause);
    const campaigns = await db.select().from(aiVoiceCampaigns).where(
      customerId ? eq(aiVoiceCampaigns.customerId, customerId) : undefined
    );
    const callLogs = await db.select().from(aiVoiceCallLogs);
    const kbs = await db.select().from(aiVoiceKnowledgeBases).where(
      customerId ? eq(aiVoiceKnowledgeBases.customerId, customerId) : undefined
    );

    const activeAgents = agents.filter(a => a.status === "active").length;
    const activeCampaigns = campaigns.filter(c => c.status === "running").length;
    const totalCalls = callLogs.length;
    const totalMinutes = callLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60;
    const avgCallDuration = totalCalls > 0 ? totalMinutes / totalCalls : 0;

    return {
      totalAgents: agents.length,
      activeAgents,
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalCalls,
      totalMinutes: Math.round(totalMinutes * 100) / 100,
      avgCallDuration: Math.round(avgCallDuration * 100) / 100,
      knowledgeBases: kbs.length,
      readyKnowledgeBases: kbs.filter(k => k.status === "ready").length
    };
  }

  async calculateCallCost(durationSeconds: number, pricingTierId?: string): Promise<number> {
    let tier;
    if (pricingTierId) {
      const tiers = await db.select().from(aiVoicePricingTiers).where(eq(aiVoicePricingTiers.id, pricingTierId));
      tier = tiers[0];
    }
    if (!tier) {
      const defaultTiers = await db.select().from(aiVoicePricingTiers).where(eq(aiVoicePricingTiers.isDefault, true));
      tier = defaultTiers[0];
    }

    const ratePerMinute = tier ? parseFloat(tier.ratePerMinute) : 0.10;
    const minimumSeconds = tier?.minimumBillableSeconds || 60;
    const increment = tier?.billingIncrement || 6;

    const billableSeconds = Math.max(durationSeconds, minimumSeconds);
    const roundedSeconds = Math.ceil(billableSeconds / increment) * increment;
    const minutes = roundedSeconds / 60;

    return Math.round(minutes * ratePerMinute * 1000000) / 1000000;
  }

  async recordCallUsage(data: {
    customerId: string;
    agentId: string;
    callLogId: string;
    durationSeconds: number;
    pricingTierId?: string;
    llmTokens?: number;
    ttsCharacters?: number;
  }) {
    const cost = await this.calculateCallCost(data.durationSeconds, data.pricingTierId);
    
    const tier = data.pricingTierId 
      ? (await db.select().from(aiVoicePricingTiers).where(eq(aiVoicePricingTiers.id, data.pricingTierId)))[0]
      : (await db.select().from(aiVoicePricingTiers).where(eq(aiVoicePricingTiers.isDefault, true)))[0];

    const minimumSeconds = tier?.minimumBillableSeconds || 60;
    const increment = tier?.billingIncrement || 6;
    const billableSeconds = Math.ceil(Math.max(data.durationSeconds, minimumSeconds) / increment) * increment;

    await db.insert(aiVoiceUsage).values({
      customerId: data.customerId,
      agentId: data.agentId,
      callLogId: data.callLogId,
      pricingTierId: data.pricingTierId || tier?.id,
      durationSeconds: data.durationSeconds,
      billableSeconds,
      ratePerMinute: tier?.ratePerMinute || "0.10",
      totalCost: String(cost),
      llmTokens: data.llmTokens || 0,
      ttsCharacters: data.ttsCharacters || 0,
      billingPeriod: new Date().toISOString().substring(0, 7)
    });

    return { cost, billableSeconds };
  }

  async getAnalytics(customerId?: string, startDate?: Date, endDate?: Date) {
    const callLogs = await db.select().from(aiVoiceCallLogs);
    const usage = await db.select().from(aiVoiceUsage).where(
      customerId ? eq(aiVoiceUsage.customerId, customerId) : undefined
    );

    const totalCalls = callLogs.length;
    const totalDuration = callLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalCost = usage.reduce((sum, u) => sum + parseFloat(u.totalCost || "0"), 0);

    const sentimentBreakdown = {
      positive: callLogs.filter(l => l.sentiment === "positive").length,
      neutral: callLogs.filter(l => l.sentiment === "neutral").length,
      negative: callLogs.filter(l => l.sentiment === "negative").length
    };

    const outcomeBreakdown: Record<string, number> = {};
    callLogs.forEach(log => {
      const outcome = log.outcome || "unknown";
      outcomeBreakdown[outcome] = (outcomeBreakdown[outcome] || 0) + 1;
    });

    return {
      totalCalls,
      totalDuration,
      totalMinutes: Math.round(totalDuration / 60 * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      avgCallDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
      avgCostPerCall: totalCalls > 0 ? Math.round(totalCost / totalCalls * 100) / 100 : 0,
      sentimentBreakdown,
      outcomeBreakdown
    };
  }
}

export const aiVoiceService = new AiVoiceService();
