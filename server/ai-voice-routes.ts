import type { Express, Request, Response } from "express";
import { aiVoiceStorage } from "./ai-voice-storage";
import { aiVoiceService } from "./ai-voice-service";
import { storage } from "./storage";
import { z } from "zod";

const pricingTierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  ratePerMinute: z.string().min(1, "Rate is required"),
  setupFee: z.string().optional(),
  minimumBillableSeconds: z.number().int().positive().optional(),
  billingIncrement: z.number().int().positive().optional(),
  llmProvider: z.enum(["openai", "anthropic", "custom"]).optional(),
  ttsProvider: z.enum(["openai", "elevenlabs", "custom"]).optional(),
  sttProvider: z.enum(["openai", "whisper", "custom"]).optional(),
  maxCallDuration: z.number().int().positive().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional()
});

const rateConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  destinationPrefix: z.string().optional(),
  countryCode: z.string().optional(),
  ratePerMinute: z.string().min(1, "Rate is required"),
  connectionFee: z.string().optional(),
  minimumDuration: z.number().int().optional(),
  billingIncrement: z.number().int().optional(),
  llmCostPerToken: z.string().optional(),
  ttsCostPerChar: z.string().optional(),
  sttCostPerSecond: z.string().optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional()
});

const knowledgeBaseSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

const kbSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sourceType: z.enum(["text", "file", "url", "faq"]),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().optional()
});

const phonebookSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

const contactSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  company: z.string().optional(),
  customFields: z.record(z.any()).optional()
});

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  systemPrompt: z.string().optional(),
  greetingMessage: z.string().optional(),
  fallbackMessage: z.string().optional(),
  voiceId: z.string().optional(),
  voiceProvider: z.string().optional(),
  defaultFlowData: z.any().optional(),
  isGlobal: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional()
});

const assignmentSchema = z.object({
  featureName: z.string().min(1, "Feature name is required"),
  assignmentType: z.enum(["all", "categories", "groups", "specific"]).optional(),
  categoryIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  customerIds: z.array(z.string()).optional(),
  pricingTierId: z.string().optional(),
  maxAgents: z.number().int().optional(),
  maxCallsPerDay: z.number().int().optional(),
  maxConcurrentCalls: z.number().int().optional(),
  allowOutbound: z.boolean().optional(),
  allowInbound: z.boolean().optional(),
  isActive: z.boolean().optional()
});

const settingSchema = z.object({
  settingKey: z.string().min(1, "Setting key is required"),
  settingValue: z.string().optional(),
  settingType: z.enum(["string", "number", "boolean", "json"]).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional()
});

const webhookSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL"),
  events: z.array(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
  secretKey: z.string().optional()
});

