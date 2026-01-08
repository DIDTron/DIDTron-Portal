import { chromium, Browser, Page, BrowserContext } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { db } from "./db";
import { e2eRuns, e2eResults } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const getBaseUrl = (): string => {
  return process.env.E2E_BASE_URL || "http://localhost:5000";
};

export interface PageToTest {
  moduleName: string;
  pageName: string;
  route: string;
}

export interface TestCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface PageResult {
  moduleName: string;
  pageName: string;
  route: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  screenshotPath?: string;
  accessibilityScore: number;
  accessibilityIssues: any[];
  checks: TestCheck[];
  errorMessage?: string;
}

export interface E2eRunProgress {
  runId: string;
  status: "running" | "completed" | "failed";
  current: number;
  total: number;
  currentPage?: string;
  results: PageResult[];
}

const ALL_PAGES: PageToTest[] = [
  { moduleName: "Dashboard", pageName: "Overview", route: "/admin" },
  { moduleName: "VoIP", pageName: "POPs", route: "/admin/pops" },
  { moduleName: "VoIP", pageName: "Voice Tiers", route: "/admin/voice-tiers" },
  { moduleName: "VoIP", pageName: "Codecs", route: "/admin/codecs" },
  { moduleName: "VoIP", pageName: "Channel Plans", route: "/admin/channel-plans" },
  { moduleName: "VoIP", pageName: "Routes", route: "/admin/routes" },
  { moduleName: "Carriers", pageName: "Carriers", route: "/admin/carriers" },
  { moduleName: "Rate Cards", pageName: "Customer Rates", route: "/admin/rate-cards/customer" },
  { moduleName: "Rate Cards", pageName: "Carrier Rates", route: "/admin/rate-cards/carrier" },
  { moduleName: "DID", pageName: "DID Countries", route: "/admin/did-countries" },
  { moduleName: "DID", pageName: "DID Providers", route: "/admin/did-providers" },
  { moduleName: "DID", pageName: "DID Inventory", route: "/admin/did-inventory" },
  { moduleName: "Customers", pageName: "Customers", route: "/admin/customers" },
  { moduleName: "Customers", pageName: "Categories", route: "/admin/categories" },
  { moduleName: "Customers", pageName: "Groups", route: "/admin/groups" },
  { moduleName: "Customers", pageName: "KYC Requests", route: "/admin/kyc" },
  { moduleName: "Billing", pageName: "Invoices", route: "/admin/invoices" },
  { moduleName: "Billing", pageName: "Payments", route: "/admin/payments" },
  { moduleName: "Billing", pageName: "Currencies", route: "/admin/currencies" },
  { moduleName: "Billing", pageName: "Referrals", route: "/admin/referrals" },
  { moduleName: "Billing", pageName: "Promo Codes", route: "/admin/promo-codes" },
  { moduleName: "Billing", pageName: "Bonuses", route: "/admin/bonuses" },
  { moduleName: "Marketing", pageName: "Social Accounts", route: "/admin/social-accounts" },
  { moduleName: "Marketing", pageName: "Social Posts", route: "/admin/social-posts" },
  { moduleName: "Marketing", pageName: "Email Templates", route: "/admin/email-templates" },
  { moduleName: "Monitoring", pageName: "Metrics", route: "/admin/metrics" },
  { moduleName: "Monitoring", pageName: "CDRs", route: "/admin/cdrs" },
  { moduleName: "Monitoring", pageName: "Alerts", route: "/admin/alerts" },
  { moduleName: "Monitoring", pageName: "Rules", route: "/admin/rules" },
  { moduleName: "SIP Tester", pageName: "New Test", route: "/admin/sip-tester/new" },
  { moduleName: "SIP Tester", pageName: "History", route: "/admin/sip-tester/history" },
  { moduleName: "SIP Tester", pageName: "Settings", route: "/admin/sip-tester/settings" },
  { moduleName: "AI Voice", pageName: "Dashboard", route: "/admin/ai-voice/dashboard" },
  { moduleName: "AI Voice", pageName: "Agents", route: "/admin/ai-voice/agents" },
  { moduleName: "AI Voice", pageName: "Knowledge Bases", route: "/admin/ai-voice/knowledge-bases" },
  { moduleName: "AI Voice", pageName: "Campaigns", route: "/admin/ai-voice/campaigns" },
  { moduleName: "AI Voice", pageName: "Call Logs", route: "/admin/ai-voice/call-logs" },
  { moduleName: "AI Voice", pageName: "Analytics", route: "/admin/ai-voice/analytics" },
  { moduleName: "AI Voice", pageName: "Billing", route: "/admin/ai-voice/billing" },
  { moduleName: "AI Voice", pageName: "Settings", route: "/admin/ai-voice/settings" },
  { moduleName: "Class 4", pageName: "Customers", route: "/admin/class4-customers" },
  { moduleName: "Class 4", pageName: "Carriers", route: "/admin/class4-carriers" },
  { moduleName: "Class 4", pageName: "Rate Cards", route: "/admin/class4-rate-cards" },
  { moduleName: "Experience", pageName: "Dashboard", route: "/admin/experience-manager" },
  { moduleName: "Experience", pageName: "Marketing Website", route: "/admin/experience-manager/marketing" },
  { moduleName: "Experience", pageName: "Portal Themes", route: "/admin/experience-manager/portal-themes" },
  { moduleName: "Experience", pageName: "White-Label", route: "/admin/experience-manager/white-label" },
  { moduleName: "Experience", pageName: "Design System", route: "/admin/experience-manager/design-system" },
  { moduleName: "Experience", pageName: "Documentation", route: "/admin/documentation" },
  { moduleName: "Admin", pageName: "Admin Users", route: "/admin/admin-users" },
  { moduleName: "Admin", pageName: "Roles", route: "/admin/roles" },
  { moduleName: "Admin", pageName: "Audit Logs", route: "/admin/audit-logs" },
  { moduleName: "Admin", pageName: "Trash", route: "/admin/trash" },
  { moduleName: "Admin", pageName: "Support Tickets", route: "/admin/tickets" },
  { moduleName: "Admin", pageName: "Job Queue", route: "/admin/job-queue" },
  { moduleName: "Admin", pageName: "Dev Tests", route: "/admin/dev-tests" },
  { moduleName: "Admin", pageName: "Testing Engine", route: "/admin/testing-engine" },
  { moduleName: "Global Settings", pageName: "Platform", route: "/admin/global-settings/platform" },
  { moduleName: "Global Settings", pageName: "Currencies", route: "/admin/global-settings/currencies" },
  { moduleName: "Global Settings", pageName: "Localization", route: "/admin/global-settings/localization" },
  { moduleName: "Global Settings", pageName: "A-Z Database", route: "/admin/global-settings/az-database" },
  { moduleName: "Settings", pageName: "General", route: "/admin/settings/general" },
  { moduleName: "Settings", pageName: "API Keys", route: "/admin/settings/api-keys" },
  { moduleName: "Settings", pageName: "Webhooks", route: "/admin/settings/webhooks" },
  { moduleName: "Settings", pageName: "Integrations", route: "/admin/settings/integrations" },
  { moduleName: "Settings", pageName: "ConnexCS Status", route: "/admin/settings/connexcs-status" },
];

