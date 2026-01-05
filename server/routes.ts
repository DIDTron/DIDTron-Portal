import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createUser, validateLogin, sanitizeUser } from "./auth";
import { aiService } from "./ai-service";
import { connexcs } from "./connexcs";
import { auditService } from "./audit";
import { sendWelcomeEmail, sendPaymentReceived, sendReferralReward, sendLowBalanceAlert } from "./brevo";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
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
  insertIntegrationSchema,
  insertBonusTypeSchema,
  insertPromoCodeSchema,
  insertEmailTemplateSchema,
  insertSocialAccountSchema,
  insertSocialPostSchema
} from "@shared/schema";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  customerType: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== REPLIT AUTH (OIDC) ====================
  await setupAuth(app);
  registerAuthRoutes(app);

  // ==================== LEGACY AUTHENTICATION ====================

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const existingUser = await storage.getUserByEmail(parsed.data.email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const user = await createUser(parsed.data);
      req.session.userId = user.id;
      
      // Create a Customer record for this user with auto-generated account number
      const accountNumber = `CUST-${Date.now().toString(36).toUpperCase()}`;
      const companyName = parsed.data.companyName || `${parsed.data.firstName || ''} ${parsed.data.lastName || ''}`.trim() || parsed.data.email.split('@')[0];
      
      try {
        const customer = await storage.createCustomer({
          accountNumber,
          companyName,
          billingEmail: parsed.data.email,
          status: "pending_approval",
        });
        
        // Link user to customer
        await storage.updateUser(user.id, { customerId: customer.id } as any);
        
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
            console.log(`[ConnexCS] New registration synced: ${customer.companyName} -> ${syncResult.connexcsId}`);
          }
        } catch (syncError) {
          console.error("[ConnexCS] Auto-sync registration failed:", syncError);
        }
        
        // Send welcome email
        try {
          await sendWelcomeEmail(storage, {
            email: parsed.data.email,
            firstName: parsed.data.firstName || parsed.data.email.split('@')[0],
            lastName: parsed.data.lastName || '',
            loginUrl: `${req.protocol}://${req.get('host')}/portal`,
          });
          console.log(`[Brevo] Welcome email sent to ${parsed.data.email}`);
        } catch (emailError) {
          console.error("[Brevo] Failed to send welcome email:", emailError);
        }
      } catch (customerError) {
        console.error("Failed to create customer record:", customerError);
      }
      
      res.status(201).json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      const user = await validateLogin(parsed.data.email, parsed.data.password);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Failed to check authentication" });
    }
  });

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
            email: customer.email,
            firstName: customer.firstName || "Customer",
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

  // Admin: Get all referrals
  app.get("/api/admin/referrals", async (req, res) => {
    try {
      const referrals = await storage.getReferrals();
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
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
      const { accountNumber, companyName, ...rest } = req.body;
      if (!accountNumber || !companyName) {
        return res.status(400).json({ error: "accountNumber and companyName are required" });
      }
      const customer = await storage.createCustomer({ accountNumber, companyName, ...rest });
      
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

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Customer not found" });
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
      res.status(201).json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to create KYC request" });
    }
  });

  app.patch("/api/kyc/:id", async (req, res) => {
    try {
      const kyc = await storage.updateCustomerKyc(req.params.id, req.body);
      if (!kyc) return res.status(404).json({ error: "KYC request not found" });
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
      const customerId = req.query.customerId as string | undefined;
      const invoices = await storage.getInvoices(customerId);
      res.json(invoices);
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
            sipHost: carrier.sipHost,
            sipPort: carrier.sipPort,
          });
          if (syncResult.connexcsId) {
            await storage.updateCarrier(carrier.id, { connexcsCarrierId: syncResult.connexcsId });
          }
          console.log(`[ConnexCS] Carrier ${carrier.name} synced: ${syncResult.connexcsId}`);
        }
      } catch (syncError) {
        console.error("[ConnexCS] Auto-sync carrier failed:", syncError);
      }
      
      res.status(201).json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to create carrier" });
    }
  });

  app.patch("/api/carriers/:id", async (req, res) => {
    try {
      const oldCarrier = await storage.getCarrier(req.params.id);
      const carrier = await storage.updateCarrier(req.params.id, req.body);
      if (!carrier) return res.status(404).json({ error: "Carrier not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update",
        tableName: "carriers",
        recordId: req.params.id,
        oldValues: oldCarrier,
        newValues: carrier,
      });
      res.json(carrier);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier" });
    }
  });

  app.delete("/api/carriers/:id", async (req, res) => {
    try {
      const oldCarrier = await storage.getCarrier(req.params.id);
      const deleted = await storage.deleteCarrier(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Carrier not found" });
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "delete",
        tableName: "carriers",
        recordId: req.params.id,
        oldValues: oldCarrier,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carrier" });
    }
  });

  // Carrier Assignments
  app.get("/api/carriers/:id/assignment", async (req, res) => {
    try {
      const assignment = await storage.getCarrierAssignment(req.params.id);
      res.json(assignment || { carrierId: req.params.id, assignmentType: "all", categoryIds: [], groupIds: [], customerIds: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carrier assignment" });
    }
  });

  app.put("/api/carriers/:id/assignment", async (req, res) => {
    try {
      const parsed = insertCarrierAssignmentSchema.safeParse({ ...req.body, carrierId: req.params.id });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
      const assignment = await storage.upsertCarrierAssignment(parsed.data);
      await storage.createAuditLog({
        userId: req.session?.userId,
        action: "update_assignment",
        tableName: "carrier_assignments",
        recordId: req.params.id,
        newValues: assignment,
      });
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update carrier assignment" });
    }
  });

  // Audit Logs
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const { tableName, recordId, limit } = req.query;
      const logs = await storage.getAuditLogs(
        tableName as string | undefined,
        recordId as string | undefined,
        limit ? parseInt(limit as string) : 50
      );
      res.json(logs);
    } catch (error) {
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

  // ==================== CONNEXCS SYNC ====================

  app.get("/api/connexcs/status", async (req, res) => {
    try {
      const mockMode = connexcs.isMockMode();
      const metrics = await connexcs.getMetrics();
      res.json({ mockMode, connected: !mockMode, metrics });
    } catch (error) {
      console.error("ConnexCS status error:", error);
      res.status(500).json({ error: "Failed to get ConnexCS status", mockMode: true });
    }
  });

  app.get("/api/connexcs/carriers", async (req, res) => {
    try {
      const carriers = await connexcs.getCarriers();
      res.json(carriers);
    } catch (error) {
      console.error("ConnexCS carriers error:", error);
      res.status(500).json({ error: "Failed to fetch ConnexCS carriers" });
    }
  });

  app.get("/api/connexcs/routes", async (req, res) => {
    try {
      const routes = await connexcs.getRoutes();
      res.json(routes);
    } catch (error) {
      console.error("ConnexCS routes error:", error);
      res.status(500).json({ error: "Failed to fetch ConnexCS routes" });
    }
  });

  app.get("/api/connexcs/metrics", async (req, res) => {
    try {
      const metrics = await connexcs.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("ConnexCS metrics error:", error);
      res.status(500).json({ error: "Failed to fetch ConnexCS metrics" });
    }
  });

  app.post("/api/connexcs/sync-carrier/:id", async (req, res) => {
    try {
      const carrier = await storage.getCarrier(req.params.id);
      if (!carrier) {
        return res.status(404).json({ error: "Carrier not found" });
      }
      const result = await connexcs.syncCarrier({
        id: carrier.id,
        name: carrier.name,
        sipHost: carrier.sipHost,
        sipPort: carrier.sipPort,
      });
      if (result.synced) {
        await storage.updateCarrier(carrier.id, { connexcsCarrierId: result.connexcsId });
      }
      res.json(result);
    } catch (error) {
      console.error("ConnexCS sync carrier error:", error);
      res.status(500).json({ error: "Failed to sync carrier with ConnexCS" });
    }
  });

  app.post("/api/connexcs/sync-route/:id", async (req, res) => {
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
      res.json(result);
    } catch (error) {
      console.error("ConnexCS sync route error:", error);
      res.status(500).json({ error: "Failed to sync route with ConnexCS" });
    }
  });

  app.post("/api/connexcs/test-route", async (req, res) => {
    try {
      const { destination } = req.body;
      if (!destination) {
        return res.status(400).json({ error: "destination is required" });
      }
      const result = await connexcs.testRoute(destination);
      res.json(result);
    } catch (error) {
      console.error("ConnexCS test route error:", error);
      res.status(500).json({ error: "Failed to test route" });
    }
  });

  // ==================== AUDIT LOGS ====================

  app.get("/api/audit/logs", async (req, res) => {
    try {
      const { limit, entityType, entityId, userId, search } = req.query;
      
      let logs;
      if (search) {
        logs = auditService.searchLogs(String(search));
      } else if (entityType) {
        logs = auditService.getLogsByEntity(String(entityType), entityId ? String(entityId) : undefined);
      } else if (userId) {
        logs = auditService.getLogsByUser(String(userId));
      } else {
        logs = auditService.getRecentLogs(limit ? parseInt(String(limit)) : 100);
      }
      
      res.json(logs);
    } catch (error) {
      console.error("Audit logs error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
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
      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ error: "Failed to create DID provider" });
    }
  });

  app.patch("/api/did-providers/:id", async (req, res) => {
    try {
      const provider = await storage.updateDidProvider(req.params.id, req.body);
      if (!provider) return res.status(404).json({ error: "DID provider not found" });
      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: "Failed to update DID provider" });
    }
  });

  app.delete("/api/did-providers/:id", async (req, res) => {
    try {
      await storage.deleteDidProvider(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete DID provider" });
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
              const response = await fetch("https://app.connexcs.com/api/cp/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: creds.username, password: creds.password })
              });
              if (response.ok) {
                testResult = { success: true, message: "Connected successfully" };
              } else {
                testResult = { success: false, message: `Authentication failed: ${response.status}` };
              }
            } catch (e) {
              testResult = { success: false, message: "Connection failed" };
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
          
        case "stripe":
        case "paypal":
        case "ayrshare":
        case "openexchangerates":
        case "cloudflare_r2":
        case "upstash_redis":
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

  return httpServer;
}
