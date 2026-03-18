// @ts-check
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("DD disclosure panels", () => {
  test("disclosure panels are collapsed by default", async ({ page }) => {
    const buttons = page.locator("button.tutorial-disclosure-button");
    await expect(buttons.first()).toBeVisible();

    // All disclosure buttons should start with aria-expanded="false"
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveAttribute("aria-expanded", "false");
    }

    // The content panels referenced by aria-controls should not be in the DOM
    // (the app conditionally renders them with {o && ...})
    const firstButton = buttons.first();
    const panelId = await firstButton.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    await expect(page.locator(`[id="${panelId}"]`)).not.toBeVisible();
  });

  test("clicking a disclosure button expands it", async ({ page }) => {
    const firstButton = page.locator("button.tutorial-disclosure-button").first();
    const panelId = await firstButton.getAttribute("aria-controls");

    // Click to expand
    await firstButton.click();

    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
  });

  test("clicking again collapses the disclosure", async ({ page }) => {
    const firstButton = page.locator("button.tutorial-disclosure-button").first();
    const panelId = await firstButton.getAttribute("aria-controls");

    // Expand
    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();

    // Collapse
    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(`[id="${panelId}"]`)).not.toBeVisible();
  });
});

test.describe("Confusion disclosure panels", () => {
  test("confusion panels are collapsed by default", async ({ page }) => {
    // Confusion panels have a dashed teal border and a 💡 icon.
    // They share the .tutorial-disclosure-button class but live inside
    // a container with a dashed border. We identify them by the 💡 icon
    // inside the button.
    const confusionButtons = page.locator(
      'button.tutorial-disclosure-button:has(span:text("💡"))'
    );
    const count = await confusionButtons.count();

    if (count === 0) {
      test.skip(true, "No Confusion panels found on the page");
      return;
    }

    for (let i = 0; i < count; i++) {
      await expect(confusionButtons.nth(i)).toHaveAttribute(
        "aria-expanded",
        "false"
      );
    }
  });
});

test.describe("Independent toggling", () => {
  test("multiple disclosures can be independently toggled", async ({ page }) => {
    const buttons = page.locator("button.tutorial-disclosure-button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const first = buttons.nth(0);
    const second = buttons.nth(1);

    // Expand first only
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "false");

    // Expand second — first should remain expanded
    await second.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "true");

    // Collapse first — second should remain expanded
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
  });
});
