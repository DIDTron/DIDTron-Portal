import { Express } from "express";
import { storage } from "../storage";
import { insertAiVoiceAgentSchema } from "@shared/schema";

export function registerPortalAiVoiceRoutes(app: Express): void {
  // ==================== CUSTOMER AI VOICE AGENTS ====================

  app.get("/api/my/ai-voice/agents", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agents = await storage.getAiVoiceAgents(user.customerId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agents" });
    }
  });

  app.get("/api/my/ai-voice/agents/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agent" });
    }
  });

  app.post("/api/my/ai-voice/agents", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const { name, description, type, voiceId, voiceProvider, systemPrompt, 
              greetingMessage, fallbackMessage, maxCallDuration, webhookUrl } = req.body;
      
      const parsed = insertAiVoiceAgentSchema.omit({ customerId: true }).safeParse({
        name, description, type, voiceId, voiceProvider, systemPrompt,
        greetingMessage, fallbackMessage, maxCallDuration, webhookUrl
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const agent = await storage.createAiVoiceAgent({
        ...parsed.data,
        customerId: user.customerId,
      });
      res.status(201).json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create AI voice agent" });
    }
  });

  app.patch("/api/my/ai-voice/agents/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      const { name, description, type, voiceId, voiceProvider, systemPrompt, 
              greetingMessage, fallbackMessage, maxCallDuration, webhookUrl, status } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (voiceId !== undefined) updateData.voiceId = voiceId;
      if (voiceProvider !== undefined) updateData.voiceProvider = voiceProvider;
      if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
      if (greetingMessage !== undefined) updateData.greetingMessage = greetingMessage;
      if (fallbackMessage !== undefined) updateData.fallbackMessage = fallbackMessage;
      if (maxCallDuration !== undefined) updateData.maxCallDuration = maxCallDuration;
      if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
      if (status !== undefined) updateData.status = status;
      
      const updated = await storage.updateAiVoiceAgent(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update AI voice agent" });
    }
  });

  app.delete("/api/my/ai-voice/agents/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      await storage.deleteAiVoiceAgent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete AI voice agent" });
    }
  });

  // ==================== CUSTOMER AI VOICE TRAINING DATA ====================

  app.get("/api/my/ai-voice/agents/:agentId/training", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      const training = await storage.getAiVoiceTrainingData(req.params.agentId);
      res.json(training);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training data" });
    }
  });

  app.post("/api/my/ai-voice/agents/:agentId/training", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      const { category, question, answer, isActive } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }
      const training = await storage.createAiVoiceTrainingData({
        agentId: req.params.agentId,
        category: category || null,
        question,
        answer,
        isActive: isActive ?? true
      });
      res.status(201).json(training);
    } catch (error) {
      res.status(500).json({ error: "Failed to create training data" });
    }
  });

  app.patch("/api/my/ai-voice/training/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const item = await storage.getAiVoiceTrainingDataItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Training data not found" });
      }
      const agent = await storage.getAiVoiceAgent(item.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Training data not found" });
      }
      const { category, question, answer, isActive } = req.body;
      const updateData: Record<string, unknown> = {};
      if (category !== undefined) updateData.category = category;
      if (question !== undefined) updateData.question = question;
      if (answer !== undefined) updateData.answer = answer;
      if (isActive !== undefined) updateData.isActive = isActive;
      const updated = await storage.updateAiVoiceTrainingData(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update training data" });
    }
  });

  app.delete("/api/my/ai-voice/training/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const item = await storage.getAiVoiceTrainingDataItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Training data not found" });
      }
      const agent = await storage.getAiVoiceAgent(item.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Training data not found" });
      }
      await storage.deleteAiVoiceTrainingData(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete training data" });
    }
  });

  // ==================== CUSTOMER AI VOICE CAMPAIGNS ====================

  app.get("/api/my/ai-voice/campaigns", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaigns = await storage.getAiVoiceCampaigns(user.customerId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/my/ai-voice/campaigns/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.post("/api/my/ai-voice/campaigns", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const { agentId, name, description, contactList, scheduledAt, maxConcurrentCalls } = req.body;
      if (!agentId || !name) {
        return res.status(400).json({ error: "Agent and name are required" });
      }
      const agent = await storage.getAiVoiceAgent(agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(400).json({ error: "Invalid agent" });
      }
      const contacts = Array.isArray(contactList) ? contactList : [];
      const campaign = await storage.createAiVoiceCampaign({
        customerId: user.customerId,
        agentId,
        name,
        description: description || null,
        contactList: contacts,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        maxConcurrentCalls: maxConcurrentCalls || 5,
        callsTotal: contacts.length,
        status: "draft"
      });
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.patch("/api/my/ai-voice/campaigns/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const { name, description, contactList, scheduledAt, maxConcurrentCalls, status } = req.body;
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (contactList !== undefined) {
        updateData.contactList = contactList;
        updateData.callsTotal = Array.isArray(contactList) ? contactList.length : 0;
      }
      if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      if (maxConcurrentCalls !== undefined) updateData.maxConcurrentCalls = maxConcurrentCalls;
      if (status !== undefined) updateData.status = status;
      const updated = await storage.updateAiVoiceCampaign(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/my/ai-voice/campaigns/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      await storage.deleteAiVoiceCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.post("/api/my/ai-voice/campaigns/:id/start", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      if (campaign.status === "running") {
        return res.status(400).json({ error: "Campaign is already running" });
      }
      const { enqueueJob } = await import("../job-queue");
      const jobId = await enqueueJob("ai_voice_campaign_start", {
        campaignId: req.params.id,
        customerId: user.customerId,
        userId: req.session.userId,
      });
      await storage.updateAiVoiceCampaign(req.params.id, { 
        status: "running",
        startedAt: new Date()
      });
      res.json({ success: true, jobId, message: "Campaign started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start campaign" });
    }
  });

  app.post("/api/my/ai-voice/campaigns/:id/pause", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      if (campaign.status !== "running") {
        return res.status(400).json({ error: "Campaign is not running" });
      }
      await storage.updateAiVoiceCampaign(req.params.id, { status: "paused" });
      res.json({ success: true, message: "Campaign paused" });
    } catch (error) {
      res.status(500).json({ error: "Failed to pause campaign" });
    }
  });

  // ==================== CUSTOMER AI VOICE KNOWLEDGE BASES ====================

  app.get("/api/my/ai-voice/knowledge-bases", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kbs = await storage.getAiVoiceKnowledgeBases(user.customerId);
      res.json(kbs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge bases" });
    }
  });

  app.get("/api/my/ai-voice/knowledge-bases/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kb = await storage.getAiVoiceKnowledgeBase(req.params.id);
      if (!kb || kb.customerId !== user.customerId) {
        return res.status(404).json({ error: "Knowledge base not found" });
      }
      res.json(kb);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/my/ai-voice/knowledge-bases", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const kb = await storage.createAiVoiceKnowledgeBase({
        customerId: user.customerId,
        name,
        description: description || null
      });
      res.status(201).json(kb);
    } catch (error) {
      res.status(500).json({ error: "Failed to create knowledge base" });
    }
  });

  app.post("/api/my/ai-voice/knowledge-bases/:id/train", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kb = await storage.getAiVoiceKnowledgeBase(req.params.id);
      if (!kb || kb.customerId !== user.customerId) {
        return res.status(404).json({ error: "Knowledge base not found" });
      }
      if (kb.status === "processing") {
        return res.status(400).json({ error: "Training already in progress" });
      }
      await storage.updateAiVoiceKnowledgeBase(req.params.id, { status: "processing" });
      const { enqueueJob } = await import("../job-queue");
      const jobId = await enqueueJob("ai_voice_kb_train", {
        knowledgeBaseId: req.params.id,
        agentId: req.body.agentId || "",
        customerId: user.customerId,
        userId: req.session.userId,
      });
      res.json({ success: true, jobId, message: "Training started", id: req.params.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to start training" });
    }
  });

  app.delete("/api/my/ai-voice/knowledge-bases/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kb = await storage.getAiVoiceKnowledgeBase(req.params.id);
      if (!kb || kb.customerId !== user.customerId) {
        return res.status(404).json({ error: "Knowledge base not found" });
      }
      await storage.deleteAiVoiceKnowledgeBase(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete knowledge base" });
    }
  });
}
