// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Calculator redesign", () => {
  test("z-test calculator uses numeric companion inputs and a semantic results table", async ({
    page,
  }) => {
    const zTest = page.locator("section#z-test");

    await expect(zTest.locator('input[type="number"]')).toHaveCount(4);

    const resultsTable = zTest.locator("table").filter({ hasText: "Decision" }).first();
    await expect(resultsTable).toBeVisible();
    await expect(resultsTable).toContainText("Critical value");
    await expect(resultsTable).toContainText("Decision");

    await expect(
      zTest.getByRole("button", { name: "Observed p-value" })
    ).toHaveCount(0);
    await expect(
      zTest.getByRole("button", { name: "Critical region" })
    ).toHaveCount(0);
  });

  test("a/b calculator shows a two-sided assumption and table-based results", async ({
    page,
  }) => {
    const abTest = page.locator("section#ab-test");

    await expect(abTest.locator('input[type="number"]')).toHaveCount(4);
    await expect(abTest).toContainText("Two-sided test");

    const resultsTable = abTest.locator("table").filter({ hasText: "Decision" }).first();
    await expect(resultsTable).toBeVisible();
    await expect(resultsTable).toContainText("Pooled proportion");
    await expect(resultsTable).toContainText("z-score");
    await expect(resultsTable).toContainText("Decision");
  });

  test("t-test calculators use the shared table pattern and the extra t visualizers are removed", async ({
    page,
  }) => {
    const tTests = page.locator("section#t-test");

    await expect(page.getByText("Live: From observed t-score to p-value")).toHaveCount(0);
    await expect(page.getByText("Live: How df shapes the t-distribution")).toHaveCount(0);
    await expect(tTests.getByText("Two-sided test")).toHaveCount(3);

    const resultsTables = tTests.locator("table").filter({ hasText: "Critical value" });
    await expect(resultsTables).toHaveCount(3);
    await expect(resultsTables.nth(0)).toContainText("Decision");
    await expect(resultsTables.nth(1)).toContainText("Cohen's d (avg. variance)");
    await expect(resultsTables.nth(2)).toContainText("Decision");
  });
});
