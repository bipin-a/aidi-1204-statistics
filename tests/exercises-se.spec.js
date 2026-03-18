import { test, expect } from "@playwright/test";

test.describe("SE exercises tracer bullet", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("SE section ends with a collapsed exercises block that reveals 4 exercise cards", async ({
    page,
  }) => {
    const se = page.locator("section#se");
    const remember = se.getByText("SE = σ/√n. More data → smaller SE, but 4× data only halves SE.");
    await expect(remember).toBeVisible();

    const exercisesToggle = se.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "false");

    await exercisesToggle.click();
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "true");
    await expect(se.getByText(/^EXERCISE$/)).toHaveCount(4);
  });

  test("SE exercise solutions stay hidden by default and reveal independently with rendered math", async ({
    page,
  }) => {
    const se = page.locator("section#se");
    const exercisesToggle = se.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await exercisesToggle.click();

    const solutionToggles = se.getByRole("button", { name: "Show Solution" });
    await expect(solutionToggles).toHaveCount(4);
    const baseKatexCount = await se.locator(".katex").count();

    const firstToggle = solutionToggles.nth(0);
    const secondToggle = solutionToggles.nth(1);
    await expect(firstToggle).toHaveAttribute("aria-expanded", "false");
    await expect(secondToggle).toHaveAttribute("aria-expanded", "false");

    await firstToggle.click();
    await expect(se.getByRole("button", { name: "Hide Solution" })).toHaveCount(1);
    await expect(se.getByRole("button", { name: "Show Solution" })).toHaveCount(3);
    await expect(secondToggle).toHaveAttribute("aria-expanded", "false");
    await expect(se).toContainText("the standard error also doubles");
    await expect
      .poll(async () => se.locator(".katex").count())
      .toBeGreaterThan(baseKatexCount);
    await expect
      .poll(async () => se.evaluate((node) => node.innerText))
      .not.toContain("\\sqrt{n}");
  });

  test("SE exercise disclosures are keyboard operable", async ({ page }) => {
    const se = page.locator("section#se");
    const exercisesToggle = se.getByRole("button", { name: /Exercises \(4 questions\)/ });

    await exercisesToggle.focus();
    await page.keyboard.press("Enter");
    await expect(exercisesToggle).toHaveAttribute("aria-expanded", "true");

    const firstSolutionToggle = se.getByRole("button", { name: "Show Solution" }).first();
    await firstSolutionToggle.focus();
    await page.keyboard.press("Space");

    await expect(se.getByRole("button", { name: "Hide Solution" })).toHaveCount(1);
  });

  test("SE exercises stay usable on mobile without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const se = page.locator("section#se");
    const exercisesToggle = se.getByRole("button", { name: /Exercises \(4 questions\)/ });
    await exercisesToggle.click();

    const firstSolutionToggle = se.getByRole("button", { name: "Show Solution" }).first();
    await firstSolutionToggle.click();

    await expect(exercisesToggle).toBeVisible();
    await expect(se.getByRole("button", { name: "Hide Solution" })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("SE exercise cards are visually distinct from worked examples", async ({ page }) => {
    const se = page.locator("section#se");
    await se.getByRole("button", { name: /Exercises \(4 questions\)/ }).click();

    const exerciseLabel = se.getByText(/^EXERCISE$/).first();
    const workedLabel = page.getByText("Worked Example").first();
    await expect(exerciseLabel).toBeVisible();
    await expect(workedLabel).toBeVisible();

    const [exerciseBorder, workedBorder] = await Promise.all([
      exerciseLabel.evaluate((node) => {
        let current = node.parentElement;
        while (current) {
          const style = window.getComputedStyle(current);
          if (parseFloat(style.borderLeftWidth) > 0) return style.borderLeftColor;
          current = current.parentElement;
        }
        return "";
      }),
      workedLabel.evaluate((node) => {
        let current = node.parentElement;
        while (current) {
          const style = window.getComputedStyle(current);
          if (parseFloat(style.borderLeftWidth) > 0) return style.borderLeftColor;
          current = current.parentElement;
        }
        return "";
      }),
    ]);

    expect(exerciseBorder).not.toBe("");
    expect(workedBorder).not.toBe("");
    expect(exerciseBorder).not.toBe(workedBorder);
  });
});
