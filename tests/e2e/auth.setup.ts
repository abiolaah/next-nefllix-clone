import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  console.log("🔐 Starting authentication setup...");

  // Navigate to login page
  await page.goto("/auth");
  console.log("✅ Navigated to /auth");

  // Wait for page to be fully loaded
  await page.waitForLoadState("networkidle");

  // Take screenshot for debugging
  await page.screenshot({
    path: "test-results/auth-setup-initial.png",
    fullPage: true,
  });

  // Fill in credentials
  const email = process.env.E2E_EMAIL || "test@gmail.com";
  const password = process.env.E2E_PASSWORD || "Test1234";

  console.log(`📧 Using email: ${email}`);

  // Wait for email input to be visible and enabled
  const emailInput = page.getByLabel(/email/i);
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await expect(emailInput).toBeEnabled();
  await emailInput.fill(email);
  console.log("✅ Email filled");

  // Wait for password input to be visible and enabled
  const passwordInput = page.getByLabel(/password/i);
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await expect(passwordInput).toBeEnabled();
  await passwordInput.fill(password);
  console.log("✅ Password filled");

  // Take screenshot before submitting
  await page.screenshot({
    path: "test-results/auth-setup-before-submit.png",
    fullPage: true,
  });

  // Find and click the login button
  const loginButton = page.getByRole("button", { name: /login|sign in/i });
  await expect(loginButton).toBeVisible({ timeout: 5000 });
  await expect(loginButton).toBeEnabled();

  console.log("🔘 Clicking login button...");
  await loginButton.click();

  // Wait for navigation with extended timeout for CI environments
  const timeout = process.env.CI ? 20000 : 10000;

  try {
    await page.waitForURL(/.*\/(browse|profiles)/, { timeout });
    console.log("✅ Successfully logged in, redirected to:", page.url());
  } catch (error) {
    console.error("❌ Login failed - timeout waiting for redirect");

    // Take screenshot of failure
    await page.screenshot({
      path: "test-results/auth-setup-failure.png",
      fullPage: true,
    });

    // Log current URL and page content for debugging
    console.error("Current URL:", page.url());
    console.error("Page title:", await page.title());

    // Check for error messages
    const errorMessage = await page
      .locator("text=/error|invalid|wrong/i")
      .textContent()
      .catch(() => null);
    if (errorMessage) {
      console.error("Error message on page:", errorMessage);
    }

    throw error;
  }

  // Check if we're on the profiles page
  const currentUrl = page.url();

  if (currentUrl.includes("/profiles")) {
    console.log("📋 On profiles page - selecting a profile...");

    // Wait for profiles heading to be visible
    await expect(
      page.getByRole("heading", { name: /who is watching/i })
    ).toBeVisible({ timeout: 10000 });

    // Wait for page to stabilize
    await page.waitForTimeout(1000);
    await page.waitForLoadState("networkidle");

    // Take a screenshot for debugging
    await page.screenshot({
      path: "test-results/auth-setup-profiles-page.png",
      fullPage: true,
    });

    // Find all clickable profile containers
    const profileContainers = page.locator("div.group.relative").filter({
      has: page.locator("img[alt]"),
    });

    // Wait for at least one profile to be visible
    await expect(profileContainers.first()).toBeVisible({ timeout: 10000 });

    const profileCount = await profileContainers.count();

    if (profileCount === 0) {
      throw new Error(
        "No profiles found. Please create at least one profile for the test user."
      );
    }

    console.log(`✅ Found ${profileCount} profile(s)`);

    // Select the first profile
    console.log(`🎯 Selecting first profile...`);
    await profileContainers.first().click();

    // Wait for navigation to browse page
    await page.waitForURL(/.*\/browse/, { timeout: 15000 });
    console.log("✅ Successfully navigated to /browse");
  } else {
    console.log("✅ Already on /browse page");
  }

  // Take final screenshot
  await page.screenshot({
    path: "test-results/auth-setup-final.png",
    fullPage: true,
  });

  // Verify we're on the browse page and authenticated
  try {
    await expect(page.getByAltText(/Avatar for/i)).toBeVisible({
      timeout: 10000,
    });
    console.log("✅ User avatar visible - authentication confirmed");
  } catch (error) {
    console.warn("⚠️ User avatar not found, but continuing...", error);
    // Don't fail if avatar isn't found, as long as we're on the browse page
  }

  // Save signed-in state to 'user.json'
  await page.context().storageState({ path: authFile });
  console.log("✅ Authentication state saved to:", authFile);

  console.log("🎉 Authentication setup complete!");
});
