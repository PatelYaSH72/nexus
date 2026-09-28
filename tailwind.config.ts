import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark surfaces
        "black-100": "#0A0E15",
        "black-90":  "#212631",
        "black-80":  "#373F4E",
        "black-70":  "#4E576A",
        "black-60":  "#667085",
        // Text shades
        "white-100": "#FFFFFF",
        "white-90":  "#F0F1F5",
        "white-80":  "#E0E4EB",
        "white-70":  "#D1D6E0",
        "white-60":  "#BFC6D4",
        // Accent
        mint:     "#A9DFD8",
        "mint-dim": "#7FCCC3",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(169,223,216,0.14) 0%, transparent 70%), radial-gradient(ellipse 100% 80% at 20% 50%, rgba(169,223,216,0.05) 0%, transparent 60%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
