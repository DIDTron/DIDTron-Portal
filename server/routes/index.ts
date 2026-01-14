import type { Express } from "express";
import { registerSystemStatusRoutes } from "./system-status.routes";
import { registerLegacyAuthRoutes } from "./auth.routes";
import { registerJobsRoutes } from "./jobs.routes";
import { registerFilesRoutes } from "./files.routes";
import { registerAzDestinationsRoutes } from "./az-destinations.routes";

export function registerAllRoutes(app: Express) {
  registerSystemStatusRoutes(app);
  registerLegacyAuthRoutes(app);
  registerJobsRoutes(app);
  registerFilesRoutes(app);
  registerAzDestinationsRoutes(app);
}

export { registerSystemStatusRoutes } from "./system-status.routes";
export { registerLegacyAuthRoutes } from "./auth.routes";
export { registerJobsRoutes } from "./jobs.routes";
export { registerFilesRoutes } from "./files.routes";
export { registerAzDestinationsRoutes } from "./az-destinations.routes";
