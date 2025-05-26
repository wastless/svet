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
  "paragraph-xl-bold": ["1.25rem", { lineHeight: "1.5rem", fontWeight: "700" }],
  "paragraph-xl-medium": [
    "1.25rem",
    { lineHeight: "1.5rem", fontWeight: "500" },
  ],
  "paragraph-xl-regular": [
    "1.25rem",
    { lineHeight: "1.5rem", fontWeight: "400" },
  ],
  "paragraph-lg-bold": ["1rem", { lineHeight: "1.25rem", fontWeight: "700" }],
  "paragraph-lg-medium": ["1rem", { lineHeight: "1.25rem", fontWeight: "500" }],
  "paragraph-lg-regular": [
    "1rem",
    { lineHeight: "1.25rem", fontWeight: "400" },
  ],
  "paragraph-md-bold": ["0.875rem", { lineHeight: "1rem", fontWeight: "700" }],
  "paragraph-md-medium": [
    "0.875rem",
    { lineHeight: "1rem", fontWeight: "500" },
  ],
  "paragraph-md-regular": [
    "0.875rem",
    { lineHeight: "1rem", fontWeight: "400" },
  ],
  "paragraph-sm-bold": [
    "0.75rem",
    { lineHeight: "0.875rem", fontWeight: "700" },
  ],
  "paragraph-sm-medium": [
    "0.75rem",
    { lineHeight: "0.875rem", fontWeight: "500" },
  ],
  "paragraph-sm-regular": [
    "0.75rem",
    { lineHeight: "0.875rem", fontWeight: "400" },
  ],
  "paragraph-xs-bold": [
    "0.625rem",
    {
      lineHeight: "0.75rem",
      fontWeight: "700",
    },
  ],
  "paragraph-xs-medium": [
    "0.625rem",
    {
      lineHeight: "0.75rem",
      fontWeight: "500",
    },
  ],
  "paragraph-xs-regular": [
    "0.625rem",
    {
      lineHeight: "0.75rem",
      fontWeight: "400",
    },
  ],

  // Label styles
  "label-xl": ["3.5rem", { lineHeight: "4.5rem", fontWeight: "400" }],
  "label-lg": ["2.5rem", { lineHeight: "3.5rem", fontWeight: "400" }],
  "label-md": ["2rem", { lineHeight: "2.75rem", fontWeight: "400" }],

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
  '8': '.5rem',
  '10': '.625rem',
  '20': '1.25rem',
  '24': '1.5rem',
};

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      gray: {
        '0': 'var(--gray-0)',
        '50': 'var(--gray-50)',
        '100': 'var(--gray-100)',
        '200': 'var(--gray-200)',
        '300': 'var(--gray-300)',
        '400': 'var(--gray-400)',
        '500': 'var(--gray-500)',
        '600': 'var(--gray-600)',
        '700': 'var(--gray-700)',
        '800': 'var(--gray-800)',
        '900': 'var(--gray-900)',
        '950': 'var(--gray-950)',
        'alpha-24': 'var(--gray-alpha-24)',
        'alpha-16': 'var(--gray-alpha-16)',
        'alpha-10': 'var(--gray-alpha-10)',
      },
      neutral: {
        '0': 'var(--neutral-0)',
        '50': 'var(--neutral-50)',
        '100': 'var(--neutral-100)',
        '200': 'var(--neutral-200)',
        '300': 'var(--neutral-300)',
        '400': 'var(--neutral-400)',
        '500': 'var(--neutral-500)',
        '600': 'var(--neutral-600)',
        '700': 'var(--neutral-700)',
        '800': 'var(--neutral-800)',
        '900': 'var(--neutral-900)',
        '950': 'var(--neutral-950)',
        'alpha-24': 'var(--neutral-alpha-24)',
        'alpha-16': 'var(--neutral-alpha-16)',
        'alpha-10': 'var(--neutral-alpha-10)',
      },
      white: {
        DEFAULT: '#fff',
      },
      black: {
        DEFAULT: '#000',
      },
      red: {
        '50': 'var(--red-50)',
        '100': 'var(--red-100)',
        '200': 'var(--red-200)',
        '300': 'var(--red-300)',
        '400': 'var(--red-400)',
        '500': 'var(--red-500)',
        '600': 'var(--red-600)',
        '700': 'var(--red-700)',
        '800': 'var(--red-800)',
        '900': 'var(--red-900)',
        '950': 'var(--red-950)',
        'alpha-24': 'var(--red-alpha-24)',
        'alpha-16': 'var(--red-alpha-16)',
        'alpha-10': 'var(--red-alpha-10)',
      },
      error: {
        dark: 'var(--error-dark)',
        base: 'var(--error-base)',
        light: 'var(--error-light)',
        lighter: 'var(--error-lighter)',
      },
      bg: {
        'strong-950': 'var(--bg-strong-950)',
        'surface-800': 'var(--bg-surface-800)',
        'sub-300': 'var(--bg-sub-300)',
        'soft-200': 'var(--bg-soft-200)',
        'weak-50': 'var(--bg-weak-50)',
        'white-0': 'var(--bg-white-0)',
      },
      text: {
        'strong-950': 'var(--text-strong-950)',
        'sub-600': 'var(--text-sub-600)',
        'soft-400': 'var(--text-soft-400)',
        'disabled-300': 'var(--text-disabled-300)',
        'white-0': 'var(--text-white-0)',
      },
      stroke: {
        'strong-950': 'var(--stroke-strong-950)',
        'sub-300': 'var(--stroke-sub-300)',
        'soft-200': 'var(--stroke-soft-200)',
        'white-0': 'var(--stroke-white-0)',
      },
      adaptive: {
        DEFAULT: 'var(--adaptive-text)',
        'text': 'var(--adaptive-text)',
        'text-inverted': 'var(--adaptive-text-inverted)',
        'bg': 'var(--adaptive-bg)',
        'bg-inverted': 'var(--adaptive-bg-inverted)',
        'stroke': 'var(--adaptive-stroke)',
        'stroke-inverted': 'var(--adaptive-stroke-inverted)',
      },
      selection: {
        'bg': 'var(--selection-bg)',
        'text': 'var(--selection-text)',
      },
      marker: {
        DEFAULT: 'var(--marker)',
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
        permanent: ["var(--font-permanent)"],
      },
      fontSize: texts,
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
