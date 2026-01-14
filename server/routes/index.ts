import type { Express } from "express";
import { registerSystemStatusRoutes } from "./system-status.routes";
import { registerLegacyAuthRoutes } from "./auth.routes";

export function registerAllRoutes(app: Express) {
  registerSystemStatusRoutes(app);
  registerLegacyAuthRoutes(app);
}

export { registerSystemStatusRoutes } from "./system-status.routes";
export { registerLegacyAuthRoutes } from "./auth.routes";
