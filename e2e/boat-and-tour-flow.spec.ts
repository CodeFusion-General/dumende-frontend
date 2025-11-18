import { test, expect } from "@playwright/test";
import {
  apiRegisterCustomer,
  apiLogin,
  randomTestEmail,
  randomUsername,
  setAuthCookies,
} from "./utils/auth";

const API_BASE_URL = process.env.PLAYWRIGHT_API_URL || "http://localhost:8080";

test.describe("Prod Check #2 & #3 - Boat & Tour Lifecycle (UI smoke)", () => {
  test("captain can see boat and tour creation screens after role promotion", async ({
    page,
    request,
  }) => {
    const email = randomTestEmail("lifecycle");
    const password = "Lifecycle1!";
    const username = randomUsername("lifecycle");

    // 1) Customer register
    await apiRegisterCustomer(request, { email, username, password });

    // 2) Login as CUSTOMER
    const customerLogin = await apiLogin(request, email, password);
    expect(customerLogin.role).toBe("CUSTOMER");

    // 3) Kaptan başvurusu backend üzerinden (UI yerine API ile)
    const captainCommand = {
      userId: customerLogin.userId,
      licenseNumber: `LIC-${customerLogin.userId}`,
      licenseExpiry: "2030-12-31",
      yearsOfExperience: 5,
      specializations: ["BOAT", "TOUR"],
      bio: "Boat & tour lifecycle E2E",
      contractApproved: true,
      contractVersion: "v1",
    };

    const captainRes = await request.post(
      `${API_BASE_URL}/api/captain-applications`,
      {
        data: captainCommand,
        headers: {
          Authorization: `Bearer ${customerLogin.token}`,
        },
      }
    );
    expect(captainRes.ok()).toBeTruthy();
    const captainJson: any = await captainRes.json();
    const applicationId: number = captainJson.id;

    // 4) Admin ile backend üzerinden başvuruyu onayla (admin kullanıcı var varsayımıyla)
    const adminEmail =
      process.env.PLAYWRIGHT_ADMIN_EMAIL || "e2e-admin@test.local";
    const adminPassword =
      process.env.PLAYWRIGHT_ADMIN_PASSWORD || "E2EAdmin123!";

    const adminLogin = await apiLogin(request, adminEmail, adminPassword);

    const bulkReq = {
      adminId: adminLogin.accountId,
      entityIds: [applicationId],
      captainActionType: "APPROVE",
      actionType: "APPROVE",
    };

    const bulkRes = await request.post(
      `${API_BASE_URL}/api/admin/captain-applications/bulk/approve`,
      {
        data: bulkReq,
        headers: {
          Authorization: `Bearer ${adminLogin.token}`,
        },
      }
    );
    expect(bulkRes.ok()).toBeTruthy();

    // 5) Aynı kullanıcıyla tekrar login ol ve rolün BOAT_OWNER olduğunu doğrula
    const captainLogin = await apiLogin(request, email, password);
    expect(captainLogin.role).toBe("BOAT_OWNER");
    await setAuthCookies(page, captainLogin);

    // 6) Captain panelde boat oluşturma sayfasına erişebilmeli
    await page.goto("/captain/vessels");
    await expect(
      page.getByRole("heading", {
        name: /Taşıtlarım|Taşıtlar|Vessels?/i,
      })
    ).toBeVisible();

    // 7) Captain panelde tour oluşturma sayfasına erişebilmeli
    await page.goto("/captain/tours");
    await expect(
      page.getByRole("heading", {
        name: /Turlarım|Tours/i,
      })
    ).toBeVisible();
  });
});
