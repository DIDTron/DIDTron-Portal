import { Express } from "express";
import { storage } from "../storage";

export function registerPortalCrmRoutes(app: Express): void {
  // ==================== CRM INTEGRATIONS ====================

  app.get("/api/my/crm/connections", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connections = await storage.getCrmConnections(user.customerId);
      const safeConnections = connections.map(c => {
        const { accessToken, refreshToken, ...rest } = c;
        return { ...rest, hasCredentials: !!accessToken };
      });
      res.json(safeConnections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CRM connections" });
    }
  });

  app.get("/api/my/crm/connections/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      const { accessToken, refreshToken, ...rest } = connection;
      res.json({ ...rest, hasCredentials: !!accessToken });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CRM connection" });
    }
  });

  app.post("/api/my/crm/connections", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const { name, provider, instanceUrl, accessToken, refreshToken } = req.body;
      if (!name || !provider) {
        return res.status(400).json({ error: "Name and provider are required" });
      }
      if (!["salesforce", "hubspot"].includes(provider)) {
        return res.status(400).json({ error: "Invalid provider. Must be salesforce or hubspot" });
      }
      const connection = await storage.createCrmConnection({
        customerId: user.customerId,
        name,
        provider,
        instanceUrl: instanceUrl || null,
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        status: accessToken ? "connected" : "pending",
      });
      await storage.upsertCrmSyncSettings({
        connectionId: connection.id,
        syncCallLogs: true,
        syncContacts: true,
        autoLogActivities: true,
      });
      const { accessToken: _at, refreshToken: _rt, ...rest } = connection;
      res.status(201).json({ ...rest, hasCredentials: !!connection.accessToken });
    } catch (error) {
      res.status(500).json({ error: "Failed to create CRM connection" });
    }
  });

  app.patch("/api/my/crm/connections/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      const updated = await storage.updateCrmConnection(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Connection not found" });
      }
      const { accessToken: _at, refreshToken: _rt, ...rest } = updated;
      res.json({ ...rest, hasCredentials: !!updated.accessToken });
    } catch (error) {
      res.status(500).json({ error: "Failed to update CRM connection" });
    }
  });

  app.delete("/api/my/crm/connections/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      await storage.deleteCrmConnection(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete CRM connection" });
    }
  });

  app.post("/api/my/crm/connections/:id/test", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      const { getCrmClient } = await import("../crm-service");
      const client = getCrmClient(connection);
      const result = await client.testConnection();
      if (result.success) {
        await storage.updateCrmConnection(req.params.id, { status: "connected", lastError: null });
      } else {
        await storage.updateCrmConnection(req.params.id, { status: "error", lastError: result.error || "Test failed" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to test connection" });
    }
  });

  app.get("/api/my/crm/connections/:id/settings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      const settings = await storage.getCrmSyncSettings(req.params.id);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync settings" });
    }
  });

  app.put("/api/my/crm/connections/:id/settings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      const settings = await storage.upsertCrmSyncSettings({
        connectionId: req.params.id,
        ...req.body,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sync settings" });
    }
  });

  app.get("/api/my/crm/connections/:id/logs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getCrmSyncLogs(req.params.id, limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  app.post("/api/my/crm/connections/:id/sync", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      if (connection.status !== "connected") {
        return res.status(400).json({ error: "CRM is not connected" });
      }
      const log = await storage.createCrmSyncLog({
        connectionId: req.params.id,
        syncType: req.body.syncType || "contacts",
        direction: "outbound",
        status: "running",
      });
      res.json({ success: true, syncLogId: log.id, message: "Sync started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start sync" });
    }
  });

  app.get("/api/my/crm/connections/:id/contacts/search", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      if (connection.status !== "connected") {
        return res.status(400).json({ error: "CRM is not connected" });
      }
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const { getCrmClient } = await import("../crm-service");
      const client = getCrmClient(connection);
      const contacts = await client.searchContacts(query, 10);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to search contacts" });
    }
  });

  app.get("/api/my/crm/connections/:id/contacts/lookup", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const connection = await storage.getCrmConnection(req.params.id);
      if (!connection || connection.customerId !== user.customerId) {
        return res.status(404).json({ error: "Connection not found" });
      }
      if (connection.status !== "connected") {
        return res.status(400).json({ error: "CRM is not connected" });
      }
      const { phone, email } = req.query;
      if (!phone && !email) {
        return res.status(400).json({ error: "Phone or email is required" });
      }
      const { getCrmClient } = await import("../crm-service");
      const client = getCrmClient(connection);
      let contact = null;
      if (phone) {
        contact = await client.getContactByPhone(phone as string);
      } else if (email) {
        contact = await client.getContactByEmail(email as string);
      }
      res.json(contact || { found: false });
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup contact" });
    }
  });
}
