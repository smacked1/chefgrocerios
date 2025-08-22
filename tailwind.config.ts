// Complete ChefGrocer redesign with premium iOS-style theme
// SPACING: Fix crowded layout - increase all spacing (space-y-6, px-6, py-4, gap-6)
// COLORS: Darken and enrich - Rich orange primary (#EA580C), deep forest green (#065F46), rich purple (#7C2D92)  
// BUTTONS: iOS-style with rounded-xl, shadow-sm, proper touch targets (min-h-12)
// TABS: Darker active states, better contrast, smooth transitions
// CARDS: Add breathing room with gap-4, rounded-xl, subtle shadows
// Add iOS blur effects, glass morphism, and gradient overlays
// Create consistent component tokens for buttons, cards, inputs
import type { Config } from "tailwindcss";


export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
    

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#EA580C", // Rich orange
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#065F46", // Deep forest green
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#7C2D92", // Rich purple
          foreground: "hsl(var(--accent-foreground))",
        },
        success: "#10B981", // Emerald green
        warning: "#f97316", // Amber orange
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;