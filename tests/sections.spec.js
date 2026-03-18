import { test, expect } from "@playwright/test";

const SECTIONS_IN_ORDER = [
  { id: "se", label: "Standard Error" },
  { id: "df", label: "Degrees of Freedom" },
  { id: "clt", label: "Central Limit Theorem" },
  { id: "z-test", label: "Z-Test" },
  { id: "t-test", label: "t-Tests" },
  { id: "ab-test", label: "A/B Testing" },
  { id: "wrong-test", label: "Wrong Test" },
  { id: "assumptions", label: "Assumptions" },
  { id: "beyond-p", label: "Beyond p-Values" },
  { id: "decision", label: "Decision Guide" },
];

test.describe("App structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with Hypothesis Testing in the nav", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toContainText("Hypothesis Testing");
  });

  test.describe("Sections exist in correct order", () => {
    for (const { id, label } of SECTIONS_IN_ORDER) {
      test(`section #${id} (${label}) exists`, async ({ page }) => {
        const section = page.locator(`#${id}`);
        await expect(section).toBeAttached();
      });
    }

    test("sections appear in the expected DOM order", async ({ page }) => {
      const ids = await page
        .locator(
          SECTIONS_IN_ORDER.map(({ id }) => `#${id}`).join(", ")
        )
        .evaluateAll((elements) => elements.map((el) => el.id));

      // Filter to only the IDs we care about, preserving DOM order
      const relevant = ids.filter((id) =>
        SECTIONS_IN_ORDER.some((s) => s.id === id)
      );

      expect(relevant).toEqual(SECTIONS_IN_ORDER.map((s) => s.id));
    });
  });

  test.describe("Nav links", () => {
    for (const { id, label } of SECTIONS_IN_ORDER) {
      test(`nav contains a link or button for ${label} (#${id})`, async ({
        page,
      }) => {
        const nav = page.locator("nav");
        // Look for an anchor with href pointing to the section,
        // or a button/link whose text matches the label
        const link = nav.locator(
          `a[href="#${id}"], a[href="/#${id}"], button:has-text("${label}")`
        );
        await expect(link.first()).toBeAttached();
      });
    }
  });
});
