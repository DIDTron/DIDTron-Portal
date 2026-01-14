import type { Express } from "express";
import { registerSystemStatusRoutes } from "./system-status.routes";
import { registerLegacyAuthRoutes } from "./auth.routes";
import { registerJobsRoutes } from "./jobs.routes";

export function registerAllRoutes(app: Express) {
  registerSystemStatusRoutes(app);
  registerLegacyAuthRoutes(app);
  registerJobsRoutes(app);
}

export { registerSystemStatusRoutes } from "./system-status.routes";
export { registerLegacyAuthRoutes } from "./auth.routes";
export { registerJobsRoutes } from "./jobs.routes";
