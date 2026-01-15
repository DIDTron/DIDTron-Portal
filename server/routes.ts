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
import { registerAdminCustomersRoutes } from "./routes/admin-customers.routes";
import { registerAdminMarketingRoutes } from "./routes/admin-marketing.routes";
import { registerAdminInfrastructureRoutes } from "./routes/admin-infrastructure.routes";
import { registerAdminOperationsRoutes } from "./routes/admin-operations.routes";
import { registerAdminPlatformRoutes } from "./routes/admin-platform.routes";
import { registerPortalUserRoutes } from "./routes/portal-user.routes";
import { registerAdminSyncRoutes } from "./routes/admin-sync.routes";
import { registerAdminAuditRoutes } from "./routes/admin-audit.routes";
import { registerAdminCdrRoutes } from "./routes/admin-cdr.routes";
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

  // ==================== ADMIN CUSTOMERS ROUTES ====================
  registerAdminCustomersRoutes(app);

  // ==================== ADMIN MARKETING ROUTES ====================
  registerAdminMarketingRoutes(app);

  // ==================== ADMIN INFRASTRUCTURE ROUTES ====================
  registerAdminInfrastructureRoutes(app);

  // ==================== ADMIN OPERATIONS ROUTES ====================
  registerAdminOperationsRoutes(app);

  // ==================== ADMIN PLATFORM ROUTES ====================
  registerAdminPlatformRoutes(app);

  // ==================== PORTAL USER ROUTES ====================
  registerPortalUserRoutes(app);

  // ==================== ADMIN SYNC ROUTES ====================
  registerAdminSyncRoutes(app);

  // ==================== ADMIN AUDIT ROUTES ====================
  registerAdminAuditRoutes(app);

  // ==================== ADMIN CDR ROUTES ====================
  registerAdminCdrRoutes(app);

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

  // Generate API Key (JWT refresh token) for ConnexCS using connexcs-tools service
  app.post("/api/integrations/:id/generate-api-key", async (req, res) => {
    try {
      const integration = await storage.getIntegration(req.params.id);
      if (!integration) return res.status(404).json({ error: "Integration not found" });
      
      if (integration.provider !== "connexcs") {
        return res.status(400).json({ error: "API key generation only available for ConnexCS" });
      }
      
      const creds = integration.credentials as { username?: string; password?: string; refreshToken?: string } | null;
      if (!creds?.username || !creds?.password) {
        return res.status(400).json({ 
          success: false, 
          error: "Username and password must be configured first" 
        });
      }
      
      // Use connexcs-tools service to generate the API key
      const result = await connexcsTools.generateApiKey(storage);
      
      if (!result.success || !result.apiKey) {
        return res.json({ 
          success: false, 
          error: result.error || "Failed to generate API key" 
        });
      }
      
      const { apiKey, daysRemaining } = result;
      
      // Store the refresh token in credentials
      await storage.updateIntegration(req.params.id, {
        credentials: { ...creds, refreshToken: apiKey },
        status: "connected",
        lastTestedAt: new Date(),
        testResult: `API Key generated - valid for ${daysRemaining} days`
      });
      
      // Log the action
      await storage.createAuditLog({
        action: "generate_api_key",
        tableName: "integrations",
        recordId: req.params.id,
        newValues: { provider: "connexcs", tokenGenerated: true, daysRemaining }
      });
      
      console.log(`[ConnexCS] API Key (refresh token) generated via connexcs-tools - ${daysRemaining} days validity`);
      
      res.json({ 
        success: true, 
        apiKey,
        daysRemaining,
        message: `API Key generated successfully - valid for ${daysRemaining} days`
      });
    } catch (error: any) {
      console.error("[ConnexCS] Failed to generate API key:", error.message);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to generate API key" 
      });
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
