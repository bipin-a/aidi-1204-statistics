// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Slice 4: calculator labels and terminology", () => {
  test("slider labels use plain English with notation in parentheses", async ({
    page,
  }) => {
    const zTest = page.locator("section#z-test");
    const tTests = page.locator("section#t-test");

    await expect(zTest).toContainText("Sample mean (x̄)");
    await expect(zTest).toContainText("Hypothesized mean (μ₀)");
    await expect(zTest).toContainText("Population standard deviation (σ)");

    await expect(tTests).toContainText("Sample mean (x̄)");
    await expect(tTests).toContainText("Hypothesized mean (μ₀)");
    await expect(tTests).toContainText("Sample standard deviation (s)");
    await expect(tTests).toContainText("Mean difference (d̄)");
  });

  test("all calculator result rows use Decision and avoid Verdict or Result", async ({
    page,
  }) => {
    for (const sectionId of ["z-test", "ab-test", "t-test"]) {
      const section = page.locator(`section#${sectionId}`);
      const resultsTables = section.locator("table").filter({ hasText: "Decision" });

      await expect(resultsTables.first()).toBeVisible();
      await expect(resultsTables.first()).toContainText("Decision");
      await expect(resultsTables.first()).not.toContainText("Result");
      await expect(resultsTables.first()).not.toContainText("Verdict");
    }
  });

  test("user-facing text avoids shorthand operators", async ({ page }) => {
    const body = page.locator("body");

    await expect(body).not.toContainText("+-");
    await expect(body).not.toContainText("!=");
  });
});