export function registerAiVoiceRoutes(app: Express) {
  
  app.get("/api/admin/ai-voice/dashboard", async (req, res) => {
    try {
      const stats = await aiVoiceService.getAgentDashboardStats();
      const pricingTiers = await aiVoiceStorage.getPricingTiers();
      const templates = await aiVoiceStorage.getTemplates();
      const settings = await aiVoiceStorage.getSettings();
      
      res.json({
        ...stats,
        pricingTiersCount: pricingTiers.length,
        templatesCount: templates.length,
        settings: settings.filter(s => s.isPublic)
      });
    } catch (error) {
      console.error("AI Voice dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch AI Voice dashboard" });
    }
  });

  app.get("/api/admin/ai-voice/pricing-tiers", async (req, res) => {
    try {
      const tiers = await aiVoiceStorage.getPricingTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pricing tiers" });
    }
  });

  app.get("/api/admin/ai-voice/pricing-tiers/:id", async (req, res) => {
    try {
      const tier = await aiVoiceStorage.getPricingTier(req.params.id);
      if (!tier) return res.status(404).json({ error: "Pricing tier not found" });
      res.json(tier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pricing tier" });
    }
  });

  app.post("/api/admin/ai-voice/pricing-tiers", async (req, res) => {
    try {
      const parsed = pricingTierSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const tier = await aiVoiceStorage.createPricingTier(parsed.data);
      res.status(201).json(tier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create pricing tier" });
    }
  });

  app.patch("/api/admin/ai-voice/pricing-tiers/:id", async (req, res) => {
    try {
      const tier = await aiVoiceStorage.updatePricingTier(req.params.id, req.body);
      if (!tier) return res.status(404).json({ error: "Pricing tier not found" });
      res.json(tier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update pricing tier" });
    }
  });

  app.delete("/api/admin/ai-voice/pricing-tiers/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deletePricingTier(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Pricing tier not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete pricing tier" });
    }
  });

  app.get("/api/admin/ai-voice/rate-configs", async (req, res) => {
    try {
      const configs = await aiVoiceStorage.getRateConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rate configs" });
    }
  });

  app.post("/api/admin/ai-voice/rate-configs", async (req, res) => {
    try {
      const parsed = rateConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const config = await aiVoiceStorage.createRateConfig(parsed.data);
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to create rate config" });
    }
  });

  app.patch("/api/admin/ai-voice/rate-configs/:id", async (req, res) => {
    try {
      const config = await aiVoiceStorage.updateRateConfig(req.params.id, req.body);
      if (!config) return res.status(404).json({ error: "Rate config not found" });
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rate config" });
    }
  });

  app.delete("/api/admin/ai-voice/rate-configs/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteRateConfig(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Rate config not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rate config" });
    }
  });

  app.get("/api/admin/ai-voice/knowledge-bases", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const kbs = await aiVoiceStorage.getKnowledgeBases(customerId);
      res.json(kbs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge bases" });
    }
  });

  app.get("/api/admin/ai-voice/knowledge-bases/:id", async (req, res) => {
    try {
      const kb = await aiVoiceStorage.getKnowledgeBase(req.params.id);
      if (!kb) return res.status(404).json({ error: "Knowledge base not found" });
      const sources = await aiVoiceStorage.getKbSources(req.params.id);
      res.json({ ...kb, sources });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/admin/ai-voice/knowledge-bases", async (req, res) => {
    try {
      const parsed = knowledgeBaseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const kb = await aiVoiceStorage.createKnowledgeBase(parsed.data);
      res.status(201).json(kb);
    } catch (error) {
      res.status(500).json({ error: "Failed to create knowledge base" });
    }
  });

  app.patch("/api/admin/ai-voice/knowledge-bases/:id", async (req, res) => {
    try {
      const kb = await aiVoiceStorage.updateKnowledgeBase(req.params.id, req.body);
      if (!kb) return res.status(404).json({ error: "Knowledge base not found" });
      res.json(kb);
    } catch (error) {
      res.status(500).json({ error: "Failed to update knowledge base" });
    }
  });

  app.delete("/api/admin/ai-voice/knowledge-bases/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteKnowledgeBase(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Knowledge base not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete knowledge base" });
    }
  });

  app.post("/api/admin/ai-voice/knowledge-bases/:id/train", async (req, res) => {
    try {
      await aiVoiceStorage.updateKnowledgeBase(req.params.id, { status: "processing" });
      const result = await aiVoiceService.trainKnowledgeBase(req.params.id);
      res.json({ 
        success: true, 
        message: "Knowledge base training complete",
        learnedTopics: result.topics,
        extractedFaqs: result.faqs,
        keyPhrases: result.keyPhrases,
        confidenceScore: result.confidence,
        summary: result.summary
      });
    } catch (error) {
      console.error("Training error:", error);
      res.status(500).json({ error: "Failed to train knowledge base" });
    }
  });

  app.get("/api/admin/ai-voice/knowledge-bases/:id/sources", async (req, res) => {
    try {
      const sources = await aiVoiceStorage.getKbSources(req.params.id);
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sources" });
    }
  });

  app.post("/api/admin/ai-voice/knowledge-bases/:id/sources", async (req, res) => {
    try {
      const parsed = kbSourceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const source = await aiVoiceStorage.createKbSource({
        ...parsed.data,
        knowledgeBaseId: req.params.id
      });
      res.status(201).json(source);
    } catch (error) {
      res.status(500).json({ error: "Failed to create source" });
    }
  });

  app.delete("/api/admin/ai-voice/kb-sources/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteKbSource(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Source not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete source" });
    }
  });

  app.get("/api/admin/ai-voice/phonebooks", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const phonebooks = await aiVoiceStorage.getPhonebooks(customerId);
      res.json(phonebooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch phonebooks" });
    }
  });

  app.get("/api/admin/ai-voice/phonebooks/:id", async (req, res) => {
    try {
      const pb = await aiVoiceStorage.getPhonebook(req.params.id);
      if (!pb) return res.status(404).json({ error: "Phonebook not found" });
      const contacts = await aiVoiceStorage.getContacts(req.params.id);
      res.json({ ...pb, contacts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch phonebook" });
    }
  });

  app.post("/api/admin/ai-voice/phonebooks", async (req, res) => {
    try {
      const parsed = phonebookSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const pb = await aiVoiceStorage.createPhonebook(parsed.data);
      res.status(201).json(pb);
    } catch (error) {
      res.status(500).json({ error: "Failed to create phonebook" });
    }
  });

  app.patch("/api/admin/ai-voice/phonebooks/:id", async (req, res) => {
    try {
      const pb = await aiVoiceStorage.updatePhonebook(req.params.id, req.body);
      if (!pb) return res.status(404).json({ error: "Phonebook not found" });
      res.json(pb);
    } catch (error) {
      res.status(500).json({ error: "Failed to update phonebook" });
    }
  });

  app.delete("/api/admin/ai-voice/phonebooks/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deletePhonebook(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Phonebook not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete phonebook" });
    }
  });

  app.get("/api/admin/ai-voice/phonebooks/:id/contacts", async (req, res) => {
    try {
      const contacts = await aiVoiceStorage.getContacts(req.params.id);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/admin/ai-voice/phonebooks/:id/contacts", async (req, res) => {
    try {
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const contact = await aiVoiceStorage.createContact({
        ...parsed.data,
        phonebookId: req.params.id
      });
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to create contact" });
    }
  });

  app.post("/api/admin/ai-voice/phonebooks/:id/contacts/bulk", async (req, res) => {
    try {
      const { contacts } = req.body;
      if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ error: "contacts array is required" });
      }
      const created = await aiVoiceStorage.bulkCreateContacts(req.params.id, contacts);
      res.status(201).json({ created: created.length, contacts: created });
    } catch (error) {
      res.status(500).json({ error: "Failed to bulk create contacts" });
    }
  });

  app.delete("/api/admin/ai-voice/contacts/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteContact(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Contact not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  app.get("/api/admin/ai-voice/templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = await aiVoiceStorage.getTemplates(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/admin/ai-voice/templates/:id", async (req, res) => {
    try {
      const template = await aiVoiceStorage.getTemplate(req.params.id);
      if (!template) return res.status(404).json({ error: "Template not found" });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/admin/ai-voice/templates", async (req, res) => {
    try {
      const parsed = templateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const template = await aiVoiceStorage.createTemplate(parsed.data);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.patch("/api/admin/ai-voice/templates/:id", async (req, res) => {
    try {
      const template = await aiVoiceStorage.updateTemplate(req.params.id, req.body);
      if (!template) return res.status(404).json({ error: "Template not found" });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/admin/ai-voice/templates/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteTemplate(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Template not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.get("/api/admin/ai-voice/campaigns", async (req, res) => {
    try {
      const campaigns = await aiVoiceStorage.getAiVoiceCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/admin/ai-voice/campaigns/:id", async (req, res) => {
    try {
      const campaign = await aiVoiceStorage.getAiVoiceCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.post("/api/admin/ai-voice/campaigns", async (req, res) => {
    try {
      const campaign = await aiVoiceStorage.createAiVoiceCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.patch("/api/admin/ai-voice/campaigns/:id", async (req, res) => {
    try {
      const campaign = await aiVoiceStorage.updateAiVoiceCampaign(req.params.id, req.body);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/admin/ai-voice/campaigns/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteAiVoiceCampaign(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Campaign not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.post("/api/admin/ai-voice/campaigns/:id/start", async (req, res) => {
    try {
      const campaign = await aiVoiceStorage.updateAiVoiceCampaign(req.params.id, { status: "running" });
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to start campaign" });
    }
  });

  app.post("/api/admin/ai-voice/campaigns/:id/pause", async (req, res) => {
    try {
      const campaign = await aiVoiceStorage.updateAiVoiceCampaign(req.params.id, { status: "paused" });
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to pause campaign" });
    }
  });

  app.get("/api/admin/ai-voice/usage", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const billingPeriod = req.query.billingPeriod as string | undefined;
      const usage = await aiVoiceStorage.getUsage(customerId, billingPeriod);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch usage" });
    }
  });

  app.get("/api/admin/ai-voice/analytics", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const analytics = await aiVoiceService.getAnalytics(customerId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/ai-voice/call-logs", async (req, res) => {
    try {
      const { agentId, campaignId, customerId } = req.query;
      const logs = await aiVoiceStorage.getCallLogs({
        agentId: agentId as string,
        campaignId: campaignId as string,
        customerId: customerId as string
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch call logs" });
    }
  });

  app.get("/api/admin/ai-voice/call-logs/:id", async (req, res) => {
    try {
      const log = await aiVoiceStorage.getCallLog(req.params.id);
      if (!log) return res.status(404).json({ error: "Call log not found" });
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch call log" });
    }
  });

  app.get("/api/admin/ai-voice/assignments", async (req, res) => {
    try {
      const featureName = req.query.featureName as string | undefined;
      const assignments = await aiVoiceStorage.getAssignments(featureName);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.post("/api/admin/ai-voice/assignments", async (req, res) => {
    try {
      const parsed = assignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const assignment = await aiVoiceStorage.createAssignment(parsed.data);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  app.patch("/api/admin/ai-voice/assignments/:id", async (req, res) => {
    try {
      const assignment = await aiVoiceStorage.updateAssignment(req.params.id, req.body);
      if (!assignment) return res.status(404).json({ error: "Assignment not found" });
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  app.delete("/api/admin/ai-voice/assignments/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteAssignment(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Assignment not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });

  app.get("/api/admin/ai-voice/settings", async (req, res) => {
    try {
      const settings = await aiVoiceStorage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/ai-voice/settings", async (req, res) => {
    try {
      const parsed = settingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const setting = await aiVoiceStorage.upsertSetting(parsed.data);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.get("/api/admin/ai-voice/webhooks", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const webhooks = await aiVoiceStorage.getWebhooks(customerId);
      res.json(webhooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch webhooks" });
    }
  });

  app.post("/api/admin/ai-voice/webhooks", async (req, res) => {
    try {
      const parsed = webhookSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Validation failed" });
      }
      const webhook = await aiVoiceStorage.createWebhook(parsed.data);
      res.status(201).json(webhook);
    } catch (error) {
      res.status(500).json({ error: "Failed to create webhook" });
    }
  });

  app.patch("/api/admin/ai-voice/webhooks/:id", async (req, res) => {
    try {
      const webhook = await aiVoiceStorage.updateWebhook(req.params.id, req.body);
      if (!webhook) return res.status(404).json({ error: "Webhook not found" });
      res.json(webhook);
    } catch (error) {
      res.status(500).json({ error: "Failed to update webhook" });
    }
  });

  app.delete("/api/admin/ai-voice/webhooks/:id", async (req, res) => {
    try {
      const deleted = await aiVoiceStorage.deleteWebhook(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Webhook not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  });

  app.get("/api/customer/ai-voice/dashboard", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.customerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const stats = await aiVoiceService.getAgentDashboardStats(user.customerId);
      const defaultTier = await aiVoiceStorage.getDefaultPricingTier();
      res.json({
        ...stats,
        pricingTier: defaultTier ? {
          name: defaultTier.name,
          ratePerMinute: defaultTier.ratePerMinute
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.get("/api/customer/ai-voice/templates", async (req, res) => {
    try {
      const templates = await aiVoiceStorage.getTemplates();
      res.json(templates.filter(t => t.isGlobal));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/customer/ai-voice/knowledge-bases", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.customerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const kbs = await aiVoiceStorage.getKnowledgeBases(user.customerId);
      res.json(kbs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge bases" });
    }
  });

  app.get("/api/customer/ai-voice/phonebooks", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.customerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const phonebooks = await aiVoiceStorage.getPhonebooks(user.customerId);
      res.json(phonebooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch phonebooks" });
    }
  });

  app.get("/api/customer/ai-voice/analytics", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.customerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const analytics = await aiVoiceService.getAnalytics(user.customerId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/customer/ai-voice/usage", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.customerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const billingPeriod = req.query.billingPeriod as string | undefined;
      const usage = await aiVoiceStorage.getUsage(user.customerId, billingPeriod);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch usage" });
    }
  });
}
