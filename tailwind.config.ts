import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Brand palette pulled from the Safian logo
        brand: {
          green: {
            50: "#F0F7EC",
            100: "#D9ECC9",
            200: "#B8DD9F",
            300: "#96CE75",
            400: "#7BBF55",
            500: "#6B9F3E", // primary green from logo
            600: "#5A8533",
            700: "#486B28",
            800: "#36501D",
            900: "#243612",
          },
          orange: {
            50: "#FFF6EC",
            100: "#FFE7CC",
            200: "#FFCE99",
            300: "#FFB566",
            400: "#FF9D33",
            500: "#F68B1F", // primary orange from logo
            600: "#E57A0E",
            700: "#B85F0B",
            800: "#8A4708",
            900: "#5C2F05",
          },
          blue: {
            50: "#EBF2F9",
            100: "#D1E1F0",
            200: "#A8C7E3",
            300: "#7FADD6",
            400: "#5693C9",
            500: "#2B5C9E", // primary blue from logo
            600: "#1E4A7F",
            700: "#183A65",
            800: "#122A4B",
            900: "#0C1A31",
          },
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
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
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(246,139,31,0.5)" },
          "70%": { boxShadow: "0 0 0 14px rgba(246,139,31,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(246,139,31,0)" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.1)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.08)" },
          "60%": { transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        "pulse-ring": "pulse-ring 2s infinite",
        heartbeat: "heartbeat 1.8s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "scroll-left": "scroll-left 20s linear infinite",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #6B9F3E 0%, #F68B1F 50%, #2B5C9E 100%)",
        "brand-radial":
          "radial-gradient(circle at top left, rgba(107,159,62,0.2), transparent 50%), radial-gradient(circle at bottom right, rgba(246,139,31,0.2), transparent 55%)",
      },
    },
  },
  plugins: [],
};

export default config;
