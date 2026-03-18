// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Slice 1: factual and statistical wording", () => {
  test("CLT copy uses approximate language and the formula uses \\approx", async ({
    page,
  }) => {
    const clt = page.locator("section#clt");

    await expect(clt).toContainText("approximately Normal");
    await expect(clt).toContainText("\\approx");
    await expect(clt).not.toContainText("\\sim");
    await expect(clt).not.toContainText("exact probabilities");
  });

  test("assumptions and guidance wording is softened and corrected", async ({
    page,
  }) => {
    const clt = page.locator("section#clt");
    const ab = page.locator("section#ab-test");
    const wrongTest = page.locator("section#wrong-test");
    const assumptions = page.locator("section#assumptions");
    const cltConfusion = clt.getByRole("button", {
      name: /Don't all tests assume normal data\?/,
    });
    const abMistakes = ab.getByRole("button", {
      name: /Common A\/B testing mistakes/,
    });

    await cltConfusion.click();
    await abMistakes.click();
    await expect(clt).toContainText("Consider non-parametric tests");
    await expect(ab).toContainText("effect size");
    await expect(wrongTest).toContainText("50%");
    await expect(assumptions).not.toContainText("Balanced design");
    await expect(assumptions).not.toContainText("Confounded effects");
    await expect(assumptions).not.toContainText("Type III sums of squares");
  });

  test("worked examples and labels use the tightened PRD wording", async ({
    page,
  }) => {
    const ab = page.locator("section#ab-test");
    const tTest = page.locator("section#t-test");

    await expect(ab).toContainText("0.01523");
    await expect(ab).toContainText("1.838");
    await expect(tTest).toContainText("Cohen's d (avg. variance)");
  });
});
