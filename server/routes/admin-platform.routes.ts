import type { Express } from "express";
import { storage } from "../storage";
import {
  insertClass4CustomerSchema,
  insertClass4CarrierSchema,
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
} from "@shared/schema";
import { aiService } from "../ai-service";

export function registerAdminPlatformRoutes(app: Express): void {
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
}
