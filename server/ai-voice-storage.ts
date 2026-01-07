import { db } from "./db";
import {
  aiVoicePricingTiers, aiVoiceRateConfigs, aiVoiceKnowledgeBases, aiVoiceKbSources,
  aiVoicePhonebooks, aiVoiceContacts, aiVoiceTemplates, aiVoiceUsage,
  aiVoiceAssignments, aiVoiceSettings, aiVoiceWebhooks, aiVoiceCallLogs,
  type AiVoicePricingTier, type InsertAiVoicePricingTier,
  type AiVoiceRateConfig, type InsertAiVoiceRateConfig,
  type AiVoiceKnowledgeBase, type InsertAiVoiceKnowledgeBase,
  type AiVoiceKbSource, type InsertAiVoiceKbSource,
  type AiVoicePhonebook, type InsertAiVoicePhonebook,
  type AiVoiceContact, type InsertAiVoiceContact,
  type AiVoiceTemplate, type InsertAiVoiceTemplate,
  type AiVoiceUsage, type InsertAiVoiceUsage,
  type AiVoiceAssignment, type InsertAiVoiceAssignment,
  type AiVoiceSetting, type InsertAiVoiceSetting,
  type AiVoiceWebhook, type InsertAiVoiceWebhook,
  type AiVoiceCallLog
} from "@shared/schema";
import { eq, and, desc, asc, sql, like, gte, lte, or, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

class AiVoiceStorage {
  private pricingTiers: Map<string, AiVoicePricingTier> = new Map();
  private rateConfigs: Map<string, AiVoiceRateConfig> = new Map();
  private knowledgeBases: Map<string, AiVoiceKnowledgeBase> = new Map();
  private kbSources: Map<string, AiVoiceKbSource> = new Map();
  private phonebooks: Map<string, AiVoicePhonebook> = new Map();
  private contacts: Map<string, AiVoiceContact> = new Map();
  private templates: Map<string, AiVoiceTemplate> = new Map();
  private usage: Map<string, AiVoiceUsage> = new Map();
  private assignments: Map<string, AiVoiceAssignment> = new Map();
  private settings: Map<string, AiVoiceSetting> = new Map();
  private webhooks: Map<string, AiVoiceWebhook> = new Map();
  private callLogs: Map<string, AiVoiceCallLog> = new Map();

  async getPricingTiers(): Promise<AiVoicePricingTier[]> {
    return Array.from(this.pricingTiers.values());
  }

  async getPricingTier(id: string): Promise<AiVoicePricingTier | undefined> {
    return this.pricingTiers.get(id);
  }

  async getDefaultPricingTier(): Promise<AiVoicePricingTier | undefined> {
    return Array.from(this.pricingTiers.values()).find(t => t.isDefault);
  }

  async createPricingTier(data: InsertAiVoicePricingTier): Promise<AiVoicePricingTier> {
    const id = randomUUID();
    const tier: AiVoicePricingTier = {
      id,
      name: data.name,
      description: data.description || null,
      ratePerMinute: data.ratePerMinute,
      setupFee: data.setupFee || "0",
      minimumBillableSeconds: data.minimumBillableSeconds || 60,
      billingIncrement: data.billingIncrement || 6,
      llmProvider: data.llmProvider || "openai",
      ttsProvider: data.ttsProvider || "openai",
      sttProvider: data.sttProvider || "openai",
      maxCallDuration: data.maxCallDuration || 1800,
      isDefault: data.isDefault || false,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pricingTiers.set(id, tier);
    return tier;
  }

  async updatePricingTier(id: string, data: Partial<InsertAiVoicePricingTier>): Promise<AiVoicePricingTier | undefined> {
    const tier = this.pricingTiers.get(id);
    if (!tier) return undefined;
    const updated = { ...tier, ...data, updatedAt: new Date() };
    this.pricingTiers.set(id, updated);
    return updated;
  }

  async deletePricingTier(id: string): Promise<boolean> {
    return this.pricingTiers.delete(id);
  }

  async getRateConfigs(): Promise<AiVoiceRateConfig[]> {
    return Array.from(this.rateConfigs.values());
  }

  async getRateConfig(id: string): Promise<AiVoiceRateConfig | undefined> {
    return this.rateConfigs.get(id);
  }

  async createRateConfig(data: InsertAiVoiceRateConfig): Promise<AiVoiceRateConfig> {
    const id = randomUUID();
    const config: AiVoiceRateConfig = {
      id,
      name: data.name,
      description: data.description || null,
      destinationPrefix: data.destinationPrefix || null,
      countryCode: data.countryCode || null,
      ratePerMinute: data.ratePerMinute,
      connectionFee: data.connectionFee || "0",
      minimumDuration: data.minimumDuration || 0,
      billingIncrement: data.billingIncrement || 1,
      effectiveFrom: data.effectiveFrom || null,
      effectiveTo: data.effectiveTo || null,
      llmCostPerToken: data.llmCostPerToken || null,
      ttsCostPerChar: data.ttsCostPerChar || null,
      sttCostPerSecond: data.sttCostPerSecond || null,
      priority: data.priority || 0,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rateConfigs.set(id, config);
    return config;
  }

  async updateRateConfig(id: string, data: Partial<InsertAiVoiceRateConfig>): Promise<AiVoiceRateConfig | undefined> {
    const config = this.rateConfigs.get(id);
    if (!config) return undefined;
    const updated = { ...config, ...data, updatedAt: new Date() };
    this.rateConfigs.set(id, updated);
    return updated;
  }

  async deleteRateConfig(id: string): Promise<boolean> {
    return this.rateConfigs.delete(id);
  }

  async getKnowledgeBases(customerId?: string): Promise<AiVoiceKnowledgeBase[]> {
    const all = Array.from(this.knowledgeBases.values());
    return customerId ? all.filter(kb => kb.customerId === customerId) : all;
  }

  async getKnowledgeBase(id: string): Promise<AiVoiceKnowledgeBase | undefined> {
    return this.knowledgeBases.get(id);
  }

  async createKnowledgeBase(data: InsertAiVoiceKnowledgeBase): Promise<AiVoiceKnowledgeBase> {
    const id = randomUUID();
    const kb: AiVoiceKnowledgeBase = {
      id,
      customerId: data.customerId,
      name: data.name,
      description: data.description || null,
      connexcsKbId: data.connexcsKbId || null,
      status: data.status || "pending",
      documentCount: data.documentCount || 0,
      totalTokens: data.totalTokens || 0,
      learnedTopics: null,
      extractedFaqs: null,
      keyPhrases: null,
      confidenceScore: null,
      trainingSummary: null,
      lastTrainedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.knowledgeBases.set(id, kb);
    return kb;
  }

  async updateKnowledgeBase(id: string, data: Partial<AiVoiceKnowledgeBase>): Promise<AiVoiceKnowledgeBase | undefined> {
    const kb = this.knowledgeBases.get(id);
    if (!kb) return undefined;
    const updated = { ...kb, ...data, updatedAt: new Date() };
    this.knowledgeBases.set(id, updated);
    return updated;
  }

  async deleteKnowledgeBase(id: string): Promise<boolean> {
    return this.knowledgeBases.delete(id);
  }

  async getKbSources(knowledgeBaseId: string): Promise<AiVoiceKbSource[]> {
    return Array.from(this.kbSources.values()).filter(s => s.knowledgeBaseId === knowledgeBaseId);
  }

  async getKbSource(id: string): Promise<AiVoiceKbSource | undefined> {
    return this.kbSources.get(id);
  }

  async createKbSource(data: InsertAiVoiceKbSource): Promise<AiVoiceKbSource> {
    const id = randomUUID();
    const source: AiVoiceKbSource = {
      id,
      knowledgeBaseId: data.knowledgeBaseId,
      name: data.name,
      sourceType: data.sourceType,
      content: data.content || null,
      fileUrl: data.fileUrl || null,
      mimeType: data.mimeType || null,
      fileSize: data.fileSize || null,
      status: data.status || "pending",
      tokenCount: data.tokenCount || 0,
      lastIndexedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.kbSources.set(id, source);
    return source;
  }

  async updateKbSource(id: string, data: Partial<InsertAiVoiceKbSource>): Promise<AiVoiceKbSource | undefined> {
    const source = this.kbSources.get(id);
    if (!source) return undefined;
    const updated = { ...source, ...data, updatedAt: new Date() };
    this.kbSources.set(id, updated);
    return updated;
  }

  async deleteKbSource(id: string): Promise<boolean> {
    return this.kbSources.delete(id);
  }

  async getPhonebooks(customerId?: string): Promise<AiVoicePhonebook[]> {
    const all = Array.from(this.phonebooks.values());
    return customerId ? all.filter(pb => pb.customerId === customerId) : all;
  }

  async getPhonebook(id: string): Promise<AiVoicePhonebook | undefined> {
    return this.phonebooks.get(id);
  }

  async createPhonebook(data: InsertAiVoicePhonebook): Promise<AiVoicePhonebook> {
    const id = randomUUID();
    const pb: AiVoicePhonebook = {
      id,
      customerId: data.customerId,
      name: data.name,
      description: data.description || null,
      contactCount: data.contactCount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.phonebooks.set(id, pb);
    return pb;
  }

  async updatePhonebook(id: string, data: Partial<InsertAiVoicePhonebook>): Promise<AiVoicePhonebook | undefined> {
    const pb = this.phonebooks.get(id);
    if (!pb) return undefined;
    const updated = { ...pb, ...data, updatedAt: new Date() };
    this.phonebooks.set(id, updated);
    return updated;
  }

  async deletePhonebook(id: string): Promise<boolean> {
    return this.phonebooks.delete(id);
  }

  async getContacts(phonebookId: string): Promise<AiVoiceContact[]> {
    return Array.from(this.contacts.values()).filter(c => c.phonebookId === phonebookId);
  }

  async getContact(id: string): Promise<AiVoiceContact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(data: InsertAiVoiceContact): Promise<AiVoiceContact> {
    const id = randomUUID();
    const contact: AiVoiceContact = {
      id,
      phonebookId: data.phonebookId,
      phoneNumber: data.phoneNumber,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      email: data.email || null,
      company: data.company || null,
      customFields: data.customFields || null,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: string, data: Partial<InsertAiVoiceContact>): Promise<AiVoiceContact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    const updated = { ...contact, ...data, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async bulkCreateContacts(phonebookId: string, contactsData: InsertAiVoiceContact[]): Promise<AiVoiceContact[]> {
    const created: AiVoiceContact[] = [];
    for (const data of contactsData) {
      const contact = await this.createContact({ ...data, phonebookId });
      created.push(contact);
    }
    const pb = this.phonebooks.get(phonebookId);
    if (pb) {
      pb.contactCount = (pb.contactCount || 0) + created.length;
      this.phonebooks.set(phonebookId, pb);
    }
    return created;
  }

  async getTemplates(category?: string): Promise<AiVoiceTemplate[]> {
    const all = Array.from(this.templates.values()).filter(t => t.isActive);
    return category ? all.filter(t => t.category === category) : all;
  }

  async getTemplate(id: string): Promise<AiVoiceTemplate | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(data: InsertAiVoiceTemplate): Promise<AiVoiceTemplate> {
    const id = randomUUID();
    const template: AiVoiceTemplate = {
      id,
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      icon: data.icon || null,
      systemPrompt: data.systemPrompt || null,
      greetingMessage: data.greetingMessage || null,
      fallbackMessage: data.fallbackMessage || null,
      voiceId: data.voiceId || null,
      voiceProvider: data.voiceProvider || "openai",
      defaultFlowData: data.defaultFlowData || null,
      isGlobal: data.isGlobal ?? true,
      customerId: data.customerId || null,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, data: Partial<InsertAiVoiceTemplate>): Promise<AiVoiceTemplate | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    const updated = { ...template, ...data, updatedAt: new Date() };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  async getUsage(customerId?: string, billingPeriod?: string): Promise<AiVoiceUsage[]> {
    let all = Array.from(this.usage.values());
    if (customerId) all = all.filter(u => u.customerId === customerId);
    if (billingPeriod) all = all.filter(u => u.billingPeriod === billingPeriod);
    return all;
  }

  async createUsage(data: InsertAiVoiceUsage): Promise<AiVoiceUsage> {
    const id = randomUUID();
    const usage: AiVoiceUsage = {
      id,
      customerId: data.customerId,
      agentId: data.agentId || null,
      callLogId: data.callLogId || null,
      pricingTierId: data.pricingTierId || null,
      durationSeconds: data.durationSeconds || 0,
      billableSeconds: data.billableSeconds || 0,
      ratePerMinute: data.ratePerMinute || null,
      totalCost: data.totalCost || null,
      llmTokens: data.llmTokens || 0,
      ttsCharacters: data.ttsCharacters || 0,
      invoiceId: data.invoiceId || null,
      billingPeriod: data.billingPeriod || null,
      createdAt: new Date()
    };
    this.usage.set(id, usage);
    return usage;
  }

  async getAssignments(featureName?: string): Promise<AiVoiceAssignment[]> {
    const all = Array.from(this.assignments.values());
    return featureName ? all.filter(a => a.featureName === featureName) : all;
  }

  async getAssignment(id: string): Promise<AiVoiceAssignment | undefined> {
    return this.assignments.get(id);
  }

  async createAssignment(data: InsertAiVoiceAssignment): Promise<AiVoiceAssignment> {
    const id = randomUUID();
    const assignment: AiVoiceAssignment = {
      id,
      featureName: data.featureName,
      assignmentType: data.assignmentType || "all",
      categoryIds: data.categoryIds || null,
      groupIds: data.groupIds || null,
      customerIds: data.customerIds || null,
      pricingTierId: data.pricingTierId || null,
      maxAgents: data.maxAgents || null,
      maxCallsPerDay: data.maxCallsPerDay || null,
      maxConcurrentCalls: data.maxConcurrentCalls || null,
      allowOutbound: data.allowOutbound ?? true,
      allowInbound: data.allowInbound ?? true,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: string, data: Partial<InsertAiVoiceAssignment>): Promise<AiVoiceAssignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    const updated = { ...assignment, ...data, updatedAt: new Date() };
    this.assignments.set(id, updated);
    return updated;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    return this.assignments.delete(id);
  }

  async getSettings(): Promise<AiVoiceSetting[]> {
    return Array.from(this.settings.values());
  }

  async getSetting(key: string): Promise<AiVoiceSetting | undefined> {
    return Array.from(this.settings.values()).find(s => s.settingKey === key);
  }

  async upsertSetting(data: InsertAiVoiceSetting): Promise<AiVoiceSetting> {
    const existing = await this.getSetting(data.settingKey);
    if (existing) {
      const updated = { ...existing, ...data, updatedAt: new Date() };
      this.settings.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const setting: AiVoiceSetting = {
      id,
      settingKey: data.settingKey,
      settingValue: data.settingValue || null,
      settingType: data.settingType || "string",
      description: data.description || null,
      isPublic: data.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.settings.set(id, setting);
    return setting;
  }

  async getWebhooks(customerId?: string): Promise<AiVoiceWebhook[]> {
    const all = Array.from(this.webhooks.values());
    return customerId ? all.filter(w => w.customerId === customerId) : all;
  }

  async getWebhook(id: string): Promise<AiVoiceWebhook | undefined> {
    return this.webhooks.get(id);
  }

  async createWebhook(data: InsertAiVoiceWebhook): Promise<AiVoiceWebhook> {
    const id = randomUUID();
    const webhook: AiVoiceWebhook = {
      id,
      customerId: data.customerId,
      name: data.name,
      url: data.url,
      events: data.events || null,
      headers: data.headers || null,
      isActive: data.isActive ?? true,
      secretKey: data.secretKey || null,
      lastTriggeredAt: null,
      failureCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }

  async updateWebhook(id: string, data: Partial<InsertAiVoiceWebhook>): Promise<AiVoiceWebhook | undefined> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return undefined;
    const updated = { ...webhook, ...data, updatedAt: new Date() };
    this.webhooks.set(id, updated);
    return updated;
  }

  async deleteWebhook(id: string): Promise<boolean> {
    return this.webhooks.delete(id);
  }

  async getCallLogs(filters?: { agentId?: string; customerId?: string; campaignId?: string }): Promise<AiVoiceCallLog[]> {
    let all = Array.from(this.callLogs.values());
    if (filters?.agentId) all = all.filter(l => l.agentId === filters.agentId);
    if (filters?.campaignId) all = all.filter(l => l.campaignId === filters.campaignId);
    return all.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getCallLog(id: string): Promise<AiVoiceCallLog | undefined> {
    return this.callLogs.get(id);
  }

  async createCallLog(data: Partial<AiVoiceCallLog>): Promise<AiVoiceCallLog> {
    const id = randomUUID();
    const log: AiVoiceCallLog = {
      id,
      agentId: data.agentId || "",
      campaignId: data.campaignId || null,
      callId: data.callId || null,
      callerNumber: data.callerNumber || null,
      calledNumber: data.calledNumber || null,
      direction: data.direction || null,
      duration: data.duration || null,
      transcript: data.transcript || null,
      summary: data.summary || null,
      sentiment: data.sentiment || null,
      outcome: data.outcome || null,
      tokensUsed: data.tokensUsed || null,
      cost: data.cost || null,
      recordingUrl: data.recordingUrl || null,
      createdAt: new Date()
    };
    this.callLogs.set(id, log);
    return log;
  }

  seedDefaultData() {
    this.createPricingTier({
      name: "Standard",
      description: "Default pricing tier for AI Voice calls",
      ratePerMinute: "0.10",
      setupFee: "0",
      minimumBillableSeconds: 60,
      billingIncrement: 6,
      llmProvider: "openai",
      ttsProvider: "openai",
      sttProvider: "openai",
      maxCallDuration: 1800,
      isDefault: true,
      isActive: true
    });

    this.createTemplate({
      name: "Customer Support",
      description: "Handle customer inquiries, complaints, and support requests",
      category: "support",
      icon: "headset",
      systemPrompt: "You are a helpful customer support agent. Be polite, professional, and aim to resolve customer issues efficiently.",
      greetingMessage: "Hello! Thank you for calling. How can I assist you today?",
      fallbackMessage: "I apologize, I didn't quite understand that. Could you please rephrase your question?",
      voiceId: "alloy",
      voiceProvider: "openai",
      isGlobal: true,
      isActive: true,
      displayOrder: 1
    });

    this.createTemplate({
      name: "Appointment Booking",
      description: "Schedule and manage appointments with customers",
      category: "booking",
      icon: "calendar",
      systemPrompt: "You are an appointment scheduling assistant. Help customers book, reschedule, or cancel appointments.",
      greetingMessage: "Hello! I can help you schedule an appointment. What date and time works best for you?",
      fallbackMessage: "I'm sorry, I didn't catch that. Could you please tell me your preferred date and time?",
      voiceId: "nova",
      voiceProvider: "openai",
      isGlobal: true,
      isActive: true,
      displayOrder: 2
    });

    this.createTemplate({
      name: "Sales Outreach",
      description: "Outbound sales calls and lead qualification",
      category: "sales",
      icon: "phone-outgoing",
      systemPrompt: "You are a professional sales representative. Be persuasive but respectful, and focus on understanding customer needs.",
      greetingMessage: "Hi, this is Alex from [Company]. I'm reaching out because I noticed you might benefit from our services. Do you have a moment?",
      fallbackMessage: "I understand. Is there a better time I could call back?",
      voiceId: "echo",
      voiceProvider: "openai",
      isGlobal: true,
      isActive: true,
      displayOrder: 3
    });

    this.createTemplate({
      name: "Survey & Feedback",
      description: "Collect customer feedback and conduct surveys",
      category: "survey",
      icon: "clipboard-check",
      systemPrompt: "You are conducting a customer satisfaction survey. Be polite and keep the survey brief.",
      greetingMessage: "Hello! We're conducting a brief survey about your recent experience. It will only take 2 minutes. Would you like to participate?",
      fallbackMessage: "Thank you for your feedback. Let me note that down.",
      voiceId: "shimmer",
      voiceProvider: "openai",
      isGlobal: true,
      isActive: true,
      displayOrder: 4
    });

    this.upsertSetting({
      settingKey: "default_llm_provider",
      settingValue: "openai",
      settingType: "string",
      description: "Default LLM provider for AI Voice agents",
      isPublic: true
    });

    this.upsertSetting({
      settingKey: "default_tts_provider",
      settingValue: "openai",
      settingType: "string",
      description: "Default TTS provider for AI Voice agents",
      isPublic: true
    });

    this.upsertSetting({
      settingKey: "max_concurrent_calls_default",
      settingValue: "10",
      settingType: "number",
      description: "Default maximum concurrent calls per campaign",
      isPublic: true
    });

    this.upsertSetting({
      settingKey: "call_recording_enabled",
      settingValue: "true",
      settingType: "boolean",
      description: "Enable call recording by default",
      isPublic: true
    });
  }
}

export const aiVoiceStorage = new AiVoiceStorage();
aiVoiceStorage.seedDefaultData();
