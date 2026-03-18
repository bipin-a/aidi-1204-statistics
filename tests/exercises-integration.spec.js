import { test, expect } from "@playwright/test";

const EXERCISE_BLOCKS = [
  { id: "#se-exercises", label: "SE Exercises" },
  { id: "#df-exercises", label: "DF Exercises" },
  { id: "#clt-exercises", label: "CLT Exercises" },
  { id: "#z-exercises", label: "Z Exercises" },
  { id: "#t-exercises", label: "t Exercises" },
  { id: "#ab-exercises", label: "A/B Exercises" },
];

test.describe("Exercise feature integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("all 6 exercise blocks exist and expose 24 exercises total when expanded", async ({ page }) => {
    let totalExercises = 0;

    for (const blockInfo of EXERCISE_BLOCKS) {
      const block = page.locator(blockInfo.id);
      const outerToggle = block.getByRole("button", { name: /Exercises \(4 questions\)/ });

      await expect(block).toBeAttached();
      await expect(outerToggle).toHaveAttribute("aria-expanded", "false");

      await outerToggle.click();
      await expect(outerToggle).toHaveAttribute("aria-expanded", "true");

      const count = await block.getByText(/^EXERCISE$/).count();
      expect(count).toBe(4);
      totalExercises += count;
    }

    expect(totalExercises).toBe(24);
  });

  test("every revealed exercise solution contains rendered KaTeX", async ({ page }) => {
    for (const blockInfo of EXERCISE_BLOCKS) {
      const block = page.locator(blockInfo.id);
      await block.getByRole("button", { name: /Exercises \(4 questions\)/ }).click();

      const baseKatexCount = await block.locator(".katex").count();

      for (let i = 0; i < 4; i++) {
        await block.getByRole("button", { name: "Show Solution" }).first().click();
      }

      await expect(block.getByRole("button", { name: "Hide Solution" })).toHaveCount(4);
      await expect
        .poll(async () => block.locator(".katex").count())
        .toBeGreaterThanOrEqual(baseKatexCount + 4);
    }
  });

  test("all exercise links work on mobile without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const navToggle = page.locator("button.tutorial-nav-toggle");

    for (const blockInfo of EXERCISE_BLOCKS) {
      await navToggle.click();
      await expect(navToggle).toHaveAttribute("aria-expanded", "true");

      await page.locator("nav").getByRole("button", { name: blockInfo.label, exact: true }).click();
      await expect(navToggle).toHaveAttribute("aria-expanded", "false");

      const block = page.locator(blockInfo.id);
      await expect
        .poll(async () =>
          block.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            return rect.top >= 0 && rect.top < window.innerHeight;
          }),
        )
        .toBe(true);
      await expect(
        block.getByRole("button", { name: /Exercises \(4 questions\)/ }),
      ).toHaveAttribute("aria-expanded", "true");

      const firstSolutionToggle = block.getByRole("button", { name: "Show Solution" }).first();
      await firstSolutionToggle.click();
      await expect(block.getByRole("button", { name: "Hide Solution" })).toHaveCount(1);

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);
    }
  });
});
