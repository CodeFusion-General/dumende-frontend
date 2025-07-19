import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Profile Header Loading Skeleton
export const ProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
        {/* Profile Photo Skeleton */}
        <div className="flex-shrink-0 self-center lg:self-start">
          <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
        </div>

        {/* Basic Info Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-8 w-48 mx-auto lg:mx-0 mb-2" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start gap-2 mt-2">
                <Skeleton className="h-4 w-32 mx-auto lg:mx-0" />
                <Skeleton className="h-4 w-24 mx-auto lg:mx-0" />
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>

            {/* Contact Info Skeleton */}
            <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-2 sm:gap-4 text-sm bg-gray-50 p-3 rounded-lg lg:bg-transparent lg:p-0">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Row Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="text-center bg-blue-50 p-3 rounded-lg lg:bg-transparent lg:p-0"
          >
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Personal Info Card Loading Skeleton
export const PersonalInfoCardSkeleton: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-20" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Name Fields Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>

        {/* Contact Fields Skeleton */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>

        {/* Date of Birth Skeleton */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Address Skeleton */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Professional Info Card Loading Skeleton
export const ProfessionalInfoCardSkeleton: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-20" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* License Information Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-36" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Experience Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>

        {/* Specializations Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </div>

        {/* Certifications Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-l-blue-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex flex-row sm:flex-col sm:text-right items-start sm:items-end gap-2 sm:gap-1">
                    <Skeleton className="h-5 w-16" />
                    <div className="flex flex-col sm:space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-18" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bio Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Statistics Card Loading Skeleton
export const StatisticsCardSkeleton: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100"
            >
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>

        {/* Completion Rate Skeleton */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Revenue and Repeat Customers Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-100"
            >
              <div className="flex items-center gap-1 sm:gap-2 mb-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-40 sm:h-48 w-full" />
          </div>

          <div>
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-44 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
