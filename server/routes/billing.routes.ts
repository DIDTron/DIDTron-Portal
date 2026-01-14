import type { Express } from "express";
import { storage } from "../storage";

export function registerBillingRoutes(app: Express) {
  // ==================== BILLING TERMS (READ-ONLY) ====================

  app.get("/api/billing-terms", async (req, res) => {
    try {
      const terms = await storage.getBillingTerms();
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing terms" });
    }
  });

  app.get("/api/billing-terms/:id", async (req, res) => {
    try {
      const term = await storage.getBillingTerm(req.params.id);
      if (!term) return res.status(404).json({ error: "Billing term not found" });
      res.json(term);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing term" });
    }
  });

  // ==================== INVOICES (READ-ONLY) ====================

  app.get("/api/invoices", async (req, res) => {
    try {
      const { customerId, cursor, limit = "50" } = req.query;
      const parsedLimit = Math.min(parseInt(String(limit)) || 50, 100);
      const invoices = await storage.getInvoices(customerId as string | undefined);
      
      let startIndex = 0;
      if (cursor) {
        startIndex = invoices.findIndex(i => i.id === cursor) + 1;
      }
      const paged = invoices.slice(startIndex, startIndex + parsedLimit + 1);
      const hasMore = paged.length > parsedLimit;
      const data = hasMore ? paged.slice(0, -1) : paged;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
      
      res.json({ data, nextCursor, hasMore });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // ==================== PAYMENTS (READ-ONLY) ====================

  app.get("/api/payments", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const payments = await storage.getPayments(customerId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) return res.status(404).json({ error: "Payment not found" });
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment" });
    }
  });

  // ==================== PROMO CODES (READ-ONLY) ====================

  app.get("/api/promo-codes", async (req, res) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.get("/api/promo-codes/:id", async (req, res) => {
    try {
      const promoCode = await storage.getPromoCode(req.params.id);
      if (!promoCode) return res.status(404).json({ error: "Promo code not found" });
      res.json(promoCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo code" });
    }
  });

  // ==================== REFERRALS (READ-ONLY) ====================

  app.get("/api/referrals", async (req, res) => {
    try {
      const referrerId = req.query.referrerId as string | undefined;
      const referrals = await storage.getReferrals(referrerId);
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  app.get("/api/referrals/:id", async (req, res) => {
    try {
      const referral = await storage.getReferral(req.params.id);
      if (!referral) return res.status(404).json({ error: "Referral not found" });
      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referral" });
    }
  });
}
