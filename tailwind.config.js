/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

export const texts = {
  // Title styles
  "title-h1": [
    "15rem",
    {
      lineHeight: "10rem",
      fontWeight: "500",
      textTransform: "uppercase",
    },
  ],
};

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        founders: ["var(--font-founders)"],
      },
      fontSize: texts,
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
