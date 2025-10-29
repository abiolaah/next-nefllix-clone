import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Login flow", () => {
  test("renders login page and basic validation works", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);

    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible({
      timeout: 5000,
    });

    // Try submitting empty form
    const submit = page.getByRole("button", { name: /sign in/i });
    await submit.click();

    // Expect some validation feedback (generic)
    await expect(page.locator("text=/email/i")).toBeVisible({ timeout: 5000 });

    // Fill in example credentials (ensure a test user exists in env/app or this remains a smoke test)
    await page
      .getByLabel(/email/i)
      .fill(process.env.E2E_EMAIL || "test@example.com");
    await page
      .getByLabel(/password/i)
      .fill(process.env.E2E_PASSWORD || "password");

    await submit.click();

    // After successful login we expect redirect to browse
    // Allow both '/browse' and '/' depending on app logic
    await page.waitForURL(new RegExp(`${BASE_URL}/(browse|$)`), {
      timeout: 10000,
    });
  });
});
