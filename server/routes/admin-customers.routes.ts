import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { supplierImportTemplates } from "@shared/schema";
import { eq, asc } from "drizzle-orm";
import {
  insertCustomerCategorySchema,
  insertCustomerGroupSchema,
  insertSupplierImportTemplateSchema,
  insertBillingTermSchema,
  updateBillingTermSchema,
} from "@shared/schema";
import { invalidateCache } from "../services/cache";
import { connexcs } from "../connexcs";

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

export function registerAdminCustomersRoutes(app: Express): void {
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

  // ==================== BILLING TERMS (MUTATIONS ONLY) ====================

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

  // ==================== INVOICES (MUTATIONS ONLY) ====================

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

  // ==================== PAYMENTS (MUTATIONS ONLY) ====================

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
}
