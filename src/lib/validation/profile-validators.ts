import { z } from "zod";

// Custom validation functions for profile forms
export const validateTurkishName = (name: string): boolean => {
  // Allow Turkish characters and spaces
  const turkishNameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/;
  return turkishNameRegex.test(name);
};

export const validateTurkishPhone = (phone: string): boolean => {
  // Turkish mobile phone format: +90 5XX XXX XX XX or 05XX XXX XX XX
  const cleanPhone = phone.replace(/\s/g, "");
  const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}$/;
  return turkishPhoneRegex.test(cleanPhone);
};

export const validateLicenseNumber = (license: string): boolean => {
  // Turkish captain license format: TR-CAP-YYYY-XXXXXX
  const licenseRegex = /^[A-Z]{2}-[A-Z]{3}-\d{4}-\d{6}$/;
  return licenseRegex.test(license);
};

export const validateAge = (
  birthDate: string,
  minAge = 18,
  maxAge = 80
): boolean => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge && age - 1 <= maxAge;
  }

  return age >= minAge && age <= maxAge;
};

export const validatePostalCode = (postalCode: string): boolean => {
  // Turkish postal code: 5 digits
  const postalRegex = /^[0-9]{5}$/;
  return postalRegex.test(postalCode);
};

export const validateExperienceYears = (years: number): boolean => {
  return years >= 0 && years <= 50 && Number.isInteger(years);
};

export const validateLicenseExpiry = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return expiry > today;
};

// Enhanced validation messages in Turkish
export const ValidationMessages = {
  required: (field: string) => `${field} alanı zorunludur`,
  minLength: (field: string, min: number) =>
    `${field} en az ${min} karakter olmalıdır`,
  maxLength: (field: string, max: number) =>
    `${field} en fazla ${max} karakter olmalıdır`,
  email: "Geçerli bir e-posta adresi girin",
  phone: "Geçerli bir Türkiye telefon numarası girin (örn: +90 5XX XXX XX XX)",
  name: "Sadece harf ve boşluk karakterleri kullanabilirsiniz",
  age: "Yaş 18-80 arasında olmalıdır",
  license: "Lisans numarası formatı: TR-CAP-YYYY-XXXXXX",
  licenseExpiry: "Lisans bitiş tarihi gelecekte olmalıdır",
  postalCode: "Posta kodu 5 haneli olmalıdır",
  experience: "Deneyim yılı 0-50 arasında tam sayı olmalıdır",
  specializations: {
    min: "En az bir uzmanlık alanı seçmelisiniz",
    max: "En fazla 10 uzmanlık alanı seçebilirsiniz",
    empty: "Uzmanlık alanı boş olamaz",
  },
  bio: "Biyografi 500 karakterden az olmalıdır",
  city: "Şehir adı sadece harf içerebilir",
  country: "Ülke adı sadece harf içerebilir",
  district: "İlçe adı sadece harf içerebilir",
  street: "Sokak bilgisi çok uzun",
  emailDomain: "Geçerli bir e-posta domaini girin",
};

// Field-specific validation functions
export const createFieldValidator = (fieldName: string) => ({
  required: () => ValidationMessages.required(fieldName),
  minLength: (min: number) => ValidationMessages.minLength(fieldName, min),
  maxLength: (max: number) => ValidationMessages.maxLength(fieldName, max),
});

// Real-time validation helpers
export const validateFieldRealTime = (
  fieldName: string,
  value: any,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  }
): string | null => {
  const { required, minLength, maxLength, pattern, custom } = rules;

  // Skip validation if field is empty and not required
  if (!required && (!value || (typeof value === "string" && !value.trim()))) {
    return null;
  }

  if (required && (!value || (typeof value === "string" && !value.trim()))) {
    return ValidationMessages.required(fieldName);
  }

  if (value && typeof value === "string") {
    if (minLength && value.length < minLength) {
      return ValidationMessages.minLength(fieldName, minLength);
    }

    if (maxLength && value.length > maxLength) {
      return ValidationMessages.maxLength(fieldName, maxLength);
    }

    if (pattern && !pattern.test(value)) {
      // Return specific message based on field type
      if (fieldName.toLowerCase().includes("email")) {
        return ValidationMessages.email;
      }
      if (fieldName.toLowerCase().includes("telefon")) {
        return ValidationMessages.phone;
      }
      if (fieldName.toLowerCase().includes("ad")) {
        return ValidationMessages.name;
      }
      return "Geçersiz format";
    }
  }

  if (custom) {
    const result = custom(value);
    if (typeof result === "string") {
      return result;
    }
    if (result === false) {
      return "Geçersiz değer";
    }
  }

  return null;
};

// Form-level validation
export const validatePersonalInfoForm = (data: any) => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.firstName) {
    errors.firstName = ValidationMessages.required("Ad");
  } else if (!validateTurkishName(data.firstName)) {
    errors.firstName = ValidationMessages.name;
  }

  if (!data.lastName) {
    errors.lastName = ValidationMessages.required("Soyad");
  } else if (!validateTurkishName(data.lastName)) {
    errors.lastName = ValidationMessages.name;
  }

  // Email validation
  if (!data.email) {
    errors.email = ValidationMessages.required("E-posta");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = ValidationMessages.email;
  }

  // Phone validation
  if (!data.phone) {
    errors.phone = ValidationMessages.required("Telefon");
  } else if (!validateTurkishPhone(data.phone)) {
    errors.phone = ValidationMessages.phone;
  }

  // Age validation
  if (data.dateOfBirth && !validateAge(data.dateOfBirth)) {
    errors.dateOfBirth = ValidationMessages.age;
  }

  // Address validation
  if (!data.city) {
    errors.city = ValidationMessages.required("Şehir");
  } else if (!validateTurkishName(data.city)) {
    errors.city = ValidationMessages.city;
  }

  if (!data.country) {
    errors.country = ValidationMessages.required("Ülke");
  } else if (!validateTurkishName(data.country)) {
    errors.country = ValidationMessages.country;
  }

  if (data.postalCode && !validatePostalCode(data.postalCode)) {
    errors.postalCode = ValidationMessages.postalCode;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateProfessionalInfoForm = (data: any) => {
  const errors: Record<string, string> = {};

  // License validation
  if (!data.licenseNumber) {
    errors.licenseNumber = ValidationMessages.required("Lisans numarası");
  } else if (!validateLicenseNumber(data.licenseNumber)) {
    errors.licenseNumber = ValidationMessages.license;
  }

  if (!data.licenseExpiry) {
    errors.licenseExpiry = ValidationMessages.required("Lisans bitiş tarihi");
  } else if (!validateLicenseExpiry(data.licenseExpiry)) {
    errors.licenseExpiry = ValidationMessages.licenseExpiry;
  }

  // Experience validation
  if (
    data.yearsOfExperience !== undefined &&
    !validateExperienceYears(data.yearsOfExperience)
  ) {
    errors.yearsOfExperience = ValidationMessages.experience;
  }

  // Specializations validation
  if (!data.specializations || data.specializations.length === 0) {
    errors.specializations = ValidationMessages.specializations.min;
  } else if (data.specializations.length > 10) {
    errors.specializations = ValidationMessages.specializations.max;
  }

  // Bio validation
  if (data.bio && data.bio.length > 500) {
    errors.bio = ValidationMessages.bio;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
