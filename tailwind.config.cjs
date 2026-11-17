// Paleta A "Institucional": azul sobrio + rojo carmín como secundario (logo azul/rojo).
// Fondos usan los tokens "fill" (primary, accent); textos de color usan los "ink"
// (link, accent-ink), que en oscuro suben de luminosidad para leerse sobre negro.
const themes = {
  light: {
    surface: "246 247 249",
    surfaceStrong: "235 238 243",
    card: "255 255 255",
    cardAlpha: "1",
    border: "218 224 236",
    content: "13 20 33",
    muted: "88 102 130",
    pill: "238 241 246",
    pillAlpha: "1",
    pillBorder: "218 224 236",
    primary: "29 78 158",
    primaryDeep: "20 47 99",
    link: "29 78 158",
    secondary: "15 26 46",
    secondaryLift: "26 50 99",
    accent: "180 35 52",
    accentInk: "180 35 52",
    whatsapp: "23 140 74",
    contrast: "255 255 255"
  },
  dark: {
    surface: "9 12 18",
    surfaceStrong: "15 21 32",
    card: "17 24 38",
    cardAlpha: "0.92",
    border: "37 48 70",
    content: "226 232 240",
    muted: "150 163 184",
    pill: "17 24 38",
    pillAlpha: "0.75",
    pillBorder: "37 48 70",
    primary: "42 95 184",
    primaryDeep: "21 44 92",
    link: "125 162 240",
    secondary: "18 28 51",
    secondaryLift: "29 53 102",
    accent: "196 50 67",
    accentInk: "238 122 134",
    whatsapp: "26 154 82",
    contrast: "255 255 255"
  }
};

const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sora Variable"', '"Sora"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Sora Variable"', '"Sora"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sora: ['"Sora Variable"', '"Sora"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        surface: withOpacity("--color-surface"),
        "surface-strong": withOpacity("--color-surface-strong"),
        card: withOpacity("--color-card"),
        border: withOpacity("--color-border"),
        content: withOpacity("--color-content"),
        muted: withOpacity("--color-muted"),
        pill: withOpacity("--color-pill"),
        "pill-border": withOpacity("--color-pill-border"),
        primary: withOpacity("--color-primary"),
        "primary-deep": withOpacity("--color-primary-deep"),
        link: withOpacity("--color-link"),
        secondary: withOpacity("--color-secondary"),
        "secondary-lift": withOpacity("--color-secondary-lift"),
        accent: withOpacity("--color-accent"),
        "accent-ink": withOpacity("--color-accent-ink"),
        whatsapp: withOpacity("--color-whatsapp"),
        contrast: withOpacity("--color-contrast")
      },
      boxShadow: {
        soft: "0 24px 60px rgb(13 20 33 / 0.08)",
        featured: "0 1px 2px rgb(13 20 33 / 0.06), 0 12px 28px -10px rgb(13 20 33 / 0.18)"
      }
    }
  },
  plugins: [
    function ({ addBase }) {
      const cssVars = (palette) => ({
        "--color-surface": palette.surface,
        "--color-surface-strong": palette.surfaceStrong,
        "--color-card": palette.card,
        "--alpha-card": palette.cardAlpha ?? "1",
        "--color-border": palette.border,
        "--color-content": palette.content,
        "--color-muted": palette.muted,
        "--color-pill": palette.pill,
        "--alpha-pill": palette.pillAlpha ?? "1",
        "--color-pill-border": palette.pillBorder,
        "--color-primary": palette.primary,
        "--color-primary-deep": palette.primaryDeep,
        "--color-link": palette.link,
        "--color-secondary": palette.secondary,
        "--color-secondary-lift": palette.secondaryLift,
        "--color-accent": palette.accent,
        "--color-accent-ink": palette.accentInk,
        "--color-whatsapp": palette.whatsapp,
        "--color-contrast": palette.contrast
      });

      addBase({
        ":root": cssVars(themes.light),
        ".dark": cssVars(themes.dark)
      });
    }
  ]
};
