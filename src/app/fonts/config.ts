import localFont from "next/font/local";

export const founders = localFont({
  src: [
    {
      path: "FoundersGroteskXCond_Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "FoundersGroteskXCond_SmBd.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-founders",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
});

export const nyghtserif = localFont({
  src: [
    {
      path: "NyghtSerif_Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "NyghtSerif_RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-nyghtserif",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
});

export const styrene = localFont({
  src: [
    {
      path: "Styrene_A_LC_Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-styrene",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
});

export const euclid = localFont({
  src: [
    {
      path: "EuclidCircularA_Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "EuclidCircularA_Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "EuclidCircularA_Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "EuclidCircularA_Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-euclid",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
});


export const permanent = localFont({
  src: [
    {
      path: "PermanentMarker_Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-permanent",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
});

// Font utilities
export const fontVariables = [
  founders.variable,
  nyghtserif.variable,
  styrene.variable,
  permanent.variable,
  euclid.variable,
].join(" ");

// Font class names for Tailwind
export const fontClasses = {
  founders: "font-founders",
  nyghtserif: "font-nyghtserif",
  styrene: "font-styrene",
  permanent: "font-permanent",
  euclid: "font-euclid",
} as const;

// Font weights
export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// Font styles
export const fontStyles = {
  normal: "normal",
  italic: "italic",
} as const; 