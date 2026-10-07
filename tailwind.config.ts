import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2340",       // text, top bar
        paper: "#F4F6FA",     // page background
        line: "#DCE1EC",      // borders
        brand: "#2B3FC4",     // primary actions
        brandsoft: "#E6E9FB",
        ansA: "#E0453A",      // answer tile colours
        ansB: "#2A7DE1",
        ansC: "#E9A01B",
        ansD: "#16935B",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        body: ['"Figtree"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
