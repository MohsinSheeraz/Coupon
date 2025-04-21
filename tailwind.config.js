/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1️⃣  Make sure every file that contains class names is listed here
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // app router + components
    "./src/app/**/*.{js,ts,jsx,tsx}", // extra safety
    "./src/pages/**/*.{js,ts,jsx,tsx}", // if you ever add the pages dir
  ],

  theme: {
    extend: {
      // 2️⃣  Flat colour keys → kebab‑case class names (`text-primary`)
      colors: {
        primary: "#14b8a6", // text-primary, bg-primary, border-primary
        "primary-dark": "#0d9488",
        accent: "#f59e0b",
        muted: "#64748b",
      },
    },
  },

  // 3️⃣  If you build any classes dynamically, list them here
  safelist: [
    "text-primary",
    "text-primary-dark",
    "bg-primary",
    "bg-primary-dark",
    "border-primary",
    "border-primary-dark",
  ],

  plugins: [],
};
