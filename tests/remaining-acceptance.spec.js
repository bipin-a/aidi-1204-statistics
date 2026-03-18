// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Remaining issue acceptance", () => {
  test("SE, DF, and A/B use disclosures for secondary explanation", async ({ page }) => {
    const se = page.locator("section#se");
    const df = page.locator("section#df");
    const ab = page.locator("section#ab-test");

    await expect(se.getByRole("button", { name: /Why √n\?/ })).toBeVisible();

    await expect(df.getByRole("button", { name: /Why df = n − 1/ })).toBeVisible();
    await expect(df).not.toContainText("4 friends, 4 chairs");
    await expect(df).not.toContainText("Once you know the mean and n−1 values");

    await expect(ab.getByRole("button", { name: /Why pooling works/ })).toBeVisible();
    await expect(ab).not.toContainText("observed result");
  });

  test("Decision Guide keeps one concise reference visible and moves extras behind disclosures", async ({
    page,
  }) => {
    const decision = page.locator("section#decision");

    await expect(decision.locator("table")).toBeVisible();
    await expect(decision.getByRole("button", { name: /Practical workflow/ })).toBeVisible();
    await expect(decision.getByRole("button", { name: /Decision tree reference/ })).toBeVisible();
    await expect(decision).not.toContainText("Central Limit Theorem");
  });

  test("visible labels and control captions stay at or above 11px", async ({ page }) => {
    const offenders = await page
      .locator("label, caption, th, button.tutorial-nav-link, button.tutorial-disclosure-button")
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.visibility !== "hidden" &&
              parseFloat(style.fontSize) < 11
            );
          })
          .map((element) => ({
            text: element.textContent?.trim(),
            fontSize: window.getComputedStyle(element).fontSize,
          }))
      );

    expect(offenders).toEqual([]);
  });

  test("static figures, calculator inputs, and results tables expose accessible text", async ({
    page,
  }) => {
    const svgLabels = await page.locator("svg[aria-label]").evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("aria-label"))
    );
    expect(svgLabels.length).toBeGreaterThanOrEqual(3);
    expect(svgLabels.every((label) => label && label.length >= 20)).toBe(true);

    const sliderPairs = await page.locator('input[type="range"]').evaluateAll((elements) =>
      elements.map((element) => {
        const sliderLabel = element.getAttribute("aria-label") || "";
        const numericLabel = sliderLabel.replace(/ slider$/, "");
        const pair = document.querySelector(`input[type="number"][aria-label="${CSS.escape(numericLabel)}"]`);
        return { sliderLabel, hasPair: Boolean(pair) };
      })
    );
    expect(sliderPairs.every((pair) => pair.hasPair)).toBe(true);

    const tableChecks = await page.locator("table").evaluateAll((tables) =>
      tables
        .filter((table) => table.querySelector("caption")?.textContent?.includes("Calculator Summary"))
        .map((table) => ({
          caption: table.querySelector("caption")?.textContent?.trim(),
          rowHeaderCount: table.querySelectorAll('th[scope="row"]').length,
          rowCount: table.querySelectorAll("tbody tr").length,
        }))
    );

    expect(tableChecks.length).toBeGreaterThan(0);
    expect(
      tableChecks.every((table) => table.caption && table.rowCount > 0 && table.rowHeaderCount === table.rowCount)
    ).toBe(true);
  });
});
