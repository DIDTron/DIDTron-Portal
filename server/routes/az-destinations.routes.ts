import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerAzDestinationsRoutes(app: Express): void {
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
      
      const { enqueueJob } = await import("../job-queue");
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
}
