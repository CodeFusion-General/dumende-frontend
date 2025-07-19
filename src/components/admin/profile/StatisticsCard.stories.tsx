import type { Meta, StoryObj } from "@storybook/react";
import StatisticsCard from "./StatisticsCard";
import {
  mockCaptainProfile,
  mockCaptainProfileMinimal,
  mockCaptainProfileExperienced,
  mockCaptainProfileNewbie,
} from "@/mocks/captainProfile.mock";

const meta: Meta<typeof StatisticsCard> = {
  title: "Admin/Profile/StatisticsCard",
  component: StatisticsCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    statistics: mockCaptainProfile.statistics,
    isLoading: false,
  },
};

export const Experienced: Story = {
  args: {
    statistics: mockCaptainProfileExperienced.statistics,
    isLoading: false,
  },
};

export const Minimal: Story = {
  args: {
    statistics: mockCaptainProfileMinimal.statistics,
    isLoading: false,
  },
};

export const NewCaptain: Story = {
  args: {
    statistics: mockCaptainProfileNewbie.statistics,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    statistics: mockCaptainProfile.statistics,
    isLoading: true,
  },
};

export const NoData: Story = {
  args: {
    statistics: {
      totalTours: 0,
      averageRating: 0,
      totalReviews: 0,
      completionRate: 0,
      yearsActive: 0,
    },
    isLoading: false,
  },
};

export const PartialData: Story = {
  args: {
    statistics: {
      totalTours: 25,
      averageRating: 4.3,
      totalReviews: 20,
      completionRate: 96.0,
      yearsActive: 2,
      // No revenue or repeat customers data
    },
    isLoading: false,
  },
};

export const HighPerformance: Story = {
  args: {
    statistics: {
      totalTours: 500,
      averageRating: 4.9,
      totalReviews: 485,
      completionRate: 99.8,
      yearsActive: 10,
      totalRevenue: 750000,
      repeatCustomers: 250,
    },
    isLoading: false,
  },
};

export const LowPerformance: Story = {
  args: {
    statistics: {
      totalTours: 15,
      averageRating: 3.2,
      totalReviews: 12,
      completionRate: 80.0,
      yearsActive: 1,
      totalRevenue: 5000,
      repeatCustomers: 2,
    },
    isLoading: false,
  },
};

export const EmptyStatistics: Story = {
  args: {
    statistics: {} as any,
    isLoading: false,
  },
};
