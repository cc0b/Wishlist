import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EBF0F7",
          100: "#D6E1EF",
          200: "#ADC3DF",
          300: "#84A5CF",
          400: "#5B87BF",
          500: "#2B5797",
          600: "#234879",
          700: "#1A365B",
          800: "#12243D",
          900: "#09121E",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Instrument Serif"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
