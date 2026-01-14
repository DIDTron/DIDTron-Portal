import type { Express } from "express";
import { registerSystemStatusRoutes } from "./system-status.routes";
import { registerLegacyAuthRoutes } from "./auth.routes";
import { registerJobsRoutes } from "./jobs.routes";
import { registerFilesRoutes } from "./files.routes";
import { registerAzDestinationsRoutes } from "./az-destinations.routes";
import { registerDidsRoutes } from "./dids.routes";
import { registerSipTesterRoutes } from "./sip-tester.routes";

export function registerAllRoutes(app: Express) {
  registerSystemStatusRoutes(app);
  registerLegacyAuthRoutes(app);
  registerJobsRoutes(app);
  registerFilesRoutes(app);
  registerAzDestinationsRoutes(app);
  registerDidsRoutes(app);
  registerSipTesterRoutes(app);
}

export { registerSystemStatusRoutes } from "./system-status.routes";
export { registerLegacyAuthRoutes } from "./auth.routes";
export { registerJobsRoutes } from "./jobs.routes";
export { registerFilesRoutes } from "./files.routes";
export { registerAzDestinationsRoutes } from "./az-destinations.routes";
export { registerDidsRoutes } from "./dids.routes";
export { registerSipTesterRoutes } from "./sip-tester.routes";
