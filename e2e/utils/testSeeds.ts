import type { APIRequestContext } from "@playwright/test";
import { test, expect } from "@playwright/test";
import {
  apiRegisterCustomer,
  apiLogin,
  randomTestEmail,
  randomUsername,
} from "./auth";
import type { LoginResponse } from "./auth";

export const API_BASE_URL =
  process.env.PLAYWRIGHT_API_URL || "http://localhost:8080";

export interface SeedBoatResult {
  boatId: number;
  captainLogin: LoginResponse;
  adminLogin: LoginResponse;
  availabilityDate: string; // yyyy-MM-dd
}

export interface SeedTourResult {
  tourId: number;
  captainLogin: LoginResponse;
  adminLogin: LoginResponse;
  availabilityDate: string; // yyyy-MM-dd
}

/**
 * Backend seed helper:
 *  - CUSTOMER register → captain application → admin APPROVE → BOAT_OWNER
 *  - Captain creates ACTIVE boat
 *  - Captain creates single-day availability (instant confirmation)
 */
export async function seedCaptainBoatWithAvailability(
  request: APIRequestContext
): Promise<SeedBoatResult> {
  const email = randomTestEmail("boat-booking");
  const username = randomUsername("boat_booking_captain");
  const password = "BoatBook1!";

  // 1) Register captain as CUSTOMER
  await apiRegisterCustomer(request, { email, username, password });
  const customerLogin = await apiLogin(request, email, password);

  // 2) Captain application as CUSTOMER
  const captainCommand = {
    userId: customerLogin.userId,
    licenseNumber: `LIC-${customerLogin.userId}`,
    licenseExpiry: "2030-12-31",
    yearsOfExperience: 5,
    specializations: ["BOAT"],
    bio: "E2E boat booking captain",
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

  if (!captainRes.ok()) {
    throw new Error(
      `Captain application failed: ${captainRes.status()} ${await captainRes
        .text()
        .catch(() => "")}`
    );
  }
  const captainJson: any = await captainRes.json();
  const applicationId: number = captainJson.id;

  // 3) Admin approves captain application (or skip test if admin login fails)
  const adminEmail =
    process.env.PLAYWRIGHT_ADMIN_EMAIL || "e2e-admin@test.local";
  const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD || "E2EAdmin123!";

  let adminLogin: LoginResponse;
  adminLogin = await apiLogin(request, adminEmail, adminPassword);

  const bulkReq = {
    adminId: adminLogin.accountId,
    entityIds: [applicationId],
    captainActionType: "APPROVE",
    // Backend BulkOperationRequest için actionType alanı zorunlu.
    // Java tarafındaki BulkCaptainApplicationRequest JSON çıktısına uyumlu olması için
    // hem captainActionType hem actionType alanlarını gönderiyoruz.
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

  if (!bulkRes.ok()) {
    throw new Error(
      `Captain bulk approve failed: ${bulkRes.status()} ${await bulkRes
        .text()
        .catch(() => "")}`
    );
  }

  // 4) Captain login (role should be BOAT_OWNER)
  const captainLogin = await apiLogin(request, email, password);
  expect(captainLogin.role).toBe("BOAT_OWNER");

  // 5) Captain creates a boat
  const createBoatBody = {
    name: "E2E Booking Boat",
    description: "Boat for E2E booking flow",
    location: "Istanbul",
    capacity: 10,
    type: "MOTORBOAT",
    dailyPrice: 1000,
    hourlyPrice: 250,
  };

  const boatRes = await request.post(`${API_BASE_URL}/api/boats`, {
    data: createBoatBody,
    headers: {
      Authorization: `Bearer ${captainLogin.token}`,
    },
  });

  if (!boatRes.ok()) {
    throw new Error(
      `Boat creation failed: ${boatRes.status()} ${await boatRes
        .text()
        .catch(() => "")}`
    );
  }

  const boatJson: any = await boatRes.json();
  const boatId: number = boatJson.id;

  // 6) Admin forces boat status to ACTIVE so it is bookable
  const statusRes = await request.patch(
    `${API_BASE_URL}/api/admin/boats/${boatId}/status?status=ACTIVE`,
    {
      headers: {
        Authorization: `Bearer ${adminLogin.token}`,
      },
    }
  );

  if (!statusRes.ok()) {
    throw new Error(
      `Boat status update failed: ${statusRes.status()} ${await statusRes
        .text()
        .catch(() => "")}`
    );
  }

  // 7) Captain creates availability for a single future date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 10);
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const availabilityPayload = {
    boatId,
    date: dateStr,
    isAvailable: true,
    isInstantConfirmation: true,
    totalCapacity: createBoatBody.capacity,
  };

  const availRes = await request.post(`${API_BASE_URL}/api/availabilities`, {
    data: availabilityPayload,
    headers: {
      Authorization: `Bearer ${captainLogin.token}`,
    },
  });

  if (!availRes.ok()) {
    throw new Error(
      `Availability creation failed: ${availRes.status()} ${await availRes
        .text()
        .catch(() => "")}`
    );
  }

  return { boatId, captainLogin, adminLogin, availabilityDate: dateStr };
}

/**
 * Backend seed helper for tours:
 *  - CUSTOMER register → captain application → admin APPROVE → BOAT_OWNER
 *  - Captain creates ACTIVE tour
 *  - Captain creates single-day availability for the tour
 */
export async function seedCaptainTourWithAvailability(
  request: APIRequestContext
): Promise<SeedTourResult> {
  const tourEmail = randomTestEmail("tour-booking");
  const tourUsername = randomUsername("tour_booking_captain");
  const tourPassword = "TourBook1!";

  // 1) Register captain as CUSTOMER
  await apiRegisterCustomer(request, {
    email: tourEmail,
    username: tourUsername,
    password: tourPassword,
  });
  const customerLogin = await apiLogin(request, tourEmail, tourPassword);

  // 2) Captain application
  const captainCommand = {
    userId: customerLogin.userId,
    licenseNumber: `LIC-${customerLogin.userId}`,
    licenseExpiry: "2030-12-31",
    yearsOfExperience: 5,
    specializations: ["TOUR"],
    bio: "E2E tour booking captain",
    contractApproved: true,
    contractVersion: "v1",
  };

  const captainRes = await request.post(
    `${API_BASE_URL}/api/captain-applications`,
    {
      data: captainCommand,
      headers: { Authorization: `Bearer ${customerLogin.token}` },
    }
  );
  if (!captainRes.ok()) {
    throw new Error(
      `Captain application failed for tour booking: ${captainRes.status()} ${await captainRes
        .text()
        .catch(() => "")}`
    );
  }
  const captainJson: any = await captainRes.json();
  const applicationId: number = captainJson.id;

  // 3) Admin approves captain application
  const adminEmail =
    process.env.PLAYWRIGHT_ADMIN_EMAIL || "e2e-admin@test.local";
  const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD || "E2EAdmin123!";

  const adminLogin: LoginResponse = await apiLogin(
    request,
    adminEmail,
    adminPassword
  );

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
      headers: { Authorization: `Bearer ${adminLogin.token}` },
    }
  );
  if (!bulkRes.ok()) {
    throw new Error(
      `Captain bulk approve failed for tour booking: ${bulkRes.status()} ${await bulkRes
        .text()
        .catch(() => "")}`
    );
  }

  // 4) Captain login and create tour
  const captainLogin = await apiLogin(request, tourEmail, tourPassword);

  // Hem TourDate hem de Availability için kullanılacak hedef tarih
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14);
  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const createTourBody = {
    name: "E2E Booking Tour",
    description: "Tour for E2E booking flow",
    fullDescription: "Full description for E2E tour booking flow",
    guideId: captainLogin.userId,
    price: 500,
    capacity: 10,
    location: "Istanbul",
    status: "PENDING",
    tourType: "BOAT",
    cancellationPolicy: "FLEXIBLE",
    // Tour status'ünü ACTIVE yapmadan önce en az bir future TourDate olması gerekiyor
    tourDates: [
      {
        startDate: `${dateStr}T10:00:00`,
        endDate: `${dateStr}T14:00:00`,
        durationText: "4 Saat",
        durationMinutes: 240,
        availabilityStatus: "AVAILABLE",
        maxGuests: 10,
        price: 500,
      },
    ],
  };

  const tourRes = await request.post(`${API_BASE_URL}/api/tours`, {
    data: createTourBody,
    headers: { Authorization: `Bearer ${captainLogin.token}` },
  });
  if (!tourRes.ok()) {
    throw new Error(
      `Tour creation failed: ${tourRes.status()} ${await tourRes
        .text()
        .catch(() => "")}`
    );
  }
  const tourJson: any = await tourRes.json();
  const tourId: number = tourJson.id;

  // 5) Admin sets tour status to ACTIVE
  const tourStatusRes = await request.patch(
    `${API_BASE_URL}/api/admin/tours/${tourId}/status?status=ACTIVE`,
    {
      headers: { Authorization: `Bearer ${adminLogin.token}` },
    }
  );
  if (!tourStatusRes.ok()) {
    throw new Error(
      `Tour status update failed: ${tourStatusRes.status()} ${await tourStatusRes
        .text()
        .catch(() => "")}`
    );
  }

  // 6) Captain creates availability for tour (aynı tarih)
  const tourAvailabilityPayload = {
    tourId,
    date: dateStr,
    isAvailable: true,
    isInstantConfirmation: true,
    // Kapasite yönetimi için toplam kapasiteyi de availability kaydına yaz
    totalCapacity: 10,
  };

  const tourAvailRes = await request.post(
    `${API_BASE_URL}/api/availabilities`,
    {
      data: tourAvailabilityPayload,
      headers: { Authorization: `Bearer ${captainLogin.token}` },
    }
  );
  if (!tourAvailRes.ok()) {
    throw new Error(
      `Tour availability creation failed: ${tourAvailRes.status()} ${await tourAvailRes
        .text()
        .catch(() => "")}`
    );
  }

  return { tourId, captainLogin, adminLogin, availabilityDate: dateStr };
}
