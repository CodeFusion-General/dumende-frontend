import { CaptainProfile, Certification } from "../types/profile.types";

// Mock certifications data
const mockCertifications: Certification[] = [
  {
    id: "cert-001",
    name: "Yacht Master Ocean",
    issuer: "Royal Yachting Association (RYA)",
    issueDate: "2019-06-15",
    expiryDate: "2024-06-15",
    certificateNumber: "YM-OCN-2019-001234",
  },
  {
    id: "cert-002",
    name: "First Aid at Sea",
    issuer: "Red Cross Maritime",
    issueDate: "2023-01-20",
    expiryDate: "2026-01-20",
    certificateNumber: "FAS-2023-005678",
  },
  {
    id: "cert-003",
    name: "VHF Radio Operator",
    issuer: "International Maritime Organization",
    issueDate: "2020-03-10",
    certificateNumber: "VHF-2020-009876",
  },
  {
    id: "cert-004",
    name: "Commercial Endorsement",
    issuer: "Maritime and Coastguard Agency",
    issueDate: "2021-08-05",
    expiryDate: "2025-08-05",
    certificateNumber: "CE-2021-112233",
  },
];

// Primary mock captain profile
export const mockCaptainProfile: CaptainProfile = {
  id: "captain-001",
  personalInfo: {
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
  },
  professionalInfo: {
    licenseNumber: "TR-CAP-2019-001234",
    licenseExpiry: "2025-12-31",
    yearsOfExperience: 8,
    certifications: mockCertifications,
    specializations: [
      "Luxury Yachts",
      "Sailing",
      "Deep Sea Fishing",
      "Sunset Cruises",
    ],
    bio: "Experienced yacht captain with over 8 years of maritime expertise. Specialized in luxury yacht operations and deep-sea fishing expeditions. Passionate about providing exceptional experiences on the beautiful waters of the Turkish coast.",
  },
  statistics: {
    totalTours: 156,
    averageRating: 4.8,
    totalReviews: 142,
    completionRate: 98.5,
    yearsActive: 5,
    totalRevenue: 125000,
    repeatCustomers: 67,
  },
  accountSettings: {
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    profileVisibility: "public",
    language: "tr",
    timezone: "Europe/Istanbul",
  },
  createdAt: "2019-05-20T10:30:00Z",
  updatedAt: "2024-12-15T14:22:00Z",
};

// Alternative mock profiles for testing different scenarios
export const mockCaptainProfileMinimal: CaptainProfile = {
  id: "captain-002",
  personalInfo: {
    firstName: "Mehmet",
    lastName: "Demir",
    email: "mehmet.demir@dumende.com",
    phone: "+90 533 987 6543",
    address: {
      city: "Antalya",
      country: "Turkey",
    },
  },
  professionalInfo: {
    licenseNumber: "TR-CAP-2022-005678",
    licenseExpiry: "2027-06-30",
    yearsOfExperience: 3,
    certifications: [mockCertifications[0]], // Only one certification
    specializations: ["Sailing"],
  },
  statistics: {
    totalTours: 45,
    averageRating: 4.2,
    totalReviews: 38,
    completionRate: 95.0,
    yearsActive: 2,
  },
  accountSettings: {
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    profileVisibility: "limited",
    language: "en",
    timezone: "Europe/Istanbul",
  },
  createdAt: "2022-03-10T08:15:00Z",
  updatedAt: "2024-11-20T16:45:00Z",
};

export const mockCaptainProfileExperienced: CaptainProfile = {
  id: "captain-003",
  personalInfo: {
    firstName: "Kemal",
    lastName: "Özkan",
    email: "kemal.ozkan@dumende.com",
    phone: "+90 534 555 1234",
    profilePhoto: "/images/captains/kemal-ozkan.jpg",
    dateOfBirth: "1975-11-22",
    address: {
      street: "Cumhuriyet Caddesi No: 78",
      city: "Bodrum",
      district: "Merkez",
      postalCode: "48400",
      country: "Turkey",
    },
  },
  professionalInfo: {
    licenseNumber: "TR-CAP-2010-000123",
    licenseExpiry: "2025-08-15",
    yearsOfExperience: 15,
    certifications: mockCertifications, // All certifications
    specializations: [
      "Luxury Yachts",
      "Sailing",
      "Deep Sea Fishing",
      "Sunset Cruises",
      "Corporate Events",
      "Multi-day Charters",
    ],
    bio: "Veteran captain with 15 years of experience navigating the Mediterranean and Aegean seas. Expert in luxury yacht operations, corporate events, and extended charter expeditions. Fluent in Turkish, English, and German.",
  },
  statistics: {
    totalTours: 487,
    averageRating: 4.9,
    totalReviews: 423,
    completionRate: 99.2,
    yearsActive: 12,
    totalRevenue: 450000,
    repeatCustomers: 189,
  },
  accountSettings: {
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    profileVisibility: "public",
    language: "tr",
    timezone: "Europe/Istanbul",
  },
  createdAt: "2012-07-08T12:00:00Z",
  updatedAt: "2024-12-18T09:30:00Z",
};

// Mock data for new captain (just started)
export const mockCaptainProfileNewbie: CaptainProfile = {
  id: "captain-004",
  personalInfo: {
    firstName: "Emre",
    lastName: "Kaya",
    email: "emre.kaya@dumende.com",
    phone: "+90 535 111 2233",
    dateOfBirth: "1992-07-08",
    address: {
      city: "Çeşme",
      district: "Merkez",
      country: "Turkey",
    },
  },
  professionalInfo: {
    licenseNumber: "TR-CAP-2024-009999",
    licenseExpiry: "2029-12-31",
    yearsOfExperience: 1,
    certifications: [
      {
        id: "cert-new-001",
        name: "Basic Sailing License",
        issuer: "Turkish Maritime Authority",
        issueDate: "2024-01-15",
        expiryDate: "2029-01-15",
        certificateNumber: "BSL-2024-001122",
      },
    ],
    specializations: ["Sailing", "Day Trips"],
    bio: "Newly licensed captain eager to provide safe and enjoyable sailing experiences. Recently completed maritime training and excited to share my passion for the sea.",
  },
  statistics: {
    totalTours: 8,
    averageRating: 4.5,
    totalReviews: 6,
    completionRate: 100.0,
    yearsActive: 1,
    totalRevenue: 3200,
    repeatCustomers: 2,
  },
  accountSettings: {
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: true,
    profileVisibility: "public",
    language: "tr",
    timezone: "Europe/Istanbul",
  },
  createdAt: "2024-01-20T14:00:00Z",
  updatedAt: "2024-12-19T11:15:00Z",
};

// Export all mock profiles for testing
export const mockCaptainProfiles = [
  mockCaptainProfile,
  mockCaptainProfileMinimal,
  mockCaptainProfileExperienced,
  mockCaptainProfileNewbie,
];

// Helper function to get mock profile by ID
export const getMockCaptainProfile = (
  id: string
): CaptainProfile | undefined => {
  return mockCaptainProfiles.find((profile) => profile.id === id);
};

// Helper function to get random mock profile
export const getRandomMockCaptainProfile = (): CaptainProfile => {
  const randomIndex = Math.floor(Math.random() * mockCaptainProfiles.length);
  return mockCaptainProfiles[randomIndex];
};
