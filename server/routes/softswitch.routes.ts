import type { Express } from "express";
import { storage } from "../storage";
import { connexcs } from "../connexcs";
import { invalidateCache } from "../services/cache";
import { auditService } from "../audit";
import {
  insertCarrierSchema,
  insertCarrierAssignmentSchema,
  insertCarrierInterconnectSchema,
  insertCarrierServiceSchema,
  insertServiceMatchListSchema,
  insertCarrierContactSchema,
  insertCarrierCreditAlertSchema,
  insertCustomerRatingPlanSchema,
  insertInterconnectIpAddressSchema,
  insertInterconnectValidationSettingsSchema,
  insertInterconnectTranslationSettingsSchema,
  insertInterconnectCodecSchema,
  insertInterconnectMediaSettingsSchema,
  insertInterconnectSignallingSettingsSchema,
  insertInterconnectMonitoringSettingsSchema,
} from "@shared/schema";

export function registerSoftswitchRoutes(app: Express) {
  // ==================== CARRIERS ====================

  app.get("/api/carriers", async (req, res) => {
    try {
      const { parseCursorParams, buildCursorResponse } = await import("../utils/pagination");
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
      const { parseCursorParams, buildCursorResponse } = await import("../utils/pagination");
      const { cursor, limit } = parseCursorParams({
        cursor: req.query.cursor as string,
        limit: parseInt(req.query.limit as string) || 50,
        maxLimit: 100,
      });
      
      const results = await storage.getCustomerRatingPlansWithCursor(cursor, limit + 1);
      const response = buildCursorResponse(results, limit);
      res.json(response);
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
      
      const { parseCursorParams, buildCursorResponse } = await import("../utils/pagination");
      const { cursor, limit } = parseCursorParams({
        cursor: req.query.cursor as string,
        limit: parseInt(req.query.limit as string) || 100,
        maxLimit: 500,
      });
      
      const results = await storage.getRatingPlanRatesWithCursor(plan.id, cursor, limit + 1);
      const response = buildCursorResponse(results, limit);
      res.json(response);
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
      const { parseCursorParams, buildCursorResponse } = await import("../utils/pagination");
      const { cursor, limit } = parseCursorParams({
        cursor: req.query.cursor as string,
        limit: parseInt(req.query.limit as string) || 50,
        maxLimit: 100,
      });
      
      const results = await storage.getSupplierRatingPlansWithCursor(cursor, limit + 1);
      const response = buildCursorResponse(results, limit);
      res.json(response);
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
      
      const { parseCursorParams, buildCursorResponse } = await import("../utils/pagination");
      const { cursor, limit } = parseCursorParams({
        cursor: req.query.cursor as string,
        limit: parseInt(req.query.limit as string) || 100,
        maxLimit: 500,
      });
      
      const results = await storage.getSupplierRatingPlanRatesWithCursor(plan.id, cursor, limit + 1);
      const response = buildCursorResponse(results, limit);
      res.json(response);
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
}
