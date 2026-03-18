// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Slice 2: Key Terms card", () => {
  test("shows a Key Terms card before the first tutorial section and defines the core symbols", async ({
    page,
  }) => {
    const keyTermsHeading = page.getByRole("heading", { name: /^Key Terms$/ });
    const firstSection = page.locator("section#se");

    await expect(keyTermsHeading).toBeVisible();

    const keyTermsCard = keyTermsHeading.locator("..");
    await expect(keyTermsCard).toContainText("H0");
    await expect(keyTermsCard).toContainText("H1");
    await expect(keyTermsCard).toContainText("alpha");
    await expect(keyTermsCard).toContainText("p-value");

    const isBeforeFirstSection = await page.evaluate(() => {
      const keyHeading = Array.from(
        document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")
      ).find((el) => el.textContent?.trim() === "Key Terms");
      const firstSection = document.querySelector("section#se");

      return Boolean(
        keyHeading &&
          firstSection &&
          (keyHeading.compareDocumentPosition(firstSection) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });

    await expect(firstSection).toBeVisible();
    expect(isBeforeFirstSection).toBe(true);
  });
});
