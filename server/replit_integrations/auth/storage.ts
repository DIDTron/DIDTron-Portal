import { users } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

type User = typeof users.$inferSelect;
type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [existingUser] = await db.select().from(users).where(eq(users.id, userData.id));
    
    if (existingUser) {
      const [user] = await db
        .update(users)
        .set({
          email: userData.email || existingUser.email,
          firstName: userData.firstName || existingUser.firstName,
          lastName: userData.lastName || existingUser.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    } else {
      const [user] = await db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email || "",
          password: "",
          firstName: userData.firstName,
          lastName: userData.lastName,
          status: "active",
          role: "customer_viewer",
        })
        .returning();
      return user;
    }
  }
}

export const authStorage = new AuthStorage();
