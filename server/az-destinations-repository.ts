import { db } from "./db";
import { azDestinations, type AzDestination, type InsertAzDestination } from "@shared/schema";
import { eq, ilike, or, sql, desc, count, inArray } from "drizzle-orm";

export const azDestinationsRepository = {
  async getDestinations(options?: {
    search?: string;
    region?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ destinations: AzDestination[]; total: number }> {
    const { search, region, limit = 50, offset = 0 } = options || {};

    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          ilike(azDestinations.code, `${search}%`),
          ilike(azDestinations.destination, `%${search}%`)
        )
      );
    }
    
    if (region) {
      whereConditions.push(eq(azDestinations.region, region));
    }

    const whereClause = whereConditions.length > 0 
      ? sql`${whereConditions.reduce((acc, cond, i) => i === 0 ? cond : sql`${acc} AND ${cond}`, sql`TRUE`)}`
      : undefined;

    const [destinations, totalResult] = await Promise.all([
      db.select()
        .from(azDestinations)
        .where(whereClause)
        .orderBy(azDestinations.code)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(azDestinations)
        .where(whereClause)
    ]);

    return {
      destinations,
      total: totalResult[0]?.count || 0
    };
  },

  async getDestination(id: string): Promise<AzDestination | undefined> {
    const result = await db.select().from(azDestinations).where(eq(azDestinations.id, id));
    return result[0];
  },

  async getDestinationByCode(code: string): Promise<AzDestination | undefined> {
    const result = await db.select().from(azDestinations).where(eq(azDestinations.code, code));
    return result[0];
  },

  async createDestination(dest: InsertAzDestination): Promise<AzDestination> {
    const result = await db.insert(azDestinations).values(dest).returning();
    return result[0];
  },

  async createDestinationsBulk(dests: InsertAzDestination[]): Promise<number> {
    if (dests.length === 0) return 0;
    
    const batchSize = 500;
    let inserted = 0;
    
    for (let i = 0; i < dests.length; i += batchSize) {
      const batch = dests.slice(i, i + batchSize);
      await db.insert(azDestinations).values(batch);
      inserted += batch.length;
    }
    
    return inserted;
  },

  async upsertDestinationsBulk(dests: InsertAzDestination[]): Promise<{ inserted: number; updated: number; skipped: number }> {
    if (dests.length === 0) return { inserted: 0, updated: 0, skipped: 0 };
    
    const uniqueDests = new Map<string, InsertAzDestination>();
    for (const d of dests) {
      uniqueDests.set(d.code, d);
    }
    const dedupedDests = Array.from(uniqueDests.values());
    const skippedDuplicates = dests.length - dedupedDests.length;
    
    const codes = dedupedDests.map(d => d.code);
    const batchSize = 500;
    const existingCodes = new Set<string>();
    
    for (let i = 0; i < codes.length; i += batchSize) {
      const batch = codes.slice(i, i + batchSize);
      const existing = await db.select({ code: azDestinations.code })
        .from(azDestinations)
        .where(inArray(azDestinations.code, batch));
      existing.forEach(e => existingCodes.add(e.code));
    }
    
    const toInsert = dedupedDests.filter(d => !existingCodes.has(d.code));
    const toUpdate = dedupedDests.filter(d => existingCodes.has(d.code));
    
    let inserted = 0;
    let updated = 0;
    
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      await db.insert(azDestinations).values(batch);
      inserted += batch.length;
    }
    
    for (const dest of toUpdate) {
      await db.update(azDestinations)
        .set({ 
          destination: dest.destination, 
          region: dest.region,
          billingIncrement: dest.billingIncrement,
          connectionFee: dest.connectionFee,
          gracePeriod: dest.gracePeriod,
          isActive: dest.isActive,
          updatedAt: new Date() 
        })
        .where(eq(azDestinations.code, dest.code));
      updated++;
    }
    
    return { inserted, updated, skipped: skippedDuplicates };
  },

  async updateDestination(id: string, data: Partial<InsertAzDestination>): Promise<AzDestination | undefined> {
    const result = await db.update(azDestinations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(azDestinations.id, id))
      .returning();
    return result[0];
  },

  async deleteDestination(id: string): Promise<boolean> {
    const result = await db.delete(azDestinations).where(eq(azDestinations.id, id)).returning();
    return result.length > 0;
  },

  async deleteAllDestinations(): Promise<number> {
    const result = await db.delete(azDestinations).returning();
    return result.length;
  },

  async getRegions(): Promise<string[]> {
    const result = await db.selectDistinct({ region: azDestinations.region })
      .from(azDestinations)
      .where(sql`${azDestinations.region} IS NOT NULL`)
      .orderBy(azDestinations.region);
    return result.map(r => r.region).filter((r): r is string => r !== null);
  },

  async normalizeCode(dialCode: string): Promise<AzDestination | undefined> {
    const prefixes: string[] = [];
    for (let i = dialCode.length; i > 0; i--) {
      prefixes.push(dialCode.slice(0, i));
    }
    
    if (prefixes.length === 0) return undefined;
    
    const result = await db.select()
      .from(azDestinations)
      .where(sql`${azDestinations.code} IN (${sql.join(prefixes.map(p => sql`${p}`), sql`, `)})`)
      .orderBy(sql`LENGTH(${azDestinations.code}) DESC`)
      .limit(1);
    
    return result[0];
  }
};
