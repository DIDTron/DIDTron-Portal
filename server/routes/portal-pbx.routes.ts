import { Express } from "express";
import { storage } from "../storage";
import { 
  insertExtensionSchema,
  insertIvrSchema,
  insertRingGroupSchema,
  insertQueueSchema
} from "@shared/schema";

export function registerPortalPbxRoutes(app: Express): void {
  // ==================== CUSTOMER PBX EXTENSIONS ====================

  app.get("/api/my/extensions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const extensions = await storage.getExtensions(user.customerId);
      res.json(extensions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch extensions" });
    }
  });

  app.get("/api/my/extensions/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ext = await storage.getExtension(req.params.id);
      if (!ext || ext.customerId !== user.customerId) {
        return res.status(404).json({ error: "Extension not found" });
      }
      res.json(ext);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch extension" });
    }
  });

  app.post("/api/my/extensions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertExtensionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid extension data", details: validation.error.errors });
      }
      
      const ext = await storage.createExtension({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(ext);
    } catch (error) {
      res.status(500).json({ error: "Failed to create extension" });
    }
  });

  app.patch("/api/my/extensions/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ext = await storage.getExtension(req.params.id);
      if (!ext || ext.customerId !== user.customerId) {
        return res.status(404).json({ error: "Extension not found" });
      }
      
      const { name, email, callerId, voicemailEnabled, voicemailPin, voicemailEmail, 
              ringTimeout, dndEnabled, callWaitingEnabled, forwardingEnabled, forwardingDestination, status } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (callerId !== undefined) updateData.callerId = callerId;
      if (voicemailEnabled !== undefined) updateData.voicemailEnabled = voicemailEnabled;
      if (voicemailPin !== undefined) updateData.voicemailPin = voicemailPin;
      if (voicemailEmail !== undefined) updateData.voicemailEmail = voicemailEmail;
      if (ringTimeout !== undefined) updateData.ringTimeout = ringTimeout;
      if (dndEnabled !== undefined) updateData.dndEnabled = dndEnabled;
      if (callWaitingEnabled !== undefined) updateData.callWaitingEnabled = callWaitingEnabled;
      if (forwardingEnabled !== undefined) updateData.forwardingEnabled = forwardingEnabled;
      if (forwardingDestination !== undefined) updateData.forwardingDestination = forwardingDestination;
      if (status !== undefined) updateData.status = status;
      
      const updated = await storage.updateExtension(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update extension" });
    }
  });

  app.delete("/api/my/extensions/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ext = await storage.getExtension(req.params.id);
      if (!ext || ext.customerId !== user.customerId) {
        return res.status(404).json({ error: "Extension not found" });
      }
      await storage.deleteExtension(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete extension" });
    }
  });

  // ==================== CUSTOMER IVRs ====================

  app.get("/api/my/ivrs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivrs = await storage.getIvrs(user.customerId);
      res.json(ivrs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IVRs" });
    }
  });

  app.get("/api/my/ivrs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivr = await storage.getIvr(req.params.id);
      if (!ivr || ivr.customerId !== user.customerId) {
        return res.status(404).json({ error: "IVR not found" });
      }
      res.json(ivr);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IVR" });
    }
  });

  app.post("/api/my/ivrs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertIvrSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid IVR data", details: validation.error.errors });
      }
      
      const ivr = await storage.createIvr({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(ivr);
    } catch (error) {
      res.status(500).json({ error: "Failed to create IVR" });
    }
  });

  app.patch("/api/my/ivrs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivr = await storage.getIvr(req.params.id);
      if (!ivr || ivr.customerId !== user.customerId) {
        return res.status(404).json({ error: "IVR not found" });
      }
      
      const { name, description, greetingType, greetingText, timeout, maxRetries,
              invalidDestination, timeoutDestination, isActive } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (greetingType !== undefined) updateData.greetingType = greetingType;
      if (greetingText !== undefined) updateData.greetingText = greetingText;
      if (timeout !== undefined) updateData.timeout = timeout;
      if (maxRetries !== undefined) updateData.maxRetries = maxRetries;
      if (invalidDestination !== undefined) updateData.invalidDestination = invalidDestination;
      if (timeoutDestination !== undefined) updateData.timeoutDestination = timeoutDestination;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateIvr(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update IVR" });
    }
  });

  app.delete("/api/my/ivrs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivr = await storage.getIvr(req.params.id);
      if (!ivr || ivr.customerId !== user.customerId) {
        return res.status(404).json({ error: "IVR not found" });
      }
      await storage.deleteIvr(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete IVR" });
    }
  });

  // ==================== CUSTOMER RING GROUPS ====================

  app.get("/api/my/ring-groups", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ringGroups = await storage.getRingGroups(user.customerId);
      res.json(ringGroups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ring groups" });
    }
  });

  app.get("/api/my/ring-groups/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const rg = await storage.getRingGroup(req.params.id);
      if (!rg || rg.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ring group not found" });
      }
      res.json(rg);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ring group" });
    }
  });

  app.post("/api/my/ring-groups", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertRingGroupSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid ring group data", details: validation.error.errors });
      }
      
      const rg = await storage.createRingGroup({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(rg);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ring group" });
    }
  });

  app.patch("/api/my/ring-groups/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const rg = await storage.getRingGroup(req.params.id);
      if (!rg || rg.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ring group not found" });
      }
      
      const { name, extension, strategy, ringTimeout, noAnswerDestination, isActive } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (extension !== undefined) updateData.extension = extension;
      if (strategy !== undefined) updateData.strategy = strategy;
      if (ringTimeout !== undefined) updateData.ringTimeout = ringTimeout;
      if (noAnswerDestination !== undefined) updateData.noAnswerDestination = noAnswerDestination;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateRingGroup(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ring group" });
    }
  });

  app.delete("/api/my/ring-groups/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const rg = await storage.getRingGroup(req.params.id);
      if (!rg || rg.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ring group not found" });
      }
      await storage.deleteRingGroup(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ring group" });
    }
  });

  // ==================== CUSTOMER QUEUES ====================

  app.get("/api/my/queues", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queues = await storage.getQueues(user.customerId);
      res.json(queues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queues" });
    }
  });

  app.get("/api/my/queues/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queue = await storage.getQueue(req.params.id);
      if (!queue || queue.customerId !== user.customerId) {
        return res.status(404).json({ error: "Queue not found" });
      }
      res.json(queue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue" });
    }
  });

  app.post("/api/my/queues", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertQueueSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid queue data", details: validation.error.errors });
      }
      
      const queue = await storage.createQueue({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(queue);
    } catch (error) {
      res.status(500).json({ error: "Failed to create queue" });
    }
  });

  app.patch("/api/my/queues/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queue = await storage.getQueue(req.params.id);
      if (!queue || queue.customerId !== user.customerId) {
        return res.status(404).json({ error: "Queue not found" });
      }
      
      const { name, extension, strategy, maxWaitTime, announcePosition, 
              holdMusicUrl, timeoutDestination, isActive } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (extension !== undefined) updateData.extension = extension;
      if (strategy !== undefined) updateData.strategy = strategy;
      if (maxWaitTime !== undefined) updateData.maxWaitTime = maxWaitTime;
      if (announcePosition !== undefined) updateData.announcePosition = announcePosition;
      if (holdMusicUrl !== undefined) updateData.holdMusicUrl = holdMusicUrl;
      if (timeoutDestination !== undefined) updateData.timeoutDestination = timeoutDestination;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateQueue(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update queue" });
    }
  });

  app.delete("/api/my/queues/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queue = await storage.getQueue(req.params.id);
      if (!queue || queue.customerId !== user.customerId) {
        return res.status(404).json({ error: "Queue not found" });
      }
      await storage.deleteQueue(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete queue" });
    }
  });
}
