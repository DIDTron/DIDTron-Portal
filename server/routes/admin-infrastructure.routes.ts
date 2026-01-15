import type { Express } from "express";
import { storage } from "../storage";
import {
  insertPopSchema,
  insertVoiceTierSchema,
  insertCodecSchema,
  insertChannelPlanSchema,
  insertRouteSchema,
} from "@shared/schema";
import { auditService } from "../audit-service";
import { connexcs } from "../connexcs";

export function registerAdminInfrastructureRoutes(app: Express): void {
  // ==================== POPs ====================

  app.get("/api/pops", async (req, res) => {
    try {
      const pops = await storage.getPops();
      res.json(pops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POPs" });
    }
  });

  app.get("/api/pops/:id", async (req, res) => {
    try {
      const pop = await storage.getPop(req.params.id);
      if (!pop) return res.status(404).json({ error: "POP not found" });
      res.json(pop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch POP" });
    }
  });

  app.post("/api/pops", async (req, res) => {
    try {
      const parsed = insertPopSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const pop = await storage.createPop(parsed.data);
      res.status(201).json(pop);
    } catch (error) {
      res.status(500).json({ error: "Failed to create POP" });
    }
  });

  app.patch("/api/pops/:id", async (req, res) => {
    try {
      const pop = await storage.updatePop(req.params.id, req.body);
      if (!pop) return res.status(404).json({ error: "POP not found" });
      res.json(pop);
    } catch (error) {
      res.status(500).json({ error: "Failed to update POP" });
    }
  });

  app.delete("/api/pops/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePop(req.params.id);
      if (!deleted) return res.status(404).json({ error: "POP not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete POP" });
    }
  });

  // ==================== VOICE TIERS ====================

  app.get("/api/voice-tiers", async (req, res) => {
    try {
      const tiers = await storage.getVoiceTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voice tiers" });
    }
  });

  app.get("/api/voice-tiers/:id", async (req, res) => {
    try {
      const tier = await storage.getVoiceTier(req.params.id);
      if (!tier) return res.status(404).json({ error: "Voice tier not found" });
      res.json(tier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch voice tier" });
    }
  });

  app.post("/api/voice-tiers", async (req, res) => {
    try {
      const parsed = insertVoiceTierSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const tier = await storage.createVoiceTier(parsed.data);
      res.status(201).json(tier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create voice tier" });
    }
  });

  app.patch("/api/voice-tiers/:id", async (req, res) => {
    try {
      const tier = await storage.updateVoiceTier(req.params.id, req.body);
      if (!tier) return res.status(404).json({ error: "Voice tier not found" });
      res.json(tier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update voice tier" });
    }
  });

  app.delete("/api/voice-tiers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVoiceTier(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Voice tier not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete voice tier" });
    }
  });

  // ==================== CODECS ====================

  app.get("/api/codecs", async (req, res) => {
    try {
      const codecs = await storage.getCodecs();
      res.json(codecs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch codecs" });
    }
  });

  app.post("/api/codecs", async (req, res) => {
    try {
      const parsed = insertCodecSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const codec = await storage.createCodec(parsed.data);
      res.status(201).json(codec);
    } catch (error) {
      res.status(500).json({ error: "Failed to create codec" });
    }
  });

  app.patch("/api/codecs/:id", async (req, res) => {
    try {
      const codec = await storage.updateCodec(req.params.id, req.body);
      if (!codec) return res.status(404).json({ error: "Codec not found" });
      res.json(codec);
    } catch (error) {
      res.status(500).json({ error: "Failed to update codec" });
    }
  });

  app.delete("/api/codecs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCodec(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Codec not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete codec" });
    }
  });

  // ==================== CHANNEL PLANS ====================

  app.get("/api/channel-plans", async (req, res) => {
    try {
      const plans = await storage.getChannelPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch channel plans" });
    }
  });

  app.post("/api/channel-plans", async (req, res) => {
    try {
      const parsed = insertChannelPlanSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const plan = await storage.createChannelPlan(parsed.data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create channel plan" });
    }
  });

  app.patch("/api/channel-plans/:id", async (req, res) => {
    try {
      const plan = await storage.updateChannelPlan(req.params.id, req.body);
      if (!plan) return res.status(404).json({ error: "Channel plan not found" });
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update channel plan" });
    }
  });

  app.delete("/api/channel-plans/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChannelPlan(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Channel plan not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete channel plan" });
    }
  });

  // ==================== ROUTES ====================

  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/:id", async (req, res) => {
    try {
      const route = await storage.resolveRoute(req.params.id);
      if (!route) return res.status(404).json({ error: "Route not found" });
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch route" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const parsed = insertRouteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const route = await storage.createRoute(parsed.data);
      await auditService.logWithRequest(req, "create", "routes", route.id, null, route as Record<string, unknown>);
      
      try {
        await connexcs.loadCredentialsFromStorage(storage);
        if (connexcs.isConfigured()) {
          const syncResult = await connexcs.syncRoute({
            id: route.id,
            name: route.name,
            prefix: route.prefix,
            priority: route.priority,
            weight: route.weight,
          });
          if (syncResult.connexcsId) {
            await storage.updateRoute(route.id, { connexcsRouteId: syncResult.connexcsId });
          }
          console.log(`[ConnexCS] Route ${route.name} synced: ${syncResult.connexcsId}`);
        }
      } catch (syncError) {
        console.error("[ConnexCS] Auto-sync route failed:", syncError);
      }
      
      res.status(201).json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to create route" });
    }
  });

  app.patch("/api/routes/:id", async (req, res) => {
    try {
      const oldRoute = await storage.resolveRoute(req.params.id);
      if (!oldRoute) return res.status(404).json({ error: "Route not found" });
      const route = await storage.updateRoute(oldRoute.id, req.body);
      if (!route) return res.status(404).json({ error: "Route not found" });
      await auditService.logWithRequest(req, "update", "routes", oldRoute.id, oldRoute as Record<string, unknown>, route as Record<string, unknown>);
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to update route" });
    }
  });

  app.delete("/api/routes/:id", async (req, res) => {
    try {
      const oldRoute = await storage.resolveRoute(req.params.id);
      if (!oldRoute) return res.status(404).json({ error: "Route not found" });
      
      await auditService.moveToTrash("routes", oldRoute.id, oldRoute as Record<string, unknown>, req.session?.userId);
      
      const deleted = await storage.deleteRoute(oldRoute.id);
      if (!deleted) return res.status(404).json({ error: "Route not found" });
      
      await auditService.logWithRequest(req, "delete", "routes", oldRoute.id, oldRoute as Record<string, unknown>, null);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete route" });
    }
  });
}
