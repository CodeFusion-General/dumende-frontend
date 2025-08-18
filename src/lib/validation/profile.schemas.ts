import { z } from "zod";

// Address validation schema
export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

// Enhanced personal info validation schema
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "Ad alanı zorunludur")
    .max(50, "Ad 50 karakterden az olmalıdır")
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, "Ad sadece harf içerebilir"),
  lastName: z
    .string()
    .min(1, "Soyad alanı zorunludur")
    .max(50, "Soyad 50 karakterden az olmalıdır")
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, "Soyad sadece harf içerebilir"),
  email: z
    .string()
    .min(1, "E-posta alanı zorunludur")
    .email("Geçerli bir e-posta adresi girin")
    .max(100, "E-posta adresi çok uzun")
    .refine((email) => {
      // Additional email validation for common domains
      const commonDomains = [
        "gmail.com",
        "hotmail.com",
        "yahoo.com",
        "outlook.com",
      ];
      const domain = email.split("@")[1];
      return domain && domain.length > 2;
    }, "Geçerli bir e-posta domaini girin"),
  phone: z
    .string()
    .min(1, "Telefon numarası zorunludur")
    .regex(
      /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}$/,
      "Geçerli bir Türkiye telefon numarası girin (örn: +90 5XX XXX XX XX)"
    ),
  profilePhoto: z.string().url("Geçerli bir URL girin").optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 80;
    }, "Yaş 18-80 arasında olmalıdır")
    .optional(),
  address: addressSchema.optional(),
});

// Certification validation schema
export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  certificateNumber: z.string().optional(),
});

// Professional info validation schema
export const professionalInfoSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience seems too high"),
  certifications: z.array(certificationSchema),
  specializations: z
    .array(z.string())
    .min(1, "At least one specialization is required"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

// Statistics validation schema
export const statisticsSchema = z.object({
  totalTours: z.number().min(0, "Total tours cannot be negative"),
  averageRating: z
    .number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating cannot exceed 5"),
  totalReviews: z.number().min(0, "Total reviews cannot be negative"),
  completionRate: z
    .number()
    .min(0, "Completion rate cannot be negative")
    .max(100, "Completion rate cannot exceed 100"),
  yearsActive: z.number().min(0, "Years active cannot be negative"),
  totalRevenue: z
    .number()
    .min(0, "Total revenue cannot be negative")
    .optional(),
  repeatCustomers: z
    .number()
    .min(0, "Repeat customers cannot be negative")
    .optional(),
});

// Account settings validation schema
export const accountSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  profileVisibility: z.enum(["public", "private", "limited"]),
  language: z.string().min(1, "Language is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

// Complete captain profile validation schema
export const captainProfileSchema = z.object({
  id: z.string(),
  personalInfo: personalInfoSchema,
  professionalInfo: professionalInfoSchema,
  statistics: statisticsSchema,
  accountSettings: accountSettingsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Enhanced form-specific validation schemas
export const personalInfoFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "Ad alanı zorunludur")
    .max(50, "Ad 50 karakterden az olmalıdır")
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, "Ad sadece harf içerebilir"),
  lastName: z
    .string()
    .min(1, "Soyad alanı zorunludur")
    .max(50, "Soyad 50 karakterden az olmalıdır")
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, "Soyad sadece harf içerebilir"),
  email: z
    .string()
    .min(1, "E-posta alanı zorunludur")
    .email("Geçerli bir e-posta adresi girin")
    .max(100, "E-posta adresi çok uzun")
    .refine((email) => {
      const domain = email.split("@")[1];
      return domain && domain.length > 2;
    }, "Geçerli bir e-posta domaini girin"),
  phone: z
    .string()
    .min(1, "Telefon numarası zorunludur")
    .regex(
      /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}$/,
      "Geçerli bir Türkiye telefon numarası girin (örn: +90 5XX XXX XX XX)"
    ),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır")
    .refine((date) => {
      if (!date) return true; // Optional field
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 80;
    }, "Yaş 18-80 arasında olmalıdır")
    .optional(),
  street: z.string().max(200, "Sokak bilgisi çok uzun").optional(),
  city: z
    .string()
    .min(1, "Şehir alanı zorunludur")
    .max(50, "Şehir adı çok uzun")
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, "Şehir adı sadece harf içerebilir"),
  district: z
    .string()
    .max(50, "İlçe adı çok uzun")
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]*$/, "İlçe adı sadece harf içerebilir")
    .optional(),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "Posta kodu 5 haneli olmalıdır")
    .optional(),
  country: z
    .string()
    .min(1, "Ülke alanı zorunludur")
    .max(50, "Ülke adı çok uzun")
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, "Ülke adı sadece harf içerebilir"),
});

export const professionalInfoFormSchema = z.object({
  licenseNumber: z
    .string()
    .min(1, "Lisans numarası zorunludur")
    .regex(
      /^[A-Z0-9]{6,12}$/i,
      "Lisans numarası 6-12 karakter olmalı ve yalnızca harf/rakam içermelidir"
    )
    .transform((val) => val.trim().toUpperCase()),
  licenseExpiry: z
    .string()
    .min(1, "Lisans bitiş tarihi zorunludur")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır")
    .refine((date) => {
      const expiryDate = new Date(date);
      const today = new Date();
      return expiryDate > today;
    }, "Lisans bitiş tarihi gelecekte olmalıdır")
    .refine((date) => {
      const expiryDate = new Date(date);
      const tenYearsAhead = new Date();
      tenYearsAhead.setFullYear(tenYearsAhead.getFullYear() + 10);
      return expiryDate <= tenYearsAhead;
    }, "Lisans bitiş tarihi en fazla 10 yıl ileri olabilir"),
  yearsOfExperience: z
    .number()
    .min(0, "Deneyim yılı negatif olamaz")
    .max(50, "Deneyim yılı çok yüksek görünüyor")
    .int("Deneyim yılı tam sayı olmalıdır"),
  specializations: z
    .array(z.string().min(1, "Uzmanlık alanı boş olamaz"))
    .min(1, "En az bir uzmanlık alanı seçmelisiniz")
    .max(10, "En fazla 10 uzmanlık alanı seçebilirsiniz"),
  bio: z.string().max(500, "Biyografi 500 karakterden az olmalıdır").optional(),
});

export const accountSettingsFormSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  profileVisibility: z.enum(["public", "private", "limited"]),
  language: z.string().min(1, "Language is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

// Photo upload validation schema
export const photoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type
        ),
      "File must be a valid image (JPEG, PNG, or WebP)"
    ),
});

// Profile Completion Validation Schemas
export const addressFormDataSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Türkiye"),
});

export const profileCompletionSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  phoneNumber: z
    .string()
    .regex(/^(\+90|0)?[0-9]{10}$/, "Geçerli bir telefon numarası giriniz"),
  dateOfBirth: z.string().refine((date) => {
    if (!date || date.trim() === "") return true; // Optional field
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 100;
  }, "Yaş 18-100 arasında olmalıdır").optional(),
  address: addressFormDataSchema.optional(),
  profileImage: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Dosya boyutu 5MB'dan küçük olmalıdır"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      "Sadece JPG, PNG ve GIF formatları desteklenir"
    )
    .optional(),
});
