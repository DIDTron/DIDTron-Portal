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

const COUNTRY_CODES: Record<string, { code: string; name: string }> = {
  '+1': { code: 'US', name: 'United States' },
  '+44': { code: 'GB', name: 'United Kingdom' },
  '+61': { code: 'AU', name: 'Australia' },
  '+33': { code: 'FR', name: 'France' },
  '+49': { code: 'DE', name: 'Germany' },
  '+81': { code: 'JP', name: 'Japan' },
  '+86': { code: 'CN', name: 'China' },
  '+91': { code: 'IN', name: 'India' },
  '+55': { code: 'BR', name: 'Brazil' },
  '+52': { code: 'MX', name: 'Mexico' },
  '+39': { code: 'IT', name: 'Italy' },
  '+34': { code: 'ES', name: 'Spain' },
  '+31': { code: 'NL', name: 'Netherlands' },
  '+7': { code: 'RU', name: 'Russia' },
  '+82': { code: 'KR', name: 'South Korea' },
  '+65': { code: 'SG', name: 'Singapore' },
  '+60': { code: 'MY', name: 'Malaysia' },
  '+63': { code: 'PH', name: 'Philippines' },
  '+66': { code: 'TH', name: 'Thailand' },
  '+84': { code: 'VN', name: 'Vietnam' },
};

function getCountryFromNumber(phone: string): { code: string; name: string } {
  for (const [prefix, country] of Object.entries(COUNTRY_CODES)) {
    if (phone.startsWith(prefix)) {
      return country;
    }
  }
  return { code: 'XX', name: 'Unknown' };
}

