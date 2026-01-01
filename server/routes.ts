import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerCategorySchema, 
  insertCustomerGroupSchema,
  insertCustomerSchema,
  insertPopSchema,
  insertVoiceTierSchema,
  insertCodecSchema,
  insertChannelPlanSchema,
  insertCarrierSchema,
  insertRouteSchema,
  insertMonitoringRuleSchema,
  insertAlertSchema,
  insertDidCountrySchema,
  insertTicketSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== CUSTOMER CATEGORIES ====================

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCustomerCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCustomerCategory(req.params.id);
      if (!category) return res.status(404).json({ error: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const parsed = insertCustomerCategorySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const category = await storage.createCustomerCategory(parsed.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCustomerCategory(req.params.id, req.body);
      if (!category) return res.status(404).json({ error: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomerCategory(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Category not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // ==================== CUSTOMER GROUPS ====================

  app.get("/api/groups", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const groups = await storage.getCustomerGroups(categoryId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getCustomerGroup(req.params.id);
      if (!group) return res.status(404).json({ error: "Group not found" });
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const parsed = insertCustomerGroupSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const group = await storage.createCustomerGroup(parsed.data);
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  app.patch("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.updateCustomerGroup(req.params.id, req.body);
      if (!group) return res.status(404).json({ error: "Group not found" });
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to update group" });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomerGroup(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Group not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete group" });
    }
  });

  // ==================== CUSTOMERS ====================

  app.get("/api/customers", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const groupId = req.query.groupId as string | undefined;
      const customers = await storage.getCustomers(categoryId, groupId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const parsed = insertCustomerSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const customer = await storage.createCustomer(parsed.data);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.updateCustomer(req.params.id, req.body);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.post("/api/customers/:id/move", async (req, res) => {
    try {
      const { categoryId, groupId } = req.body;
      if (!categoryId) return res.status(400).json({ error: "categoryId is required" });
      const customer = await storage.moveCustomer(req.params.id, categoryId, groupId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to move customer" });
    }
  });

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

  // ==================== CARRIERS ====================

  app.get("/api/carriers", async (req, res) => {
    try {
      const carriers = await storage.getCarriers();
      res.json(carriers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carriers" });
    }
  });

  app.post("/api/carriers", async (req, res) => {
    try {
      const parsed = insertCarrierSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const carrier = await storage.createCarrier(parsed.data);
      res.status(201).json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create carrier" });
    }
  });

  app.patch("/api/carriers/:id", async (req, res) => {
    try {
      const carrier = await storage.updateCarrier(req.params.id, req.body);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      res.json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier" });
    }
  });

  app.delete("/api/carriers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCarrier(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Carrier not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carrier" });
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

  app.post("/api/routes", async (req, res) => {
    try {
      const parsed = insertRouteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const route = await storage.createRoute(parsed.data);
      res.status(201).json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to create route" });
    }
  });

  app.patch("/api/routes/:id", async (req, res) => {
    try {
      const route = await storage.updateRoute(req.params.id, req.body);
      if (!route) return res.status(404).json({ error: "Route not found" });
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to update route" });
    }
  });

  app.delete("/api/routes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRoute(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Route not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete route" });
    }
  });

  // ==================== MONITORING RULES ====================

  app.get("/api/monitoring-rules", async (req, res) => {
    try {
      const rules = await storage.getMonitoringRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitoring rules" });
    }
  });

  app.post("/api/monitoring-rules", async (req, res) => {
    try {
      const parsed = insertMonitoringRuleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const rule = await storage.createMonitoringRule(parsed.data);
      res.status(201).json(rule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create monitoring rule" });
    }
  });

  app.patch("/api/monitoring-rules/:id", async (req, res) => {
    try {
      const rule = await storage.updateMonitoringRule(req.params.id, req.body);
      if (!rule) return res.status(404).json({ error: "Monitoring rule not found" });
      res.json(rule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update monitoring rule" });
    }
  });

  app.delete("/api/monitoring-rules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMonitoringRule(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Monitoring rule not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete monitoring rule" });
    }
  });

  // ==================== ALERTS ====================

  app.get("/api/alerts", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const alerts = await storage.getAlerts(status);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const parsed = insertAlertSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const alert = await storage.createAlert(parsed.data);
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, req.body);
      if (!alert) return res.status(404).json({ error: "Alert not found" });
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  app.post("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, {
        status: "acknowledged",
        acknowledgedAt: new Date()
      });
      if (!alert) return res.status(404).json({ error: "Alert not found" });
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, {
        status: "resolved",
        resolvedAt: new Date()
      });
      if (!alert) return res.status(404).json({ error: "Alert not found" });
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve alert" });
    }
  });

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

  // ==================== TICKETS ====================

  app.get("/api/tickets", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const tickets = await storage.getTickets(customerId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const parsed = insertTicketSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const ticket = await storage.createTicket(parsed.data);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  // ==================== DASHBOARD STATS ====================

  app.get("/api/dashboard/category-stats", async (req, res) => {
    try {
      const stats = await storage.getCategoryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category stats" });
    }
  });

  return httpServer;
}
