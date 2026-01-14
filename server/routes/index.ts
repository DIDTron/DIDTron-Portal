import type { Express } from "express";
import { registerSystemStatusRoutes } from "./system-status.routes";

export function registerAllRoutes(app: Express) {
  registerSystemStatusRoutes(app);
}

export { registerSystemStatusRoutes } from "./system-status.routes";
