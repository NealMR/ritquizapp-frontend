import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",       // sleeker dark text (slate-900)
        paper: "#f8fafc",     // slightly cooler, softer background (slate-50)
        line: "#e2e8f0",      // softer borders
        brand: "#0284c7",     // premium blue (replaced indigo/purple)
        brandsoft: "#e0f2fe",
        brandgradient: "linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)",
        ansA: "#ef4444",      // vibrant red
        ansB: "#3b82f6",      // vibrant blue
        ansC: "#f59e0b",      // vibrant amber
        ansD: "#10b981",      // vibrant emerald
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 12px 30px -5px rgba(0, 0, 0, 0.08)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        body: ['"Figtree"', "system-ui", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
