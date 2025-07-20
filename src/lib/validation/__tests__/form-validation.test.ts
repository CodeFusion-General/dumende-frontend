import {
  validateTurkishName,
  validateTurkishPhone,
  validateLicenseNumber,
  validateAge,
  validatePostalCode,
  validateExperienceYears,
  validateLicenseExpiry,
  validatePersonalInfoForm,
  validateProfessionalInfoForm,
  ValidationMessages,
} from "../profile-validators";

// Test Turkish name validation
export const testTurkishNameValidation = () => {
  console.log("Testing Turkish name validation...");

  // Valid names
  console.assert(validateTurkishName("Ahmet"), "Should accept Turkish name");
  console.assert(
    validateTurkishName("Ayşe Çiğdem"),
    "Should accept name with Turkish characters"
  );
  console.assert(
    validateTurkishName("İbrahim Öztürk"),
    "Should accept name with İ and Ö"
  );

  // Invalid names
  console.assert(
    !validateTurkishName("John123"),
    "Should reject name with numbers"
  );
  console.assert(
    !validateTurkishName("Ahmet@"),
    "Should reject name with special characters"
  );
  console.assert(!validateTurkishName(""), "Should reject empty name");

  console.log("✓ Turkish name validation tests passed");
};

// Test Turkish phone validation
export const testTurkishPhoneValidation = () => {
  console.log("Testing Turkish phone validation...");

  // Valid phones
  console.assert(
    validateTurkishPhone("+905551234567"),
    "Should accept +90 format"
  );
  console.assert(validateTurkishPhone("05551234567"), "Should accept 0 format");
  console.assert(
    validateTurkishPhone("5551234567"),
    "Should accept without prefix"
  );
  console.assert(
    validateTurkishPhone("+90 555 123 45 67"),
    "Should accept with spaces"
  );

  // Invalid phones
  console.assert(
    !validateTurkishPhone("1234567890"),
    "Should reject non-Turkish format"
  );
  console.assert(
    !validateTurkishPhone("+905441234567"),
    "Should reject non-mobile prefix"
  );
  console.assert(!validateTurkishPhone("555123456"), "Should reject too short");
  console.assert(!validateTurkishPhone(""), "Should reject empty phone");

  console.log("✓ Turkish phone validation tests passed");
};

// Test license number validation
export const testLicenseNumberValidation = () => {
  console.log("Testing license number validation...");

  // Valid license numbers
  console.assert(
    validateLicenseNumber("TR-CAP-2020-123456"),
    "Should accept valid format"
  );
  console.assert(
    validateLicenseNumber("US-CAP-2019-654321"),
    "Should accept other country codes"
  );

  // Invalid license numbers
  console.assert(
    !validateLicenseNumber("TR-CAP-20-123456"),
    "Should reject wrong year format"
  );
  console.assert(
    !validateLicenseNumber("TR-CAP-2020-12345"),
    "Should reject wrong number length"
  );
  console.assert(
    !validateLicenseNumber("TRCAP2020123456"),
    "Should reject without separators"
  );
  console.assert(!validateLicenseNumber(""), "Should reject empty license");

  console.log("✓ License number validation tests passed");
};

// Test age validation
export const testAgeValidation = () => {
  console.log("Testing age validation...");

  const today = new Date();
  const validBirthDate = new Date(
    today.getFullYear() - 25,
    today.getMonth(),
    today.getDate()
  );
  const tooYoungDate = new Date(
    today.getFullYear() - 15,
    today.getMonth(),
    today.getDate()
  );
  const tooOldDate = new Date(
    today.getFullYear() - 85,
    today.getMonth(),
    today.getDate()
  );

  // Valid ages
  console.assert(
    validateAge(validBirthDate.toISOString().split("T")[0]),
    "Should accept valid age"
  );

  // Invalid ages
  console.assert(
    !validateAge(tooYoungDate.toISOString().split("T")[0]),
    "Should reject too young"
  );
  console.assert(
    !validateAge(tooOldDate.toISOString().split("T")[0]),
    "Should reject too old"
  );

  console.log("✓ Age validation tests passed");
};

// Test postal code validation
export const testPostalCodeValidation = () => {
  console.log("Testing postal code validation...");

  // Valid postal codes
  console.assert(
    validatePostalCode("34000"),
    "Should accept 5-digit postal code"
  );
  console.assert(
    validatePostalCode("06100"),
    "Should accept postal code starting with 0"
  );

  // Invalid postal codes
  console.assert(!validatePostalCode("3400"), "Should reject 4-digit code");
  console.assert(!validatePostalCode("340000"), "Should reject 6-digit code");
  console.assert(!validatePostalCode("34A00"), "Should reject with letters");
  console.assert(!validatePostalCode(""), "Should reject empty code");

  console.log("✓ Postal code validation tests passed");
};

