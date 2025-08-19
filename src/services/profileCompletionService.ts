import { BaseService } from "./base/BaseService";
import { UserDTO } from "@/types/contact.types";
import {
  ProfileFormData,
  CreateUserMultipartCommand,
  AddressFormData,
} from "@/types/profile.types";

class ProfileCompletionService extends BaseService {
  constructor() {
    super("/users");
  }

  /**
   * Creates a user profile using multipart form data with enhanced error handling
   * @param data - The profile completion form data
   * @param accountId - The account ID for the user
   * @returns Promise<UserDTO> - The created user profile
   */
  public async createUserProfile(
    data: ProfileFormData,
    accountId: number
  ): Promise<UserDTO> {
    // Pre-validate data before sending
    this.validateProfileData(data);

    const formData = this.formatFormDataForAPI(data, accountId);

    try {
      return await this.uploadMultipleFiles<UserDTO>("/multipart", formData);
    } catch (error: any) {
      // Enhance error with context
      if (error.response?.status === 413) {
        throw new Error(
          "Profil fotoğrafı çok büyük. Lütfen daha küçük bir dosya seçin."
        );
      }

      if (error.response?.status === 415) {
        throw new Error(
          "Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya GIF formatında bir fotoğraf seçin."
        );
      }

      // Re-throw original error for other cases
      throw error;
    }
  }

  /**
   * Formats the form data for API submission (handles optional fields)
   * @param formData - The profile form data
   * @param accountId - The account ID
   * @returns FormData - Formatted multipart form data
   */
  private formatFormDataForAPI(
    formData: ProfileFormData,
    accountId: number
  ): FormData {
    const apiFormData = new FormData();

    // Combine firstName and lastName to create fullName (handle empty values)
    const firstName = formData.firstName?.trim() || "";
    const lastName = formData.lastName?.trim() || "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Add basic user information (only if provided)
    if (fullName) {
      apiFormData.append("fullName", fullName);
    }
    if (firstName) {
      apiFormData.append("firstName", firstName);
    }
    if (lastName) {
      apiFormData.append("lastName", lastName);
    }
    if (formData.phoneNumber?.trim()) {
      apiFormData.append("phoneNumber", formData.phoneNumber.trim());
    }
    if (formData.dateOfBirth?.trim()) {
      apiFormData.append("dateOfBirth", formData.dateOfBirth.trim());
    }
    
    apiFormData.append("accountId", accountId.toString());

    // Serialize address as JSON string (only include non-empty fields)
    const address = {
      street: formData.address.street?.trim() || "",
      city: formData.address.city?.trim() || "",
      district: formData.address.district?.trim() || "",
      postalCode: formData.address.postalCode?.trim() || "",
      country: formData.address.country?.trim() || "Türkiye",
    };
    
    const addressJson = JSON.stringify(address);
    apiFormData.append("addressJson", addressJson);

    // Add profile image if provided
    if (formData.profileImage) {
      apiFormData.append("profileImageFile", formData.profileImage);
    }

    return apiFormData;
  }

  /**
   * Validates profile image on client side
   * @param file - The image file to validate
   * @returns boolean - True if valid, false otherwise
   */
  public validateProfileImage(file: File): boolean {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return false;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    return true;
  }

  /**
   * Gets detailed validation error message for profile image
   * @param file - The image file to validate
   * @returns string | null - Error message or null if valid
   */
  public getProfileImageValidationError(file: File): string | null {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `Dosya boyutu çok büyük (${fileSizeMB}MB). Maksimum 5MB olmalıdır.`;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return `Desteklenmeyen dosya formatı (${file.type}). Sadece JPG, PNG ve GIF formatları desteklenir.`;
    }

    // Check if file is corrupted (basic check)
    if (file.size === 0) {
      return "Dosya bozuk veya boş. Lütfen başka bir dosya seçin.";
    }

    return null;
  }

  /**
   * Validates profile data before submission (all fields are optional)
   * @param data - The profile form data to validate
   * @throws Error if validation fails
   */
  private validateProfileData(data: ProfileFormData): void {
    // Optional format validations only

    // Validate date of birth format if provided
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        // Adjust age if birthday hasn't occurred this year
      }

      // Only validate if age is unreasonable (but allow under 18)
      if (age > 150) {
        throw new Error("Lütfen geçerli bir doğum tarihi girin.");
      }
    }

    // Validate phone number format if provided (very flexible)
    if (data.phoneNumber?.trim()) {
      const phoneRegex = /^(0?5\d{9})$/;
      const cleanPhone = data.phoneNumber.replace(/\s/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error("Telefon numarası formatı: 5378700077 veya 05378700077");
      }
    }

    // Validate postal code format if provided
    if (data.address.postalCode?.trim()) {
      const postalCodeRegex = /^[0-9]{5}$/;
      if (!postalCodeRegex.test(data.address.postalCode)) {
        throw new Error("Posta kodu 5 haneli olmalıdır.");
      }
    }

    // Validate profile image if provided
    if (data.profileImage) {
      const imageError = this.getProfileImageValidationError(data.profileImage);
      if (imageError) {
        throw new Error(imageError);
      }
    }
  }
}

export const profileCompletionService = new ProfileCompletionService();
