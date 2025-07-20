/**
 * Example usage of captain profile types, validation, and mock data
 * This file demonstrates how to use the created interfaces and utilities
 */

import {
  CaptainProfile,
  PersonalInfoFormData,
  ProfessionalInfoFormData,
} from "../types/profile.types";
import {
  mockCaptainProfile,
  getMockCaptainProfile,
} from "../mocks/captainProfile.mock";
import {
  personalInfoFormSchema,
  professionalInfoFormSchema,
  captainProfileSchema,
} from "../lib/validation/profile.schemas";
import {
  validatePersonalInfo,
  validateProfessionalInfo,
  formatCaptainName,
  calculateProfileCompletion,
  formatRating,
  convertPersonalInfoToFormData,
} from "../lib/utils/profile.utils";

// Example 1: Using mock data
export const exampleUseMockData = () => {
  console.log("Captain Profile:", mockCaptainProfile);
  console.log(
    "Captain Name:",
    formatCaptainName(mockCaptainProfile.personalInfo)
  );
  console.log(
    "Profile Completion:",
    calculateProfileCompletion(mockCaptainProfile) + "%"
  );
  console.log(
    "Rating:",
    formatRating(mockCaptainProfile.statistics.averageRating)
  );
};

// Example 2: Validating form data
export const exampleValidateFormData = () => {
  const personalInfoForm: PersonalInfoFormData = {
    firstName: "Ahmet",
    lastName: "Yılmaz",
    email: "ahmet@example.com",
    phone: "+90 532 123 4567",
    city: "İstanbul",
    country: "Turkey",
  };

  const validationResult = validatePersonalInfo(personalInfoForm);

  if (validationResult.success) {
    console.log("Personal info is valid:", validationResult.data);
  } else {
    console.log("Validation errors:", validationResult.error.issues);
  }
};

// Example 3: Converting between types
export const exampleTypeConversion = () => {
  const formData = convertPersonalInfoToFormData(
    mockCaptainProfile.personalInfo
  );
  console.log("Converted to form data:", formData);
};

// Example 4: Working with multiple profiles
export const exampleMultipleProfiles = () => {
  const profile1 = getMockCaptainProfile("captain-001");
  const profile2 = getMockCaptainProfile("captain-002");

  console.log("Profile 1 exists:", !!profile1);
  console.log("Profile 2 exists:", !!profile2);
};

// Example 5: Validating complete profile
export const exampleValidateProfile = (profile: CaptainProfile) => {
  const result = captainProfileSchema.safeParse(profile);

  if (result.success) {
    console.log("Profile is valid");
    return true;
  } else {
    console.log("Profile validation failed:", result.error.issues);
    return false;
  }
};

// Example usage in a React component (pseudo-code)
export const exampleReactUsage = `
import React, { useState } from 'react';
import { CaptainProfile, PersonalInfoFormData } from '../types/profile.types';
import { mockCaptainProfile } from '../mocks/captainProfile.mock';
import { validatePersonalInfo, formatCaptainName } from '../lib/utils/profile.utils';

const ProfileComponent: React.FC = () => {
  const [profile, setProfile] = useState<CaptainProfile>(mockCaptainProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSavePersonalInfo = (formData: PersonalInfoFormData) => {
    const validation = validatePersonalInfo(formData);
    
    if (validation.success) {
      // Update profile with validated data
      console.log('Saving:', validation.data);
      setIsEditing(false);
    } else {
      // Show validation errors
      console.log('Errors:', validation.error.issues);
    }
  };

  return (
    <div>
      <h1>{formatCaptainName(profile.personalInfo)}</h1>
      {/* Profile components would go here */}
    </div>
  );
};
`;

// Export all examples
export const runExamples = () => {
  console.log("=== Profile Usage Examples ===");
  exampleUseMockData();
  console.log("");
  exampleValidateFormData();
  console.log("");
  exampleTypeConversion();
  console.log("");
  exampleMultipleProfiles();
  console.log("");
  exampleValidateProfile(mockCaptainProfile);
  console.log("=== Examples Complete ===");
};
