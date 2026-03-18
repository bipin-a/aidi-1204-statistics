// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Accessibility — PRD requirements", () => {
  test("nav link click moves focus to the destination section", async ({ page }) => {
    const navLink = page.locator("button.tutorial-nav-link", { hasText: "Z-Test" });
    const targetSection = page.locator("section#z-test");

    await expect(navLink).toBeVisible();
    await expect(targetSection).toBeAttached();

    await navLink.click();

    await expect(targetSection).toBeFocused();
  });

  test("calculator option buttons expose selected state with aria-pressed", async ({
    page,
  }) => {
    const zTest = page.locator("section#z-test");
    const leftTail = zTest.getByRole("button", {
      name: "Left-tailed",
      exact: true,
    });
    const rightTail = zTest.getByRole("button", {
      name: "Right-tailed",
      exact: true,
    });
    const twoTail = zTest.getByRole("button", {
      name: "Two-tailed",
      exact: true,
    });

    await expect(leftTail).toHaveAttribute("aria-pressed", "false");
    await expect(rightTail).toHaveAttribute("aria-pressed", "false");
    await expect(twoTail).toHaveAttribute("aria-pressed", "true");

    await leftTail.click();

    await expect(leftTail).toHaveAttribute("aria-pressed", "true");
    await expect(rightTail).toHaveAttribute("aria-pressed", "false");
    await expect(twoTail).toHaveAttribute("aria-pressed", "false");
  });
});
