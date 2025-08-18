/**
 * Example demonstrating Mobile Image Optimization features
 * Shows usage of all three image optimization components
 */

import React from "react";
import {
  MobileOptimizedImage,
  ResponsivePicture,
} from "../components/ui/MobileOptimizedImage";
import { LazyImage, LazyImageGallery } from "../components/ui/LazyImage";
import { OptimizedImage } from "../components/ui/OptimizedImage";

const ImageOptimizationExample: React.FC = () => {
  const sampleImages = [
    {
      src: "/images/boat1.jpg",
      alt: "Luxury yacht in Mediterranean",
      width: 400,
      height: 300,
    },
    {
      src: "/images/boat2.jpg",
      alt: "Sailing boat at sunset",
      width: 400,
      height: 300,
    },
    {
      src: "/images/boat3.jpg",
      alt: "Motor yacht in harbor",
      width: 400,
      height: 300,
    },
    {
      src: "/images/boat4.jpg",
      alt: "Catamaran on blue water",
      width: 400,
      height: 300,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Mobile Image Optimization Examples
        </h1>
        <p className="text-lg text-gray-600">
          Demonstrating advanced image optimization techniques for mobile
          performance
        </p>
      </div>

      {/* Hero Image with Priority Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          1. Hero Image with Priority Loading
        </h2>
        <p className="text-gray-600">
          Above-the-fold images should load immediately with high priority and
          optimal format.
        </p>
        <div className="relative h-96 rounded-lg overflow-hidden">
          <MobileOptimizedImage
            src="/images/hero-yacht.jpg"
            alt="Luxury yacht charter hero image"
            width={1200}
            height={400}
            priority={true}
            format="auto"
            quality={90}
            mobileOptimized={true}
            aspectRatio="3/1"
            objectFit="cover"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-4xl font-bold mb-2">
                Premium Yacht Charters
              </h3>
              <p className="text-xl">Experience luxury on the Mediterranean</p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Picture Element */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          2. Responsive Picture with Multiple Formats
        </h2>
        <p className="text-gray-600">
          Uses modern formats (AVIF, WebP) with fallbacks for maximum
          compatibility and performance.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <ResponsivePicture
            src="/images/sailing-boat.jpg"
            alt="Beautiful sailing boat"
            width={600}
            height={400}
            quality={85}
            mobileOptimized={true}
            className="rounded-lg shadow-lg"
          />
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-semibold mb-3">
              Smart Format Selection
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• AVIF format for modern browsers (up to 50% smaller)</li>
              <li>• WebP fallback for wider compatibility</li>
              <li>• JPEG fallback for legacy browsers</li>
              <li>• Automatic mobile optimization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Progressive Lazy Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          3. Progressive Lazy Loading with Blur Effect
        </h2>
        <p className="text-gray-600">
          Images load with a smooth blur-to-sharp transition for better
          perceived performance.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <LazyImage
            src="/images/yacht-interior.jpg"
            alt="Luxury yacht interior"
            width={400}
            height={300}
            enableProgressiveLoading={true}
            enableBlurTransition={true}
            mobileOptimized={true}
            className="rounded-lg shadow-md"
          />
          <LazyImage
            src="/images/yacht-deck.jpg"
            alt="Yacht deck with seating"
            width={400}
            height={300}
            enableProgressiveLoading={true}
            enableBlurTransition={true}
            mobileOptimized={true}
            className="rounded-lg shadow-md"
          />
          <LazyImage
            src="/images/yacht-cabin.jpg"
            alt="Comfortable yacht cabin"
            width={400}
            height={300}
            enableProgressiveLoading={true}
            enableBlurTransition={true}
            mobileOptimized={true}
            className="rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Optimized Image Gallery */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          4. Optimized Image Gallery with Batch Loading
        </h2>
        <p className="text-gray-600">
          Gallery loads images in batches to prevent overwhelming mobile
          devices.
        </p>
        <LazyImageGallery
          images={sampleImages}
          columns={2}
          gap="1rem"
          enableProgressiveLoading={true}
          mobileOptimized={true}
          batchSize={2}
          className="rounded-lg"
        />
      </section>

      {/* Compression Levels Comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          5. Compression Levels for Different Use Cases
        </h2>
        <p className="text-gray-600">
          Different compression levels optimize for various scenarios and
          connection speeds.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              High Quality (Low Compression)
            </h3>
            <MobileOptimizedImage
              src="/images/detail-shot.jpg"
              alt="High quality detail shot"
              width={300}
              height={200}
              compressionLevel="low"
              quality={95}
              mobileOptimized={true}
              className="rounded-lg shadow-md mb-2"
            />
            <p className="text-sm text-gray-600">
              Best for hero images and important visuals
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Balanced (Medium Compression)
            </h3>
            <MobileOptimizedImage
              src="/images/detail-shot.jpg"
              alt="Medium quality detail shot"
              width={300}
              height={200}
              compressionLevel="medium"
              quality={75}
              mobileOptimized={true}
              className="rounded-lg shadow-md mb-2"
            />
            <p className="text-sm text-gray-600">
              Good balance for most content images
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Optimized (High Compression)
            </h3>
            <MobileOptimizedImage
              src="/images/detail-shot.jpg"
              alt="Optimized detail shot"
              width={300}
              height={200}
              compressionLevel="high"
              quality={60}
              mobileOptimized={true}
              className="rounded-lg shadow-md mb-2"
            />
            <p className="text-sm text-gray-600">
              Best for slow connections and thumbnails
            </p>
          </div>
        </div>
      </section>

      {/* Legacy OptimizedImage Component */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          6. Legacy OptimizedImage Component
        </h2>
        <p className="text-gray-600">
          Enhanced version of the existing OptimizedImage component with mobile
          improvements.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <OptimizedImage
            src="/images/classic-yacht.jpg"
            alt="Classic sailing yacht"
            width={500}
            height={300}
            enableLazyLoading={true}
            enableProgressiveLoading={true}
            enableResponsive={true}
            enableFormatOptimization={true}
            mobileOptimized={true}
            className="rounded-lg shadow-lg"
          />
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-semibold mb-3">Enhanced Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Mobile-first responsive breakpoints</li>
              <li>• Improved lazy loading with larger margins</li>
              <li>• Better placeholder generation</li>
              <li>• Connection-aware optimization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Performance Tips */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Mobile Performance Tips
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Use priority loading for above-the-fold images</li>
              <li>• Enable progressive loading for better UX</li>
              <li>• Choose appropriate compression levels</li>
              <li>• Use responsive images with proper breakpoints</li>
              <li>• Enable format optimization for modern browsers</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Mobile Optimizations</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Automatic quality reduction for slow connections</li>
              <li>• Smaller image sizes for low-end devices</li>
              <li>• Batch loading to prevent memory issues</li>
              <li>• Larger intersection margins for mobile</li>
              <li>• Connection-aware loading strategies</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImageOptimizationExample;
