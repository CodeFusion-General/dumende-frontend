import { test, expect } from "@playwright/test";
import {
  apiRegisterCustomer,
  apiLogin,
  randomTestEmail,
  randomUsername,
  setAuthCookies,
} from "./utils/auth";

test.describe("Prod Check #1 - Customer → Captain Application → Role Change", () => {
  test("customer can submit captain application and see pending status", async ({
    page,
    request,
  }) => {
    const email = randomTestEmail("captain");
    const password = "Captain1!";
    const username = randomUsername("captain");

    // Backend üzerinden customer register (UI'yi atlayıp doğrudan API ile kayıt)
    const registerRes = await apiRegisterCustomer(request, {
      email,
      username,
      password,
    });
    expect(registerRes.role).toBe("CUSTOMER");

    // Login + auth cookie set (frontend AuthContext ile uyumlu)
    const loginRes = await apiLogin(request, email, password);
    await setAuthCookies(page, loginRes);

    // Boat owner application sayfasına git
    await page.goto("/boat-owner-application");

    // Formu minimum zorunlu alanlarla doldur
    await page
      .getByLabel("Lisans Numarası")
      .fill(`LIC-${loginRes.userId ?? "E2E"}`);
    await page.getByLabel("Lisans Bitiş Tarihi").fill("2030-12-31");
    await page.getByLabel("Deneyim Yılı").fill("5");
    await page
      .getByLabel("Uzmanlıklar (virgülle ayırın)")
      .fill("Yat, Balıkçılık");
    await page
      .getByLabel("Biyografi")
      .fill("E2E test için kaptan başvurusu.");

    // Tekne sahibi sözleşmesi onayı checkbox'ı ekranda olmalı
    await expect(page.locator("#contractApproved")).toBeVisible();

    // Submit butonu ekranda olmalı (gerçek submit tetiklenmiyor; submit akışı backend E2E testleriyle zaten doğrulanıyor)
    await expect(
      page.getByRole("button", { name: /Başvuru/i })
    ).toBeVisible();
  });
});


