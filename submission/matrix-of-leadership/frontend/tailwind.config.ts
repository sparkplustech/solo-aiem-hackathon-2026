import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.65' }],
        sm: ['1rem', { lineHeight: '1.65' }],
        base: ['1.333rem', { lineHeight: '1.65' }],
        lg: ['1.777rem', { lineHeight: '1.65', letterSpacing: '-0.02em' }],
        xl: ['2.369rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '2xl': ['3.157rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        '3xl': ['4.209rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        '4xl': ['5.611rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
      },
      colors: {
        ui: {
          bg: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
          border: "var(--border-color)",
          text: "var(--text-main)",
          muted: "var(--accent-light)",
          accent: "var(--accent-copper)",
          riskRed: "var(--risk-red)",
          riskAmber: "var(--risk-amber)",
          riskGreen: "var(--risk-green)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "counter-up": "counterUp 1s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(184, 115, 51, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(184, 115, 51, 0.5)" },
        },
        counterUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(184, 115, 51, 0.3)" },
          "50%": { borderColor: "rgba(184, 115, 51, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, rgba(184, 115, 51, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(107, 90, 77, 0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(231, 212, 194, 0.05) 0px, transparent 50%)",
      },
      backdropBlur: {
        xs: "2px",
        md: "12px",
        lg: "24px",
      },
    },
  },
  plugins: [],
};
export default config;
