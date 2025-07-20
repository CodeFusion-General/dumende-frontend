import {
  personalInfoFormSchema,
  professionalInfoFormSchema,
  captainProfileSchema,
  photoUploadSchema,
} from "../profile.schemas";
import { mockCaptainProfile } from "../../../mocks/captainProfile.mock";
import {
  PersonalInfoFormData,
  ProfessionalInfoFormData,
} from "../../../types/profile.types";

// Test data
const validPersonalInfoForm: PersonalInfoFormData = {
  firstName: "Ahmet",
  lastName: "Yılmaz",
  email: "ahmet@example.com",
  phone: "+90 532 123 4567",
  city: "İstanbul",
  country: "Turkey",
};

const invalidPersonalInfoForm = {
  firstName: "",
  lastName: "Yılmaz",
  email: "invalid-email",
  phone: "invalid-phone",
  city: "",
  country: "",
};

const validProfessionalInfoForm: ProfessionalInfoFormData = {
  licenseNumber: "TR-CAP-2019-001234",
  licenseExpiry: "2025-12-31",
  yearsOfExperience: 8,
  specializations: ["Luxury Yachts", "Sailing"],
};

// Test functions (these would normally be run by a test runner like Jest or Vitest)
export const testPersonalInfoValidation = () => {
  console.log("Testing personal info validation...");

  const validResult = personalInfoFormSchema.safeParse(validPersonalInfoForm);
  console.log("Valid personal info:", validResult.success ? "PASS" : "FAIL");

  const invalidResult = personalInfoFormSchema.safeParse(
    invalidPersonalInfoForm
  );
  console.log(
    "Invalid personal info:",
    !invalidResult.success ? "PASS" : "FAIL"
  );

  if (!invalidResult.success) {
    console.log(
      "Validation errors:",
      invalidResult.error.issues.map((issue) => issue.message)
    );
  }
};

export const testProfessionalInfoValidation = () => {
  console.log("Testing professional info validation...");

  const validResult = professionalInfoFormSchema.safeParse(
    validProfessionalInfoForm
  );
  console.log(
    "Valid professional info:",
    validResult.success ? "PASS" : "FAIL"
  );
};

export const testCaptainProfileValidation = () => {
  console.log("Testing captain profile validation...");

  const result = captainProfileSchema.safeParse(mockCaptainProfile);
  console.log("Mock captain profile:", result.success ? "PASS" : "FAIL");

  if (!result.success) {
    console.log(
      "Validation errors:",
      result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      )
    );
  }
};

export const testPhotoUploadValidation = () => {
  console.log("Testing photo upload validation...");

  // Create a mock file for testing
  const validFile = new File([""], "test.jpg", { type: "image/jpeg" });
  const validResult = photoUploadSchema.safeParse({ file: validFile });
  console.log("Valid photo file:", validResult.success ? "PASS" : "FAIL");

  // Test invalid file type
  const invalidFile = new File([""], "test.txt", { type: "text/plain" });
  const invalidResult = photoUploadSchema.safeParse({ file: invalidFile });
  console.log("Invalid photo file:", !invalidResult.success ? "PASS" : "FAIL");
};

// Run all tests
export const runAllTests = () => {
  console.log("=== Profile Validation Tests ===");
  testPersonalInfoValidation();
  console.log("");
  testProfessionalInfoValidation();
  console.log("");
  testCaptainProfileValidation();
  console.log("");
  testPhotoUploadValidation();
  console.log("=== Tests Complete ===");
};
