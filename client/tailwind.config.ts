import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF385C", // Airbnb/Tinder-like Red
          hover: "#E00B41",
          light: "#FFEDF0",
        },
        secondary: {
          DEFAULT: "#424242",
        },
        dark: {
          900: "#121212", // True Black
          800: "#1E1E1E", // Card Background
          700: "#2C2C2C", // Input Background
        },
        gray: {
          400: "#A0A0A0",
          500: "#717171",
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'], // Use CSS variable for font
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
