import {
  CaptainProfile,
  PersonalInfo,
  ProfessionalInfo,
  PersonalInfoFormData,
  ProfessionalInfoFormData,
} from "../../types/profile.types";
import {
  personalInfoFormSchema,
  professionalInfoFormSchema,
  accountSettingsFormSchema,
  photoUploadSchema,
} from "../validation/profile.schemas";

/**
 * Validates personal information form data
 */
export const validatePersonalInfo = (data: PersonalInfoFormData) => {
  return personalInfoFormSchema.safeParse(data);
};

/**
 * Validates professional information form data
 */
export const validateProfessionalInfo = (data: ProfessionalInfoFormData) => {
  return professionalInfoFormSchema.safeParse(data);
};

/**
 * Validates account settings form data
 */
export const validateAccountSettings = (data: any) => {
  return accountSettingsFormSchema.safeParse(data);
};

/**
 * Validates photo upload file
 */
export const validatePhotoUpload = (file: File) => {
  return photoUploadSchema.safeParse({ file });
};

/**
 * Converts PersonalInfoFormData to PersonalInfo
 */
export const convertPersonalInfoFormToPersonalInfo = (
  formData: PersonalInfoFormData
): PersonalInfo => {
  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    dateOfBirth: formData.dateOfBirth,
    address: {
      street: formData.street,
      city: formData.city,
      district: formData.district,
      postalCode: formData.postalCode,
      country: formData.country,
    },
  };
};

/**
 * Converts PersonalInfo to PersonalInfoFormData
 */
export const convertPersonalInfoToFormData = (
  personalInfo: PersonalInfo
): PersonalInfoFormData => {
  return {
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    email: personalInfo.email,
    phone: personalInfo.phone,
    dateOfBirth: personalInfo.dateOfBirth || "",
    street: personalInfo.address?.street || "",
    city: personalInfo.address?.city || "",
    district: personalInfo.address?.district || "",
    postalCode: personalInfo.address?.postalCode || "",
    country: personalInfo.address?.country || "",
  };
};

/**
 * Converts ProfessionalInfoFormData to ProfessionalInfo (excluding certifications)
 */
export const convertProfessionalInfoFormToProfessionalInfo = (
  formData: ProfessionalInfoFormData,
  existingCertifications: ProfessionalInfo["certifications"] = []
): ProfessionalInfo => {
  return {
    licenseNumber: formData.licenseNumber,
    licenseExpiry: formData.licenseExpiry,
    yearsOfExperience: formData.yearsOfExperience,
    specializations: formData.specializations,
    bio: formData.bio,
    certifications: existingCertifications,
  };
};

/**
 * Converts ProfessionalInfo to ProfessionalInfoFormData
 */
export const convertProfessionalInfoToFormData = (
  professionalInfo: ProfessionalInfo
): ProfessionalInfoFormData => {
  return {
    licenseNumber: professionalInfo.licenseNumber,
    licenseExpiry: professionalInfo.licenseExpiry,
    yearsOfExperience: professionalInfo.yearsOfExperience,
    specializations: professionalInfo.specializations,
    bio: professionalInfo.bio,
  };
};

/**
 * Formats captain's full name
 */
export const formatCaptainName = (personalInfo: PersonalInfo): string => {
  return `${personalInfo.firstName} ${personalInfo.lastName}`;
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Format Turkish phone numbers
  if (cleaned.startsWith("+90")) {
    const number = cleaned.slice(3);
    if (number.length === 10) {
      return `+90 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(
        6,
        8
      )} ${number.slice(8)}`;
    }
  }

  return phone; // Return original if formatting fails
};

/**
 * Calculates profile completion percentage
 */
export const calculateProfileCompletion = (profile: CaptainProfile): number => {
  let completedFields = 0;
  let totalFields = 0;

  // Personal info fields (required)
  const personalRequiredFields = ["firstName", "lastName", "email", "phone"];
  personalRequiredFields.forEach((field) => {
    totalFields++;
    if (profile.personalInfo[field as keyof PersonalInfo]) {
      completedFields++;
    }
  });

  // Personal info optional fields
  const personalOptionalFields = ["profilePhoto", "dateOfBirth"];
  personalOptionalFields.forEach((field) => {
    totalFields++;
    if (profile.personalInfo[field as keyof PersonalInfo]) {
      completedFields++;
    }
  });

  // Address fields
  totalFields += 2; // city and country are required
  if (profile.personalInfo.address?.city) completedFields++;
  if (profile.personalInfo.address?.country) completedFields++;

  totalFields += 3; // street, district, postalCode are optional
  if (profile.personalInfo.address?.street) completedFields++;
  if (profile.personalInfo.address?.district) completedFields++;
  if (profile.personalInfo.address?.postalCode) completedFields++;

  // Professional info fields
  const professionalRequiredFields = [
    "licenseNumber",
    "licenseExpiry",
    "yearsOfExperience",
  ];
  professionalRequiredFields.forEach((field) => {
    totalFields++;
    if (profile.professionalInfo[field as keyof ProfessionalInfo]) {
      completedFields++;
    }
  });

  // Specializations
  totalFields++;
  if (profile.professionalInfo.specializations.length > 0) {
    completedFields++;
  }

  // Bio
  totalFields++;
  if (profile.professionalInfo.bio) {
    completedFields++;
  }

  // Certifications
  totalFields++;
  if (profile.professionalInfo.certifications.length > 0) {
    completedFields++;
  }

  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Checks if a certification is expired
 */
export const isCertificationExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

/**
 * Checks if a certification is expiring soon (within 30 days)
 */
export const isCertificationExpiringSoon = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry <= thirtyDaysFromNow && expiry >= new Date();
};

/**
 * Gets the captain's age from date of birth
 */
export const calculateAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Formats rating for display
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Formats completion rate for display
 */
export const formatCompletionRate = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};

/**
 * Formats currency for display
 */
export const formatCurrency = (
  amount: number,
  currency: string = "TRY"
): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
  }).format(amount);
};
