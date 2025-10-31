import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/auth");

  // Fill in credentials
  await page
    .getByLabel(/email/i)
    .fill(process.env.E2E_EMAIL || "test@gmail.com");
  await page
    .getByLabel(/password/i)
    .fill(process.env.E2E_PASSWORD || "Test1234");

  // Click sign in
  await page.getByRole("button", { name: /login/i }).click();

  // Wait for successful login (redirect to browse or profiles)
  await page.waitForURL(/.*\/(browse|profiles)/, { timeout: 10000 });

  // Check if we're on the profiles page
  const currentUrl = page.url();

  if (currentUrl.includes("/profiles")) {
    console.log("📋 On profiles page - selecting a profile...");

    // Wait for profiles heading to be visible
    await expect(
      page.getByRole("heading", { name: /who is watching/i })
    ).toBeVisible({ timeout: 5000 });

    // Wait a bit for profiles to render
    await page.waitForTimeout(1000);

    // Take a screenshot for debugging
    await page.screenshot({
      path: "test-results/debug-profiles-page.png",
      fullPage: true,
    });

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // Find all clickable profile containers using the class structure from profiles.tsx
    // Looking for: div.group.relative (the parent container of each profile)
    const profileContainers = page.locator("div.group.relative").filter({
      has: page.locator("img[alt]"),
    });

    // Wait for at least one profile to be visible
    await expect(profileContainers.first()).toBeVisible({ timeout: 5000 });

    const profileCount = await profileContainers.count();

    if (profileCount === 0) {
      throw new Error(
        "No profiles found. Please create at least one profile for the test user."
      );
    }

    console.log(`✅ Found ${profileCount} profile(s)`);

    // Select the first profile
    const profileIndex = 0;
    console.log(`🎯 Selecting profile ${profileIndex + 1} of ${profileCount}`);

    // Click the selected profile
    await profileContainers.nth(profileIndex).click();

    // Wait for navigation to browse page
    await page.waitForURL(/.*\/browse/, { timeout: 10000 });

    console.log("✅ Successfully navigated to /browse");
  } else {
    console.log("✅ Already on /browse page");
  }

  // Verify we're on the browse page and authenticated
  await expect(page.getByAltText(/Avatar for/i)).toBeVisible({ timeout: 5000 });

  // Save signed-in state to 'user.json'
  await page.context().storageState({ path: authFile });

  console.log("✅ Authentication state saved to:", authFile);
});
