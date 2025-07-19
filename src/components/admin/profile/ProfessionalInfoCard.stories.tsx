import type { Meta, StoryObj } from "@storybook/react";
import ProfessionalInfoCard from "./ProfessionalInfoCard";
import {
  mockCaptainProfile,
  mockCaptainProfileMinimal,
  mockCaptainProfileExperienced,
} from "@/mocks/captainProfile.mock";

const meta: Meta<typeof ProfessionalInfoCard> = {
  title: "Admin/Profile/ProfessionalInfoCard",
  component: ProfessionalInfoCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    onSave: { action: "saved" },
    isLoading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with full professional info
export const Default: Story = {
  args: {
    professionalInfo: mockCaptainProfile.professionalInfo,
    isLoading: false,
  },
};

// Story with minimal professional info
export const Minimal: Story = {
  args: {
    professionalInfo: mockCaptainProfileMinimal.professionalInfo,
    isLoading: false,
  },
};

// Story with experienced captain (many certifications)
export const Experienced: Story = {
  args: {
    professionalInfo: mockCaptainProfileExperienced.professionalInfo,
    isLoading: false,
  },
};

// Story with expiring license
export const ExpiringLicense: Story = {
  args: {
    professionalInfo: {
      ...mockCaptainProfile.professionalInfo,
      licenseExpiry: (() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 2); // 2 months from now
        return date.toISOString().split("T")[0];
      })(),
    },
    isLoading: false,
  },
};

// Story with expired license
export const ExpiredLicense: Story = {
  args: {
    professionalInfo: {
      ...mockCaptainProfile.professionalInfo,
      licenseExpiry: "2023-01-01", // Expired date
    },
    isLoading: false,
  },
};

// Story in loading state
export const Loading: Story = {
  args: {
    professionalInfo: mockCaptainProfile.professionalInfo,
    isLoading: true,
  },
};

// Story without bio
export const NoBio: Story = {
  args: {
    professionalInfo: {
      ...mockCaptainProfile.professionalInfo,
      bio: undefined,
    },
    isLoading: false,
  },
};

// Story with single specialization
export const SingleSpecialization: Story = {
  args: {
    professionalInfo: {
      ...mockCaptainProfile.professionalInfo,
      specializations: ["Sailing"],
    },
    isLoading: false,
  },
};

// Story with new captain (low experience)
export const NewCaptain: Story = {
  args: {
    professionalInfo: {
      ...mockCaptainProfile.professionalInfo,
      yearsOfExperience: 1,
      certifications: [mockCaptainProfile.professionalInfo.certifications[0]], // Only one certification
      specializations: ["Day Trips"],
      bio: "Newly licensed captain eager to provide safe and enjoyable sailing experiences.",
    },
    isLoading: false,
  },
};
