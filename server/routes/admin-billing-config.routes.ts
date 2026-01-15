import type { Express } from "express";
import { storage } from "../storage";
import {
  insertCurrencySchema,
  insertPromoCodeSchema,
  insertBonusTypeSchema,
} from "@shared/schema";

export function registerAdminBillingConfigRoutes(app: Express): void {
  // ==================== ADMIN AI VOICE AGENTS ====================

  app.get("/api/admin/ai-voice/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAiVoiceAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agents" });
    }
  });

  app.get("/api/admin/ai-voice/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent) return res.status(404).json({ error: "Agent not found" });
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agent" });
    }
  });

  app.post("/api/admin/ai-voice/agents", async (req, res) => {
    try {
      const { customerId, name, description, type, voiceId, voiceProvider, 
              systemPrompt, greetingMessage, fallbackMessage, maxCallDuration, 
              webhookUrl, status } = req.body;
      if (!customerId || !name) {
        return res.status(400).json({ error: "customerId and name are required" });
      }
      const agent = await storage.createAiVoiceAgent({
        customerId,
        name,
        description: description || null,
        type: type || "inbound",
        voiceId: voiceId || "alloy",
        voiceProvider: voiceProvider || "openai",
        systemPrompt: systemPrompt || null,
        greetingMessage: greetingMessage || null,
        fallbackMessage: fallbackMessage || null,
        maxCallDuration: maxCallDuration || 600,
        webhookUrl: webhookUrl || null,
        status: status || "draft",
      });
      res.status(201).json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create AI voice agent" });
    }
  });

  app.patch("/api/admin/ai-voice/agents/:id", async (req, res) => {
    try {
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
      if (!updated) return res.status(404).json({ error: "Agent not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update AI voice agent" });
    }
  });

  app.delete("/api/admin/ai-voice/agents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAiVoiceAgent(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Agent not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete AI voice agent" });
    }
  });

  // ==================== CURRENCIES & FX RATES ====================

  app.get("/api/admin/currencies", async (req, res) => {
    try {
      const currencies = await storage.getCurrencies();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch currencies" });
    }
  });

  app.post("/api/admin/currencies", async (req, res) => {
    try {
      const parsed = insertCurrencySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const currency = await storage.createCurrency(parsed.data);
      res.status(201).json(currency);
    } catch (error) {
      console.error("Create currency error:", error);
      res.status(500).json({ error: "Failed to create currency" });
    }
  });

  app.patch("/api/admin/currencies/:id", async (req, res) => {
    try {
      const updated = await storage.updateCurrency(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Currency not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update currency" });
    }
  });

  app.delete("/api/admin/currencies/:id", async (req, res) => {
    try {
      await storage.deleteCurrency(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete currency" });
    }
  });

  app.get("/api/admin/fx-rates", async (req, res) => {
    try {
      const rates = await storage.getFxRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FX rates" });
    }
  });

  app.post("/api/admin/fx-rates/refresh", async (req, res) => {
    try {
      const { syncExchangeRates } = await import("../services/open-exchange-rates");
      const result = await syncExchangeRates();
      res.json({ success: true, message: `Synced ${result.synced} exchange rates from Open Exchange Rates` });
    } catch (error) {
      console.error("FX refresh error:", error);
      const fallbackRates: Record<string, number> = {
        EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53, JPY: 149.50,
        CHF: 0.88, CNY: 7.24, INR: 83.12, MXN: 17.15, BRL: 4.97,
        SGD: 1.34, HKD: 7.82, NZD: 1.64, SEK: 10.42, NOK: 10.58,
        DKK: 6.88, ZAR: 18.65, AED: 3.67, SAR: 3.75
      };
      const currencies = await storage.getCurrencies();
      for (const currency of currencies) {
        if (currency.code !== "USD" && fallbackRates[currency.code]) {
          await storage.createFxRate({
            baseCurrency: "USD",
            quoteCurrency: currency.code,
            rate: fallbackRates[currency.code].toFixed(6),
            source: "fallback",
          });
        }
      }
      res.json({ success: true, message: "Used fallback rates (API unavailable)" });
    }
  });

  app.post("/api/admin/currencies/sync", async (req, res) => {
    try {
      const { syncCurrencies } = await import("../services/open-exchange-rates");
      const result = await syncCurrencies();
      res.json({ success: true, ...result, message: `Synced ${result.total} currencies, added ${result.added} new` });
    } catch (error) {
      console.error("Currency sync error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to sync currencies" });
    }
  });

  app.post("/api/admin/integrations/open-exchange-rates/test", async (req, res) => {
    try {
      const { testConnection } = await import("../services/open-exchange-rates");
      const result = await testConnection();
      
      const integration = await storage.getIntegrationByProvider("open_exchange_rates");
      if (integration) {
        await storage.updateIntegration(integration.id, {
          status: result.success ? "connected" : "error",
          testResult: result.message,
          lastTestedAt: new Date(),
        });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Test failed" });
    }
  });

  // ==================== PROMO CODES ====================

  app.get("/api/promo-codes", async (req, res) => {
    try {
      const codes = await storage.getPromoCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.get("/api/promo-codes/:id", async (req, res) => {
    try {
      const code = await storage.getPromoCode(req.params.id);
      if (!code) return res.status(404).json({ error: "Promo code not found" });
      res.json(code);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo code" });
    }
  });

  app.post("/api/promo-codes", async (req, res) => {
    try {
      if (req.body.code) req.body.code = req.body.code.toUpperCase();
      
      const parsed = insertPromoCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const existing = await storage.getPromoCodeByCode(parsed.data.code);
      if (existing) {
        return res.status(409).json({ error: "Promo code already exists" });
      }
      
      const promoCode = await storage.createPromoCode(parsed.data);
      res.status(201).json(promoCode);
    } catch (error) {
      console.error("Create promo code error:", error);
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  app.patch("/api/promo-codes/:id", async (req, res) => {
    try {
      const partialSchema = insertPromoCodeSchema.partial();
      if (req.body.code) req.body.code = req.body.code.toUpperCase();
      const parsed = partialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      if (parsed.data.code) {
        const existing = await storage.getPromoCodeByCode(parsed.data.code);
        if (existing && existing.id !== req.params.id) {
          return res.status(409).json({ error: "Promo code already exists" });
        }
      }
      
      const updated = await storage.updatePromoCode(req.params.id, parsed.data);
      if (!updated) return res.status(404).json({ error: "Promo code not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });

  app.delete("/api/promo-codes/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePromoCode(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Promo code not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promo code" });
    }
  });

  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code, purchaseAmount, productType, customerId } = req.body;
      if (!code) return res.status(400).json({ error: "Code required" });

      const promoCode = await storage.getPromoCodeByCode(code.toUpperCase());
      if (!promoCode) {
        return res.status(404).json({ valid: false, error: "Invalid promo code" });
      }

      if (!promoCode.isActive) {
        return res.json({ valid: false, error: "Promo code is inactive" });
      }

      if (promoCode.maxUses && promoCode.usedCount && promoCode.usedCount >= promoCode.maxUses) {
        return res.json({ valid: false, error: "Promo code has reached maximum uses" });
      }

      const now = new Date();
      if (promoCode.validFrom && now < promoCode.validFrom) {
        return res.json({ valid: false, error: "Promo code not yet valid" });
      }
      if (promoCode.validUntil && now > promoCode.validUntil) {
        return res.json({ valid: false, error: "Promo code has expired" });
      }

      if (promoCode.minPurchase) {
        const minPurchase = parseFloat(promoCode.minPurchase);
        if (minPurchase > 0) {
          if (typeof purchaseAmount !== "number") {
            return res.json({ 
              valid: false, 
              error: `Purchase amount required for validation (minimum $${minPurchase.toFixed(2)})` 
            });
          }
          if (purchaseAmount < minPurchase) {
            return res.json({ 
              valid: false, 
              error: `Minimum purchase of $${minPurchase.toFixed(2)} required` 
            });
          }
        }
      }

      if (promoCode.applyTo && promoCode.applyTo !== "all") {
        if (!productType) {
          return res.json({ 
            valid: false, 
            error: `Product type required (code applies to ${promoCode.applyTo} only)` 
          });
        }
        if (promoCode.applyTo !== productType) {
          return res.json({ 
            valid: false, 
            error: `This promo code only applies to ${promoCode.applyTo}` 
          });
        }
      }

      res.json({
        valid: true,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        description: promoCode.description,
        minPurchase: promoCode.minPurchase,
        applyTo: promoCode.applyTo,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  // ==================== BONUS TYPES ====================

  app.get("/api/bonus-types", async (req, res) => {
    try {
      const types = await storage.getBonusTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonus types" });
    }
  });

  app.get("/api/bonus-types/:id", async (req, res) => {
    try {
      const type = await storage.getBonusType(req.params.id);
      if (!type) return res.status(404).json({ error: "Bonus type not found" });
      res.json(type);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonus type" });
    }
  });

  app.post("/api/bonus-types", async (req, res) => {
    try {
      if (req.body.code) req.body.code = req.body.code.toUpperCase();
      
      const parsed = insertBonusTypeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const bonusType = await storage.createBonusType(parsed.data);
      res.status(201).json(bonusType);
    } catch (error) {
      console.error("Create bonus type error:", error);
      res.status(500).json({ error: "Failed to create bonus type" });
    }
  });

  app.patch("/api/bonus-types/:id", async (req, res) => {
    try {
      const partialSchema = insertBonusTypeSchema.partial();
      if (req.body.code) req.body.code = req.body.code.toUpperCase();
      const parsed = partialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const updated = await storage.updateBonusType(req.params.id, parsed.data);
      if (!updated) return res.status(404).json({ error: "Bonus type not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bonus type" });
    }
  });

  app.delete("/api/bonus-types/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBonusType(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Bonus type not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bonus type" });
    }
  });
}
