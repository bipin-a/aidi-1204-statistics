// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function setNumericInput(scope, label, value) {
  const input = scope.getByLabel(label, { exact: true });
  await input.fill(String(value));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readResult(table, label) {
  const header = table
    .locator("th")
    .filter({ hasText: new RegExp(`^${escapeRegex(label)}$`, "i") })
    .first();
  const row = header.locator("xpath=ancestor::tr[1]");

  return ((await row.locator("td").textContent()) || "").trim();
}

function readLeadingNumber(text) {
  const match = text.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

test.describe("Calculator results", () => {
  test("z-test calculator computes expected outputs from numeric inputs", async ({
    page,
  }) => {
    const zTest = page.locator("section#z-test");
    const results = zTest.locator("table").filter({ hasText: "Decision" }).first();

    await setNumericInput(zTest, "Sample mean (x̄)", 35);
    await setNumericInput(zTest, "Hypothesized mean (μ₀)", 30);
    await setNumericInput(zTest, "Population standard deviation (σ)", 15);
    await setNumericInput(zTest, "Sample size (n)", 36);

    await expect(results).toContainText("Critical value");
    expect(readLeadingNumber(await readResult(results, "SE"))).toBeCloseTo(2.5, 1);
    expect(readLeadingNumber(await readResult(results, "Observed z"))).toBeCloseTo(2.0, 1);
    expect(readLeadingNumber(await readResult(results, "p-value"))).toBeCloseTo(0.0455, 2);
    await expect(results).toContainText("Reject H0");
  });

  test("one-sample t calculator reports the expected decision", async ({
    page,
  }) => {
    const tTests = page.locator("section#t-test");
    const oneSample = tTests.locator("table").filter({ hasText: "Critical value" }).nth(0);

    await setNumericInput(tTests, "Sample mean (x̄)", 105);
    await setNumericInput(tTests, "Hypothesized mean (μ₀)", 100);
    await setNumericInput(tTests, "Sample standard deviation (s)", 15);
    await setNumericInput(tTests, "Sample size (n)", 25);

    expect(readLeadingNumber(await readResult(oneSample, "SE"))).toBeCloseTo(3.0, 1);
    expect(readLeadingNumber(await readResult(oneSample, "df"))).toBe(24);
    expect(readLeadingNumber(await readResult(oneSample, "t-statistic"))).toBeCloseTo(1.667, 1);
    expect(readLeadingNumber(await readResult(oneSample, "p-value"))).toBeCloseTo(0.1088, 2);
    await expect(oneSample).toContainText("Fail to reject");
  });

  test("two-sample t calculator handles a strong group difference", async ({
    page,
  }) => {
    const tTests = page.locator("section#t-test");
    const twoSample = tTests.locator("table").filter({ hasText: "Cohen's d (avg. variance)" }).first();

    await setNumericInput(tTests, "Group 1 mean (x̄₁)", 100);
    await setNumericInput(tTests, "Group 1 standard deviation (s₁)", 5);
    await setNumericInput(tTests, "Group 1 sample size (n₁)", 50);
    await setNumericInput(tTests, "Group 2 mean (x̄₂)", 80);
    await setNumericInput(tTests, "Group 2 standard deviation (s₂)", 5);
    await setNumericInput(tTests, "Group 2 sample size (n₂)", 50);

    await expect(twoSample).toContainText("<0.001");
    await expect(twoSample).toContainText("Reject H0");
    await expect(twoSample).toContainText("Cohen's d (avg. variance)");
  });

  test("paired t calculator fails to reject when the mean difference is near zero", async ({
    page,
  }) => {
    const tTests = page.locator("section#t-test");
    const paired = tTests.locator("table").filter({ hasText: "Critical value" }).nth(2);

    await setNumericInput(tTests, "Mean difference (d̄)", 0.1);
    await setNumericInput(tTests, "Standard deviation of differences (s_d)", 5);
    await setNumericInput(tTests, "Number of pairs (n)", 10);

    expect(readLeadingNumber(await readResult(paired, "p-value"))).toBeGreaterThan(0.05);
    await expect(paired).toContainText("Fail to reject");
  });

  test("a/b calculator computes the worked-example values", async ({ page }) => {
    const abTest = page.locator("section#ab-test");
    const results = abTest.locator("table").filter({ hasText: "Decision" }).first();

    expect(readLeadingNumber(await readResult(results, "Pooled proportion"))).toBeCloseTo(0.134, 3);
    expect(readLeadingNumber(await readResult(results, "SE"))).toBeCloseTo(0.0152, 3);
    expect(readLeadingNumber(await readResult(results, "z-score"))).toBeCloseTo(1.838, 2);
    expect(readLeadingNumber(await readResult(results, "p-value"))).toBeCloseTo(0.066, 2);
    await expect(results).toContainText("Not significant");
  });
});
