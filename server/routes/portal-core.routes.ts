import type { Express, Request, Response } from "express";
import { randomBytes, createHash } from "crypto";
import { storage } from "../storage";
import { z } from "zod";
import { insertWebhookSchema } from "@shared/schema";

export function registerPortalCoreRoutes(app: Express): void {
  // ==================== REFERRAL SYSTEM ====================

  app.get("/api/my/referral", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const customer = await storage.getCustomer(user.customerId);
      const referrals = await storage.getReferrals(user.customerId);
      
      let referralCode = customer?.referralCode;
      if (!referralCode) {
        referralCode = `DID${user.customerId.substring(0, 8).toUpperCase()}`;
        await storage.updateCustomer(user.customerId, { referralCode });
      }

      const successfulReferrals = referrals.filter(r => r.status === "converted").length;
      const pendingReferrals = referrals.filter(r => r.status === "pending").length;
      const totalEarnings = referrals.reduce((sum, r) => sum + parseFloat(r.commission || "0"), 0);

      res.json({
        referralCode,
        referralLink: `https://didtron.com/signup?ref=${referralCode}`,
        stats: {
          total: referrals.length,
          successful: successfulReferrals,
          pending: pendingReferrals,
          earnings: totalEarnings.toFixed(2),
        },
        referrals,
      });
    } catch (error) {
      console.error("Referral fetch error:", error);
      res.status(500).json({ error: "Failed to fetch referral info" });
    }
  });

  app.post("/api/referral/track", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== "string" || code.length < 3 || code.length > 50) {
        return res.status(400).json({ error: "Valid referral code required" });
      }

      const referrer = await storage.getCustomerByReferralCode(code);
      
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      await storage.createReferral({
        referrerId: referrer.id,
        referralCode: code,
        status: "clicked",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Referral tracking error:", error);
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  // ==================== CUSTOMER BRANDING ====================

  app.get("/api/my/branding", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const branding = await storage.getTenantBranding(user.customerId);
      res.json(branding || null);
    } catch (error) {
      console.error("Branding fetch error:", error);
      res.status(500).json({ error: "Failed to fetch branding" });
    }
  });

  app.post("/api/my/branding", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const existing = await storage.getTenantBranding(user.customerId);
      if (existing) {
        return res.status(400).json({ error: "Branding already exists. Use PATCH to update." });
      }

      const { companyName, logoUrl, faviconUrl, primaryColor, secondaryColor } = req.body;
      const branding = await storage.createTenantBranding({
        customerId: user.customerId,
        companyName: companyName || null,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
      });
      res.status(201).json(branding);
    } catch (error) {
      console.error("Create branding error:", error);
      res.status(500).json({ error: "Failed to create branding" });
    }
  });

  const handleBrandingUpdate = async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const { 
        companyName, logoUrl, faviconUrl, primaryColor, secondaryColor,
        customDomain, emailFromName, emailFromAddress, footerText, termsUrl, privacyUrl
      } = req.body;
      const updateData: Record<string, string | null> = {};
      
      if (companyName !== undefined) updateData.companyName = companyName || null;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;
      if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl || null;
      if (primaryColor !== undefined) updateData.primaryColor = primaryColor || null;
      if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor || null;
      if (customDomain !== undefined) updateData.customDomain = customDomain || null;
      if (emailFromName !== undefined) updateData.emailFromName = emailFromName || null;
      if (emailFromAddress !== undefined) updateData.emailFromAddress = emailFromAddress || null;
      if (footerText !== undefined) updateData.footerText = footerText || null;
      if (termsUrl !== undefined) updateData.termsUrl = termsUrl || null;
      if (privacyUrl !== undefined) updateData.privacyUrl = privacyUrl || null;
      
      const existing = await storage.getTenantBranding(user.customerId);
      if (!existing) {
        const branding = await storage.createTenantBranding({
          customerId: user.customerId,
          ...updateData,
        });
        return res.json(branding);
      }

      const updated = await storage.updateTenantBranding(existing.id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Update branding error:", error);
      res.status(500).json({ error: "Failed to update branding" });
    }
  };
  
  app.patch("/api/my/branding", handleBrandingUpdate);
  app.put("/api/my/branding", handleBrandingUpdate);

  // ==================== CUSTOMER SUPPORT TICKETS ====================

  app.get("/api/my/tickets", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      const tickets = await storage.getTickets(customer.id);
      res.json(tickets);
    } catch (error) {
      console.error("Tickets fetch error:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/my/tickets", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      const { subject, category, priority, description } = req.body;
      if (!subject || !description) {
        return res.status(400).json({ error: "Subject and description required" });
      }

      const ticket = await storage.createTicket({
        customerId: customer.id,
        ticketNumber: `TKT-${Date.now().toString(36).toUpperCase()}`,
        subject,
        category: category || "general",
        priority: priority || "medium",
        description,
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.get("/api/my/tickets/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) return res.status(404).json({ error: "Customer not found" });

      const ticket = await storage.getTicket(req.params.id);
      if (!ticket || ticket.customerId !== customer.id) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error) {
      console.error("Ticket fetch error:", error);
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.get("/api/my/tickets/:id/replies", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket || ticket.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      const replies = await storage.getTicketReplies(req.params.id);
      res.json(replies.filter(r => !r.isInternal));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch replies" });
    }
  });

  app.post("/api/my/tickets/:id/reply", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket || ticket.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const { message } = req.body;
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ error: "Message required" });
      }

      const reply = await storage.createTicketReply({
        ticketId: req.params.id,
        userId: req.session.userId,
        message: message.trim(),
        isInternal: false
      });

      await storage.updateTicket(req.params.id, { status: "in_progress" });
      res.status(201).json(reply);
    } catch (error) {
      console.error("Ticket reply error:", error);
      res.status(500).json({ error: "Failed to add reply" });
    }
  });

  // ==================== CUSTOMER CDR EXPORTS ====================
  
  app.get("/api/my/cdr-exports", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: "exp-1", fileName: "CDR_Dec2025.csv", dateRange: "Dec 1-31, 2025", format: "csv", status: "completed", recordCount: 12450, createdAt: "3 days ago" },
        { id: "exp-2", fileName: "CDR_Nov2025.xlsx", dateRange: "Nov 1-30, 2025", format: "xlsx", status: "completed", recordCount: 10890, createdAt: "1 month ago" },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CDR exports" });
    }
  });

  app.post("/api/my/cdr-exports", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.status(201).json({
        id: `exp-${Date.now()}`,
        fileName: `CDR_Export_${new Date().toISOString().split('T')[0]}.csv`,
        dateRange: req.body.dateRange || "Custom",
        format: req.body.format || "csv",
        status: "processing",
        recordCount: 0,
        createdAt: "Just now"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create CDR export" });
    }
  });

  // ==================== CUSTOMER CLASS 4 SOFTSWITCH ====================
  
  app.get("/api/my/class4/stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json({
        activeRateCards: 3,
        activeLcrRules: 5,
        totalPrefixes: 12450,
        avgMargin: "8.5%"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Class 4 stats" });
    }
  });

  app.get("/api/my/class4/rate-cards", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: 1, name: "US_Tier1_Premium", type: "provider", prefixCount: 3200, lastUpdated: "2 days ago", status: "active" },
        { id: 2, name: "EU_Standard_Rates", type: "provider", prefixCount: 5600, lastUpdated: "1 week ago", status: "active" },
        { id: 3, name: "Customer_Wholesale", type: "customer", prefixCount: 8900, lastUpdated: "3 days ago", status: "active" },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rate cards" });
    }
  });

  app.get("/api/my/class4/lcr-rules", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: 1, name: "US Domestic Priority", priority: 1, prefixPattern: "1*", routes: ["Tier1_US", "Tier2_US", "Backup_US"], status: "active" },
        { id: 2, name: "UK Mobile LCR", priority: 2, prefixPattern: "447*", routes: ["UK_Mobile_A", "UK_Mobile_B"], status: "active" },
        { id: 3, name: "EU Standard", priority: 3, prefixPattern: "3*,4*,49*", routes: ["EU_Tier1", "EU_Tier2"], status: "active" },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch LCR rules" });
    }
  });

  app.get("/api/my/class4/margins", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { prefix: "1", destination: "USA - Fixed", buyRate: 0.0085, sellRate: 0.0120, margin: 0.0035, marginPercent: 29.2, volume: 125000 },
        { prefix: "1", destination: "USA - Mobile", buyRate: 0.0095, sellRate: 0.0125, margin: 0.0030, marginPercent: 24.0, volume: 89000 },
        { prefix: "44", destination: "UK - Fixed", buyRate: 0.0120, sellRate: 0.0145, margin: 0.0025, marginPercent: 17.2, volume: 45000 },
        { prefix: "447", destination: "UK - Mobile", buyRate: 0.0280, sellRate: 0.0320, margin: 0.0040, marginPercent: 12.5, volume: 32000 },
        { prefix: "49", destination: "Germany - Fixed", buyRate: 0.0110, sellRate: 0.0135, margin: 0.0025, marginPercent: 18.5, volume: 28000 },
        { prefix: "33", destination: "France - Fixed", buyRate: 0.0105, sellRate: 0.0130, margin: 0.0025, marginPercent: 19.2, volume: 21000 },
        { prefix: "61", destination: "Australia - Fixed", buyRate: 0.0150, sellRate: 0.0185, margin: 0.0035, marginPercent: 18.9, volume: 15000 },
        { prefix: "91", destination: "India - Fixed", buyRate: 0.0045, sellRate: 0.0058, margin: 0.0013, marginPercent: 22.4, volume: 67000 },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch margin data" });
    }
  });

  // ==================== AI VOICE AGENT (Customer Portal) ====================
  
  app.get("/api/my/ai-agent/stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json({
        totalCalls: 1245,
        avgDuration: 142,
        satisfaction: 94,
        costThisMonth: 124.50
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI agent stats" });
    }
  });

  app.get("/api/my/ai-agent/personas", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: "1", name: "Sales Assistant", voice: "alloy", language: "en-US", personality: "Friendly and helpful", greeting: "Hello! How can I help you today?", status: "active", callsHandled: 856, avgDuration: 145, satisfaction: 96 },
        { id: "2", name: "Support Agent", voice: "nova", language: "en-US", personality: "Patient and thorough", greeting: "Thank you for calling support. What can I help you with?", status: "active", callsHandled: 389, avgDuration: 198, satisfaction: 92 },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personas" });
    }
  });

  app.post("/api/my/ai-agent/personas", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const personaSchema = z.object({
        name: z.string().min(1).max(100),
        voice: z.string().min(1).max(50),
        language: z.string().min(2).max(10),
        personality: z.string().max(500).optional(),
        greeting: z.string().max(500).optional(),
      });
      
      const validation = personaSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid persona data", details: validation.error.errors });
      }
      
      const { name, voice, language, personality, greeting } = validation.data;
      res.status(201).json({
        id: Date.now().toString(),
        customerId: user.customerId,
        name,
        voice,
        language,
        personality: personality || "",
        greeting: greeting || "Hello! How can I help you today?",
        status: "training",
        callsHandled: 0,
        avgDuration: 0,
        satisfaction: 0
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create persona" });
    }
  });

  app.get("/api/my/ai-agent/campaigns", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: "1", name: "Q1 Outreach", personaId: "1", personaName: "Sales Assistant", status: "running", totalContacts: 500, contacted: 234, answered: 156 },
        { id: "2", name: "Customer Survey", personaId: "2", personaName: "Support Agent", status: "completed", totalContacts: 200, contacted: 200, answered: 145 },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/my/ai-agent/training", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: "1", name: "Product Catalog.pdf", type: "pdf", status: "ready", uploadedAt: "2025-12-15", pages: 45 },
        { id: "2", name: "FAQ Document.txt", type: "text", status: "ready", uploadedAt: "2025-12-18" },
        { id: "3", name: "Company Website", type: "url", status: "processing", uploadedAt: "2026-01-02" },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training data" });
    }
  });

  // ==================== CUSTOMER WEBHOOKS ====================
  
  app.get("/api/my/webhooks", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const webhooks = await storage.getWebhooks(user.customerId);
      res.json(webhooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch webhooks" });
    }
  });

  app.post("/api/my/webhooks", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertWebhookSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid webhook data", details: validation.error.errors });
      }
      
      const webhook = await storage.createWebhook({
        ...validation.data,
        customerId: user.customerId,
        secret: randomBytes(32).toString('hex')
      });
      res.status(201).json(webhook);
    } catch (error) {
      res.status(500).json({ error: "Failed to create webhook" });
    }
  });

  app.patch("/api/my/webhooks/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const webhook = await storage.getWebhook(req.params.id);
      if (!webhook || webhook.customerId !== user.customerId) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      const { url, events, isActive } = req.body;
      const updateData: Record<string, unknown> = {};
      if (url !== undefined) updateData.url = url;
      if (events !== undefined) updateData.events = events;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateWebhook(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update webhook" });
    }
  });

  app.delete("/api/my/webhooks/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const webhook = await storage.getWebhook(req.params.id);
      if (!webhook || webhook.customerId !== user.customerId) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      await storage.deleteWebhook(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  });

  app.get("/api/my/webhooks/:id/deliveries", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const webhook = await storage.getWebhook(req.params.id);
      if (!webhook || webhook.customerId !== user.customerId) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      const deliveries = await storage.getWebhookDeliveries(req.params.id);
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch webhook deliveries" });
    }
  });

  // ==================== CUSTOMER API KEYS ====================
  
  app.get("/api/my/api-keys", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const apiKeys = await storage.getCustomerApiKeys(user.customerId);
      res.json(apiKeys.map(k => ({ ...k, keyHash: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/my/api-keys", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const { name, permissions } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      
      const fullKey = `dt_${randomBytes(32).toString('hex')}`;
      const keyPrefix = fullKey.substring(0, 12) + "...";
      const keyHash = createHash('sha256').update(fullKey).digest('hex');
      
      const apiKey = await storage.createCustomerApiKey({
        customerId: user.customerId,
        name,
        keyPrefix,
        keyHash,
        permissions: permissions || ['read'],
        rateLimitPerMinute: 60,
        isActive: true
      });
      
      res.status(201).json({ ...apiKey, fullKey, keyHash: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  app.patch("/api/my/api-keys/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const apiKey = await storage.getCustomerApiKey(req.params.id);
      if (!apiKey || apiKey.customerId !== user.customerId) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      const { name, permissions, isActive } = req.body;
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (permissions !== undefined) updateData.permissions = permissions;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateCustomerApiKey(req.params.id, updateData);
      res.json({ ...updated, keyHash: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to update API key" });
    }
  });

  app.delete("/api/my/api-keys/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const apiKey = await storage.getCustomerApiKey(req.params.id);
      if (!apiKey || apiKey.customerId !== user.customerId) {
        return res.status(404).json({ error: "API key not found" });
      }
      await storage.deleteCustomerApiKey(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  // ==================== CUSTOMER PROMO CODES ====================
  
  app.get("/api/my/promo-codes", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: "1", code: "WELCOME20", description: "Welcome bonus", discountType: "fixed", discountValue: 20, status: "used", redeemedAt: "2025-12-15" },
        { id: "2", code: "HOLIDAY10", description: "Holiday special", discountType: "percentage", discountValue: 10, status: "active", redeemedAt: "2026-01-02", expiresAt: "2026-02-01" },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  app.get("/api/my/bonuses", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      res.json([
        { id: "1", name: "Volume Bonus", description: "Get 5% back when you spend $500+ this month", type: "percentage", value: 5, minSpend: 500 },
        { id: "2", name: "Deposit Match", description: "50% match on deposits over $100", type: "percentage", value: 50, expiresAt: "2026-02-28" },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });
  
  app.post("/api/my/promo-codes/redeem", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Promo code required" });
      }
      
      const promoCode = await storage.getPromoCodeByCode(code.toUpperCase().trim());
      if (!promoCode) {
        return res.status(404).json({ error: "Invalid promo code" });
      }
      
      if (!promoCode.isActive) {
        return res.status(400).json({ error: "This promo code is no longer active" });
      }
      
      if (promoCode.validFrom && new Date() < new Date(promoCode.validFrom)) {
        return res.status(400).json({ error: "This promo code is not yet valid" });
      }
      
      if (promoCode.validUntil && new Date() > new Date(promoCode.validUntil)) {
        return res.status(400).json({ error: "This promo code has expired" });
      }
      
      if (promoCode.maxUses && promoCode.usedCount && promoCode.usedCount >= promoCode.maxUses) {
        return res.status(400).json({ error: "This promo code has reached its usage limit" });
      }
      
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const currentBalance = parseFloat(customer.balance || "0");
      const discountAmount = parseFloat(promoCode.discountValue);
      const newBalance = currentBalance + discountAmount;
      
      await storage.updateCustomer(user.customerId, { balance: newBalance.toFixed(2) });
      await storage.updatePromoCode(promoCode.id, { usedCount: (promoCode.usedCount || 0) + 1 });
      
      res.json({ 
        success: true, 
        message: `Promo code redeemed! $${discountAmount.toFixed(2)} added to your balance.`,
        newBalance: newBalance.toFixed(2)
      });
    } catch (error) {
      console.error("Promo code redemption error:", error);
      res.status(500).json({ error: "Failed to redeem promo code" });
    }
  });

  // Admin: Get all referrals (placed here for grouping with referral system)
  app.get("/api/admin/referrals", async (req, res) => {
    try {
      const referrals = await storage.getReferrals();
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });
}
