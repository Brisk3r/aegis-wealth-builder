/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-display)", "Cal Sans", "sans-serif"],
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(circle at center, var(--tw-gradient-stops))",
        "radial-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-fade": "linear-gradient(to bottom, transparent, black 80%)",
      },
      gridTemplateColumns: {
        "auto-fit-cards": "repeat(auto-fit, minmax(320px, 1fr))",
        "hero-layout": "minmax(300px, 1.5fr) minmax(200px, 1fr)",
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};
