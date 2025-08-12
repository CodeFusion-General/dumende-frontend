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
   * Formats the form data for API submission
   * @param formData - The profile form data
   * @param accountId - The account ID
   * @returns FormData - Formatted multipart form data
   */
  private formatFormDataForAPI(
    formData: ProfileFormData,
    accountId: number
  ): FormData {
    const apiFormData = new FormData();

    // Combine firstName and lastName to create fullName
    const fullName = `${formData.firstName} ${formData.lastName}`;

    // Add basic user information
    apiFormData.append("fullName", fullName);
    apiFormData.append("firstName", formData.firstName);
    apiFormData.append("lastName", formData.lastName);
    apiFormData.append("phoneNumber", formData.phoneNumber);
    apiFormData.append("dateOfBirth", formData.dateOfBirth);
    apiFormData.append("accountId", accountId.toString());

    // Serialize address as JSON string
    const addressJson = JSON.stringify(formData.address);
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
   * Validates profile data before submission
   * @param data - The profile form data to validate
   * @throws Error if validation fails
   */
  private validateProfileData(data: ProfileFormData): void {
    // Validate required fields
    if (!data.firstName?.trim()) {
      throw new Error("Ad alanı zorunludur.");
    }

    if (!data.lastName?.trim()) {
      throw new Error("Soyad alanı zorunludur.");
    }

    if (!data.phoneNumber?.trim()) {
      throw new Error("Telefon numarası zorunludur.");
    }

    if (!data.dateOfBirth) {
      throw new Error("Doğum tarihi zorunludur.");
    }

    // Validate address
    if (!data.address.street?.trim()) {
      throw new Error("Sokak adresi zorunludur.");
    }

    if (!data.address.city?.trim()) {
      throw new Error("Şehir zorunludur.");
    }

    if (!data.address.district?.trim()) {
      throw new Error("İlçe zorunludur.");
    }

    if (!data.address.postalCode?.trim()) {
      throw new Error("Posta kodu zorunludur.");
    }

    // Validate date of birth (age check)
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

    if (age < 18) {
      throw new Error("18 yaşından küçük kullanıcılar kayıt olamaz.");
    }

    if (age > 100) {
      throw new Error("Lütfen geçerli bir doğum tarihi girin.");
    }

    // Validate phone number format
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    if (!phoneRegex.test(data.phoneNumber.replace(/\s/g, ""))) {
      throw new Error("Geçerli bir telefon numarası girin.");
    }

    // Validate postal code
    const postalCodeRegex = /^[0-9]{5}$/;
    if (!postalCodeRegex.test(data.address.postalCode)) {
      throw new Error("Posta kodu 5 haneli olmalıdır.");
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
