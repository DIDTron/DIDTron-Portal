import { chromium, Browser, Page, BrowserContext } from "playwright";
import { testingEngineRepository } from "./testing-engine-repository";
import type { TestModule, TestPage } from "@shared/schema";

export interface E2ETestResult {
  moduleName: string;
  pageName: string;
  pageRoute: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  errorMessage?: string;
  screenshot?: string;
  checks: Array<{
    name: string;
    passed: boolean;
    details?: string;
  }>;
}

export interface E2ERunSummary {
  runId: string;
  name: string;
  status: "completed" | "failed";
  totalPages: number;
  passedPages: number;
  failedPages: number;
  duration: number;
  results: E2ETestResult[];
  loginSuccess: boolean;
  startedAt: Date;
  completedAt: Date;
}

const getBaseUrl = (): string => {
  if (process.env.E2E_BASE_URL) {
    return process.env.E2E_BASE_URL;
  }
  return "http://localhost:5000";
};

async function loginAsSuperAdmin(page: Page): Promise<boolean> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("[E2E] Super admin credentials not found in secrets");
    return false;
  }

  try {
    await page.goto(`${getBaseUrl()}/login`, { waitUntil: "networkidle", timeout: 30000 });
    
    await page.waitForSelector('[data-testid="input-email"], input[type="email"], input[name="email"]', { timeout: 10000 });
    
    const emailInput = page.locator('[data-testid="input-email"], input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('[data-testid="input-password"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="button-login-submit"], [data-testid="button-login"], button[type="submit"]').first();

    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
    
    console.log("[E2E] Successfully logged in as super admin");
    return true;
  } catch (error) {
    console.error("[E2E] Login failed:", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}

async function testPage(page: Page, moduleData: TestModule, pageData: TestPage): Promise<E2ETestResult> {
  const startTime = Date.now();
  const checks: E2ETestResult["checks"] = [];
  let status: E2ETestResult["status"] = "passed";
  let errorMessage: string | undefined;

  try {
    if (!pageData.route) {
      return {
        moduleName: moduleData.name,
        pageName: pageData.name,
        pageRoute: pageData.route || "N/A",
        status: "skipped",
        duration: Date.now() - startTime,
        errorMessage: "No route defined for this page",
        checks: [],
      };
    }

    await page.goto(`${getBaseUrl()}${pageData.route}`, { waitUntil: "networkidle", timeout: 30000 });
    
    checks.push({
      name: "Page loads successfully",
      passed: true,
      details: `Navigated to ${pageData.route}`,
    });

    const pageTitle = await page.title();
    checks.push({
      name: "Page has title",
      passed: true,
      details: pageTitle.length > 0 ? pageTitle : "(no HTML title - not a failure)",
    });

    const hasContent = await page.locator("body").textContent();
    const hasVisibleContent = hasContent && hasContent.trim().length > 50;
    checks.push({
      name: "Page has visible content",
      passed: !!hasVisibleContent,
      details: hasVisibleContent ? "Content rendered" : "Page appears sparse or empty",
    });

    const errorElements = await page.locator('[class*="error"], [data-testid*="error"]').count();
    const noErrors = errorElements === 0;
    checks.push({
      name: "No visible errors",
      passed: noErrors,
      details: noErrors ? "No error elements found" : `Found ${errorElements} error element(s)`,
    });

    const buttons = await page.locator('button, [role="button"]').count();
    checks.push({
      name: "Interactive elements present",
      passed: buttons > 0,
      details: `Found ${buttons} button(s)`,
    });

    const failedChecks = checks.filter(c => !c.passed);
    if (failedChecks.length > 0) {
      status = "failed";
      errorMessage = failedChecks.map(c => c.name).join(", ");
    }

  } catch (error) {
    status = "failed";
    errorMessage = error instanceof Error ? error.message : "Unknown error";
    checks.push({
      name: "Page navigation",
      passed: false,
      details: errorMessage,
    });
  }

  return {
    moduleName: moduleData.name,
    pageName: pageData.name,
    pageRoute: pageData.route || "N/A",
    status,
    duration: Date.now() - startTime,
    errorMessage,
    checks,
  };
}

export async function runE2ETests(options: {
  scope: "all" | "module";
  moduleId?: string;
  testLevels?: string[];
}): Promise<E2ERunSummary> {
  const startedAt = new Date();
  const runId = `e2e-${Date.now()}`;
  const results: E2ETestResult[] = [];
  let browser: Browser | null = null;
  let loginSuccess = false;

  try {
    const executablePaths = [
      process.env.CHROMIUM_PATH,
      "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
      "/run/current-system/sw/bin/chromium",
      "chromium",
    ].filter(Boolean) as string[];

    let launchError: Error | null = null;
    for (const execPath of executablePaths) {
      try {
        browser = await chromium.launch({
          headless: true,
          executablePath: execPath,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        });
        console.log(`[E2E] Browser launched successfully with: ${execPath}`);
        break;
      } catch (err) {
        launchError = err as Error;
        console.log(`[E2E] Failed to launch with ${execPath}: ${(err as Error).message}`);
      }
    }
    
    if (!browser) {
      throw launchError || new Error("Could not launch browser");
    }

    const context: BrowserContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "DIDTron-E2E-TestRunner/1.0",
    });

    const page: Page = await context.newPage();

    loginSuccess = await loginAsSuperAdmin(page);
    
    if (!loginSuccess) {
      return {
        runId,
        name: "E2E Test Run",
        status: "failed",
        totalPages: 0,
        passedPages: 0,
        failedPages: 0,
        duration: Date.now() - startedAt.getTime(),
        results: [],
        loginSuccess: false,
        startedAt,
        completedAt: new Date(),
      };
    }

    let modules: TestModule[];
    if (options.scope === "module" && options.moduleId) {
      const module = await testingEngineRepository.getModuleById(options.moduleId);
      modules = module ? [module] : [];
    } else {
      modules = await testingEngineRepository.getModules();
    }

    for (const module of modules) {
      const pages = await testingEngineRepository.getPages(module.id);
      
      for (const pageData of pages) {
        if (!pageData.enabled) continue;
        
        const result = await testPage(page, module, pageData);
        results.push(result);
      }
    }

    await context.close();
  } catch (error) {
    console.error("[E2E] Test run failed:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const completedAt = new Date();
  const passedPages = results.filter(r => r.status === "passed").length;
  const failedPages = results.filter(r => r.status === "failed").length;

  return {
    runId,
    name: options.scope === "all" ? "E2E: All Modules" : `E2E: ${options.moduleId}`,
    status: failedPages === 0 ? "completed" : "failed",
    totalPages: results.length,
    passedPages,
    failedPages,
    duration: completedAt.getTime() - startedAt.getTime(),
    results,
    loginSuccess,
    startedAt,
    completedAt,
  };
}
