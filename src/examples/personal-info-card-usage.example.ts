/**
 * PersonalInfoCard Component Usage Examples
 *
 * This file demonstrates various ways to use the PersonalInfoCard component
 * in different scenarios within the captain profile page.
 */

import React from "react";
import PersonalInfoCard from "@/components/admin/profile/PersonalInfoCard";
import { PersonalInfo, PersonalInfoFormData } from "@/types/profile.types";
import { toast } from "sonner";

// Example 1: Basic usage with full personal information
const BasicUsageExample = () => {
  const personalInfo: PersonalInfo = {
    firstName: "Ahmet",
    lastName: "Yılmaz",
    email: "ahmet.yilmaz@dumende.com",
    phone: "+90 532 123 4567",
    profilePhoto: "/images/captains/ahmet-yilmaz.jpg",
    dateOfBirth: "1985-03-15",
    address: {
      street: "Barbaros Bulvarı No: 145",
      city: "İstanbul",
      district: "Beşiktaş",
      postalCode: "34353",
      country: "Turkey",
    },
  };

  const handleSave = async (data: PersonalInfoFormData) => {
    try {
      // Simulate API call
      const response = await fetch("/api/captain/profile/personal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update personal information");
      }

      toast.success("Personal information updated successfully");
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error("Failed to update personal information");
      throw error; // Re-throw to let component handle the error state
    }
  };

  return React.createElement(PersonalInfoCard, {
    personalInfo,
    onSave: handleSave,
  });
};

// Example 2: Usage with minimal data (new captain)
const MinimalDataExample = () => {
  const personalInfo: PersonalInfo = {
    firstName: "Yeni",
    lastName: "Kaptan",
    email: "yeni.kaptan@dumende.com",
    phone: "+90 555 987 6543",
    // No optional fields
  };

  const handleSave = async (data: PersonalInfoFormData) => {
    console.log("Saving minimal personal info:", data);
    // Handle save logic
  };

  return React.createElement(PersonalInfoCard, {
    personalInfo,
    onSave: handleSave,
  });
};

// Example 3: Usage with loading state
const LoadingStateExample = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo | null>(
    null
  );

  React.useEffect(() => {
    // Simulate loading personal info from API
    const loadPersonalInfo = async () => {
      try {
        const response = await fetch("/api/captain/profile/personal");
        const data = await response.json();
        setPersonalInfo(data);
      } catch (error) {
        console.error("Error loading personal info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonalInfo();
  }, []);

  if (isLoading || !personalInfo) {
    return React.createElement(
      "div",
      { className: "animate-pulse" },
      "Loading..."
    );
  }

  return React.createElement(PersonalInfoCard, {
    personalInfo,
    isLoading,
    onSave: async (data) => {
      console.log("Saving:", data);
    },
  });
};

// Example 4: Usage with form validation and error handling
const ValidationExample = () => {
  const personalInfo: PersonalInfo = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "+90 555 123 4567",
  };

  const handleSave = async (data: PersonalInfoFormData) => {
    // Custom validation before API call
    if (data.firstName.length < 2) {
      throw new Error("First name must be at least 2 characters");
    }

    if (data.email && !data.email.includes("@dumende.com")) {
      throw new Error("Email must be from dumende.com domain");
    }

    // Simulate API call with potential errors
    const shouldFail = Math.random() > 0.7; // 30% chance of failure
    if (shouldFail) {
      throw new Error("Server error occurred");
    }

    console.log("Successfully saved:", data);
  };

  return React.createElement(PersonalInfoCard, {
    personalInfo,
    onSave: handleSave,
  });
};

// Example 5: Usage within a larger profile page component
const ProfilePageIntegrationExample = () => {
  const [captainProfile, setCaptainProfile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const handlePersonalInfoSave = async (data: PersonalInfoFormData) => {
    try {
      // Update the profile in the backend
      const response = await fetch(
        `/api/captain/profile/${captainProfile.id}/personal`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update personal information");
      }

      const updatedProfile = await response.json();

      // Update local state
      setCaptainProfile(updatedProfile);

      toast.success("Personal information updated successfully");
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast.error("Failed to update personal information");
      throw error;
    }
  };

  if (isLoading || !captainProfile) {
    return React.createElement("div", { className: "space-y-6" }, [
      React.createElement("div", {
        key: "skeleton",
        className: "animate-pulse bg-gray-200 h-64 rounded-lg",
      }),
    ]);
  }

  return React.createElement("div", { className: "space-y-6" }, [
    // Profile Header (existing component)
    React.createElement("div", { key: "header" }, "Profile Header Component"),

    // Personal Info Card
    React.createElement(PersonalInfoCard, {
      key: "personal-info",
      personalInfo: captainProfile.personalInfo,
      onSave: handlePersonalInfoSave,
      isLoading: false,
    }),

    // Other profile components...
    React.createElement("div", { key: "other" }, "Other Profile Components"),
  ]);
};

// Example 6: Usage with custom styling and responsive behavior
const CustomStyledExample = () => {
  const personalInfo: PersonalInfo = {
    firstName: "Styled",
    lastName: "Example",
    email: "styled@example.com",
    phone: "+90 555 111 2222",
  };

  return React.createElement(
    "div",
    {
      className: "max-w-2xl mx-auto p-4 space-y-6",
    },
    [
      React.createElement(
        "h2",
        {
          key: "title",
          className: "text-2xl font-bold text-center mb-6",
        },
        "Captain Profile"
      ),

      React.createElement(PersonalInfoCard, {
        key: "card",
        personalInfo,
        onSave: async (data) => {
          console.log("Custom styled save:", data);
        },
      }),
    ]
  );
};

// Example 7: Usage with TypeScript strict mode and proper error handling
const TypeScriptStrictExample = () => {
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [saveError, setSaveError] = React.useState<string | null>(null);

  const handleSave = React.useCallback(
    async (data: PersonalInfoFormData): Promise<void> => {
      setSaveError(null);

      try {
        // Type-safe API call
        const response = await fetch("/api/captain/profile/personal", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update");
        }

        const updatedInfo: PersonalInfo = await response.json();
        setPersonalInfo(updatedInfo);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setSaveError(errorMessage);
        throw error;
      }
    },
    []
  );

  return React.createElement("div", {}, [
    saveError &&
      React.createElement(
        "div",
        {
          key: "error",
          className:
            "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4",
        },
        saveError
      ),

    React.createElement(PersonalInfoCard, {
      key: "card",
      personalInfo,
      onSave: handleSave,
    }),
  ]);
};

export {
  BasicUsageExample,
  MinimalDataExample,
  LoadingStateExample,
  ValidationExample,
  ProfilePageIntegrationExample,
  CustomStyledExample,
  TypeScriptStrictExample,
};
