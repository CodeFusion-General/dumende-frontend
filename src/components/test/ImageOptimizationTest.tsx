/**
 * Image Optimization Test Component
 * Demonstrates progressive loading, lazy loading, and responsive images
 */

import React from "react";
import {
  OptimizedImage,
  OptimizedBackground,
  OptimizedImageGallery,
  OptimizedHeroImage,
} from "../ui/OptimizedImage";

export const ImageOptimizationTest: React.FC = () => {
  const sampleImages = [
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      alt: "Luxury yacht on calm waters",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800",
      alt: "Modern sailing yacht",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800",
      alt: "Yacht interior luxury",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      alt: "Yacht deck with ocean view",
      width: 800,
      height: 600,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Optimization Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Testing progressive loading, lazy loading, responsive images, and
            modern image formats
          </p>
        </div>

        {/* Hero Image Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Hero Image with Optimization
          </h2>
          <OptimizedHeroImage
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920"
            alt="Luxury yacht hero image"
            mobileSrc="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=768"
            tabletSrc="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1024"
            enableParallax={true}
            overlayOpacity={0.4}
            className="h-96 rounded-lg"
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <h3 className="text-3xl font-bold mb-2">
                  Optimized Hero Image
                </h3>
                <p className="text-lg opacity-90">
                  With progressive loading and responsive sources
                </p>
              </div>
            </div>
          </OptimizedHeroImage>
        </section>

        {/* Single Image Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Single Optimized Image
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-2">
                With Progressive Loading
              </h3>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600"
                alt="Sailing yacht with progressive loading"
                width={600}
                height={400}
                enableProgressiveLoading={true}
                enableLazyLoading={true}
                enableResponsive={true}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Standard Loading</h3>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600"
                alt="Yacht interior standard loading"
                width={600}
                height={400}
                enableProgressiveLoading={false}
                enableLazyLoading={true}
                enableResponsive={true}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Background Image Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Optimized Background Image
          </h2>
          <OptimizedBackground
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200"
            enableLazyLoading={true}
            enableFormatOptimization={true}
            className="h-64 rounded-lg flex items-center justify-center"
          >
            <div className="text-center text-white bg-black bg-opacity-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">Background Image</h3>
              <p className="text-lg">
                With lazy loading and format optimization
              </p>
            </div>
          </OptimizedBackground>
        </section>

        {/* Image Gallery Test */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Optimized Image Gallery
          </h2>
          <OptimizedImageGallery
            images={sampleImages}
            columns={2}
            gap="1.5rem"
            enableLazyLoading={true}
            enableProgressiveLoading={true}
            enableResponsive={true}
            className="rounded-lg overflow-hidden"
          />
        </section>

        {/* Performance Metrics */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Performance Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                ✓ Progressive Loading
              </h3>
              <p className="text-gray-600">
                Blur-to-sharp transitions for better perceived performance
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">
                ✓ Lazy Loading
              </h3>
              <p className="text-gray-600">
                Images load only when they enter the viewport
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-purple-600 mb-2">
                ✓ Format Optimization
              </h3>
              <p className="text-gray-600">
                Automatic WebP/AVIF format detection and usage
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-orange-600 mb-2">
                ✓ Responsive Images
              </h3>
              <p className="text-gray-600">
                Automatic srcset generation for different screen sizes
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                ✓ Error Handling
              </h3>
              <p className="text-gray-600">
                Graceful fallbacks for failed image loads
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                ✓ Accessibility
              </h3>
              <p className="text-gray-600">
                Proper alt text and reduced motion support
              </p>
            </div>
          </div>
        </section>

        {/* Loading States Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Loading States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Loading State</h3>
              <div className="w-full h-48 bg-gray-200 rounded-lg image-loading relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Loaded State</h3>
              <div className="w-full h-48 bg-green-100 rounded-lg image-loaded flex items-center justify-center">
                <span className="text-green-600 font-medium">
                  ✓ Image Loaded
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Error State</h3>
              <div className="w-full h-48 bg-red-100 rounded-lg image-error flex items-center justify-center">
                <span className="text-red-600 font-medium">⚠ Load Failed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Test Images with Different Loading Strategies */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Loading Strategy Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Immediate Loading */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Immediate Loading
              </h3>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300"
                alt="Immediate loading test"
                width={300}
                height={200}
                enableLazyLoading={false}
                enableProgressiveLoading={false}
                className="w-full rounded-lg"
              />
            </div>

            {/* Lazy Loading Only */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Lazy Loading
              </h3>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=300"
                alt="Lazy loading test"
                width={300}
                height={200}
                enableLazyLoading={true}
                enableProgressiveLoading={false}
                className="w-full rounded-lg"
              />
            </div>

            {/* Progressive Loading Only */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Progressive Loading
              </h3>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=300"
                alt="Progressive loading test"
                width={300}
                height={200}
                enableLazyLoading={false}
                enableProgressiveLoading={true}
                className="w-full rounded-lg"
              />
            </div>

            {/* Both Optimizations */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">
                Full Optimization
              </h3>
              <OptimizedImage
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300"
                alt="Full optimization test"
                width={300}
                height={200}
                enableLazyLoading={true}
                enableProgressiveLoading={true}
                enableResponsive={true}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ImageOptimizationTest;
