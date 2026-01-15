import type { Express } from "express";
import { registerSystemStatusRoutes } from "./system-status.routes";
import { registerLegacyAuthRoutes } from "./auth.routes";
import { registerJobsRoutes } from "./jobs.routes";
import { registerFilesRoutes } from "./files.routes";
import { registerAzDestinationsRoutes } from "./az-destinations.routes";
import { registerDidsRoutes } from "./dids.routes";
import { registerSipTesterRoutes } from "./sip-tester.routes";
import { registerBillingRoutes } from "./billing.routes";
import { registerSoftswitchRoutes } from "./softswitch.routes";
import { registerPortalAiVoiceRoutes } from "./portal-ai-voice.routes";
import { registerPortalPbxRoutes } from "./portal-pbx.routes";
import { registerPortalCrmRoutes } from "./portal-crm.routes";
import { registerConnexCSRoutes } from "./connexcs.routes";

export function registerAllRoutes(app: Express) {
  registerSystemStatusRoutes(app);
  registerLegacyAuthRoutes(app);
  registerJobsRoutes(app);
  registerFilesRoutes(app);
  registerAzDestinationsRoutes(app);
  registerDidsRoutes(app);
  registerSipTesterRoutes(app);
  registerBillingRoutes(app);
  registerSoftswitchRoutes(app);
  registerPortalAiVoiceRoutes(app);
  registerPortalPbxRoutes(app);
  registerPortalCrmRoutes(app);
  registerConnexCSRoutes(app);
}

export { registerSystemStatusRoutes } from "./system-status.routes";
export { registerLegacyAuthRoutes } from "./auth.routes";
export { registerJobsRoutes } from "./jobs.routes";
export { registerFilesRoutes } from "./files.routes";
export { registerAzDestinationsRoutes } from "./az-destinations.routes";
export { registerDidsRoutes } from "./dids.routes";
export { registerSipTesterRoutes } from "./sip-tester.routes";
export { registerBillingRoutes } from "./billing.routes";
export { registerSoftswitchRoutes } from "./softswitch.routes";
export { registerPortalAiVoiceRoutes } from "./portal-ai-voice.routes";
export { registerPortalPbxRoutes } from "./portal-pbx.routes";
export { registerPortalCrmRoutes } from "./portal-crm.routes";
export { registerConnexCSRoutes } from "./connexcs.routes";
