import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { User, InsertUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

export async function createUser(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  customerType?: string;
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  
  const user = await storage.createUser({
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: "customer_admin",
    status: "active",
  });
  
  return user;
}

export async function validateLogin(
  email: string,
  password: string
): Promise<User | null> {
  // Dev test account - uses environment variables for security
  const testEmail = process.env.TEST_ADMIN_EMAIL;
  const testPassword = process.env.TEST_ADMIN_PASSWORD;
  
  if (testEmail && testPassword && email === testEmail && password === testPassword) {
    let testUser = await storage.getUserByEmail(testEmail);
    if (!testUser) {
      const hashedPassword = await hashPassword(testPassword);
      testUser = await storage.createUser({
        email: testEmail,
        password: hashedPassword,
        firstName: "DIDTron",
        lastName: "Admin",
        role: "super_admin",
        status: "active",
      });
    }
    await storage.updateUser(testUser.id, { lastLoginAt: new Date() } as any);
    return testUser;
  }

  const user = await storage.getUserByEmail(email);
  if (!user) return null;
  
  const isValid = await comparePasswords(password, user.password);
  if (!isValid) return null;
  
  await storage.updateUser(user.id, { lastLoginAt: new Date() } as any);
  
  return user;
}

export function sanitizeUser(user: User): Omit<User, "password" | "twoFactorSecret"> {
  const { password, twoFactorSecret, ...safeUser } = user;
  return safeUser;
}
