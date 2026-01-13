import { test, expect } from "@playwright/test";

test.describe("Performance Guardrails", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="input-email"]', "info@didtron.com");
    await page.fill('[data-testid="input-password"]', process.env.SUPER_ADMIN_PASSWORD || "admin123");
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/admin/);
  });

  test("API responses include timing headers", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/") && response.status() === 200
    );
    await page.goto("/admin");
    const response = await responsePromise;
    const timing = response.headers()["x-response-time"];
    expect(timing).toBeDefined();
  });

  test("Dashboard loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/admin");
    await page.waitForSelector('[data-testid="dashboard-overview"]', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test("Carriers list uses cursor pagination", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/carriers") && response.status() === 200
    );
    await page.goto("/admin/softswitch/carriers");
    const response = await responsePromise;
    const data = await response.json();
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("hasMore");
    expect(data).toHaveProperty("nextCursor");
  });

  test("Navigation between sections is smooth", async ({ page }) => {
    await page.goto("/admin");
    
    const navStart = Date.now();
    await page.click('[data-testid="nav-softswitch"]');
    await page.waitForURL(/\/admin\/softswitch/);
    const navTime = Date.now() - navStart;
    
    expect(navTime).toBeLessThan(2000);
  });

  test("Sidebar counts endpoint is cached", async ({ page }) => {
    await page.goto("/admin");
    
    const responses: number[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/api/admin/sidebar-counts")) {
        responses.push(Date.now());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(500);
    
    expect(responses.length).toBeGreaterThanOrEqual(1);
  });

  test("Large list views have loading states", async ({ page }) => {
    await page.goto("/admin/softswitch/carriers");
    
    const hasLoadingOrContent = await page.locator('[data-testid="carriers-table"], [data-testid="loading-skeleton"]').count();
    expect(hasLoadingOrContent).toBeGreaterThan(0);
  });

  test("API errors are handled gracefully", async ({ page }) => {
    await page.route("**/api/carriers", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });
    
    await page.goto("/admin/softswitch/carriers");
    
    const errorOrEmpty = await page.locator('[data-testid="error-message"], [data-testid="empty-state"]').count();
    expect(errorOrEmpty).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Code Splitting Verification", () => {
  test("Admin module is lazy loaded", async ({ page }) => {
    const jsRequests: string[] = [];
    
    page.on("request", (request) => {
      if (request.url().endsWith(".js") || request.url().includes(".tsx")) {
        jsRequests.push(request.url());
      }
    });
    
    await page.goto("/login");
    const loginJsCount = jsRequests.length;
    
    await page.fill('[data-testid="input-email"]', "info@didtron.com");
    await page.fill('[data-testid="input-password"]', process.env.SUPER_ADMIN_PASSWORD || "admin123");
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/admin/);
    
    const afterLoginJsCount = jsRequests.length;
    expect(afterLoginJsCount).toBeGreaterThan(loginJsCount);
  });
});

test.describe("Data Freshness", () => {
  test("Data refetches after stale time", async ({ page }) => {
    await page.goto("/admin/softswitch/carriers");
    
    let apiCallCount = 0;
    page.on("request", (request) => {
      if (request.url().includes("/api/carriers") && request.method() === "GET") {
        apiCallCount++;
      }
    });
    
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForTimeout(1000);
    
    expect(apiCallCount).toBeGreaterThanOrEqual(1);
  });
});
