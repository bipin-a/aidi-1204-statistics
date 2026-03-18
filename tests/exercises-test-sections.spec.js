import { test, expect } from "@playwright/test";

test.describe("Test-section exercises", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Z-Test section ends with a collapsed exercises block that reveals 4 exercise cards", async ({
    page,
  }) => {
    const zTest = page.locator("section#z-test");
    const remember = zTest.getByText("z = (observed − expected) / SE. Compare p to α. Know your tail direction.");
    await expect(remember).toBeVisible();

    const exercisesToggle = zTest.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "false");

    await exercisesToggle.click();
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "true");
    await expect(zTest.getByText(/^EXERCISE$/)).toHaveCount(4);
  });

  test("t-Tests section includes a mixed exercise block covering one-sample, two-sample, and paired scenarios", async ({
    page,
  }) => {
    const tTest = page.locator("section#t-test");
    const exercisesToggle = tTest.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "false");

    await exercisesToggle.click();
    await expect(tTest.getByText(/^EXERCISE$/)).toHaveCount(4);
    await expect(tTest).toContainText("one-sample t-test");
    await expect(tTest).toContainText("two-sample t-test");
    await expect(tTest).toContainText("paired t-test");
  });

  test("A/B section reveals 4 exercises and renders math when a solution is opened", async ({ page }) => {
    const ab = page.locator("section#ab-test");
    const exercisesToggle = ab.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "false");

    await exercisesToggle.click();
    await expect(ab.getByText(/^EXERCISE$/)).toHaveCount(4);

    const baseKatexCount = await ab.locator(".katex").count();
    await ab.getByRole("button", { name: "Show Solution" }).nth(0).click();

    await expect(ab.getByRole("button", { name: "Hide Solution" })).toHaveCount(1);
    await expect
      .poll(async () => ab.locator(".katex").count())
      .toBeGreaterThan(baseKatexCount);
  });
});
