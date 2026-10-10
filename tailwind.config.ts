import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#FBF7F0",
          100: "#F4EDE1",
          200: "#E8DCC8",
          300: "#D4C2A4",
        },
        forest: {
          700: "#234236",
          800: "#1B3A2F",
          900: "#132820",
        },
        ink: {
          700: "#3F3A36",
          800: "#2A2623",
          900: "#1C1917",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 40px rgba(28, 25, 23, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
