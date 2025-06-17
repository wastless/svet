/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

export const texts = {
  // Title styles
  "title-h1": [
    "20rem",
    {
      lineHeight: "13.5rem",
      fontWeight: "700",
      textTransform: "uppercase",
    },
  ],
  "md-title-h1": [
    "16rem",
    {
      lineHeight: "11rem",
      fontWeight: "700",
      textTransform: "uppercase",
    },
  ],
  "sm-title-h1": [
    "11.25rem",
    {
      lineHeight: "8rem",
      fontWeight: "700",
      textTransform: "uppercase",
    },
  ],
  "title-h2": [
    "11.25rem",
    {
      lineHeight: "10rem",
      fontWeight: "700",
      textTransform: "uppercase",
    },
  ],
  "title-h3": [
    "6.25rem",
    {
      lineHeight: "5.625rem",
      fontWeight: "700",
      textTransform: "uppercase",
    },
  ],
  "title-h4": [
    "3.75rem",
    {
      lineHeight: "3.125rem",
      fontWeight: "700",
      textTransform: "uppercase",
    },
  ],
  "sm-title-h4": [
    "2.75rem",
    {
      lineHeight: "3.125rem",
      fontWeight: "700",
      textTransform: "uppercase",
    },
  ],
  "title-h5": [
    "2.25rem",
    {
      lineHeight: "1.875rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.09em",
    },
  ],

  // Paragraph styles
  "paragraph-xl": [
    "1.25rem",
    { lineHeight: "1.75rem", fontWeight: "400" },
  ],
  "paragraph-lg": [
    "1rem",
    { lineHeight: "1.25rem", fontWeight: "400" },
  ],

  "paragraph-md": ["0.875rem", { lineHeight: "1rem", fontWeight: "400" }],

  "paragraph-sm": ["0.75rem", { lineHeight: "0.875rem", fontWeight: "400" }],

  "paragraph-xs": [
    "0.625rem",
    {
      lineHeight: "0.75rem",
      fontWeight: "400",
    },
  ],

  // Label styles
  "label-2xl": ["5rem", { lineHeight: "6rem", fontWeight: "400" }],
  "label-xl": ["3.5rem", { lineHeight: "4.5rem", fontWeight: "400" }],
  "label-lg": ["2.5rem", { lineHeight: "3.5rem", fontWeight: "400" }],
  "label-md": ["2rem", { lineHeight: "2.75rem", fontWeight: "400" }],
  "label-sm": ["1.5rem", { lineHeight: "2rem", fontWeight: "400" }],
  "label-xs": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "400" }],
  // Marker styles
  "marker-lg": [
    "3rem",
    {
      lineHeight: "4.375rem",
      fontWeight: "400",
    },
  ],
  "marker-md": ["2rem", { lineHeight: "3rem", fontWeight: "400" }],
  "marker-sm": ["1.5rem", { lineHeight: "2.5rem", fontWeight: "400" }],
};

export const borderRadii = {
  8: ".5rem",
  10: ".625rem",
  20: "1.25rem",
  24: "1.5rem",
};

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '380px',
      'md': '1024px',
      'lg': '1536px',
    },
    colors: {
      gray: {
        0: "var(--gray-0)",
        50: "var(--gray-50)",
        100: "var(--gray-100)",
        200: "var(--gray-200)",
        300: "var(--gray-300)",
        400: "var(--gray-400)",
        500: "var(--gray-500)",
        600: "var(--gray-600)",
        700: "var(--gray-700)",
        800: "var(--gray-800)",
        900: "var(--gray-900)",
        950: "var(--gray-950)",
        "alpha-24": "var(--gray-alpha-24)",
        "alpha-16": "var(--gray-alpha-16)",
        "alpha-10": "var(--gray-alpha-10)",
      },
      neutral: {
        0: "var(--neutral-0)",
        50: "var(--neutral-50)",
        100: "var(--neutral-100)",
        200: "var(--neutral-200)",
        300: "var(--neutral-300)",
        400: "var(--neutral-400)",
        500: "var(--neutral-500)",
        600: "var(--neutral-600)",
        700: "var(--neutral-700)",
        800: "var(--neutral-800)",
        900: "var(--neutral-900)",
        950: "var(--neutral-950)",
        "alpha-24": "var(--neutral-alpha-24)",
        "alpha-16": "var(--neutral-alpha-16)",
        "alpha-10": "var(--neutral-alpha-10)",
      },
      white: {
        DEFAULT: "#fff",
      },
      black: {
        DEFAULT: "#000",
      },
      red: {
        50: "var(--red-50)",
        100: "var(--red-100)",
        200: "var(--red-200)",
        300: "var(--red-300)",
        400: "var(--red-400)",
        500: "var(--red-500)",
        600: "var(--red-600)",
        700: "var(--red-700)",
        800: "var(--red-800)",
        900: "var(--red-900)",
        950: "var(--red-950)",
        "alpha-24": "var(--red-alpha-24)",
        "alpha-16": "var(--red-alpha-16)",
        "alpha-10": "var(--red-alpha-10)",
      },
      error: {
        dark: "var(--error-dark)",
        base: "var(--error-base)",
        light: "var(--error-light)",
        lighter: "var(--error-lighter)",
      },
      bg: {
        "strong-950": "var(--bg-strong-950)",
        "surface-800": "var(--bg-surface-800)",
        "sub-300": "var(--bg-sub-300)",
        "soft-200": "var(--bg-soft-200)",
        "weak-50": "var(--bg-weak-50)",
        "white-0": "var(--bg-white-0)",
      },
      text: {
        "strong-950": "var(--text-strong-950)",
        "sub-600": "var(--text-sub-600)",
        "soft-400": "var(--text-soft-400)",
        "disabled-300": "var(--text-disabled-300)",
        "white-0": "var(--text-white-0)",
      },
      stroke: {
        "strong-950": "var(--stroke-strong-950)",
        "sub-300": "var(--stroke-sub-300)",
        "soft-200": "var(--stroke-soft-200)",
        "white-0": "var(--stroke-white-0)",
      },
      adaptive: {
        DEFAULT: "var(--adaptive-text)",
        text: "var(--adaptive-text)",
        "text-inverted": "var(--adaptive-text-inverted)",
        bg: "var(--adaptive-bg)",
        "bg-inverted": "var(--adaptive-bg-inverted)",
        stroke: "var(--adaptive-stroke)",
        "stroke-inverted": "var(--adaptive-stroke-inverted)",
      },
      selection: {
        bg: "var(--selection-bg)",
        text: "var(--selection-text)",
      },
      marker: {
        DEFAULT: "var(--marker)",
      },
      polaroid: {
        paper: "var(--polaroid-paper)",
      },
    },
    extend: {
      borderRadius: {
        ...borderRadii,
      },
      fontFamily: {
        founders: ["var(--font-founders)"],
        nyghtserif: ["var(--font-nyghtserif)"],
        styrene: ["var(--font-styrene)"],
        euclid: ["var(--font-euclid)"],
        permanent: ["var(--font-permanent)"],
      },
      fontSize: texts,
      transitionTimingFunction: {
        'custom': 'cubic-bezier(0.22,0.61,0.36,1)',
      },
      transitionDuration: {
        '800': '800ms',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
        'visible': 'visible',
      },
      transformOrigin: {
        'center': 'center',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
