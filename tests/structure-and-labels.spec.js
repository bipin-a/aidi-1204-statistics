// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Issues #3, #4, and #5", () => {
  test("Key Terms card appears before The Big Picture and defines the core symbols", async ({
    page,
  }) => {
    const main = page.locator("main");
    const content = await main.textContent();
    const keyTermsIndex = content.indexOf("Key Terms");
    const bigPictureIndex = content.indexOf("The Big Picture");
    const firstH0Index = content.indexOf("H0");

    expect(keyTermsIndex).toBeGreaterThanOrEqual(0);
    expect(bigPictureIndex).toBeGreaterThan(keyTermsIndex);
    expect(firstH0Index).toBeGreaterThan(keyTermsIndex);

    const keyTerms = page.getByText("Key Terms").first().locator("..");
    await expect(keyTerms).toContainText("H0");
    await expect(keyTerms).toContainText("H1");
    await expect(keyTerms).toContainText("alpha");
    await expect(keyTerms).toContainText("p-value");
  });

  test("t-tests appear before A/B testing and section numbering is renumbered", async ({
    page,
  }) => {
    const order = await page
      .locator("#z-test, #t-test, #ab-test")
      .evaluateAll((elements) => elements.map((el) => el.id));

    expect(order).toEqual(["z-test", "t-test", "ab-test"]);
    await expect(page.locator("section#t-test")).toContainText("Part 5");
    await expect(page.locator("section#ab-test")).toContainText("Part 6");
  });

  test("calculator labels are standardized and calculator result rows use Decision", async ({
    page,
  }) => {
    await expect(page.locator("section#z-test")).toContainText("Sample mean (x̄)");
    await expect(page.locator("section#z-test")).toContainText(
      "Hypothesized mean (μ₀)"
    );
    await expect(page.locator("section#z-test")).toContainText(
      "Population standard deviation (σ)"
    );
    await expect(page.locator("section#t-test")).toContainText(
      "Sample standard deviation (s)"
    );
    await expect(page.locator("section#t-test")).toContainText(
      "Mean difference (d̄)"
    );

    await expect(page.locator("body")).not.toContainText("Sample mean Xbar");
    await expect(page.locator("body")).not.toContainText("Hypothesized mu0");
    await expect(page.locator("body")).not.toContainText("Population sigma");
    await expect(page.locator("body")).not.toContainText("Mean difference (dbar)");
    await expect(page.locator("body")).not.toContainText("+-");
    await expect(page.locator("body")).not.toContainText("!=");
    await expect(page.locator("body")).not.toContainText("Verdict");

    for (const sectionId of ["z-test", "ab-test", "t-test"]) {
      const resultsTable = page
        .locator(`section#${sectionId}`)
        .locator("table")
        .filter({ hasText: "Decision" })
        .first();

      await expect(resultsTable).toContainText("Decision");
      await expect(resultsTable).not.toContainText("Result");
      await expect(resultsTable).not.toContainText("Verdict");
    }
  });
});
