/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#050507",
          900: "#09090b",
          850: "#121215",
          800: "#18181b",
          700: "#27272a",
        },
        silver: {
          400: "#94a3b8",
          300: "#cbd5e1",
          200: "#e2e8f0",
          100: "#f1f5f9",
          liquid: "#e2e8f0",
        },
        accent: {
          red: "#ef4444",
          "red-glow": "#f87171",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.37)",
        "red-glow": "0 0 20px rgba(239, 68, 68, 0.25)",
      },
    },
  },
  plugins: [],
};
