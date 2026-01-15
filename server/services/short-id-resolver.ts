import { db } from "../db";
import { eq } from "drizzle-orm";
import { carriers, carrierInterconnects, carrierServices, users, rateCards } from "@shared/schema";

export class ShortIdResolver {
  async getCarrierByShortId(shortId: number): Promise<{ id: string; shortId: number; code: string } | null> {
    const [carrier] = await db
      .select({ id: carriers.id, shortId: carriers.shortId, code: carriers.code })
      .from(carriers)
      .where(eq(carriers.shortId, shortId))
      .limit(1);
    return carrier || null;
  }

  async getCarrierByCodeOrShortId(identifier: string): Promise<{ id: string; shortId: number; code: string } | null> {
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum)) {
      const byShortId = await this.getCarrierByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    
    const [carrier] = await db
      .select({ id: carriers.id, shortId: carriers.shortId, code: carriers.code })
      .from(carriers)
      .where(eq(carriers.code, identifier))
      .limit(1);
    return carrier || null;
  }

  async getInterconnectByShortId(shortId: number): Promise<{ id: string; shortId: number; carrierId: string } | null> {
    const [interconnect] = await db
      .select({ id: carrierInterconnects.id, shortId: carrierInterconnects.shortId, carrierId: carrierInterconnects.carrierId })
      .from(carrierInterconnects)
      .where(eq(carrierInterconnects.shortId, shortId))
      .limit(1);
    return interconnect || null;
  }

  async getInterconnectByIdOrShortId(identifier: string): Promise<{ id: string; shortId: number; carrierId: string } | null> {
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum) && identifier === String(shortIdNum)) {
      const byShortId = await this.getInterconnectByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    
    const [interconnect] = await db
      .select({ id: carrierInterconnects.id, shortId: carrierInterconnects.shortId, carrierId: carrierInterconnects.carrierId })
      .from(carrierInterconnects)
      .where(eq(carrierInterconnects.id, identifier))
      .limit(1);
    return interconnect || null;
  }

  async getServiceByShortId(shortId: number): Promise<{ id: string; shortId: number; carrierId: string; interconnectId: string } | null> {
    const [service] = await db
      .select({ 
        id: carrierServices.id, 
        shortId: carrierServices.shortId, 
        carrierId: carrierServices.carrierId,
        interconnectId: carrierServices.interconnectId 
      })
      .from(carrierServices)
      .where(eq(carrierServices.shortId, shortId))
      .limit(1);
    return service || null;
  }

  async getServiceByIdOrShortId(identifier: string): Promise<{ id: string; shortId: number; carrierId: string; interconnectId: string } | null> {
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum) && identifier === String(shortIdNum)) {
      const byShortId = await this.getServiceByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    
    const [service] = await db
      .select({ 
        id: carrierServices.id, 
        shortId: carrierServices.shortId, 
        carrierId: carrierServices.carrierId,
        interconnectId: carrierServices.interconnectId 
      })
      .from(carrierServices)
      .where(eq(carrierServices.id, identifier))
      .limit(1);
    return service || null;
  }

  async getUserByShortId(shortId: number): Promise<{ id: string; shortId: number; email: string } | null> {
    const [user] = await db
      .select({ id: users.id, shortId: users.shortId, email: users.email })
      .from(users)
      .where(eq(users.shortId, shortId))
      .limit(1);
    return user || null;
  }

  async getUserByIdOrShortId(identifier: string): Promise<{ id: string; shortId: number; email: string } | null> {
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum) && identifier === String(shortIdNum)) {
      const byShortId = await this.getUserByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    
    const [user] = await db
      .select({ id: users.id, shortId: users.shortId, email: users.email })
      .from(users)
      .where(eq(users.id, identifier))
      .limit(1);
    return user || null;
  }

  async getRateCardByShortId(shortId: number): Promise<{ id: string; shortId: number; code: string } | null> {
    const [rateCard] = await db
      .select({ id: rateCards.id, shortId: rateCards.shortId, code: rateCards.code })
      .from(rateCards)
      .where(eq(rateCards.shortId, shortId))
      .limit(1);
    return rateCard || null;
  }

  async getRateCardByIdOrShortId(identifier: string): Promise<{ id: string; shortId: number; code: string } | null> {
    const shortIdNum = parseInt(identifier, 10);
    if (!isNaN(shortIdNum) && identifier === String(shortIdNum)) {
      const byShortId = await this.getRateCardByShortId(shortIdNum);
      if (byShortId) return byShortId;
    }
    
    const [rateCard] = await db
      .select({ id: rateCards.id, shortId: rateCards.shortId, code: rateCards.code })
      .from(rateCards)
      .where(eq(rateCards.id, identifier))
      .limit(1);
    return rateCard || null;
  }
}

export const shortIdResolver = new ShortIdResolver();
