// Auth ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

import { UserDTO } from "./contact.types";

// Backend UserType enum
export enum UserType {
  CUSTOMER = "CUSTOMER",
  BOAT_OWNER = "BOAT_OWNER",
  ADMIN = "ADMIN",
}

// Backend'deki LoginRequest ile uyumlu
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

// Backend'deki RegisterRequest ile uyumlu
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  userType: UserType;
  fullName: string;
  phoneNumber: string;
  contractApproved: boolean;
  contractVersion: string;
}

// Backend'deki LoginResponse ile uyumlu
export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  username: string;
  role: UserType;
  accountId?: number; // Account ID for profile completion
}

// AuthContext için user state
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: UserType;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  accountId?: number;
  isProfileComplete?: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

// AuthContext state type
export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<LoginResponse>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  // Helper methods
  hasRole: (role: UserType) => boolean;
  isAdmin: () => boolean;
  isBoatOwner: () => boolean;
  isCustomer: () => boolean;
  // Profile completion methods
  isProfileComplete: () => boolean;
  updateUserData: (userData: Partial<AuthUser>) => void;
  updateUserFromProfile: (userDto: UserDTO) => void;
  needsProfileCompletion: () => boolean;
  getProfileCompletionRedirectPath: () => string | null;
}

// Account yönetimi için (backend AccountDTO)
export interface AccountDTO {
  id: number;
  email: string;
  username: string;
  role: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  email: string;
  username: string;
  password: string;
  role: string;
}

export interface UpdateAccountRequest {
  email: string;
  username: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Form validasyonu için
export interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
  agreeToTerms: boolean;
}

// API Error response
export interface AuthError {
  message: string;
  code?: string;
  details?: any;
}

// Geriye uyumluluk için (eski kod için)
export interface User extends AuthUser {}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
