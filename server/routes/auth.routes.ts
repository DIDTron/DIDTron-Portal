import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { createUser, validateLogin, sanitizeUser } from "../auth";
import { connexcs } from "../connexcs";
import { auditService } from "../audit";
import { sendWelcomeEmail } from "../brevo";

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

export function registerLegacyAuthRoutes(app: Express) {
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
      
      const accountNumber = `CUST-${Date.now().toString(36).toUpperCase()}`;
      const companyName = parsed.data.companyName || `${parsed.data.firstName || ''} ${parsed.data.lastName || ''}`.trim() || parsed.data.email.split('@')[0];
      
      try {
        const customer = await storage.createCustomer({
          accountNumber,
          companyName,
          billingEmail: parsed.data.email,
          status: "pending_approval",
        });
        
        await storage.updateUser(user.id, { customerId: customer.id } as any);
        
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
      
      await auditService.createAuditLog({
        userId: user.id,
        action: "create",
        tableName: "users",
        recordId: user.id,
        newValues: { email: parsed.data.email, companyName: parsed.data.companyName },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });
      
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
        await auditService.createAuditLog({
          action: "login_failed",
          tableName: "users",
          newValues: { email: parsed.data.email },
          ipAddress: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"],
        });
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      await auditService.createAuditLog({
        userId: user.id,
        action: "login_success",
        tableName: "users",
        recordId: user.id,
        newValues: { email: user.email },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });
      
      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const userId = req.session.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.socket?.remoteAddress;
    
    req.session.destroy(async (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      
      try {
        await auditService.createAuditLog({
          userId,
          action: "logout",
          tableName: "users",
          recordId: userId,
          ipAddress,
          userAgent,
        });
      } catch (auditError) {
        console.error("Failed to log logout:", auditError);
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
}
