/**
 * ProfilePhotoUpload Component Usage Examples
 *
 * This file demonstrates how to use the ProfilePhotoUpload component
 * in different scenarios within the captain profile page.
 */

import React from "react";
import ProfilePhotoUpload from "@/components/admin/profile/ProfilePhotoUpload";

// Example 1: Basic usage with no existing photo
export const BasicUsageExample = () => {
  const handlePhotoChange = (file: File | null, previewUrl: string | null) => {
    if (file && previewUrl) {
      console.log("New photo uploaded:", file.name);
      console.log("Preview URL:", previewUrl);

      // Here you would typically:
      // 1. Upload the file to your server/cloud storage
      // 2. Update the user's profile with the new photo URL
      // 3. Update local state to reflect the change
    } else {
      console.log("Photo removed");
      // Handle photo removal
    }
  };

  return React.createElement(ProfilePhotoUpload, {
    userName: "Ahmet Yılmaz",
    onPhotoChange: handlePhotoChange,
    size: "md",
  });
};

// Example 2: With existing photo
export const WithExistingPhotoExample = () => {
  const handlePhotoChange = (file: File | null, previewUrl: string | null) => {
    // Handle photo change logic
  };

  return React.createElement(ProfilePhotoUpload, {
    userName: "Mehmet Demir",
    currentPhoto: "/images/captains/mehmet-demir.jpg",
    onPhotoChange: handlePhotoChange,
    size: "md",
  });
};

// Example 3: Different sizes
export const DifferentSizesExample = () => {
  const handlePhotoChange = (file: File | null, previewUrl: string | null) => {
    // Handle photo change logic
  };

  return {
    small: React.createElement(ProfilePhotoUpload, {
      userName: "Small Avatar",
      onPhotoChange: handlePhotoChange,
      size: "sm",
    }),
    medium: React.createElement(ProfilePhotoUpload, {
      userName: "Medium Avatar",
      onPhotoChange: handlePhotoChange,
      size: "md",
    }),
    large: React.createElement(ProfilePhotoUpload, {
      userName: "Large Avatar",
      onPhotoChange: handlePhotoChange,
      size: "lg",
    }),
  };
};

// Example 4: Disabled state
export const DisabledExample = () => {
  return React.createElement(ProfilePhotoUpload, {
    userName: "Disabled User",
    currentPhoto: "/images/captains/disabled-user.jpg",
    disabled: true,
    size: "md",
  });
};

// Example 5: Integration with form state management
export const FormIntegrationExample = () => {
  // This would typically be in a React component with state
  let profilePhoto: string | null = null;
  let isUploading = false;

  const handlePhotoChange = async (
    file: File | null,
    previewUrl: string | null
  ) => {
    if (file) {
      isUploading = true;

      try {
        // Simulate API call to upload photo
        const formData = new FormData();
        formData.append("photo", file);

        // const response = await fetch("/api/captain/profile/photo", {
        //   method: "POST",
        //   body: formData,
        // });

        // const result = await response.json();
        // profilePhoto = result.photoUrl;

        // For demo purposes, use the preview URL
        profilePhoto = previewUrl;

        console.log("Photo uploaded successfully");
      } catch (error) {
        console.error("Failed to upload photo:", error);
        // Handle error (show toast, etc.)
      } finally {
        isUploading = false;
      }
    } else {
      // Handle photo removal
      profilePhoto = null;
      console.log("Photo removed");
    }
  };

  return React.createElement(ProfilePhotoUpload, {
    userName: "Form User",
    currentPhoto: profilePhoto || undefined,
    onPhotoChange: handlePhotoChange,
    disabled: isUploading,
    size: "md",
  });
};

// Example 6: File validation scenarios
export const ValidationExamples = {
  // These are the validation rules implemented in the component:

  allowedFileTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],

  maxFileSize: 5 * 1024 * 1024, // 5MB

  // Examples of files that would be rejected:
  rejectedFiles: [
    {
      name: "document.pdf",
      type: "application/pdf",
      reason: "Invalid file type",
    },
    {
      name: "large-image.jpg",
      size: 10 * 1024 * 1024,
      reason: "File too large (>5MB)",
    },
    {
      name: "script.js",
      type: "application/javascript",
      reason: "Invalid file type",
    },
  ],

  // Examples of files that would be accepted:
  acceptedFiles: [
    { name: "photo.jpg", type: "image/jpeg", size: 2 * 1024 * 1024 },
    { name: "avatar.png", type: "image/png", size: 1 * 1024 * 1024 },
    { name: "profile.webp", type: "image/webp", size: 3 * 1024 * 1024 },
  ],
};

// Example 7: Error handling patterns
export const ErrorHandlingExample = () => {
  const handlePhotoChange = async (
    file: File | null,
    previewUrl: string | null
  ) => {
    if (!file) return;

    try {
      // Validate file before processing
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      if (
        !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type
        )
      ) {
        throw new Error(
          "Invalid file type. Only JPEG, PNG, and WebP are allowed."
        );
      }

      // Process the file
      console.log("Processing file:", file.name);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Upload successful");
    } catch (error) {
      console.error("Upload failed:", error);

      // The component will show appropriate error messages via toast
      // Additional error handling can be done here if needed
    }
  };

  return React.createElement(ProfilePhotoUpload, {
    userName: "Error Test User",
    onPhotoChange: handlePhotoChange,
    size: "md",
  });
};

// Export all examples for documentation
export const ProfilePhotoUploadExamples = {
  BasicUsageExample,
  WithExistingPhotoExample,
  DifferentSizesExample,
  DisabledExample,
  FormIntegrationExample,
  ValidationExamples,
  ErrorHandlingExample,
};
