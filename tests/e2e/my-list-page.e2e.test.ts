import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("My List page", () => {
  test("renders saved items (if any) and empty state otherwise", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/my-list`);

    // Either shows cards or an empty state message
    const cards = page.locator('[data-testid="movie-card"]');
    const emptyState = page.getByText(/no favourites|no items|empty/i);

    const hasCards = await cards
      .first()
      .isVisible()
      .catch(() => false);
    if (hasCards) {
      await expect(cards.first()).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible();
    }
  });
});
