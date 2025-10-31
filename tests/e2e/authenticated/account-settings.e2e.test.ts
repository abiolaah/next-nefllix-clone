import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Account settings", () => {
  test("navigates to account settings and renders sections", async ({
    page,
  }) => {
    // If your app redirects to profiles first, adjust to a valid route.
    await page.goto(`${BASE_URL}/account`);

    // console.log("✅ Successfully navigated to /account");

    // Take a screenshot for debugging
    await page.screenshot({
      path: "test-results/debug-accounts-page.png",
      fullPage: true,
    });

    // Tabs or links: Membership, Security, Devices, Profiles
    await expect(page.getByRole("button", { name: /membership/i })).toBeVisible(
      {
        timeout: 10000,
      }
    );
    await expect(page.getByRole("button", { name: /security/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /devices/i })).toBeVisible();

    // Visit security
    await page.getByRole("button", { name: /security/i }).click();
    // await expect(page).toHaveURL(new RegExp(`${BASE_URL}/account/security`));
    // await expect(page.getByText(/two-factor|password/i)).toBeVisible();
  });
});
