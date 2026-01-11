import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET must be at least 16 characters"),
  
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),
  
  OPEN_EXCHANGE_RATES_APP_ID: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

let validatedConfig: Config | null = null;

export function getConfig(): Config {
  if (validatedConfig) {
    return validatedConfig;
  }
  
  const result = configSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => 
      `  - ${issue.path.join(".")}: ${issue.message}`
    ).join("\n");
    
    console.error("[Config] Validation failed:");
    console.error(errors);
    
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Configuration validation failed:\n${errors}`);
    } else {
      console.warn("[Config] Running in development mode with invalid config - some features may not work");
      validatedConfig = {
        NODE_ENV: "development",
        PORT: process.env.PORT || "5000",
        DATABASE_URL: process.env.DATABASE_URL || "",
        SESSION_SECRET: process.env.SESSION_SECRET || "dev-secret-change-me",
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
        OPEN_EXCHANGE_RATES_APP_ID: process.env.OPEN_EXCHANGE_RATES_APP_ID,
      };
      return validatedConfig;
    }
  }
  
  validatedConfig = result.data;
  console.log("[Config] Configuration validated successfully");
  return validatedConfig;
}

export function isProduction(): boolean {
  return getConfig().NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return getConfig().NODE_ENV === "development";
}

export function getPort(): number {
  return parseInt(getConfig().PORT, 10);
}