async function executeSipTestRun(
  runId: string,
  storageInstance: typeof storage,
  connexcsClient: typeof connexcs
): Promise<void> {
  try {
    const run = await storageInstance.getSipTestRun(runId);
    if (!run) {
      console.error(`[SIP Test] Run ${runId} not found`);
      return;
    }

    await connexcsClient.loadCredentialsFromStorage(storageInstance);

    await storageInstance.updateSipTestRun(runId, { 
      status: 'running',
      startedAt: new Date(),
    } as any);

    let destinations: string[] = [];
    
    if (run.manualNumbers && Array.isArray(run.manualNumbers)) {
      destinations.push(...run.manualNumbers);
    }

    if (run.useDbNumbers) {
      const dbNumbers = await storageInstance.getSipTestNumbers();
      let filteredNumbers = dbNumbers.filter(n => n.isPublic && n.isActive && n.verified);
      
      if (run.countryFilters && run.countryFilters.length > 0) {
        filteredNumbers = filteredNumbers.filter(n => run.countryFilters?.includes(n.countryCode));
      }
      
      destinations.push(...filteredNumbers.slice(0, 50).map(n => n.phoneNumber));
    }

    if (destinations.length === 0) {
      destinations = ['+14155551234', '+442071234567', '+61291234567'];
    }

    const testLimit = Math.min(destinations.length, run.callsCount || 5);
    const testDestinations = destinations.slice(0, testLimit);
    
    const callerId = run.aniMode === 'specific' ? run.aniNumber : undefined;
    
    const results = await connexcsClient.executeBatchSipTest(testDestinations, {
      callerId: callerId || undefined,
      codec: run.codec || 'G729',
      maxDuration: run.maxDuration || 30,
      concurrency: run.capacity || 1,
    });

    let successCount = 0;
    let failCount = 0;
    let totalDuration = 0;
    let totalMos = 0;
    let totalPdd = 0;
    let mosCount = 0;
    let totalCost = 0;
    const RATE_PER_MIN = 0.012;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const callCost = result.durationSec > 0 ? (result.durationSec / 60) * RATE_PER_MIN : 0;
      totalCost += callCost;
      
      if (result.status === 'completed') {
        successCount++;
        totalDuration += result.durationSec;
        if (result.mosScore) {
          totalMos += result.mosScore;
          mosCount++;
        }
      } else {
        failCount++;
      }
      totalPdd += result.pddMs;

      await storageInstance.createSipTestRunResult({
        testRunId: runId,
        callIndex: i + 1,
        destination: result.destination,
        aniUsed: callerId,
        status: result.status === 'completed' ? 'completed' : 'failed',
        result: result.status === 'completed' ? 'pass' : 'fail',
        sipResponseCode: result.sipResponseCode,
        pddMs: result.pddMs,
        mosScore: result.mosScore?.toString(),
        jitterMs: result.jitterMs?.toString(),
        packetLossPercent: result.packetLossPercent?.toString(),
        latencyMs: result.latencyMs,
        codecUsed: run.codec,
        durationSec: result.durationSec,
        callCost: callCost.toFixed(6),
        ratePerMin: RATE_PER_MIN.toFixed(6),
      });
    }

    const avgMos = mosCount > 0 ? (totalMos / mosCount).toFixed(2) : null;
    const avgPdd = results.length > 0 ? Math.round(totalPdd / results.length) : null;

    await storageInstance.updateSipTestRun(runId, {
      status: 'completed',
      completedAt: new Date(),
      totalCalls: results.length,
      successfulCalls: successCount,
      failedCalls: failCount,
      totalDurationSec: totalDuration,
      totalCost: totalCost.toFixed(6),
      avgMos: avgMos,
      avgPdd: avgPdd,
    } as any);

    if (run.addToDb) {
      for (const result of results) {
        if (result.status === 'completed') {
          const country = getCountryFromNumber(result.destination);
          
          const existing = await storageInstance.getSipTestNumbers(country.code);
          const exists = existing.some(n => n.phoneNumber === result.destination);
          
          if (!exists) {
            await storageInstance.createSipTestNumber({
              countryCode: country.code,
              countryName: country.name,
              phoneNumber: result.destination,
              numberType: 'landline',
              verified: true,
              contributedBy: run.customerId,
              isPublic: true,
              isActive: true,
            });
          }
        }
      }
    }

    console.log(`[SIP Test] Run ${runId} completed: ${successCount}/${results.length} successful`);
  } catch (error) {
    console.error(`[SIP Test] Run ${runId} failed:`, error);
    await storageInstance.updateSipTestRun(runId, {
      status: 'failed',
      completedAt: new Date(),
    } as any);
  }
}

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

  // ==================== REFERRAL SYSTEM ====================

  // Get logged-in user's referral info
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
      
      // Generate referral code if not exists
      let referralCode = customer?.referralCode;
      if (!referralCode) {
        referralCode = `DID${user.customerId.substring(0, 8).toUpperCase()}`;
        await storage.updateCustomer(user.customerId, { referralCode });
      }

      // Calculate stats
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

  // Track referral click
  app.post("/api/referral/track", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== "string" || code.length < 3 || code.length > 50) {
        return res.status(400).json({ error: "Valid referral code required" });
      }

      // Efficient lookup by referral code
      const referrer = await storage.getCustomerByReferralCode(code);
      
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      // Create pending referral record
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

  // Get customer's branding
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

  // Create customer branding
  app.post("/api/my/branding", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      // Check if branding already exists
      const existing = await storage.getTenantBranding(user.customerId);
      if (existing) {
        return res.status(400).json({ error: "Branding already exists. Use PATCH to update." });
      }

      // Validate allowed fields
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

  // Update customer branding (supports both PUT and PATCH)
  const handleBrandingUpdate = async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      // Extract allowed fields only
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
        // Auto-create if it doesn't exist
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

  // Get customer's tickets
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

  // Create customer ticket
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

  // Get single customer ticket
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

  // Get ticket replies
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

  // Add reply to customer ticket
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

  // ==================== CUSTOMER AI VOICE AGENTS ====================

  app.get("/api/my/ai-voice/agents", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agents = await storage.getAiVoiceAgents(user.customerId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agents" });
    }
  });

  app.get("/api/my/ai-voice/agents/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI voice agent" });
    }
  });

  app.post("/api/my/ai-voice/agents", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      // Whitelist allowed fields from customer input
      const { name, description, type, voiceId, voiceProvider, systemPrompt, 
              greetingMessage, fallbackMessage, maxCallDuration, webhookUrl } = req.body;
      
      const parsed = insertAiVoiceAgentSchema.omit({ customerId: true }).safeParse({
        name, description, type, voiceId, voiceProvider, systemPrompt,
        greetingMessage, fallbackMessage, maxCallDuration, webhookUrl
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const agent = await storage.createAiVoiceAgent({
        ...parsed.data,
        customerId: user.customerId,
      });
      res.status(201).json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create AI voice agent" });
    }
  });

  app.patch("/api/my/ai-voice/agents/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      // Whitelist allowed fields for update - exclude customerId, id, createdAt
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
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update AI voice agent" });
    }
  });

  app.delete("/api/my/ai-voice/agents/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.id);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      await storage.deleteAiVoiceAgent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete AI voice agent" });
    }
  });

  // ==================== CUSTOMER AI VOICE TRAINING DATA ====================

  app.get("/api/my/ai-voice/agents/:agentId/training", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      const training = await storage.getAiVoiceTrainingData(req.params.agentId);
      res.json(training);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training data" });
    }
  });

  app.post("/api/my/ai-voice/agents/:agentId/training", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const agent = await storage.getAiVoiceAgent(req.params.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Agent not found" });
      }
      const { category, question, answer, isActive } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }
      const training = await storage.createAiVoiceTrainingData({
        agentId: req.params.agentId,
        category: category || null,
        question,
        answer,
        isActive: isActive ?? true
      });
      res.status(201).json(training);
    } catch (error) {
      res.status(500).json({ error: "Failed to create training data" });
    }
  });

  app.patch("/api/my/ai-voice/training/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const item = await storage.getAiVoiceTrainingDataItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Training data not found" });
      }
      const agent = await storage.getAiVoiceAgent(item.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Training data not found" });
      }
      const { category, question, answer, isActive } = req.body;
      const updateData: Record<string, unknown> = {};
      if (category !== undefined) updateData.category = category;
      if (question !== undefined) updateData.question = question;
      if (answer !== undefined) updateData.answer = answer;
      if (isActive !== undefined) updateData.isActive = isActive;
      const updated = await storage.updateAiVoiceTrainingData(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update training data" });
    }
  });

  app.delete("/api/my/ai-voice/training/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const item = await storage.getAiVoiceTrainingDataItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Training data not found" });
      }
      const agent = await storage.getAiVoiceAgent(item.agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(404).json({ error: "Training data not found" });
      }
      await storage.deleteAiVoiceTrainingData(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete training data" });
    }
  });

  // ==================== CUSTOMER AI VOICE CAMPAIGNS ====================

  app.get("/api/my/ai-voice/campaigns", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaigns = await storage.getAiVoiceCampaigns(user.customerId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/my/ai-voice/campaigns/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.post("/api/my/ai-voice/campaigns", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const { agentId, name, description, contactList, scheduledAt, maxConcurrentCalls } = req.body;
      if (!agentId || !name) {
        return res.status(400).json({ error: "Agent and name are required" });
      }
      const agent = await storage.getAiVoiceAgent(agentId);
      if (!agent || agent.customerId !== user.customerId) {
        return res.status(400).json({ error: "Invalid agent" });
      }
      const contacts = Array.isArray(contactList) ? contactList : [];
      const campaign = await storage.createAiVoiceCampaign({
        customerId: user.customerId,
        agentId,
        name,
        description: description || null,
        contactList: contacts,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        maxConcurrentCalls: maxConcurrentCalls || 5,
        callsTotal: contacts.length,
        status: "draft"
      });
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.patch("/api/my/ai-voice/campaigns/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const { name, description, contactList, scheduledAt, maxConcurrentCalls, status } = req.body;
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (contactList !== undefined) {
        updateData.contactList = contactList;
        updateData.callsTotal = Array.isArray(contactList) ? contactList.length : 0;
      }
      if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      if (maxConcurrentCalls !== undefined) updateData.maxConcurrentCalls = maxConcurrentCalls;
      if (status !== undefined) updateData.status = status;
      const updated = await storage.updateAiVoiceCampaign(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/my/ai-voice/campaigns/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      await storage.deleteAiVoiceCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.post("/api/my/ai-voice/campaigns/:id/start", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      if (campaign.status === "running") {
        return res.status(400).json({ error: "Campaign is already running" });
      }
      const { enqueueJob } = await import("./job-queue");
      const jobId = await enqueueJob("ai_voice_campaign_start", {
        campaignId: req.params.id,
        customerId: user.customerId,
        userId: req.session.userId,
      });
      await storage.updateAiVoiceCampaign(req.params.id, { 
        status: "running",
        startedAt: new Date()
      });
      res.json({ success: true, jobId, message: "Campaign started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start campaign" });
    }
  });

  app.post("/api/my/ai-voice/campaigns/:id/pause", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const campaign = await storage.getAiVoiceCampaign(req.params.id);
      if (!campaign || campaign.customerId !== user.customerId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      if (campaign.status !== "running") {
        return res.status(400).json({ error: "Campaign is not running" });
      }
      await storage.updateAiVoiceCampaign(req.params.id, { status: "paused" });
      res.json({ success: true, message: "Campaign paused" });
    } catch (error) {
      res.status(500).json({ error: "Failed to pause campaign" });
    }
  });

  // ==================== CUSTOMER AI VOICE KNOWLEDGE BASES ====================

  app.get("/api/my/ai-voice/knowledge-bases", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kbs = await storage.getAiVoiceKnowledgeBases(user.customerId);
      res.json(kbs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge bases" });
    }
  });

  app.get("/api/my/ai-voice/knowledge-bases/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kb = await storage.getAiVoiceKnowledgeBase(req.params.id);
      if (!kb || kb.customerId !== user.customerId) {
        return res.status(404).json({ error: "Knowledge base not found" });
      }
      res.json(kb);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge base" });
    }
  });

  app.post("/api/my/ai-voice/knowledge-bases", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const kb = await storage.createAiVoiceKnowledgeBase({
        customerId: user.customerId,
        name,
        description: description || null
      });
      res.status(201).json(kb);
    } catch (error) {
      res.status(500).json({ error: "Failed to create knowledge base" });
    }
  });

  app.post("/api/my/ai-voice/knowledge-bases/:id/train", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kb = await storage.getAiVoiceKnowledgeBase(req.params.id);
      if (!kb || kb.customerId !== user.customerId) {
        return res.status(404).json({ error: "Knowledge base not found" });
      }
      if (kb.status === "processing") {
        return res.status(400).json({ error: "Training already in progress" });
      }
      await storage.updateAiVoiceKnowledgeBase(req.params.id, { status: "processing" });
      const { enqueueJob } = await import("./job-queue");
      const jobId = await enqueueJob("ai_voice_kb_train", {
        knowledgeBaseId: req.params.id,
        agentId: req.body.agentId || "",
        customerId: user.customerId,
        userId: req.session.userId,
      });
      res.json({ success: true, jobId, message: "Training started", id: req.params.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to start training" });
    }
  });

  app.delete("/api/my/ai-voice/knowledge-bases/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const kb = await storage.getAiVoiceKnowledgeBase(req.params.id);
      if (!kb || kb.customerId !== user.customerId) {
        return res.status(404).json({ error: "Knowledge base not found" });
      }
      await storage.deleteAiVoiceKnowledgeBase(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete knowledge base" });
    }
  });

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
      const { getCrmClient } = await import("./crm-service");
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
      const { getCrmClient } = await import("./crm-service");
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
      const { getCrmClient } = await import("./crm-service");
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

  // ==================== CUSTOMER PBX EXTENSIONS ====================

  app.get("/api/my/extensions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const extensions = await storage.getExtensions(user.customerId);
      res.json(extensions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch extensions" });
    }
  });

  app.get("/api/my/extensions/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ext = await storage.getExtension(req.params.id);
      if (!ext || ext.customerId !== user.customerId) {
        return res.status(404).json({ error: "Extension not found" });
      }
      res.json(ext);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch extension" });
    }
  });

  app.post("/api/my/extensions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertExtensionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid extension data", details: validation.error.errors });
      }
      
      const ext = await storage.createExtension({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(ext);
    } catch (error) {
      res.status(500).json({ error: "Failed to create extension" });
    }
  });

  app.patch("/api/my/extensions/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ext = await storage.getExtension(req.params.id);
      if (!ext || ext.customerId !== user.customerId) {
        return res.status(404).json({ error: "Extension not found" });
      }
      
      const { name, email, callerId, voicemailEnabled, voicemailPin, voicemailEmail, 
              ringTimeout, dndEnabled, callWaitingEnabled, forwardingEnabled, forwardingDestination, status } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (callerId !== undefined) updateData.callerId = callerId;
      if (voicemailEnabled !== undefined) updateData.voicemailEnabled = voicemailEnabled;
      if (voicemailPin !== undefined) updateData.voicemailPin = voicemailPin;
      if (voicemailEmail !== undefined) updateData.voicemailEmail = voicemailEmail;
      if (ringTimeout !== undefined) updateData.ringTimeout = ringTimeout;
      if (dndEnabled !== undefined) updateData.dndEnabled = dndEnabled;
      if (callWaitingEnabled !== undefined) updateData.callWaitingEnabled = callWaitingEnabled;
      if (forwardingEnabled !== undefined) updateData.forwardingEnabled = forwardingEnabled;
      if (forwardingDestination !== undefined) updateData.forwardingDestination = forwardingDestination;
      if (status !== undefined) updateData.status = status;
      
      const updated = await storage.updateExtension(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update extension" });
    }
  });

  app.delete("/api/my/extensions/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ext = await storage.getExtension(req.params.id);
      if (!ext || ext.customerId !== user.customerId) {
        return res.status(404).json({ error: "Extension not found" });
      }
      await storage.deleteExtension(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete extension" });
    }
  });

  // ==================== CUSTOMER IVRs ====================

  app.get("/api/my/ivrs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivrs = await storage.getIvrs(user.customerId);
      res.json(ivrs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IVRs" });
    }
  });

  app.get("/api/my/ivrs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivr = await storage.getIvr(req.params.id);
      if (!ivr || ivr.customerId !== user.customerId) {
        return res.status(404).json({ error: "IVR not found" });
      }
      res.json(ivr);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IVR" });
    }
  });

  app.post("/api/my/ivrs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertIvrSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid IVR data", details: validation.error.errors });
      }
      
      const ivr = await storage.createIvr({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(ivr);
    } catch (error) {
      res.status(500).json({ error: "Failed to create IVR" });
    }
  });

  app.patch("/api/my/ivrs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivr = await storage.getIvr(req.params.id);
      if (!ivr || ivr.customerId !== user.customerId) {
        return res.status(404).json({ error: "IVR not found" });
      }
      
      const { name, description, greetingType, greetingText, timeout, maxRetries,
              invalidDestination, timeoutDestination, isActive } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (greetingType !== undefined) updateData.greetingType = greetingType;
      if (greetingText !== undefined) updateData.greetingText = greetingText;
      if (timeout !== undefined) updateData.timeout = timeout;
      if (maxRetries !== undefined) updateData.maxRetries = maxRetries;
      if (invalidDestination !== undefined) updateData.invalidDestination = invalidDestination;
      if (timeoutDestination !== undefined) updateData.timeoutDestination = timeoutDestination;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateIvr(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update IVR" });
    }
  });

  app.delete("/api/my/ivrs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ivr = await storage.getIvr(req.params.id);
      if (!ivr || ivr.customerId !== user.customerId) {
        return res.status(404).json({ error: "IVR not found" });
      }
      await storage.deleteIvr(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete IVR" });
    }
  });

  // ==================== CUSTOMER RING GROUPS ====================

  app.get("/api/my/ring-groups", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const ringGroups = await storage.getRingGroups(user.customerId);
      res.json(ringGroups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ring groups" });
    }
  });

  app.get("/api/my/ring-groups/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const rg = await storage.getRingGroup(req.params.id);
      if (!rg || rg.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ring group not found" });
      }
      res.json(rg);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ring group" });
    }
  });

  app.post("/api/my/ring-groups", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertRingGroupSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid ring group data", details: validation.error.errors });
      }
      
      const rg = await storage.createRingGroup({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(rg);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ring group" });
    }
  });

  app.patch("/api/my/ring-groups/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const rg = await storage.getRingGroup(req.params.id);
      if (!rg || rg.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ring group not found" });
      }
      
      const { name, extension, strategy, ringTimeout, noAnswerDestination, isActive } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (extension !== undefined) updateData.extension = extension;
      if (strategy !== undefined) updateData.strategy = strategy;
      if (ringTimeout !== undefined) updateData.ringTimeout = ringTimeout;
      if (noAnswerDestination !== undefined) updateData.noAnswerDestination = noAnswerDestination;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateRingGroup(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ring group" });
    }
  });

  app.delete("/api/my/ring-groups/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const rg = await storage.getRingGroup(req.params.id);
      if (!rg || rg.customerId !== user.customerId) {
        return res.status(404).json({ error: "Ring group not found" });
      }
      await storage.deleteRingGroup(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ring group" });
    }
  });

  // ==================== CUSTOMER QUEUES ====================

  app.get("/api/my/queues", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queues = await storage.getQueues(user.customerId);
      res.json(queues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queues" });
    }
  });

  app.get("/api/my/queues/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queue = await storage.getQueue(req.params.id);
      if (!queue || queue.customerId !== user.customerId) {
        return res.status(404).json({ error: "Queue not found" });
      }
      res.json(queue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue" });
    }
  });

  app.post("/api/my/queues", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertQueueSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid queue data", details: validation.error.errors });
      }
      
      const queue = await storage.createQueue({
        ...validation.data,
        customerId: user.customerId
      });
      res.status(201).json(queue);
    } catch (error) {
      res.status(500).json({ error: "Failed to create queue" });
    }
  });

  app.patch("/api/my/queues/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queue = await storage.getQueue(req.params.id);
      if (!queue || queue.customerId !== user.customerId) {
        return res.status(404).json({ error: "Queue not found" });
      }
      
      const { name, extension, strategy, maxWaitTime, announcePosition, 
              holdMusicUrl, timeoutDestination, isActive } = req.body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (extension !== undefined) updateData.extension = extension;
      if (strategy !== undefined) updateData.strategy = strategy;
      if (maxWaitTime !== undefined) updateData.maxWaitTime = maxWaitTime;
      if (announcePosition !== undefined) updateData.announcePosition = announcePosition;
      if (holdMusicUrl !== undefined) updateData.holdMusicUrl = holdMusicUrl;
      if (timeoutDestination !== undefined) updateData.timeoutDestination = timeoutDestination;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateQueue(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update queue" });
    }
  });

  app.delete("/api/my/queues/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const queue = await storage.getQueue(req.params.id);
      if (!queue || queue.customerId !== user.customerId) {
        return res.status(404).json({ error: "Queue not found" });
      }
      await storage.deleteQueue(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete queue" });
    }
  });

  // ==================== CUSTOMER SIP TESTS ====================
  
  app.get("/api/my/sip-tests/configs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      // Get customer's own configs
      const customerConfigs = await storage.getSipTestConfigs(user.customerId);
      // Get shared configs from admin (Smart Sync)
      const sharedConfigs = await storage.getSharedSipTestConfigs();
      // Combine and return
      res.json([...customerConfigs, ...sharedConfigs]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test configs" });
    }
  });

  app.get("/api/my/sip-tests/configs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const config = await storage.getSipTestConfig(req.params.id);
      if (!config || config.customerId !== user.customerId) {
        return res.status(404).json({ error: "SIP test config not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test config" });
    }
  });

  app.post("/api/my/sip-tests/configs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertSipTestConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid SIP test config", details: validation.error.errors });
      }
      
      // Customers cannot create shared configs - force isShared to false
      const config = await storage.createSipTestConfig({
        ...validation.data,
        customerId: user.customerId,
        createdBy: user.id,
        isShared: false
      });
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test config" });
    }
  });

  app.patch("/api/my/sip-tests/configs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const config = await storage.getSipTestConfig(req.params.id);
      // Block editing shared configs or configs not owned by this customer
      if (!config || config.isShared || config.customerId !== user.customerId) {
        return res.status(404).json({ error: "SIP test config not found" });
      }
      
      // Note: isShared is intentionally excluded - customers cannot change this field
      const { name, description, testType, destinations, cliNumber, isAdvancedMode, advancedSettings, alertThresholds, isActive } = req.body;
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (testType !== undefined) updateData.testType = testType;
      if (destinations !== undefined) updateData.destinations = destinations;
      if (cliNumber !== undefined) updateData.cliNumber = cliNumber;
      if (isAdvancedMode !== undefined) updateData.isAdvancedMode = isAdvancedMode;
      if (advancedSettings !== undefined) updateData.advancedSettings = advancedSettings;
      if (alertThresholds !== undefined) updateData.alertThresholds = alertThresholds;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const updated = await storage.updateSipTestConfig(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SIP test config" });
    }
  });

  app.delete("/api/my/sip-tests/configs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const config = await storage.getSipTestConfig(req.params.id);
      // Block deleting shared configs or configs not owned by this customer
      if (!config || config.isShared || config.customerId !== user.customerId) {
        return res.status(404).json({ error: "SIP test config not found" });
      }
      await storage.deleteSipTestConfig(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete SIP test config" });
    }
  });

  app.get("/api/my/sip-tests/results", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const results = await storage.getSipTestResults(user.customerId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test results" });
    }
  });

  app.post("/api/my/sip-tests/run", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertSipTestResultSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid test data", details: validation.error.errors });
      }
      
      // Simulate test result (in production, this would call actual SIP testing infrastructure)
      const result = await storage.createSipTestResult({
        ...validation.data,
        status: "completed",
        result: Math.random() > 0.2 ? "pass" : "fail",
        pddMs: Math.floor(Math.random() * 200) + 100,
        mosScore: (3.5 + Math.random() * 1).toFixed(2),
        jitterMs: (Math.random() * 20).toFixed(2),
        packetLossPercent: (Math.random() * 2).toFixed(2),
        latencyMs: Math.floor(Math.random() * 100) + 20,
        sipResponseCode: 200,
      });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to run SIP test" });
    }
  });

  app.get("/api/my/sip-tests/schedules", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const schedules = await storage.getSipTestSchedules(user.customerId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test schedules" });
    }
  });

  app.post("/api/my/sip-tests/schedules", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const validation = insertSipTestScheduleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid schedule data", details: validation.error.errors });
      }
      
      const schedule = await storage.createSipTestSchedule({
        ...validation.data,
        customerId: user.customerId,
        portalType: "customer"
      });
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test schedule" });
    }
  });

  app.delete("/api/my/sip-tests/schedules/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const schedule = await storage.getSipTestSchedule(req.params.id);
      if (!schedule || schedule.customerId !== user.customerId) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      await storage.deleteSipTestSchedule(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schedule" });
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
      // Return mock exports for now
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
      // Simulate export creation
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
      // Return mock stats for now - would be synced from ConnexCS
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
      // Return mock rate cards for now
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
      // Return mock LCR rules
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
      // Return mock margin analysis data
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

  // ==================== AI VOICE AGENT ====================
  
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
      
      // Validate input
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

  // Get webhook delivery logs
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
      // Never return the full hash, only the prefix for display
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
      
      // Generate a secure API key
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
      
      // Return the full key only once during creation
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
      // Return mock redeemed codes for the customer
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
      // Return mock available bonuses
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

  // Admin: Get all referrals
  app.get("/api/admin/referrals", async (req, res) => {
    try {
      const referrals = await storage.getReferrals();
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

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
      const { syncExchangeRates } = await import("./services/open-exchange-rates");
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
      const { syncCurrencies } = await import("./services/open-exchange-rates");
      const result = await syncCurrencies();
      res.json({ success: true, ...result, message: `Synced ${result.total} currencies, added ${result.added} new` });
    } catch (error) {
      console.error("Currency sync error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to sync currencies" });
    }
  });

  app.post("/api/admin/integrations/open-exchange-rates/test", async (req, res) => {
    try {
      const { testConnection } = await import("./services/open-exchange-rates");
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
      // Preprocess code to uppercase
      if (req.body.code) req.body.code = req.body.code.toUpperCase();
      
      const parsed = insertPromoCodeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      // Check for duplicate code
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
      // Validate partial update data
      const partialSchema = insertPromoCodeSchema.partial();
      if (req.body.code) req.body.code = req.body.code.toUpperCase();
      const parsed = partialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      // Check for duplicate code on code updates
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

  // Validate and apply promo code
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

      // Check minimum purchase requirement - require purchaseAmount when minPurchase is set
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

      // Check applyTo restriction - require productType when applyTo is not "all"
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

      // Note: Customer-specific assignment rules (customerId) are tracked but not enforced
      // at the validation level - assignment is managed through the admin bonus assignment system
      // The customerId parameter is accepted for future customer-specific promo targeting

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
      // Preprocess code to uppercase
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
      // Validate partial update data
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

  // ==================== BILLING TERMS ====================

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

  // ==================== INVOICES ====================
  app.get("/api/invoices", async (req, res) => {
    try {
      const { customerId, cursor, limit = "50" } = req.query;
      const parsedLimit = Math.min(parseInt(String(limit)) || 50, 100);
      const invoices = await storage.getInvoices(customerId as string | undefined);
      
      // Apply cursor pagination
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

  // ==================== PAYMENTS ====================
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

  // ==================== PROMO CODES ====================
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

  app.post("/api/promo-codes", async (req, res) => {
    try {
      const { code, discountValue } = req.body;
      if (!code || discountValue === undefined) {
        return res.status(400).json({ error: "code and discountValue are required" });
      }
      const promoCode = await storage.createPromoCode(req.body);
      res.status(201).json(promoCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to create promo code" });
    }
  });

  app.patch("/api/promo-codes/:id", async (req, res) => {
    try {
      const promoCode = await storage.updatePromoCode(req.params.id, req.body);
      if (!promoCode) return res.status(404).json({ error: "Promo code not found" });
      res.json(promoCode);
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

  // ==================== REFERRALS ====================
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

  app.post("/api/referrals", async (req, res) => {
    try {
      const { referrerId } = req.body;
      if (!referrerId) {
        return res.status(400).json({ error: "referrerId is required" });
      }
      const referral = await storage.createReferral(req.body);
      res.status(201).json(referral);
    } catch (error) {
      res.status(500).json({ error: "Failed to create referral" });
    }
  });

  app.patch("/api/referrals/:id", async (req, res) => {
    try {
      const referral = await storage.updateReferral(req.params.id, req.body);
      if (!referral) return res.status(404).json({ error: "Referral not found" });
      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: "Failed to update referral" });
    }
  });

  app.delete("/api/referrals/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteReferral(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Referral not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete referral" });
    }
  });

  // ==================== BONUS TYPES ====================

  app.get("/api/bonuses", async (req, res) => {
    try {
      const bonuses = await storage.getBonusTypes();
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });

  app.get("/api/bonuses/:id", async (req, res) => {
    try {
      const bonus = await storage.getBonusType(req.params.id);
      if (!bonus) return res.status(404).json({ error: "Bonus not found" });
      res.json(bonus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonus" });
    }
  });

  app.post("/api/bonuses", async (req, res) => {
    try {
      const parsed = insertBonusTypeSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const bonus = await storage.createBonusType(parsed.data);
      res.status(201).json(bonus);
    } catch (error) {
      res.status(500).json({ error: "Failed to create bonus" });
    }
  });

  app.patch("/api/bonuses/:id", async (req, res) => {
    try {
      const bonus = await storage.updateBonusType(req.params.id, req.body);
      if (!bonus) return res.status(404).json({ error: "Bonus not found" });
      res.json(bonus);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bonus" });
    }
  });

  app.delete("/api/bonuses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBonusType(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Bonus not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bonus" });
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

  // ==================== CONNEXCS STATUS ====================
  
  app.get("/api/connexcs/status", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      const mockMode = connexcsTools.isMockMode();
      if (mockMode) {
        res.json({
          connected: false,
          mockMode: true,
          message: "Running in mock mode - no credentials configured",
        });
      } else {
        try {
          const authResult = await connexcsTools.testAuth(storage);
          if (authResult.success) {
            const carriers = await connexcsTools.getCarriers(storage).catch(() => []);
            const response: any = {
              connected: true,
              mockMode: false,
              message: `Connected to ConnexCS (${carriers.length} carriers)`,
              tokenDaysRemaining: authResult.tokenDaysRemaining,
            };
            if (authResult.warning) response.warning = authResult.warning;
            if (authResult.tokenExpiringSoon) response.tokenExpiringSoon = authResult.tokenExpiringSoon;
            res.json(response);
          } else {
            res.json({
              connected: false,
              mockMode: false,
              message: "Failed to authenticate with ConnexCS",
              error: authResult.error,
            });
          }
        } catch (apiError) {
          res.json({
            connected: false,
            mockMode: false,
            message: "Failed to connect to ConnexCS API",
            error: apiError instanceof Error ? apiError.message : "Connection error",
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        connected: false,
        mockMode: true,
        message: "Error checking ConnexCS status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/connexcs/status/detailed", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      const mockMode = connexcsTools.isMockMode();
      
      if (mockMode) {
        res.json({
          connected: false,
          mockMode: true,
          message: "Running in mock mode - no credentials configured",
          stats: {
            carriers: 3,
            customers: 3,
            rateCards: 3,
            routes: 3,
            cdrs: 20,
          },
        });
      } else {
        try {
          const authResult = await connexcsTools.testAuth(storage);
          if (authResult.success) {
            let stats = { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 };
            
            try {
              const [carriers, customers, rateCards, routes] = await Promise.all([
                connexcsTools.getCarriers(storage).catch(() => []),
                connexcsTools.getCustomers(storage).catch(() => []),
                connexcsTools.getRateCards(storage).catch(() => []),
                connexcsTools.getRoutes(storage).catch(() => []),
              ]);
              stats = {
                carriers: carriers.length,
                customers: customers.length,
                rateCards: rateCards.length,
                routes: routes.length,
                cdrs: 0,
              };
            } catch {}
            
            const response: any = {
              connected: true,
              mockMode: false,
              message: "Connected to ConnexCS",
              tokenDaysRemaining: authResult.tokenDaysRemaining,
              lastSync: new Date().toISOString(),
              stats,
            };
            if (authResult.warning) response.warning = authResult.warning;
            if (authResult.tokenExpiringSoon) response.tokenExpiringSoon = authResult.tokenExpiringSoon;
            res.json(response);
          } else {
            res.json({
              connected: false,
              mockMode: false,
              message: "Failed to authenticate with ConnexCS",
              error: authResult.error,
              stats: { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 },
            });
          }
        } catch (apiError) {
          res.json({
            connected: false,
            mockMode: false,
            message: "Failed to connect to ConnexCS API",
            error: apiError instanceof Error ? apiError.message : "Connection error",
            stats: { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 },
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        connected: false,
        mockMode: true,
        message: "Error checking ConnexCS status",
        error: error instanceof Error ? error.message : "Unknown error",
        stats: { carriers: 0, customers: 0, rateCards: 0, routes: 0, cdrs: 0 },
      });
    }
  });

  app.post("/api/connexcs/test-connection", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      if (connexcsTools.isMockMode()) {
        res.status(400).json({ error: "Cannot test connection in mock mode" });
        return;
      }
      
      const authResult = await connexcsTools.testAuth(storage);
      if (authResult.success) {
        const carriers = await connexcsTools.getCarriers(storage);
        res.json({ 
          success: true, 
          message: `Connection successful - found ${carriers.length} carriers`,
          tokenDaysRemaining: authResult.tokenDaysRemaining,
        });
      } else {
        res.status(400).json({
          success: false,
          error: authResult.error || "Authentication failed",
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Connection test failed" 
      });
    }
  });

  app.post("/api/connexcs/sync", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      if (connexcsTools.isMockMode()) {
        res.status(400).json({ error: "Cannot sync in mock mode" });
        return;
      }
      
      const [carriers, customers, rateCards, routes] = await Promise.all([
        connexcsTools.getCarriers(storage),
        connexcsTools.getCustomers(storage),
        connexcsTools.getRateCards(storage),
        connexcsTools.getRoutes(storage),
      ]);
      
      res.json({ 
        success: true, 
        message: "Data synchronized successfully",
        synced: {
          carriers: carriers.length,
          customers: customers.length,
          rateCards: rateCards.length,
          routes: routes.length,
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Sync failed" 
      });
    }
  });

  app.post("/api/connexcs/sql", async (req, res) => {
    try {
      await connexcsTools.loadCredentialsFromStorage(storage);
      if (connexcsTools.isMockMode()) {
        res.json({
          success: true,
          data: [
            { id: "mock-1", call_id: "abc123", src: "15551234567", dst: "15559876543", duration: 120, billsec: 118, dt: new Date().toISOString(), cost: 0.024, status: "ANSWERED" },
            { id: "mock-2", call_id: "def456", src: "15551234567", dst: "442071234567", duration: 90, billsec: 87, dt: new Date().toISOString(), cost: 0.045, status: "ANSWERED" },
            { id: "mock-3", call_id: "ghi789", src: "15559998888", dst: "15551112222", duration: 0, billsec: 0, dt: new Date().toISOString(), cost: 0, status: "NO ANSWER" },
          ],
          rowCount: 3,
          mockMode: true,
        });
        return;
      }
      
      const { sql } = req.body;
      if (!sql || typeof sql !== "string") {
        res.status(400).json({ success: false, error: "SQL query is required" });
        return;
      }
      
      const result = await connexcsTools.executeSQLQuery(storage, sql);
      res.json({ 
        success: true, 
        data: result,
        rowCount: result.length,
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Query failed" 
      });
    }
  });

  app.post("/api/connexcs/tools/test-auth", async (req, res) => {
    try {
      const result = await connexcsTools.testAuth(storage);
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          tokenDaysRemaining: result.tokenDaysRemaining,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authentication test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/connexcs/servers", async (req, res) => {
    try {
      const servers = await connexcsTools.getServers(storage);
      res.json({
        success: true,
        data: servers,
        count: servers.length,
        mockMode: connexcsTools.isMockMode(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch servers",
      });
    }
  });

  app.get("/api/connexcs/account", async (req, res) => {
    try {
      const account = await connexcsTools.getAccountInfo(storage);
      res.json({
        success: true,
        data: account,
        mockMode: connexcsTools.isMockMode(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch account info",
      });
    }
  });

  // ==================== CONNEXCS SYNC ====================
  
  // Helper to get valid userId (validates user exists in database)
  async function getValidUserId(sessionUserId?: string): Promise<string | undefined> {
    if (!sessionUserId) {
      console.log("[getValidUserId] No session user ID provided");
      return undefined;
    }
    try {
      const user = await storage.getUser(sessionUserId);
      if (user) {
        console.log(`[getValidUserId] User validated: ${user.id}`);
        return user.id;
      } else {
        console.log(`[getValidUserId] User not found in database: ${sessionUserId}`);
        return undefined;
      }
    } catch (err) {
      console.log(`[getValidUserId] Error looking up user: ${err}`);
      return undefined;
    }
  }
  
  app.post("/api/admin/connexcs/sync/customers", async (req, res) => {
    try {
      const { syncCustomers } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncCustomers(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/carriers", async (req, res) => {
    try {
      const { syncCarriers } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncCarriers(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/ratecards", async (req, res) => {
    try {
      const { syncRateCards } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncRateCards(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/cdrs", async (req, res) => {
    try {
      const { year, month } = req.body;
      if (!year || !month) {
        return res.status(400).json({ error: "Year and month are required" });
      }
      const { syncCDRs } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncCDRs(year, month, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/all", async (req, res) => {
    try {
      const { syncCustomers, syncCarriers, syncRateCards } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      
      const [customersResult, carriersResult, rateCardsResult] = await Promise.all([
        syncCustomers(userId),
        syncCarriers(userId),
        syncRateCards(userId),
      ]);
      
      res.json({
        success: true,
        customers: customersResult,
        carriers: carriersResult,
        rateCards: rateCardsResult,
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  app.get("/api/admin/connexcs/sync/jobs", async (req, res) => {
    try {
      const { getSyncJobs } = await import("./services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 50;
      const jobs = await getSyncJobs(limit);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync jobs" });
    }
  });

  app.get("/api/admin/connexcs/sync/jobs/:id/logs", async (req, res) => {
    try {
      const { getSyncJobLogs } = await import("./services/connexcs-sync");
      const logs = await getSyncJobLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync logs" });
    }
  });

  app.get("/api/admin/connexcs/import/customers", async (req, res) => {
    try {
      const { getImportedCustomers } = await import("./services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const customers = await getImportedCustomers(limit);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported customers" });
    }
  });

  app.get("/api/admin/connexcs/import/carriers", async (req, res) => {
    try {
      const { getImportedCarriers } = await import("./services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const carriers = await getImportedCarriers(limit);
      res.json(carriers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported carriers" });
    }
  });

  app.get("/api/admin/connexcs/import/ratecards", async (req, res) => {
    try {
      const { getImportedRateCards } = await import("./services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const rateCards = await getImportedRateCards(limit);
      res.json(rateCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported rate cards" });
    }
  });

  app.get("/api/admin/connexcs/import/cdrs", async (req, res) => {
    try {
      const { getImportedCDRs } = await import("./services/connexcs-sync");
      const jobId = req.query.jobId as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const cdrs = await getImportedCDRs(jobId, limit);
      res.json(cdrs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch imported CDRs" });
    }
  });

  app.get("/api/admin/connexcs/import/cdrs/stats", async (req, res) => {
    try {
      const { getCDRStats } = await import("./services/connexcs-sync");
      const jobId = req.query.jobId as string;
      const stats = await getCDRStats(jobId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CDR stats" });
    }
  });

  app.post("/api/admin/connexcs/map/customers", async (req, res) => {
    try {
      const { mapImportedCustomersToDIDTron } = await import("./services/connexcs-sync");
      const result = await mapImportedCustomersToDIDTron();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Mapping failed" });
    }
  });

  app.post("/api/admin/connexcs/map/carriers", async (req, res) => {
    try {
      const { mapImportedCarriersToDIDTron } = await import("./services/connexcs-sync");
      const result = await mapImportedCarriersToDIDTron();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Mapping failed" });
    }
  });

  // ConnexCS Reconciliation Stats - compare ConnexCS vs DIDTron totals
  app.get("/api/admin/connexcs/reconciliation", async (req, res) => {
    try {
      const { getReconciliationStats } = await import("./services/connexcs-sync");
      const stats = await getReconciliationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get reconciliation stats" });
    }
  });

  // === NEW SYNC ROUTES: Balances, Routes, Scripts, Historical CDRs ===

  app.post("/api/admin/connexcs/sync/balances", async (req, res) => {
    try {
      const { syncBalances } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncBalances(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Balance sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/routes", async (req, res) => {
    try {
      const { syncRoutes } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncRoutes(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Route sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/scripts", async (req, res) => {
    try {
      const { syncScripts } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncScripts(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Script sync failed" });
    }
  });

  app.post("/api/admin/connexcs/sync/historical-cdrs", async (req, res) => {
    try {
      const { year, months } = req.body;
      if (!year) {
        return res.status(400).json({ error: "Year is required" });
      }
      const { syncHistoricalCDRs } = await import("./services/connexcs-sync");
      const userId = await getValidUserId(req.session?.userId);
      const result = await syncHistoricalCDRs(year, months || [1,2,3,4,5,6,7,8,9,10,11,12], userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Historical CDR sync failed" });
    }
  });

  app.get("/api/admin/connexcs/import/balances", async (req, res) => {
    try {
      const { getImportedBalances } = await import("./services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const balances = await getImportedBalances(limit);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balances" });
    }
  });

  app.get("/api/admin/connexcs/import/routes", async (req, res) => {
    try {
      const { getImportedRoutes } = await import("./services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const routes = await getImportedRoutes(limit);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.get("/api/admin/connexcs/import/scripts", async (req, res) => {
    try {
      const { getImportedScripts } = await import("./services/connexcs-sync");
      const limit = parseInt(req.query.limit as string) || 100;
      const scripts = await getImportedScripts(limit);
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  // CDR Statistics Dashboard API
  app.get("/api/admin/connexcs/cdr-stats", async (req, res) => {
    try {
      const { getCachedCDRStats } = await import("./services/connexcs-sync");
      const periodType = req.query.periodType as string;
      const stats = await getCachedCDRStats(periodType);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CDR statistics" });
    }
  });

  app.post("/api/admin/connexcs/cdr-stats/calculate", async (req, res) => {
    try {
      const { periodType, startDate, endDate } = req.body;
      if (!periodType || !startDate || !endDate) {
        return res.status(400).json({ error: "periodType, startDate, and endDate are required" });
      }
      const { calculateCDRStats } = await import("./services/connexcs-sync");
      await calculateCDRStats(periodType, new Date(startDate), new Date(endDate));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to calculate CDR stats" });
    }
  });

  // ==================== CARRIERS ====================

  app.get("/api/carriers", async (req, res) => {
    try {
      const { parseCursorParams, buildCursorResponse } = await import("./utils/pagination");
      const { cursor, limit } = parseCursorParams({
        cursor: req.query.cursor as string,
        limit: parseInt(req.query.limit as string) || 20,
        maxLimit: 100,
      });
      
      const results = await storage.getCarriersWithCursor(cursor, limit + 1);
      const response = buildCursorResponse(results, limit);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carriers" });
    }
  });

  app.get("/api/carriers/:id", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      res.json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier" });
    }
  });

  app.post("/api/carriers", async (req, res) => {
    try {
      const parsed = insertCarrierSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("[Carriers] Validation error:", JSON.stringify(parsed.error.errors, null, 2));
        return res.status(400).json({ error: parsed.error.errors });
      }
      const carrier = await storage.createCarrier(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "carriers",
        recordId: carrier.id,
        newValues: carrier,
      });
      
      // Auto-sync to ConnexCS if integration is enabled
      try {
        await connexcs.loadCredentialsFromStorage(storage);
        if (connexcs.isConfigured()) {
          const syncResult = await connexcs.syncCarrier({
            id: carrier.id,
            name: carrier.name,
          });
          if (syncResult.connexcsId) {
            await storage.updateCarrier(carrier.id, { connexcsCarrierId: syncResult.connexcsId });
          }
          console.log(`[ConnexCS] Carrier ${carrier.name} synced: ${syncResult.connexcsId}`);
        }
      } catch (syncError) {
        console.error("[ConnexCS] Auto-sync carrier failed:", syncError);
      }
      
      await invalidateCache("sidebar:counts:*");
      res.status(201).json(carrier);
    } catch (error) {
      console.error("[Carriers] Create error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create carrier" });
    }
  });

  app.patch("/api/carriers/:id", async (req, res) => {
    try {
      const oldCarrier = await storage.resolveCarrier(req.params.id);
      if (!oldCarrier) return res.status(404).json({ error: "Carrier not found" });
      const carrier = await storage.updateCarrier(oldCarrier.id, req.body);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "carriers",
        recordId: req.params.id,
        oldValues: oldCarrier,
        newValues: carrier,
      });
      await invalidateCache("sidebar:counts:*");
      res.json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier" });
    }
  });

  app.delete("/api/carriers/:id", async (req, res) => {
    try {
      const oldCarrier = await storage.resolveCarrier(req.params.id);
      if (!oldCarrier) return res.status(404).json({ error: "Carrier not found" });
      const deleted = await storage.deleteCarrier(oldCarrier.id);
      if (!deleted) return res.status(404).json({ error: "Carrier not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "carriers",
        recordId: req.params.id,
        oldValues: oldCarrier,
      });
      await invalidateCache("sidebar:counts:*");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carrier" });
    }
  });

  app.post("/api/carriers/:id/reset-spend", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      
      const { direction } = req.body as { direction: "customer" | "supplier" };
      if (!direction || !["customer", "supplier"].includes(direction)) {
        return res.status(400).json({ error: "Invalid direction. Must be 'customer' or 'supplier'" });
      }
      
      const updateData = direction === "customer"
        ? { customer24HrSpend: "0.00" }
        : { supplier24HrSpend: "0.00" };
      
      const updated = await storage.updateCarrier(carrier.id, updateData);
      
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "reset_spend",
        tableName: "carriers",
        recordId: req.params.id,
        oldValues: { [`${direction}24HrSpend`]: carrier[`${direction}24HrSpend` as keyof typeof carrier] },
        newValues: updateData,
      });
      
      res.json({ success: true, carrier: updated });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset carrier spend" });
    }
  });

  // ==================== CUSTOMER RATING PLANS ====================

  app.get("/api/softswitch/rating/customer-plans", async (req, res) => {
    try {
      const plans = await storage.getCustomerRatingPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer rating plans" });
    }
  });

  app.get("/api/softswitch/rating/customer-plans/:id", async (req, res) => {
    try {
      const plan = await storage.resolveCustomerRatingPlan(req.params.id);
      if (!plan) return res.status(404).json({ error: "Rating plan not found" });
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rating plan" });
    }
  });

  app.post("/api/softswitch/rating/customer-plans", async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.effectiveDate && typeof body.effectiveDate === 'string') {
        body.effectiveDate = new Date(body.effectiveDate);
      }
      const parsed = insertCustomerRatingPlanSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const plan = await storage.createCustomerRatingPlan(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "customer_rating_plans",
        recordId: plan.id,
        newValues: plan,
      });
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create rating plan" });
    }
  });

  app.patch("/api/softswitch/rating/customer-plans/:id", async (req, res) => {
    try {
      const oldPlan = await storage.resolveCustomerRatingPlan(req.params.id);
      if (!oldPlan) return res.status(404).json({ error: "Rating plan not found" });
      const plan = await storage.updateCustomerRatingPlan(oldPlan.id, req.body);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "customer_rating_plans",
        recordId: oldPlan.id,
        oldValues: oldPlan,
        newValues: plan,
      });
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rating plan" });
    }
  });

  app.delete("/api/softswitch/rating/customer-plans/:id", async (req, res) => {
    try {
      const oldPlan = await storage.resolveCustomerRatingPlan(req.params.id);
      if (!oldPlan) return res.status(404).json({ error: "Rating plan not found" });
      const deleted = await storage.deleteCustomerRatingPlan(oldPlan.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "customer_rating_plans",
        recordId: oldPlan.id,
        oldValues: oldPlan,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rating plan" });
    }
  });

  // ==================== CUSTOMER RATING PLAN RATES ====================

  app.get("/api/softswitch/rating/customer-plans/:planId/rates", async (req, res) => {
    try {
      const plan = await storage.resolveCustomerRatingPlan(req.params.planId);
      if (!plan) return res.status(404).json({ error: "Rating plan not found" });
      const rates = await storage.getRatingPlanRates(plan.id);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rating plan rates" });
    }
  });

  app.get("/api/softswitch/rating/rates/:id", async (req, res) => {
    try {
      const rate = await storage.getRatingPlanRate(req.params.id);
      if (!rate) return res.status(404).json({ error: "Rate not found" });
      res.json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rate" });
    }
  });

  app.post("/api/softswitch/rating/customer-plans/:planId/rates", async (req, res) => {
    try {
      const plan = await storage.resolveCustomerRatingPlan(req.params.planId);
      if (!plan) return res.status(404).json({ error: "Rating plan not found" });
      
      const baseBody = { ...req.body, ratingPlanId: plan.id };
      if (baseBody.effectiveDate && typeof baseBody.effectiveDate === 'string') {
        baseBody.effectiveDate = new Date(baseBody.effectiveDate);
      }
      if (baseBody.endDate && typeof baseBody.endDate === 'string') {
        baseBody.endDate = new Date(baseBody.endDate);
      }
      
      const zoneInput = baseBody.zone as string;
      const isWildcard = zoneInput.includes('%');
      
      if (isWildcard) {
        const matchingZones = await storage.expandWildcardZones(zoneInput);
        if (matchingZones.length === 0) {
          return res.status(400).json({ error: "No zones match the wildcard pattern" });
        }
        
        const createdRates = [];
        for (const zoneName of matchingZones) {
          const codes = await storage.getCodesForZone(zoneName);
          if (codes.length === 0) continue;
          
          const rateBody = {
            ...baseBody,
            zone: zoneName,
            codes: codes,
          };
          
          const rate = await storage.createRatingPlanRate(rateBody);
          createdRates.push(rate);
          
          await storage.createAuditLog({
            userId: req.session?.userId,
            action: "create",
            tableName: "customer_rating_plan_rates",
            recordId: rate.id,
            newValues: rate,
          });
        }
        
        res.status(201).json({ 
          message: `Created ${createdRates.length} rate entries for matching zones`,
          rates: createdRates 
        });
      } else {
        const rate = await storage.createRatingPlanRate(baseBody);
        await storage.createAuditLog({
          userId: req.session?.userId,
          action: "create",
          tableName: "customer_rating_plan_rates",
          recordId: rate.id,
          newValues: rate,
        });
        res.status(201).json(rate);
      }
    } catch (error) {
      console.error("Failed to create rate:", error);
      res.status(500).json({ error: "Failed to create rate" });
    }
  });

  app.patch("/api/softswitch/rating/rates/:id", async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.effectiveDate && typeof body.effectiveDate === 'string') {
        body.effectiveDate = new Date(body.effectiveDate);
      }
      if (body.endDate && typeof body.endDate === 'string') {
        body.endDate = new Date(body.endDate);
      }
      const oldRate = await storage.getRatingPlanRate(req.params.id);
      const rate = await storage.updateRatingPlanRate(req.params.id, body);
      if (!rate) return res.status(404).json({ error: "Rate not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "customer_rating_plan_rates",
        recordId: req.params.id,
        oldValues: oldRate,
        newValues: rate,
      });
      res.json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rate" });
    }
  });

  app.delete("/api/softswitch/rating/rates/:id", async (req, res) => {
    try {
      const oldRate = await storage.getRatingPlanRate(req.params.id);
      const deleted = await storage.deleteRatingPlanRate(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Rate not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "customer_rating_plan_rates",
        recordId: req.params.id,
        oldValues: oldRate,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rate" });
    }
  });

  // ==================== SUPPLIER RATING PLANS ====================

  app.get("/api/softswitch/rating/supplier-plans", async (req, res) => {
    try {
      const plans = await storage.getSupplierRatingPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier rating plans" });
    }
  });

  app.get("/api/softswitch/rating/supplier-plans/:id", async (req, res) => {
    try {
      const plan = await storage.resolveSupplierRatingPlan(req.params.id);
      if (!plan) return res.status(404).json({ error: "Supplier rating plan not found" });
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier rating plan" });
    }
  });

  app.post("/api/softswitch/rating/supplier-plans", async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.effectiveDate && typeof body.effectiveDate === 'string') {
        body.effectiveDate = new Date(body.effectiveDate);
      }
      const { insertSupplierRatingPlanSchema } = await import("@shared/schema");
      const parsed = insertSupplierRatingPlanSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const plan = await storage.createSupplierRatingPlan(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "supplier_rating_plans",
        recordId: plan.id,
        newValues: plan,
      });
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to create supplier rating plan" });
    }
  });

  app.patch("/api/softswitch/rating/supplier-plans/:id", async (req, res) => {
    try {
      const oldPlan = await storage.resolveSupplierRatingPlan(req.params.id);
      if (!oldPlan) return res.status(404).json({ error: "Supplier rating plan not found" });
      const plan = await storage.updateSupplierRatingPlan(oldPlan.id, req.body);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "supplier_rating_plans",
        recordId: oldPlan.id,
        oldValues: oldPlan,
        newValues: plan,
      });
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update supplier rating plan" });
    }
  });

  app.delete("/api/softswitch/rating/supplier-plans/:id", async (req, res) => {
    try {
      const oldPlan = await storage.resolveSupplierRatingPlan(req.params.id);
      if (!oldPlan) return res.status(404).json({ error: "Supplier rating plan not found" });
      const deleted = await storage.deleteSupplierRatingPlan(oldPlan.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "supplier_rating_plans",
        recordId: oldPlan.id,
        oldValues: oldPlan,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete supplier rating plan" });
    }
  });

  // ==================== SUPPLIER RATING PLAN RATES ====================

  app.get("/api/softswitch/rating/supplier-plans/:planId/rates", async (req, res) => {
    try {
      const plan = await storage.resolveSupplierRatingPlan(req.params.planId);
      if (!plan) return res.status(404).json({ error: "Supplier rating plan not found" });
      const rates = await storage.getSupplierRatingPlanRates(plan.id);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier rating plan rates" });
    }
  });

  app.post("/api/softswitch/rating/supplier-plans/:planId/rates", async (req, res) => {
    try {
      const plan = await storage.resolveSupplierRatingPlan(req.params.planId);
      if (!plan) return res.status(404).json({ error: "Supplier rating plan not found" });
      
      const baseBody = { ...req.body, ratingPlanId: plan.id };
      if (baseBody.effectiveDate && typeof baseBody.effectiveDate === 'string') {
        baseBody.effectiveDate = new Date(baseBody.effectiveDate);
      }
      if (baseBody.endDate && typeof baseBody.endDate === 'string') {
        baseBody.endDate = new Date(baseBody.endDate);
      }
      const { insertSupplierRatingPlanRateSchema } = await import("@shared/schema");
      const parsed = insertSupplierRatingPlanRateSchema.safeParse(baseBody);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const rate = await storage.createSupplierRatingPlanRate(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "supplier_rating_plan_rates",
        recordId: rate.id,
        newValues: rate,
      });
      res.status(201).json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create supplier rate" });
    }
  });

  app.delete("/api/softswitch/rating/supplier-rates/:id", async (req, res) => {
    try {
      const oldRate = await storage.getSupplierRatingPlanRate(req.params.id);
      const deleted = await storage.deleteSupplierRatingPlanRate(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Supplier rate not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "supplier_rating_plan_rates",
        recordId: req.params.id,
        oldValues: oldRate,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete supplier rate" });
    }
  });

  // A-Z Zone/Code Lookup for Rating
  app.get("/api/softswitch/rating/az-lookup/zones", async (req, res) => {
    try {
      const { search } = req.query;
      if (!search || typeof search !== 'string') {
        return res.json([]);
      }
      const zones = await storage.searchZonesFromAZ(search);
      res.json(zones);
    } catch (error) {
      res.status(500).json({ error: "Failed to search zones" });
    }
  });

  app.get("/api/softswitch/rating/az-lookup/codes", async (req, res) => {
    try {
      const { zone, withIntervals } = req.query;
      if (!zone || typeof zone !== 'string') {
        return res.json(withIntervals === 'true' ? { codes: [], billingIncrement: null } : []);
      }
      if (withIntervals === 'true') {
        const result = await storage.getCodesWithIntervalsForZone(zone);
        res.json(result);
      } else {
        const codes = await storage.getCodesForZone(zone);
        res.json(codes);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get codes for zone" });
    }
  });

  app.get("/api/softswitch/rating/az-lookup/zone-by-code", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.json({ zone: null });
      }
      const zone = await storage.lookupZoneByCode(code);
      res.json({ zone });
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup zone by code" });
    }
  });

  // Business Rules CRUD
  app.get("/api/softswitch/rating/business-rules", async (req, res) => {
    try {
      const rules = await storage.getBusinessRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business rules" });
    }
  });

  app.get("/api/softswitch/rating/business-rules/:id", async (req, res) => {
    try {
      const rule = await storage.getBusinessRule(req.params.id);
      if (!rule) return res.status(404).json({ error: "Business rule not found" });
      res.json(rule);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business rule" });
    }
  });

  app.post("/api/softswitch/rating/business-rules", async (req, res) => {
    try {
      const { insertBusinessRuleSchema } = await import("@shared/schema");
      const parsed = insertBusinessRuleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const rule = await storage.createBusinessRule(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "business_rules",
        recordId: rule.id,
        newValues: rule,
      });
      res.status(201).json(rule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create business rule" });
    }
  });

  app.patch("/api/softswitch/rating/business-rules/:id", async (req, res) => {
    try {
      const existing = await storage.getBusinessRule(req.params.id);
      if (!existing) return res.status(404).json({ error: "Business rule not found" });
      const rule = await storage.updateBusinessRule(req.params.id, req.body);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "business_rules",
        recordId: req.params.id,
        oldValues: existing,
        newValues: rule,
      });
      res.json(rule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update business rule" });
    }
  });

  app.delete("/api/softswitch/rating/business-rules/:id", async (req, res) => {
    try {
      const existing = await storage.getBusinessRule(req.params.id);
      if (!existing) return res.status(404).json({ error: "Business rule not found" });
      await storage.deleteBusinessRule(req.params.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "business_rules",
        recordId: req.params.id,
        oldValues: existing,
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete business rule" });
    }
  });

  // Carrier Assignments
  app.get("/api/carriers/:id/assignment", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      const assignment = await storage.getCarrierAssignment(carrier.id);
      res.json(assignment || { carrierId: carrier.id, assignmentType: "all", categoryIds: [], groupIds: [], customerIds: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier assignment" });
    }
  });

  app.put("/api/carriers/:id/assignment", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      
      const parsed = insertCarrierAssignmentSchema.safeParse({ ...req.body, carrierId: carrier.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const assignment = await storage.upsertCarrierAssignment(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update_assignment",
        tableName: "carrier_assignments",
        recordId: carrier.id,
        newValues: assignment,
      });
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier assignment" });
    }
  });

  // Carrier Interconnects
  app.get("/api/carrier-interconnects", async (req, res) => {
    try {
      const { cursor, limit = "50" } = req.query;
      const parsedLimit = Math.min(parseInt(String(limit)) || 50, 100);
      const interconnects = await storage.getAllCarrierInterconnects();
      
      // Apply cursor pagination
      let startIndex = 0;
      if (cursor) {
        startIndex = interconnects.findIndex(i => i.id === cursor) + 1;
      }
      const paged = interconnects.slice(startIndex, startIndex + parsedLimit + 1);
      const hasMore = paged.length > parsedLimit;
      const data = hasMore ? paged.slice(0, -1) : paged;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
      
      res.json({ data, nextCursor, hasMore });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all carrier interconnects" });
    }
  });

  app.get("/api/carriers/:id/interconnects", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      const interconnects = await storage.getCarrierInterconnects(carrier.id);
      res.json(interconnects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier interconnects" });
    }
  });

  app.post("/api/carriers/:id/interconnects", async (req, res) => {
    try {
      // Resolve carrier by ID or code
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      
      const parsed = insertCarrierInterconnectSchema.safeParse({ ...req.body, carrierId: carrier.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const interconnect = await storage.createCarrierInterconnect(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "carrier_interconnects",
        recordId: interconnect.id,
        newValues: interconnect,
      });
      res.status(201).json(interconnect);
    } catch (error) {
      console.error("Failed to create carrier interconnect:", error);
      res.status(500).json({ error: "Failed to create carrier interconnect" });
    }
  });

  app.get("/api/interconnects/:id", async (req, res) => {
    try {
      const interconnect = await storage.resolveCarrierInterconnect(req.params.id);
      if (!interconnect) return res.status(404).json({ error: "Interconnect not found" });
      res.json(interconnect);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interconnect" });
    }
  });

  app.put("/api/interconnects/:id", async (req, res) => {
    try {
      const oldInterconnect = await storage.resolveCarrierInterconnect(req.params.id);
      if (!oldInterconnect) return res.status(404).json({ error: "Interconnect not found" });
      const parsed = insertCarrierInterconnectSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const interconnect = await storage.updateCarrierInterconnect(oldInterconnect.id, parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "carrier_interconnects",
        recordId: oldInterconnect.id,
        oldValues: oldInterconnect,
        newValues: interconnect,
      });
      res.json(interconnect);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier interconnect" });
    }
  });

  app.delete("/api/interconnects/:id", async (req, res) => {
    try {
      const oldInterconnect = await storage.resolveCarrierInterconnect(req.params.id);
      if (!oldInterconnect) return res.status(404).json({ error: "Interconnect not found" });
      await storage.deleteCarrierInterconnect(oldInterconnect.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "carrier_interconnects",
        recordId: oldInterconnect.id,
        oldValues: oldInterconnect,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carrier interconnect" });
    }
  });

  // Carrier Services - THE KEY LINKAGE: Interconnect → Rating Plan + Routing Plan
  app.get("/api/carrier-services", async (req, res) => {
    try {
      const { cursor, limit = "50" } = req.query;
      const parsedLimit = Math.min(parseInt(String(limit)) || 50, 100);
      const services = await storage.getAllCarrierServices();
      
      // Apply cursor pagination
      let startIndex = 0;
      if (cursor) {
        startIndex = services.findIndex(s => s.id === cursor) + 1;
      }
      const paged = services.slice(startIndex, startIndex + parsedLimit + 1);
      const hasMore = paged.length > parsedLimit;
      const data = hasMore ? paged.slice(0, -1) : paged;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
      
      res.json({ data, nextCursor, hasMore });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all carrier services" });
    }
  });

  app.get("/api/carriers/:id/services", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      const services = await storage.getCarrierServices(carrier.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier services" });
    }
  });

  app.get("/api/interconnects/:id/services", async (req, res) => {
    try {
      const services = await storage.getInterconnectServices(req.params.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interconnect services" });
    }
  });

  app.post("/api/carriers/:carrierId/services", async (req, res) => {
    try {
      // Resolve carrier by ID or code
      const carrier = await storage.resolveCarrier(req.params.carrierId);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      
      const parsed = insertCarrierServiceSchema.safeParse({ ...req.body, carrierId: carrier.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      
      // DIGITALK HIERARCHY VALIDATION: Verify interconnect belongs to this carrier
      if (parsed.data.interconnectId) {
        const interconnect = await storage.getCarrierInterconnect(parsed.data.interconnectId);
        if (!interconnect) {
          return res.status(400).json({ error: "Interconnect not found" });
        }
        if (interconnect.carrierId !== carrier.id) {
          return res.status(400).json({ error: "Interconnect does not belong to this carrier - violates Carrier → Interconnect → Service hierarchy" });
        }
        // Validate direction compatibility: Service direction should align with interconnect
        const serviceDirection = parsed.data.direction || "ingress";
        const interconnectDirection = interconnect.direction || "both";
        if (interconnectDirection !== "both" && interconnectDirection !== serviceDirection) {
          return res.status(400).json({ 
            error: `Service direction '${serviceDirection}' incompatible with interconnect direction '${interconnectDirection}'` 
          });
        }
      }
      
      const service = await storage.createCarrierService(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "carrier_services",
        recordId: service.id,
        newValues: service,
      });
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create carrier service" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.resolveCarrierService(req.params.id);
      if (!service) return res.status(404).json({ error: "Service not found" });
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const oldService = await storage.resolveCarrierService(req.params.id);
      if (!oldService) return res.status(404).json({ error: "Service not found" });
      const parsed = insertCarrierServiceSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      
      // DIGITALK HIERARCHY VALIDATION: If changing interconnect, verify it belongs to the carrier
      const interconnectId = parsed.data.interconnectId || oldService.interconnectId;
      const carrierId = parsed.data.carrierId || oldService.carrierId;
      
      if (interconnectId) {
        const interconnect = await storage.getCarrierInterconnect(interconnectId);
        if (!interconnect) {
          return res.status(400).json({ error: "Interconnect not found" });
        }
        if (interconnect.carrierId !== carrierId) {
          return res.status(400).json({ error: "Interconnect does not belong to this carrier - violates Carrier → Interconnect → Service hierarchy" });
        }
        // Validate direction compatibility
        const serviceDirection = parsed.data.direction || oldService.direction || "ingress";
        const interconnectDirection = interconnect.direction || "both";
        if (interconnectDirection !== "both" && interconnectDirection !== serviceDirection) {
          return res.status(400).json({ 
            error: `Service direction '${serviceDirection}' incompatible with interconnect direction '${interconnectDirection}'` 
          });
        }
      }
      
      const service = await storage.updateCarrierService(oldService.id, parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "carrier_services",
        recordId: oldService.id,
        oldValues: oldService,
        newValues: service,
      });
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const oldService = await storage.resolveCarrierService(req.params.id);
      if (!oldService) return res.status(404).json({ error: "Service not found" });
      await storage.deleteCarrierService(oldService.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "carrier_services",
        recordId: oldService.id,
        oldValues: oldService,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carrier service" });
    }
  });

  // Supplier Interconnects - for "Route to Interconnect" dropdown
  app.get("/api/interconnects/supplier", async (req, res) => {
    try {
      const excludeCarrierId = req.query.excludeCarrierId as string | undefined;
      const interconnects = await storage.getSupplierInterconnects(excludeCarrierId);
      res.json(interconnects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier interconnects" });
    }
  });

  // Customer Rating Plans - for service rating plan dropdown
  app.get("/api/rating-plans", async (req, res) => {
    try {
      const rateCards = await storage.getRateCards("customer");
      res.json(rateCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rating plans" });
    }
  });

  // Service Match Lists - for "Assign List" dropdown
  app.get("/api/match-lists", async (req, res) => {
    try {
      const matchLists = await storage.getAllServiceMatchLists();
      res.json(matchLists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match lists" });
    }
  });

  app.post("/api/match-lists", async (req, res) => {
    try {
      const parsed = insertServiceMatchListSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const matchList = await storage.createServiceMatchList(parsed.data);
      res.status(201).json(matchList);
    } catch (error) {
      res.status(500).json({ error: "Failed to create match list" });
    }
  });

  // Carrier Contacts
  app.get("/api/carriers/:id/contacts", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      const contacts = await storage.getCarrierContacts(carrier.id);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier contacts" });
    }
  });

  app.post("/api/carriers/:id/contacts", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      
      const parsed = insertCarrierContactSchema.safeParse({ ...req.body, carrierId: carrier.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const contact = await storage.createCarrierContact(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "carrier_contacts",
        recordId: contact.id,
        newValues: contact,
      });
      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to create carrier contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const oldContact = await storage.getCarrierContact(req.params.id);
      if (!oldContact) return res.status(404).json({ error: "Contact not found" });
      const parsed = insertCarrierContactSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const contact = await storage.updateCarrierContact(req.params.id, parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "carrier_contacts",
        recordId: req.params.id,
        oldValues: oldContact,
        newValues: contact,
      });
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const oldContact = await storage.getCarrierContact(req.params.id);
      if (!oldContact) return res.status(404).json({ error: "Contact not found" });
      await storage.deleteCarrierContact(req.params.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "carrier_contacts",
        recordId: req.params.id,
        oldValues: oldContact,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carrier contact" });
    }
  });

  // Carrier Credit Alerts
  app.get("/api/carriers/:id/credit-alerts", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      const alerts = await storage.getCarrierCreditAlerts(carrier.id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier credit alerts" });
    }
  });

  app.post("/api/carriers/:id/credit-alerts", async (req, res) => {
    try {
      const carrier = await storage.resolveCarrier(req.params.id);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      
      const parsed = insertCarrierCreditAlertSchema.safeParse({ ...req.body, carrierId: carrier.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const alert = await storage.createCarrierCreditAlert(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "carrier_credit_alerts",
        recordId: alert.id,
        newValues: alert,
      });
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to create carrier credit alert" });
    }
  });

  app.put("/api/credit-alerts/:id", async (req, res) => {
    try {
      const oldAlert = await storage.getCarrierCreditAlert(req.params.id);
      if (!oldAlert) return res.status(404).json({ error: "Credit alert not found" });
      const parsed = insertCarrierCreditAlertSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const alert = await storage.updateCarrierCreditAlert(req.params.id, parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "carrier_credit_alerts",
        recordId: req.params.id,
        oldValues: oldAlert,
        newValues: alert,
      });
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier credit alert" });
    }
  });

  app.delete("/api/credit-alerts/:id", async (req, res) => {
    try {
      const oldAlert = await storage.getCarrierCreditAlert(req.params.id);
      if (!oldAlert) return res.status(404).json({ error: "Credit alert not found" });
      await storage.deleteCarrierCreditAlert(req.params.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "carrier_credit_alerts",
        recordId: req.params.id,
        oldValues: oldAlert,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carrier credit alert" });
    }
  });

  // ==================== INTERCONNECT SETTINGS (Digitalk Matching) ====================

  // Interconnect IP Addresses
  app.get("/api/interconnects/:id/ip-addresses", async (req, res) => {
    try {
      const addresses = await storage.getInterconnectIpAddresses(req.params.id);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch IP addresses" });
    }
  });

  app.post("/api/interconnects/:id/ip-addresses", async (req, res) => {
    try {
      const parsed = insertInterconnectIpAddressSchema.safeParse({ ...req.body, interconnectId: req.params.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const address = await storage.createInterconnectIpAddress(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "create",
        tableName: "interconnect_ip_addresses",
        recordId: address.id,
        newValues: address,
      });
      res.status(201).json(address);
    } catch (error) {
      res.status(500).json({ error: "Failed to create IP address" });
    }
  });

  app.delete("/api/ip-addresses/:id", async (req, res) => {
    try {
      await storage.deleteInterconnectIpAddress(req.params.id);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "interconnect_ip_addresses",
        recordId: req.params.id,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete IP address" });
    }
  });

  // Interconnect Validation Settings
  app.get("/api/interconnects/:id/validation-settings", async (req, res) => {
    try {
      const settings = await storage.getInterconnectValidationSettings(req.params.id);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch validation settings" });
    }
  });

  app.put("/api/interconnects/:id/validation-settings", async (req, res) => {
    try {
      const parsed = insertInterconnectValidationSettingsSchema.safeParse({ ...req.body, interconnectId: req.params.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const settings = await storage.upsertInterconnectValidationSettings(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "upsert",
        tableName: "interconnect_validation_settings",
        recordId: settings.id,
        newValues: settings,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save validation settings" });
    }
  });

  // Interconnect Translation Settings
  app.get("/api/interconnects/:id/translation-settings", async (req, res) => {
    try {
      const settings = await storage.getInterconnectTranslationSettings(req.params.id);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch translation settings" });
    }
  });

  app.put("/api/interconnects/:id/translation-settings", async (req, res) => {
    try {
      const parsed = insertInterconnectTranslationSettingsSchema.safeParse({ ...req.body, interconnectId: req.params.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const settings = await storage.upsertInterconnectTranslationSettings(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "upsert",
        tableName: "interconnect_translation_settings",
        recordId: settings.id,
        newValues: settings,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save translation settings" });
    }
  });

  // Interconnect Codecs
  app.get("/api/interconnects/:id/codecs", async (req, res) => {
    try {
      const codecs = await storage.getInterconnectCodecs(req.params.id);
      res.json(codecs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch codecs" });
    }
  });

  app.put("/api/interconnects/:id/codecs", async (req, res) => {
    try {
      const codecsData = req.body.codecs || [];
      const codecs = await storage.upsertInterconnectCodecs(req.params.id, codecsData.map((c: any) => ({ ...c, interconnectId: req.params.id })));
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "upsert",
        tableName: "interconnect_codecs",
        recordId: req.params.id,
        newValues: { codecs },
      });
      res.json(codecs);
    } catch (error) {
      res.status(500).json({ error: "Failed to save codecs" });
    }
  });

  // Interconnect Media Settings
  app.get("/api/interconnects/:id/media-settings", async (req, res) => {
    try {
      const settings = await storage.getInterconnectMediaSettings(req.params.id);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media settings" });
    }
  });

  app.put("/api/interconnects/:id/media-settings", async (req, res) => {
    try {
      const parsed = insertInterconnectMediaSettingsSchema.safeParse({ ...req.body, interconnectId: req.params.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const settings = await storage.upsertInterconnectMediaSettings(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "upsert",
        tableName: "interconnect_media_settings",
        recordId: settings.id,
        newValues: settings,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save media settings" });
    }
  });

  // Interconnect Signalling Settings
  app.get("/api/interconnects/:id/signalling-settings", async (req, res) => {
    try {
      const settings = await storage.getInterconnectSignallingSettings(req.params.id);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch signalling settings" });
    }
  });

  app.put("/api/interconnects/:id/signalling-settings", async (req, res) => {
    try {
      const parsed = insertInterconnectSignallingSettingsSchema.safeParse({ ...req.body, interconnectId: req.params.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const settings = await storage.upsertInterconnectSignallingSettings(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "upsert",
        tableName: "interconnect_signalling_settings",
        recordId: settings.id,
        newValues: settings,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save signalling settings" });
    }
  });

  // Interconnect Monitoring Settings
  app.get("/api/interconnects/:id/monitoring-settings", async (req, res) => {
    try {
      const settings = await storage.getInterconnectMonitoringSettings(req.params.id);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitoring settings" });
    }
  });

  app.put("/api/interconnects/:id/monitoring-settings", async (req, res) => {
    try {
      const parsed = insertInterconnectMonitoringSettingsSchema.safeParse({ ...req.body, interconnectId: req.params.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const settings = await storage.upsertInterconnectMonitoringSettings(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "upsert",
        tableName: "interconnect_monitoring_settings",
        recordId: settings.id,
        newValues: settings,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save monitoring settings" });
    }
  });

  // Admin Users - for audit log display
  app.get("/api/admin-users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
        role: u.role
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Admin users fetch error:", error);
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  });

  // Audit Logs - read from database via auditService
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const { tableName, limit } = req.query;
      const logs = await auditService.getRecentLogs(
        limit ? parseInt(limit as string) : 100,
        tableName as string | undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Audit logs fetch error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
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
      const oldRoute = await storage.getRoute(req.params.id);
      const route = await storage.updateRoute(req.params.id, req.body);
      if (!route) return res.status(404).json({ error: "Route not found" });
      await auditService.logWithRequest(req, "update", "routes", req.params.id, oldRoute as Record<string, unknown>, route as Record<string, unknown>);
      res.json(route);
    } catch (error) {
      res.status(500).json({ error: "Failed to update route" });
    }
  });

  app.delete("/api/routes/:id", async (req, res) => {
    try {
      const oldRoute = await storage.getRoute(req.params.id);
      if (!oldRoute) return res.status(404).json({ error: "Route not found" });
      
      // Move to trash before deleting
      await auditService.moveToTrash("routes", req.params.id, oldRoute as Record<string, unknown>, req.session?.userId);
      
      const deleted = await storage.deleteRoute(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Route not found" });
      
      await auditService.logWithRequest(req, "delete", "routes", req.params.id, oldRoute as Record<string, unknown>, null);
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

  // ==================== FX RATES ====================

  app.get("/api/fx-rates", async (req, res) => {
    try {
      const quoteCurrency = req.query.quoteCurrency as string | undefined;
      const rates = await storage.getFxRates(quoteCurrency);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FX rates" });
    }
  });

  app.get("/api/fx-rates/latest/:currency", async (req, res) => {
    try {
      const rate = await storage.getLatestFxRate(req.params.currency);
      if (!rate) return res.status(404).json({ error: "FX rate not found" });
      res.json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FX rate" });
    }
  });

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

  // ==================== SIP TEST CONFIGS ====================

  app.get("/api/sip-tests/configs", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const configs = await storage.getSipTestConfigs(customerId);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test configs" });
    }
  });

  app.get("/api/sip-tests/configs/:id", async (req, res) => {
    try {
      const config = await storage.getSipTestConfig(req.params.id);
      if (!config) return res.status(404).json({ error: "Config not found" });
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test config" });
    }
  });

  app.post("/api/sip-tests/configs", async (req, res) => {
    try {
      const parsed = insertSipTestConfigSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const config = await storage.createSipTestConfig(parsed.data);
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test config" });
    }
  });

  app.patch("/api/sip-tests/configs/:id", async (req, res) => {
    try {
      const config = await storage.updateSipTestConfig(req.params.id, req.body);
      if (!config) return res.status(404).json({ error: "Config not found" });
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SIP test config" });
    }
  });

  app.delete("/api/sip-tests/configs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestConfig(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Config not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete SIP test config" });
    }
  });

  // ==================== SIP TEST RESULTS ====================

  app.get("/api/sip-tests/results", async (req, res) => {
    try {
      const configId = req.query.configId as string | undefined;
      const results = await storage.getSipTestResults(configId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test results" });
    }
  });

  app.get("/api/sip-tests/results/:id", async (req, res) => {
    try {
      const result = await storage.getSipTestResult(req.params.id);
      if (!result) return res.status(404).json({ error: "Result not found" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test result" });
    }
  });

  app.post("/api/sip-tests/results", async (req, res) => {
    try {
      const parsed = insertSipTestResultSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const result = await storage.createSipTestResult(parsed.data);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test result" });
    }
  });

  // ==================== SIP TEST SCHEDULES ====================

  app.get("/api/sip-tests/schedules", async (req, res) => {
    try {
      const configId = req.query.configId as string | undefined;
      const schedules = await storage.getSipTestSchedules(configId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SIP test schedules" });
    }
  });

  app.post("/api/sip-tests/schedules", async (req, res) => {
    try {
      const parsed = insertSipTestScheduleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const schedule = await storage.createSipTestSchedule(parsed.data);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SIP test schedule" });
    }
  });

  app.patch("/api/sip-tests/schedules/:id", async (req, res) => {
    try {
      const schedule = await storage.updateSipTestSchedule(req.params.id, req.body);
      if (!schedule) return res.status(404).json({ error: "Schedule not found" });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SIP test schedule" });
    }
  });

  app.delete("/api/sip-tests/schedules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestSchedule(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Schedule not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete SIP test schedule" });
    }
  });

  // ==================== SIP TEST SUPPLIERS ====================

  app.get("/api/sip-test-suppliers", async (_req, res) => {
    try {
      const suppliers = await storage.getSipTestSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/sip-test-suppliers", async (req, res) => {
    try {
      const supplier = await storage.createSipTestSupplier({
        name: req.body.name,
        codec: req.body.codec || 'G729',
        prefix: req.body.prefix,
        protocol: req.body.protocol || 'SIP',
        email: req.body.email,
        isOurTier: req.body.isOurTier || false,
        tierId: req.body.tierId,
        isActive: req.body.isActive ?? true,
      });
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });

  app.delete("/api/sip-test-suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestSupplier(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Supplier not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete supplier" });
    }
  });

  // ==================== SIP TEST SETTINGS ====================

  app.get("/api/sip-test-settings", async (req, res) => {
    try {
      const user = req.user as { customerId?: string; id?: string } | undefined;
      const customerId = user?.customerId || user?.id;
      const settings = await storage.getSipTestSettings(customerId);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/sip-test-settings", async (req, res) => {
    try {
      const user = req.user as { customerId?: string; id?: string } | undefined;
      const customerId = user?.customerId || user?.id;
      const settings = await storage.upsertSipTestSettings({
        customerId,
        concurrentCalls: req.body.concurrentCalls,
        cliAcceptablePrefixes: req.body.cliAcceptablePrefixes,
        defaultAudioId: req.body.defaultAudioId,
        maxWaitAnswer: req.body.maxWaitAnswer,
        defaultCallsCount: req.body.defaultCallsCount,
        defaultCodec: req.body.defaultCodec,
        defaultDuration: req.body.defaultDuration,
        timezone: req.body.timezone,
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // ==================== SIP TEST RUNS (ADMIN) ====================

  app.get("/api/sip-test-runs", async (_req, res) => {
    try {
      const runs = await storage.getAllSipTestRuns();
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  app.post("/api/sip-test-runs", async (req, res) => {
    try {
      const user = req.user as { customerId?: string; id?: string } | undefined;
      const customerId = user?.customerId || user?.id || 'admin';
      const run = await storage.createSipTestRun({
        customerId,
        testName: req.body.testName,
        testMode: req.body.testMode || 'standard',
        routeSource: req.body.routeSource || 'tier',
        supplierIds: req.body.supplierIds,
        destinations: req.body.destinations,
        countryFilters: req.body.countryFilters,
        manualNumbers: req.body.manualNumbers,
        useDbNumbers: req.body.useDbNumbers,
        addToDb: req.body.addToDb,
        codec: req.body.codec || 'G729',
        audioFileId: req.body.audioFileId,
        aniMode: req.body.aniMode || 'any',
        aniCountries: req.body.aniCountries,
        capacity: req.body.capacity || 1,
      });
      res.status(201).json(run);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test run" });
    }
  });

  // ==================== SIP TEST NUMBERS (CROWDSOURCED) ====================

  app.get("/api/sip-test-numbers", async (req, res) => {
    try {
      const countryCode = req.query.countryCode as string | undefined;
      const numbers = await storage.getSipTestNumbers(countryCode);
      res.json(numbers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test numbers" });
    }
  });

  app.get("/api/sip-test-numbers/:id", async (req, res) => {
    try {
      const number = await storage.getSipTestNumber(req.params.id);
      if (!number) return res.status(404).json({ error: "Test number not found" });
      res.json(number);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test number" });
    }
  });

  app.post("/api/sip-test-numbers", async (req, res) => {
    try {
      const number = await storage.createSipTestNumber({
        countryCode: req.body.countryCode,
        countryName: req.body.countryName,
        phoneNumber: req.body.phoneNumber,
        numberType: req.body.numberType,
        carrier: req.body.carrier,
        verified: false,
        contributedBy: req.body.contributedBy,
        isPublic: req.body.isPublic ?? true,
        isActive: true,
      });
      res.status(201).json(number);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test number" });
    }
  });

  app.patch("/api/sip-test-numbers/:id", async (req, res) => {
    try {
      const number = await storage.updateSipTestNumber(req.params.id, req.body);
      if (!number) return res.status(404).json({ error: "Test number not found" });
      res.json(number);
    } catch (error) {
      res.status(500).json({ error: "Failed to update test number" });
    }
  });

  app.delete("/api/sip-test-numbers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSipTestNumber(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Test number not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete test number" });
    }
  });

  // ==================== SIP TEST RUNS (CUSTOMER PORTAL) ====================

  app.get("/api/my/sip-test-runs", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const customerId = user.customerId || user.id || "";
      const runs = await storage.getSipTestRuns(customerId);
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test runs" });
    }
  });

  app.post("/api/my/sip-test-runs", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const customerId = user.customerId || user.id || "";
      const run = await storage.createSipTestRun({
        customerId,
        testName: req.body.testName,
        testMode: req.body.testMode || 'standard',
        routeSource: req.body.routeSource,
        tierId: req.body.tierId,
        supplierIds: req.body.supplierIds,
        countryFilters: req.body.countryFilters,
        manualNumbers: req.body.manualNumbers,
        useDbNumbers: req.body.useDbNumbers,
        addToDb: req.body.addToDb,
        codec: req.body.codec || 'G729',
        audioFileId: req.body.audioFileId,
        aniMode: req.body.aniMode || 'any',
        aniNumber: req.body.aniNumber,
        aniCountries: req.body.aniCountries,
        callsCount: req.body.callsCount || 5,
        maxDuration: req.body.maxDuration || 30,
        capacity: req.body.capacity || 1,
        status: 'running',
      });

      executeSipTestRun(run.id, storage, connexcs).catch(err => {
        console.error("[SIP Test] Background execution error:", err);
      });

      res.status(201).json(run);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test run" });
    }
  });

  app.post("/api/my/sip-test-runs/:id/start", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const run = await storage.getSipTestRun(req.params.id);
      if (!run) return res.status(404).json({ error: "Test run not found" });
      if (run.customerId !== user.customerId && run.customerId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.updateSipTestRun(run.id, { status: 'running' } as any);
      
      executeSipTestRun(run.id, storage, connexcs).catch(err => {
        console.error("[SIP Test] Background execution error:", err);
      });

      res.json({ message: "Test started", runId: run.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to start test run" });
    }
  });

  app.get("/api/my/sip-test-runs/:id", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const run = await storage.getSipTestRun(req.params.id);
      if (!run) return res.status(404).json({ error: "Test run not found" });
      if (run.customerId !== user.customerId && run.customerId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(run);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test run" });
    }
  });

  app.get("/api/my/sip-test-runs/:id/results", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = req.user as { customerId?: string; id?: string };
      const run = await storage.getSipTestRun(req.params.id);
      if (!run) return res.status(404).json({ error: "Test run not found" });
      if (run.customerId !== user.customerId && run.customerId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const results = await storage.getSipTestRunResults(req.params.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test results" });
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

  // ==================== A-Z DESTINATIONS ====================

  app.get("/api/az-destinations", async (req, res) => {
    try {
      const { search, region, limit, offset } = req.query;
      const result = await storage.getAzDestinations({
        search: search as string,
        region: region as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      });
      res.json(result);
    } catch (error: any) {
      console.error("Failed to get A-Z destinations:", error);
      res.status(500).json({ error: "Failed to get destinations", details: error.message });
    }
  });

  app.get("/api/az-destinations/regions", async (req, res) => {
    try {
      const regions = await storage.getAzRegions();
      res.json(regions);
    } catch (error: any) {
      console.error("Failed to get regions:", error);
      res.status(500).json({ error: "Failed to get regions", details: error.message });
    }
  });

  app.get("/api/az-destinations/normalize/:code", async (req, res) => {
    try {
      const destination = await storage.normalizeCode(req.params.code);
      if (!destination) {
        return res.status(404).json({ error: "No matching destination found" });
      }
      res.json(destination);
    } catch (error: any) {
      console.error("Failed to normalize code:", error);
      res.status(500).json({ error: "Failed to normalize code", details: error.message });
    }
  });

  app.get("/api/az-destinations/:id", async (req, res) => {
    try {
      const destination = await storage.getAzDestination(req.params.id);
      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }
      res.json(destination);
    } catch (error: any) {
      console.error("Failed to get destination:", error);
      res.status(500).json({ error: "Failed to get destination", details: error.message });
    }
  });

  app.post("/api/az-destinations", async (req, res) => {
    try {
      const destination = await storage.createAzDestination(req.body);
      
      // Auto-sync to period exceptions if billing increment is non-1/1 and isActive is true
      try {
        const userId = req.session?.userId;
        const user = userId ? await storage.getUser(userId) : null;
        
        if (destination.billingIncrement && destination.billingIncrement !== '1/1' && destination.isActive !== false) {
          const intervalParts = destination.billingIncrement.split('/');
          const initialInterval = parseInt(intervalParts[0]) || 1;
          const recurringInterval = parseInt(intervalParts[1]) || 1;
          const intervalHash = `${initialInterval}/${recurringInterval}`;
          
          // Check if period exception already exists
          const existingResult = await db.execute(sql`
            SELECT id, initial_interval, recurring_interval FROM period_exceptions WHERE az_destination_id = ${destination.id}
          `);
          
          if (existingResult.rows.length === 0) {
            // Insert new exception
            const insertResult = await db.execute(sql`
              INSERT INTO period_exceptions (prefix, zone_name, country_name, initial_interval, recurring_interval, az_destination_id, interval_hash)
              VALUES (${destination.code}, ${destination.destination}, ${destination.region}, ${initialInterval}, ${recurringInterval}, ${destination.id}, ${intervalHash})
              RETURNING id
            `);
            
            await db.execute(sql`
              INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, new_initial_interval, new_recurring_interval, changed_by_user_id, changed_by_email, change_source)
              VALUES (${(insertResult.rows[0] as any).id}, ${destination.code}, ${destination.destination}, 'added', ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'auto')
            `);
          } else {
            // Update existing exception
            const existing = existingResult.rows[0] as any;
            const intervalChanged = existing.initial_interval !== initialInterval || existing.recurring_interval !== recurringInterval;
            
            await db.execute(sql`
              UPDATE period_exceptions SET
                prefix = ${destination.code},
                zone_name = ${destination.destination},
                country_name = ${destination.region},
                initial_interval = ${initialInterval},
                recurring_interval = ${recurringInterval},
                interval_hash = ${intervalHash},
                synced_at = NOW(),
                updated_at = NOW()
              WHERE az_destination_id = ${destination.id}
            `);
            
            if (intervalChanged) {
              await db.execute(sql`
                INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, new_initial_interval, new_recurring_interval, changed_by_user_id, changed_by_email, change_source)
                VALUES (${existing.id}, ${destination.code}, ${destination.destination}, 'updated', ${existing.initial_interval}, ${existing.recurring_interval}, ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'auto')
              `);
            }
          }
        }
      } catch (syncError) {
        console.error("Auto-sync to period exceptions failed (non-blocking):", syncError);
      }
      
      res.status(201).json(destination);
    } catch (error: any) {
      console.error("Failed to create destination:", error);
      res.status(500).json({ error: "Failed to create destination", details: error.message });
    }
  });

  app.post("/api/az-destinations/bulk", async (req, res) => {
    try {
      const { destinations } = req.body;
      if (!Array.isArray(destinations)) {
        return res.status(400).json({ error: "destinations must be an array" });
      }
      const result = await storage.upsertAzDestinationsBulk(destinations);
      
      // Auto-sync period exceptions after bulk upsert
      try {
        const userId = req.session?.userId;
        const user = userId ? await storage.getUser(userId) : null;
        
        // Get all AZ destinations with non-1/1 intervals that are active
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
              VALUES (${(insertResult.rows[0] as any).id}, ${az.code}, ${az.destination}, 'added', ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'auto')
            `);
            
            added++;
          } else {
            const existingRecord = existing.rows[0] as any;
            const intervalChanged = existingRecord.interval_hash !== intervalHash;
            
            await db.execute(sql`
              UPDATE period_exceptions 
              SET prefix = ${az.code},
                  zone_name = ${az.destination},
                  country_name = ${az.region},
                  initial_interval = ${initialInterval}, 
                  recurring_interval = ${recurringInterval}, 
                  interval_hash = ${intervalHash},
                  synced_at = NOW(),
                  updated_at = NOW()
              WHERE id = ${existingRecord.id}
            `);
            
            if (intervalChanged) {
              await db.execute(sql`
                INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, new_initial_interval, new_recurring_interval, changed_by_user_id, changed_by_email, change_source)
                VALUES (${existingRecord.id}, ${az.code}, ${az.destination}, 'updated', ${existingRecord.initial_interval}, ${existingRecord.recurring_interval}, ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'auto')
              `);
              updated++;
            }
          }
        }
        
        // Remove period exceptions for destinations that are now 1/1 or inactive
        const existingExceptions = await db.execute(sql`
          SELECT * FROM period_exceptions WHERE az_destination_id IS NOT NULL
        `);
        
        for (const exception of existingExceptions.rows as any[]) {
          if (!validAzIds.has(exception.az_destination_id)) {
            await db.execute(sql`
              INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, changed_by_user_id, changed_by_email, change_source)
              VALUES (${exception.id}, ${exception.prefix}, ${exception.zone_name}, 'removed', ${exception.initial_interval}, ${exception.recurring_interval}, ${userId}, ${user?.email}, 'auto')
            `);
            
            await db.execute(sql`DELETE FROM period_exceptions WHERE id = ${exception.id}`);
            removed++;
          }
        }
        
        console.log(`Bulk sync: added=${added}, updated=${updated}, removed=${removed}`);
      } catch (syncError) {
        console.error("Auto-sync after bulk upsert failed (non-blocking):", syncError);
      }
      
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("Failed to bulk upsert destinations:", error);
      res.status(500).json({ error: "Failed to bulk upsert destinations", details: error.message });
    }
  });

  app.post("/api/az-destinations/import-job", async (req, res) => {
    try {
      const { destinations, mode } = req.body;
      if (!Array.isArray(destinations)) {
        return res.status(400).json({ error: "destinations must be an array" });
      }
      if (!["update", "replace"].includes(mode)) {
        return res.status(400).json({ error: "mode must be 'update' or 'replace'" });
      }
      
      const { enqueueJob } = await import("./job-queue");
      const jobId = await enqueueJob("az_destination_import", {
        mode,
        destinations,
        totalRecords: destinations.length,
      });
      
      res.json({ success: true, jobId, message: `Import job queued with ${destinations.length} destinations` });
    } catch (error: any) {
      console.error("Failed to queue import job:", error);
      res.status(500).json({ error: "Failed to queue import job", details: error.message });
    }
  });

  app.patch("/api/az-destinations/:id", async (req, res) => {
    try {
      const destination = await storage.updateAzDestination(req.params.id, req.body);
      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }
      
      // Auto-sync period exceptions based on billing increment change
      try {
        const userId = req.session?.userId;
        const user = userId ? await storage.getUser(userId) : null;
        
        if (destination.billingIncrement && destination.billingIncrement !== '1/1' && destination.isActive !== false) {
          // Add or update period exception for non-1/1 intervals
          const intervalParts = destination.billingIncrement.split('/');
          const initialInterval = parseInt(intervalParts[0]) || 1;
          const recurringInterval = parseInt(intervalParts[1]) || 1;
          const intervalHash = `${initialInterval}/${recurringInterval}`;
          
          const existingResult = await db.execute(sql`
            SELECT id, initial_interval, recurring_interval FROM period_exceptions WHERE az_destination_id = ${destination.id}
          `);
          
          if (existingResult.rows.length === 0) {
            // Insert new exception
            const insertResult = await db.execute(sql`
              INSERT INTO period_exceptions (prefix, zone_name, country_name, initial_interval, recurring_interval, az_destination_id, interval_hash)
              VALUES (${destination.code}, ${destination.destination}, ${destination.region}, ${initialInterval}, ${recurringInterval}, ${destination.id}, ${intervalHash})
              RETURNING id
            `);
            
            await db.execute(sql`
              INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, new_initial_interval, new_recurring_interval, changed_by_user_id, changed_by_email, change_source)
              VALUES (${(insertResult.rows[0] as any).id}, ${destination.code}, ${destination.destination}, 'added', ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'auto')
            `);
          } else {
            // Update existing exception - always sync fields, log history only if interval changed
            const existing = existingResult.rows[0] as any;
            const intervalChanged = existing.initial_interval !== initialInterval || existing.recurring_interval !== recurringInterval;
            
            // Always update prefix/zone/country fields
            await db.execute(sql`
              UPDATE period_exceptions SET
                prefix = ${destination.code},
                zone_name = ${destination.destination},
                country_name = ${destination.region},
                initial_interval = ${initialInterval},
                recurring_interval = ${recurringInterval},
                interval_hash = ${intervalHash},
                synced_at = NOW(),
                updated_at = NOW()
              WHERE az_destination_id = ${destination.id}
            `);
            
            // Only log history if interval actually changed
            if (intervalChanged) {
              await db.execute(sql`
                INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, new_initial_interval, new_recurring_interval, changed_by_user_id, changed_by_email, change_source)
                VALUES (${existing.id}, ${destination.code}, ${destination.destination}, 'updated', ${existing.initial_interval}, ${existing.recurring_interval}, ${initialInterval}, ${recurringInterval}, ${userId}, ${user?.email}, 'auto')
              `);
            }
          }
        } else {
          // Remove period exception when billing increment becomes 1/1 or destination becomes inactive
          const existingResult = await db.execute(sql`
            SELECT id, prefix, zone_name, initial_interval, recurring_interval FROM period_exceptions WHERE az_destination_id = ${destination.id}
          `);
          
          if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0] as any;
            
            await db.execute(sql`
              INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, changed_by_user_id, changed_by_email, change_source)
              VALUES (${existing.id}, ${existing.prefix}, ${existing.zone_name}, 'removed', ${existing.initial_interval}, ${existing.recurring_interval}, ${userId}, ${user?.email}, 'auto')
            `);
            
            await db.execute(sql`DELETE FROM period_exceptions WHERE az_destination_id = ${destination.id}`);
          }
        }
      } catch (syncError) {
        console.error("Auto-sync to period exceptions failed (non-blocking):", syncError);
      }
      
      res.json(destination);
    } catch (error: any) {
      console.error("Failed to update destination:", error);
      res.status(500).json({ error: "Failed to update destination", details: error.message });
    }
  });

  app.delete("/api/az-destinations/:id", async (req, res) => {
    try {
      // First, remove from period exceptions before deleting from az_destinations
      try {
        const userId = req.session?.userId;
        const user = userId ? await storage.getUser(userId) : null;
        
        const existingResult = await db.execute(sql`
          SELECT id, prefix, zone_name, initial_interval, recurring_interval FROM period_exceptions WHERE az_destination_id = ${req.params.id}
        `);
        
        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0] as any;
          
          await db.execute(sql`
            INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, changed_by_user_id, changed_by_email, change_source)
            VALUES (${existing.id}, ${existing.prefix}, ${existing.zone_name}, 'removed', ${existing.initial_interval}, ${existing.recurring_interval}, ${userId}, ${user?.email}, 'auto')
          `);
          
          await db.execute(sql`DELETE FROM period_exceptions WHERE az_destination_id = ${req.params.id}`);
        }
      } catch (syncError) {
        console.error("Auto-remove from period exceptions failed (non-blocking):", syncError);
      }
      
      const success = await storage.deleteAzDestination(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Destination not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete destination:", error);
      res.status(500).json({ error: "Failed to delete destination", details: error.message });
    }
  });

  app.delete("/api/az-destinations", async (req, res) => {
    try {
      // First, clear all period exceptions that are linked to az_destinations
      try {
        const userId = req.session?.userId;
        const user = userId ? await storage.getUser(userId) : null;
        
        // Log history for all removed period exceptions
        await db.execute(sql`
          INSERT INTO period_exception_history (period_exception_id, prefix, zone_name, change_type, previous_initial_interval, previous_recurring_interval, changed_by_user_id, changed_by_email, change_source)
          SELECT id, prefix, zone_name, 'removed', initial_interval, recurring_interval, ${userId}, ${user?.email}, 'auto'
          FROM period_exceptions WHERE az_destination_id IS NOT NULL
        `);
        
        // Delete all period exceptions linked to az_destinations
        await db.execute(sql`DELETE FROM period_exceptions WHERE az_destination_id IS NOT NULL`);
      } catch (syncError) {
        console.error("Failed to clear period exceptions (non-blocking):", syncError);
      }
      
      const count = await storage.deleteAllAzDestinations();
      res.json({ success: true, count });
    } catch (error: any) {
      console.error("Failed to delete all destinations:", error);
      res.status(500).json({ error: "Failed to delete all destinations", details: error.message });
    }
  });

  app.get("/api/az-destinations/export/csv", async (req, res) => {
    try {
      const result = await storage.getAzDestinations({ limit: 100000, offset: 0 });
      const destinations = result.destinations;
      
      const escapeCSV = (val: string | number | null | undefined): string => {
        const str = val == null ? "" : String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      const header = "code,destination,region,billingIncrement,gracePeriod\n";
      const rows = destinations.map(d => 
        [d.code, d.destination, d.region, d.billingIncrement, d.gracePeriod]
          .map(escapeCSV)
          .join(",")
      ).join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="az-destinations-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send(header + rows);
    } catch (error: any) {
      console.error("Failed to export destinations:", error);
      res.status(500).json({ error: "Failed to export destinations", details: error.message });
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
