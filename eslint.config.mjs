import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // 🚫 Allow both quote styles
      quotes: "off",

      // 🚫 Allow use of 'any'
      "@typescript-eslint/no-explicit-any": "off",

      // 🚫 Allow raw " and ' in JSX (avoid escaping if you want)
      "react/no-unescaped-entities": "off",

      // 🚫 Allow using regular <img> instead of next/image
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
