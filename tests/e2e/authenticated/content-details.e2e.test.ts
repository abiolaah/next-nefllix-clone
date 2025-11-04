import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Content details", () => {
  test("can open a content details modal/card from browse", async ({
    page,
  }) => {
    // Precondition: user is logged in; if your app requires auth, use storageState or run login first.
    await page.goto(`${BASE_URL}/browse`);
    // console.log("✅ Successfully navigated to /browse");

    // Take a screenshot for debugging
    await page.screenshot({
      path: "test-results/debug-browse-page.png",
      fullPage: true,
    });

    // Wait for a movie card to render
    const anyCard = page.locator('[data-testid="movie-card"]').first();
    await expect(anyCard).toBeVisible({ timeout: 15000 });
    // console.log("✅ Successfully located movie card on browse page");

    // Hover to expand and click info button
    await anyCard.hover();
    const infoButton = page.locator('[data-testid="info-button"]').first();
    await expect(infoButton).toBeVisible();
    // console.log("✅ Successfully located info button on movie card");
    await infoButton.click();
    // console.log("✅ Successfully clicked info button on movie card");

    // Expect a modal or details view to appear with title text present
    await expect(page.getByRole("button", { name: /play/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
