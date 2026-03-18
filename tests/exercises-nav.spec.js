import { test, expect } from "@playwright/test";

test.describe("Exercises sidebar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sidebar shows all implemented exercise links and clicking one scrolls to an auto-expanded block", async ({
    page,
  }) => {
    const nav = page.locator("nav");
    await expect(nav.locator(".tutorial-nav-group").filter({ hasText: /^Exercises$/ })).toBeVisible();

    const exerciseLinks = nav.locator("button.tutorial-nav-link").filter({ hasText: /Exercises$/ });
    const expected = [
      { label: "SE Exercises", id: "#se-exercises" },
      { label: "DF Exercises", id: "#df-exercises" },
      { label: "CLT Exercises", id: "#clt-exercises" },
      { label: "Z Exercises", id: "#z-exercises" },
      { label: "t Exercises", id: "#t-exercises" },
      { label: "A/B Exercises", id: "#ab-exercises" },
    ];

    await expect(exerciseLinks).toHaveCount(expected.length);
    await expect(exerciseLinks).toHaveText(expected.map((item) => item.label));

    for (const item of expected) {
      await nav.getByRole("button", { name: item.label, exact: true }).click();

      const exerciseBlock = page.locator(item.id);
      await expect
        .poll(async () =>
          exerciseBlock.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            return rect.top >= 0 && rect.top < window.innerHeight;
          }),
        )
        .toBe(true);

      await expect(
        exerciseBlock.getByRole("button", { name: /Exercises \(4 questions\)/ }),
      ).toHaveAttribute("aria-expanded", "true");
    }
  });

  test("exercise nav item uses the existing active-state highlighting", async ({ page }) => {
    const nav = page.locator("nav");
    const seExercisesLink = nav.getByRole("button", { name: "SE Exercises" });
    const standardErrorLink = nav.getByRole("button", { name: "Standard Error" });

    await seExercisesLink.click();

    await expect.poll(async () => seExercisesLink.getAttribute("aria-current")).toBe("location");
    await expect.poll(async () => standardErrorLink.getAttribute("aria-current")).toBeNull();
  });

  test("mobile exercise nav closes the sidebar and scrolls to the expanded exercise block", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const navToggle = page.locator("button.tutorial-nav-toggle");
    await expect(navToggle).toContainText("Browse Sections");
    await navToggle.click();
    await expect(navToggle).toHaveAttribute("aria-expanded", "true");

    const seExercisesLink = page.locator("nav").getByRole("button", { name: "SE Exercises" });
    await seExercisesLink.click();

    await expect(navToggle).toHaveAttribute("aria-expanded", "false");

    const exerciseBlock = page.locator("#se-exercises");
    await expect
      .poll(async () =>
        exerciseBlock.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return rect.top >= 0 && rect.top < window.innerHeight;
        }),
      )
      .toBe(true);
    await expect(
      exerciseBlock.getByRole("button", { name: /Exercises \(4 questions\)/ }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
