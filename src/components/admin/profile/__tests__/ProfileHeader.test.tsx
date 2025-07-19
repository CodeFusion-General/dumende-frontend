import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProfileHeader from "../ProfileHeader";
import { mockCaptainProfile } from "@/mocks/captainProfile.mock";

describe("ProfileHeader", () => {
  const { personalInfo, statistics } = mockCaptainProfile;

  it("renders captain name correctly", () => {
    render(
      <ProfileHeader personalInfo={personalInfo} statistics={statistics} />
    );

    expect(screen.getByText("Ahmet Yılmaz")).toBeInTheDocument();
  });

  it("displays contact information", () => {
    render(
      <ProfileHeader personalInfo={personalInfo} statistics={statistics} />
    );

    expect(screen.getByText("ahmet.yilmaz@dumende.com")).toBeInTheDocument();
    expect(screen.getByText("+90 532 123 4567")).toBeInTheDocument();
  });

  it("shows location when address is provided", () => {
    render(
      <ProfileHeader personalInfo={personalInfo} statistics={statistics} />
    );

    expect(screen.getByText("İstanbul, Turkey")).toBeInTheDocument();
  });

  it("displays statistics correctly", () => {
    render(
      <ProfileHeader personalInfo={personalInfo} statistics={statistics} />
    );

    expect(screen.getByText("156")).toBeInTheDocument(); // Total tours
    expect(screen.getByText("4.8")).toBeInTheDocument(); // Average rating
    expect(screen.getByText("98.5%")).toBeInTheDocument(); // Completion rate
    expect(screen.getByText("5")).toBeInTheDocument(); // Years active
  });

  it("shows badges with correct information", () => {
    render(
      <ProfileHeader personalInfo={personalInfo} statistics={statistics} />
    );

    expect(screen.getByText("5 yıl aktif")).toBeInTheDocument();
    expect(screen.getByText("156 tur tamamlandı")).toBeInTheDocument();
  });

  it("displays review count correctly", () => {
    render(
      <ProfileHeader personalInfo={personalInfo} statistics={statistics} />
    );

    expect(screen.getByText("(142 değerlendirme)")).toBeInTheDocument();
  });

  it("renders profile photo upload component", () => {
    render(
      <ProfileHeader personalInfo={personalInfo} statistics={statistics} />
    );

    const profileImage = screen.getByAltText("Ahmet Yılmaz profil fotoğrafı");
    expect(profileImage).toBeInTheDocument();
  });
});
