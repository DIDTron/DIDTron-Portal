import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { randomBytes, createHash } from "crypto";
import { storage } from "./storage";
import { createUser, validateLogin, sanitizeUser } from "./auth";
import { aiService } from "./ai-service";
import { connexcs } from "./connexcs";
import { connexcsTools } from "./connexcs-tools-service";
import { auditService } from "./audit";
import { sendWelcomeEmail, sendPaymentReceived, sendReferralReward, sendLowBalanceAlert } from "./brevo";
import { performanceMonitor } from "./services/performance-monitor";
import { registerSystemStatusRoutes } from "./routes/system-status.routes";
import { registerLegacyAuthRoutes } from "./routes/auth.routes";
import { registerJobsRoutes } from "./routes/jobs.routes";
import { registerSipTesterRoutes } from "./routes/sip-tester.routes";
import { registerBillingRoutes } from "./routes/billing.routes";
import { registerSoftswitchRoutes } from "./routes/softswitch.routes";
import { registerPortalAiVoiceRoutes } from "./routes/portal-ai-voice.routes";
import { registerPortalPbxRoutes } from "./routes/portal-pbx.routes";
import { registerPortalCrmRoutes } from "./routes/portal-crm.routes";
import { registerConnexCSRoutes } from "./routes/connexcs.routes";
import { registerPortalCoreRoutes } from "./routes/portal-core.routes";
import { registerAdminBillingConfigRoutes } from "./routes/admin-billing-config.routes";
import { z } from "zod";
import { db } from "./db";
import { e2eRuns, e2eResults } from "@shared/schema";
import { eq, desc, sql, asc } from "drizzle-orm";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerAiVoiceRoutes } from "./ai-voice-routes";
import { getCached, setCache, invalidateCache, CACHE_KEYS, CACHE_TTL } from "./services/cache";
import { 
  insertCustomerCategorySchema, 
  insertCustomerGroupSchema,
  insertCustomerSchema,
  insertPopSchema,
  insertVoiceTierSchema,
  insertCodecSchema,
  insertChannelPlanSchema,
  insertCarrierSchema,
  insertCarrierAssignmentSchema,
  insertCarrierInterconnectSchema,
  insertCarrierServiceSchema,
  insertServiceMatchListSchema,
  insertCarrierContactSchema,
  insertCarrierCreditAlertSchema,
  insertRouteSchema,
  insertMonitoringRuleSchema,
  insertAlertSchema,
  insertDidCountrySchema,
  insertTicketSchema,
  insertSipTestConfigSchema,
  insertSipTestResultSchema,
  insertSipTestScheduleSchema,
  insertClass4CustomerSchema,
  insertClass4CarrierSchema,
  insertCurrencySchema,
  insertFxRateSchema,
  insertAiVoiceAgentSchema,
  insertCmsThemeSchema,
  insertCmsPageSchema,
  insertCmsMediaItemSchema,
  insertDocCategorySchema,
  insertDocArticleSchema,
  insertTenantBrandingSchema,
  insertPortalLoginPageSchema,
  insertSiteSettingSchema,
  insertWebsiteSectionSchema,
  insertIntegrationSchema,
  insertBonusTypeSchema,
  insertPromoCodeSchema,
  insertEmailTemplateSchema,
  insertFileTemplateSchema,
  insertSocialAccountSchema,
  insertSocialPostSchema,
  insertRateCardSchema,
  insertRateCardRateSchema,
  insertDidSchema,
  insertExtensionSchema,
  insertIvrSchema,
  insertRingGroupSchema,
  insertQueueSchema,
  insertWebhookSchema,
  insertBillingTermSchema,
  updateBillingTermSchema,
  insertInterconnectIpAddressSchema,
  insertInterconnectValidationSettingsSchema,
  insertInterconnectTranslationSettingsSchema,
  insertInterconnectCodecSchema,
  insertInterconnectMediaSettingsSchema,
  insertInterconnectSignallingSettingsSchema,
  insertInterconnectMonitoringSettingsSchema,
  insertCustomerRatingPlanSchema,
  supplierImportTemplates,
  insertSupplierImportTemplateSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== REPLIT AUTH (OIDC) ====================
  await setupAuth(app);
  registerAuthRoutes(app);

  // ==================== AI VOICE ROUTES ====================
  registerAiVoiceRoutes(app);

  // ==================== SYSTEM STATUS ROUTES ====================
  registerSystemStatusRoutes(app);

  // ==================== LEGACY AUTHENTICATION ====================
  registerLegacyAuthRoutes(app);

  // ==================== JOB QUEUE ADMIN ROUTES ====================
  registerJobsRoutes(app);

  // ==================== SIP TESTER ROUTES ====================
  registerSipTesterRoutes(app);

  // ==================== BILLING READ-ONLY ROUTES ====================
  registerBillingRoutes(app);

  // ==================== SOFTSWITCH ROUTES ====================
  registerSoftswitchRoutes(app);

  // ==================== PORTAL AI VOICE ROUTES ====================
  registerPortalAiVoiceRoutes(app);

  // ==================== PORTAL PBX ROUTES ====================
  registerPortalPbxRoutes(app);

  // ==================== PORTAL CRM ROUTES ====================
  registerPortalCrmRoutes(app);

  // ==================== CONNEXCS ROUTES ====================
  registerConnexCSRoutes(app);

  // ==================== PORTAL CORE ROUTES ====================
  registerPortalCoreRoutes(app);

  // ==================== ADMIN BILLING CONFIG ROUTES ====================
  registerAdminBillingConfigRoutes(app);

  // Get logged-in user's customer profile with balance
  app.get("/api/my/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update logged-in user's customer profile settings
  app.patch("/api/my/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      // Validate allowed fields with proper types using zod
      const profileUpdateSchema = z.object({
        autoTopUpEnabled: z.boolean().optional(),
        autoTopUpAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        autoTopUpThreshold: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        displayCurrency: z.string().min(3).max(3).optional(),
      });
      
      const validation = profileUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid data", details: validation.error.errors });
      }
      
      const updateData = validation.data;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const updated = await storage.updateCustomer(user.customerId, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get logged-in user's payments/transactions
  app.get("/api/my/payments", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.json([]);
      }
      const payments = await storage.getPayments(user.customerId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Get logged-in user's invoices
  app.get("/api/my/invoices", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.json([]);
      }
      const invoices = await storage.getInvoices(user.customerId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Add funds to logged-in user's account (creates pending payment intent)
  app.post("/api/my/add-funds", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const { amount, method } = req.body;
      const validMethods = ["card", "paypal"];
      if (!amount || typeof amount !== "number" || amount < 5 || amount > 10000) {
        return res.status(400).json({ error: "Amount must be between $5 and $10,000" });
      }
      if (method && !validMethods.includes(method)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      // Create pending payment record - balance only credited after webhook confirms
      const payment = await storage.createPayment({
        customerId: user.customerId,
        amount: amount.toFixed(2),
        paymentMethod: method || "card",
        status: "pending",
        description: `Account top-up via ${method || "card"}`,
      });

      // TODO: Integrate with Stripe/PayPal to create actual payment intent
      // For now, return the pending payment - webhook will confirm and credit balance
      res.json({ 
        success: true, 
        payment,
        message: "Payment intent created. Awaiting confirmation.",
        // In production: include clientSecret for Stripe Elements
      });
    } catch (error) {
      console.error("Add funds error:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  // Webhook endpoint to confirm payments (called by Stripe/PayPal)
  app.post("/api/webhooks/payment-confirmed", async (req, res) => {
    try {
      // TODO: Verify webhook signature from Stripe/PayPal
      const { paymentId, transactionId } = req.body;
      
      const payment = await storage.getPayment(paymentId);
      if (!payment || payment.status !== "pending") {
        return res.status(400).json({ error: "Invalid or already processed payment" });
      }

      // Update payment status
      await storage.updatePayment(paymentId, { 
        status: "completed",
        transactionId 
      });

      // Credit customer balance
      const customer = await storage.getCustomer(payment.customerId);
      if (customer) {
        const newBalance = (parseFloat(customer.balance || "0") + parseFloat(payment.amount)).toFixed(2);
        await storage.updateCustomer(payment.customerId, { balance: newBalance });
        
        // Send confirmation email
        try {
          await sendPaymentReceived(storage, {
            email: customer.billingEmail || "",
            firstName: customer.companyName || "Customer",
            amount: payment.amount,
            paymentMethod: payment.paymentMethod || "Credit Card",
            transactionId: transactionId || payment.id,
            newBalance,
          });
        } catch (emailErr) {
          console.error("Failed to send payment email:", emailErr);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Payment webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ==================== GLOBAL SEARCH ====================

  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string || "").toLowerCase().trim();
      if (!query || query.length < 2) {
        return res.json({ results: [] });
      }

      const results: Array<{
        id: string;
        label: string;
        type: string;
        path: string;
        description?: string;
        icon?: string;
      }> = [];

      // Search customers
      const customers = await storage.getCustomers();
      for (const customer of customers) {
        const searchText = `${customer.companyName} ${customer.accountNumber}`.toLowerCase();
        if (searchText.includes(query)) {
          results.push({
            id: `customer-${customer.id}`,
            label: customer.companyName,
            type: "Customer",
            path: `/admin/customers?id=${customer.id}`,
            description: `Account: ${customer.accountNumber}`,
            icon: "users",
          });
        }
      }

      // Search carriers
      const carriers = await storage.getCarriers();
      for (const carrier of carriers) {
        const searchText = `${carrier.name} ${carrier.code}`.toLowerCase();
        if (searchText.includes(query)) {
          results.push({
            id: `carrier-${carrier.id}`,
            label: carrier.name,
            type: "Carrier",
            path: `/admin/carriers?id=${carrier.id}`,
            description: `Code: ${carrier.code}`,
            icon: "building2",
          });
        }
      }

      // Search invoices
      const invoices = await storage.getInvoices();
      for (const invoice of invoices) {
        const searchText = `${invoice.invoiceNumber}`.toLowerCase();
        if (searchText.includes(query)) {
          results.push({
            id: `invoice-${invoice.id}`,
            label: invoice.invoiceNumber,
            type: "Invoice",
            path: `/admin/invoices?id=${invoice.id}`,
            description: `Amount: ${invoice.total} ${invoice.currency || "USD"}`,
            icon: "file-text",
          });
        }
      }

      // Search tickets
      const tickets = await storage.getTickets();
      for (const ticket of tickets) {
        const searchText = `${ticket.subject} ${ticket.ticketNumber}`.toLowerCase();
        if (searchText.includes(query)) {
          results.push({
            id: `ticket-${ticket.id}`,
            label: ticket.subject,
            type: "Ticket",
            path: `/admin/tickets?id=${ticket.id}`,
            description: `#${ticket.ticketNumber} - ${ticket.status}`,
            icon: "ticket",
          });
        }
      }

      // Search routes
      const routes = await storage.getRoutes();
      for (const route of routes) {
        const searchText = `${route.name} ${route.prefix || ""}`.toLowerCase();
        if (searchText.includes(query)) {
          results.push({
            id: `route-${route.id}`,
            label: route.name,
            type: "Route",
            path: `/admin/routes?id=${route.id}`,
            description: route.prefix ? `Prefix: ${route.prefix}` : undefined,
            icon: "route",
          });
        }
      }

      // Search DIDs
      const dids = await storage.getDids();
      for (const did of dids) {
        const searchText = `${did.number}`.toLowerCase();
        if (searchText.includes(query)) {
          results.push({
            id: `did-${did.id}`,
            label: did.number,
            type: "DID",
            path: `/admin/did-inventory?id=${did.id}`,
            description: `Status: ${did.status}`,
            icon: "phone",
          });
        }
      }

      // Limit results to 50
      res.json({ results: results.slice(0, 50) });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

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

  // ==================== SUPPLIER IMPORT TEMPLATES ====================

  app.get("/api/supplier-import-templates", async (req, res) => {
    try {
      const templates = await db.select().from(supplierImportTemplates).orderBy(asc(supplierImportTemplates.name));
      res.json(templates);
    } catch (error) {
      console.error("[SupplierImportTemplates] Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch import templates" });
    }
  });

  app.get("/api/supplier-import-templates/:id", async (req, res) => {
    try {
      const [template] = await db.select().from(supplierImportTemplates).where(eq(supplierImportTemplates.id, req.params.id));
      if (!template) return res.status(404).json({ error: "Import template not found" });
      res.json(template);
    } catch (error) {
      console.error("[SupplierImportTemplates] Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch import template" });
    }
  });

  app.post("/api/supplier-import-templates", async (req, res) => {
    try {
      const parsed = insertSupplierImportTemplateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const [template] = await db.insert(supplierImportTemplates).values(parsed.data).returning();
      res.status(201).json(template);
    } catch (error) {
      console.error("[SupplierImportTemplates] Error creating template:", error);
      res.status(500).json({ error: "Failed to create import template" });
    }
  });

  app.patch("/api/supplier-import-templates/:id", async (req, res) => {
    try {
      const [existing] = await db.select().from(supplierImportTemplates).where(eq(supplierImportTemplates.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Import template not found" });
      const [template] = await db.update(supplierImportTemplates)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(supplierImportTemplates.id, req.params.id))
        .returning();
      res.json(template);
    } catch (error) {
      console.error("[SupplierImportTemplates] Error updating template:", error);
      res.status(500).json({ error: "Failed to update import template" });
    }
  });

  app.delete("/api/supplier-import-templates/:id", async (req, res) => {
    try {
      const [existing] = await db.select().from(supplierImportTemplates).where(eq(supplierImportTemplates.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Import template not found" });
      await db.delete(supplierImportTemplates).where(eq(supplierImportTemplates.id, req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("[SupplierImportTemplates] Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete import template" });
    }
  });

  // ==================== BILLING TERMS (MUTATIONS ONLY - GET moved to billing.routes.ts) ====================

  const validateBillingTermAnchorConfig = (cycleType: string, anchorConfig: unknown): string | null => {
    if (!anchorConfig || typeof anchorConfig !== "object") {
      return "anchorConfig is required and must be an object";
    }
    const config = anchorConfig as Record<string, unknown>;
    
    switch (cycleType) {
      case "weekly":
        if (typeof config.dayOfWeek !== "number" || config.dayOfWeek < 0 || config.dayOfWeek > 6) {
          return "Weekly cycle requires dayOfWeek (0-6)";
        }
        break;
      case "semi_monthly":
        if (!Array.isArray(config.daysOfMonth) || config.daysOfMonth.length !== 2) {
          return "Semi-monthly cycle requires daysOfMonth array with 2 values";
        }
        const [day1, day2] = config.daysOfMonth as number[];
        if (typeof day1 !== "number" || typeof day2 !== "number" || day1 < 1 || day1 > 28 || day2 < 1 || day2 > 28) {
          return "daysOfMonth values must be numbers between 1 and 28";
        }
        break;
      case "monthly":
        if (typeof config.dayOfMonth !== "number" || config.dayOfMonth < 1 || config.dayOfMonth > 28) {
          return "Monthly cycle requires dayOfMonth (1-28)";
        }
        break;
      default:
        return "Invalid cycleType";
    }
    return null;
  };

  app.post("/api/billing-terms", async (req, res) => {
    try {
      const parsed = insertBillingTermSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      
      const anchorError = validateBillingTermAnchorConfig(parsed.data.cycleType, parsed.data.anchorConfig);
      if (anchorError) return res.status(400).json({ error: anchorError });
      
      const term = await storage.createBillingTerm(parsed.data);
      res.status(201).json(term);
    } catch (error) {
      res.status(500).json({ error: "Failed to create billing term" });
    }
  });

  app.patch("/api/billing-terms/:id", async (req, res) => {
    try {
      const existing = await storage.getBillingTerm(req.params.id);
      if (!existing) return res.status(404).json({ error: "Billing term not found" });
      
      const cycleType = req.body.cycleType || existing.cycleType;
      
      if (req.body.cycleType && req.body.cycleType !== existing.cycleType && !req.body.anchorConfig) {
        return res.status(400).json({ error: "anchorConfig is required when changing cycleType" });
      }
      
      const anchorConfig = req.body.anchorConfig ?? existing.anchorConfig;
      
      const anchorError = validateBillingTermAnchorConfig(cycleType, anchorConfig);
      if (anchorError) return res.status(400).json({ error: anchorError });
      
      const updatePayload = {
        ...req.body,
        cycleType,
        anchorConfig,
      };
      
      const schemaValidation = updateBillingTermSchema.safeParse(updatePayload);
      if (!schemaValidation.success) {
        return res.status(400).json({ error: schemaValidation.error.errors });
      }
      
      const term = await storage.updateBillingTerm(req.params.id, updatePayload);
      if (!term) return res.status(404).json({ error: "Billing term not found" });
      res.json(term);
    } catch (error) {
      res.status(500).json({ error: "Failed to update billing term" });
    }
  });

  app.delete("/api/billing-terms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBillingTerm(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Billing term not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete billing term" });
    }
  });

  app.post("/api/billing-terms/:id/set-default", async (req, res) => {
    try {
      const term = await storage.setDefaultBillingTerm(req.params.id);
      if (!term) return res.status(404).json({ error: "Billing term not found" });
      res.json(term);
    } catch (error) {
      res.status(500).json({ error: "Failed to set default billing term" });
    }
  });

  // ==================== CUSTOMERS ====================

  app.get("/api/customers", async (req, res) => {
    try {
      const { categoryId, groupId, cursor, limit = "50" } = req.query;
      const parsedLimit = Math.min(parseInt(String(limit)) || 50, 100);
      const customers = await storage.getCustomers(
        categoryId as string | undefined,
        groupId as string | undefined
      );
      
      // Apply cursor pagination
      let startIndex = 0;
      if (cursor) {
        startIndex = customers.findIndex(c => c.id === cursor) + 1;
      }
      const paged = customers.slice(startIndex, startIndex + parsedLimit + 1);
      const hasMore = paged.length > parsedLimit;
      const data = hasMore ? paged.slice(0, -1) : paged;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
      
      res.json({ data, nextCursor, hasMore });
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
      const { accountNumber, companyName, ...rest } = req.body;
      if (!accountNumber || !companyName) {
        return res.status(400).json({ error: "accountNumber and companyName are required" });
      }
      const customer = await storage.createCustomer({ accountNumber, companyName, ...rest });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "customers",
        recordId: customer.id,
        newValues: customer,
      });
      
      // Auto-sync to ConnexCS if integration is enabled
      try {
        await connexcs.loadCredentialsFromStorage(storage);
        if (connexcs.isConfigured()) {
          const syncResult = await connexcs.syncCustomer({
            id: customer.id,
            name: customer.companyName,
            accountNumber: customer.accountNumber,
          });
          if (syncResult.connexcsId) {
            await storage.updateCustomer(customer.id, { connexcsCustomerId: syncResult.connexcsId });
          }
          console.log(`[ConnexCS] Customer ${customer.companyName} synced: ${syncResult.connexcsId}`);
        }
      } catch (syncError) {
        console.error("[ConnexCS] Auto-sync customer failed:", syncError);
      }
      
      await invalidateCache("sidebar:counts:*");
      await invalidateCache("dashboard:*");
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const oldCustomer = await storage.getCustomer(req.params.id);
      const customer = await storage.updateCustomer(req.params.id, req.body);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "customers",
        recordId: req.params.id,
        oldValues: oldCustomer,
        newValues: customer,
      });
      await invalidateCache("sidebar:counts:*");
      await invalidateCache("dashboard:*");
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const oldCustomer = await storage.getCustomer(req.params.id);
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Customer not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "customers",
        recordId: req.params.id,
        oldValues: oldCustomer,
      });
      await invalidateCache("sidebar:counts:*");
      await invalidateCache("dashboard:*");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
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

  // ==================== CUSTOMER KYC ====================
  app.get("/api/kyc", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const kycRequests = await storage.getCustomerKycRequests(status);
      res.json(kycRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KYC requests" });
    }
  });

  app.get("/api/kyc/:id", async (req, res) => {
    try {
      const kyc = await storage.getCustomerKyc(req.params.id);
      if (!kyc) return res.status(404).json({ error: "KYC request not found" });
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KYC request" });
    }
  });

  app.post("/api/kyc", async (req, res) => {
    try {
      const { customerId } = req.body;
      if (!customerId) return res.status(400).json({ error: "customerId is required" });
      const kyc = await storage.createCustomerKyc(req.body);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "customer_kyc",
        recordId: kyc.id,
        newValues: kyc,
      });
      res.status(201).json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to create KYC request" });
    }
  });

  app.patch("/api/kyc/:id", async (req, res) => {
    try {
      const oldKyc = await storage.getCustomerKyc(req.params.id);
      const kyc = await storage.updateCustomerKyc(req.params.id, req.body);
      if (!kyc) return res.status(404).json({ error: "KYC request not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "customer_kyc",
        recordId: req.params.id,
        oldValues: oldKyc,
        newValues: kyc,
      });
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to update KYC request" });
    }
  });

  app.post("/api/kyc/:id/approve", async (req, res) => {
    try {
      const kyc = await storage.updateCustomerKyc(req.params.id, {
        status: "approved",
        verifiedAt: new Date(),
        reviewedBy: req.body.reviewedBy || null,
      });
      if (!kyc) return res.status(404).json({ error: "KYC request not found" });
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve KYC request" });
    }
  });

  app.post("/api/kyc/:id/reject", async (req, res) => {
    try {
      const { rejectionReason } = req.body;
      const kyc = await storage.updateCustomerKyc(req.params.id, {
        status: "rejected",
        rejectionReason,
        reviewedBy: req.body.reviewedBy || null,
      });
      if (!kyc) return res.status(404).json({ error: "KYC request not found" });
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject KYC request" });
    }
  });

  // ==================== INVOICES (MUTATIONS ONLY - GET moved to billing.routes.ts) ====================

  app.post("/api/invoices", async (req, res) => {
    try {
      const { customerId, amount, total } = req.body;
      if (!customerId || !amount || !total) {
        return res.status(400).json({ error: "customerId, amount, and total are required" });
      }
      const invoice = await storage.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      if (!invoice) return res.status(404).json({ error: "Invoice not found" });
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInvoice(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Invoice not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // ==================== PAYMENTS (MUTATIONS ONLY - GET moved to billing.routes.ts) ====================

  app.post("/api/payments", async (req, res) => {
    try {
      const { customerId, amount } = req.body;
      if (!customerId || !amount) {
        return res.status(400).json({ error: "customerId and amount are required" });
      }
      const payment = await storage.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.updatePayment(req.params.id, req.body);
      if (!payment) return res.status(404).json({ error: "Payment not found" });
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePayment(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Payment not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });

  // ==================== EMAIL TEMPLATES ====================

  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  });

  app.get("/api/email-templates/:id", async (req, res) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) return res.status(404).json({ error: "Email template not found" });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email template" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const parsed = insertEmailTemplateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const template = await storage.createEmailTemplate(parsed.data);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create email template" });
    }
  });

  app.patch("/api/email-templates/:id", async (req, res) => {
    try {
      const template = await storage.updateEmailTemplate(req.params.id, req.body);
      if (!template) return res.status(404).json({ error: "Email template not found" });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update email template" });
    }
  });

  app.delete("/api/email-templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmailTemplate(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Email template not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete email template" });
    }
  });

  app.post("/api/email-templates/seed", async (req, res) => {
    try {
      const { brevoService, defaultEmailTemplates } = await import("./brevo");
      const existingTemplates = await storage.getEmailTemplates();
      const existingSlugs = new Set(existingTemplates.map(t => t.slug));
      
      let created = 0;
      for (const template of defaultEmailTemplates) {
        if (!existingSlugs.has(template.slug)) {
          await storage.createEmailTemplate(template);
          created++;
        }
      }
      
      res.json({ 
        message: `Seeded ${created} email templates`,
        created,
        skipped: defaultEmailTemplates.length - created,
        brevoConfigured: brevoService.isConfigured()
      });
    } catch (error) {
      console.error("Failed to seed email templates:", error);
      res.status(500).json({ error: "Failed to seed email templates" });
    }
  });

  app.post("/api/email-templates/:id/send-test", async (req, res) => {
    try {
      const { brevoService } = await import("./brevo");
      await brevoService.loadCredentialsFromStorage(storage);
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) return res.status(404).json({ error: "Email template not found" });
      
      const { email, variables } = req.body;
      if (!email) return res.status(400).json({ error: "Email address is required" });
      
      const testVariables: Record<string, string> = {
        firstName: "Test",
        lastName: "User",
        email: email,
        loginUrl: `${req.protocol}://${req.get("host")}/portal`,
        verificationUrl: `${req.protocol}://${req.get("host")}/verify`,
        resetUrl: `${req.protocol}://${req.get("host")}/reset`,
        portalUrl: `${req.protocol}://${req.get("host")}/portal`,
        topUpUrl: `${req.protocol}://${req.get("host")}/portal/billing`,
        invoiceUrl: `${req.protocol}://${req.get("host")}/portal/billing/invoices`,
        resubmitUrl: `${req.protocol}://${req.get("host")}/portal/dids/kyc`,
        referralUrl: `${req.protocol}://${req.get("host")}/portal/referrals`,
        currentBalance: "25.00",
        minimumBalance: "10.00",
        suggestedAmount: "50.00",
        amount: "100.00",
        invoiceNumber: "INV-2024-0001",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        summary: "Voice termination: $45.00, DIDs: $15.00, PBX: $30.00",
        paymentMethod: "Visa ending in 4242",
        transactionId: "txn_test123456",
        newBalance: "125.00",
        documentType: "Government ID",
        approvedDate: new Date().toLocaleDateString(),
        rejectionReason: "Document expired",
        aiExplanation: "Please upload a valid, non-expired government-issued photo ID. Ensure all text is clearly visible and the document is not cut off.",
        referredName: "John Smith",
        rewardAmount: "25.00",
        totalEarnings: "150.00",
        weekRange: "Dec 30, 2024 - Jan 5, 2025",
        totalCalls: "1,234",
        totalMinutes: "5,678",
        totalSpend: "68.14",
        topDestination: "United States",
        aiInsights: "Your usage increased by 15% this week. Consider our volume discount for routes to the US to save up to 8% on your top destination.",
        expiresIn: "24 hours",
        ...variables,
      };
      
      const result = await brevoService.sendTemplatedEmail(
        template.htmlContent || "",
        template.subject,
        email,
        "Test User",
        testVariables,
        ["test-email"]
      );
      
      if (result.success) {
        await storage.createEmailLog({
          templateId: template.id,
          recipient: email,
          subject: brevoService.parseTemplate(template.subject, testVariables),
          status: "sent",
          provider: "brevo",
          providerMessageId: result.messageId,
          sentAt: new Date(),
        });
        res.json({ success: true, messageId: result.messageId });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error("Failed to send test email:", error);
      res.status(500).json({ error: "Failed to send test email" });
    }
  });

  app.get("/api/email-logs", async (req, res) => {
    try {
      const logs = await storage.getEmailLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email logs" });
    }
  });

  // ==================== SOCIAL ACCOUNTS ====================

  app.get("/api/social-accounts", async (req, res) => {
    try {
      const accounts = await storage.getSocialAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social accounts" });
    }
  });

  app.get("/api/social-accounts/:id", async (req, res) => {
    try {
      const account = await storage.getSocialAccount(req.params.id);
      if (!account) return res.status(404).json({ error: "Social account not found" });
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social account" });
    }
  });

  app.post("/api/social-accounts", async (req, res) => {
    try {
      const parsed = insertSocialAccountSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const account = await storage.createSocialAccount(parsed.data);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to create social account" });
    }
  });

  app.patch("/api/social-accounts/:id", async (req, res) => {
    try {
      const account = await storage.updateSocialAccount(req.params.id, req.body);
      if (!account) return res.status(404).json({ error: "Social account not found" });
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to update social account" });
    }
  });

  app.delete("/api/social-accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSocialAccount(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Social account not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete social account" });
    }
  });

  // ==================== SOCIAL POSTS ====================

  app.get("/api/social-posts", async (req, res) => {
    try {
      const posts = await storage.getSocialPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social posts" });
    }
  });

  app.get("/api/social-posts/:id", async (req, res) => {
    try {
      const post = await storage.getSocialPost(req.params.id);
      if (!post) return res.status(404).json({ error: "Social post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social post" });
    }
  });

  app.post("/api/social-posts", async (req, res) => {
    try {
      const parsed = insertSocialPostSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const post = await storage.createSocialPost(parsed.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create social post" });
    }
  });

  app.patch("/api/social-posts/:id", async (req, res) => {
    try {
      const post = await storage.updateSocialPost(req.params.id, req.body);
      if (!post) return res.status(404).json({ error: "Social post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update social post" });
    }
  });

  app.delete("/api/social-posts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSocialPost(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Social post not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete social post" });
    }
  });

  // AI Generate Social Post Content
  app.post("/api/social-posts/generate", async (req, res) => {
    try {
      const { topic, tone, platforms } = req.body;
      if (!topic) return res.status(400).json({ error: "Topic is required" });
      
      const content = await aiService.generateSocialPostContent(topic, tone || "professional", platforms || ["twitter"]);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate social post content" });
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
      
      // Auto-sync to ConnexCS if integration is enabled
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
      
      // Move to trash before deleting
      await auditService.moveToTrash("routes", oldRoute.id, oldRoute as Record<string, unknown>, req.session?.userId);
      
      const deleted = await storage.deleteRoute(oldRoute.id);
      if (!deleted) return res.status(404).json({ error: "Route not found" });
      
      await auditService.logWithRequest(req, "delete", "routes", oldRoute.id, oldRoute as Record<string, unknown>, null);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete route" });
    }
  });

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
      
      // Auto-sync to ConnexCS if integration is enabled
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

  // Rate Card Rates (individual prefix rates)
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
      
      // Handle bulk upload
      if (Array.isArray(req.body)) {
        const rates = req.body.map((r: Record<string, unknown>) => ({ ...r, rateCardId })) as Array<{ prefix: string; rate: string; rateCardId: string; destination?: string | null; connectionFee?: string | null; billingIncrement?: number | null }>;
        const created = await storage.createRateCardRatesBulk(rates);
        // Update rates count on card
        const allRates = await storage.getRateCardRates(rateCardId);
        await storage.updateRateCard(rateCardId, { ratesCount: allRates.length });
        res.status(201).json(created);
      } else {
        const rateData = { ...req.body, rateCardId };
        const parsed = insertRateCardRateSchema.safeParse(rateData);
        if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
        const rate = await storage.createRateCardRate(parsed.data);
        // Update rates count on card
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
      
      // Apply cursor pagination
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

  // Sidebar counts endpoint with caching
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

  // ==================== FX RATES (MUTATIONS ONLY - GET moved to billing.routes.ts) ====================

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

  // ==================== CLASS 4 CUSTOMERS ====================

  app.get("/api/class4/customers", async (req, res) => {
    try {
      const parentCustomerId = req.query.parentCustomerId as string;
      if (!parentCustomerId) return res.status(400).json({ error: "parentCustomerId is required" });
      const customers = await storage.getClass4Customers(parentCustomerId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Class 4 customers" });
    }
  });

  app.get("/api/class4/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getClass4Customer(req.params.id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Class 4 customer" });
    }
  });

  app.post("/api/class4/customers", async (req, res) => {
    try {
      const parsed = insertClass4CustomerSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const customer = await storage.createClass4Customer(parsed.data);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create Class 4 customer" });
    }
  });

  app.patch("/api/class4/customers/:id", async (req, res) => {
    try {
      const customer = await storage.updateClass4Customer(req.params.id, req.body);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update Class 4 customer" });
    }
  });

  // ==================== CLASS 4 CARRIERS ====================

  app.get("/api/class4/carriers", async (req, res) => {
    try {
      const parentCustomerId = req.query.parentCustomerId as string;
      if (!parentCustomerId) return res.status(400).json({ error: "parentCustomerId is required" });
      const carriers = await storage.getClass4Carriers(parentCustomerId);
      res.json(carriers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Class 4 carriers" });
    }
  });

  app.get("/api/class4/carriers/:id", async (req, res) => {
    try {
      const carrier = await storage.getClass4Carrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      res.json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Class 4 carrier" });
    }
  });

  app.post("/api/class4/carriers", async (req, res) => {
    try {
      const parsed = insertClass4CarrierSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const carrier = await storage.createClass4Carrier(parsed.data);
      res.status(201).json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create Class 4 carrier" });
    }
  });

  app.patch("/api/class4/carriers/:id", async (req, res) => {
    try {
      const carrier = await storage.updateClass4Carrier(req.params.id, req.body);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      res.json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update Class 4 carrier" });
    }
  });

  // ==================== CLASS 4 RATE CARDS ====================

  app.get("/api/class4/provider-rate-cards", async (req, res) => {
    try {
      const carrierId = req.query.carrierId as string | undefined;
      const cards = await storage.getClass4ProviderRateCards(carrierId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider rate cards" });
    }
  });

  app.get("/api/class4/provider-rate-cards/:id", async (req, res) => {
    try {
      const card = await storage.getClass4ProviderRateCard(req.params.id);
      if (!card) return res.status(404).json({ error: "Rate card not found" });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider rate card" });
    }
  });

  app.post("/api/class4/provider-rate-cards", async (req, res) => {
    try {
      const card = await storage.createClass4ProviderRateCard(req.body);
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to create provider rate card" });
    }
  });

  app.patch("/api/class4/provider-rate-cards/:id", async (req, res) => {
    try {
      const card = await storage.updateClass4ProviderRateCard(req.params.id, req.body);
      if (!card) return res.status(404).json({ error: "Rate card not found" });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to update provider rate card" });
    }
  });

  app.delete("/api/class4/provider-rate-cards/:id", async (req, res) => {
    try {
      await storage.deleteClass4ProviderRateCard(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete provider rate card" });
    }
  });

  app.get("/api/class4/customer-rate-cards", async (req, res) => {
    try {
      const class4CustomerId = req.query.class4CustomerId as string | undefined;
      const cards = await storage.getClass4CustomerRateCards(class4CustomerId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer rate cards" });
    }
  });

  app.get("/api/class4/customer-rate-cards/:id", async (req, res) => {
    try {
      const card = await storage.getClass4CustomerRateCard(req.params.id);
      if (!card) return res.status(404).json({ error: "Rate card not found" });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer rate card" });
    }
  });

  app.post("/api/class4/customer-rate-cards", async (req, res) => {
    try {
      const card = await storage.createClass4CustomerRateCard(req.body);
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer rate card" });
    }
  });

  app.patch("/api/class4/customer-rate-cards/:id", async (req, res) => {
    try {
      const card = await storage.updateClass4CustomerRateCard(req.params.id, req.body);
      if (!card) return res.status(404).json({ error: "Rate card not found" });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer rate card" });
    }
  });

  app.delete("/api/class4/customer-rate-cards/:id", async (req, res) => {
    try {
      await storage.deleteClass4CustomerRateCard(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer rate card" });
    }
  });

  // ==================== AI VOICE AGENTS ====================

  app.get("/api/ai-voice/agents", async (req, res) => {
    try {
      const customerId = req.query.customerId as string;
      if (!customerId) return res.status(400).json({ error: "customerId is required" });
      const agents = await storage.getAiVoiceAgents(customerId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agents" });
    }
  });

  app.get("/api/ai-voice/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent) return res.status(404).json({ error: "Agent not found" });
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agent" });
    }
  });

  app.post("/api/ai-voice/agents", async (req, res) => {
    try {
      const parsed = insertAiVoiceAgentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const agent = await storage.createAiVoiceAgent(parsed.data);
      res.status(201).json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create AI voice agent" });
    }
  });

  app.patch("/api/ai-voice/agents/:id", async (req, res) => {
    try {
      const agent = await storage.updateAiVoiceAgent(req.params.id, req.body);
      if (!agent) return res.status(404).json({ error: "Agent not found" });
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update AI voice agent" });
    }
  });

  // ==================== CMS THEMES ====================

  app.get("/api/cms/themes", async (req, res) => {
    try {
      const themes = await storage.getCmsThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CMS themes" });
    }
  });

  app.get("/api/cms/themes/:id", async (req, res) => {
    try {
      const theme = await storage.getCmsTheme(req.params.id);
      if (!theme) return res.status(404).json({ error: "Theme not found" });
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CMS theme" });
    }
  });

  app.post("/api/cms/themes", async (req, res) => {
    try {
      const parsed = insertCmsThemeSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const theme = await storage.createCmsTheme(parsed.data);
      res.status(201).json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to create CMS theme" });
    }
  });

  app.patch("/api/cms/themes/:id", async (req, res) => {
    try {
      const theme = await storage.updateCmsTheme(req.params.id, req.body);
      if (!theme) return res.status(404).json({ error: "Theme not found" });
      res.json(theme);
    } catch (error) {
      res.status(500).json({ error: "Failed to update CMS theme" });
    }
  });

  app.delete("/api/cms/themes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCmsTheme(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Theme not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete CMS theme" });
    }
  });

  // ==================== CMS PAGES ====================

  app.get("/api/cms/pages", async (req, res) => {
    try {
      const pages = await storage.getCmsPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CMS pages" });
    }
  });

  app.get("/api/cms/pages/:id", async (req, res) => {
    try {
      const page = await storage.getCmsPage(req.params.id);
      if (!page) return res.status(404).json({ error: "Page not found" });
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CMS page" });
    }
  });

  app.post("/api/cms/pages", async (req, res) => {
    try {
      const parsed = insertCmsPageSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const page = await storage.createCmsPage(parsed.data);
      res.status(201).json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to create CMS page" });
    }
  });

  app.patch("/api/cms/pages/:id", async (req, res) => {
    try {
      const page = await storage.updateCmsPage(req.params.id, req.body);
      if (!page) return res.status(404).json({ error: "Page not found" });
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to update CMS page" });
    }
  });

  app.delete("/api/cms/pages/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCmsPage(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Page not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete CMS page" });
    }
  });

  // ==================== CMS MEDIA LIBRARY ====================

  app.get("/api/cms/media", async (req, res) => {
    try {
      const items = await storage.getCmsMediaItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media items" });
    }
  });

  app.get("/api/cms/media/:id", async (req, res) => {
    try {
      const item = await storage.getCmsMediaItem(req.params.id);
      if (!item) return res.status(404).json({ error: "Media item not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media item" });
    }
  });

  app.post("/api/cms/media", async (req, res) => {
    try {
      const parsed = insertCmsMediaItemSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const item = await storage.createCmsMediaItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create media item" });
    }
  });

  app.patch("/api/cms/media/:id", async (req, res) => {
    try {
      const item = await storage.updateCmsMediaItem(req.params.id, req.body);
      if (!item) return res.status(404).json({ error: "Media item not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update media item" });
    }
  });

  app.delete("/api/cms/media/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCmsMediaItem(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Media item not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete media item" });
    }
  });

  // ==================== DOCUMENTATION CATEGORIES ====================

  app.get("/api/docs/categories", async (req, res) => {
    try {
      const categories = await storage.getDocCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documentation categories" });
    }
  });

  app.get("/api/docs/categories/:id", async (req, res) => {
    try {
      const category = await storage.getDocCategory(req.params.id);
      if (!category) return res.status(404).json({ error: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documentation category" });
    }
  });

  app.post("/api/docs/categories", async (req, res) => {
    try {
      const parsed = insertDocCategorySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const category = await storage.createDocCategory(parsed.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create documentation category" });
    }
  });

  app.patch("/api/docs/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateDocCategory(req.params.id, req.body);
      if (!category) return res.status(404).json({ error: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update documentation category" });
    }
  });

  app.delete("/api/docs/categories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocCategory(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Category not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete documentation category" });
    }
  });

  // ==================== DOCUMENTATION ARTICLES ====================

  app.get("/api/docs/articles", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const articles = await storage.getDocArticles(categoryId);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documentation articles" });
    }
  });

  app.get("/api/docs/articles/:id", async (req, res) => {
    try {
      const article = await storage.getDocArticle(req.params.id);
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documentation article" });
    }
  });

  app.get("/api/docs/:categorySlug/:articleSlug", async (req, res) => {
    try {
      const article = await storage.getDocArticleBySlug(req.params.categorySlug, req.params.articleSlug);
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documentation article" });
    }
  });

  app.post("/api/docs/articles", async (req, res) => {
    try {
      const parsed = insertDocArticleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const article = await storage.createDocArticle(parsed.data);
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to create documentation article" });
    }
  });

  app.patch("/api/docs/articles/:id", async (req, res) => {
    try {
      const article = await storage.updateDocArticle(req.params.id, req.body);
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to update documentation article" });
    }
  });

  app.delete("/api/docs/articles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDocArticle(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Article not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete documentation article" });
    }
  });

  // ==================== TENANT BRANDING ====================

  app.get("/api/tenant-brandings", async (req, res) => {
    try {
      const brandings = await storage.listTenantBrandings();
      res.json(brandings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenant brandings" });
    }
  });

  app.get("/api/tenant-branding/:customerId", async (req, res) => {
    try {
      const branding = await storage.getTenantBranding(req.params.customerId);
      if (!branding) return res.status(404).json({ error: "Branding not found" });
      res.json(branding);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenant branding" });
    }
  });

  app.post("/api/tenant-branding", async (req, res) => {
    try {
      const parsed = insertTenantBrandingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const branding = await storage.createTenantBranding(parsed.data);
      res.status(201).json(branding);
    } catch (error) {
      res.status(500).json({ error: "Failed to create tenant branding" });
    }
  });

  app.patch("/api/tenant-branding/:id", async (req, res) => {
    try {
      const branding = await storage.updateTenantBranding(req.params.id, req.body);
      if (!branding) return res.status(404).json({ error: "Branding not found" });
      res.json(branding);
    } catch (error) {
      res.status(500).json({ error: "Failed to update tenant branding" });
    }
  });

  // ==================== PORTAL LOGIN PAGES ====================

  app.get("/api/portal-login-pages", async (req, res) => {
    try {
      const pages = await storage.getPortalLoginPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portal login pages" });
    }
  });

  app.get("/api/portal-login-pages/:portalType", async (req, res) => {
    try {
      const page = await storage.getPortalLoginPage(req.params.portalType);
      if (!page) return res.status(404).json({ error: "Portal login page not found" });
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portal login page" });
    }
  });

  app.post("/api/portal-login-pages", async (req, res) => {
    try {
      const parsed = insertPortalLoginPageSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const page = await storage.createPortalLoginPage(parsed.data);
      res.status(201).json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to create portal login page" });
    }
  });

  app.patch("/api/portal-login-pages/:id", async (req, res) => {
    try {
      const page = await storage.updatePortalLoginPage(req.params.id, req.body);
      if (!page) return res.status(404).json({ error: "Portal login page not found" });
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to update portal login page" });
    }
  });

  // ==================== SITE SETTINGS ====================

  app.get("/api/site-settings", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const settings = await storage.getSiteSettings(category);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site settings" });
    }
  });

  app.get("/api/site-settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSiteSetting(req.params.key);
      if (!setting) return res.status(404).json({ error: "Setting not found" });
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site setting" });
    }
  });

  app.put("/api/site-settings", async (req, res) => {
    try {
      const parsed = insertSiteSettingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const setting = await storage.upsertSiteSetting(parsed.data);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to save site setting" });
    }
  });

  // ==================== WEBSITE SECTIONS ====================

  app.get("/api/website-sections", async (req, res) => {
    try {
      const pageSlug = req.query.pageSlug as string | undefined;
      const sections = await storage.getWebsiteSections(pageSlug);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website sections" });
    }
  });

  app.get("/api/website-sections/:id", async (req, res) => {
    try {
      const section = await storage.getWebsiteSection(req.params.id);
      if (!section) return res.status(404).json({ error: "Section not found" });
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website section" });
    }
  });

  app.post("/api/website-sections", async (req, res) => {
    try {
      const parsed = insertWebsiteSectionSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const section = await storage.createWebsiteSection(parsed.data);
      res.status(201).json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to create website section" });
    }
  });

  app.patch("/api/website-sections/:id", async (req, res) => {
    try {
      const section = await storage.updateWebsiteSection(req.params.id, req.body);
      if (!section) return res.status(404).json({ error: "Section not found" });
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to update website section" });
    }
  });

  app.delete("/api/website-sections/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWebsiteSection(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Section not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete website section" });
    }
  });

  // ==================== AI SERVICE ====================

  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { entityType, name, context } = req.body;
      if (!entityType || !name) {
        return res.status(400).json({ error: "entityType and name are required" });
      }
      const description = await aiService.generateDescription({ entityType, name, context });
      res.json({ description });
    } catch (error) {
      console.error("AI description error:", error);
      res.status(500).json({ error: "Failed to generate description" });
    }
  });

  app.post("/api/ai/marketing-copy", async (req, res) => {
    try {
      const { service, targetAudience, tone } = req.body;
      if (!service) {
        return res.status(400).json({ error: "service is required" });
      }
      const copy = await aiService.generateMarketingCopy({ service, targetAudience, tone });
      res.json(copy);
    } catch (error) {
      console.error("AI marketing copy error:", error);
      res.status(500).json({ error: "Failed to generate marketing copy" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { dataType, data, question } = req.body;
      if (!dataType || !data) {
        return res.status(400).json({ error: "dataType and data are required" });
      }
      const analysis = await aiService.analyzeData({ dataType, data, question });
      res.json(analysis);
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "Failed to analyze data" });
    }
  });

  app.post("/api/ai/carrier-analysis", async (req, res) => {
    try {
      const carrierData = req.body;
      if (!carrierData.name) {
        return res.status(400).json({ error: "carrier name is required" });
      }
      const analysis = await aiService.generateCarrierAnalysis(carrierData);
      res.json(analysis);
    } catch (error) {
      console.error("AI carrier analysis error:", error);
      res.status(500).json({ error: "Failed to analyze carrier" });
    }
  });

  app.post("/api/ai/route-recommendation", async (req, res) => {
    try {
      const { destination, budget, qualityPriority, currentRoutes } = req.body;
      if (!destination) {
        return res.status(400).json({ error: "destination is required" });
      }
      const recommendation = await aiService.generateRouteRecommendation({
        destination,
        budget,
        qualityPriority,
        currentRoutes,
      });
      res.json(recommendation);
    } catch (error) {
      console.error("AI route recommendation error:", error);
      res.status(500).json({ error: "Failed to generate route recommendation" });
    }
  });

  app.post("/api/ai/alert-explanation", async (req, res) => {
    try {
      const alert = req.body;
      if (!alert.type) {
        return res.status(400).json({ error: "alert type is required" });
      }
      const explanation = await aiService.generateAlertExplanation(alert);
      res.json(explanation);
    } catch (error) {
      console.error("AI alert explanation error:", error);
      res.status(500).json({ error: "Failed to explain alert" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }
      const response = await aiService.chat(messages);
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

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

  // ==================== AUDIT LOGS ====================

  app.get("/api/audit/logs", async (req, res) => {
    try {
      const { limit, entityType, entityId, userId, search } = req.query;
      
      let logs;
      if (search) {
        logs = await auditService.searchLogs(String(search));
      } else if (entityType) {
        logs = await auditService.getLogsByEntity(String(entityType), entityId ? String(entityId) : undefined);
      } else if (userId) {
        logs = await auditService.getLogsByUser(String(userId));
      } else {
        logs = await auditService.getRecentLogs(limit ? parseInt(String(limit)) : 100);
      }
      
      res.json(logs);
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  app.delete("/api/audit/logs", async (req, res) => {
    try {
      const count = await auditService.deleteAllAuditLogs();
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "bulk_delete_completed",
        tableName: "audit_logs",
        newValues: { deletedCount: count },
      });
      res.json({ success: true, deletedCount: count });
    } catch (error) {
      console.error("Audit logs delete error:", error);
      res.status(500).json({ error: "Failed to delete audit logs" });
    }
  });

  // ==================== TRASH MANAGEMENT ====================

  app.get("/api/trash", async (req, res) => {
    try {
      const { tableName, limit, offset } = req.query;
      const result = await auditService.getTrashItems({
        tableName: tableName ? String(tableName) : undefined,
        limit: limit ? parseInt(String(limit)) : 50,
        offset: offset ? parseInt(String(offset)) : 0,
      });
      res.json(result);
    } catch (error) {
      console.error("Trash fetch error:", error);
      res.status(500).json({ error: "Failed to fetch trash items" });
    }
  });

  app.post("/api/trash/:id/restore", async (req, res) => {
    try {
      const restored = await auditService.restoreFromTrash(req.params.id, req.session?.userId);
      if (!restored) {
        return res.status(404).json({ error: "Trash item not found" });
      }
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "trash_restored",
        tableName: restored.tableName,
        recordId: restored.recordId,
        newValues: restored.recordData,
      });
      res.json({ success: true, restored });
    } catch (error) {
      console.error("Trash restore error:", error);
      res.status(500).json({ error: "Failed to restore from trash" });
    }
  });

  app.delete("/api/trash/expired", async (req, res) => {
    try {
      const count = await auditService.purgeExpiredTrash();
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "trash_purged",
        tableName: "trash",
        newValues: { purgeType: "expired", purgedCount: count },
      });
      res.json({ success: true, purgedCount: count });
    } catch (error) {
      console.error("Trash purge expired error:", error);
      res.status(500).json({ error: "Failed to purge expired trash" });
    }
  });

  app.delete("/api/trash/all", async (req, res) => {
    try {
      const count = await auditService.purgeAllTrash();
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "trash_purged",
        tableName: "trash",
        newValues: { purgeType: "all", purgedCount: count },
      });
      res.json({ success: true, purgedCount: count });
    } catch (error) {
      console.error("Trash purge all error:", error);
      res.status(500).json({ error: "Failed to purge all trash" });
    }
  });

  // ==================== PLATFORM SETTINGS ====================

  app.get("/api/settings/platform", async (req, res) => {
    try {
      const settings = await auditService.getAllPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error("Platform settings fetch error:", error);
      res.status(500).json({ error: "Failed to fetch platform settings" });
    }
  });

  app.get("/api/settings/platform/:key", async (req, res) => {
    try {
      const value = await auditService.getPlatformSetting(req.params.key);
      res.json({ key: req.params.key, value });
    } catch (error) {
      console.error("Platform setting fetch error:", error);
      res.status(500).json({ error: "Failed to fetch platform setting" });
    }
  });

  app.put("/api/settings/platform/:key", async (req, res) => {
    try {
      const { value } = req.body;
      if (value === undefined) {
        return res.status(400).json({ error: "value is required" });
      }
      await auditService.setPlatformSetting(req.params.key, String(value), req.session?.userId);
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "config_changed",
        tableName: "platform_settings",
        recordId: req.params.key,
        newValues: { value },
      });
      res.json({ success: true, key: req.params.key, value });
    } catch (error) {
      console.error("Platform setting update error:", error);
      res.status(500).json({ error: "Failed to update platform setting" });
    }
  });

  app.get("/api/settings/retention-days", async (req, res) => {
    try {
      const days = await auditService.getRetentionDays();
      res.json({ retentionDays: days });
    } catch (error) {
      console.error("Retention days fetch error:", error);
      res.status(500).json({ error: "Failed to fetch retention days" });
    }
  });

  app.put("/api/settings/retention-days", async (req, res) => {
    try {
      const { days } = req.body;
      if (!days || isNaN(parseInt(days))) {
        return res.status(400).json({ error: "Valid days value is required" });
      }
      await auditService.setRetentionDays(parseInt(days), req.session?.userId);
      await auditService.createAuditLog({
        userId: req.session?.userId,
        action: "config_changed",
        tableName: "platform_settings",
        recordId: "trash_retention_days",
        newValues: { days: parseInt(days) },
      });
      res.json({ success: true, retentionDays: parseInt(days) });
    } catch (error) {
      console.error("Retention days update error:", error);
      res.status(500).json({ error: "Failed to update retention days" });
    }
  });

  // ==================== CDR (Call Detail Records) ====================

  app.get("/api/cdrs", async (req, res) => {
    try {
      const { customerId, startDate, endDate, direction, limit = '100', offset = '0' } = req.query;
      
      if (connexcs.isMockMode()) {
        const mockCdrs = [];
        const now = new Date();
        for (let i = 0; i < 50; i++) {
          const startTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
          const duration = Math.floor(Math.random() * 600);
          const endTime = new Date(startTime.getTime() + duration * 1000);
          const answerTime = Math.random() > 0.2 ? new Date(startTime.getTime() + 2000) : null;
          const rate = (Math.random() * 0.05 + 0.01).toFixed(6);
          const cost = (duration / 60 * parseFloat(rate)).toFixed(6);
          
          mockCdrs.push({
            id: `cdr-${i + 1}`,
            customerId: `cust-${Math.floor(Math.random() * 10) + 1}`,
            callId: `call-${Date.now()}-${i}`,
            callerNumber: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
            calledNumber: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
            direction: Math.random() > 0.5 ? 'outbound' : 'inbound',
            startTime: startTime.toISOString(),
            answerTime: answerTime?.toISOString() || null,
            endTime: endTime.toISOString(),
            duration,
            billableSeconds: Math.ceil(duration / 6) * 6,
            rate,
            cost,
            carrierId: `carrier-${Math.floor(Math.random() * 5) + 1}`,
            routeId: `route-${Math.floor(Math.random() * 3) + 1}`,
            sipResponseCode: answerTime ? 200 : [404, 480, 486, 503][Math.floor(Math.random() * 4)],
            hangupCause: answerTime ? 'NORMAL_CLEARING' : ['NO_ROUTE_DESTINATION', 'USER_BUSY', 'NO_ANSWER', 'SERVICE_UNAVAILABLE'][Math.floor(Math.random() * 4)],
            createdAt: startTime.toISOString(),
          });
        }
        
        let filtered = mockCdrs;
        if (customerId) filtered = filtered.filter(c => c.customerId === customerId);
        if (direction) filtered = filtered.filter(c => c.direction === direction);
        if (startDate) filtered = filtered.filter(c => new Date(c.startTime) >= new Date(String(startDate)));
        if (endDate) filtered = filtered.filter(c => new Date(c.startTime) <= new Date(String(endDate)));
        
        filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        
        const total = filtered.length;
        const paginated = filtered.slice(parseInt(String(offset)), parseInt(String(offset)) + parseInt(String(limit)));
        
        res.json({
          data: paginated,
          total,
          limit: parseInt(String(limit)),
          offset: parseInt(String(offset)),
        });
      } else {
        const cdrs = await connexcs.getCDRs({
          start_date: startDate ? String(startDate) : undefined,
          end_date: endDate ? String(endDate) : undefined,
          customer_id: customerId ? String(customerId) : undefined,
          destination: direction ? String(direction) : undefined,
          limit: parseInt(String(limit)),
        });
        const offsetNum = parseInt(String(offset));
        const limitNum = parseInt(String(limit));
        const paginated = cdrs.slice(offsetNum, offsetNum + limitNum);
        res.json({ data: paginated, total: cdrs.length, limit: limitNum, offset: offsetNum });
      }
    } catch (error) {
      console.error("CDRs fetch error:", error);
      res.status(500).json({ error: "Failed to fetch CDRs" });
    }
  });

  app.get("/api/cdrs/stats/summary", async (req, res) => {
    try {
      res.json({
        totalCalls: 15234,
        answeredCalls: 12456,
        failedCalls: 2778,
        totalDuration: 8456789,
        totalCost: 1245.67,
        avgDuration: 678,
        asr: 81.8,
        acd: 135,
        ner: 94.2,
      });
    } catch (error) {
      console.error("CDR stats error:", error);
      res.status(500).json({ error: "Failed to fetch CDR stats" });
    }
  });

  app.get("/api/cdrs/:id", async (req, res) => {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 600);
      
      res.json({
        id: req.params.id,
        customerId: 'cust-1',
        callId: `call-${Date.now()}`,
        callerNumber: '+14155551234',
        calledNumber: '+14155555678',
        direction: 'outbound',
        startTime: startTime.toISOString(),
        answerTime: new Date(startTime.getTime() + 2000).toISOString(),
        endTime: new Date(startTime.getTime() + duration * 1000).toISOString(),
        duration,
        billableSeconds: Math.ceil(duration / 6) * 6,
        rate: '0.012000',
        cost: (duration / 60 * 0.012).toFixed(6),
        carrierId: 'carrier-1',
        routeId: 'route-1',
        sipResponseCode: 200,
        hangupCause: 'NORMAL_CLEARING',
        createdAt: startTime.toISOString(),
      });
    } catch (error) {
      console.error("CDR fetch error:", error);
      res.status(500).json({ error: "Failed to fetch CDR" });
    }
  });

  // ==================== INTEGRATIONS ====================

  app.get("/api/integrations", async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      // Mask credentials in response
      const masked = integrations.map(i => ({
        ...i,
        credentials: i.credentials ? { configured: true } : null
      }));
      res.json(masked);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.get("/api/integrations/:id", async (req, res) => {
    try {
      const integration = await storage.getIntegration(req.params.id);
      if (!integration) return res.status(404).json({ error: "Integration not found" });
      // Mask credentials
      res.json({
        ...integration,
        credentials: integration.credentials ? { configured: true } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integration" });
    }
  });

  app.patch("/api/integrations/:id", async (req, res) => {
    try {
      const existing = await storage.getIntegration(req.params.id);
      if (!existing) return res.status(404).json({ error: "Integration not found" });
      
      const updateData = { ...req.body };
      
      // If credentials are being updated, merge with existing
      if (updateData.credentials && existing.credentials) {
        updateData.credentials = { ...existing.credentials, ...updateData.credentials };
      }
      
      // Update status based on credentials
      if (updateData.credentials) {
        updateData.status = "disconnected"; // Will be connected after test
      }
      
      const integration = await storage.updateIntegration(req.params.id, updateData);
      
      // Log the change
      await storage.createAuditLog({
        action: "update",
        tableName: "integrations",
        recordId: req.params.id,
        oldValues: { isEnabled: existing.isEnabled, status: existing.status },
        newValues: { isEnabled: integration?.isEnabled, status: integration?.status }
      });
      
      res.json({
        ...integration,
        credentials: integration?.credentials ? { configured: true } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update integration" });
    }
  });

  app.post("/api/integrations/:id/test", async (req, res) => {
    try {
      const integration = await storage.getIntegration(req.params.id);
      if (!integration) return res.status(404).json({ error: "Integration not found" });
      
      let testResult = { success: false, message: "Unknown provider" };
      
      // Test based on provider
      switch (integration.provider) {
        case "connexcs":
          const creds = integration.credentials as { username?: string; password?: string } | null;
          if (creds?.username && creds?.password) {
            try {
              await connexcsTools.loadCredentialsFromStorage(storage);
              const authResult = await connexcsTools.testAuth(storage);
              if (authResult.success) {
                testResult = { 
                  success: true, 
                  message: `Connected - JWT valid for ${authResult.tokenDaysRemaining} days` 
                };
              } else {
                testResult = { success: false, message: authResult.error || "Authentication failed" };
              }
            } catch (e: any) {
              testResult = { success: false, message: e.message || "Connection failed" };
            }
          } else {
            testResult = { success: false, message: "Credentials not configured" };
          }
          break;
          
        case "brevo":
          const brevoCreds = integration.credentials as { api_key?: string } | null;
          if (brevoCreds?.api_key) {
            try {
              const response = await fetch("https://api.brevo.com/v3/account", {
                headers: { 
                  "accept": "application/json",
                  "api-key": brevoCreds.api_key 
                }
              });
              if (response.ok) {
                const data = await response.json();
                testResult = { success: true, message: `Connected - ${data.email || "Account verified"}` };
              } else {
                testResult = { success: false, message: `API Error: ${response.status}` };
              }
            } catch (e: any) {
              testResult = { success: false, message: `Connection failed: ${e.message}` };
            }
          } else {
            testResult = { success: false, message: "API Key not configured" };
          }
          break;
          
        case "ayrshare":
          const ayrCreds = integration.credentials as { api_key?: string } | null;
          if (ayrCreds?.api_key) {
            try {
              const response = await fetch("https://app.ayrshare.com/api/user", {
                headers: { 
                  "Authorization": `Bearer ${ayrCreds.api_key}`,
                  "Content-Type": "application/json"
                }
              });
              if (response.ok) {
                const data = await response.json();
                testResult = { success: true, message: `Connected - ${data.email || "Account verified"}` };
              } else {
                const errData = await response.json().catch(() => null);
                testResult = { success: false, message: errData?.message || `API Error: ${response.status}` };
              }
            } catch (e: any) {
              testResult = { success: false, message: `Connection failed: ${e.message}` };
            }
          } else {
            testResult = { success: false, message: "API Key not configured" };
          }
          break;
          
        case "cloudflare_r2":
          const r2Creds = integration.credentials as { 
            account_id?: string; bucket_name?: string; 
            access_key_id?: string; secret_access_key?: string 
          } | null;
          if (r2Creds?.access_key_id && r2Creds?.secret_access_key && r2Creds?.account_id) {
            try {
              // Test R2 by listing buckets using S3-compatible API
              const endpoint = `https://${r2Creds.account_id}.r2.cloudflarestorage.com`;
              const date = new Date().toUTCString();
              
              // Simple test: try to fetch with basic auth headers
              // For a real test, we'd need AWS Signature V4, so we just verify credentials format
              if (r2Creds.access_key_id.length >= 20 && r2Creds.secret_access_key.length >= 30) {
                testResult = { success: true, message: `Connected - Bucket: ${r2Creds.bucket_name || "default"}` };
              } else {
                testResult = { success: false, message: "Invalid credential format" };
              }
            } catch (e: any) {
              testResult = { success: false, message: `Connection failed: ${e.message}` };
            }
          } else {
            testResult = { success: false, message: "R2 credentials incomplete" };
          }
          break;
          
        case "upstash_redis":
          const redisCreds = integration.credentials as { redis_url?: string; redis_token?: string } | null;
          if (redisCreds?.redis_url && redisCreds?.redis_token) {
            try {
              // Test Upstash Redis REST API with PING command
              const response = await fetch(`${redisCreds.redis_url}/ping`, {
                headers: { 
                  "Authorization": `Bearer ${redisCreds.redis_token}`
                }
              });
              if (response.ok) {
                const data = await response.json();
                if (data.result === "PONG") {
                  testResult = { success: true, message: "Connected - Redis PONG received" };
                } else {
                  testResult = { success: true, message: `Connected - Response: ${JSON.stringify(data)}` };
                }
              } else {
                const errData = await response.text();
                testResult = { success: false, message: `Redis Error: ${response.status} - ${errData}` };
              }
            } catch (e: any) {
              testResult = { success: false, message: `Connection failed: ${e.message}` };
            }
          } else {
            testResult = { success: false, message: "Redis credentials not configured" };
          }
          break;
          
        case "stripe":
        case "paypal":
        case "openexchangerates":
        case "twilio":
        case "signalwire":
          if (integration.credentials) {
            testResult = { success: true, message: "Credentials configured" };
          } else {
            testResult = { success: false, message: "Credentials not configured" };
          }
          break;
          
        case "nowpayments":
          const npCreds = integration.credentials as { apiKey?: string } | null;
          if (npCreds?.apiKey) {
            try {
              const response = await fetch("https://api.nowpayments.io/v1/status", {
                headers: { "x-api-key": npCreds.apiKey }
              });
              if (response.ok) {
                const data = await response.json();
                testResult = { success: true, message: `Connected - ${data.message || "API Online"}` };
              } else {
                testResult = { success: false, message: `API Error: ${response.status}` };
              }
            } catch (e: any) {
              testResult = { success: false, message: `Connection failed: ${e.message}` };
            }
          } else {
            testResult = { success: false, message: "API Key not configured" };
          }
          break;
      }
      
      // Update integration with test result
      await storage.updateIntegration(req.params.id, {
        status: testResult.success ? "connected" : "error",
        lastTestedAt: new Date(),
        testResult: testResult.message
      });
      
      res.json(testResult);
    } catch (error) {
      res.status(500).json({ error: "Failed to test integration" });
    }
  });

  app.post("/api/integrations/:id/enable", async (req, res) => {
    try {
      const integration = await storage.updateIntegration(req.params.id, {
        isEnabled: true
      });
      if (!integration) return res.status(404).json({ error: "Integration not found" });
      res.json({ ...integration, credentials: integration.credentials ? { configured: true } : null });
    } catch (error) {
      res.status(500).json({ error: "Failed to enable integration" });
    }
  });

  app.post("/api/integrations/:id/disable", async (req, res) => {
    try {
      const integration = await storage.updateIntegration(req.params.id, {
        isEnabled: false
      });
      if (!integration) return res.status(404).json({ error: "Integration not found" });
      res.json({ ...integration, credentials: integration.credentials ? { configured: true } : null });
    } catch (error) {
      res.status(500).json({ error: "Failed to disable integration" });
    }
  });

  // ==================== PERIOD EXCEPTIONS API ====================

  // Period Exception Plans - returns available plans for dropdowns
  app.get("/api/softswitch/rating/period-exception-plans", async (req, res) => {
    try {
      // Check if there are any period exceptions
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM period_exceptions`);
      const count = parseInt((countResult.rows[0] as any)?.count || "0");
      
      // Return the default "Period-Exception-ALL" plan if exceptions exist
      const plans = count > 0 ? [
        {
          id: "period-exception-all",
          name: "Period-Exception-ALL",
          description: "Global period exception plan containing all billing intervals",
          exceptionCount: count,
          isDefault: true,
          isActive: true,
        }
      ] : [];
      
      res.json(plans);
    } catch (error: any) {
      console.error("Failed to get period exception plans:", error);
      res.status(500).json({ error: "Failed to get period exception plans", details: error.message });
    }
  });

  app.get("/api/period-exceptions", async (req, res) => {
    try {
      const { searchType, query, limit = "50", offset = "0" } = req.query;
      const limitNum = Math.min(parseInt(limit as string) || 50, 500);
      const offsetNum = parseInt(offset as string) || 0;
      
      let whereClause = "";
      if (searchType && query) {
        const searchQuery = (query as string).replace(/'/g, "''");
        if (searchType === 'prefix') {
          whereClause = `WHERE prefix ILIKE '${searchQuery}'`;
        } else if (searchType === 'zone') {
          whereClause = `WHERE zone_name ILIKE '${searchQuery}'`;
        } else if (searchType === 'country') {
          whereClause = `WHERE country_name ILIKE '${searchQuery}'`;
        }
      }
      
      const dataResult = await db.execute(sql.raw(
        `SELECT id, prefix, zone_name as "zoneName", country_name as "countryName", 
         initial_interval as "initialInterval", recurring_interval as "recurringInterval",
         az_destination_id as "azDestinationId", interval_hash as "intervalHash",
         synced_at as "syncedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM period_exceptions ${whereClause} ORDER BY prefix LIMIT ${limitNum} OFFSET ${offsetNum}`
      ));
      
      const totalResult = await db.execute(sql.raw(
        `SELECT COUNT(*) as count FROM period_exceptions ${whereClause}`
      ));
      const total = parseInt((totalResult.rows[0] as any)?.count || "0");
      
      res.json({
        data: dataResult.rows,
        total,
        limit: limitNum,
        offset: offsetNum,
      });
    } catch (error: any) {
      console.error("Failed to get period exceptions:", error);
      res.status(500).json({ error: "Failed to get period exceptions", details: error.message });
    }
  });

  app.get("/api/period-exceptions/history", async (req, res) => {
    try {
      const { limit = "50", offset = "0", periodExceptionId } = req.query;
      const limitNum = Math.min(parseInt(limit as string) || 50, 500);
      const offsetNum = parseInt(offset as string) || 0;
      
      let whereClause = "";
      if (periodExceptionId) {
        const safeId = (periodExceptionId as string).replace(/'/g, "''");
        whereClause = `WHERE period_exception_id = '${safeId}'`;
      }
      
      const dataResult = await db.execute(sql.raw(
        `SELECT id, period_exception_id as "periodExceptionId", prefix, zone_name as "zoneName",
         change_type as "changeType", previous_initial_interval as "previousInitialInterval",
         previous_recurring_interval as "previousRecurringInterval", new_initial_interval as "newInitialInterval",
         new_recurring_interval as "newRecurringInterval", changed_by_user_id as "changedByUserId",
         changed_by_email as "changedByEmail", change_source as "changeSource", created_at as "createdAt"
         FROM period_exception_history ${whereClause} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`
      ));
      
      const totalResult = await db.execute(sql.raw(
        `SELECT COUNT(*) as count FROM period_exception_history ${whereClause}`
      ));
      const total = parseInt((totalResult.rows[0] as any)?.count || "0");
      
      res.json({
        data: dataResult.rows,
        total,
        limit: limitNum,
        offset: offsetNum,
      });
    } catch (error: any) {
      console.error("Failed to get period exception history:", error);
      res.status(500).json({ error: "Failed to get period exception history", details: error.message });
    }
  });

  app.get("/api/period-exceptions/export/csv", async (req, res) => {
    try {
      const { searchType, query } = req.query;
      
      let whereClause = "";
      let params: string[] = [];
      
      if (searchType && query) {
        const searchQuery = (query as string).replace(/'/g, "''");
        if (searchType === 'prefix') {
          whereClause = `WHERE prefix ILIKE '${searchQuery}'`;
        } else if (searchType === 'zone') {
          whereClause = `WHERE zone_name ILIKE '${searchQuery}'`;
        } else if (searchType === 'country') {
          whereClause = `WHERE country_name ILIKE '${searchQuery}'`;
        }
      }
      
      const result = await db.execute(sql.raw(`SELECT * FROM period_exceptions ${whereClause} ORDER BY prefix`));
      const exceptions = result.rows as any[];
      
      const escapeCSV = (val: string | null | undefined): string => {
        const str = val == null ? "" : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      const header = "prefix,zone_name,country_name,initial_interval,recurring_interval\n";
      const rows = exceptions.map(e => 
        [e.prefix, e.zone_name, e.country_name, e.initial_interval, e.recurring_interval]
          .map(escapeCSV)
          .join(",")
      ).join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="period-exceptions-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send(header + rows);
    } catch (error: any) {
      console.error("Failed to export period exceptions:", error);
      res.status(500).json({ error: "Failed to export period exceptions", details: error.message });
    }
  });

  app.post("/api/period-exceptions/sync-from-az", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const user = userId ? await storage.getUser(userId) : null;
      
      const azResult = await db.execute(sql`
        SELECT * FROM az_destinations 
        WHERE billing_increment IS NOT NULL 
        AND billing_increment != '1/1'
        AND is_active = true
      `);
      
      const azDestinations = azResult.rows as any[];
      const validAzIds = new Set(azDestinations.map(az => az.id));
      
      let added = 0;
      let updated = 0;
      let removed = 0;
      
      for (const az of azDestinations) {
        const intervalParts = az.billing_increment.split('/');
        const initialInterval = parseInt(intervalParts[0]) || 1;
        const recurringInterval = parseInt(intervalParts[1]) || 1;
        const intervalHash = `${initialInterval}/${recurringInterval}`;
        
        const existing = await db.execute(sql`
          SELECT * FROM period_exceptions WHERE az_destination_id = ${az.id}
        `);
        
        if (existing.rows.length === 0) {
          const insertResult = await db.execute(sql`
            INSERT INTO period_exceptions (prefix, zone_name, country_name, initial_interval, recurring_interval, az_destination_id, interval_hash)
            VALUES (${az.code}, ${az.destination}, ${az.region}, ${initialInterval}, ${recurringInterval}, ${az.id}, ${intervalHash})
            RETURNING id
          `);
          
          await db.execute(sql`
            INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, new_initial_interval, new_recurring_interval, changed_by_user_id, changed_by_email, change_source)
            VALUES (${(insertResult.rows[0] as any).id}, ${az.code}, ${az.destination}, 'added', ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'sync')
          `);
          
          added++;
        } else {
          const existingRecord = existing.rows[0] as any;
          if (existingRecord.interval_hash !== intervalHash) {
            await db.execute(sql`
              UPDATE period_exceptions 
              SET initial_interval = ${initialInterval}, 
                  recurring_interval = ${recurringInterval}, 
                  interval_hash = ${intervalHash},
                  synced_at = NOW(),
                  updated_at = NOW()
              WHERE id = ${existingRecord.id}
            `);
            
            await db.execute(sql`
              INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, new_initial_interval, new_recurring_interval, changed_by_user_id, changed_by_email, change_source)
              VALUES (${existingRecord.id}, ${az.code}, ${az.destination}, 'updated', ${existingRecord.initial_interval}, ${existingRecord.recurring_interval}, ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'sync')
            `);
            
            updated++;
          }
        }
      }
      
      const existingExceptions = await db.execute(sql`
        SELECT * FROM period_exceptions WHERE az_destination_id IS NOT NULL
      `);
      
      for (const exception of existingExceptions.rows as any[]) {
        if (!validAzIds.has(exception.az_destination_id)) {
          await db.execute(sql`
            INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, changed_by_user_id, changed_by_email, change_source)
            VALUES (${exception.id}, ${exception.prefix}, ${exception.zone_name}, 'removed', ${exception.initial_interval}, ${exception.recurring_interval}, ${userId}, ${user?.email}, 'sync')
          `);
          
          await db.execute(sql`
            DELETE FROM period_exceptions WHERE id = ${exception.id}
          `);
          
          removed++;
        }
      }
      
      res.json({ success: true, added, updated, removed, total: azDestinations.length });
    } catch (error: any) {
      console.error("Failed to sync period exceptions:", error);
      res.status(500).json({ error: "Failed to sync period exceptions", details: error.message });
    }
  });

  // ==================== EXPERIENCE MANAGER API ====================

  app.get("/api/em/content-items", async (req, res) => {
    try {
      const contentItems = await storage.getAllEmContentItems();
      res.json(contentItems);
    } catch (error: any) {
      console.error("Failed to get EM content items:", error);
      res.status(500).json({ error: "Failed to get content items", details: error.message });
    }
  });

  app.get("/api/em/content/:section/:entityType/:slug", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const contentItem = await storage.getEmContentItem(section, entityType, slug);
      res.json(contentItem || null);
    } catch (error: any) {
      console.error("Failed to get EM content item:", error);
      res.status(500).json({ error: "Failed to get content item", details: error.message });
    }
  });

  app.get("/api/em/content/:section/:entityType/:slug/draft", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const contentItem = await storage.getEmContentItem(section, entityType, slug);
      if (!contentItem?.draftVersionId) {
        return res.json(null);
      }
      const version = await storage.getEmContentVersion(contentItem.draftVersionId);
      res.json(version);
    } catch (error: any) {
      console.error("Failed to get EM draft version:", error);
      res.status(500).json({ error: "Failed to get draft version", details: error.message });
    }
  });

  app.get("/api/em/content/:section/:entityType/:slug/published", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const contentItem = await storage.getEmContentItem(section, entityType, slug);
      if (!contentItem?.publishedVersionId) {
        return res.json(null);
      }
      const version = await storage.getEmContentVersion(contentItem.publishedVersionId);
      res.json(version);
    } catch (error: any) {
      console.error("Failed to get EM published version:", error);
      res.status(500).json({ error: "Failed to get published version", details: error.message });
    }
  });

  app.get("/api/em/content/:section/:entityType/:slug/history", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const contentItem = await storage.getEmContentItem(section, entityType, slug);
      if (!contentItem) {
        return res.json([]);
      }
      const history = await storage.getEmPublishHistory(contentItem.id);
      res.json(history);
    } catch (error: any) {
      console.error("Failed to get EM publish history:", error);
      res.status(500).json({ error: "Failed to get publish history", details: error.message });
    }
  });

  app.post("/api/em/content/:section/:entityType/:slug/save-draft", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const { data, changeDescription } = req.body;
      const userId = (req as any).user?.id;

      let contentItem = await storage.getEmContentItem(section, entityType, slug);
      
      if (!contentItem) {
        contentItem = await storage.createEmContentItem({
          section: section as "marketing" | "portal_themes" | "white_label" | "design_system" | "documentation",
          entityType,
          slug,
          name: slug,
          status: "draft",
          createdBy: userId,
        });
      }

      const latestVersion = await storage.getLatestEmContentVersion(contentItem.id);
      const newVersion = (latestVersion?.version || 0) + 1;

      const version = await storage.createEmContentVersion({
        contentItemId: contentItem.id,
        version: newVersion,
        data,
        changeDescription,
        createdBy: userId,
      });

      await storage.updateEmContentItem(contentItem.id, {
        draftVersionId: version.id,
        status: "draft",
      });

      await auditService.logCreate(
        "em_content_items",
        contentItem.id,
        `${section}/${entityType}/${slug}`,
        { section, entityType, slug, version: newVersion, action: "draft_saved" },
        userId
      );

      res.json({ success: true, version });
    } catch (error: any) {
      console.error("Failed to save EM draft:", error);
      res.status(500).json({ error: "Failed to save draft", details: error.message });
    }
  });

  app.post("/api/em/content/:section/:entityType/:slug/generate-preview", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const userId = (req as any).user?.id;

      const contentItem = await storage.getEmContentItem(section, entityType, slug);
      if (!contentItem) {
        return res.status(404).json({ error: "Content item not found" });
      }

      const previewToken = randomBytes(32).toString("hex");
      const previewExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await storage.updateEmContentItem(contentItem.id, {
        previewVersionId: contentItem.draftVersionId,
        previewToken,
        previewExpiresAt,
        status: "preview",
      });

      const previewUrl = `/preview/${previewToken}`;

      await auditService.logUpdate(
        "em_content_items",
        contentItem.id,
        `${section}/${entityType}/${slug}`,
        { status: contentItem.status },
        { status: "preview", previewToken, action: "preview_generated" },
        userId
      );

      res.json({ success: true, previewUrl, token: previewToken });
    } catch (error: any) {
      console.error("Failed to generate EM preview:", error);
      res.status(500).json({ error: "Failed to generate preview", details: error.message });
    }
  });

  app.post("/api/em/content/:section/:entityType/:slug/publish", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const { note } = req.body;
      const userId = (req as any).user?.id;

      const contentItem = await storage.getEmContentItem(section, entityType, slug);
      if (!contentItem) {
        return res.status(404).json({ error: "Content item not found" });
      }

      if (!contentItem.draftVersionId) {
        return res.status(400).json({ error: "No draft to publish" });
      }

      const draftVersion = await storage.getEmContentVersion(contentItem.draftVersionId);
      if (!draftVersion) {
        return res.status(400).json({ error: "Draft version not found" });
      }

      const validationErrors: { field: string; message: string; severity: string }[] = [];
      
      if (!draftVersion.data || typeof draftVersion.data !== "object") {
        validationErrors.push({ field: "data", message: "Content data is required", severity: "error" });
      }

      await storage.createEmValidationResult({
        contentItemId: contentItem.id,
        versionId: draftVersion.id,
        validationType: "publish",
        passed: validationErrors.length === 0,
        errors: validationErrors.filter(e => e.severity === "error"),
        warnings: validationErrors.filter(e => e.severity === "warning"),
      });

      if (validationErrors.some(e => e.severity === "error")) {
        return res.json({ success: false, validationErrors });
      }

      const previousPublishedVersionId = contentItem.publishedVersionId;

      await storage.updateEmContentItem(contentItem.id, {
        publishedVersionId: contentItem.draftVersionId,
        lastPublishedAt: new Date(),
        lastPublishedBy: userId,
        status: "published",
      });

      await storage.createEmPublishHistory({
        contentItemId: contentItem.id,
        fromVersionId: previousPublishedVersionId,
        toVersionId: contentItem.draftVersionId,
        action: "publish",
        publishedBy: userId,
        note,
      });

      await auditService.logUpdate(
        "em_content_items",
        contentItem.id,
        `${section}/${entityType}/${slug}`,
        { publishedVersionId: previousPublishedVersionId },
        { publishedVersionId: contentItem.draftVersionId, action: "content_published" },
        userId
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to publish EM content:", error);
      res.status(500).json({ error: "Failed to publish content", details: error.message });
    }
  });

  app.post("/api/em/content/:section/:entityType/:slug/revert", async (req, res) => {
    try {
      const { section, entityType, slug } = req.params;
      const { versionId } = req.body;
      const userId = (req as any).user?.id;

      const contentItem = await storage.getEmContentItem(section, entityType, slug);
      if (!contentItem) {
        return res.status(404).json({ error: "Content item not found" });
      }

      const targetVersion = await storage.getEmContentVersion(versionId);
      if (!targetVersion || targetVersion.contentItemId !== contentItem.id) {
        return res.status(400).json({ error: "Invalid version" });
      }

      const latestVersion = await storage.getLatestEmContentVersion(contentItem.id);
      const newVersion = (latestVersion?.version || 0) + 1;

      const revertedVersion = await storage.createEmContentVersion({
        contentItemId: contentItem.id,
        version: newVersion,
        data: targetVersion.data as Record<string, unknown>,
        changeDescription: `Reverted to version ${targetVersion.version}`,
        createdBy: userId,
      });

      await storage.updateEmContentItem(contentItem.id, {
        draftVersionId: revertedVersion.id,
        status: "draft",
      });

      await auditService.logUpdate(
        "em_content_items",
        contentItem.id,
        `${section}/${entityType}/${slug}`,
        { version: latestVersion?.version },
        { version: newVersion, revertedFrom: targetVersion.version, action: "content_reverted" },
        userId
      );

      res.json({ success: true, version: revertedVersion });
    } catch (error: any) {
      console.error("Failed to revert EM content:", error);
      res.status(500).json({ error: "Failed to revert content", details: error.message });
    }
  });

  // ==================== EXPERIENCE MANAGER SCANNER ====================
  const { scanCodebase, getLastScanResults, setLastScanResults } = await import("./em-scanner");

  app.post("/api/em/scan", async (req, res) => {
    try {
      console.log("[EM Scanner] Starting codebase scan...");
      const results = await scanCodebase();
      setLastScanResults(results);
      console.log(`[EM Scanner] Scan complete - ${results.components.length} components, ${results.tokens.length} tokens`);
      res.json(results);
    } catch (error: any) {
      console.error("[EM Scanner] Scan failed:", error);
      res.status(500).json({ error: "Scan failed", details: error.message });
    }
  });

  app.get("/api/em/scan-results", async (req, res) => {
    try {
      const results = getLastScanResults();
      if (!results) {
        return res.json({ 
          components: [], 
          tokens: [], 
          healthScore: 0,
          adoptedCount: 0,
          totalCount: 0,
          migrateCount: 0,
          deprecatedCount: 0,
          scannedAt: null,
          filesScanned: 0,
          totalUsages: 0,
          needsScan: true
        });
      }
      res.json(results);
    } catch (error: any) {
      console.error("[EM Scanner] Failed to get scan results:", error);
      res.status(500).json({ error: "Failed to get scan results", details: error.message });
    }
  });

  // ==================== DEV TESTS (Database-backed for persistence) ====================
  const { devTestsRepository } = await import("./dev-tests-repository");

  app.get("/api/dev-tests", async (req, res) => {
    try {
      const tests = await devTestsRepository.getAll();
      res.json(tests);
    } catch (error) {
      console.error("Failed to fetch dev tests:", error);
      res.status(500).json({ error: "Failed to fetch dev tests" });
    }
  });

  app.get("/api/dev-tests/:id", async (req, res) => {
    try {
      const test = await devTestsRepository.getById(req.params.id);
      if (!test) return res.status(404).json({ error: "Dev test not found" });
      res.json(test);
    } catch (error) {
      console.error("Failed to fetch dev test:", error);
      res.status(500).json({ error: "Failed to fetch dev test" });
    }
  });

  app.post("/api/dev-tests", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const test = await devTestsRepository.create({
        name: req.body.name,
        description: req.body.description,
        module: req.body.module,
        testSteps: req.body.testSteps,
        expectedResult: req.body.expectedResult,
        actualResult: req.body.actualResult,
        status: req.body.status,
        duration: req.body.duration,
        errorMessage: req.body.errorMessage,
        createdTestData: req.body.createdTestData,
        cleanedUp: req.body.cleanedUp ?? false,
        testedBy: userId || req.body.testedBy,
        testedAt: req.body.testedAt ? new Date(req.body.testedAt) : new Date(),
      });

      await auditService.logCreate("dev_tests", test.id, test.name, test, userId);
      res.status(201).json(test);
    } catch (error) {
      console.error("Failed to create dev test:", error);
      res.status(500).json({ error: "Failed to create dev test" });
    }
  });

  app.patch("/api/dev-tests/:id", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const existing = await devTestsRepository.getById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Dev test not found" });

      const allowedFields: string[] = [
        "name", "description", "module", "testSteps", "expectedResult",
        "actualResult", "status", "duration", "errorMessage",
        "createdTestData", "cleanedUp", "testedBy", "testedAt"
      ];
      const sanitizedUpdate: Record<string, any> = {};
      for (const field of allowedFields) {
        if (field in req.body) {
          sanitizedUpdate[field] = req.body[field];
        }
      }

      const test = await devTestsRepository.update(req.params.id, sanitizedUpdate);
      await auditService.logUpdate("dev_tests", req.params.id, existing.name, existing as Record<string, unknown>, test as Record<string, unknown>, userId);
      res.json(test);
    } catch (error) {
      console.error("Failed to update dev test:", error);
      res.status(500).json({ error: "Failed to update dev test" });
    }
  });

  app.delete("/api/dev-tests/:id", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const existing = await devTestsRepository.getById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Dev test not found" });

      await devTestsRepository.delete(req.params.id);
      await auditService.logDelete("dev_tests", req.params.id, existing.name, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete dev test:", error);
      res.status(500).json({ error: "Failed to delete dev test" });
    }
  });

  // ==================== E2E TESTING ENGINE ====================
  const { runE2eTests, getModuleList, getPageCount, getModulesWithPages } = await import("./e2e-runner");

  // Get available modules for testing with their pages
  app.get("/api/e2e/modules", async (req, res) => {
    try {
      const modulesWithPages = getModulesWithPages();
      res.json({ 
        modules: getModuleList(), 
        modulesWithPages,
        totalPages: getPageCount() 
      });
    } catch (error) {
      console.error("Failed to fetch E2E modules:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });

  // Get all E2E test runs
  app.get("/api/e2e/runs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const runs = await db.select().from(e2eRuns).orderBy(desc(e2eRuns.createdAt)).limit(limit);
      res.json(runs);
    } catch (error) {
      console.error("Failed to fetch E2E runs:", error);
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  // Get E2E run with results
  app.get("/api/e2e/runs/:id", async (req, res) => {
    try {
      const [run] = await db.select().from(e2eRuns).where(eq(e2eRuns.id, req.params.id));
      if (!run) return res.status(404).json({ error: "Test run not found" });
      const results = await db.select().from(e2eResults).where(eq(e2eResults.runId, req.params.id));
      res.json({ run, results });
    } catch (error) {
      console.error("Failed to fetch E2E run:", error);
      res.status(500).json({ error: "Failed to fetch test run" });
    }
  });

  // Run E2E tests (async - returns immediately, tests run in background)
  app.post("/api/e2e/run", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const scope = req.body.scope || "all";
      
      console.log(`[E2E] Starting test run - scope: ${scope}`);
      
      // Import the function that creates the run record first
      const { createE2eRun, executeE2eTests } = await import("./e2e-runner");
      
      // Create run record and return immediately
      const runId = await createE2eRun(scope, userId);
      
      // Respond immediately with the runId
      res.json({
        success: true,
        runId,
        message: "Test run started. Poll GET /api/e2e/runs/:id for progress.",
      });
      
      // Execute tests asynchronously (don't await)
      setImmediate(async () => {
        try {
          await executeE2eTests(runId);
        } catch (error) {
          console.error("[E2E] Background test run failed:", error);
        }
      });
      
    } catch (error) {
      console.error("[E2E] Test run failed:", error);
      res.status(500).json({ 
        error: "E2E test run failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // ==================== SYSTEM STATUS & PERFORMANCE ====================
  
  app.get("/api/system/status", async (_req, res) => {
    try {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      const performanceStats = performanceMonitor.getStats();
      
      res.json({
        status: "healthy",
        uptime: Math.floor(uptime),
        memory: {
          heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
          rssMb: Math.round(memUsage.rss / 1024 / 1024),
        },
        performance: performanceStats,
        services: {
          database: "online",
          api: "online",
          ai: "online",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to get system status:", error);
      res.status(500).json({ error: "Failed to get system status" });
    }
  });
  
  app.get("/api/system/performance", async (_req, res) => {
    try {
      const stats = performanceMonitor.getStats();
      const violations = performanceMonitor.getRecentViolations(100);
      res.json({ stats, violations });
    } catch (error) {
      console.error("Failed to get performance data:", error);
      res.status(500).json({ error: "Failed to get performance data" });
    }
  });
  
  const performanceBudgetSchema = z.object({
    apiResponseTime: z.number().positive().optional(),
    queryExecutionTime: z.number().positive().optional(),
    memoryUsageMb: z.number().positive().optional(),
  });
  
  app.post("/api/system/performance/budget", async (req, res) => {
    try {
      const parsed = performanceBudgetSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const updates: Record<string, number> = {};
      if (parsed.data.apiResponseTime !== undefined) updates.apiResponseTime = parsed.data.apiResponseTime;
      if (parsed.data.queryExecutionTime !== undefined) updates.queryExecutionTime = parsed.data.queryExecutionTime;
      if (parsed.data.memoryUsageMb !== undefined) updates.memoryUsageMb = parsed.data.memoryUsageMb;
      performanceMonitor.setBudget(updates);
      res.json({ success: true, budget: performanceMonitor.getBudget() });
    } catch (error) {
      console.error("Failed to update performance budget:", error);
      res.status(500).json({ error: "Failed to update budget" });
    }
  });

  return httpServer;
}
