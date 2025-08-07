import { useEffect, useRef } from "react";

interface FloatingElementProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  speed = 0.3,
  direction = "up",
  delay = 0,
  className = "",
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      const rate = scrollY * speed * (direction === "up" ? -1 : 1);
      element.style.transform = `translateY(${rate}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return (
    <div
      ref={elementRef}
      className={`gpu-accelerated ${className}`}
      style={{
        animationDelay: `${delay}s`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

interface FloatingGlassElementsProps {
  isVisible?: boolean;
}

const FloatingGlassElements: React.FC<FloatingGlassElementsProps> = ({
  isVisible = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(".floating-element");

    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.animationDelay = `${index * 0.2}s`;

      if (isVisible) {
        htmlElement.classList.add("animate-fade-in-up");
      }
    });
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }}
    >
      {/* Floating Glass Orbs */}
      <FloatingElement speed={0.2} delay={0} className="floating-element">
        <div
          className="absolute top-20 left-10 w-32 h-32 glass-light rounded-full opacity-20 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
            backdropFilter: "blur(20px)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
      </FloatingElement>

      <FloatingElement speed={0.4} delay={0.5} className="floating-element">
        <div
          className="absolute top-40 right-20 w-24 h-24 glass-light rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(21, 101, 192, 0.3) 0%, transparent 70%)",
            backdropFilter: "blur(15px)",
            animation: "float 6s ease-in-out infinite reverse",
          }}
        />
      </FloatingElement>

      <FloatingElement speed={0.3} delay={1} className="floating-element">
        <div
          className="absolute bottom-40 left-1/4 w-20 h-20 glass-light rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(26, 95, 122, 0.4) 0%, transparent 70%)",
            backdropFilter: "blur(12px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
      </FloatingElement>

      {/* Floating Glass Cards */}
      <FloatingElement speed={0.25} delay={1.5} className="floating-element">
        <div
          className="absolute top-32 right-1/3 glass-card p-4 rounded-2xl opacity-10 w-48 h-32"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(25px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            animation: "float 12s ease-in-out infinite",
          }}
        >
          <div className="w-full h-4 bg-white/20 rounded mb-2"></div>
          <div className="w-3/4 h-3 bg-white/15 rounded mb-1"></div>
          <div className="w-1/2 h-3 bg-white/15 rounded"></div>
        </div>
      </FloatingElement>

      <FloatingElement speed={0.35} delay={2} className="floating-element">
        <div
          className="absolute bottom-32 right-10 glass-card p-3 rounded-xl opacity-15 w-32 h-24"
          style={{
            background: "rgba(26, 95, 122, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(26, 95, 122, 0.2)",
            animation: "float 9s ease-in-out infinite reverse",
          }}
        >
          <div className="w-full h-3 bg-blue-300/30 rounded mb-2"></div>
          <div className="w-2/3 h-2 bg-blue-300/20 rounded"></div>
        </div>
      </FloatingElement>

      {/* Floating Geometric Shapes */}
      <FloatingElement speed={0.15} delay={2.5} className="floating-element">
        <div
          className="absolute top-1/2 left-16 w-16 h-16 glass-light opacity-20"
          style={{
            background:
              "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(26, 95, 122, 0.1) 100%)",
            backdropFilter: "blur(15px)",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            animation: "float 7s ease-in-out infinite, rotateIn 1s ease-out",
          }}
        />
      </FloatingElement>

      <FloatingElement speed={0.45} delay={3} className="floating-element">
        <div
          className="absolute bottom-1/4 left-1/2 w-12 h-12 glass-light opacity-25"
          style={{
            background:
              "linear-gradient(135deg, rgba(21, 101, 192, 0.2) 0%, rgba(74, 155, 184, 0.1) 100%)",
            backdropFilter: "blur(10px)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            animation:
              "float 11s ease-in-out infinite reverse, morphGradient 4s ease-in-out infinite",
          }}
        />
      </FloatingElement>

      {/* Animated Light Rays */}
      <FloatingElement speed={0.1} delay={0} className="floating-element">
        <div
          className="absolute top-0 left-1/4 w-1 h-full opacity-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
            transform: "rotate(15deg)",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
      </FloatingElement>

      <FloatingElement speed={0.2} delay={1} className="floating-element">
        <div
          className="absolute top-0 right-1/3 w-1 h-full opacity-15"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(26, 95, 122, 0.4) 50%, transparent 100%)",
            transform: "rotate(-20deg)",
            animation: "shimmer 4s ease-in-out infinite reverse",
          }}
        />
      </FloatingElement>

      {/* Particle Effects */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, index) => (
          <FloatingElement
            key={index}
            speed={0.1 + index * 0.05}
            delay={index * 0.3}
            className="floating-element"
          >
            <div
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${10 + index * 7}%`,
                top: `${20 + index * 5}%`,
                animation: `float ${
                  6 + (index % 4)
                }s ease-in-out infinite, pulse 2s ease-in-out infinite`,
                animationDelay: `${index * 0.5}s`,
              }}
            />
          </FloatingElement>
        ))}
      </div>
    </div>
  );
};

export default FloatingGlassElements;
