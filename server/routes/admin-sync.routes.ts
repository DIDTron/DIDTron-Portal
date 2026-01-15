import type { Express } from "express";
import { storage } from "../storage";
import { connexcs } from "../connexcs";

export function registerAdminSyncRoutes(app: Express): void {
  // ==================== PLATFORM SYNC ====================

  app.get("/api/platform/status", async (req, res) => {
    try {
      const mockMode = connexcs.isMockMode();
      const metrics = await connexcs.getMetrics();
      res.json({ mockMode, connected: !mockMode, metrics });
    } catch (error) {
      console.error("Platform status error:", error);
      res.status(500).json({ error: "Failed to get platform status", mockMode: true });
    }
  });

  app.get("/api/platform/carriers", async (req, res) => {
    try {
      const carriers = await connexcs.getCarriers();
      res.json(carriers);
    } catch (error) {
      console.error("Platform carriers error:", error);
      res.status(500).json({ error: "Failed to fetch platform carriers" });
    }
  });

  app.get("/api/platform/routes", async (req, res) => {
    try {
      const routes = await connexcs.getRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Platform routes error:", error);
      res.status(500).json({ error: "Failed to fetch platform routes" });
    }
  });

  app.get("/api/platform/metrics", async (req, res) => {
    try {
      const metrics = await connexcs.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Platform metrics error:", error);
      res.status(500).json({ error: "Failed to fetch platform metrics" });
    }
  });

  app.post("/api/carriers/:id/sync", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) {
        return res.status(404).json({ error: "Carrier not found" });
      }
      const result = await connexcs.syncCarrier({
        id: carrier.id,
        name: carrier.name,
      });
      if (result.synced) {
        await storage.updateCarrier(carrier.id, { connexcsCarrierId: result.connexcsId });
      }
      res.json({ synced: result.synced, platformId: result.connexcsId });
    } catch (error) {
      console.error("Platform sync carrier error:", error);
      res.status(500).json({ error: "Failed to sync carrier with platform" });
    }
  });

  app.post("/api/routes/:id/sync", async (req, res) => {
    try {
      const route = await storage.getRoute(req.params.id);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      const result = await connexcs.syncRoute({
        id: route.id,
        name: route.name,
        prefix: route.prefix,
        priority: route.priority,
        weight: route.weight,
      });
      res.json({ synced: result.synced, platformId: result.connexcsId });
    } catch (error) {
      console.error("Platform sync route error:", error);
      res.status(500).json({ error: "Failed to sync route with platform" });
    }
  });

  app.post("/api/platform/test-route", async (req, res) => {
    try {
      const { destination } = req.body;
      if (!destination) {
        return res.status(400).json({ error: "destination is required" });
      }
      const result = await connexcs.testRoute(destination);
      res.json(result);
    } catch (error) {
      console.error("Platform test route error:", error);
      res.status(500).json({ error: "Failed to test route" });
    }
  });
}
