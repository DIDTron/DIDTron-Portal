import type { Express } from "express";
import { storage } from "../storage";
import {
  insertRateCardSchema,
  insertRateCardRateSchema,
  insertMonitoringRuleSchema,
  insertAlertSchema,
  insertTicketSchema,
  insertCurrencySchema,
  insertFxRateSchema,
} from "@shared/schema";
import { connexcs } from "../connexcs";
import { getCached, setCache, invalidateCache, CACHE_KEYS, CACHE_TTL } from "../services/cache";

export function registerAdminOperationsRoutes(app: Express): void {
  // ==================== RATE CARDS ====================

  app.get("/api/rate-cards", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const cards = await storage.getRateCards(type);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rate cards" });
    }
  });

  app.get("/api/rate-cards/:id", async (req, res) => {
    try {
      const card = await storage.getRateCard(req.params.id);
      if (!card) return res.status(404).json({ error: "Rate card not found" });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rate card" });
    }
  });

  app.post("/api/rate-cards", async (req, res) => {
    try {
      const parsed = insertRateCardSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const card = await storage.createRateCard(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "rate_cards",
        recordId: card.id,
        newValues: card,
      });
      
      try {
        await connexcs.loadCredentialsFromStorage(storage);
        if (connexcs.isConfigured()) {
          const syncResult = await connexcs.syncRateCard({
            id: card.id,
            name: card.name,
            currency: card.currency || "USD",
            direction: card.direction || "outbound",
          });
          if (syncResult.connexcsId) {
            await storage.updateRateCard(card.id, { connexcsRateCardId: syncResult.connexcsId });
          }
          console.log(`[ConnexCS] Rate card ${card.name} synced: ${syncResult.connexcsId}`);
        }
      } catch (syncError) {
        console.error("[ConnexCS] Auto-sync rate card failed:", syncError);
      }
      
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to create rate card" });
    }
  });

  app.patch("/api/rate-cards/:id", async (req, res) => {
    try {
      const oldCard = await storage.getRateCard(req.params.id);
      const card = await storage.updateRateCard(req.params.id, req.body);
      if (!card) return res.status(404).json({ error: "Rate card not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "rate_cards",
        recordId: req.params.id,
        oldValues: oldCard,
        newValues: card,
      });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rate card" });
    }
  });

  app.delete("/api/rate-cards/:id", async (req, res) => {
    try {
      const oldCard = await storage.getRateCard(req.params.id);
      const deleted = await storage.deleteRateCard(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Rate card not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "rate_cards",
        recordId: req.params.id,
        oldValues: oldCard,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rate card" });
    }
  });

  app.get("/api/rate-cards/:id/rates", async (req, res) => {
    try {
      const rates = await storage.getRateCardRates(req.params.id);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rate card rates" });
    }
  });

  app.post("/api/rate-cards/:id/rates", async (req, res) => {
    try {
      const rateCardId = req.params.id;
      const card = await storage.getRateCard(rateCardId);
      if (!card) return res.status(404).json({ error: "Rate card not found" });
      
      if (Array.isArray(req.body)) {
        const rates = req.body.map((r: Record<string, unknown>) => ({ ...r, rateCardId })) as Array<{ prefix: string; rate: string; rateCardId: string; destination?: string | null; connectionFee?: string | null; billingIncrement?: number | null }>;
        const created = await storage.createRateCardRatesBulk(rates);
        const allRates = await storage.getRateCardRates(rateCardId);
        await storage.updateRateCard(rateCardId, { ratesCount: allRates.length });
        res.status(201).json(created);
      } else {
        const rateData = { ...req.body, rateCardId };
        const parsed = insertRateCardRateSchema.safeParse(rateData);
        if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
        const rate = await storage.createRateCardRate(parsed.data);
        const allRates = await storage.getRateCardRates(rateCardId);
        await storage.updateRateCard(rateCardId, { ratesCount: allRates.length });
        res.status(201).json(rate);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create rate card rate" });
    }
  });

  app.delete("/api/rate-cards/:id/rates", async (req, res) => {
    try {
      await storage.deleteRateCardRates(req.params.id);
      await storage.updateRateCard(req.params.id, { ratesCount: 0 });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rate card rates" });
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

  // ==================== TICKETS ====================

  app.get("/api/tickets", async (req, res) => {
    try {
      const { customerId, cursor, limit = "50" } = req.query;
      const parsedLimit = Math.min(parseInt(String(limit)) || 50, 100);
      const tickets = await storage.getTickets(customerId as string | undefined);
      
      let startIndex = 0;
      if (cursor) {
        startIndex = tickets.findIndex(t => t.id === cursor) + 1;
      }
      const paged = tickets.slice(startIndex, startIndex + parsedLimit + 1);
      const hasMore = paged.length > parsedLimit;
      const data = hasMore ? paged.slice(0, -1) : paged;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
      
      res.json({ data, nextCursor, hasMore });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const parsed = insertTicketSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const ticket = await storage.createTicket(parsed.data);
      await invalidateCache("sidebar:counts:*");
      res.status(201).json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      await invalidateCache("sidebar:counts:*");
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  // ==================== DASHBOARD STATS ====================

  app.get("/api/dashboard/category-stats", async (req, res) => {
    try {
      const cacheKey = CACHE_KEYS.dashboardSummary();
      const cached = await getCached<{ categoryId: string; customerCount: number; revenue: number }[]>(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const stats = await storage.getCategoryStats();
      await setCache(cacheKey, stats, CACHE_TTL.DASHBOARD_SUMMARY);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category stats" });
    }
  });

  app.get("/api/admin/sidebar-counts", async (req, res) => {
    try {
      const userId = req.session.userId || "anonymous";
      const cacheKey = CACHE_KEYS.sidebarCounts(userId);
      
      const cached = await getCached<Record<string, number>>(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const [
        customers,
        carriers,
        tickets,
        routes,
        didCountries,
        alerts,
        invoices,
        payments,
        rateCards,
      ] = await Promise.all([
        storage.getCustomers(),
        storage.getCarriers(),
        storage.getTickets(),
        storage.getRoutes(),
        storage.getDidCountries(),
        storage.getAlerts(),
        storage.getInvoices(),
        storage.getPayments(),
        storage.getRateCards(),
      ]);
      
      const counts = {
        customers: customers.length,
        carriers: carriers.length,
        tickets: tickets.length,
        openTickets: tickets.filter((t: any) => t.status === "open" || t.status === "pending").length,
        routes: routes.length,
        didCountries: didCountries.length,
        alerts: alerts.length,
        activeAlerts: alerts.filter((a: any) => a.status === "active" || a.status === "triggered").length,
        invoices: invoices.length,
        payments: payments.length,
        rateCards: rateCards.length,
      };
      
      await setCache(cacheKey, counts, CACHE_TTL.SIDEBAR_COUNTS);
      res.json(counts);
    } catch (error) {
      console.error("Sidebar counts error:", error);
      res.status(500).json({ error: "Failed to fetch sidebar counts" });
    }
  });

  // ==================== CURRENCIES ====================

  app.get("/api/currencies", async (req, res) => {
    try {
      const currencies = await storage.getCurrencies();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch currencies" });
    }
  });

  app.post("/api/currencies", async (req, res) => {
    try {
      const parsed = insertCurrencySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const currency = await storage.createCurrency(parsed.data);
      res.status(201).json(currency);
    } catch (error) {
      res.status(500).json({ error: "Failed to create currency" });
    }
  });

  // ==================== FX RATES (MUTATIONS ONLY) ====================

  app.post("/api/fx-rates", async (req, res) => {
    try {
      const parsed = insertFxRateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const rate = await storage.createFxRate(parsed.data);
      res.status(201).json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create FX rate" });
    }
  });
}
