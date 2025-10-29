import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Recommendations", () => {
  test("shows recommended rows on browse page", async ({ page }) => {
    await page.goto(`${BASE_URL}/browse`);

    // Expect multiple lists/rows to be visible (Top, Similar, Watching)
    await expect(page.getByText(/top picks|popular|trending/i)).toBeVisible({
      timeout: 15000,
    });
    // Presence of multiple movie cards implies recommendations rendered
    const cards = page.locator('[data-testid="movie-card"]');
    await expect(cards.first()).toBeVisible();
  });
});