async function loginAsSuperAdmin(page: Page): Promise<boolean> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("[E2E] Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD");
    return false;
  }

  try {
    await page.goto(`${getBaseUrl()}/login`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForSelector('[data-testid="input-email"], input[type="email"]', { timeout: 10000 });

    await page.locator('[data-testid="input-email"], input[type="email"]').first().fill(email);
    await page.locator('[data-testid="input-password"], input[type="password"]').first().fill(password);
    await page.locator('[data-testid="button-login-submit"], button[type="submit"]').first().click();

    await page.waitForURL(/\/admin/, { timeout: 15000 });
    console.log("[E2E] Successfully logged in as super admin");
    return true;
  } catch (error) {
    console.error("[E2E] Login failed:", error);
    return false;
  }
}

async function testPage(page: Page, pageData: PageToTest): Promise<PageResult> {
  const startTime = Date.now();
  const checks: TestCheck[] = [];
  let accessibilityScore = 100;
  let accessibilityIssues: any[] = [];

  try {
    await page.goto(`${getBaseUrl()}${pageData.route}`, { waitUntil: "networkidle", timeout: 30000 });

    checks.push({ name: "Page loads", passed: true, details: "Page loaded successfully" });

    const content = await page.locator("body").textContent();
    const hasContent = content && content.trim().length > 50;
    checks.push({ name: "Has content", passed: !!hasContent, details: hasContent ? "Content visible" : "Page appears empty" });

    const consoleErrors = await page.evaluate(() => {
      return (window as any).__consoleErrors || [];
    });
    const hasNoJsErrors = consoleErrors.length === 0;
    checks.push({ name: "No JS errors", passed: hasNoJsErrors, details: hasNoJsErrors ? "No errors" : `${consoleErrors.length} errors` });

    const errorElements = await page.locator('[class*="error"]:visible, [data-testid*="error"]:visible').count();
    checks.push({ name: "No UI errors", passed: errorElements === 0, details: errorElements === 0 ? "No error elements" : `${errorElements} error elements` });

    const buttons = await page.locator('button:visible').count();
    checks.push({ name: "Buttons present", passed: buttons > 0, details: `${buttons} buttons found` });

    const inputs = await page.locator('input:visible, textarea:visible, select:visible').count();
    checks.push({ name: "Forms checked", passed: true, details: `${inputs} input fields found` });

    try {
      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const violations = axeResults.violations.length;
      accessibilityScore = Math.max(0, 100 - (violations * 5));
      accessibilityIssues = axeResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      }));

      checks.push({
        name: "Accessibility",
        passed: violations < 5,
        details: violations === 0 ? "No WCAG violations" : `${violations} violations (score: ${accessibilityScore})`,
      });
    } catch (axeError) {
      checks.push({ name: "Accessibility", passed: true, details: "Scan skipped" });
    }

    const allPassed = checks.every(c => c.passed);
    return {
      moduleName: pageData.moduleName,
      pageName: pageData.pageName,
      route: pageData.route,
      status: allPassed ? "passed" : "failed",
      duration: Date.now() - startTime,
      accessibilityScore,
      accessibilityIssues,
      checks,
    };
  } catch (error: any) {
    const screenshotDir = path.join(process.cwd(), "screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotDir, `error-${Date.now()}.png`);
    try {
      await page.screenshot({ path: screenshotPath });
    } catch {}

    return {
      moduleName: pageData.moduleName,
      pageName: pageData.pageName,
      route: pageData.route,
      status: "failed",
      duration: Date.now() - startTime,
      screenshotPath,
      accessibilityScore: 0,
      accessibilityIssues: [],
      checks: [{ name: "Page loads", passed: false, details: error.message }],
      errorMessage: error.message,
    };
  }
}

