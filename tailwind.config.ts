import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
      "3xl": "1600px",
      // Orientation-specific breakpoints
      portrait: { raw: "(orientation: portrait)" },
      landscape: { raw: "(orientation: landscape)" },
      // Combined breakpoints
      "md-landscape": {
        raw: "(min-width: 768px) and (orientation: landscape)",
      },
      "lg-portrait": { raw: "(min-width: 1024px) and (orientation: portrait)" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1A5F7A",
          dark: "#12475c",
          light: "#2d7795",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#002B5B",
          dark: "#001e3f",
          light: "#003a77",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F8CB2E",
          dark: "#e5b919",
          light: "#f9d553",
          foreground: "#333333",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Modern glassmorphism colors - Optimized Balance
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          light: "rgba(255, 255, 255, 0.12)",
          dark: "rgba(255, 255, 255, 0.04)",
          border: "rgba(255, 255, 255, 0.18)",
          "border-light": "rgba(255, 255, 255, 0.25)",
          "border-dark": "rgba(255, 255, 255, 0.08)",
        },
        glow: {
          primary: "rgba(26, 95, 122, 0.4)",
          secondary: "rgba(0, 43, 91, 0.4)",
          accent: "rgba(248, 203, 46, 0.4)",
        },
      },
      backgroundImage: {
        // Modern gradient system
        "gradient-ocean":
          "linear-gradient(135deg, #1A5F7A 0%, #2d7795 50%, #4a9bb8 100%)",
        "gradient-ocean-reverse":
          "linear-gradient(315deg, #1A5F7A 0%, #2d7795 50%, #4a9bb8 100%)",
        "gradient-sunset":
          "linear-gradient(135deg, #F8CB2E 0%, #ffd54f 50%, #ffeb3b 100%)",
        "gradient-sunset-reverse":
          "linear-gradient(315deg, #F8CB2E 0%, #ffd54f 50%, #ffeb3b 100%)",
        "gradient-deep-sea":
          "linear-gradient(135deg, #002B5B 0%, #003a77 50%, #1565c0 100%)",
        "gradient-deep-sea-reverse":
          "linear-gradient(315deg, #002B5B 0%, #003a77 50%, #1565c0 100%)",
        "gradient-hero-primary":
          "linear-gradient(135deg, #1A5F7A 0%, #002B5B 50%, #1565c0 100%)",
        "gradient-hero-secondary":
          "linear-gradient(45deg, rgba(26, 95, 122, 0.8) 0%, rgba(0, 43, 91, 0.9) 100%)",
        "gradient-glass-overlay":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "gradient-glass-border":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
        "gradient-card-hover":
          "linear-gradient(135deg, rgba(26, 95, 122, 0.1) 0%, rgba(248, 203, 46, 0.1) 100%)",
        "gradient-text": "linear-gradient(135deg, #1A5F7A 0%, #F8CB2E 100%)",
        "gradient-text-reverse":
          "linear-gradient(315deg, #1A5F7A 0%, #F8CB2E 100%)",
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "40px",
        glass: "12px",
        "glass-light": "10px",
        "glass-heavy": "18px",
      },
      boxShadow: {
        glass: "0 6px 28px rgba(0, 0, 0, 0.08)",
        "glass-hover": "0 10px 35px rgba(0, 0, 0, 0.12)",
        "glass-active": "0 3px 12px rgba(0, 0, 0, 0.1)",
        glow: "0 0 20px rgba(26, 95, 122, 0.5)",
        "glow-accent": "0 0 20px rgba(248, 203, 46, 0.6)",
        "glow-secondary": "0 0 20px rgba(0, 43, 91, 0.5)",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-glass": {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px)",
            backdropFilter: "blur(0px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
            backdropFilter: "blur(10px)",
          },
        },
        "scale-in-bounce": {
          "0%": {
            opacity: "0",
            transform: "scale(0.8)",
          },
          "60%": {
            opacity: "1",
            transform: "scale(1.05)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(26, 95, 122, 0.4)",
          },
          "50%": {
            boxShadow:
              "0 0 20px rgba(26, 95, 122, 0.4), 0 0 30px rgba(26, 95, 122, 0.4)",
          },
        },
        "morph-gradient": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(26, 95, 122, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(26, 95, 122, 0.8)" },
        },
        ripple: {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        "slide-in-glass": "slide-in-glass 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
        "scale-in-bounce":
          "scale-in-bounce 0.25s cubic-bezier(0.68, -0.4, 0.265, 1.4)",
        "glow-pulse": "glow-pulse 1.8s cubic-bezier(0.23, 1, 0.32, 1) infinite",
        "morph-gradient": "morph-gradient 3s ease infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-top": "slide-in-top 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
        "bounce-gentle": "bounce-gentle 2s infinite",
        "pulse-gentle": "pulse-gentle 2s infinite",
        wiggle: "wiggle 0.5s ease-in-out",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        ripple: "ripple 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
