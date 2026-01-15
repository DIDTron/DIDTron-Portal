import { test, expect } from "@playwright/test";

test.describe("Admin Jobs Security", () => {
  test("unauthenticated request to /api/admin/jobs/stats returns 401", async ({ request }) => {
    const response = await request.get("http://127.0.0.1:5000/api/admin/jobs/stats", {
      headers: { Accept: "application/json" }
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("authenticated super_admin can access /api/admin/jobs/stats", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    
    await page.getByTestId("input-email").fill(process.env.TEST_ADMIN_EMAIL || "info@didtron.com");
    await page.getByTestId("input-password").fill(process.env.TEST_ADMIN_PASSWORD || "admin123");
    await page.getByTestId("button-login").click();
    
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    
    const result = await page.evaluate(async () => {
      const resp = await fetch("/api/admin/jobs/stats", {
        headers: { Accept: "application/json" }
      });
      const body = await resp.json();
      return { status: resp.status, body };
    });
    
    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("pending");
    expect(result.body).toHaveProperty("completed");
  });
});
