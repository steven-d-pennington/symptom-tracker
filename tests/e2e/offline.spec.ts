import { test, expect } from "@playwright/test";

test.describe("PWA offline support", () => {
  test("loads the app shell and offline assets without network", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.waitForFunction(() => navigator.serviceWorker?.controller);

    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(
      page.getByText("Offline — changes will sync later 🔄", { exact: true })
    ).toBeVisible();

    await expect(page).toHaveTitle(/Pocket Symptom Tracker/i);

    const offlineImageStatus = await page.evaluate(async () => {
      const response = await fetch("/offline-image.svg");
      return response.status;
    });
    expect(offlineImageStatus).toBe(200);

    const registrationActive = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker?.ready;
      return Boolean(registration?.active);
    });
    expect(registrationActive).toBeTruthy();
  });
});
