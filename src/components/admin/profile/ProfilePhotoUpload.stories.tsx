import type { Meta, StoryObj } from "@storybook/react";
import ProfilePhotoUpload from "./ProfilePhotoUpload";

const meta: Meta<typeof ProfilePhotoUpload> = {
  title: "Admin/Profile/ProfilePhotoUpload",
  component: ProfilePhotoUpload,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A component for uploading and managing profile photos with validation and preview functionality.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size of the avatar component",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the upload functionality is disabled",
    },
    currentPhoto: {
      control: { type: "text" },
      description: "URL of the current profile photo",
    },
    userName: {
      control: { type: "text" },
      description: "User's full name for generating initials",
    },
    onPhotoChange: {
      action: "photo-changed",
      description: "Callback fired when photo is uploaded or removed",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: "Ahmet Yılmaz",
    size: "md",
    disabled: false,
  },
};

export const WithCurrentPhoto: Story = {
  args: {
    userName: "Ahmet Yılmaz",
    currentPhoto:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    size: "md",
    disabled: false,
  },
};

export const SmallSize: Story = {
  args: {
    userName: "Mehmet Demir",
    size: "sm",
    disabled: false,
  },
};

export const LargeSize: Story = {
  args: {
    userName: "Kemal Özkan",
    currentPhoto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    size: "lg",
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    userName: "Emre Kaya",
    currentPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    size: "md",
    disabled: true,
  },
};

export const DisabledWithoutPhoto: Story = {
  args: {
    userName: "Ali Veli",
    size: "md",
    disabled: true,
  },
};

export const LongName: Story = {
  args: {
    userName: "Ahmet Mehmet Mustafa Kemal Atatürk",
    size: "md",
    disabled: false,
  },
};

export const SingleName: Story = {
  args: {
    userName: "Ahmet",
    size: "md",
    disabled: false,
  },
};

// Interactive story for testing upload functionality
export const Interactive: Story = {
  args: {
    userName: "Test User",
    size: "md",
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive version for testing file upload functionality. Try uploading different file types and sizes to see validation in action.",
      },
    },
  },
};
