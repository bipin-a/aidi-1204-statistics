// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Next PRD slices", () => {
  test("major sections end with the required Remember callouts", async ({ page }) => {
    await expect(page.locator("section#se")).toContainText(
      "SE = σ/√n. More data → smaller SE, but 4× data only halves SE."
    );
    await expect(page.locator("section#df")).toContainText(
      "df = n−1. Low df → fat tails → need stronger evidence."
    );
    await expect(page.locator("section#clt")).toContainText(
      "Large n → sample mean is approximately Normal, regardless of population shape."
    );
    await expect(page.locator("section#z-test")).toContainText(
      "z = (observed − expected) / SE. Compare p to α. Know your tail direction."
    );
    await expect(page.locator("section#t-test")).toContainText(
      "Same as z-test but with s instead of σ. Fatter tails protect you with small samples."
    );
    await expect(page.locator("section#ab-test")).toContainText(
      "Two-proportion z-test. Pool under H₀. Watch for peeking and winner's curse."
    );
    await expect(page.locator("section#wrong-test")).toContainText(
      "Wrong test → wrong answer. Check: do you know σ? Are groups paired? How many comparisons?"
    );
    await expect(page.locator("section#beyond-p")).toContainText(
      "Always report effect size and CI alongside the p-value."
    );
  });

  test("clt and z-test sections are condensed behind disclosures", async ({ page }) => {
    const clt = page.locator("section#clt");
    const zTest = page.locator("section#z-test");

    await expect(clt).not.toContainText("Without the CLT");
    await expect(clt).not.toContainText("With the CLT");
    await expect(clt.getByRole("button", { name: /Review the CLT refresher/ })).toBeVisible();

    await expect(zTest).not.toContainText("Core Comparison");
    await expect(zTest).not.toContainText("How to read a z-table entry");
    await expect(zTest.getByRole("button", { name: /Manual z-table walkthrough/ })).toBeVisible();
  });

  test("t-test section includes three worked examples with real scenarios", async ({
    page,
  }) => {
    const tTest = page.locator("section#t-test");

    await expect(tTest).toContainText("Worked Example");
    await expect(tTest).toContainText("Class Scores vs National Average");
    await expect(tTest).toContainText("Teaching Method A vs B");
    await expect(tTest).toContainText("Blood Pressure Before vs After Treatment");
  });

  test("static annotated SVG figures replace the remaining interactive charts", async ({
    page,
  }) => {
    await expect(page.locator('svg[aria-label*="standard normal curve"]')).toHaveCount(1);
    await expect(page.locator('svg[aria-label*="t-distribution and z-distribution"]')).toHaveCount(1);
    await expect(page.locator('svg[aria-label*="standard error shrinks"]')).toHaveCount(1);

    await expect(page.getByText("Live: SE vs Sample Size (the √n relationship)")).toHaveCount(0);
    await expect(page.getByText("Live: Watch SE shrink as n grows")).toHaveCount(0);
  });
});
