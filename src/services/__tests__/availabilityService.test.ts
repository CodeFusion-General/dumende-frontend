import { dateUtils } from "../availabilityService";

describe("AvailabilityService Date Utils", () => {
  describe("formatDateForAPI", () => {
    it("should convert ISO date to ISO format (backend expects ISO)", () => {
      const isoDate = "2024-03-15";
      const apiDate = dateUtils.formatDateForAPI(isoDate);
      expect(apiDate).toBe("2024-03-15");
    });

    it("should handle single digit days and months", () => {
      const isoDate = "2024-01-05";
      const apiDate = dateUtils.formatDateForAPI(isoDate);
      expect(apiDate).toBe("2024-01-05");
    });
  });

  describe("formatDateFromAPI", () => {
    it("should return API date as-is (already ISO format)", () => {
      const apiDate = "2024-03-15";
      const isoDate = dateUtils.formatDateFromAPI(apiDate);
      expect(isoDate).toBe("2024-03-15");
    });

    it("should handle single digit days and months", () => {
      const apiDate = "2024-01-05";
      const isoDate = dateUtils.formatDateFromAPI(apiDate);
      expect(isoDate).toBe("2024-01-05");
    });
  });

  describe("isAPIFormat", () => {
    it("should return true for API format dates (ISO format)", () => {
      expect(dateUtils.isAPIFormat("2024-03-15")).toBe(true);
      expect(dateUtils.isAPIFormat("2023-12-01")).toBe(true);
    });

    it("should return false for non-API format dates", () => {
      expect(dateUtils.isAPIFormat("15-03-2024")).toBe(false);
      expect(dateUtils.isAPIFormat("15/03/2024")).toBe(false);
      expect(dateUtils.isAPIFormat("invalid-date")).toBe(false);
    });
  });

  describe("isISOFormat", () => {
    it("should return true for ISO format dates", () => {
      expect(dateUtils.isISOFormat("2024-03-15")).toBe(true);
      expect(dateUtils.isISOFormat("2023-12-01")).toBe(true);
    });

    it("should return false for non-ISO format dates", () => {
      expect(dateUtils.isISOFormat("15-03-2024")).toBe(false);
      expect(dateUtils.isISOFormat("15/03/2024")).toBe(false);
      expect(dateUtils.isISOFormat("invalid-date")).toBe(false);
    });
  });
});
