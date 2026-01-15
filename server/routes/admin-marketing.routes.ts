import type { Express } from "express";
import { storage } from "../storage";
import {
  insertEmailTemplateSchema,
  insertSocialAccountSchema,
  insertSocialPostSchema,
} from "@shared/schema";
import { aiService } from "../ai-service";

export function registerAdminMarketingRoutes(app: Express): void {
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
      const { brevoService, defaultEmailTemplates } = await import("../brevo");
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
      const { brevoService } = await import("../brevo");
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
}
