import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { devTests, type DevTest, type InsertDevTest } from "@shared/schema";

export const devTestsRepository = {
  async getAll(): Promise<DevTest[]> {
    return await db.select().from(devTests).orderBy(desc(devTests.createdAt));
  },

  async getById(id: string): Promise<DevTest | undefined> {
    const result = await db.select().from(devTests).where(eq(devTests.id, id));
    return result[0];
  },

  async create(test: InsertDevTest): Promise<DevTest> {
    const result = await db.insert(devTests).values({
      ...test,
      testedAt: test.testedAt ?? new Date(),
    }).returning();
    return result[0];
  },

  async update(id: string, data: Partial<InsertDevTest>): Promise<DevTest | undefined> {
    const result = await db.update(devTests)
      .set(data)
      .where(eq(devTests.id, id))
      .returning();
    return result[0];
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(devTests).where(eq(devTests.id, id)).returning();
    return result.length > 0;
  },
};