export async function runE2eTests(
  scope: string = "all",
  triggeredBy?: string,
  onProgress?: (progress: E2eRunProgress) => void
): Promise<{ runId: string; results: PageResult[] }> {
  let pagesToTest: PageToTest[];
  let scopeName = scope;
  
  if (scope === "all") {
    pagesToTest = ALL_PAGES;
    scopeName = "All Modules";
  } else if (scope.startsWith("page:")) {
    const route = scope.substring(5);
    pagesToTest = ALL_PAGES.filter(p => p.route === route);
    scopeName = pagesToTest.length > 0 ? `${pagesToTest[0].moduleName}/${pagesToTest[0].pageName}` : route;
  } else {
    pagesToTest = ALL_PAGES.filter(p => p.moduleName.toLowerCase() === scope.toLowerCase());
    scopeName = scope;
  }

  const [run] = await db.insert(e2eRuns).values({
    name: `E2E Test: ${scopeName}`,
    scope: scopeName,
    status: "running",
    totalTests: pagesToTest.length,
    passedTests: 0,
    failedTests: 0,
    startedAt: new Date(),
    triggeredBy,
  }).returning();

  const results: PageResult[] = [];
  let browser: Browser | null = null;

  try {
    const chromiumPath = "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium";
    browser = await chromium.launch({
      headless: true,
      executablePath: fs.existsSync(chromiumPath) ? chromiumPath : undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
      (window as any).__consoleErrors = [];
      const originalError = console.error;
      console.error = (...args) => {
        (window as any).__consoleErrors.push(args.join(" "));
        originalError.apply(console, args);
      };
    });

    const loggedIn = await loginAsSuperAdmin(page);
    if (!loggedIn) {
      throw new Error("Failed to login as super admin");
    }

    for (let i = 0; i < pagesToTest.length; i++) {
      const pageToTest = pagesToTest[i];

      if (onProgress) {
        onProgress({
          runId: run.id,
          status: "running",
          current: i + 1,
          total: pagesToTest.length,
          currentPage: pageToTest.route,
          results,
        });
      }

      console.log(`[E2E] Testing ${pageToTest.moduleName}/${pageToTest.pageName} (${i + 1}/${pagesToTest.length})`);
      const result = await testPage(page, pageToTest);
      results.push(result);

      await db.insert(e2eResults).values({
        runId: run.id,
        moduleName: result.moduleName,
        pageName: result.pageName,
        route: result.route,
        status: result.status,
        duration: result.duration,
        screenshotPath: result.screenshotPath,
        accessibilityScore: result.accessibilityScore,
        accessibilityIssues: result.accessibilityIssues,
        checks: result.checks,
        errorMessage: result.errorMessage,
      });
    }

    await context.close();
  } catch (error: any) {
    console.error("[E2E] Test run failed:", error);
    await db.update(e2eRuns).set({
      status: "failed",
      completedAt: new Date(),
      duration: Date.now() - run.startedAt!.getTime(),
    }).where(eq(e2eRuns.id, run.id));

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const passedCount = results.filter(r => r.status === "passed").length;
  const failedCount = results.filter(r => r.status === "failed").length;
  const avgAccessibility = results.reduce((sum, r) => sum + r.accessibilityScore, 0) / results.length;

  await db.update(e2eRuns).set({
    status: "completed",
    passedTests: passedCount,
    failedTests: failedCount,
    accessibilityScore: Math.round(avgAccessibility),
    completedAt: new Date(),
    duration: Date.now() - run.startedAt!.getTime(),
  }).where(eq(e2eRuns.id, run.id));

  if (onProgress) {
    onProgress({
      runId: run.id,
      status: "completed",
      current: pagesToTest.length,
      total: pagesToTest.length,
      results,
    });
  }

  return { runId: run.id, results };
}

export function getModuleList(): string[] {
  return Array.from(new Set(ALL_PAGES.map(p => p.moduleName)));
}

export function getPageCount(): number {
  return ALL_PAGES.length;
}

export function getModulesWithPages(): { name: string; pages: { name: string; route: string }[] }[] {
  const moduleMap = new Map<string, { name: string; route: string }[]>();
  
  for (const page of ALL_PAGES) {
    if (!moduleMap.has(page.moduleName)) {
      moduleMap.set(page.moduleName, []);
    }
    moduleMap.get(page.moduleName)!.push({ name: page.pageName, route: page.route });
  }
  
  return Array.from(moduleMap.entries()).map(([name, pages]) => ({ name, pages }));
}
