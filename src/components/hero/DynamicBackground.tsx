import { useState, useEffect, useRef } from "react";

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

interface BackgroundLayer {
  id: string;
  image: string;
  gradient: string;
  opacity: number;
  blurAmount: number;
}

interface DynamicBackgroundProps {
  images: string[];
  currentIndex: number;
  transitionDuration?: number;
  enableTimeBasedShifting?: boolean;
  enableScrollBasedShifting?: boolean;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  images,
  currentIndex,
  transitionDuration = 1000,
  enableTimeBasedShifting = true,
  enableScrollBasedShifting = true,
}) => {
  const [layers, setLayers] = useState<BackgroundLayer[]>([]);
  const [gradientShift, setGradientShift] = useState(0);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Throttle refs for performance
  const lastScrollTime = useRef(0);
  const scrollThrottleDelay = isMobile ? 150 : 50;

  // Gradient configurations for different moods/times - All Ocean Theme
  const gradientConfigs = [
    {
      primary:
        "linear-gradient(135deg, rgba(26, 95, 122, 0.8) 0%, rgba(0, 43, 91, 0.9) 100%)",
      secondary:
        "linear-gradient(45deg, rgba(26, 95, 122, 0.6) 0%, rgba(21, 101, 192, 0.7) 100%)",
    },
    {
      primary:
        "linear-gradient(135deg, rgba(0, 43, 91, 0.8) 0%, rgba(26, 95, 122, 0.9) 100%)",
      secondary:
        "linear-gradient(45deg, rgba(21, 101, 192, 0.6) 0%, rgba(26, 95, 122, 0.7) 100%)",
    },
    {
      primary:
        "linear-gradient(135deg, rgba(21, 101, 192, 0.8) 0%, rgba(0, 43, 91, 0.9) 100%)",
      secondary:
        "linear-gradient(45deg, rgba(74, 155, 184, 0.6) 0%, rgba(26, 95, 122, 0.7) 100%)",
    },
  ];

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice());
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize layers
  useEffect(() => {
    const initialLayers: BackgroundLayer[] = images.map((image, index) => ({
      id: `layer-${index}`,
      image,
      gradient: gradientConfigs[index % gradientConfigs.length].primary,
      opacity: index === currentIndex ? 1 : 0,
      blurAmount: 0,
    }));

    setLayers(initialLayers);
  }, [images]);

  // Handle image transitions
  useEffect(() => {
    setLayers((prevLayers) =>
      prevLayers.map((layer, index) => ({
        ...layer,
        opacity: index === currentIndex ? 1 : 0,
        gradient:
          gradientConfigs[currentIndex % gradientConfigs.length].primary,
      }))
    );
  }, [currentIndex]);

  // Time-based gradient shifting - Disabled on mobile for performance
  useEffect(() => {
    if (!enableTimeBasedShifting || isMobile) return;

    const interval = setInterval(() => {
      setGradientShift((prev) => (prev + 1) % 360);
    }, 800); // Further reduced frequency for better performance

    return () => clearInterval(interval);
  }, [enableTimeBasedShifting, isMobile]);

  // Scroll-based effects - Simplified for mobile
  useEffect(() => {
    if (!enableScrollBasedShifting) return;

    let ticking = false;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime.current < scrollThrottleDelay) return;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          scrollY.current = window.scrollY;
          const scrollProgress = Math.min(scrollY.current / window.innerHeight, 1);

          if (isMobile) {
            // Simplified mobile version - only blur effect
            setLayers((prevLayers) =>
              prevLayers.map((layer) => ({
                ...layer,
                blurAmount: scrollProgress * 1.5, // Reduced blur for mobile
              }))
            );
          } else {
            // Full desktop version
            setLayers((prevLayers) =>
              prevLayers.map((layer, index) => ({
                ...layer,
                blurAmount: scrollProgress * 3,
                gradient:
                  index === currentIndex
                    ? `linear-gradient(${135 + scrollProgress * 45}deg, 
                      rgba(26, 95, 122, ${0.8 - scrollProgress * 0.2}) 0%, 
                      rgba(0, 43, 91, ${0.9 - scrollProgress * 0.1}) 100%)`
                    : layer.gradient,
              }))
            );
          }
          
          lastScrollTime.current = now;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableScrollBasedShifting, currentIndex, isMobile, scrollThrottleDelay]);

  return (
    <div
      ref={backgroundRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ willChange: "transform" }}
    >
      {/* Base Image Layers */}
      {layers.map((layer, index) => (
        <div
          key={layer.id}
          className="absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out"
          style={{
            opacity: layer.opacity,
            transform: `translateZ(0)`,
            backfaceVisibility: "hidden",
          }}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage: `url(${layer.image})`,
              filter: `blur(${layer.blurAmount}px)`,
              transform: `scale(${1 + layer.blurAmount * 0.02})`, // Slight scale to prevent blur edges
              transition: "filter 0.3s ease-out, transform 0.3s ease-out",
            }}
          />

          {/* Primary Gradient Overlay */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: layer.gradient,
              mixBlendMode: "multiply",
              transition: "background 0.5s ease-in-out",
            }}
          />

          {/* Secondary Animated Gradient - Disabled on mobile */}
          {!isMobile && (
            <div
              className="absolute inset-0 w-full h-full opacity-60"
              style={{
                background:
                  gradientConfigs[index % gradientConfigs.length].secondary,
                backgroundSize: "400% 400%",
                backgroundPosition: `${gradientShift}% 50%`,
                animation: enableTimeBasedShifting
                  ? "morphGradient 8s ease-in-out infinite"
                  : "none",
                mixBlendMode: "overlay",
                transition: "background-position 0.1s ease-out",
              }}
            />
          )}
        </div>
      ))}

      {/* Dynamic Particle Layer - Simplified for mobile */}
      {!isMobile ? (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at ${
                50 + Math.sin(gradientShift * 0.01) * 20
              }% ${50 + Math.cos(gradientShift * 0.01) * 20}%, 
                rgba(255, 255, 255, 0.1) 0%, 
                transparent 50%)`,
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at ${
                30 + Math.cos(gradientShift * 0.008) * 25
              }% ${70 + Math.sin(gradientShift * 0.008) * 25}%, 
                rgba(248, 203, 46, 0.2) 0%, 
                transparent 40%)`,
              animation: "float 8s ease-in-out infinite reverse",
            }}
          />
        </div>
      ) : (
        // Static version for mobile
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                rgba(255, 255, 255, 0.08) 0%, 
                transparent 50%)`,
            }}
          />
        </div>
      )}

      {/* Vignette Effect */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)",
          opacity: 0.6,
        }}
      />
    </div>
  );
};

export default DynamicBackground;