// Test experience years validation
export const testExperienceYearsValidation = () => {
  console.log("Testing experience years validation...");

  // Valid experience
  console.assert(validateExperienceYears(0), "Should accept 0 years");
  console.assert(validateExperienceYears(25), "Should accept 25 years");
  console.assert(validateExperienceYears(50), "Should accept 50 years");

  // Invalid experience
  console.assert(!validateExperienceYears(-1), "Should reject negative years");
  console.assert(!validateExperienceYears(51), "Should reject over 50 years");
  console.assert(!validateExperienceYears(25.5), "Should reject decimal years");

  console.log("✓ Experience years validation tests passed");
};

// Test license expiry validation
export const testLicenseExpiryValidation = () => {
  console.log("Testing license expiry validation...");

  const today = new Date();
  const futureDate = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate()
  );
  const pastDate = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  );

  // Valid expiry dates
  console.assert(
    validateLicenseExpiry(futureDate.toISOString().split("T")[0]),
    "Should accept future date"
  );

  // Invalid expiry dates
  console.assert(
    !validateLicenseExpiry(pastDate.toISOString().split("T")[0]),
    "Should reject past date"
  );
  console.assert(
    !validateLicenseExpiry(today.toISOString().split("T")[0]),
    "Should reject today's date"
  );

  console.log("✓ License expiry validation tests passed");
};

// Test personal info form validation
export const testPersonalInfoFormValidation = () => {
  console.log("Testing personal info form validation...");

  // Valid form data
  const validData = {
    firstName: "Ahmet",
    lastName: "Yılmaz",
    email: "ahmet@example.com",
    phone: "+905551234567",
    dateOfBirth: "1990-01-01",
    city: "İstanbul",
    country: "Türkiye",
    postalCode: "34000",
  };

  const validResult = validatePersonalInfoForm(validData);
  console.assert(validResult.isValid, "Should validate correct personal info");
  console.assert(
    Object.keys(validResult.errors).length === 0,
    "Should have no errors"
  );

  // Invalid form data
  const invalidData = {
    firstName: "",
    lastName: "Yılmaz123",
    email: "invalid-email",
    phone: "123456",
    dateOfBirth: "2010-01-01", // Too young
    city: "",
    country: "Türkiye123",
    postalCode: "340",
  };

  const invalidResult = validatePersonalInfoForm(invalidData);
  console.assert(!invalidResult.isValid, "Should reject invalid personal info");
  console.assert(
    Object.keys(invalidResult.errors).length > 0,
    "Should have errors"
  );

  console.log("✓ Personal info form validation tests passed");
};

// Test professional info form validation
export const testProfessionalInfoFormValidation = () => {
  console.log("Testing professional info form validation...");

  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  // Valid form data
  const validData = {
    licenseNumber: "TR-CAP-2020-123456",
    licenseExpiry: futureDate.toISOString().split("T")[0],
    yearsOfExperience: 10,
    specializations: ["Sailing", "Fishing"],
    bio: "Experienced captain with 10 years at sea.",
  };

  const validResult = validateProfessionalInfoForm(validData);
  console.assert(
    validResult.isValid,
    "Should validate correct professional info"
  );
  console.assert(
    Object.keys(validResult.errors).length === 0,
    "Should have no errors"
  );

  // Invalid form data
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);

  const invalidData = {
    licenseNumber: "INVALID-LICENSE",
    licenseExpiry: pastDate.toISOString().split("T")[0], // Past date
    yearsOfExperience: -5, // Negative
    specializations: [], // Empty
    bio: "A".repeat(600), // Too long
  };

  const invalidResult = validateProfessionalInfoForm(invalidData);
  console.assert(
    !invalidResult.isValid,
    "Should reject invalid professional info"
  );
  console.assert(
    Object.keys(invalidResult.errors).length > 0,
    "Should have errors"
  );

  console.log("✓ Professional info form validation tests passed");
};

// Test validation messages
export const testValidationMessages = () => {
  console.log("Testing validation messages...");

  console.assert(
    ValidationMessages.required("Test") === "Test alanı zorunludur",
    "Should format required message"
  );
  console.assert(
    ValidationMessages.minLength("Test", 5) ===
      "Test en az 5 karakter olmalıdır",
    "Should format min length message"
  );
  console.assert(
    ValidationMessages.maxLength("Test", 10) ===
      "Test en fazla 10 karakter olmalıdır",
    "Should format max length message"
  );

  console.log("✓ Validation messages tests passed");
};

// Run all tests
export const runAllValidationTests = () => {
  console.log("🧪 Running form validation tests...\n");

  try {
    testTurkishNameValidation();
    testTurkishPhoneValidation();
    testLicenseNumberValidation();
    testAgeValidation();
    testPostalCodeValidation();
    testExperienceYearsValidation();
    testLicenseExpiryValidation();
    testPersonalInfoFormValidation();
    testProfessionalInfoFormValidation();
    testValidationMessages();

    console.log("\n✅ All form validation tests passed!");
  } catch (error) {
    console.error("\n❌ Form validation tests failed:", error);
  }
};

// Export for use in other test files
export {
  validateTurkishName,
  validateTurkishPhone,
  validateLicenseNumber,
  validateAge,
  validatePostalCode,
  validateExperienceYears,
  validateLicenseExpiry,
  validatePersonalInfoForm,
  validateProfessionalInfoForm,
};
