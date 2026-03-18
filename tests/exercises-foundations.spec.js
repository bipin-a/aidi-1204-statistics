import { test, expect } from "@playwright/test";

test.describe("Foundations exercises", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("DF section ends with a collapsed exercises block that reveals 4 exercise cards", async ({
    page,
  }) => {
    const df = page.locator("section#df");
    const remember = df.getByText("df = n−1. Low df → fat tails → need stronger evidence.");
    await expect(remember).toBeVisible();

    const exercisesToggle = df.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "false");

    await exercisesToggle.click();
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "true");
    await expect(df.getByText(/^EXERCISE$/)).toHaveCount(4);
  });

  test("CLT exercises stay collapsed by default and render math when a solution is revealed", async ({
    page,
  }) => {
    const clt = page.locator("section#clt");
    const remember = clt.getByText("Large n → sample mean is approximately Normal, regardless of population shape.");
    await expect(remember).toBeVisible();

    const exercisesToggle = clt.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "false");

    await exercisesToggle.click();
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "true");
    await expect(clt.getByText(/^EXERCISE$/)).toHaveCount(4);

    const solutionToggles = clt.getByRole("button", { name: "Show Solution" });
    await expect(solutionToggles).toHaveCount(4);

    const baseKatexCount = await clt.locator(".katex").count();
    await solutionToggles.nth(1).click();

    await expect(clt.getByRole("button", { name: "Hide Solution" })).toHaveCount(1);
    await expect
      .poll(async () => clt.locator(".katex").count())
      .toBeGreaterThan(baseKatexCount);
  });
});
