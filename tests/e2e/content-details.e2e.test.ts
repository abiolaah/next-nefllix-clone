import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Content details", () => {
  test("can open a content details modal/card from browse", async ({
    page,
  }) => {
    // Precondition: user is logged in; if your app requires auth, use storageState or run login first.
    await page.goto(`${BASE_URL}/browse`);

    // Wait for a movie card to render
    const anyCard = page.locator('[data-testid="movie-card"]').first();
    await expect(anyCard).toBeVisible({ timeout: 15000 });

    // Hover to expand and click info button
    await anyCard.hover();
    const infoButton = page.locator('[data-testid="info-button"]').first();
    await expect(infoButton).toBeVisible();
    await infoButton.click();

    // Expect a modal or details view to appear with title text present
    await expect(
      page.locator("text=/play|trailer|seasons|duration/i")
    ).toBeVisible({ timeout: 10000 });
  });
});
