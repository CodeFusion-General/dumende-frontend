import { test, expect } from "@playwright/test";
import {
  apiRegisterCustomer,
  apiLogin,
  randomTestEmail,
  randomUsername,
  setAuthCookies,
} from "./utils/auth";
import {
  API_BASE_URL,
  seedCaptainBoatWithAvailability,
  seedCaptainTourWithAvailability,
} from "./utils/testSeeds";

test.describe("Prod Check #4–7 - Booking & Availability (UI smoke)", () => {
  test("customer can create boat booking via BookingForm for available date", async ({
    page,
    request,
  }) => {
    // Seed captain + ACTIVE boat + availability
    const { boatId, availabilityDate } = await seedCaptainBoatWithAvailability(
      request
    );

    // Create customer for booking
    const email = randomTestEmail("customer-booking");
    const username = randomUsername("customer_booking");
    const password = "CustomerBook1!";

    await apiRegisterCustomer(request, { email, username, password });
    const loginRes = await apiLogin(request, email, password);
    await setAuthCookies(page, loginRes);

    // Go to boat detail page
    await page.goto(`/boats/${boatId}`);

    // Açılışta Booking formun ve "Select date" butonunun gelmesini bekle
    const dateButton = page.getByRole("button", { name: /Select date/i });
    await expect(dateButton).toBeVisible();

    // Takvimi aç
    await dateButton.click();

    // DayPicker gün butonlarının render olmasını bekle
    await page.waitForSelector('button[name="day"]', { timeout: 10_000 });

    // Seed edilen availability tarihinin gün kısmını al
    const dayPart = availabilityDate.split("-")[2]?.replace(/^0/, "") ?? "";

    // İlgili günü temsil eden butonu bul
    const targetDayButton = page
      .locator('button[name="day"]')
      .filter({ hasText: new RegExp(`^${dayPart}$`) });

    // Viewport/flakiness problemlerini atlamak için click'i direkt DOM üzerinden tetikliyoruz
    await targetDayButton
      .first()
      .evaluate((el) => (el as HTMLButtonElement).click());

    // Saat ve diğer alanlar default değerlerle kullanılacak (10:00, 4 saat, 2 kişi)

    // Rezervasyon butonuna tıkla (desktop Booking card içindeki)
    const bookNowButton = page
      .getByRole("button", { name: /Book Now/i })
      .first();
    await bookNowButton.click();

    // Rezervasyon oluşturuldu toast'ını bekle
    await expect(
      page.getByText(/Rezervasyon oluşturuldu/i, { exact: false })
    ).toBeVisible();

    // Ödeme veya rezervasyonlar sayfasına yönlendirme bekle
    await page.waitForURL(/(payment\/return|my-bookings)/, {
      timeout: 60_000,
    });
  });

  test("customer can create tour booking via TourBookingForm for available date", async ({
    page,
    request,
  }) => {
    // Seed captain + tour + availability via backend helper
    const { tourId, availabilityDate } = await seedCaptainTourWithAvailability(
      request
    );

    // 7) Create booking customer and login
    const bookingEmail = randomTestEmail("tour-customer");
    const bookingUsername = randomUsername("tour_customer");
    const bookingPassword = "TourCust1!";

    await apiRegisterCustomer(request, {
      email: bookingEmail,
      username: bookingUsername,
      password: bookingPassword,
    });
    const bookingLogin = await apiLogin(request, bookingEmail, bookingPassword);
    await setAuthCookies(page, bookingLogin);

    // 8) Navigate to tour detail page
    await page.goto(`/tours/${tourId}`);

    // Tour booking form: Müsaitlik takvimi + "Rezervasyon Yap" butonu
    await expect(
      page.getByRole("heading", { name: /Müsaitlik Durumu/i })
    ).toBeVisible();

    // DayPicker gün butonlarının render olmasını bekle
    await page.waitForSelector('button[name="day"]', { timeout: 10_000 });

    // Seed edilen availability tarihinin gün kısmını al
    const tourDayPart = availabilityDate.split("-")[2]?.replace(/^0/, "") ?? "";

    // İlgili günü temsil eden butonu bul
    const tourDayButton = page
      .locator('button[name="day"]')
      .filter({ hasText: new RegExp(`^${tourDayPart}$`) });

    await tourDayButton
      .first()
      .evaluate((el) => (el as HTMLButtonElement).click());

    // Grup büyüklüğü seç (1 kişi default, yeterli)

    // Rezervasyon butonuna bas (mobile ya da desktop'ta "Rezervasyon Yap")
    const reserveButton = page
      .getByRole("button", { name: /Rezervasyon Yap/i })
      .first();
    await reserveButton.click();

    // Rezervasyon oluşturuldu toast’ını bekle
    await expect(
      page.getByText(/Rezervasyon oluşturuldu/i, { exact: false })
    ).toBeVisible();

    // Ödeme veya rezervasyonlar sayfasına yönlendirme bekle
    await page.waitForURL(/(payment\/return|my-bookings)/, {
      timeout: 60_000,
    });
  });
});
