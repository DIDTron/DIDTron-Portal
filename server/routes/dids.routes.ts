import type { Express } from "express";
import { storage } from "../storage";
import { insertDidCountrySchema, insertDidSchema } from "@shared/schema";

export function registerDidsRoutes(app: Express) {
  // ==================== DID COUNTRIES ====================

  app.get("/api/did-countries", async (req, res) => {
    try {
      const countries = await storage.getDidCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DID countries" });
    }
  });

  app.post("/api/did-countries", async (req, res) => {
    try {
      const parsed = insertDidCountrySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const country = await storage.createDidCountry(parsed.data);
      res.status(201).json(country);
    } catch (error) {
      res.status(500).json({ error: "Failed to create DID country" });
    }
  });

  app.patch("/api/did-countries/:id", async (req, res) => {
    try {
      const country = await storage.updateDidCountry(req.params.id, req.body);
      if (!country) return res.status(404).json({ error: "DID country not found" });
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: "Failed to update DID country" });
    }
  });

  app.delete("/api/did-countries/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDidCountry(req.params.id);
      if (!deleted) return res.status(404).json({ error: "DID country not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete DID country" });
    }
  });

  // ==================== DID PROVIDERS ====================

  app.get("/api/did-providers", async (req, res) => {
    try {
      const providers = await storage.getDidProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DID providers" });
    }
  });

  app.get("/api/did-providers/:id", async (req, res) => {
    try {
      const provider = await storage.getDidProvider(req.params.id);
      if (!provider) return res.status(404).json({ error: "DID provider not found" });
      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DID provider" });
    }
  });

  app.post("/api/did-providers", async (req, res) => {
    try {
      const provider = await storage.createDidProvider(req.body);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "did_providers",
        recordId: provider.id,
        newValues: provider,
      });
      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: "Failed to create DID provider" });
    }
  });

  app.patch("/api/did-providers/:id", async (req, res) => {
    try {
      const oldProvider = await storage.getDidProvider(req.params.id);
      const provider = await storage.updateDidProvider(req.params.id, req.body);
      if (!provider) return res.status(404).json({ error: "DID provider not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "did_providers",
        recordId: req.params.id,
        oldValues: oldProvider,
        newValues: provider,
      });
      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: "Failed to update DID provider" });
    }
  });

  app.delete("/api/did-providers/:id", async (req, res) => {
    try {
      const oldProvider = await storage.getDidProvider(req.params.id);
      await storage.deleteDidProvider(req.params.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "did_providers",
        recordId: req.params.id,
        oldValues: oldProvider,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete DID provider" });
    }
  });

  // ==================== DID INVENTORY ====================

  app.get("/api/dids", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const dids = await storage.getDids(customerId);
      res.json(dids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DIDs" });
    }
  });

  app.get("/api/dids/:id", async (req, res) => {
    try {
      const did = await storage.getDid(req.params.id);
      if (!did) return res.status(404).json({ error: "DID not found" });
      res.json(did);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DID" });
    }
  });

  app.post("/api/dids", async (req, res) => {
    try {
      const parsed = insertDidSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid DID data", details: parsed.error.issues });
      }
      const did = await storage.createDid(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "dids",
        recordId: did.id,
        newValues: did,
      });
      res.status(201).json(did);
    } catch (error) {
      res.status(500).json({ error: "Failed to create DID" });
    }
  });

  app.patch("/api/dids/:id", async (req, res) => {
    try {
      const oldDid = await storage.getDid(req.params.id);
      const did = await storage.updateDid(req.params.id, req.body);
      if (!did) return res.status(404).json({ error: "DID not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "dids",
        recordId: req.params.id,
        oldValues: oldDid,
        newValues: did,
      });
      res.json(did);
    } catch (error) {
      res.status(500).json({ error: "Failed to update DID" });
    }
  });
}
